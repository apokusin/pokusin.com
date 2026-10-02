#!/usr/bin/env python3
"""Generate the /countdowns archive: gallery, per-show details (with collapsible
archived variants), and the Dexter Season 7 timeline scrubber."""
import os, html, json, hashlib, glob
from datetime import datetime

CD = os.path.dirname(os.path.abspath(__file__))  # this script lives in countdowns/
REPO = os.path.dirname(CD)

# ---------------------------------------------------------------- display data
# collapsed=False  -> shown on the main gallery + details grid
# collapsed=True   -> only in the details page's collapsible "Archived variants"
# chip             -> only Severance shows an indicator ("Live")
SHOWS = [
    {
        "slug": "got", "name": "Game of Thrones", "emoji": "\U0001F409",
        "domain": "gameofthronescountdown.com", "live": False, "years": "2012 – 2019",
        "versions": [
            {"slug": "s4", "label": "Season 4", "year": "2014", "collapsed": False,
             "desc": "The full-bleed house switcher. Pick a house and the page floods with its colors and sigil."},
            {"slug": "s3-redesign", "label": "Season 3 · Redesign", "year": "2013", "collapsed": False, "zoom": 5,
             "desc": "House theming, a central sigil, and the Game of Thrones theme on play."},
            {"slug": "s3-classic", "label": "Season 3 · Classic", "year": "2013", "collapsed": False,
             "desc": "The original dark-leather look, sword logo and an HBO date block."},
            {"slug": "s8-final", "label": "Final Season", "year": "2019", "collapsed": True,
             "desc": "A “refreshed for the final season, stay tuned!” splash, the last thing the site ever said."},
            {"slug": "coming-soon", "label": "Coming Soon", "year": "2012", "collapsed": True,
             "desc": "Where it all began: “the countdown is coming soon™.”"},
            {"slug": "s3-prototype", "label": "Season 3 · Early Prototype", "year": "2012", "collapsed": True,
             "desc": "The earliest working Season 3 countdown, a bare prototype, before the leather redesign."},
            {"slug": "s3-static", "label": "Season 3 · Static Embed", "year": "2013", "collapsed": True,
             "desc": "The classic Season 3 look with a static Facebook embed instead of the SDK."},
            {"slug": "s3-wallpaper", "label": "Season 3 · Wallpaper", "year": "2013", "collapsed": True,
             "desc": "A wallpaper-framed take on the Season 3 countdown."},
        ],
    },
    {
        "slug": "dexter", "name": "Dexter", "emoji": "\U0001FA78",
        "domain": "dextercountdown.com", "live": False, "years": "2012 – 2013",
        "versions": [
            {"slug": "s8-final", "label": "Series Finale", "year": "2013", "collapsed": False,
             "desc": "The minimalist redesign, white cards, blood-red badges, labels turned on their side."},
            {"slug": "s7-finale", "label": "Season 7 · Finale", "year": "2012", "collapsed": False,
             "desc": "Egg-shell texture, blood-spatter sprites, and the Dexter theme on a floating player."},
            {"slug": "s7-episodes/", "label": "Season 7 · Episode by Episode", "year": "2012", "collapsed": False,
             "timeline": True, "desc": "Re-skinned for each new episode through the autumn of 2012, scrub the timeline to watch it change."},
            {"slug": "coming-soon", "label": "Coming Soon", "year": "2012", "collapsed": True,
             "desc": "A hand-drawn blood splatter and a promise."},
        ],
    },
    {
        "slug": "sherlock", "name": "Sherlock", "emoji": "\U0001F3BB",
        "domain": "sherlockcountdown.com", "live": False, "years": "2013 – 2014",
        "versions": [
            {"slug": "final", "label": "Season 3", "year": "2014", "collapsed": False,
             "desc": "A UK / US air-date toggle, and a hidden 221B easter egg. (Try the door.)"},
            {"slug": "alpha", "label": "Season 3 · Alpha", "year": "2013", "collapsed": False,
             "desc": "An early dev build, unminified, with an extra slide, over the looping bg GIF."},
            {"slug": "dec2013", "label": "Season 3 · December 2013", "year": "2013", "collapsed": True,
             "desc": "The first public deploy, before the easter egg arrived."},
        ],
    },
    {
        "slug": "archer", "name": "Archer", "emoji": "\U0001F943",
        "domain": "archercountdown.com", "live": False, "years": "2012 – 2014",
        "preview_zoom": 5,
        "versions": [
            {"slug": "s5-final", "label": "Season 5", "year": "2014", "collapsed": False,
             "desc": "The signature 2×2 colored grid, an animated Pam, and the Archer theme."},
            {"slug": "s4", "label": "Season 4", "year": "2013", "collapsed": True,
             "desc": "The true Season 4 page (“Midnight Ron”)."},
            {"slug": "s5-draft", "label": "Season 5 · Draft", "year": "2013", "collapsed": True,
             "desc": "A pre-launch draft, year typo and all, preserved as found."},
            {"slug": "s5-finished", "label": "Season 5 · Finished", "year": "2014", "collapsed": True,
             "desc": "“Thanks for visiting!” The after-the-premiere state."},
            {"slug": "coming-soon", "label": "Coming Soon", "year": "2012", "collapsed": True,
             "desc": "The earliest splash, before any clock."},
            {"slug": "s5-episode", "label": "Season 5 · Episode", "year": "2014", "collapsed": True,
             "desc": "A generic mid-season episode countdown, “Counting down to Archer Season 5!”"},
            {"slug": "s5-draft-finished", "label": "Season 5 · Draft (Finished)", "year": "2013", "collapsed": True,
             "desc": "The pre-launch draft in its “Thanks for visiting!” end state."},
        ],
    },
    {
        "slug": "breaking-bad", "name": "Breaking Bad", "emoji": "⚗️",
        "domain": "breakingbadcountdown.com", "live": False, "years": "2012 – 2013",
        "versions": [
            {"slug": "final", "label": "Series Finale", "year": "2013", "collapsed": False,
             "desc": "Gold and texture, #allbadthingsmustcometoanend, and the theme on play."},
            {"slug": "desert-parallax", "label": "Desert Parallax", "year": "2013", "collapsed": False,
             "desc": "A mouse-driven parallax dev build, drifting over the desert."},
            {"slug": "teaser-blue", "label": "Under Development", "year": "2013", "collapsed": True,
             "desc": "A blue holding page, just a status line."},
            {"slug": "teaser-green", "label": "In Development", "year": "2013", "collapsed": True,
             "desc": "A green holding page with the AMC mark."},
        ],
    },
    {
        "slug": "house-of-cards", "name": "House of Cards", "emoji": "\U0001F0CF",
        "domain": "houseofcardscountdown.com", "live": False, "years": "2014",
        "versions": [
            {"slug": "s2", "label": "Season 2", "year": "2014", "collapsed": False,
             "desc": "Counting down to the Season 2 Netflix drop, the whole series at once, February 14, 2014."},
        ],
    },
    {
        "slug": "severance", "name": "Severance", "emoji": "\U0001F9E0",
        "domain": "severancecountdown.com", "live": True, "years": "2025 –",
        "versions": [
            {"slug": "s2", "label": "Season 2", "year": "2025", "collapsed": False,
             "desc": "The Macrodata Refinement Tracker caught mid-season, episode bars half-filled, with a live countdown to the next drop."},
            {"slug": "tracker", "label": "Season 3", "year": "2025", "collapsed": False, "chip": "Live",
             "desc": "The Lumon terminal counting down to Season 3, a refinement grid, season tracker, and a live clock. Still running at severancecountdown.com."},
        ],
    },
]

# Dexter Season 7 timeline (numbers corrected & ordered sequentially)
EPISODES = [
    {"slug": "ep1-premiere", "num": 1, "title": "Are You…?", "date": "Sep 30, 2012"},
    {"slug": "ep2-sunshine-and-frosty-swirl", "num": 2, "title": "Sunshine and Frosty Swirl", "date": "Oct 7, 2012"},
    {"slug": "ep3-buck-the-system", "num": 3, "title": "Buck the System", "date": "Oct 14, 2012"},
    {"slug": "ep4-run", "num": 4, "title": "Run", "date": "Oct 21, 2012"},
    {"slug": "ep5-swim-deep", "num": 5, "title": "Swim Deep", "date": "Oct 28, 2012"},
    {"slug": "ep6-do-the-wrong-thing", "num": 6, "title": "Do the Wrong Thing", "date": "Nov 4, 2012"},
    {"slug": "ep7-chemistry", "num": 7, "title": "Chemistry", "date": "Nov 11, 2012"},
]

SHOW_COUNT = len(SHOWS)
TOTAL = 8 + 10 + 3 + 7 + 4 + 1 + 2  # GoT8 Dexter(3+7eps) Sherlock3 Archer7 BB4 HoC1 Sev2 = 35
NEXT_COUNTDOWN_DATE = "2026-11-01T00:00:00-07:00"  # One month from October 1, Pacific time.
_next_countdown = datetime.fromisoformat(NEXT_COUNTDOWN_DATE)
NEXT_COUNTDOWN_LABEL = f'{_next_countdown:%b} {_next_countdown.day}, {_next_countdown.year} · Pacific time'

