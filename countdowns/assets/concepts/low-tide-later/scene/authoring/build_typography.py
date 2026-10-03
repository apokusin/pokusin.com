"""Licensed type masters and source/candidate sheet. Pillow; no live values baked."""
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1];TYPE=ROOT/'typography';repo=ROOT.parents[4]
def serif(size):
 f=ImageFont.truetype(str(TYPE/'BodoniModa-variable.ttf'),size);f.set_variation_by_axes([400,96]);return f
def sans(size):
 f=ImageFont.truetype(str(TYPE/'RobotoCondensed-variable.ttf'),size);f.set_variation_by_axes([500]);return f
ink=(17,63,115,255);cell=(384,512);atlas=Image.new('RGBA',(cell[0]*10,cell[1]),(0,0,0,0));d=ImageDraw.Draw(atlas);f=serif(545)
for i in range(10):
 # A complete isolated cell is larger than the widest glyph, including its serifs.
 b=d.textbbox((0,0),str(i),font=f)
 assert b[2]-b[0]<cell[0]-24 and b[3]-b[1]<cell[1]-24,(i,b)
 glyph=Image.new('RGBA',cell,(0,0,0,0));gd=ImageDraw.Draw(glyph)
 gd.text(((cell[0]-b[2]-b[0])/2,(cell[1]-b[3]-b[1])/2),str(i),font=f,fill=ink)
 assert glyph.getbbox()[0]>0 and glyph.getbbox()[2]<cell[0],i
 atlas.alpha_composite(glyph,(i*cell[0],0))
atlas.save(TYPE/'chalk-glyphs.png')
f=sans(180);box=f.getbbox('Countdowns');title=Image.new('RGBA',(box[2]+28,box[3]-box[1]+28),(0,0,0,0));d=ImageDraw.Draw(title);d.text((14,14-box[1]),'Countdowns',font=f,fill=ink);title=title.rotate(-90,expand=True);title.save(TYPE/'title-countdowns.png')
sheet=Image.new('RGB',(1800,1320),(233,240,237));d=ImageDraw.Draw(sheet);label=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',26)
reference=Image.open(repo/'docs/countdown-concepts/references/low-tide-later.jpg').convert('RGB');crop=reference.crop((160,150,963,570));crop.thumbnail((900,480));sheet.paste(crop,(25,65));d.text((25,25),'ORIGINAL CHALK NUMERALS — curved material context',font=label,fill='#113f73')
candidate=atlas.copy();candidate.thumbnail((1745,310));sheet.paste(candidate,(25,585),candidate);d.text((25,530),'BODONI MODA 400 / optical size 96 — all ten complete glyphs',font=label,fill='#113f73')
f=serif(105);d.text((25,935),'D  H  M  S     Again     0123456789',font=f,fill='#113f73')
tcrop=reference.crop((1406,20,1464,284));tcrop.thumbnail((100,420));sheet.paste(tcrop,(1115,65));t=title.copy();t.thumbnail((125,450));sheet.paste(t,(1280,65),t)
d.text((955,535),'Original / Roboto Condensed 500 title',font=label,fill='#113f73');d.text((25,1140),'High contrast, uncompressed serif silhouettes; blue ink on actual chalk curvature.',font=label,fill='#113f73');d.text((25,1190),'Static atlas carries glyph shapes only. Real reel plans choose and animate values.',font=label,fill='#113f73');d.text((25,1240),'SIL Open Font License retained; serif/sans font files bundled for captions and Again.',font=label,fill='#113f73')
sheet.save(TYPE/'type-candidate-sheet.jpg',quality=92)
meta={'status':'source/candidate sheet; independent browser type gate pending','numerals':{'family':'Bodoni Moda','axes':{'wght':400,'opsz':96},'font':'BodoniModa-variable.ttf','license':'OFL-BodoniModa.txt','atlas':'chalk-glyphs.png','cell':list(cell),'cells':10,'fontPixels':545,'baseline':'complete individually isolated cells, centered; proportional runtime fit','source':'https://github.com/google/fonts/tree/main/ofl/bodonimoda'},'title':{'family':'Roboto Condensed','weight':500,'font':'RobotoCondensed-variable.ttf','license':'OFL-RobotoCondensed.txt','master':'title-countdowns.png','source':'https://github.com/google/fonts/tree/main/ofl/robotocondensed'},'captions':{'family':'Caveat','weight':400,'font':'Caveat-variable.ttf','license':'OFL-Caveat.txt','source':'https://github.com/google/fonts/tree/main/ofl/caveat'},'fileSha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in TYPE.glob('*.ttf')}}
(TYPE/'manifest.json').write_text(json.dumps(meta,indent=2));print('TIDE_TYPE_COMPLETE')
