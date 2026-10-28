"""
CattleSense Migration Tool: SQLite to PostgreSQL
Migrates users and scans from local SQLite (cattle_sense.db) into PostgreSQL.
"""
import os
import sqlite3
import psycopg2
from dotenv import load_dotenv

load_dotenv()

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "cattle_sense.db")
PG_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/cattlesense")

def migrate():
    if not os.path.exists(SQLITE_PATH):
        print(f"[-] SQLite database not found at {SQLITE_PATH}")
        return

    print(f"[*] Connecting to SQLite: {SQLITE_PATH}")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_cursor = sqlite_conn.cursor()

    print(f"[*] Connecting to PostgreSQL: {PG_URL.split('@')[-1]}")
    try:
        pg_conn = psycopg2.connect(PG_URL)
        pg_cursor = pg_conn.cursor()
    except Exception as e:
        err_str = str(e).lower()
        if "database" in err_str and "does not exist" in err_str:
            print("[*] Target database 'cattlesense' does not exist yet. Attempting auto-creation...")
            try:
                # Parse default postgres DB URL
                from urllib.parse import urlparse, urlunparse
                parsed = urlparse(PG_URL)
                default_url = urlunparse((parsed.scheme, parsed.netloc, '/postgres', '', '', ''))
                temp_conn = psycopg2.connect(default_url)
                temp_conn.autocommit = True
                temp_cur = temp_conn.cursor()
                temp_cur.execute('CREATE DATABASE cattlesense;')
                temp_cur.close()
                temp_conn.close()
                print("[+] Successfully created database 'cattlesense'.")
                # Now connect to cattlesense
                pg_conn = psycopg2.connect(PG_URL)
                pg_cursor = pg_conn.cursor()
            except Exception as create_err:
                print(f"[!] Could not auto-create database 'cattlesense': {create_err}")
                return
        else:
            print(f"[!] Could not connect to PostgreSQL: {e}")
            print("Please check your DATABASE_URL in .env and ensure PostgreSQL service is running.")
            return

    # 1. Create tables if not exist
    schema_file = os.path.join(os.path.dirname(__file__), "schema_postgres.sql")
    if os.path.exists(schema_file):
        with open(schema_file, "r") as f:
            sql_schema = f.read()
        pg_cursor.execute(sql_schema)
        pg_conn.commit()
        print("[+] PostgreSQL schema verified / created successfully.")

    # 2. Migrate Users
    sqlite_cursor.execute("SELECT id, mobile, full_name, email, password_hash, location, role, profile_picture FROM users")
    users = sqlite_cursor.fetchall()
    migrated_users = 0

    for u in users:
        uid, mobile, full_name, email, pwd_hash, location, role, pfp = u
        if not email:
            continue
        try:
            pg_cursor.execute("""
                INSERT INTO users (mobile, full_name, email, password_hash, location, role, profile_picture)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (email) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    location = EXCLUDED.location,
                    role = EXCLUDED.role,
                    profile_picture = EXCLUDED.profile_picture;
            """, (mobile or '', full_name or 'Cattle Officer', email, pwd_hash or '', location or '', role or 'Veterinarian', pfp or ''))
            migrated_users += 1
        except Exception as err:
            print(f"[!] Warning on user {email}: {err}")

    pg_conn.commit()
    print(f"[+] Migrated {migrated_users} users to PostgreSQL.")

    # 3. Migrate Scans
    sqlite_cursor.execute("SELECT user_mobile, timestamp, breed, confidence, image_url FROM scans")
    scans = sqlite_cursor.fetchall()
    migrated_scans = 0

    for s in scans:
        user_mob, ts, breed, conf, img_url = s
        try:
            pg_cursor.execute("""
                INSERT INTO scans (user_mobile, timestamp, breed, confidence, image_url)
                VALUES (%s, %s, %s, %s, %s);
            """, (user_mob or '1234567890', ts, breed or 'Unknown', str(conf or '0.0'), img_url or ''))
            migrated_scans += 1
        except Exception as err:
            print(f"[!] Warning on scan record: {err}")

    pg_conn.commit()
    print(f"[+] Migrated {migrated_scans} scan records to PostgreSQL.")

    sqlite_conn.close()
    pg_conn.close()
    print("[+] Migration completed successfully!")

if __name__ == "__main__":
    migrate()
