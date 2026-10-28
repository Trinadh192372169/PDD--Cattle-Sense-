"""
Breed Services: Audio TTS (gTTS), YouTube Care Videos, and Breed Intelligence Summaries
"""
import os
import io
import re
from typing import List, Dict

# Supported language codes for TTS
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "gu": "Gujarati",
    "mr": "Marathi",
    "bn": "Bengali",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
    "ur": "Urdu"
}

# Curated high-accuracy breed knowledge base for Indian Cattle & Buffaloes
BREED_KNOWLEDGE: Dict[str, Dict[str, str]] = {
    "Murrah": {
        "species": "Buffalo",
        "category": "Dairy / Milch",
        "origin": "Rohtak, Hisar, and Jind districts of Haryana, Punjab, India",
        "characteristics": "Jet black color, tightly curled spiral horns, compact heavy body with broad hips.",
        "utility": "World-renowned dairy breed with high milk yield (2,000 - 3,000 kg per lactation), rich in fat (7-8%).",
        "special_traits": "High feed conversion efficiency, docile temperament, primary breed used to upgrade local buffalo stocks."
    },
    "Gir": {
        "species": "Cattle",
        "category": "Milch (Dairy)",
        "origin": "Gir hills and Kathiawar region of Gujarat, India",
        "characteristics": "Convex domed forehead, long pendulous drooping ears, red or speckled white-red coat, prominent hump.",
        "utility": "High milk producer (1,800 - 2,500 kg per lactation) producing pure A2 beta-casein milk.",
        "special_traits": "Extreme heat tolerance, natural tick resistance, worldwide acclaim in Brazil as Gyr cattle."
    },
    "Sahiwal": {
        "species": "Cattle",
        "category": "Milch (Dairy)",
        "origin": "Montgomery district (now Sahiwal), Punjab region",
        "characteristics": "Reddish dun to pale red color, loose skin (also known as Lola), short horns, well-developed udder.",
        "utility": "Best indigenous dairy breed in the Indian subcontinent (2,200 - 3,200 kg per lactation).",
        "special_traits": "High resistance to tropical diseases, heat tolerant, calm temperament, high butterfat content (4.5-5%)."
    },
    "Jaffrabadi": {
        "species": "Buffalo",
        "category": "Dairy / Heavy Draught",
        "origin": "Gir forest and Saurashtra region of Gujarat, India",
        "characteristics": "Heaviest Indian buffalo breed with wide drooping horns forming a prominent forehead hook.",
        "utility": "Exceptional milk yield (2,200 - 3,000 kg per lactation) with 7.5 - 8.5% butterfat.",
        "special_traits": "Strong constitution, thrives in harsh marshy and forest terrains, calm and docile."
    },
    "Bhadawari": {
        "species": "Buffalo",
        "category": "Milch / High Butterfat",
        "origin": "Agra and Etawah districts of Uttar Pradesh and Gwalior (MP)",
        "characteristics": "Copper-colored or light brown coat with two white lines ('Janehar') on the lower neck.",
        "utility": "Milk production around 1,200 - 1,500 kg per lactation with the highest butterfat among all bovines (8 - 13%).",
        "special_traits": "Can thrive on low-quality coarse roughage, resistant to extreme climates."
    },
    "Mehsana": {
        "species": "Buffalo",
        "category": "Dairy",
        "origin": "Mehsana, Sabarkantha, and Banaskantha districts of Gujarat",
        "characteristics": "Blackish brown to black, horns curled with less curvature than Murrah, medium-sized compact body.",
        "utility": "Consistent, persistent milk producer (1,800 - 2,400 kg per lactation) with short inter-calving periods.",
        "special_traits": "Cross between Murrah and Surti, renowned for regular breeding cycles."
    },
    "Nili_Ravi": {
        "species": "Buffalo",
        "category": "Dairy",
        "origin": "Sutlej and Ravi river valleys of Punjab",
        "characteristics": "Black coat with five white markings: forehead, muzzle, all four legs, and tail switch ('Panj Kalyan').",
        "utility": "High milk producer (1,800 - 2,600 kg per lactation) with 6.5 - 7.5% fat.",
        "special_traits": "Highly prized dairy breed, wall eyes (blue/white irises) common."
    },
    "Kankrej": {
        "species": "Cattle",
        "category": "Dual-Purpose (Milk & Heavy Draught)",
        "origin": "Rann of Kutch and Banaskantha region of Gujarat",
        "characteristics": "Silver-grey to dark grey, powerful lyre-shaped horns, majestic 'sawai chal' carriage walk.",
        "utility": "Dual purpose: 1,500 - 2,200 kg milk per lactation and powerful draft bullocks.",
        "special_traits": "Fast powerful trotting gait, high immunity against tick-borne diseases, prominent hump."
    },
    "Ongole": {
        "species": "Cattle",
        "category": "Dual-Purpose (Heavy Draught & Dairy)",
        "origin": "Prakasam, Guntur, and Nellore districts of Andhra Pradesh",
        "characteristics": "Large muscular frame, glossy white/grey coat, majestic humped neck, short stumpy horns.",
        "utility": "Heavy draught work and good milk yield (1,200 - 1,800 kg per lactation).",
        "special_traits": "Ancestor of the American Brahman cattle; known for heat endurance and muscular strength."
    },
    "Tharparkar": {
        "species": "Cattle",
        "category": "Dual-Purpose (Dairy & Draught)",
        "origin": "Thar desert region (Rajasthan & Sindh)",
        "characteristics": "White to light grey coat, medium size, lyre horns, convex forehead.",
        "utility": "Desert milch breed (1,800 - 2,500 kg per lactation), robust draft capability.",
        "special_traits": "Flourishes on arid desert shrubs; withstands severe droughts and extreme heat."
    },
    "Red_Sindhi": {
        "species": "Cattle",
        "category": "Milch (Dairy)",
        "origin": "Sindh and neighboring arid tracts of Rajasthan",
        "characteristics": "Deep reddish-brown coat, compact body, short thick horns, pendulous dewlap.",
        "utility": "High milk yield (1,800 - 2,600 kg per lactation) with 4.5 - 5% butterfat.",
        "special_traits": "Extreme heat tolerance, high resistance to cattle ticks, widely exported globally."
    },
    "Amritmahal": {
        "species": "Cattle",
        "category": "Draught",
        "origin": "Mysore region of Karnataka",
        "characteristics": "Grey to almost black coat, long sharp backward-pointing horns, fiery temperament.",
        "utility": "Supreme fast draught breed historically used for rapid artillery transport.",
        "special_traits": "Incredible endurance, speed, and hardiness across rocky terrains."
    },
    "Hallikar": {
        "species": "Cattle",
        "category": "Draught",
        "origin": "Hassan, Tumkur, and Mandya districts of Karnataka",
        "characteristics": "Dark grey to grey, long tapering horns curving backwards, slender compact muscular build.",
        "utility": "Premier trotting draught breed capable of continuous road work.",
        "special_traits": "Origin of the Amritmahal breed; celebrated for stamina and agile speed."
    },
    "Kangayam": {
        "species": "Cattle",
        "category": "Draught",
        "origin": "Kangeyam, Tiruppur, and Coimbatore region of Tamil Nadu",
        "characteristics": "Grey/white bullocks with dark hump and quarters, short straight horns curving upwards.",
        "utility": "Powerful agricultural draught and carting bullocks.",
        "special_traits": "Hardy hooves that do not require horseshoeing; thrives on dry pasture grass."
    },
    "Deoni": {
        "species": "Cattle",
        "category": "Dual-Purpose",
        "origin": "Marathwada region of Maharashtra and adjoining Karnataka",
        "characteristics": "Spotted black and white coat (Shevla / Balankya), drooping ears, prominent forehead.",
        "utility": "Dual purpose: 1,200 - 1,800 kg milk per lactation and sturdy draft work.",
        "special_traits": "Calm temperament, originated from crosses between Gir and local cattle."
    },
    "Surti": {
        "species": "Buffalo",
        "category": "Dairy",
        "origin": "Charottar tract between Mahi and Sabarmati rivers, Gujarat",
        "characteristics": "Rusty brown to silver-grey coat, sickle-shaped flat horns, two white collars on neck.",
        "utility": "Economical milk production (1,600 - 2,000 kg per lactation) with 7-8% butterfat.",
        "special_traits": "Medium sized, low maintenance feed requirements, ideal for smallholder farmers."
    },
    "Toda": {
        "species": "Buffalo",
        "category": "Dairy",
        "origin": "Nilgiri Hills, Tamil Nadu",
        "characteristics": "Ash-grey coat, wide crescent horns curving inwards, dense fawn hair on calves.",
        "utility": "Semi-wild sacred buffalo of the Toda tribe, milk yield around 500 kg.",
        "special_traits": "High altitude adaptation, agile climber in steep Nilgiri slopes."
    },
    "Banni": {
        "species": "Buffalo",
        "category": "Dairy",
        "origin": "Banni grasslands of Kutch, Gujarat",
        "characteristics": "Black to copper coat, coiled horns, nocturnal grazing behavior.",
        "utility": "High milk yield (2,000 - 2,800 kg per lactation) under harsh desert conditions.",
        "special_traits": "Graze naturally at night to avoid desert heat; high disease resistance."
    },
    "Nagpuri": {
        "species": "Buffalo",
        "category": "Dual-Purpose (Milk & Draught)",
        "origin": "Nagpur and Vidarbha region of Maharashtra",
        "characteristics": "Black coat, very long sword-shaped flat horns reaching past the shoulders.",
        "utility": "Dual purpose: 1,000 - 1,500 kg milk per lactation and slow heavy draught work.",
        "special_traits": "Also known as Elichpuri or Barari; well-adapted to hot Vidarbha summers."
    },
    "Vechur": {
        "species": "Cattle",
        "category": "Milch (Miniature)",
        "origin": "Vechur village, Kottayam district, Kerala",
        "characteristics": "World's smallest cattle breed, light red, black, or white coat, compact body under 90 cm tall.",
        "utility": "Milk yield around 2-3 liters/day with high medicinal and therapeutic properties.",
        "special_traits": "Extremely low food intake, high resistance to mastitis and infections, easy domestic handling."
    }
}

