"""8-bit normals / 16-bit tangents and UVs; exact positions and morph deltas.

Uses ratified KHR_mesh_quantization already supported by the vendored loader.
No decoder, decompression dependency, transformed position, or visual LOD.
https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_mesh_quantization
"""
from pathlib import Path
import json,struct,math

def pack(path):
    raw=Path(path).read_bytes();length=struct.unpack_from('<I',raw,12)[0]
    gltf=json.loads(raw[20:20+length]);binary=raw[28+length:]
    accessors=gltf['accessors'];views=gltf['bufferViews']
    eligible={}
    for mesh in gltf['meshes']:
        for primitive in mesh['primitives']:
            for semantic,index in primitive['attributes'].items():
                if semantic in ['NORMAL','TANGENT','TEXCOORD_0']:eligible[index]=semantic
    additions=[]
    for index,semantic in eligible.items():
        accessor=accessors[index]
        if accessor['componentType'] not in [5126,5122] or 'sparse' in accessor:continue
        if accessor['componentType']==5122 and semantic!='NORMAL':continue
        dimensions={'VEC2':2,'VEC3':3,'VEC4':4}[accessor['type']]
        float_source=accessor['componentType']==5126
        source_bytes=4 if float_source else 2
        view=views[accessor['bufferView']];stride=view.get('byteStride',dimensions*source_bytes)
        start=view.get('byteOffset',0)+accessor.get('byteOffset',0)
        values=[struct.unpack_from('<'+('f' if float_source else 'h')*dimensions,binary,start+i*stride) for i in range(accessor['count'])]
        if not float_source:values=[tuple(max(-1,v/32767) for v in row) for row in values]
        if semantic=='TEXCOORD_0' and any(v<0 or v>1 for row in values for v in row):continue
        normal=semantic=='NORMAL'
        scale=65535 if semantic=='TEXCOORD_0' else (127 if normal else 32767)
        signed=semantic!='TEXCOORD_0';packed=bytearray()
        for row in values:
            encoded=[max(-scale if signed else 0,min(scale,round(v*scale))) for v in row]
            packed.extend(struct.pack('<'+('b' if normal else ('h' if signed else 'H'))*dimensions,*encoded))
            if dimensions==3:packed.extend(b'\0' if normal else b'\0\0')
        accessor['componentType']=5120 if normal else (5122 if signed else 5123);accessor['normalized']=True
        accessor.pop('byteOffset',None)
        for bound in ['min','max']:
            if bound in accessor:accessor[bound]=[round(v*scale) for v in accessor[bound]]
        accessor['bufferView']=len(views)+len(additions)
        additions.append(({'buffer':0,'byteLength':len(packed),'target':34962,**({'byteStride':4 if normal else 8} if dimensions==3 else {})},bytes(packed)))
    original_views=len(views)
    views.extend(view for view,data in additions)
    used={accessor['bufferView'] for accessor in accessors if 'bufferView' in accessor}
    used.update(image['bufferView'] for image in gltf.get('images',[]) if 'bufferView' in image)
    for accessor in accessors:
        if 'sparse' in accessor:
            used.update(accessor['sparse'][key]['bufferView'] for key in ['indices','values'])
    output=bytearray();new_views=[];remap={}
    for index,view in enumerate(views):
        if index not in used:continue
        output.extend(b'\0'*((-len(output))%4));remap[index]=len(new_views)
        data=(binary[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']] if index<original_views else additions[index-original_views][1])
        new_views.append({**view,'buffer':0,'byteOffset':len(output)});output.extend(data)
    for accessor in accessors:
        if 'bufferView' in accessor:accessor['bufferView']=remap[accessor['bufferView']]
        if 'sparse' in accessor:
            for key in ['indices','values']:accessor['sparse'][key]['bufferView']=remap[accessor['sparse'][key]['bufferView']]
    for image in gltf.get('images',[]):
        if 'bufferView' in image:image['bufferView']=remap[image['bufferView']]
    gltf['bufferViews']=new_views;gltf['buffers']=[{'byteLength':len(output)}]
    for key in ['extensionsUsed','extensionsRequired']:
        gltf.setdefault(key,[])
        if 'KHR_mesh_quantization' not in gltf[key]:gltf[key].append('KHR_mesh_quantization')
    document=json.dumps(gltf,separators=(',',':')).encode();document+=b' '*((-len(document))%4)
    output.extend(b'\0'*((-len(output))%4))
    result=struct.pack('<III',0x46546c67,2,28+len(document)+len(output))+struct.pack('<II',len(document),0x4e4f534a)+document+struct.pack('<II',len(output),0x004e4942)+output
    Path(path).write_bytes(result)
    print('ROADWORKS_PACKED',len(raw),'→',len(result))

if __name__=='__main__':pack(Path(__file__).resolve().parents[1]/'scene.glb')
