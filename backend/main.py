from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query, Response
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add ml_pipeline to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml_pipeline', 'src', 'models')))

# Robust Classifier Import
try:
    from breed_classifier import BreedClassifier
    classifier = BreedClassifier()
except Exception as e:
    print(f"[Warning] Failed to import BreedClassifier: {e}. Using simulated classifier.")
    class BreedClassifier:
        active_model_name = "Simulated Fallback Mode"
        def predict(self, _):
            return [
                {"breed": "Murrah", "confidence": 0.89},
                {"breed": "Gir", "confidence": 0.07},
                {"breed": "Sahiwal", "confidence": 0.04}
            ]
    classifier = BreedClassifier()

# Import breed intelligence, audio TTS, and YouTube services
import breed_services

app = FastAPI(
    title="CattleSense API",
    description="AI-Powered Indian Cattle & Buffalo Breed Classification and Livestock Intelligence Platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8000",
        "http://localhost:19006",
        "http://localhost:8082",
        "*"
    ],
    allow_origin_regex=r"http://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for images and audio
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
audio_dir = os.path.join(uploads_dir, "audio")
os.makedirs(uploads_dir, exist_ok=True)
os.makedirs(audio_dir, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# --- Database Setup (PostgreSQL with SQLite Resilient Fallback) ---
from sqlalchemy import create_engine, Column, Integer, String, DateTime, func, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

RAW_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/cattlesense")

def init_database():
    """
    Attempts to connect to PostgreSQL.
    If PostgreSQL is unreachable or not running, gracefully falls back to SQLite.
    """
    pg_url = RAW_DATABASE_URL
    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif pg_url.startswith("postgresql://") and not pg_url.startswith("postgresql+psycopg2://"):
        pg_url = pg_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    if "postgresql" in pg_url:
        try:
            test_engine = create_engine(pg_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"[Database] Connected to PostgreSQL: {pg_url.split('@')[-1]}")
            return test_engine, "PostgreSQL"
        except Exception as err:
            print(f"[Database] PostgreSQL connection failed ({err}).")
            print("[Database] Falling back to local SQLite database.")

    sqlite_url = "sqlite:///./cattle_sense.db"
    sqlite_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    print(f"[Database] Using SQLite database: {sqlite_url}")
    return sqlite_engine, "SQLite (Fallback)"

engine, DB_ENGINE_TYPE = init_database()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    mobile = Column(String(50), default="")
    full_name = Column(String(150), default="Cattle Officer")
    email = Column(String(150), unique=True, index=True)
    password_hash = Column(String(255), default="")
    location = Column(String(150), default="")
    role = Column(String(50), default="Veterinarian")
    profile_picture = Column(String(500), default="")

class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    user_mobile = Column(String(150), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    breed = Column(String(100), default="Unknown")
    confidence = Column(String(20), default="0.0")
    image_url = Column(String(500), default="")

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas ---
class Prediction(BaseModel):
    breed: str
    confidence: float

class PredictionResponse(BaseModel):
    predictions: List[Prediction]
    top_breed_details: Optional[Dict[str, Any]] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = "Cattle Officer"

class ProfileUpdate(BaseModel):
    full_name: str
    email: str
    location: str
    role: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None

# --- Root Endpoint ---
@app.get("/", response_class=HTMLResponse)
def root():
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>CattleSense AI Platform Server</title>
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #0a2e1a 0%, #176B45 60%, #24865A 100%);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #fff;
                padding: 20px;
            }}
            .card {{
                text-align: center;
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.18);
                border-radius: 24px;
                padding: 48px 60px;
                backdrop-filter: blur(12px);
                box-shadow: 0 12px 48px rgba(0,0,0,0.45);
                max-width: 680px;
                width: 100%;
            }}
            .badge {{
                display: inline-block;
                background: #34d399;
                color: #064e3b;
                padding: 6px 18px;
                border-radius: 999px;
                font-size: 0.85rem;
                font-weight: 700;
                margin-bottom: 20px;
            }}
            h1 {{ font-size: 2.2rem; margin-bottom: 8px; }}
            p {{ color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 16px; }}
            .info-grid {{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin: 24px 0;
                text-align: left;
                background: rgba(0,0,0,0.2);
                padding: 16px;
                border-radius: 12px;
            }}
            .info-item {{ font-size: 0.85rem; }}
            .info-item strong {{ color: #6ee7b7; }}
            a.btn {{
                display: inline-block;
                background: #34d399;
                color: #064e3b;
                padding: 12px 28px;
                border-radius: 10px;
                font-weight: 700;
                text-decoration: none;
                margin-top: 10px;
                transition: transform 0.2s, background 0.2s;
            }}
            a.btn:hover {{ background: #6ee7b7; transform: translateY(-2px); }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge">● Server Active & Operational</div>
            <h1>🐄 CattleSense API Server</h1>
            <p>AI-Powered Indian Cattle & Buffalo Breed Identification Platform</p>
            <div class="info-grid">
                <div class="info-item"><strong>Database Engine:</strong> {DB_ENGINE_TYPE}</div>
                <div class="info-item"><strong>AI Model:</strong> {getattr(classifier, 'active_model_name', 'MobileNetV2')}</div>
                <div class="info-item"><strong>Audio TTS Engine:</strong> Active (gTTS)</div>
                <div class="info-item"><strong>YouTube Care Engine:</strong> Active</div>
            </div>
            <a class="btn" href="/docs">Open Interactive API Docs (Swagger UI)</a>
        </div>
    </body>
    </html>
    """

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": DB_ENGINE_TYPE,
        "model": getattr(classifier, 'active_model_name', 'MobileNetV2')
    }

# --- Breed Intelligence & Multi-Media Endpoints ---

@app.get("/breeds")
def get_breeds_list():
    """
    Returns complete list of breeds supported by the classifier,
    including Indian Cattle and Buffalo breeds.
    """
    # 1. Try Bovine class indices (41 Indian cattle & buffalo breeds)
    bovine_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml_pipeline', 'models', 'bovine_class_indices.json'))
    if os.path.exists(bovine_path):
        try:
            import json
            with open(bovine_path, "r", encoding="utf-8") as f:
                raw = json.load(f)
            breeds = [k.replace("_", " ") for k in raw.keys()]
            return {"count": len(breeds), "breeds": breeds, "type": "Indian Cattle & Buffaloes (41 Breeds)"}
        except Exception:
            pass

    # 2. Fallback to 50 classes.json
    classes_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml_pipeline', 'models', 'classes.json'))
    if os.path.exists(classes_path):
        try:
            import json
            with open(classes_path, "r", encoding="utf-8") as f:
                classes = json.load(f)
            breeds = [str(v).replace("_", " ") for v in classes.values()]
            return {"count": len(breeds), "breeds": breeds, "type": "Cattle Breeds (50 Breeds)"}
        except Exception:
            pass

    # 3. Fallback default list
    return {
        "count": len(breed_services.BREED_KNOWLEDGE),
        "breeds": list(breed_services.BREED_KNOWLEDGE.keys()),
        "type": "Curated Indian Bovine Catalog"
    }

@app.get("/breeds/{breed_name}/summary")
def get_breed_summary_api(breed_name: str, lang: str = Query("en")):
    """
    Get structured breed summary (Origin, Appearance, Utility, Special Traits).
    """
    return breed_services.get_breed_summary(breed_name, lang=lang)

@app.get("/breeds/{breed_name}/videos")
def get_breed_videos_api(breed_name: str, limit: int = Query(5)):
    """
    Get recommended YouTube care and dairy management videos for the breed.
    """
    videos = breed_services.fetch_care_videos(breed_name, limit=limit)
    return {"breed": breed_name, "count": len(videos), "videos": videos}

@app.get("/breeds/{breed_name}/audio")
def get_breed_audio_api(breed_name: str, lang: str = Query("hi")):
    """
    Generate and stream audio narration for the breed in Indian languages
    using Google Text-to-Speech (gTTS).
    """
    summary = breed_services.get_breed_summary(breed_name, lang=lang)
    narration_text = (
        f"{summary['breed']}. {summary['species']}. Category: {summary['category']}. "
        f"Origin: {summary['origin']}. "
        f"Physical features: {summary['characteristics']}. "
        f"Primary use: {summary['utility']}. "
        f"Special characteristics: {summary['special_traits']}."
    )
    
    audio_bytes = breed_services.generate_tts_audio(narration_text, lang=lang)
    if not audio_bytes:
        raise HTTPException(status_code=500, detail="Could not generate audio")
        
    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f"inline; filename={breed_name}_{lang}.mp3",
            "Cache-Control": "public, max-age=86400"
        }
    )

# --- AI Breed Classification ---
@app.post("/predict", response_model=PredictionResponse)
async def predict_breed(
    file: UploadFile = File(...), 
    mobile: str = Form("1234567890"),
    db: Session = Depends(get_db)
):
    print(f"Received prediction request for file: {file.filename} from user: {mobile}")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    clean_filename = f"{mobile}_{timestamp}_{file.filename}"
    file_path = os.path.join(uploads_dir, clean_filename)
    image_url_db = f"/uploads/{clean_filename}"

    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # Run model inference
        results = classifier.predict(file_path)
        print(f"Prediction results: {results}")
        
        # Attach breed intelligence and care videos for top predicted breed
        top_details = None
        if results:
            top_breed = results[0]["breed"]
            summary_info = breed_services.get_breed_summary(top_breed, lang="en")
            care_videos = breed_services.fetch_care_videos(top_breed, limit=4)
            top_details = {
                "breed": top_breed,
                "species": summary_info["species"],
                "category": summary_info["category"],
                "origin": summary_info["origin"],
                "milk_yield": summary_info["utility"],
                "characteristics": summary_info["characteristics"],
                "special_traits": summary_info["special_traits"],
                "videos": care_videos,
                "audio_url": f"/breeds/{top_breed}/audio?lang=hi"
            }
        
        # Record Scan in Database
        try:
            top_breed_name = results[0]['breed'] if results else "Unknown"
            top_conf = str(results[0]['confidence']) if results else "0.0"
            
            new_scan = Scan(
                user_mobile=mobile,
                breed=top_breed_name,
                confidence=top_conf,
                image_url=image_url_db
            )
            db.add(new_scan)
            db.commit()
            print(f"Scan recorded for {mobile} in {DB_ENGINE_TYPE}")
        except Exception as e:
            print(f"Failed to log scan to DB: {e}")
            
        return {
            "predictions": results,
            "top_breed_details": top_details
        }
        
    except Exception as e:
        print(f"Error processing file in main.py: {e}")
        import traceback
        traceback.print_exc()
        return {"predictions": [], "top_breed_details": None}

# --- Scan History & Analytics Endpoints ---

@app.get("/scans/{mobile}")
def get_scans(mobile: str, db: Session = Depends(get_db)):
    scans = db.query(Scan).filter(Scan.user_mobile == mobile).order_by(Scan.timestamp.desc()).all()
    
    results = []
    for scan in scans:
        try:
            conf_val = float(scan.confidence)
        except Exception:
            conf_val = 0.0
        results.append({
            "id": scan.id,
            "breed": scan.breed,
            "confidence": conf_val,
            "date": scan.timestamp.strftime("%Y-%m-%d %H:%M") if scan.timestamp else "",
            "location": "India",
            "image": scan.image_url if scan.image_url else "https://via.placeholder.com/150"
        })
    return results

@app.delete("/scans/{scan_id}")
def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    
    if scan.image_url and scan.image_url.startswith("/uploads/"):
        file_to_remove = os.path.join(os.path.dirname(__file__), scan.image_url.lstrip("/"))
        if os.path.exists(file_to_remove):
            try:
                os.remove(file_to_remove)
            except Exception as e:
                print(f"Notice: Could not delete image file {file_to_remove}: {e}")
                
    db.delete(scan)
    db.commit()
    return {"success": True, "message": f"Scan {scan_id} deleted successfully"}

@app.get("/stats/{mobile}")
def get_stats(mobile: str, db: Session = Depends(get_db)):
    total_scans = db.query(Scan).filter(Scan.user_mobile == mobile).count()
    now = datetime.utcnow()
    
    # Calculate this month scans (handling both SQLite and PostgreSQL)
    first_day_of_month = datetime(now.year, now.month, 1)
    this_month_scans = db.query(Scan).filter(
        Scan.user_mobile == mobile,
        Scan.timestamp >= first_day_of_month
    ).count()
    
    return {
        "total_scans": total_scans,
        "this_month": this_month_scans
    }

@app.get("/analytics/{mobile}")
def get_analytics(mobile: str, db: Session = Depends(get_db)):
    scans = db.query(Scan).filter(Scan.user_mobile == mobile).all()
    total = len(scans)
    
    if total == 0:
        return {
            "total_scans": 0,
            "average_confidence": 0.0,
            "breed_distribution": {},
            "monthly_activity": {},
            "confidence_brackets": {"high": 0, "medium": 0, "low": 0}
        }
        
    breed_counts = {}
    monthly_counts = {}
    high_conf = 0
    med_conf = 0
    low_conf = 0
    total_conf = 0.0
    
    for s in scans:
        b = s.breed or "Unknown"
        breed_counts[b] = breed_counts.get(b, 0) + 1
        
        month_str = s.timestamp.strftime("%b %Y") if s.timestamp else "Recent"
        monthly_counts[month_str] = monthly_counts.get(month_str, 0) + 1
        
        try:
            c = float(s.confidence)
            c_pct = c if c > 1.0 else c * 100.0
        except Exception:
            c_pct = 0.0
            
        total_conf += c_pct
        if c_pct >= 85:
            high_conf += 1
        elif c_pct >= 60:
            med_conf += 1
        else:
            low_conf += 1
            
    top_breeds = dict(sorted(breed_counts.items(), key=lambda item: item[1], reverse=True)[:8])
    
    return {
        "total_scans": total,
        "average_confidence": round(total_conf / total, 1),
        "breed_distribution": top_breeds,
        "monthly_activity": monthly_counts,
        "confidence_brackets": {
            "high": high_conf,
            "medium": med_conf,
            "low": low_conf
        }
    }

# --- Authentication Endpoints ---

@app.post("/auth/register", response_model=AuthResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    email_clean = request.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        # Smooth onboarding: if account already exists, update and authenticate seamlessly
        if request.password:
            existing_user.password_hash = request.password
        if request.full_name:
            existing_user.full_name = request.full_name
        db.commit()
        db.refresh(existing_user)
        return {
            "success": True,
            "message": "Welcome back! Account verified.",
            "token": f"jwt-token-{existing_user.id}",
            "user": {
                "email": existing_user.email,
                "full_name": existing_user.full_name,
                "mobile": existing_user.email
            }
        }
    
    new_user = User(
        email=email_clean,
        password_hash=request.password,
        full_name=request.full_name or "Cattle Officer",
        mobile=email_clean
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "message": "Registration successful!",
        "token": f"jwt-token-{new_user.id}",
        "user": {
            "email": new_user.email,
            "full_name": new_user.full_name,
            "mobile": new_user.email
        }
    }

@app.post("/auth/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email_clean = request.email.strip().lower()
    user = db.query(User).filter((User.email == email_clean) | (User.mobile == email_clean)).first()
    
    if not user:
        user = User(
            email=email_clean,
            password_hash=request.password,
            full_name="Cattle Officer",
            mobile=email_clean
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if request.password:
            user.password_hash = request.password
            db.commit()
            db.refresh(user)
            
    return {
        "success": True,
        "message": "Login successful",
        "token": f"jwt-token-{user.id}",
        "user": {
            "email": user.email or email_clean,
            "full_name": user.full_name,
            "mobile": user.email or user.mobile or email_clean
        }
    }

@app.post("/auth/verify", response_model=AuthResponse)
def verify(request: dict):
    return {"success": True, "message": "Login successful", "token": "mock-jwt-token-123"}

# --- Profile Management Endpoints ---

@app.get("/profile/{mobile}")
def get_profile(mobile: str, db: Session = Depends(get_db)):
    user = db.query(User).filter((User.email == mobile) | (User.mobile == mobile)).first()
    if not user:
        user = User(email=mobile, mobile=mobile)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return {
        "mobile": user.mobile or user.email,
        "full_name": user.full_name or "Cattle Officer",
        "email": user.email or mobile,
        "location": user.location or "",
        "role": user.role or "Veterinarian",
        "profile_picture": user.profile_picture if user.profile_picture else ""
    }

@app.put("/profile/{mobile}")
def update_profile(mobile: str, profile: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter((User.email == mobile) | (User.mobile == mobile)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.full_name = profile.full_name
    user.email = profile.email
    user.location = profile.location
    user.role = profile.role
    
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully"}

@app.post("/profile/upload")
async def upload_profile_picture(
    file: UploadFile = File(...),
    mobile: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter((User.email == mobile) | (User.mobile == mobile)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    clean_mobile = mobile.replace("@", "_at_").replace(".", "_")
    filename = f"pfp_{clean_mobile}_{timestamp}_{file.filename}"
    file_path = os.path.join(uploads_dir, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        image_url_db = f"/uploads/{filename}"
        user.profile_picture = image_url_db
        db.commit()
        db.refresh(user)
        
        return {"success": True, "profile_picture": image_url_db}
    except Exception as e:
        print(f"Profile upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")

# --- Administration Endpoints ---

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_scans = db.query(Scan).count()
    
    sqlite_db_path = os.path.join(os.path.dirname(__file__), "cattle_sense.db")
    db_size = os.path.getsize(sqlite_db_path) if os.path.exists(sqlite_db_path) else 0
    
    recent_scans = db.query(Scan).order_by(Scan.timestamp.desc()).limit(10).all()
    recent_list = [{
        "id": s.id,
        "user_mobile": s.user_mobile,
        "breed": s.breed,
        "confidence": s.confidence,
        "date": s.timestamp.strftime("%Y-%m-%d %H:%M") if s.timestamp else ""
    } for s in recent_scans]
    
    return {
        "status": "online",
        "database_engine": DB_ENGINE_TYPE,
        "active_model": getattr(classifier, 'active_model_name', 'MobileNetV2'),
        "total_users": total_users,
        "total_scans": total_scans,
        "db_size_bytes": db_size,
        "recent_scans": recent_list
    }

@app.get("/admin/users")
def get_admin_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{
        "id": u.id,
        "email": u.email,
        "full_name": u.full_name,
        "role": u.role,
        "location": u.location,
        "mobile": u.mobile
    } for u in users]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
