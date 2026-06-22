#!/usr/bin/env python3
"""Generate the /countdowns archive: gallery, per-show details (with collapsible
archived variants), and the Dexter Season 7 timeline scrubber."""
import os, html, json, hashlib

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

# ---------------------------------------------------------------------- CSS
CSS = """:root{
  --bg:#e6ebf0; --fg:#102132; --muted:#5b6b7a;
  --card:#ffffff; --line:rgba(16,33,50,.10); --line-strong:rgba(16,33,50,.20);
  --chip:rgba(16,33,50,.06); --live:#1f9d57; --accent:#9a1d2e;
  --shadow:0 1px 2px rgba(16,33,50,.05),0 8px 24px rgba(16,33,50,.07);
  --shadow-hover:0 2px 6px rgba(16,33,50,.08),0 18px 48px rgba(16,33,50,.14);
  --radius:16px;
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
.shelf-aside{display:flex;flex-direction:column;align-items:flex-start;max-width:100%}
.shelf-id{display:flex;align-items:center;gap:9px}
.shelf-emoji{font-size:1.25rem;line-height:1;flex:0 0 auto}
.shelf-name{font-size:clamp(1rem,2.2vw,1.18rem);font-weight:650;letter-spacing:-.02em;white-space:nowrap}
.shelf-years{margin-top:9px;font-size:.78rem;color:var(--muted);font-variant-numeric:tabular-nums}
.shelf-domain{display:inline-block;margin-top:3px;font-size:.74rem;color:var(--muted);word-break:break-word;transition:color .15s ease}
a.shelf-domain:hover{color:var(--fg)}
.shelf .more{margin-top:18px}
.shelf .grid{grid-template-columns:repeat(auto-fill,minmax(228px,1fr))}
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
  .shelf{grid-template-columns:1fr;gap:16px}
}
@media (max-width:560px){
  .grid{grid-template-columns:1fr}
  .show-meta{margin-left:0;text-align:left;width:100%}
  .tl-cap .d{margin-left:0;width:100%}
  .tl-tick .en{font-size:.6rem}
}
@media (prefers-reduced-motion:reduce){
  .card,.more,.more .arrow,.frame .open,.tl-stage iframe,.tl-tick .dot{transition:none}
  .chip::before{animation:none}
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

OVERLAY_HTML = """  <div class="ov" id="ov" hidden aria-hidden="true">
    <div class="ov-backdrop" data-close></div>
    <div class="ov-dialog" role="dialog" aria-modal="true" aria-label="Countdown preview">
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
  var srcCard=null,DUR=440,EASE='cubic-bezier(.2,.8,.2,1)',ft=null;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  frame.addEventListener('load',function(){ if((frame.src||'').indexOf('about:blank')<0) frame.classList.add('loaded'); });
  function map(card){ // uniform scale + translate so the dialog starts centered on the card frame
    var dr=dialog.getBoundingClientRect(), cr=card.querySelector('.frame').getBoundingClientRect();
    var s=cr.width/dr.width;
    return 'translate('+((cr.left+cr.width/2)-(dr.left+dr.width/2))+'px,'+((cr.top+cr.height/2)-(dr.top+dr.height/2))+'px) scale('+s+')';
  }
  function openFrom(card){
    srcCard=card; var url=card.getAttribute('href');
    frame.classList.remove('loaded'); frame.src=url; openLink.href=url;
    var lab=card.querySelector('.label'); if(cap) cap.textContent=lab?lab.textContent:'';
    ov.hidden=false; ov.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('ov-lock'); ov.classList.add('open');
    if(reduce){ dialog.style.opacity='1'; closeBtn.focus(); return; }
    dialog.style.transition='none'; dialog.style.transformOrigin='50% 50%'; dialog.style.willChange='transform,opacity';
    dialog.style.transform=map(card); dialog.style.opacity='0';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      dialog.style.transition='transform '+DUR+'ms '+EASE+',opacity '+Math.round(DUR*0.55)+'ms ease';
      dialog.style.transform='translate(0,0) scale(1)'; dialog.style.opacity='1';
    }); });
    var end=function(ev){ if(ev.propertyName&&ev.propertyName!=='transform') return; dialog.style.willChange=''; dialog.style.transition=''; dialog.removeEventListener('transitionend',end); closeBtn.focus(); };
    dialog.addEventListener('transitionend',end);
  }
  function finish(){
    clearTimeout(ft); ov.hidden=true; ov.setAttribute('aria-hidden','true'); ov.classList.remove('open');
    dialog.style.transition=''; dialog.style.transform=''; dialog.style.opacity=''; dialog.style.willChange='';
    frame.classList.remove('loaded'); frame.src='about:blank';
    document.documentElement.classList.remove('ov-lock');
    if(srcCard){ try{ srcCard.focus({preventScroll:true}); }catch(e){} } srcCard=null;
  }
  function close(){
    if(ov.hidden) return;
    if(reduce||!srcCard){ dialog.style.opacity='0'; ov.classList.remove('open'); ft=setTimeout(finish,reduce?180:220); return; }
    dialog.style.willChange='transform,opacity'; dialog.style.transformOrigin='50% 50%';
    dialog.style.transition='transform '+DUR+'ms '+EASE+',opacity '+Math.round(DUR*0.7)+'ms ease';
    ov.classList.remove('open');
    dialog.style.transform=map(srcCard); dialog.style.opacity='0';
    var end=function(ev){ if(ev.propertyName&&ev.propertyName!=='transform') return; dialog.removeEventListener('transitionend',end); finish(); };
    dialog.addEventListener('transitionend',end);
    ft=setTimeout(finish,DUR+160);
  }
  document.querySelectorAll('a.card').forEach(function(c){
    c.addEventListener('click',function(e){
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0) return;
      e.preventDefault(); openFrom(c);
    });
  });
  ov.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click',close); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!ov.hidden) close(); });
})();</script>"""

NAV_JS = """<script>(function(){
  var nav=document.querySelector('.shownav'); if(!nav||!('IntersectionObserver' in window)) return;
  var links={}; nav.querySelectorAll('a').forEach(function(a){ links[a.getAttribute('href').slice(1)]=a; });
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(!e.isIntersecting) return; var id=e.target.id;
      Object.keys(links).forEach(function(k){ links[k].setAttribute('aria-current', k===id?'true':'false'); });
      var act=links[id]; if(act && nav.scrollWidth>nav.clientWidth) act.scrollIntoView({inline:'center',block:'nearest'});
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('.shelf').forEach(function(sec){ io.observe(sec); });
})();</script>"""

CSS_VER = hashlib.md5(CSS.encode("utf-8")).hexdigest()[:8]
FAVICON = '<link href="https://gravatar.com/avatar/5c858c5daef12e779828769ee705f46b?s=64" rel="shortcut icon">'

def esc(s):
    return html.escape(s, quote=True)

def head(title, extra_head=""):
    return (
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n"
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

def card(show_slug, v, zoom=4):
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
    return (
        f'      <a class="card" href="{base}" target="_blank" rel="noopener">\n'
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

def grid(show_slug, versions, zoom=4):
    return '      <div class="grid">\n' + "".join(card(show_slug, v, zoom) for v in versions) + '      </div>\n'

# --------------------------------------------------------------- gallery
def build_gallery():
    out = head("Countdowns · Artur Pokusin")
    out += '    <div class="crumb"><a href="/">pokusin.com</a><span class="sep">/</span>countdowns</div>\n'
    out += '    <div class="eyebrow">An archive · 2012 – 2025</div>\n'
    out += '    <h1 class="title">Countdowns</h1>\n'
    out += ('    <p class="lede">A collection of TV-show countdown sites I '
            'handcrafted between 2012 and 2025. Every illustration and line of '
            "code was made by hand, and they're all still ticking.</p>\n")
    out += '    <nav class="shownav" aria-label="Shows">\n'
    for s in SHOWS:
        out += (f'      <a href="#{s["slug"]}"><span class="nv-e">{s["emoji"]}</span>'
                f'<span class="nv-n">{esc(s["name"])}</span></a>\n')
    out += '    </nav>\n'
    for s in SHOWS:
        shown = [v for v in s["versions"] if not v.get("collapsed") and not v.get("timeline")]
        collapsed = [v for v in s["versions"] if v.get("collapsed") and not v.get("timeline")]
        has_more = bool(collapsed) or any(v.get("timeline") for v in s["versions"])
        if s["live"]:
            dom = (f'<a class="shelf-domain" href="https://{s["domain"]}" target="_blank" '
                   f'rel="noopener">{esc(s["domain"])} ↗</a>')
        else:
            dom = f'<span class="shelf-domain">{esc(s["domain"])}</span>'
        out += f'    <section class="shelf" id="{s["slug"]}">\n      <div class="shelf-aside">\n'
        out += (f'        <div class="shelf-id"><span class="shelf-emoji">{s["emoji"]}</span>'
                f'<span class="shelf-name">{esc(s["name"])}</span></div>\n')
        out += f'        <div class="shelf-years">{esc(s["years"])}</div>\n'
        out += f'        {dom}\n'
        if has_more:
            out += (f'        <a class="more" href="/countdowns/{s["slug"]}/">'
                    f'More <span class="arrow">→</span></a>\n')
        out += '      </div>\n'
        out += grid(s["slug"], shown, s.get("preview_zoom", 4))
        out += '    </section>\n'
    return out + foot(OVERLAY_HTML + OVERLAY_JS + NAV_JS)

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
    return out + foot(OVERLAY_HTML + OVERLAY_JS + NAV_JS)

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
