import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from auth_utils import generate_otp_for_mobile


class AuthOtpTests(unittest.TestCase):
    def test_otp_is_based_on_phone_number(self):
        self.assertEqual(generate_otp_for_mobile("9876543210"), "3210")

    def test_otp_is_four_digits(self):
        otp = generate_otp_for_mobile("123")
        self.assertRegex(otp, r"^\d{4}$")


if __name__ == "__main__":
    unittest.main()
