import hashlib


def generate_otp_for_mobile(mobile: str) -> str:
    cleaned = ''.join(ch for ch in mobile if ch.isdigit())
    if len(cleaned) < 4:
        cleaned = cleaned.zfill(4)
    last_four = cleaned[-4:]
    return last_four if len(last_four) == 4 else last_four.zfill(4)