ART_THEMES = [
    ('tomorrows-roadworks', 'Tomorrow’s Roadworks'), ('bubblegum-time', 'Bubblegum Time'),
    ('after-the-flame', 'After the Flame'), ('low-tide-later', 'Low Tide, Later'),
    ('not-yet-ripe', 'Not Yet Ripe'), ('still-drawing-tomorrow', 'Still Drawing Tomorrow'),
    ('held-in-suspense', 'Held in Suspense'), ('the-almost-fair', 'The Almost Fair'),
]
_art_files = sorted(glob.glob(os.path.join(CD, 'concepts', '*.*')) + [os.path.join(CD, 'exhibition.js'), os.path.join(CD, 'exhibition.css')])
ART_VERSION = hashlib.sha256(b''.join(open(p, 'rb').read() for p in _art_files if os.path.isfile(p))).hexdigest()[:10]
THEME_HEAD = """<script>
(function(){var theme=new URLSearchParams(location.search).get('theme');
 var art=['tomorrows-roadworks','bubblegum-time','after-the-flame','low-tide-later','not-yet-ripe','still-drawing-tomorrow','held-in-suspense','the-almost-fair'];
 var isArt=art.indexOf(theme)!==-1;
 document.documentElement.dataset.theme=isArt?theme:theme==='control'?'control':'royal';
 document.documentElement.dataset.artVersion='__ART_VERSION__';
 if(isArt){document.documentElement.classList.add('art-project');var link=document.createElement('link');link.rel='stylesheet';link.href='concepts/'+theme+'.css?v=__ART_VERSION__';document.head.append(link);}
})();
</script>
<link rel="stylesheet" href="exhibition.css?v=__ART_VERSION__">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Barlow+Condensed:wght@400;500&family=Libre+Baskerville:ital,wght@0,400;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Mono:wght@400;500&display=swap">
""".replace('__ART_VERSION__', ART_VERSION)

# ---------------------------------------------------------------------- CSS
CSS = """:root{
  --bg:#e6ebf0; --fg:#102132; --muted:#5b6b7a;
  --card:#ffffff; --line:rgba(16,33,50,.10); --line-strong:rgba(16,33,50,.20);
  --chip:rgba(16,33,50,.06); --live:#1f9d57; --accent:#9a1d2e;
  --shadow:0 1px 2px rgba(16,33,50,.05),0 8px 24px rgba(16,33,50,.07);
  --shadow-hover:0 2px 6px rgba(16,33,50,.08),0 18px 48px rgba(16,33,50,.14);
  --radius:16px; --mobile-gutter:18px;
}
@media (prefers-color-scheme:dark){
  :root{
    --bg:#0a0c10; --fg:rgba(255,255,255,.92); --muted:rgba(255,255,255,.46);
    --card:#13171d; --line:rgba(255,255,255,.08); --line-strong:rgba(255,255,255,.16);
    --chip:rgba(255,255,255,.07); --live:#3fd07f; --accent:#e2566b;
    --shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.5);
    --shadow-hover:0 2px 8px rgba(0,0,0,.5),0 22px 60px rgba(0,0,0,.65);
  }
}
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  background:var(--bg);color:var(--fg);
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  line-height:1.5;letter-spacing:-.011em;
}
a{color:inherit;text-decoration:none}
.wrap{max-width:1060px;margin:0 auto;padding:clamp(26px,6vw,68px) clamp(18px,4vw,34px) 40px}
.crumb{font-size:.82rem;color:var(--muted);margin-bottom:22px}
.crumb a{transition:color .15s ease}
.crumb a:hover{color:var(--fg)}
.crumb .sep{opacity:.45;margin:0 .5em}
h1.title{font-size:clamp(2rem,6.4vw,3.1rem);letter-spacing:-.035em;font-weight:700;line-height:1.02;text-wrap:balance}
.lede{color:var(--muted);font-size:clamp(.95rem,2.4vw,1.08rem);max-width:62ch;margin-top:16px;text-wrap:pretty}
.lede strong{color:var(--fg);font-weight:600}
.next-countdown{margin-top:28px;padding-left:16px;border-left:2px solid var(--line-strong)}
.next-countdown h2{font-size:.85rem;font-weight:600;display:flex;align-items:center;gap:6px}
.countdown-crown{font:inherit;color:var(--muted);background:none;border:0;cursor:pointer;flex:0 0 32px;width:32px;height:32px;border-radius:6px}
.countdown-crown:hover{color:var(--fg);background:var(--chip)}
.countdown-crown:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.next-countdown-timer{font-size:clamp(1.4rem,4.5vw,1.8rem);font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.035em}
.next-countdown-note,.countdown-secret{font-size:.78rem;color:var(--muted);margin-top:5px}
.show{margin-top:clamp(38px,6.4vw,66px)}
.show-head{display:flex;align-items:baseline;gap:11px;flex-wrap:wrap;padding-bottom:16px;border-bottom:1px solid var(--line);margin-bottom:24px}
.show-emoji{font-size:1.4rem;line-height:1}
.show-name{font-size:clamp(1.2rem,3.4vw,1.55rem);font-weight:650;letter-spacing:-.022em;text-wrap:balance}
.show-meta{color:var(--muted);font-size:.8rem;margin-left:auto;text-align:right;font-variant-numeric:tabular-nums}
.show-meta a{transition:color .15s ease}
.show-meta a:hover{color:var(--fg)}
.show-meta .dot{opacity:.5;margin:0 .5em}
.eyebrow{font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;font-variant-numeric:tabular-nums}
.shownav{position:sticky;top:0;z-index:30;display:flex;gap:4px;align-items:center;overflow-x:auto;overflow-y:hidden;margin-top:clamp(22px,4vw,34px);padding:10px 0;background:color-mix(in srgb,var(--bg) 85%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);scrollbar-width:none;-webkit-overflow-scrolling:touch}
.shownav::-webkit-scrollbar{display:none}
.shownav a{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;font-size:.85rem;color:var(--muted);white-space:nowrap;transition:color .15s ease,background .15s ease}
.shownav a:hover,.shownav a[aria-current=true]{color:var(--fg);background:var(--chip)}
.shownav .nv-e{font-size:1rem;line-height:1}
/* archival shelf: a label gutter + a flowing row of previews per show */
.shelf{display:grid;grid-template-columns:200px minmax(0,1fr);gap:clamp(20px,3.5vw,44px);align-items:start;border-top:1px solid var(--line);margin-top:clamp(26px,4vw,46px);padding-top:clamp(26px,4vw,46px);scroll-margin-top:74px}
.shelf-aside{display:flex;align-items:center;justify-content:space-between;gap:14px;max-width:100%}
.shelf-copy{min-width:0;max-width:100%}
.shelf-kicker{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-variant-numeric:tabular-nums;margin-bottom:7px;line-height:1.1}
.shelf-id{display:flex;align-items:center;gap:9px}
.shelf-emoji{font-size:1.25rem;line-height:1;flex:0 0 auto}
.shelf-name{font-size:clamp(1rem,2.2vw,1.18rem);font-weight:650;letter-spacing:-.02em;white-space:nowrap}
.shelf-origin{display:inline-block;margin-top:6px;font-size:.72rem;color:var(--muted);word-break:break-word;transition:color .15s ease;line-height:1.2}
a.shelf-origin:hover{color:var(--fg)}
.more.shelf-more{margin-top:12px}
.shelf .grid{grid-template-columns:repeat(auto-fill,minmax(228px,1fr))}
.carousel{min-width:0}
.carousel-controls{display:none}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(282px,1fr));gap:clamp(16px,2.3vw,26px)}
.card{display:block;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);transition:transform .2s cubic-bezier(.2,.7,.3,1),box-shadow .2s ease,border-color .2s ease}
.card:hover{transform:translateY(-4px);box-shadow:var(--shadow-hover);border-color:var(--line-strong)}
.frame{position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;background:#05070a;border-bottom:1px solid var(--line)}
.frame iframe{position:absolute;top:0;left:0;width:400%;height:400%;border:0;transform:scale(.25);transform-origin:0 0;pointer-events:none;background:#05070a}
.frame .open{position:absolute;right:10px;bottom:10px;font-size:.66rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);padding:5px 10px;border-radius:999px;opacity:0;transform:translateY(4px);transition:opacity .2s ease,transform .2s ease}
.frame .tlbadge{position:absolute;left:10px;top:10px;font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#fff;background:var(--accent);padding:4px 9px;border-radius:999px;display:flex;align-items:center;gap:5px}
.frame .tlbadge::before{content:"";width:0;height:0;border-left:6px solid #fff;border-top:4px solid transparent;border-bottom:4px solid transparent}
.card:hover .open{opacity:1;transform:translateY(0)}
.body{padding:14px 16px 17px}
.label{font-weight:600;font-size:1.01rem;letter-spacing:-.012em;text-wrap:balance}
.row{display:flex;align-items:center;gap:9px;margin-top:7px}
.year{color:var(--muted);font-size:.8rem;font-variant-numeric:tabular-nums}
.chip{font-size:.64rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:var(--chip);color:var(--live)}
.chip::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--live);margin-right:5px;vertical-align:middle;animation:pulse 2.4s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(63,208,127,.5)}70%{box-shadow:0 0 0 6px rgba(63,208,127,0)}100%{box-shadow:0 0 0 0 rgba(63,208,127,0)}}
.desc{color:var(--muted);font-size:.855rem;margin-top:10px;line-height:1.5;text-wrap:pretty}
.more,.deeplink{display:inline-flex;align-items:center;gap:6px;font-size:.85rem;color:var(--muted);background:none;border:0;padding:0;transition:color .15s ease}
.more{margin-top:20px}
.more:hover,.deeplink:hover{color:var(--fg)}
.more .arrow,.deeplink .arrow{transition:transform .18s ease}
.more:hover .arrow,.deeplink:hover .arrow{transform:translateX(3px)}
.deeplink{margin-top:30px;font-size:.92rem}
/* collapsible archived variants */
.archive{margin-top:30px;border-top:1px solid var(--line);padding-top:8px}
.archive>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:9px;padding:12px 2px;font-size:.9rem;color:var(--muted);font-weight:550;transition:color .15s ease}
.archive>summary::-webkit-details-marker{display:none}
.archive>summary:hover{color:var(--fg)}
.archive>summary .tw{display:inline-block;transition:transform .2s ease;font-size:.8em;opacity:.7}
.archive[open]>summary .tw{transform:rotate(90deg)}
.archive>summary .ct{font-size:.78rem;color:var(--muted);background:var(--chip);border-radius:999px;padding:2px 8px;margin-left:2px}
.archive .grid{margin-top:18px}
/* timeline scrubber */
.tl{margin-top:34px}
.tl-stage{position:relative;width:100%;max-width:920px;margin:0 auto;aspect-ratio:16/10;overflow:hidden;border-radius:16px;border:1px solid var(--line-strong);background:#000;box-shadow:var(--shadow)}
.tl-stage iframe{position:absolute;top:0;left:0;width:160%;height:160%;border:0;transform:scale(.625);transform-origin:0 0;pointer-events:none;opacity:0;transition:opacity .28s ease;background:#000}
.tl-cap{max-width:920px;margin:18px auto 0;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.tl-cap .n{font-size:.7rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#fff;background:var(--accent);padding:4px 10px;border-radius:999px}
.tl-cap .t{font-size:1.15rem;font-weight:650;letter-spacing:-.02em}
.tl-cap .d{color:var(--muted);font-size:.85rem;margin-left:auto;font-variant-numeric:tabular-nums}
.tl-bar{max-width:920px;margin:22px auto 0;display:flex;align-items:center;gap:16px}
.tl-play{flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:1px solid var(--line-strong);background:var(--card);color:var(--fg);cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;transition:transform .12s ease,border-color .15s ease}
.tl-play:hover{border-color:var(--accent)}
.tl-play:active{transform:scale(.96)}
.tl-play[data-state=paused]{padding-left:4px}
.tl-track{flex:1 1 auto;position:relative}
.tl-track::before{content:"";position:absolute;left:7px;right:7px;top:50%;height:2px;background:var(--line);transform:translateY(-50%)}
.tl-ticks{list-style:none;display:flex;justify-content:space-between;position:relative}
.tl-tick{appearance:none;border:0;background:transparent;cursor:pointer;padding:8px 2px;min-width:40px;min-height:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;color:var(--muted);transition:color .15s ease,transform .12s ease}
.tl-tick:active{transform:scale(.96)}
.tl-tick .dot{width:14px;height:14px;border-radius:50%;background:var(--card);border:2px solid var(--line-strong);transition:background-color .18s ease,border-color .18s ease,transform .18s ease,box-shadow .18s ease}
.tl-tick .en{font-size:.7rem;font-weight:600;font-variant-numeric:tabular-nums}
.tl-tick:hover{color:var(--fg)}
.tl-tick:hover .dot{border-color:var(--accent)}
.tl-tick[aria-current=true]{color:var(--fg)}
.tl-tick[aria-current=true] .dot{background:var(--accent);border-color:var(--accent);transform:scale(1.2);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 22%,transparent)}
.foot{margin-top:74px;padding-top:24px;border-top:1px solid var(--line);color:var(--muted);font-size:.8rem;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
.foot a{transition:color .15s ease}
.foot a:hover{color:var(--fg)}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@media (prefers-reduced-motion:no-preference){
  html{scroll-behavior:smooth}
  .eyebrow,.title,.lede,.shelf{animation:rise .55s cubic-bezier(.2,.7,.3,1) both}
  .title{animation-delay:.04s}.lede{animation-delay:.09s}
  .shelf:nth-of-type(1){animation-delay:.15s}
  .shelf:nth-of-type(2){animation-delay:.21s}
  .shelf:nth-of-type(3){animation-delay:.27s}
  .shelf:nth-of-type(4){animation-delay:.33s}
  .shelf:nth-of-type(5){animation-delay:.39s}
  .shelf:nth-of-type(6){animation-delay:.45s}
  .shelf:nth-of-type(7){animation-delay:.51s}
}
@media (max-width:760px){
  .wrap{padding-left:0;padding-right:0}
  .next-countdown{margin-left:var(--mobile-gutter);margin-right:var(--mobile-gutter)}
  .crumb,.eyebrow,h1.title,.lede,.foot{padding-left:var(--mobile-gutter);padding-right:var(--mobile-gutter)}
  .shownav{padding-left:var(--mobile-gutter);padding-right:var(--mobile-gutter);scroll-padding-inline:var(--mobile-gutter)}
  .shelf{grid-template-columns:1fr;gap:16px;padding-left:0;padding-right:0}
  .shelf-aside{padding-left:var(--mobile-gutter);padding-right:var(--mobile-gutter)}
  .more.shelf-more{margin-left:var(--mobile-gutter);margin-right:var(--mobile-gutter)}
  .carousel{position:relative;margin-top:2px}
  .carousel-controls{display:flex;justify-content:flex-end;gap:8px}
  .carousel>.carousel-controls{margin:-4px 0 12px}
  .shelf-aside .carousel-controls{margin:0;flex:0 0 auto}
  .carousel-btn{appearance:none;border:1px solid var(--line-strong);background:var(--card);color:var(--fg);width:42px;height:42px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.15rem;line-height:1;box-shadow:var(--shadow);transition:transform .12s ease,border-color .15s ease,opacity .15s ease}
  .carousel-btn:hover{border-color:var(--accent)}
  .carousel-btn:active{transform:scale(.96)}
  .carousel-btn[disabled]{opacity:.35;cursor:default;transform:none}
  .carousel .grid{display:flex;grid-template-columns:none;gap:16px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:2px var(--mobile-gutter) 12px;scroll-padding-inline:var(--mobile-gutter)}
  .carousel .grid::-webkit-scrollbar{display:none}
  .carousel .card{flex:0 0 min(340px,calc(100vw - 54px));scroll-snap-align:start}
  .is-static .carousel-controls{display:none}
}
@media (max-width:560px){
  .show-meta{margin-left:0;text-align:left;width:100%}
  .tl-cap .d{margin-left:0;width:100%}
  .tl-tick .en{font-size:.6rem}
}
@media (prefers-reduced-motion:reduce){
  .card,.more,.more .arrow,.frame .open,.tl-stage iframe,.tl-tick .dot,.carousel-btn{transition:none}
  .chip::before{animation:none}
  .carousel .grid{scroll-behavior:auto}
}
/* ---- card preview overlay (FLIP expand) ---- */
html.ov-lock{overflow:hidden}
.ov[hidden]{display:none}
.ov{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:clamp(16px,4vw,52px)}
.ov-backdrop{position:fixed;inset:0;background:rgba(6,8,12,.5);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);opacity:0;transition:opacity .42s ease}
.ov.open .ov-backdrop{opacity:1}
.ov-dialog{position:relative;width:min(1100px,92vw);height:min(720px,86vh);background:#05070a;border-radius:18px;overflow:hidden;opacity:0;box-shadow:0 1px 2px rgba(0,0,0,.4),0 30px 90px rgba(0,0,0,.55)}
.ov-stage{position:absolute;inset:0}
#ov-frame{width:100%;height:100%;border:0;background:#05070a;opacity:0;transition:opacity .3s ease}
#ov-frame.loaded{opacity:1}
.ov-ctrls{position:fixed;top:clamp(16px,4vw,52px);right:clamp(16px,4vw,52px);display:flex;gap:9px;opacity:0;transform:translateY(-6px);transition:opacity .3s ease .1s,transform .3s ease .1s;z-index:2}
.ov.open .ov-ctrls{opacity:1;transform:none}
.ov-open,.ov-close{display:inline-flex;align-items:center;justify-content:center;height:42px;border-radius:999px;background:rgba(18,22,28,.66);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;border:1px solid rgba(255,255,255,.16);cursor:pointer;font:inherit;transition:background .15s ease,transform .12s ease,border-color .15s ease}
.ov-open{padding:0 16px;gap:8px;font-size:.85rem;font-weight:550;text-decoration:none}
.ov-close{width:42px;padding:0}
.ov-open:hover,.ov-close:hover{background:rgba(40,46,54,.82);border-color:rgba(255,255,255,.28)}
.ov-open:active,.ov-close:active{transform:scale(.96)}
.ov-open svg,.ov-close svg{width:16px;height:16px;display:block;flex:0 0 auto}
.ov-cap{position:fixed;top:clamp(16px,4vw,52px);left:clamp(16px,4vw,52px);max-width:55vw;color:rgba(255,255,255,.92);font-size:.9rem;font-weight:550;letter-spacing:-.01em;text-shadow:0 1px 4px rgba(0,0,0,.55);opacity:0;transform:translateY(-6px);transition:opacity .3s ease .1s,transform .3s ease .1s;z-index:2;pointer-events:none}
.ov.open .ov-cap{opacity:1;transform:none}
@media (max-width:640px){
  .ov{padding:0}
  .ov-dialog{width:100%;height:100%;border-radius:0}
  .ov-cap{display:none}
  .ov-ctrls{top:auto;right:auto;bottom:calc(18px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%) translateY(8px)}
  .ov.open .ov-ctrls{transform:translateX(-50%)}
  .ov-open .lbl{display:none}
  .ov-open{padding:0;width:42px;gap:0}
}
@media (prefers-reduced-motion:reduce){
  .ov-dialog{transition:none!important}
}
"""

