"""Validate the static GLB and record measured geometry/texture budgets.

Python standard library handles inspection; Pillow optionally writes compact WebP.
No browser/runtime build depends on this offline authoring step.
"""
from pathlib import Path
import json, struct, hashlib, io, shutil

root=Path(__file__).resolve().parents[1]
raw=(root/'scene.glb').read_bytes()
magic, version, total=struct.unpack_from('<III',raw)
assert magic==0x46546c67 and version==2 and total==len(raw)
length, kind=struct.unpack_from('<II',raw,12)
assert kind==0x4e4f534a
gltf=json.loads(raw[20:20+length]); binary_start=20+length+8
accessors=gltf['accessors']
primitives=[p for m in gltf['meshes'] for p in m['primitives']]
for mesh in gltf['meshes']:
    for p in mesh['primitives']:
        assert accessors[p['attributes']['NORMAL']]['count']==accessors[p['attributes']['POSITION']]['count']
        assert 'TEXCOORD_0' in p['attributes'] or mesh['name']=='hidden_crown_mesh'
for name in ['clock_d','clock_h','clock_m','clock_s','archive_dexter_mount','archive_severance_mount','archive_got_mount','reset_ink','reset_tally','opening_camera']:
    assert any(n.get('name')==name for n in gltf['nodes']),name
textures=[]
for image in gltf['images']:
    view=gltf['bufferViews'][image['bufferView']]
    start=binary_start+view.get('byteOffset',0); end=start+view['byteLength']
    assert end<=len(raw)
    png=raw[start:end]; assert png[:8]==b'\x89PNG\r\n\x1a\n'
    width,height=struct.unpack_from('>II',png,16)
    textures.append({'name':image.get('name'),'size':[width,height],'encodedBytes':len(png),'decodedRGBABytes':width*height*4})
manifest=json.loads((root/'manifest.json').read_text())
manifest['exportMeasurements']={
    'meshes':len(gltf['meshes']),'primitives':len(primitives),
    'triangles':sum(accessors[p['indices']]['count']//3 for p in primitives),
    'tangentPrimitives':sum('TANGENT' in p['attributes'] for p in primitives),
    'decodedTextureRGBABytes':sum(i['decodedRGBABytes'] for i in textures),
    'textures':textures,'sha256':hashlib.sha256(raw).hexdigest(),
    'productionGate':'Geometry export validated; actual Three/source/mobile visual review pending',
}
try:
    from PIL import Image
    Image.open(root/'inspection/final-light.png').save(root/'fallback.webp',quality=88,method=6)
    manifest['fallback']='fallback.webp'
except ImportError:
    shutil.copy2(root/'inspection/final-light.png',root/'fallback.png')
    manifest['fallback']='fallback.png'
(root/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest['exportMeasurements'],indent=2))
