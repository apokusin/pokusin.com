"""Refine the reviewed miniature in place; never regenerate its composition.

Blender 4.5.14 LTS. All reading faces, articulated parts, feed targets, archive
mounts and camera transforms are preserved. Macro erosion and botanical mass
are geometry; matched fine relief is authored colour/linear surface data.
"""
import bpy, bmesh, math, random, json, hashlib, importlib.util, sys, struct, itertools, tempfile
import numpy as np
from pathlib import Path
from mathutils import Vector, noise

ROOT = Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'authoring'/'scene.blend'))
scene = bpy.context.scene
manifest = json.loads((ROOT/'manifest.json').read_text())
semantic_names = set(manifest['clock']+[manifest[k] for k in ['heading','action','tally','roll','lip','crown','feed','truck','road']])
semantic_names |= {r[k] for r in manifest['archives'] for k in ['screen','caption','mount']}
semantic_names |= {r['node'] for r in manifest['destinations']}

def signature(obj):
    h=hashlib.sha256()
    h.update(np.asarray(obj.matrix_world,dtype=np.float64).tobytes())
    if obj.type=='MESH':
        h.update(np.asarray([tuple(v.co) for v in obj.data.vertices],dtype=np.float32).tobytes())
        h.update(str([tuple(p.vertices) for p in obj.data.polygons]).encode())
        if obj.data.shape_keys:
            for key in obj.data.shape_keys.key_blocks:
                h.update(key.name.encode());h.update(np.asarray([tuple(v.co) for v in key.data],dtype=np.float32).tobytes())
        for uv in obj.data.uv_layers:
            h.update(np.asarray([tuple(v.uv) for v in uv.data],dtype=np.float32).tobytes())
    return h.hexdigest()

bpy.context.view_layer.update()
before={n:signature(bpy.data.objects[n]) for n in semantic_names}
before_camera=signature(scene.camera)

# Periodic coherent mineral fields, independent of microscopic grain. Each
# octave wraps, so repeats have no seams and no unrelated sine stripe normals.
SIZE=512
generator=np.random.default_rng(72819)
def field(cells):
    grid=generator.random((cells,cells))
    coordinates=np.arange(SIZE)*cells/SIZE
    low=np.floor(coordinates).astype(int);t=coordinates-low;t=t*t*(3-2*t)
    a=grid[low[:,None]%cells,low[None,:]%cells]
    b=grid[low[:,None]%cells,(low[None,:]+1)%cells]
    c=grid[(low[:,None]+1)%cells,low[None,:]%cells]
    d=grid[(low[:,None]+1)%cells,(low[None,:]+1)%cells]
    return (a*(1-t[None,:])+b*t[None,:])*(1-t[:,None])+(c*(1-t[None,:])+d*t[None,:])*t[:,None]
macro=.51*field(8)+.28*field(23)+.14*field(61)+.07*field(157)
medium=field(49)
grain=generator.random((SIZE,SIZE))
pore=generator.random((SIZE,SIZE))
pits=np.maximum(0,(pore-.976)/.024)
mineral=np.clip((medium-.64)*4,0,1)

def write_map(name,values,colour=False):
    im=bpy.data.images.get(name)
    if im is None:im=bpy.data.images.new(name,width=SIZE,height=SIZE,alpha=False)
    if im.packed_file:im.unpack(method='REMOVE')
    if tuple(im.size)!=(SIZE,SIZE):im.scale(SIZE,SIZE)
    # Set colour interpretation BEFORE assigning pixels: changing a generated
    # image's interpretation afterwards can invalidate its pixel buffer.
    im.colorspace_settings.name='sRGB' if colour else 'Non-Color'
    values=np.clip(values,0,1)
    if values.ndim==2:values=np.repeat(values[:,:,None],3,axis=2)
    rgba=np.concatenate([values,np.ones((SIZE,SIZE,1))],axis=2).astype(np.float32)
    im.pixels.foreach_set(rgba.ravel());im.update()
    im.filepath_raw=str(ROOT/'materials'/f'{name}.png');im.file_format='PNG';im.save();im.reload();im.pack()
    return im

def normal_map(height,strength):
    dx=(np.roll(height,-1,axis=1)-np.roll(height,1,axis=1))*strength
    dy=(np.roll(height,-1,axis=0)-np.roll(height,1,axis=0))*strength
    z=np.ones_like(height);length=np.sqrt(dx*dx+dy*dy+z*z)
    return np.stack([-.5*dx/length+.5,-.5*dy/length+.5,.5*z/length+.5],axis=2)