# rotates a card's preview iframe through a set of URLs while it is on-screen
ROTATOR = """<script>
(function(){
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ e.target.__vis = e.isIntersecting; });
  }, {rootMargin:'120px'}) : null;
  document.querySelectorAll('iframe[data-cycle]').forEach(function(f){
    var urls; try { urls = JSON.parse(f.getAttribute('data-cycle')); } catch(e){ return; }
    if(!urls||!urls.length) return;
    var i = 0; if(io) io.observe(f);
    setInterval(function(){
      if(io && f.__vis === false) return;
      i = (i+1) % urls.length; f.src = urls[i];
    }, 4200);
  });
})();
</script>"""

OVERLAY_HTML = """  <div class="ov" id="ov" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Countdown preview">
    <div class="ov-backdrop" data-close></div>
    <div class="ov-dialog">
      <div class="ov-stage"><iframe id="ov-frame" title="Countdown preview" scrolling="no"></iframe></div>
    </div>
    <div class="ov-cap" id="ov-cap"></div>
    <div class="ov-ctrls">
      <a class="ov-open" id="ov-open" target="_blank" rel="noopener" aria-label="Open the full countdown in a new tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg><span class="lbl">Open</span></a>
      <button class="ov-close" data-close aria-label="Close preview"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>
  </div>
"""

