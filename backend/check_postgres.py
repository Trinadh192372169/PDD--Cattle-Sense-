"""
Quick Database Inspector for CattleSense PostgreSQL
Run this script to inspect tables, row counts, and records stored in PostgreSQL.
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

PG_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Trinath@localhost:5432/cattlesense")

def check_db():
    print("=" * 60)
    print(f"Connecting to PostgreSQL Database: {PG_URL.split('@')[-1]}")
    print("=" * 60)

    try:
        conn = psycopg2.connect(PG_URL)
        cur = conn.cursor()

        # 1. List all tables in public schema
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cur.fetchall()]
        print(f"\n[+] Found {len(tables)} table(s): {', '.join(tables)}")

        # 2. Inspect 'users' table
        print("\n" + "-" * 40)
        print("TABLE: users")
        print("-" * 40)
        cur.execute("SELECT COUNT(*) FROM users;")
        user_count = cur.fetchone()[0]
        print(f"Total Users Registered: {user_count}")

        cur.execute("SELECT id, mobile, full_name, email, role FROM users LIMIT 5;")
        users = cur.fetchall()
        for u in users:
            print(f"  ID: {u[0]} | Mobile: {u[1]} | Name: {u[2]} | Email: {u[3]} | Role: {u[4]}")

        # 3. Inspect 'scans' table
        print("\n" + "-" * 40)
        print("TABLE: scans")
        print("-" * 40)
        cur.execute("SELECT COUNT(*) FROM scans;")
        scan_count = cur.fetchone()[0]
        print(f"Total Scans Recorded: {scan_count}")

        cur.execute("SELECT id, user_mobile, breed, confidence, timestamp FROM scans ORDER BY timestamp DESC LIMIT 5;")
        scans = cur.fetchall()
        for s in scans:
            print(f"  ID: {s[0]} | Mobile: {s[1]} | Breed: {s[2]} | Conf: {s[3]} | Time: {s[4]}")

        print("\n" + "=" * 60)
        print("[+] PostgreSQL is healthy and operational!")
        print("=" * 60)

        cur.close()
        conn.close()

    except Exception as e:
        print(f"[!] Error connecting to PostgreSQL: {e}")

if __name__ == "__main__":
    check_db()