stone_shade=.84+(macro-.5)*.13+(grain-.5)*.038-pits*.075
stone_albedo=np.stack([stone_shade,stone_shade*.79+.013*mineral,stone_shade*.67+.015*mineral],axis=2)
write_map('salmon_limestone_albedo',stone_albedo,True)
write_map('limestone_roughness',.83+(macro-.5)*.16+(grain-.5)*.08+pits*.04)
height=(macro-.5)*.12+(medium-.5)*.050+(grain-.5)*.021-pits*.047
write_map('limestone_normal',normal_map(height,8.0))
cream=.82+(macro-.5)*.075+(grain-.5)*.027-pits*.075
write_map('weathered_precast_albedo',np.stack([cream,cream*.96,cream*.88],axis=2),True)
coastal=.79+(macro-.5)*.11+(grain-.5)*.045-pits*.055
sediment_image=write_map('coastal_sediment_albedo',np.stack([coastal,coastal*.82,coastal*.71],axis=2),True)

for material in bpy.data.materials:
    if not material.use_nodes:continue
    p=material.node_tree.nodes.get('Principled BSDF')
    if material.name=='salmon_quarried_limestone' or 'weathered_concrete' in material.name or material.name=='aged_precast_concrete':
        p.inputs['Base Color'].default_value=(1,1,1,1)
        for node in material.node_tree.nodes:
            if node.type=='NORMAL_MAP':node.inputs['Strength'].default_value=.55 if 'concrete' in material.name else .46
    if material.name in ['crack_succulent_yellow_green','sunlit_leaf_tips','bush_inner_olive']:
        palette={'crack_succulent_yellow_green':(.19,.29,.023),'sunlit_leaf_tips':(.34,.43,.035),'bush_inner_olive':(.095,.165,.012)}
        p.inputs['Base Color'].default_value=(*palette[material.name],1);p.inputs['Roughness'].default_value=.82
    if material.name=='orange_machine_enamel':
        p.inputs['Roughness'].default_value=.18;p.inputs['Metallic'].default_value=.12
        p.inputs['Coat Weight'].default_value=.94;p.inputs['Coat Roughness'].default_value=.055

stone=bpy.data.materials['salmon_quarried_limestone']
ground=bpy.data.objects['sculpted_coastal_bed']
sediment=bpy.data.materials.get('coastal_quarry_sediment') or stone.copy()
sediment.name='coastal_quarry_sediment'
for node in sediment.node_tree.nodes:
    if node.type=='TEX_IMAGE' and node.image and node.image.name=='salmon_limestone_albedo':node.image=sediment_image
    if node.type=='NORMAL_MAP':node.inputs['Strength'].default_value=.72
ground.data.materials.clear();ground.data.materials.append(sediment)

# Additional ground samples carry low erosion troughs, rather than a new noisy
# displacement under the clock. The broad original coast and support heights
# stay intact. Texture grains live at a measured 4 m repeat in world space.
if not scene.get('coastal_art_relief_applied'):
    bm=bmesh.new();bm.from_mesh(ground.data)
    bmesh.ops.subdivide_edges(bm,edges=list(bm.edges),cuts=1,use_grid_fill=True)
    bm.to_mesh(ground.data);bm.free()
    for vertex in ground.data.vertices:
        x,y,z=vertex.co
        if z>-.40:
            coarse=noise.noise(Vector((x*.72,y*.72,3.81)),noise_basis='PERLIN_ORIGINAL')
            trough=max(0,noise.noise(Vector((x*.33,y*.46,2.2)),noise_basis='PERLIN_ORIGINAL')-.10)
            vertex.co.z+=.030*coarse-.08*trough
    scene['coastal_art_relief_applied']=True
layer=ground.data.uv_layers.active or ground.data.uv_layers.new(name='UVMap')
for loop in ground.data.loops:
    point=ground.data.vertices[loop.vertex_index].co;layer.data[loop.index].uv=(point.x/4,point.y/4)
for polygon in ground.data.polygons:polygon.use_smooth=True
ground.data.update()

def make_mesh(name,verts,faces,material):
    data=bpy.data.meshes.new(name+'_refined_mesh');data.from_pydata(verts,[],faces);data.update()
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);data.materials.append(material)
    return obj