OVERLAY_JS = """<script>(function(){
  var ov=document.getElementById('ov'); if(!ov) return;
  var dialog=ov.querySelector('.ov-dialog'),frame=document.getElementById('ov-frame'),
      openLink=document.getElementById('ov-open'),cap=document.getElementById('ov-cap'),
      closeBtn=ov.querySelector('.ov-close');
  var srcCard=null,srcRect=null,DUR=440,EASE='cubic-bezier(.2,.8,.2,1)',ft=null,closing=false,generation=0,endHandler=null;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fullCountdownMedia=matchMedia('(max-width: 640px)');
  function shouldOpenFullCountdown(){ return !document.documentElement.classList.contains('gallery') && fullCountdownMedia.matches; }
  frame.addEventListener('load',function(){
    if((frame.src||'').indexOf('about:blank')<0) frame.classList.add('loaded');
    try{frame.contentDocument.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden){e.preventDefault();close();}});}catch(e){}
  });
  function map(card){ // uniform scale + translate so the dialog starts centered on the card frame
    var dr=dialog.getBoundingClientRect(), cr=srcRect||card.querySelector('.frame').getBoundingClientRect();
    if(!cr.width||!cr.height)return 'translate(0,14px) scale(.97)';
    var s=cr.width/dr.width;
    return 'translate('+((cr.left+cr.width/2)-(dr.left+dr.width/2))+'px,'+((cr.top+cr.height/2)-(dr.top+dr.height/2))+'px) scale('+s+')';
  }
  function stopEnd(){if(endHandler){dialog.removeEventListener('transitionend',endHandler);endHandler=null;}}
  function afterTransform(fn){
    stopEnd();endHandler=function(ev){if(ev.target!==dialog||(ev.propertyName&&ev.propertyName!=='transform'))return;stopEnd();fn();};
    dialog.addEventListener('transitionend',endHandler);
  }
  function openFrom(card,originRect){
    clearTimeout(ft);stopEnd();closing=false;var token=++generation;
    srcRect=originRect&&['left','top','width','height'].every(function(k){return Number.isFinite(originRect[k]);})&&originRect.width>0&&originRect.height>0?originRect:null;
    srcCard=card; var url=card.getAttribute('href');
    frame.classList.remove('loaded'); frame.src=url; openLink.href=url;
    var lab=card.querySelector('.label'); if(cap) cap.textContent=card.dataset.previewLabel||(lab?lab.textContent:'');
    ov.hidden=false; ov.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('ov-lock'); ov.classList.add('open');
    document.querySelector('.wrap').inert=true;
    document.dispatchEvent(new CustomEvent('archive:overlay',{detail:{open:true,card:card}}));
    if(reduce){ dialog.style.opacity='1'; closeBtn.focus(); return; }
    dialog.style.transition='none'; dialog.style.transformOrigin='50% 50%'; dialog.style.willChange='transform,opacity';
    dialog.style.transform=map(card); dialog.style.opacity='0';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      if(token!==generation||closing||ov.hidden)return;
      dialog.style.transition='transform '+DUR+'ms '+EASE+',opacity '+Math.round(DUR*0.55)+'ms ease';
      dialog.style.transform='translate(0,0) scale(1)'; dialog.style.opacity='1';
    }); });
    afterTransform(function(){if(token!==generation||closing)return;dialog.style.willChange='';dialog.style.transition='';closeBtn.focus();});
  }
  function finish(){
    if(ov.hidden)return;++generation;closing=false;stopEnd();
    clearTimeout(ft); ov.hidden=true; ov.setAttribute('aria-hidden','true'); ov.classList.remove('open');
    dialog.style.transition=''; dialog.style.transform=''; dialog.style.opacity=''; dialog.style.willChange='';
    frame.classList.remove('loaded'); frame.src='about:blank';
    document.documentElement.classList.remove('ov-lock');
    document.querySelector('.wrap').inert=false;
    document.dispatchEvent(new CustomEvent('archive:overlay',{detail:{open:false,card:srcCard}}));
    if(srcCard){ try{ srcCard.focus({preventScroll:true}); }catch(e){} } srcCard=null; srcRect=null;
  }
  function close(){
    if(ov.hidden||closing) return;
    closing=true;++generation;clearTimeout(ft);stopEnd();
    if(reduce||!srcCard){ dialog.style.opacity='0'; ov.classList.remove('open'); ft=setTimeout(finish,reduce?180:220); return; }
    dialog.style.willChange='transform,opacity'; dialog.style.transformOrigin='50% 50%';
    dialog.style.transition='transform '+DUR+'ms '+EASE+',opacity '+Math.round(DUR*0.7)+'ms ease';
    ov.classList.remove('open');
    dialog.style.transform=map(srcCard); dialog.style.opacity='0';
    afterTransform(finish);
    ft=setTimeout(finish,DUR+160);
  }
  document.querySelectorAll('a.card').forEach(function(c){
    c.addEventListener('click',function(e){
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0) return;
      if(shouldOpenFullCountdown()){ e.preventDefault(); window.location.href=c.href; return; }
      e.preventDefault(); openFrom(c);
    });
  });
  document.addEventListener('archive:open',function(e){var card=e.detail&&e.detail.card;if(card&&card.matches('a.card'))openFrom(card,e.detail.originRect);});
  ov.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click',close); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!ov.hidden) close(); });
  ov.addEventListener('keydown',function(e){
    if(e.key!=='Tab'||ov.hidden)return;
    if(e.target===closeBtn&&!e.shiftKey){e.preventDefault();frame.focus();}
    else if(e.target===openLink&&e.shiftKey){e.preventDefault();frame.focus();}
  });
})();</script>"""

NAV_JS = """<script>(function(){
  var nav=document.querySelector('.shownav'); if(!nav||!('IntersectionObserver' in window)) return;
  var links={}; nav.querySelectorAll('a').forEach(function(a){ links[a.getAttribute('href').split('#').pop()]=a; });
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(!e.isIntersecting) return; var id=e.target.id;
      Object.keys(links).forEach(function(k){ links[k].setAttribute('aria-current', k===id?'true':'false'); });
      var act=links[id]; if(act && nav.scrollWidth>nav.clientWidth) {
        var itemRect=act.getBoundingClientRect(),navRect=nav.getBoundingClientRect();
        nav.scrollLeft+=itemRect.left-navRect.left-(nav.clientWidth-itemRect.width)/2;
      }
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('.shelf').forEach(function(sec){ io.observe(sec); });
})();</script>"""

CAROUSEL_JS = """<script>(function(){
  function setup(root){
    var track=root.querySelector('.grid'),prev=root.querySelector('.carousel-prev'),next=root.querySelector('.carousel-next');
    if(!track||!prev||!next) return;
    var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,raf=0;
    function step(){
      var card=track.querySelector('.card'); if(!card) return track.clientWidth;
      var cs=getComputedStyle(track),gap=parseFloat(cs.columnGap||cs.gap)||0;
      return card.getBoundingClientRect().width+gap;
    }
    function update(){
      var max=Math.max(0,track.scrollWidth-track.clientWidth-1);
      root.classList.toggle('is-static',max<=1);
      prev.disabled=track.scrollLeft<=1;
      next.disabled=track.scrollLeft>=max;
    }
    function move(dir){
      track.scrollTo({left:track.scrollLeft+(dir*step()),behavior:reduce?'auto':'smooth'});
      setTimeout(update,reduce?0:280);
    }
    prev.addEventListener('click',function(){move(-1);});
    next.addEventListener('click',function(){move(1);});
    track.addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(update);},{passive:true});
    addEventListener('resize',update,{passive:true});
    update();
  }
  document.querySelectorAll('[data-carousel]').forEach(setup);
})();</script>"""

