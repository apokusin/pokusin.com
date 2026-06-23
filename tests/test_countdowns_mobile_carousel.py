#!/usr/bin/env python3
"""Regression checks for the mobile countdown card carousel."""
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class CountdownsMobileCarouselTest(unittest.TestCase):
    def test_mobile_gallery_uses_carousel_controls_instead_of_wrapping_grid(self):
        html = (ROOT / "countdowns" / "index.html").read_text()
        css = (ROOT / "countdowns" / "countdowns.css").read_text()

        self.assertIn('class="shelf" id="got" data-carousel', html)
        self.assertIn('class="carousel"', html)
        self.assertIn('class="carousel-btn carousel-prev"', html)
        self.assertIn('class="carousel-btn carousel-next"', html)
        self.assertIn("CAROUSEL_JS", (ROOT / "countdowns" / "generate.py").read_text())
        self.assertIn(".carousel-controls", css)
        self.assertIn("@media (max-width:760px)", css)
        self.assertIn(".carousel .grid{display:flex", css)
        self.assertIn("scroll-snap-type:x mandatory", css)
        self.assertIn(".carousel .card{flex:0 0 min(340px,calc(100vw - 54px))", css)
        self.assertNotIn("@media (max-width:560px){\n  .grid{grid-template-columns:1fr}", css)
        self.assertIn("track.scrollTo({left:track.scrollLeft+(dir*step()),behavior:reduce?'auto':'smooth'});", html)
        self.assertIn("prev.addEventListener('click',function(){move(-1);});", html)
        self.assertIn("next.addEventListener('click',function(){move(1);});", html)
        self.assertIn("root.classList.toggle('is-static',max<=1);", html)

    def test_mobile_gallery_show_header_puts_metadata_and_controls_above_cards(self):
        html = (ROOT / "countdowns" / "index.html").read_text()
        css = (ROOT / "countdowns" / "countdowns.css").read_text()
        start = html.index('<section class="shelf" id="got"')
        end = html.index('<section class="shelf" id="dexter"', start)
        shelf = html[start:end]

        self.assertIn('<div class="shelf-kicker">2012 – 2019</div>', shelf)
        self.assertIn('<span class="shelf-name">Game of Thrones</span>', shelf)
        self.assertIn('<span class="shelf-origin">gameofthronescountdown.com</span>', shelf)
        self.assertIn('<a class="more shelf-more" href="/countdowns/got/">', shelf)
        self.assertLess(shelf.index('class="shelf-kicker"'), shelf.index('class="shelf-id"'))
        self.assertLess(shelf.index('class="shelf-origin"'), shelf.index('class="carousel-controls"'))
        self.assertLess(shelf.index('class="carousel-controls"'), shelf.index('class="carousel"'))
        self.assertGreater(shelf.index('class="more shelf-more"'), shelf.index('class="grid"'))
        self.assertNotIn('class="shelf-years"', html)
        self.assertNotIn('class="shelf-domain"', html)

        self.assertIn(".shelf-aside{display:flex;align-items:center;justify-content:space-between", css)
        self.assertIn(".shelf-kicker{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase", css)
        self.assertIn(".shelf-origin{display:inline-block;margin-top:6px;font-size:.72rem", css)
        self.assertIn(".more.shelf-more{margin-top:12px}", css)
        self.assertIn(".shelf-aside .carousel-controls{margin:0;flex:0 0 auto", css)

    def test_mobile_gallery_uses_section_gutters_instead_of_global_side_padding(self):
        css = (ROOT / "countdowns" / "countdowns.css").read_text()

        self.assertIn("--mobile-gutter:18px", css)
        self.assertIn(".wrap{padding-left:0;padding-right:0}", css)
        self.assertIn(
            ".crumb,.eyebrow,h1.title,.lede,.foot{padding-left:var(--mobile-gutter);padding-right:var(--mobile-gutter)}",
            css,
        )
        self.assertIn(
            ".shownav{padding-left:var(--mobile-gutter);padding-right:var(--mobile-gutter);scroll-padding-inline:var(--mobile-gutter)}",
            css,
        )
        self.assertIn(".shelf{grid-template-columns:1fr;gap:16px;padding-left:0;padding-right:0}", css)
        self.assertIn(".shelf-aside{padding-left:var(--mobile-gutter);padding-right:var(--mobile-gutter)}", css)
        self.assertIn(".more.shelf-more{margin-left:var(--mobile-gutter);margin-right:var(--mobile-gutter)}", css)
        self.assertIn(
            ".carousel .grid{display:flex;grid-template-columns:none;gap:16px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:2px var(--mobile-gutter) 12px;scroll-padding-inline:var(--mobile-gutter)}",
            css,
        )
        self.assertIn(".carousel .card{flex:0 0 min(340px,calc(100vw - 54px))", css)


if __name__ == "__main__":
    unittest.main()