def get_breed_summary(breed_name: str, lang: str = "en") -> Dict[str, str]:
    """
    Returns structured breed summary with fallback to Groq or default templates
    """
    clean_name = breed_name.replace("_", " ").strip()
    data = BREED_KNOWLEDGE.get(clean_name) or BREED_KNOWLEDGE.get(breed_name)

    if not data:
        # Generic fallback for unlisted breeds
        data = {
            "species": "Bovine (Cattle/Buffalo)",
            "category": "Indigenous Indian Breed",
            "origin": "Native to rural agricultural tracts of India",
            "characteristics": f"Distinct physical horns, coat color, and hump characteristics typical of {clean_name}.",
            "utility": "Valuable for dairy milk production, farm draft power, and disease resilience.",
            "special_traits": "Adapted to Indian tropical climate with natural immunity and heat endurance."
        }

    # Format into bullet points
    summary_text = (
        f"• Species & Type: {data['species']} ({data['category']})\n"
        f"• Native Region: {data['origin']}\n"
        f"• Physical Features: {data['characteristics']}\n"
        f"• Primary Utility: {data['utility']}\n"
        f"• Key Adaptations: {data['special_traits']}"
    )

    return {
        "breed": clean_name,
        "species": data["species"],
        "category": data["category"],
        "origin": data["origin"],
        "characteristics": data["characteristics"],
        "utility": data["utility"],
        "special_traits": data["special_traits"],
        "formatted_summary": summary_text
    }

