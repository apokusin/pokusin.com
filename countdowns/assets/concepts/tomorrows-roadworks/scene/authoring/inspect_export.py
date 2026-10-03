"""Inspect reproducible static scene geometry; never substitutes for browser review."""
from pathlib import Path
import json, struct, hashlib

root=Path(__file__).resolve().parents[1]
raw=(root/'scene.glb').read_bytes()
magic,version,total=struct.unpack_from('<III',raw)
assert magic==0x46546c67 and version==2 and total==len(raw)
length,kind=struct.unpack_from('<II',raw,12)
assert kind==0x4e4f534a
gltf=json.loads(raw[20:20+length]);binary_start=20+length+8
manifest=json.loads((root/'manifest.json').read_text())
accessors=gltf['accessors'];primitives=[p for m in gltf['meshes'] for p in m['primitives']]
required=manifest['clock']+[manifest[key] for key in ['heading','action','tally','roll','lip','crown','feed','truck','road']]
required += [record[key] for record in manifest['archives'] for key in ['screen','caption','mount']]
required += [record['node'] for record in manifest['destinations']]
names={node.get('name') for node in gltf['nodes']}
assert not set(required)-names,sorted(set(required)-names)
assert len(manifest['archives'])==13 and len({record['id'] for record in manifest['archives']})==13
assert len(manifest['destinations'])==7
for primitive in primitives:
    attributes=primitive['attributes']
    assert all(key in attributes for key in ['POSITION','NORMAL','TEXCOORD_0','TANGENT']),attributes.keys()
    assert accessors[attributes['POSITION']]['count']==accessors[attributes['NORMAL']]['count']
feed_node=next(node for node in gltf['nodes'] if node.get('name')==manifest['feed'])
feed=gltf['meshes'][feed_node['mesh']]
assert feed['extras']['targetNames']==manifest['feedMorphs']
assert len(feed['primitives'][0]['targets'])==2
textures=[]
for image in gltf['images']:
    view=gltf['bufferViews'][image['bufferView']];start=binary_start+view.get('byteOffset',0)
    data=raw[start:start+view['byteLength']]
    assert data[:8]==b'\x89PNG\r\n\x1a\n'
    width,height=struct.unpack_from('>II',data,16)
    textures.append({'name':image.get('name'),'size':[width,height],'encodedBytes':len(data),'decodedRGBABytes':width*height*4})
manifest['exportMeasurements']={
    'meshes':len(gltf['meshes']),'primitives':len(primitives),
    'triangles':sum(accessors[p['indices']]['count']//3 for p in primitives),
    'tangentPrimitives':sum('TANGENT' in p['attributes'] for p in primitives),
    'textures':textures,'decodedTextureRGBABytes':sum(image['decodedRGBABytes'] for image in textures),
    'encodedGLBBytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),
    'productionGate':'Complete geometry/surface inventory validated; independent source/browser/mobile visual acceptance remains required'
}
manifest['typography']={'family':'Roboto Condensed','file':'typography/RobotoCondensed-variable.ttf','license':'typography/OFL-RobotoCondensed.txt','origin':'https://github.com/google/fonts/tree/main/ofl/robotocondensed','download':'https://raw.githubusercontent.com/google/fonts/main/ofl/robotocondensed/RobotoCondensed%5Bwght%5D.ttf','usage':'Industrial numerals, units and station captions; Georgia supplies Again only'}
manifest['fallback']='fallback.webp'
camera_node=next(node for node in gltf['nodes'] if node.get('name')==manifest['camera']['node'])
camera=gltf['cameras'][camera_node['camera']]
manifest['camera']['exportedQuaternion']=camera_node.get('rotation',[0,0,0,1])
manifest['camera']['exportedYFovRadians']=camera['perspective']['yfov']
manifest['camera']['authoredAspectRatio']=camera['perspective'].get('aspectRatio')
(root/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest['exportMeasurements'],indent=2))
