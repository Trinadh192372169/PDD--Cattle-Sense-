import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from generate_all_reports import build_excel_reports

if __name__ == "__main__":
    print("Generating Appium Mobile Excel, HTML & Summary Reports...")
    build_excel_reports()
    print("Mobile Reports Generated Successfully!")
