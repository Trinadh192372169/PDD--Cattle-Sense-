from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import sys
import os

# Add ml_pipeline to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml_pipeline', 'src', 'models')))

# Try importing, mock if fails (for dev robustness)
try:
    from breed_classifier import BreedClassifier
except ImportError:
    class BreedClassifier:
        def predict(self, _): return [{"breed": "Mock", "confidence": 1.0}]

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mount static files for images
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>CattleSense API Server</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; text-align: center; }
            .card { background: #1e293b; max-width: 600px; margin: 40px auto; padding: 30px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            h1 { color: #38bdf8; margin-bottom: 8px; }
            p { color: #94a3b8; line-height: 1.6; }
            .badge { display: inline-block; background: #22c55e; color: #000; padding: 6px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
            a.btn { display: inline-block; background: #38bdf8; color: #0f172a; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; margin-top: 15px; }
            a.btn:hover { background: #7dd3fc; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>🐄 CattleSense Server</h1>
            <div class="badge">● Online & Running</div>
            <p>AI-Powered Indigenous Cattle Breed Identification API Service is active.</p>
            <p><strong>Host Address:</strong> http://10.91.172.154:8000</p>
            <a class="btn" href="/docs">Open Interactive API Docs (Swagger UI)</a>
        </div>
    </body>
    </html>
    """

classifier = BreedClassifier()

class Prediction(BaseModel):
    breed: str
    confidence: float

class PredictionResponse(BaseModel):
    predictions: List[Prediction]

# --- Database Setup (SQLite + SQLAlchemy) ---
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends, HTTPException, Form
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./cattle_sense.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    mobile = Column(String, default="")
    full_name = Column(String, default="Cattle Officer")
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, default="")
    location = Column(String, default="")
    role = Column(String, default="Veterinarian")
    profile_picture = Column(String, default="")

class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    user_mobile = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    breed = Column(String, default="Unknown")
    confidence = Column(String, default="0.0")
    image_url = Column(String, default="")

Base.metadata.create_all(bind=engine)

# --- Migration Helper (Safe for Dev) ---
def migrate_db():
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture VARCHAR DEFAULT ''"))
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR DEFAULT ''"))
        except Exception:
            pass

migrate_db()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Auth Models ---
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
    token: str = None
    user: dict = None

@app.post("/auth/register", response_model=AuthResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    email_clean = request.email.strip().lower()
    print(f"Register request for email: {email_clean}")
    
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        return {"success": False, "message": "Email is already registered. Please login instead."}
    
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
    print(f"Login request for email: {email_clean}")
    
    user = db.query(User).filter((User.email == email_clean) | (User.mobile == email_clean)).first()
    
    if not user:
        # Auto-create user for frictionless experience
        print(f"User {email_clean} not found. Creating new user...")
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
        # Validate password if user exists and has a password
        if user.password_hash and user.password_hash != request.password:
            return {"success": False, "message": "Incorrect password. Please try again."}
        elif not user.password_hash:
            # Set password for legacy user
            user.password_hash = request.password
            db.commit()
            
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
    # Backward compatibility stub
    return {"success": True, "message": "Login successful", "token": "mock-jwt-token-123"}

@app.get("/profile/{mobile}")
def get_profile(mobile: str, db: Session = Depends(get_db)):
    user = db.query(User).filter((User.email == mobile) | (User.mobile == mobile)).first()
    if not user:
        print(f"User {mobile} not found in get_profile, auto-creating...")
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
    print(f"Uploading profile pic for {mobile}")
    
    user = db.query(User).filter((User.email == mobile) | (User.mobile == mobile)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    clean_mobile = mobile.replace("@", "_at_").replace(".", "_")
    filename = f"pfp_{clean_mobile}_{timestamp}_{file.filename}"
    file_path = os.path.join(uploads_dir, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # Update DB
        image_url_db = f"/uploads/{filename}"
        user.profile_picture = image_url_db
        db.commit()
        db.refresh(user)
        
        return {"success": True, "profile_picture": image_url_db}
    except Exception as e:
        print(f"Profile upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")

@app.get("/stats/{mobile}")
def get_stats(mobile: str, db: Session = Depends(get_db)):
    # Total Scans
    total_scans = db.query(Scan).filter(Scan.user_mobile == mobile).count()
    
    # This Month Scans
    now = datetime.utcnow()
    this_month_scans = db.query(Scan).filter(
        Scan.user_mobile == mobile,
        func.strftime('%Y-%m', Scan.timestamp) == now.strftime('%Y-%m')
    ).count()
    
    return {
        "total_scans": total_scans,
        "this_month": this_month_scans
    }

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
            "location": "India", # Regional origin
            "image": scan.image_url if scan.image_url else "https://via.placeholder.com/150"
        })
    return results

@app.delete("/scans/{scan_id}")
def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    
    # Optionally remove local file if exists in uploads
    if scan.image_url and scan.image_url.startswith("/uploads/"):
        file_to_remove = scan.image_url.lstrip("/")
        if os.path.exists(file_to_remove):
            try:
                os.remove(file_to_remove)
            except Exception as e:
                print(f"Notice: Could not delete image file {file_to_remove}: {e}")
                
    db.delete(scan)
    db.commit()
    return {"success": True, "message": f"Scan {scan_id} deleted successfully"}

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

@app.get("/breeds")
def get_breeds_list():
    import json
    classes_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml_pipeline', 'models', 'classes.json'))
    if os.path.exists(classes_path):
        with open(classes_path, "r", encoding="utf-8") as f:
            classes = json.load(f)
            return {"count": len(classes), "breeds": list(classes.values())}
    return {"count": 0, "breeds": []}

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_scans = db.query(Scan).count()
    db_path = "cattle_sense.db"
    db_size = os.path.getsize(db_path) if os.path.exists(db_path) else 0
    
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
        "total_users": total_users,
        "total_scans": total_scans,
        "db_size_bytes": db_size,
        "model_loaded": True if classifier else False,
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

@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>CattleSense Backend</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #0a2e1a 0%, #1B4332 60%, #2d6a4f 100%);
                font-family: 'Segoe UI', sans-serif;
                color: #fff;
            }
            .card {
                text-align: center;
                background: rgba(255,255,255,0.07);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 24px;
                padding: 60px 80px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 48px rgba(0,0,0,0.4);
                animation: fadeIn 0.8s ease;
            }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
            .icon { font-size: 72px; margin-bottom: 24px; }
            h1 { font-size: 2.4rem; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 12px; }
            .subtitle { font-size: 1.1rem; color: rgba(255,255,255,0.65); margin-bottom: 32px; }
            .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(52,211,153,0.15);
                border: 1px solid rgba(52,211,153,0.4);
                color: #6ee7b7;
                padding: 10px 24px;
                border-radius: 999px;
                font-size: 0.95rem;
                font-weight: 600;
            }
            .dot {
                width: 10px; height: 10px;
                background: #34d399;
                border-radius: 50%;
                animation: pulse 1.5s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.3); }
            }
            .endpoints {
                margin-top: 36px;
                text-align: left;
                background: rgba(0,0,0,0.2);
                border-radius: 12px;
                padding: 20px 24px;
                font-size: 0.85rem;
                color: rgba(255,255,255,0.6);
            }
            .endpoints h3 { color: rgba(255,255,255,0.85); font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
            .endpoint { margin: 6px 0; }
            .method { font-weight: 700; color: #6ee7b7; margin-right: 8px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon">🐄</div>
            <h1>CattleSense Backend</h1>
            <p class="subtitle">AI-Powered Cattle Breed Classification API</p>
            <div class="status-badge">
                <div class="dot"></div>
                All Systems Operational
            </div>
            <div class="endpoints">
                <h3>Available Endpoints</h3>
                <div class="endpoint"><span class="method">POST</span>/auth/login &nbsp;— Send OTP</div>
                <div class="endpoint"><span class="method">POST</span>/auth/verify &nbsp;— Verify OTP</div>
                <div class="endpoint"><span class="method">POST</span>/predict &nbsp;— Classify Breed</div>
                <div class="endpoint"><span class="method">GET</span>/scans/{mobile} &nbsp;— Scan History</div>
                <div class="endpoint"><span class="method">GET</span>/profile/{mobile} &nbsp;— User Profile</div>
                <div class="endpoint"><span class="method">GET</span>/health &nbsp;— Health Check</div>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_breed(
    file: UploadFile = File(...), 
    mobile: str = Form("1234567890"), # Default for legacy/dev
    db: Session = Depends(get_db)
):
    print(f"Received prediction request for file: {file.filename} from user: {mobile}")
    
    # Use permanent uploads directory
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{mobile}_{timestamp}_{file.filename}"
    file_path = os.path.join(uploads_dir, filename)
    
    # Image URL (assuming localhost access from emulator/device needs loopback or IP)
    # We will store relative path or construct full URL. Storing relative is safer.
    # Frontend will prepend backend URL.
    image_url_db = f"/uploads/{filename}"

    try:
        print(f"Saving file to: {file_path}")
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        print("File saved successfully.")
            
        # Run prediction
        print("Calling classifier.predict()...")
        results = classifier.predict(file_path)
        print(f"Prediction results: {results}")
        
        # Record Scan in DB
        try:
            top_breed = results[0]['breed'] if results else "Unknown"
            top_conf = str(results[0]['confidence']) if results else "0.0"
            
            new_scan = Scan(
                user_mobile=mobile,
                breed=top_breed,
                confidence=top_conf,
                image_url=image_url_db
            )
            db.add(new_scan)
            db.commit()
            print(f"Scan recorded for {mobile} with image {image_url_db}")
        except Exception as e:
            print(f"Failed to log scan to DB: {e}")
            
        return {"predictions": results}
        
    except Exception as e:
        print(f"Error processing file in main.py: {e}")
        import traceback
        traceback.print_exc()
        return {"predictions": []}
        
    # No finally block to delete file, we keep it now!

if __name__ == "__main__":
    import uvicorn
    # Listen on all network interfaces so LAN devices can connect
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
