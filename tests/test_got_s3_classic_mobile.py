#!/usr/bin/env python3
"""Regression checks for the GoT Season 3 classic mobile layout."""
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "countdowns" / "got" / "s3-classic"


class GotS3ClassicMobileTest(unittest.TestCase):
    def test_mobile_viewport_uses_single_column_safe_layout(self):
        html = (PAGE / "index.html").read_text()
        css = (PAGE / "css" / "main.css").read_text()

        self.assertIn(
            '<meta name="viewport" content="width=device-width, initial-scale=1">',
            html,
        )
        self.assertIn('href="css/main.css?v=mobile-fit"', html)
        self.assertIn("@media (max-width: 520px)", css)
        self.assertIn("overflow-x: hidden", css)
        self.assertIn("background-size: contain", css)
        self.assertIn("white-space: nowrap", css)
        self.assertIn("@media (max-width: 360px)", css)
        self.assertIn("width: 168px", css)


if __name__ == "__main__":
    unittest.main()