def face_uv(data):
    layer=data.uv_layers.new(name='UVMap')
    for polygon in data.polygons:
        axes=sorted(range(3),key=lambda axis:abs(polygon.normal[axis]))[:2]
        points=[data.vertices[data.loops[index].vertex_index].co for index in polygon.loop_indices]
        lo=[min(point[axis] for point in points) for axis in axes];hi=[max(point[axis] for point in points) for axis in axes]
        for index,point in zip(polygon.loop_indices,points):layer.data[index].uv=[(point[axis]-lo[k])/max(.000001,hi[k]-lo[k]) for k,axis in enumerate(axes)]

# Broken coral limestone: intersecting fracture planes and eroded pockets, while
# keeping every reviewed rock's exact bounds. No stacked rings or soft potatoes.
rock_bases=[]
for obj in sorted((o for o in scene.objects if o.name.startswith('cleft_stratified_boulder_')),key=lambda o:int(o.name.rsplit('_',1)[1])):
    seed=int(obj.name.rsplit('_',1)[1]);rng=random.Random(824+seed)
    points=[v.co.copy() for v in obj.data.vertices]
    lo=Vector(tuple(min(p[a] for p in points) for a in range(3)));hi=Vector(tuple(max(p[a] for p in points) for a in range(3)))
    # Intersect actual half-spaces, rather than smoothing a sphere into another
    # nodule. Oblique upper planes leave an unequal sheared peak and broad faces.
    planes=[(Vector(n),rng.uniform(.70,.92)) for n in [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,-1)]]
    planes.append((Vector((rng.uniform(.12,.40),rng.uniform(-.4,.2),1)).normalized(),rng.uniform(.68,.87)))
    planes.append((Vector((-.55,-.55,.75)).normalized(),rng.uniform(.72,.88)))
    for _ in range(7):
        n=Vector((rng.uniform(-1,1),rng.uniform(-1,1),rng.uniform(-.25,.8))).normalized();planes.append((n,rng.uniform(.79,1.03)))
    normals=np.asarray([tuple(n) for n,d in planes]);distances=np.asarray([d for n,d in planes]);intersections=[]
    for trio in itertools.combinations(range(len(planes)),3):
        matrix=normals[list(trio)]
        if abs(np.linalg.det(matrix))<.00001:continue
        point=np.linalg.solve(matrix,distances[list(trio)])
        if np.all(normals@point<=distances+.00001) and not any(np.linalg.norm(point-old)<.00001 for old in intersections):intersections.append(point)
    bm=bmesh.new()
    for point in intersections:bm.verts.new(point)
    bmesh.ops.convex_hull(bm,input=list(bm.verts),use_existing_faces=False)
    bmesh.ops.triangulate(bm,faces=list(bm.faces))
    bmesh.ops.subdivide_edges(bm,edges=list(bm.edges),cuts=5,use_grid_fill=True)
    bm.verts.ensure_lookup_table();offset=Vector((seed*.91,seed*.37,seed*.53))
    pocket_centers=[(rng.uniform(-.40,.34),rng.uniform(-.16,.51),rng.uniform(.13,.23),rng.uniform(.14,.24)) for _ in range(3)]
    for vertex in bm.verts:
        p=vertex.co.copy();normal=p.normalized()
        fine=.026*noise.noise(p*8.4+offset,noise_basis='PERLIN_ORIGINAL')+.011*noise.noise(p*21.7+offset,noise_basis='PERLIN_ORIGINAL')
        vertex.co+=normal*fine
        if p.y<-.18:
            front=min(1,max(0,(-p.y-.18)/.31))
            for cx,cz,width,depth in pocket_centers:
                pocket=math.exp(-((p.x-cx)/width)**2-((p.z-cz)/(width*.9))**2)
                vertex.co.y+=depth*pocket*front
            cleft=.21*math.exp(-((p.x+.19+.11*p.z)/.09)**2)*max(0,1-((p.z-.15)/.72)**4)
            vertex.co.y+=cleft*front
    bm.normal_update()
    for face in bm.faces:face.smooth=True
    for edge in bm.edges:
        if len(edge.link_faces)==2:edge.smooth=edge.calc_face_angle()<.52
    temporary_data=bpy.data.meshes.new('fracture_field_temporary');bm.to_mesh(temporary_data);bm.free()
    verts=[v.co.copy() for v in temporary_data.vertices];faces=[tuple(p.vertices) for p in temporary_data.polygons]
    sharp=[tuple(e.vertices) for e in temporary_data.edges if e.use_edge_sharp]
    directions=[v.normalized() for v in verts]
    bpy.data.meshes.remove(temporary_data)
    local_lo=Vector(tuple(min(p[a] for p in verts) for a in range(3)));local_hi=Vector(tuple(max(p[a] for p in verts) for a in range(3)))
    verts=[tuple(lo[a]+(p[a]-local_lo[a])/(local_hi[a]-local_lo[a])*(hi[a]-lo[a]) for a in range(3)) for p in verts]
    old=obj.data;data=bpy.data.meshes.new(obj.name+'_eroded_limestone');data.from_pydata(verts,[],faces);data.materials.append(stone);data.update();obj.data=data
    sharp_pairs={tuple(sorted(pair)) for pair in sharp}
    for edge in data.edges:edge.use_edge_sharp=tuple(sorted(edge.vertices)) in sharp_pairs
    layer=data.uv_layers.new(name='UVMap')
    for polygon in data.polygons:
        polygon.use_smooth=True
        coordinates=[]
        for loop_index in polygon.loop_indices:
            index=data.loops[loop_index].vertex_index
            direction=directions[index];coordinates.append((loop_index,.5+math.atan2(direction.y,direction.x)/math.tau,.5+math.asin(direction.z)/math.pi))
        seam=max(v[1] for v in coordinates)-min(v[1] for v in coordinates)>.5
        for index,u,v in coordinates:layer.data[index].uv=(u+1 if seam and u<.5 else u,v)
    if not old.users:bpy.data.meshes.remove(old)
    center=(lo+hi)/2
    world_base=obj.matrix_world@Vector((center.x,center.y,lo.z))
    rock_bases.append((world_base,(hi-lo).x,(hi-lo).y,seed))

