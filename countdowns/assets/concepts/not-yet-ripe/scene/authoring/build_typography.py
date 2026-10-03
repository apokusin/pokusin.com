"""Actual font candidates beside the source, with no baked countdown state."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib
ROOT=Path(__file__).resolve().parents[1];TYPE=ROOT/'typography';REPO=ROOT.parents[4]
def bodoni(size,weight=600):
    font=ImageFont.truetype(str(TYPE/'BodoniModa-variable.ttf'),size);font.set_variation_by_axes([weight,96]);return font
def condensed(size,weight=900):
    font=ImageFont.truetype(str(TYPE/'RobotoCondensed-variable.ttf'),size);font.set_variation_by_axes([weight]);return font
sheet=Image.new('RGB',(1800,1350),'#eee8d6');d=ImageDraw.Draw(sheet);label=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',26)
source=Image.open(REPO/'docs/countdown-concepts/references/not-yet-ripe.jpg');crop=source.crop((420,300,1220,570));crop.thumbnail((1540,350));sheet.paste(crop,(55,65));d.text((55,22),'Original specimen lettering / candidate below',font=label,fill='#342d25')
for i in range(10):d.text((90+i*166,535),str(i),font=condensed(220,850),fill='#382228',anchor='mm')
d.text((75,735),'D   H   M   S',font=bodoni(100,400),fill='#382228');d.text((820,730),'Again',font=bodoni(145),fill='#382228')
d.text((75,930),'COUNTDOWNS',font=condensed(190),fill='#231e1d');d.text((75,1170),'No timer or tally values are baked. Runtime reels select every real digit.',font=label,fill='#342d25')
sheet.save(TYPE/'type-candidate-sheet.jpg',quality=94)
meta={'status':'selected licensed candidates after actual browser font review; final fidelity gate pending','numerals':{'family':'Roboto Condensed','weight':850,'ink':'#382228','surface':'two-digit ink follows each genuine lobed cut-flesh mesh; native slots/reels remain live','source':'https://github.com/google/fonts/tree/main/ofl/robotocondensed','license':'OFL-RobotoCondensed.txt'},'labels':{'family':'Bodoni Moda','weight':400,'source':'https://github.com/google/fonts/tree/main/ofl/bodonimoda','license':'OFL-BodoniModa.txt'},'title':{'family':'Roboto Condensed','weight':900,'orientation':'physical vertical edge print, cropped before phone controls','source':'https://github.com/google/fonts/tree/main/ofl/robotocondensed','license':'OFL-RobotoCondensed.txt'},'fileSha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in TYPE.glob('*.ttf')}}
(TYPE/'manifest.json').write_text(json.dumps(meta,indent=2))