CSS += """
/* A paper theatre and a broadcast that never starts. Archive pages stay faithful. */
html.gallery:not(.art-project){--bg:#eee7d8;--fg:#39291f;--muted:#6c6155;--line:#c6b9a0;--line-strong:#ad8b59;--accent:#8b332d;--chip:#e4d5bc;--live:#8b332d;--shadow:none;--shadow-hover:none;color-scheme:light}
.gallery body{background:var(--bg);font-family:'IBM Plex Mono',monospace;isolation:isolate}
.gallery body::before,.gallery body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:-1}
.gallery body::before{background:radial-gradient(ellipse at 15% 20%,#fff8e5 0,transparent 50%),radial-gradient(ellipse at 85% 70%,#c19c7540,transparent 60%)}
.gallery body::after{background:url('assets/archive-paper.png');opacity:.22;mix-blend-mode:multiply}
.gallery .wrap{max-width:1440px;padding:24px 54px 40px;overflow:clip}
.gallery .masthead{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:0 0 20px;border:0}
.gallery .home-link{font-size:11px;letter-spacing:.12em;text-transform:uppercase}
.theme-picker{display:flex;gap:24px;font-size:11px}
.theme-picker a{position:relative;color:var(--muted);padding:8px 0}
.theme-picker a::after{content:'';position:absolute;left:0;right:0;bottom:2px;height:1px;background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform .25s}
.theme-picker a:hover::after,.theme-picker a[aria-current=page]::after{transform:scaleX(1)}
.theme-picker a[aria-current=page]{color:var(--fg)}
.gallery a:focus-visible,.gallery button:focus-visible{outline:2px solid var(--accent);outline-offset:5px}
.hero-surface{position:relative;isolation:isolate}
.hero-atmosphere{position:absolute;inset:100px 3% 45px;z-index:-1;pointer-events:none;background:radial-gradient(ellipse at 50% 55%,#bd715c22,transparent 63%);transform:rotate(-8deg);animation:theatre-light 14s ease-in-out infinite alternate;animation-play-state:paused}
.hero-awake .hero-atmosphere{animation-play-state:running}
@keyframes theatre-light{to{transform:rotate(8deg) scale(1.1);opacity:.65}}
.gallery .archive-heading{position:relative;text-align:center;padding:25px 0 0;z-index:1}
.gallery .eyebrow{font-size:10px;letter-spacing:.24em;margin:0 0 14px}
.gallery h1.title{font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:clamp(100px,16vw,224px);text-transform:none;letter-spacing:-.065em;line-height:.87;white-space:nowrap;text-wrap:nowrap}
.title-line{display:inline-block}
.title-line:last-child{font-style:italic;margin-left:-.02em}
.title-glyph{display:inline-block;transform-origin:50% 80%}
[data-theme=royal] .hero-awake .title-glyph{animation:royal-type 8s ease-in-out infinite alternate;animation-delay:calc(var(--i) * -.6s)}
@keyframes royal-type{from{transform:translateY(-3px) rotate(-1deg)}to{transform:translateY(4px) rotate(1deg)}}
.gallery .lede{font-family:'Cormorant Garamond',Georgia,serif;font-size:21px;font-style:italic;max-width:none;letter-spacing:0;margin:20px 0 0;color:var(--muted)}
.gallery .next-countdown{position:relative;height:540px;margin:6px 0 0;padding:0;border:0;text-align:center;isolation:isolate}
.royal-guardians{position:absolute;left:0;top:30px;width:100%;height:280px;object-fit:contain;pointer-events:none;z-index:-1;opacity:.9}
.countdown-caption{position:absolute;left:0;right:0;top:5px;z-index:2;pointer-events:none}
.gallery .next-countdown h2{display:block;font:400 10px 'IBM Plex Mono',monospace;letter-spacing:.13em;text-transform:uppercase}
.countdown-caption time{display:block;font-size:10px;margin-top:7px;color:var(--muted)}
.royal-clock{position:absolute;left:17%;right:17%;top:325px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;z-index:3;pointer-events:none}
.throne-space{display:none}
.clock-unit>span{display:inline-block;font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(68px,7.8vw,104px);font-variant-numeric:tabular-nums;line-height:.85;letter-spacing:-.06em}
.number-reel{--reel-cell:.85em;white-space:nowrap}
.number-reel .digit-slot{display:inline-block;position:relative;width:1ch;height:var(--reel-cell);overflow:hidden;vertical-align:top;letter-spacing:0;-webkit-mask-image:linear-gradient(transparent,#000 4%,#000 96%,transparent);mask-image:linear-gradient(transparent,#000 4%,#000 96%,transparent)}
.clock-unit>.number-reel{--reel-cell:1.1em;line-height:1.1em;margin-block:-.125em}
.digit-strip{display:block;line-height:var(--reel-cell);text-align:center}
.digit-cell{display:flex;align-items:center;justify-content:center;height:var(--reel-cell)}
.clock-unit>small{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:16px;color:var(--muted);margin-top:10px}
.scene-stage{position:absolute;width:370px;height:310px;left:50%;top:15px;transform:translateX(-50%);z-index:2}
#theme-scene{width:100%;height:100%;display:block;opacity:0;touch-action:pan-y}
.scene-ready #theme-scene{opacity:1}
.scene-fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}
.gallery .scene-ready .scene-fallback{display:none!important}
.control-fallback,.control-only{display:none}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.control-fallback img{width:100%;height:auto;display:block}
.fallback-digits{position:absolute;left:38.5%;top:56%;transform:translate(-50%,-50%);font-family:monospace;font-size:clamp(11px,3vw,34px);letter-spacing:.04em;color:#ee6655;white-space:nowrap;pointer-events:none}
.fallback-digits.number-reel{--reel-cell:1.1em}
.scene-action{position:absolute;left:30%;top:20%;width:40%;height:65%;background:none;border:0;border-radius:12px;cursor:pointer;color:var(--fg)}
.scene-action:hover{background:radial-gradient(ellipse,#ac6e3420,transparent 70%)}
.gallery .scene-hint{display:none}
.royal-reset{position:absolute;top:453px;left:50%;transform:translateX(-50%) rotate(-4deg);font:italic 32px 'Cormorant Garamond',Georgia,serif;letter-spacing:-.04em;padding:6px 24px 8px;border:0;border-bottom:1px solid var(--accent);background:none;color:var(--accent);cursor:pointer;transition:transform .3s,color .3s}
.royal-reset:hover{transform:translateX(-50%) rotate(3deg);color:var(--fg)}
.gallery .countdown-secret{position:absolute;left:0;right:0;top:280px;margin:0;font:italic 24px 'Cormorant Garamond',Georgia,serif;color:var(--accent);z-index:4;pointer-events:none}
.press-tally{position:absolute;top:461px;right:5%;text-align:left;color:var(--muted)}
.press-tally>span{display:block;font:italic 40px 'Cormorant Garamond',Georgia,serif;line-height:1;font-variant-numeric:tabular-nums}
.press-tally>.number-reel{--reel-cell:1em}
.press-tally>small{display:block;font-size:9px;letter-spacing:.04em;margin-top:5px}
.clock-status{position:absolute;bottom:0;left:10px;right:10px;max-width:34ch;margin-inline:auto;font-size:11px;line-height:1.5;color:var(--accent)}
.countdown-ended{position:absolute;bottom:0;left:0;right:0;font-size:11px}
.gallery .shownav{position:sticky;top:0;justify-content:space-between;gap:12px;margin:0;padding:16px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);border-radius:0;background:var(--bg);box-shadow:none;backdrop-filter:none}
.gallery .shownav a{border-radius:0;flex-direction:row;gap:8px;padding:6px 0;font-size:10px;letter-spacing:-.035em;background:none}
.gallery .shownav a[aria-current=true]{color:var(--accent)}
.gallery .shownav .nv-e{font:italic 14px 'Cormorant Garamond',Georgia,serif;color:var(--accent)}
.gallery .archive-shelves{padding-top:50px}
.gallery .shelf{position:relative;display:block;margin:0 0 90px;padding:0 0 0 7%;border:0;scroll-margin-top:95px}
.gallery .shelf::before{content:attr(data-shelf-index);position:absolute;left:0;top:-12px;font:italic 75px 'Cormorant Garamond',Georgia,serif;color:var(--line-strong);opacity:.65;letter-spacing:-.08em;line-height:1}
.gallery .shelf-aside{display:flex;justify-content:space-between;margin:0 0 26px;padding:0;align-items:center}
.gallery .shelf-copy{display:flex;flex-direction:column;align-items:flex-start;gap:7px}
.gallery .shelf-id{display:block}
.gallery .shelf-emoji{display:none}
.gallery .shelf-name{font:400 clamp(32px,4.2vw,56px)/1 'Cormorant Garamond',Georgia,serif;white-space:nowrap;letter-spacing:-.035em}
.gallery .shelf-kicker{font-size:9px;letter-spacing:.1em;margin:0;order:2}
.gallery .shelf-origin{display:none;font-size:10px;order:3;margin:0}
.gallery a.shelf-origin{display:inline-block}
.gallery .shelf .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px;align-items:start;overflow:visible}
.gallery .card{display:block;border:0;border-radius:0;box-shadow:none;background:none;overflow:visible;transition:transform .5s cubic-bezier(.2,.8,.2,1);transform:rotate(-1deg)}
.gallery .card:nth-child(even){transform:translateY(36px) rotate(1.5deg)}
.gallery .card:hover{transform:translateY(-7px) rotate(0);box-shadow:none}
.gallery .card:nth-child(even):hover{transform:translateY(29px) rotate(0)}
.gallery .frame{aspect-ratio:16/10;border:12px solid #f9f3e7;border-radius:0;outline:1px solid #c5b497;box-shadow:0 16px 26px -16px #49332266}
.gallery .frame::after{content:'';position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 10px #0005;border:1px solid #39291f33}
.gallery .frame .open{border-radius:0;font-size:10px;background:#efe7d9;color:#39291f}
.gallery .body{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:15px 0 0}
.gallery .label{font:italic 21px 'Cormorant Garamond',Georgia,serif;font-weight:400;line-height:1.1;letter-spacing:0}
.gallery .row{margin:0;flex-shrink:0}
.gallery .year{font-size:10px}
.gallery .desc{display:none}
.gallery .chip{border-radius:0;font-size:9px;background:none;padding:0}
.gallery .chip::before{animation:none}
.gallery .more.shelf-more{font-size:10px;margin-top:24px}
.gallery .foot{margin-top:0;border-color:var(--line);font-size:10px}
.gallery .eyebrow,.gallery .title,.gallery .lede,.gallery .shelf{animation:none}
.gallery.motion-ready .shelf{opacity:0;transform:translateY(30px);transition:opacity .7s,transform .8s cubic-bezier(.2,.8,.2,1)}
.gallery.motion-ready .shelf.in-view{opacity:1;transform:none}
html.gallery[data-theme=control]{--bg:#151b1b;--fg:#e7dfcc;--muted:#a7a99b;--line:#3a4641;--line-strong:#6f7b6d;--chip:#28332e;--accent:#ed7655;--live:#ed7655;color-scheme:dark}
[data-theme=control] body::before{background:radial-gradient(ellipse at 75% 20%,#74524045,transparent 50%),radial-gradient(ellipse at 20% 60%,#384c3c55,transparent 70%)}
[data-theme=control] body::after{background:repeating-linear-gradient(0deg,transparent 0 3px,#000 3px 4px);opacity:.13;mix-blend-mode:normal}
[data-theme=control] .masthead{border-bottom:1px dashed var(--line);padding-bottom:16px}
[data-theme=control] .hero-atmosphere{inset:35% -10% 0;background:radial-gradient(ellipse,#cc6e4130,transparent 65%);animation:none;transform:none}
[data-theme=control] .archive-heading{text-align:left;padding-top:28px}
[data-theme=control] .eyebrow{margin-bottom:18px;color:var(--accent)}
[data-theme=control] h1.title{font:400 clamp(110px,15.6vw,218px)/.79 'Archivo Black',Impact,sans-serif;letter-spacing:-.075em;text-transform:uppercase;white-space:normal}
[data-theme=control] .title-line{display:block;width:max-content;font-style:normal;transform:translateX(3%)}
[data-theme=control] .title-line:last-child{margin:8px 0 0 auto;color:var(--accent);transform:rotate(-3deg) translateX(-5%)}
[data-theme=control] .title-glyph{transition:transform .45s cubic-bezier(.2,.8,.2,1)}
[data-theme=control] .title-glyph:hover{transform:translateY(-10px) rotate(-4deg)}
[data-theme=control] .lede{position:absolute;top:38px;right:0;margin:0;font:11px 'IBM Plex Mono',monospace;max-width:20ch;text-align:right;line-height:1.6}
[data-theme=control] .next-countdown{height:335px;margin:-35px 0 10px;z-index:2}
[data-theme=control] .next-countdown:has(.clock-status:not(:empty)){height:375px}
[data-theme=control] .royal-guardians,[data-theme=control] .royal-clock,[data-theme=control] .royal-fallback,[data-theme=control] .royal-only{display:none}
[data-theme=control] .control-fallback,[data-theme=control] .control-only{display:block}
[data-theme=control] .control-fallback{inset:auto;left:7.5%;top:50%;width:85%;height:auto;transform:translateY(-50%)}
[data-theme=control] .scene-stage{width:92%;height:300px;left:7%;top:0;transform:none}
[data-theme=control] .scene-action{left:73%;top:20%;width:22%;height:65%;border-radius:50%}
[data-theme=control] .scene-action:hover{background:radial-gradient(ellipse,#ed765526,transparent 65%)}
[data-theme=control] .countdown-caption{top:250px;left:0;right:auto;text-align:left}
[data-theme=control] .next-countdown h2{font-size:10px;letter-spacing:.04em;color:var(--fg)}
[data-theme=control] .countdown-caption time{font-size:10px;margin-top:6px}
[data-theme=control] .press-tally{top:260px;right:3%;display:flex;align-items:baseline;gap:9px;color:var(--muted)}
[data-theme=control] .press-tally>span{font:400 34px 'IBM Plex Mono',monospace;color:var(--accent);letter-spacing:-.08em}
[data-theme=control] .press-tally>small{font-size:9px}
[data-theme=control] .countdown-secret{top:245px;left:35%;right:25%;font:12px 'IBM Plex Mono',monospace;color:var(--fg)}
[data-theme=control] .reset-echo{position:absolute;inset:0;z-index:-1;opacity:0;font:110px 'Archivo Black',Impact,sans-serif;color:var(--accent);text-transform:uppercase;pointer-events:none}
[data-theme=control] .shownav{border-color:var(--line);background:#151b1bf2}
[data-theme=control] .shownav .nv-e{font:10px 'IBM Plex Mono',monospace}
[data-theme=control] .archive-shelves{padding-top:42px}
[data-theme=control] .shelf{padding:0;margin:0 0 85px;border:0;background:none;box-shadow:none;border-radius:0}
[data-theme=control] .shelf::before{left:auto;right:0;top:-6px;font:400 65px 'IBM Plex Mono',monospace;color:var(--line);opacity:1}
[data-theme=control] .shelf-aside{align-items:end;padding-right:130px;margin-bottom:28px}
[data-theme=control] .shelf-name{font:400 clamp(24px,3.6vw,48px)/1 'Archivo Black',Impact,sans-serif;text-transform:uppercase;letter-spacing:-.05em}
[data-theme=control] .shelf-copy{gap:11px}
[data-theme=control] .shelf-kicker{color:var(--accent)}
[data-theme=control] .shelf .grid{gap:26px}
[data-theme=control] .card,[data-theme=control] .card:nth-child(even){transform:none}
[data-theme=control] .card:hover,[data-theme=control] .card:nth-child(even):hover{transform:translateY(-6px)}
[data-theme=control] .frame{aspect-ratio:16/10;border:10px solid #2b3330;outline:1px solid #556052;border-radius:18px;box-shadow:0 18px 30px -15px #000a}
[data-theme=control] .frame::after{border:1px solid #91a08133;border-radius:7px;box-shadow:inset 0 0 32px #0008;background:repeating-linear-gradient(transparent 0 3px,#0002 3px 4px)}
[data-theme=control] .frame .open{background:var(--fg);color:var(--bg)}
[data-theme=control] .body{padding:16px 2px 0}
[data-theme=control] .label{font:11px 'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:.01em}
[data-theme=control] .year{font-size:10px}
[data-theme=control] .more.shelf-more{color:var(--muted)}
@media(min-width:761px){
 [data-theme=royal] .shelf:nth-child(even){padding-left:15%;padding-right:3%}
 [data-theme=royal] .shelf:nth-child(even)::before{left:7%}
 .gallery #got .grid{grid-template-columns:1.35fr 1fr;row-gap:70px}
 .gallery #got .card:first-child{grid-row:span 2}
 .gallery #got .card:first-child .frame{aspect-ratio:4/3}
 .gallery #got .card:nth-child(3){transform:rotate(-1deg)}
 [data-theme=control] #got .grid{grid-template-columns:repeat(3,minmax(0,1fr));row-gap:26px}
 [data-theme=control] #got .card:first-child{grid-row:auto}
 [data-theme=control] #got .card:first-child .frame{aspect-ratio:16/10}
 [data-theme=control] #got .card:nth-child(3){transform:none}
}
@media(max-width:1000px) and (min-width:761px){.gallery .shownav a{font-size:9px;gap:5px}.gallery .shownav{gap:10px;justify-content:flex-start}.gallery .wrap{padding-inline:32px}}
@media(max-width:760px){
 .gallery .wrap{padding:16px 22px 30px}
 .gallery .masthead{gap:12px;padding-bottom:12px}
 .gallery .home-link{font-size:9px;letter-spacing:.08em}.theme-picker{font-size:10px;gap:16px}
 .gallery .archive-heading{padding-top:34px}
 .gallery .eyebrow{font-size:9px;margin-bottom:17px}
 .gallery h1.title{font-size:clamp(65px,18vw,130px);letter-spacing:-.07em;line-height:1}
 .gallery .lede{font-size:19px;margin-top:9px}
 .gallery .next-countdown{height:440px;margin-top:9px}
 .royal-guardians{left:-9%;width:118%;top:82px;height:180px;opacity:.7}
 .scene-stage{width:250px;height:235px;top:38px}
 .countdown-caption{top:0}
 .gallery .next-countdown h2,.countdown-caption time{font-size:9px}
 .royal-clock{left:0;right:0;top:278px;gap:10px}
 .clock-unit>span{font-size:clamp(49px,13.2vw,70px)}.clock-unit>small{font-size:13px;margin-top:6px}
 .gallery .countdown-secret{top:246px;font-size:21px}
 .royal-reset{top:357px;font-size:29px;padding:6px 22px}
 .press-tally{top:363px;right:0}.press-tally>span{font-size:30px}.press-tally>small{font-size:8px}
 .gallery .shownav{margin:0 -22px;padding:12px 22px;gap:22px;justify-content:flex-start;scroll-padding-inline:22px}
 .gallery .shownav a{font-size:10px;gap:6px}.gallery .shownav .nv-e{font-size:13px}
 .gallery .archive-shelves{padding-top:34px}
 .gallery .shelf{padding:0;margin-bottom:58px;scroll-margin-top:80px}
 .gallery .shelf::before{position:static;display:block;font-size:34px;line-height:1;margin-bottom:10px}
 .gallery .shelf-aside{margin-bottom:18px;gap:10px;align-items:center}
 .gallery .shelf-copy{gap:6px}.gallery .shelf-name{font-size:clamp(25px,6.9vw,41px)}
 .gallery .shelf-kicker{font-size:9px}.gallery a.shelf-origin{font-size:9px}
 .gallery .shelf .grid{display:flex;gap:22px;overflow-x:auto;overflow-y:hidden;margin:0 -22px;padding:12px 22px 48px;scroll-padding-inline:22px;align-items:start}
 .gallery .carousel .card{flex:0 0 calc(100vw - 76px);transform:rotate(-1deg);min-width:0}
 .gallery .carousel .card:nth-child(even){transform:translateY(12px) rotate(1deg)}
 .gallery .frame{border-width:8px}
 .gallery .body{gap:8px;padding-top:12px}.gallery .label{font-size:19px}.gallery .year{font-size:9px}
 .gallery .carousel-controls{display:flex;gap:4px;flex-shrink:0}.gallery .carousel-btn{width:32px;height:36px;font-size:20px;border:0;border-bottom:1px solid var(--line-strong);border-radius:0;background:none;box-shadow:none}
 .gallery .more.shelf-more{margin-top:-15px;font-size:10px}
 .gallery .foot{display:flex;flex-wrap:wrap;gap:10px;font-size:9px}
 [data-theme=control] .archive-heading{padding-top:35px}
 [data-theme=control] .eyebrow{margin-bottom:28px}
 [data-theme=control] h1.title{font-size:clamp(65px,20.5vw,155px);line-height:.84;letter-spacing:-.075em}
 [data-theme=control] .title-line{transform:none}
 [data-theme=control] .title-line:last-child{margin-top:6px;transform:rotate(-3deg)}
 [data-theme=control] .lede{top:33px;font-size:9px;max-width:18ch;line-height:1.5}
 [data-theme=control] .next-countdown{height:230px;margin:-10px -10px 8px}
 [data-theme=control] .next-countdown:has(.clock-status:not(:empty)){height:270px}
 [data-theme=control] .scene-stage{height:210px;width:110%;left:-5%;top:0}
 [data-theme=control] .countdown-caption{top:176px;left:10px}
 [data-theme=control] .next-countdown h2,[data-theme=control] .countdown-caption time{font-size:9px}
 [data-theme=control] .press-tally{top:180px;right:10px;gap:5px;display:block;text-align:right}
 [data-theme=control] .press-tally>span{font-size:26px}.press-tally>small{font-size:8px;margin-top:2px}
 [data-theme=control] .countdown-secret{top:144px;left:0;right:0;font-size:10px}
 [data-theme=control] .scene-action{left:73%;top:22%;width:24%;height:58%}
 [data-theme=control] .reset-echo{font-size:55px}
 [data-theme=control] .archive-shelves{padding-top:35px}
 [data-theme=control] .shelf{margin-bottom:58px;padding:0}
 [data-theme=control] .shelf::before{position:static;font-size:32px;margin-bottom:14px;color:var(--accent)}
 [data-theme=control] .shelf-aside{padding-right:0;align-items:center;margin-bottom:10px}
 [data-theme=control] .shelf-name{font-size:clamp(17px,5.1vw,30px);letter-spacing:-.055em}
 [data-theme=control] .shelf-copy{gap:7px}
 [data-theme=control] .carousel .card,[data-theme=control] .carousel .card:nth-child(even){transform:none;flex-basis:calc(100vw - 76px)}
 [data-theme=control] .shelf .grid{gap:20px;padding-bottom:30px}
 [data-theme=control] .frame{border-width:7px;border-radius:12px}
 [data-theme=control] .body{padding-top:12px}.gallery[data-theme=control] .label{font-size:10px;line-height:1.5}
 [data-theme=control] .more.shelf-more{margin-top:0}
}
@media(prefers-reduced-motion:reduce){
 .gallery .hero-atmosphere,.gallery .title-glyph,.gallery .clock-unit>span,.gallery .card,.gallery .shelf{animation:none!important;transition:none!important}
 .gallery.motion-ready .shelf{opacity:1;transform:none}
}
"""

