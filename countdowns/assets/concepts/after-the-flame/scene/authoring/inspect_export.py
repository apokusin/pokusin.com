"""Validate real scene inventory and report browser decoding budgets."""
from pathlib import Path
import json,struct,hashlib,math
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'manifest.json').read_text())
measurements={}
for file in ['scene.glb','scene-mobile.glb']:
    raw=(root/file).read_bytes();length=struct.unpack_from('<I',raw,12)[0]
    gltf=json.loads(raw[20:20+length]);binary=raw[28+length:]
    names={node.get('name') for node in gltf['nodes']}
    assert len(manifest['archives'])==13 and len(manifest['destinations'])==7
    required=manifest['clock']+[manifest['reset'],manifest['secret']]+[record[key] for record in manifest['archives'] for key in ['screen','caption']]+[entry['surface'] for entry in manifest['destinations']]
    assert not set(required)-names,sorted(set(required)-names)
    primitives=[primitive for mesh in gltf['meshes'] for primitive in mesh['primitives']]
    assert all(all(channel in primitive['attributes'] for channel in ['POSITION','NORMAL','TEXCOORD_0','TANGENT']) for primitive in primitives)
    morphs=[mesh for mesh in gltf['meshes'] if mesh['primitives'][0].get('targets')]
    assert len(morphs)==8
    textures=[]
    for image in gltf.get('images',[]):
        view=gltf['bufferViews'][image['bufferView']];start=view.get('byteOffset',0);data=binary[start:start+view['byteLength']]
        assert data[:8]==b'\x89PNG\r\n\x1a\n'
        width,height=struct.unpack_from('>II',data,16)
        textures.append({'name':image.get('name'),'dimensions':[width,height],'decodedRGBABytes':width*height*4})
    measurements[file]={'encodedBytes':len(raw),'triangles':sum(gltf['accessors'][p['indices']]['count']//3 for p in primitives),'primitives':len(primitives),'normalUVTangentPrimitives':len(primitives),'morphMeshes':len(morphs),'decodedEmbeddedRGBABytes':sum(t['decodedRGBABytes'] for t in textures),'textures':textures,'sha256':hashlib.sha256(raw).hexdigest()}
    if file=='scene.glb':
        camera=next(c for c in gltf['cameras'] if c['name']=='reference_macro_camera')
        manifest['camera']['fov']=math.degrees(camera['perspective']['yfov'])
        manifest['camera']['exportedYFovRadians']=camera['perspective']['yfov']
        manifest['camera']['authoredAspectRatio']=camera['perspective']['aspectRatio']
manifest['exportMeasurements']=measurements
manifest['productionGate']='Inventory/geometry clearance validated; independent source/browser/mobile material acceptance remains required'
(root/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({file:{k:v for k,v in measurement.items() if k!='textures'} for file,measurement in measurements.items()},indent=2))
