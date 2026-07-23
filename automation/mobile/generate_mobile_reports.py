import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from generate_all_reports import build_pure_reports

if __name__ == "__main__":
    print("Building Appium Mobile Reports (CSV, HTML, Summary)...")
    build_pure_reports()
    print("Mobile Reports Generated Successfully!")