CSS_VER = hashlib.md5(CSS.encode("utf-8")).hexdigest()[:8]
FAVICON = '<link href="https://gravatar.com/avatar/5c858c5daef12e779828769ee705f46b?s=64" rel="shortcut icon">'

def esc(s):
    return html.escape(s, quote=True)

def head(title, extra_head="", gallery=False):
    return (
        "<!DOCTYPE html>\n" + ('<html lang="en" class="gallery">\n<head>\n' if gallery else '<html lang="en">\n<head>\n') +
        "  <meta charset=\"utf-8\">\n"
        "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
        f"  <title>{esc(title)}</title>\n"
        "  <meta name=\"description\" content=\"An archive of the TV-show countdown sites built by Artur Pokusin between 2012 and 2025, preserved and ticking live.\">\n"
        f"  {FAVICON}\n"
        f"  <link rel=\"stylesheet\" href=\"/countdowns/countdowns.css?v={CSS_VER}\">\n"
        f"{extra_head}"
        "</head>\n<body>\n  <div class=\"wrap\">\n"
    )

def foot(scripts=""):
    return (
        "    <footer class=\"foot\">\n"
        "      <span>Artur Pokusin</span>\n"
        f"      <span>{SHOW_COUNT} shows · {TOTAL} versions · 2012 – 2025</span>\n"
        "    </footer>\n  </div>\n"
        f"{scripts}"
        "</body>\n</html>\n"
    )

