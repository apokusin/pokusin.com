"""Render licensed source-matching candidate masters. Requires Pillow.
The title contains no state; numeral atlas is glyph artwork, not a timer.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json, hashlib
ROOT=Path(__file__).resolve().parents[1]
TYPE=ROOT/'typography'
fontpath=TYPE/'BodoniModa-variable.ttf';sanspath=TYPE/'RobotoCondensed-variable.ttf'
def serif(size,weight=400,optical=96):
 f=ImageFont.truetype(str(fontpath),size);f.set_variation_by_axes([weight,optical]);return f
def sans(size,weight=900):
 f=ImageFont.truetype(str(sanspath),size);f.set_variation_by_axes([weight]);return f
font=serif(520)
box=font.getbbox('Countdowns');master=Image.new('RGBA',(box[2]+70,box[3]-box[1]+70),(0,0,0,0));draw=ImageDraw.Draw(master);draw.text((35,35-box[1]),'Countdowns',font=font,fill=(16,18,15,255));master.save(TYPE/'title-countdowns.png')
# Ten complete glyph cells with comfortable curved face margins; caller picks real values.
atlas=Image.new('RGBA',(1600,256),(0,0,0,0));d=ImageDraw.Draw(atlas);f=sans(214)
for i in range(10):
 b=d.textbbox((0,0),str(i),font=f);d.text((i*160+(160-(b[2]-b[0]))/2,128-(b[3]+b[1])/2),str(i),font=f,fill=(16,18,15,255))
atlas.save(TYPE/'drum-glyphs.png')
sheet=Image.new('RGB',(1800,1380),(214,234,201));d=ImageDraw.Draw(sheet);label=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',26)
repo=ROOT.parents[4]
ref=Image.open(repo/'docs/countdown-concepts/references/bubblegum-time.jpg').convert('RGB')
refcrop=ref.crop((0,622,890,1058));refcrop.thumbnail((855,425));sheet.paste(refcrop,(30,65));d.text((30,25),'ORIGINAL TITLE — silhouette/crop reference',font=label,fill='#10120F')
# Candidate is not stretched. Source diagonal belongs to actual world mesh placement.
preview=Image.new('RGBA',(900,450),(0,0,0,0));small=master.copy();small.thumbnail((835,380));preview.alpha_composite(small,(25,35));sheet.paste(preview,(900,60),preview);d.text((930,25),'BODONI MODA 400 / optical size 96',font=label,fill='#10120F')
d.text((30,530),'Heavy curved-drum glyph candidate — Roboto Condensed 900',font=label,fill='#10120F');glyph=atlas.copy();glyph.thumbnail((1720,276));sheet.paste(glyph,(30,575),glyph)
f=serif(100);d.text((30,895),'D  H  M  S     Again     0123456789',font=f,fill='#10120F')
d.text((30,1070),'Drum/source crop beside candidate; archived screenshots remain faithful.',font=label,fill='#10120F')
refdrum=ref.crop((337,365,1056,622));refdrum.thumbnail((730,260));sheet.paste(refdrum,(30,1110))
d.text((840,1120),'Candidate locks:',font=label,fill='#10120F');d.text((840,1160),'Title: uncompressed upright glyphs; world-plane angle/crop.',font=label,fill='#10120F');d.text((840,1200),'Drums: heavy condensed, full ten-glyph atlas; curved UVs.',font=label,fill='#10120F');d.text((840,1240),'License: SIL Open Font License; font files included.',font=label,fill='#10120F')
sheet.save(TYPE/'type-candidate-sheet.jpg',quality=92)
meta={'status':'candidate requiring independent reference/browser review','title':{'family':'Bodoni Moda','axes':{'wght':400,'opsz':96},'master':'title-countdowns.png','license':'OFL-BodoniModa.txt','font':'BodoniModa-variable.ttf','source':'https://github.com/google/fonts/tree/main/ofl/bodonimoda','glyphTreatment':'No digital stretching; high-contrast hairlines and ball terminals retained; world mesh rotation/crop sets composition.'},'drums':{'family':'Roboto Condensed','axes':{'wght':900},'master':'drum-glyphs.png','cell':[160,256],'cells':10,'license':'OFL-RobotoCondensed.txt','font':'RobotoCondensed-variable.ttf','source':'https://github.com/google/fonts/tree/main/ofl/robotocondensed'},'files':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in TYPE.glob('*.ttf')}}
(TYPE/'manifest.json').write_text(json.dumps(meta,indent=2))
print('TYPE_CANDIDATE_COMPLETE')
