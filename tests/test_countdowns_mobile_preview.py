#!/usr/bin/env python3
"""Regression checks for the generated countdown archive preview behavior."""
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class CountdownsMobilePreviewTest(unittest.TestCase):
    def test_mobile_cards_open_full_countdown_without_preview_overlay(self):
        pages = [
            ROOT / "countdowns" / "index.html",
            *sorted((ROOT / "countdowns").glob("*/index.html")),
        ]
        pages_with_overlay = [
            page for page in pages if 'id="ov-frame"' in page.read_text()
        ]

        self.assertGreater(len(pages_with_overlay), 1)
        for page in pages_with_overlay:
            with self.subTest(page=page.relative_to(ROOT)):
                html = page.read_text()
                self.assertIn("function shouldOpenFullCountdown()", html)
                self.assertIn("matchMedia('(max-width: 640px)')", html)
                self.assertIn(
                    "if(shouldOpenFullCountdown()){ e.preventDefault(); window.location.href=c.href; return; }",
                    html,
                )
                self.assertIn("e.preventDefault(); openFrom(c);", html)


if __name__ == "__main__":
    unittest.main()