def card(show_slug, v, zoom=4, defer_frames=False):
    zoom = v.get("zoom", zoom)  # per-version override beats the show default
    base = f'/countdowns/{show_slug}/{v["slug"]}'
    if not base.endswith("/"):
        base += "/"
    # zoom controls the iframe's internal render width (cardWidth x zoom); raise it for
    # shows whose responsive breakpoint would otherwise trigger a collapsed/tablet layout
    zstyle = (f' style="width:{zoom*100}%;height:{zoom*100}%;transform:scale({1/zoom:.4f})"'
              if zoom != 4 else "")
    iframe = (f'<iframe src="{base}"{zstyle} loading="lazy" tabindex="-1" scrolling="no" '
              f'title="{esc(v["label"])} preview"></iframe>')
    chip = f'<span class="chip">{esc(v["chip"])}</span>' if v.get("chip") else ""
    thumb = f'/countdowns/assets/previews/{show_slug}-{v["slug"].strip("/").replace("/", "-")}.jpg'
    if defer_frames:
        # Inert until the theme is known: art worlds never boot archived scripts behind their stills.
        iframe = (f'<template class="card-preview">{iframe}</template>'
                  f'<img src="{thumb}" alt="" loading="lazy" width="720" height="450">')
    return (
        f'      <a class="card" href="{base}" data-thumb="{thumb}" target="_blank" rel="noopener">\n'
        f'        <div class="frame">{iframe}<span class="open">Open ↗</span></div>\n'
        f'        <div class="body">\n'
        f'          <div class="label">{esc(v["label"])}</div>\n'
        f'          <div class="row"><span class="year">{esc(v["year"])}</span>{chip}</div>\n'
        f'          <div class="desc">{esc(v["desc"])}</div>\n'
        f'        </div>\n'
        f'      </a>\n'
    )

def show_meta(s):
    dom = (f'<a href="https://{s["domain"]}" target="_blank" rel="noopener">{esc(s["domain"])} ↗</a>'
           if s["live"] else esc(s["domain"]))
    return f'{dom}<span class="dot">·</span>{esc(s["years"])}'

def carousel_controls(versions):
    return (
        '        <div class="carousel-controls" aria-label="Preview cards">\n'
        '          <button class="carousel-btn carousel-prev" type="button" aria-label="Previous preview">‹</button>\n'
        '          <button class="carousel-btn carousel-next" type="button" aria-label="Next preview">›</button>\n'
        '        </div>\n'
        if len(versions) > 1 else ""
    )

def grid(show_slug, versions, zoom=4, include_controls=True, carousel_root=True, more_href=None, defer_frames=False):
    controls = carousel_controls(versions) if include_controls else ""
    data_attr = ' data-carousel' if carousel_root and len(versions) > 1 else ""
    more = (
        f'        <a class="more shelf-more" href="{more_href}">More <span class="arrow">→</span></a>\n'
        if more_href else ""
    )
    return (
        f'      <div class="carousel"{data_attr}>\n'
        f'{controls}'
        '        <div class="grid">\n'
        + "".join(card(show_slug, v, zoom, defer_frames=defer_frames) for v in versions) +
        '        </div>\n'
        f'{more}'
        '      </div>\n'
    )

# --------------------------------------------------------------- gallery
def build_gallery():
    out = head("Countdowns · Artur Pokusin", THEME_HEAD, gallery=True)
    out += ('    <header class="masthead"><a class="home-link" href="/">Artur Pokusin</a>'
            '<nav class="theme-picker" aria-label="Archive theme">'
            '<a href="?theme=royal" data-theme-link="royal" aria-label="Royal archive">Royal</a>'
            '<a href="?theme=control" data-theme-link="control" aria-label="Control room">Control</a>'
            '<details class="theme-menu"><summary>Worlds</summary><div class="theme-menu-list">'
            '<a href="?theme=royal" data-theme-link="royal">Royal</a>'
            '<a href="?theme=control" data-theme-link="control">Control</a>'
            + ''.join(f'<a href="?theme={slug}" data-theme-link="{slug}">{esc(name)}</a>' for slug, name in ART_THEMES)
            + '</div></details></nav></header>\n')
    out += ('    <section class="art-hero" id="art-hero" aria-label="Interactive countdown archive" hidden>\n'
            '      <div class="art-stage" id="art-stage"><canvas id="art-scene" tabindex="0" aria-label="Interactive art scene"></canvas></div>\n'
            '      <h1 class="art-title">Countdowns</h1><div class="art-reset-area"></div><div class="art-mounts"></div>\n'
            '      <button class="art-secret-trigger" type="button" aria-label="Inspect the small crown" aria-controls="countdown-secret" aria-expanded="false"><img src="assets/concepts/crown.png" alt=""></button>\n'
            '      <div class="art-route"></div><button class="art-archive-toggle" type="button">Archive</button><div class="art-joystick"></div>\n'
            '    </section>\n')
    title = ''.join('<span class="title-line">' + ''.join(
        f'<span class="title-glyph" style="--i:{offset + i}">{letter}</span>'
        for i, letter in enumerate(word)) + '</span>' for word, offset in [('Count', 0), ('downs', 5)])
    out += ('    <div class="hero-surface" id="hero-surface">\n'
            '<div class="hero-atmosphere" aria-hidden="true"></div>'
            '<div class="archive-heading"><p class="eyebrow">2012 — ∞</p>'
            f'<h1 class="title" aria-label="Countdowns"><span aria-hidden="true">{title}</span></h1>\n'
            '<p class="lede">An archive of anticipation.</p></div>\n')
    out += (
        '    <section class="next-countdown" aria-labelledby="next-countdown-heading">\n'
        '      <img class="royal-guardians" src="assets/royal-guardians.png" alt="" width="1440" height="520">\n'
        '      <div class="countdown-caption"><h2 id="next-countdown-heading">Next countdown</h2>'
        f'<time id="next-countdown-date" datetime="{NEXT_COUNTDOWN_DATE}">{NEXT_COUNTDOWN_LABEL}</time></div>\n'
        '      <div class="royal-clock" role="timer" aria-label="Time until the next countdown">'
        '<div class="clock-unit"><span data-unit="days">30</span><small>days</small></div>'
        '<div class="clock-unit"><span data-unit="hours">00</span><small>hours</small></div>'
        '<div class="throne-space"></div>'
        '<div class="clock-unit"><span data-unit="minutes">00</span><small>minutes</small></div>'
        '<div class="clock-unit"><span data-unit="seconds">00</span><small>seconds</small></div></div>\n'
        '      <div class="scene-stage" id="scene-stage">'
        '<img class="scene-fallback royal-fallback" src="assets/throne-fallback.png" alt="A tiny crown on an empty throne">'
        '<div class="scene-fallback control-fallback"><img src="assets/console-fallback.png" alt="A timer console wired to a red button" width="1024" height="480">'
        '<span class="fallback-digits" id="fallback-digits">30:00:00:00</span></div>'
        '<canvas id="theme-scene" aria-hidden="true"></canvas>'
        '<button class="scene-action" id="scene-action" type="button" aria-label="Crown the countdown" aria-controls="countdown-secret" aria-expanded="false"></button>'
        '</div>\n'
        '      <button class="royal-reset royal-only" id="royal-reset" type="button" aria-label="Postpone the next countdown" aria-controls="countdown-secret" aria-expanded="false">Again.</button>\n'
        '      <p class="scene-hint"><span class="royal-only">A small crown. A long wait.</span>'
        '<span class="control-only">Lift. Press.</span></p>\n'
        '      <p class="countdown-secret" id="countdown-secret" role="status" hidden>Long may I count.</p>\n'
        '      <p class="sr-only" id="timer-readable" role="timer" aria-live="off"></p>\n'
        '      <p class="press-tally"><span id="reset-count">—</span><small>postponements</small></p>\n'
        '      <p class="clock-status" id="clock-status" role="status"></p>\n'
        '      <p class="countdown-ended" id="countdown-ended" hidden>Time to start another countdown.</p>\n'
        '      <span class="reset-echo control-only" aria-hidden="true">Again.</span>\n'
        '    </section>\n    </div>\n'
    )
    out += '    <nav class="shownav" aria-label="Shows">\n'
    for i, s in enumerate(SHOWS):
        out += (f'      <a href="#{s["slug"]}"><span class="nv-e">{["I", "II", "III", "IV", "V", "VI", "VII"][i]}</span>'
                f'<span class="nv-n">{esc(s["name"])}</span></a>\n')
    out += '    </nav>\n'
    out += '    <main class="archive-shelves" id="archive-shelves" aria-label="Countdown archive">\n'
    for i, s in enumerate(SHOWS):
        shown = [v for v in s["versions"] if not v.get("collapsed") and not v.get("timeline")]
        collapsed = [v for v in s["versions"] if v.get("collapsed") and not v.get("timeline")]
        has_more = bool(collapsed) or any(v.get("timeline") for v in s["versions"])
        if s["live"]:
            dom = (f'<a class="shelf-origin" href="https://{s["domain"]}" target="_blank" '
                   f'rel="noopener">{esc(s["domain"])} ↗</a>')
        else:
            dom = f'<span class="shelf-origin">{esc(s["domain"])}</span>'
        carousel_attr = ' data-carousel' if len(shown) > 1 else ""
        more_href = f'/countdowns/{s["slug"]}/' if has_more else None
        out += f'    <section class="shelf" id="{s["slug"]}"{carousel_attr} data-shelf-index="{i + 1:02}">\n      <div class="shelf-aside">\n'
        out += '        <div class="shelf-copy">\n'
        out += f'          <div class="shelf-kicker">{esc(s["years"])}</div>\n'
        out += (f'          <div class="shelf-id"><span class="shelf-emoji" aria-hidden="true">{s["name"][0]}</span>'
                f'<span class="shelf-name">{esc(s["name"])}</span></div>\n')
        out += f'          {dom}\n'
        out += '        </div>\n'
        out += carousel_controls(shown)
        out += '      </div>\n'
        out += grid(s["slug"], shown, s.get("preview_zoom", 4), include_controls=False, carousel_root=False, more_href=more_href, defer_frames=True)
        out += '    </section>\n'
    themes_version = hashlib.sha256(open(os.path.join(CD, 'themes.js'), 'rb').read()).hexdigest()[:10]
    previews = """<script>(function(){
      var art=document.documentElement.classList.contains('art-project');
      document.querySelectorAll('template.card-preview').forEach(function(t){
        if(art){t.remove();return;}
        t.parentElement.querySelector('img').remove();t.replaceWith(t.content);
      });
    })();</script>"""
    return out + '    </main>\n' + foot(previews + OVERLAY_HTML + OVERLAY_JS + NAV_JS + CAROUSEL_JS + f'<script type="module" src="themes.js?v={themes_version}"></script>')