# Replace wispy uniformly spaced weeds with unequal low planted masses. Each
# blade is a folded, cupped leaf, with shaded branches and separate lit tips.
for name in ['static_bush_inner_olive','static_crack_succulent_yellow_green','static_sunlit_leaf_tips']:
    old=bpy.data.objects.get(name)
    if old:bpy.data.objects.remove(old,do_unlink=True)
plant_materials=[bpy.data.materials[n] for n in ['bush_inner_olive','crack_succulent_yellow_green','sunlit_leaf_tips']]
buckets=[([],[]) for _ in plant_materials]
rng=random.Random(42182)
def append_shape(bucket,verts,faces):
    out_v,out_f=buckets[bucket];offset=len(out_v);out_v.extend(tuple(v) for v in verts);out_f.extend(tuple(i+offset for i in face) for face in faces)
def stem(a,b,r):
    direction=(b-a).normalized();right=direction.cross(Vector((0,1,0))).normalized();up=direction.cross(right).normalized()
    verts=[];faces=[];sides=6
    for t,scale in [(0,1),(.5,.7),(1,.26)]:
        for k in range(sides):verts.append(a.lerp(b,t)+(right*math.cos(k*math.tau/sides)+up*math.sin(k*math.tau/sides))*r*scale)
    for row in range(2):
        for k in range(sides):
            a0=row*sides+k;b0=row*sides+(k+1)%sides;faces.append((a0,b0,b0+sides,a0+sides))
    faces.extend([tuple(range(sides-1,-1,-1)),tuple(range(2*sides,3*sides))]);append_shape(0,verts,faces)

# Ground sampling uses the actual refined height field; plants do not hover on
# a uniform zero plane. Only shoreline rock feet and cracks receive patches.
from mathutils.bvhtree import BVHTree
ground_bvh=BVHTree.FromObject(ground,bpy.context.evaluated_depsgraph_get())
def ground_z(x,y):
    hit=ground_bvh.ray_cast(Vector((x,y,5)),Vector((0,0,-1)),10)[0]
    return hit.z if hit else .1
