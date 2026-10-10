"""The live exhibit must use its real destination, independently of archive identity."""
from html.parser import HTMLParser
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class Gallery(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.shelves = []
        self.cards = []
        self.active_card = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "section" and "shelf" in classes:
            self.shelves.append(attrs["id"])
        if tag == "a" and "card" in classes:
            self.active_card = {**attrs, "frames": []}
            self.cards.append(self.active_card)
        if tag == "iframe" and self.active_card is not None:
            self.active_card["frames"].append(attrs["src"])

    def handle_endtag(self, tag):
        if tag == "a":
            self.active_card = None


class LiveDestinationTest(unittest.TestCase):
    def test_default_gallery_starts_with_the_actual_live_exhibit(self):
        gallery = Gallery((ROOT / "countdowns/index.html").read_text())
        self.assertEqual(gallery.shelves[0], "severance")
        live = gallery.cards[0]
        self.assertIn("card-live", live["class"].split())
        self.assertEqual(live["href"], "https://severancecountdown.com/")
        self.assertEqual(live["frames"], [live["href"]])
        self.assertEqual(live["target"], "_blank")
        self.assertEqual(live["data-show"], "severance")
        self.assertEqual(live["data-archive-href"], "/countdowns/severance/tracker/")
        self.assertEqual(gallery.cards[1]["href"], "/countdowns/severance/s2/")
        self.assertEqual(sum("card-live" in c["class"].split() for c in gallery.cards), 1)

    def test_closed_live_exhibit_has_a_real_local_still(self):
        gallery = Gallery((ROOT / "countdowns/index.html").read_text())
        thumbnail = ROOT / gallery.cards[0]["data-thumb"].lstrip("/")
        self.assertTrue(thumbnail.is_file())
        # The preserved reconstruction stays available separately for references.
        self.assertTrue((ROOT / "countdowns/severance/tracker/index.html").is_file())


if __name__ == "__main__":
    unittest.main()