# ----------------------------------------------------- per-show details page
def build_show_index(s):
    shown = [v for v in s["versions"] if not v.get("collapsed") and not v.get("timeline")]
    collapsed = [v for v in s["versions"] if v.get("collapsed") and not v.get("timeline")]
    timelines = [v for v in s["versions"] if v.get("timeline")]
    out = head(f'{s["name"]} Countdowns · Archive')
    out += ('    <div class="crumb"><a href="/">pokusin.com</a><span class="sep">/</span>'
            '<a href="/countdowns/">countdowns</a><span class="sep">/</span>'
            f'{esc(s["name"])}</div>\n')
    out += f'    <h1 class="title">{s["emoji"]} {esc(s["name"])}</h1>\n'
    out += (f'    <p class="lede">Every version of the {esc(s["name"])} countdown, in the archive. '
            f'<strong>{esc(s["years"])}</strong>.</p>\n')
    out += '    <section class="show">\n'
    out += grid(s["slug"], shown, s.get("preview_zoom", 4))
    for tl in timelines:
        out += (f'      <a class="deeplink" href="/countdowns/{s["slug"]}/{tl["slug"]}">'
                f'{esc(tl["label"])}, scrub the timeline <span class="arrow">→</span></a>\n')
    if collapsed:
        out += (f'      <details class="archive">\n'
                f'        <summary><span class="tw">▶</span> Archived variants '
                f'<span class="ct">{len(collapsed)}</span></summary>\n')
        out += grid(s["slug"], collapsed, s.get("preview_zoom", 4))
        out += '      </details>\n'
    out += '    </section>\n'
    return out + foot(OVERLAY_HTML + OVERLAY_JS + NAV_JS + CAROUSEL_JS)

# ----------------------------------------------- Dexter S7 timeline scrubber
def build_timeline():
    eps_js = json.dumps([{"s": e["slug"], "n": e["num"], "t": e["title"], "d": e["date"]} for e in EPISODES])
    extra = "  <style>.wrap{max-width:1000px}</style>\n"
    out = head("Dexter · Season 7, Episode by Episode · Archive", extra)
    out += ('    <div class="crumb"><a href="/">pokusin.com</a><span class="sep">/</span>'
            '<a href="/countdowns/">countdowns</a><span class="sep">/</span>'
            '<a href="/countdowns/dexter/">Dexter</a><span class="sep">/</span>Season 7 episode by episode</div>\n')
    out += '    <h1 class="title">\U0001FA78 Season 7, Episode by Episode</h1>\n'
    out += ('    <p class="lede">Through the autumn of 2012 the Dexter countdown was re-skinned for each new '
            'episode in turn. Press play, or <strong>scrub the timeline</strong> to watch the subtle differences between them.</p>\n')
    out += '    <div class="tl">\n'
    out += '      <div class="tl-stage"><iframe id="tl-frame" scrolling="no" title="Episode preview"></iframe></div>\n'
    out += ('      <div class="tl-cap"><span class="n" id="tl-n">Episode 1</span>'
            '<span class="t" id="tl-t">Are You…?</span><span class="d" id="tl-d">Sep 30, 2012</span></div>\n')
    out += '      <div class="tl-bar">\n'
    out += '        <button class="tl-play" id="tl-play" data-state="playing" aria-label="Pause">❚❚</button>\n'
    out += '        <div class="tl-track"><ol class="tl-ticks">\n'
    for idx, e in enumerate(EPISODES):
        out += (f'          <li><button class="tl-tick" data-i="{idx}" aria-current="false" '
                f'aria-label="Episode {e["num"]}: {esc(e["title"])}"><span class="dot"></span>'
                f'<span class="en">{e["num"]}</span></button></li>\n')
    out += '        </ol></div>\n      </div>\n    </div>\n'
    script = (
        "<script>(function(){\n"
        f"  var eps={eps_js};\n"
        "  var i=0, playing=false, timer=null, INT=3800;\n"
        "  var f=document.getElementById('tl-frame'),N=document.getElementById('tl-n'),"
        "T=document.getElementById('tl-t'),D=document.getElementById('tl-d'),P=document.getElementById('tl-play');\n"
        "  var ticks=[].slice.call(document.querySelectorAll('.tl-tick'));\n"
        "  function render(){var e=eps[i];f.style.opacity=0;\n"
        "    setTimeout(function(){f.src='/countdowns/dexter/s7-episodes/'+e.s+'/';},170);\n"
        "    N.textContent='Episode '+e.n;T.textContent=e.t;D.textContent=e.d;\n"
        "    ticks.forEach(function(tk,x){tk.setAttribute('aria-current',x===i?'true':'false');});}\n"
        "  f.addEventListener('load',function(){f.style.opacity=1;});\n"
        "  function go(n){i=(n%eps.length+eps.length)%eps.length;render();}\n"
        "  function play(){playing=true;P.innerHTML='❚❚';P.setAttribute('data-state','playing');P.setAttribute('aria-label','Pause');clearInterval(timer);timer=setInterval(function(){go(i+1);},INT);}\n"
        "  function pause(){playing=false;P.innerHTML='▶';P.setAttribute('data-state','paused');P.setAttribute('aria-label','Play');clearInterval(timer);}\n"
        "  P.addEventListener('click',function(){playing?pause():play();});\n"
        "  ticks.forEach(function(tk){tk.addEventListener('click',function(){pause();go(+tk.getAttribute('data-i'));});});\n"
        "  go(0);\n"
        "  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){play();}else{pause();}\n"
        "})();</script>"
    )
    return out + foot(script)

# --------------------------------------------------------------------- write
def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print("wrote", path.replace(REPO + "/", ""))

write(os.path.join(CD, "countdowns.css"), CSS)
write(os.path.join(CD, "index.html"), build_gallery())
for s in SHOWS:
    # a detail/archive page is only needed when there's more than the gallery already shows
    if not any(v.get("collapsed") or v.get("timeline") for v in s["versions"]):
        continue
    write(os.path.join(CD, s["slug"], "index.html"), build_show_index(s))
write(os.path.join(CD, "dexter", "s7-episodes", "index.html"), build_timeline())
print("\nShows:", SHOW_COUNT, "Total versions:", TOTAL)