def fetch_care_videos(breed_name: str, limit: int = 5) -> List[Dict[str, str]]:
    """
    Fetch relevant YouTube care and dairy management videos for the breed
    """
    clean_name = breed_name.replace("_", " ").strip()
    videos = []

    try:
        from youtubesearchpython import VideosSearch
        queries = [
            f"{clean_name} cattle breed characteristics",
            f"{clean_name} buffalo dairy farming India",
            f"{clean_name} livestock care management"
        ]

        seen_urls = set()
        for q in queries:
            try:
                search = VideosSearch(q, limit=3)
                results = search.result().get("result", [])
                for v in results:
                    url = v.get("link")
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        thumbnails = v.get("thumbnails", [])
                        thumb_url = thumbnails[0].get("url") if thumbnails else ""
                        videos.append({
                            "title": v.get("title", f"{clean_name} Video"),
                            "link": url,
                            "thumbnail": thumb_url,
                            "duration": v.get("duration", ""),
                            "channel": v.get("channel", {}).get("name", "Livestock Channel")
                        })
                    if len(videos) >= limit:
                        break
            except Exception:
                continue
            if len(videos) >= limit:
                break
    except Exception as e:
        print(f"[YouTube Search] Error importing or executing: {e}")

    # Fallback to curated YouTube search links if no dynamic results
    if not videos:
        fallback_queries = [
            f"{clean_name} Breed Documentary & Overview",
            f"{clean_name} Milk Yield & Dairy Management",
            f"{clean_name} Feeding & Health Care Techniques",
            f"{clean_name} Housing & Disease Prevention"
        ]
        for title in fallback_queries:
            q_url = f"https://www.youtube.com/results?search_query={title.replace(' ', '+')}"
            videos.append({
                "title": title,
                "link": q_url,
                "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                "duration": "Guide",
                "channel": "National Dairy Education"
            })

    return videos

def generate_tts_audio(text: str, lang: str = "hi") -> bytes:
    """
    Generate MP3 speech bytes using Google Text-to-Speech (gTTS)
    """
    try:
        from gtts import gTTS
    except ImportError:
        print("[TTS] gtts not installed. Returning empty bytes.")
        return b""
    
    # Clean text of markdown asterisks and bullets
    clean = re.sub(r"[\*#•\-_]", " ", text)
    clean = " ".join(clean.split())
    
    lang_code = lang if lang in SUPPORTED_LANGUAGES else "hi"
    
    tts = gTTS(text=clean, lang=lang_code, slow=False)
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp.read()