patches=0
for base,sx,sy,seed in rock_bases:
    if seed%5==0 or base.x<-10.2:continue
    a=rng.uniform(-math.pi,.45);radius=rng.uniform(.26,.47)
    center=base+Vector((math.cos(a)*sx*.48,math.sin(a)*sy*.48,0));center.z=ground_z(center.x,center.y)+.012
    if center.z<-.15:continue
    height=rng.uniform(.27,.66);branches=[]
    for branch in range(6):
        angle=branch*2.399+rng.random();root=center+Vector((math.cos(angle)*radius*.4,math.sin(angle)*radius*.4,0))
        end=root+Vector((math.cos(angle)*radius*.66,math.sin(angle)*radius*.66,height*rng.uniform(.65,1)))
        stem(root,end,rng.uniform(.015,.023));branches.append((root,end))
    for leaf in range(rng.randint(105,140)):
        root,end=branches[leaf%len(branches)];t=rng.uniform(.1,.95);point=root.lerp(end,t)
        angle=leaf*2.399+seed;length=rng.uniform(.135,.285)*(1.2-t*.3);width=length*rng.uniform(.24,.39)
        horizontal=.45 if leaf%4==0 else .82
        rise=rng.uniform(1.55,2.4) if leaf%4==0 else rng.uniform(.45,1.15)
        tip=point+Vector((math.cos(angle)*length*horizontal,math.sin(angle)*length*horizontal,length*rise));tip.z=min(tip.z,center.z+.82)
        across=Vector((-math.sin(angle),math.cos(angle),0))*width
        middle=point.lerp(tip,.49)+Vector((0,0,.027));ridge=middle+Vector((0,0,.023))
        bucket=2 if t>.64 and leaf%3 else 1
        append_shape(bucket,[point,middle-across,tip,middle+across,ridge],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)])
    # Small rosettes tuck into the adjacent crack rather than forming an even
    # picket line. Their broad blades provide dark-to-lit botanical volume.
    for satellite in range(2 if seed%3==0 else 1):
        a=rng.uniform(0,math.tau);p=center+Vector((math.cos(a)*radius,math.sin(a)*radius,0));p.z=ground_z(p.x,p.y)+.01
        for k in range(11):
            a=k*2.399+seed;length=rng.uniform(.12,.24);across=Vector((-math.sin(a),math.cos(a),0))*length*.32
            tip=p+Vector((math.cos(a)*length,math.sin(a)*length,length*.85));mid=p.lerp(tip,.48);ridge=mid+Vector((0,0,.033))
            append_shape(1 if k%3 else 2,[p,mid-across,tip,mid+across,ridge],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)])
    for blade in range(rng.randint(8,15)):
        a=rng.uniform(0,math.tau);p=center+Vector((math.cos(a)*radius*.33,math.sin(a)*radius*.33,0));p.z=ground_z(p.x,p.y)+.009
        tip=p+Vector((math.cos(a)*radius*.31,math.sin(a)*radius*.31,rng.uniform(.34,.68)));middle=p.lerp(tip,.6)+Vector((0,0,.075));across=Vector((-math.sin(a),math.cos(a),0))*rng.uniform(.012,.024)
        append_shape(2 if blade%3 else 1,[p-across,middle-across,tip,middle+across,p+across],[(0,1,2),(0,2,4),(4,2,3)])
    patches+=1
for material,(verts,faces) in zip(plant_materials,buckets):
    obj=make_mesh('static_'+material.name,verts,faces,material);obj['keep']=False;face_uv(obj.data)
    tri=obj.modifiers.new('Botanical_fold_tangents','TRIANGULATE');bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=tri.name)
    for polygon in obj.data.polygons:polygon.use_smooth=True

# Little fractured chips are concentrated at erosion roots and plant pockets,
# not spread as an even particle layer across the entire sand bed.
old=bpy.data.objects.get('static_eroded_root_grit')
if old:bpy.data.objects.remove(old,do_unlink=True)
grit_verts=[];grit_faces=[];rng=random.Random(51728)
for base,sx,sy,seed in rock_bases:
    if base.x<-10.2:continue
    for _ in range(rng.randint(3,6)):
        a=rng.uniform(-math.pi,.45);p=base+Vector((math.cos(a)*sx*rng.uniform(.42,.65),math.sin(a)*sy*rng.uniform(.42,.65),0));p.z=ground_z(p.x,p.y)+.007
        if p.z<-.20:continue
        size=rng.uniform(.035,.090);start=len(grit_verts)
        grit_verts.extend([tuple(p+Vector((-size,-size*.64,0))),tuple(p+Vector((size*.76,-size*.42,0))),tuple(p+Vector((size*.59,size*.84,0))),tuple(p+Vector((-size*.60,size*.79,0))),tuple(p+Vector((-.15*size,.17*size,size*rng.uniform(.75,1.65))))])
        grit_faces.extend([tuple(start+i for i in face) for face in [(0,1,4),(1,2,4),(2,3,4),(3,0,4),(3,2,1),(3,1,0)]])
grit=make_mesh('static_eroded_root_grit',grit_verts,grit_faces,stone);face_uv(grit.data)

# Explicit ground triangles give stable tangents, without touching UI faces.
tri=ground.modifiers.new('Eroded_ground_tangents','TRIANGULATE');bpy.context.view_layer.objects.active=ground;bpy.ops.object.modifier_apply(modifier=tri.name)
bpy.context.view_layer.update()
assert before_camera==signature(scene.camera),'Opening camera changed'
assert all(before[n]==signature(bpy.data.objects[n]) for n in semantic_names),'Semantic/dynamic geometry changed'
scene['art_surface_revision']='eroded limestone / neutral cream castings / folded coastal planting'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'authoring'/'scene.blend'),compress=True)
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
    if obj.type in ['MESH','EMPTY','CAMERA']:obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'scene.glb'),export_format='GLB',use_selection=True,export_apply=False,export_morph=True,export_texcoords=True,export_normals=True,export_tangents=True,export_cameras=True,export_materials='EXPORT',export_extras=True)
spec=importlib.util.spec_from_file_location('road_attribute_pack',ROOT/'authoring'/'pack_attributes.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);module.pack(ROOT/'scene.glb')
assert (ROOT/'scene.glb').stat().st_size<25_000_000,'Cloudflare web export exceeds 25 MB'
assert (ROOT/'authoring'/'scene.blend').stat().st_size<25_000_000,'Cloudflare editable source exceeds 25 MB'
# Packed images must match the authored external maps byte for byte. Exporters
# may otherwise reuse a stale packed image after a pixel-only authoring change.
raw=(ROOT/'scene.glb').read_bytes();document_length=struct.unpack_from('<I',raw,12)[0]
document=json.loads(raw[20:20+document_length]);binary=raw[28+document_length:]
map_names={'limestone_normal','salmon_limestone_albedo','weathered_precast_albedo','coastal_sediment_albedo'}
for image in document['images']:
    if image.get('name') not in map_names:continue
    view=document['bufferViews'][image['bufferView']];start=view.get('byteOffset',0)
    assert binary[start:start+view['byteLength']]==(ROOT/'materials'/f"{image['name']}.png").read_bytes(),image['name']+' packed map is stale'
# glTF combines roughness into G and contact AO into R. Test those linear G
# pixels, rather than expecting a composed ORM file to equal a grayscale PNG.
source_roughness=np.empty(SIZE*SIZE*4,dtype=np.float32);bpy.data.images['limestone_roughness'].pixels.foreach_get(source_roughness)
with tempfile.TemporaryDirectory(prefix='road-roughness-') as temporary:
    for image in document['images']:
        if 'limestone_roughness' not in image.get('name',''):continue
        view=document['bufferViews'][image['bufferView']];start=view.get('byteOffset',0);path=Path(temporary)/'linear-roughness.png';path.write_bytes(binary[start:start+view['byteLength']])
        decoded=bpy.data.images.load(str(path),check_existing=False);decoded.colorspace_settings.name='Non-Color'
        pixels=np.empty(SIZE*SIZE*4,dtype=np.float32);decoded.pixels.foreach_get(pixels)
        assert np.max(np.abs(pixels.reshape(-1,4)[:,1]-source_roughness.reshape(-1,4)[:,0]))<1/255+.00001,image['name']+' roughness pixels are stale'
        bpy.data.images.remove(decoded)
report={'semanticObjectsPreserved':len(before),'semanticGeometryAndUVExact':True,'openingCameraExact':True,'plantedPatches':patches,'packedColourAndNormalPNGExact':True,'packedRoughnessGreenChannelExact':True,'surfaceRelief':'real sheared fracture planes and deep eroded pockets, low ground erosion, upright folded leaves and root grit; coherent linear normal and roughness maps','blendBytes':(ROOT/'authoring'/'scene.blend').stat().st_size,'glbBytes':(ROOT/'scene.glb').stat().st_size,'acceptance':'Independent actual browser/source/phone review pending'}
(ROOT/'proofs'/'surface-refinement-report.json').write_text(json.dumps(report,indent=2)+'\n')
print('ROADWORKS_REFINED',json.dumps(report),flush=True)
if '--proofs' in sys.argv:
    scene.cycles.samples=24;scene.render.resolution_percentage=70;scene.render.filepath=str(ROOT/'proofs'/'surface-refinement.png');bpy.ops.render.render(write_still=True)
