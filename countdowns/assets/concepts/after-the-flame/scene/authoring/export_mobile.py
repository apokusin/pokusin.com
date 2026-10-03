"""Export a smaller geometric level from the editable authored source.
Run after build_scene.py. Nothing is changed in scene.blend or the desktop GLB.
"""
import bpy,json,math,bmesh
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'authoring'/'scene.blend'))
# The sculpt's final cavity edges are functional geometry. Whole-mass collapse
# closed reading apertures, so preserve this already-budgeted 136k-face mesh.
# Reduce only the candle skin, which has no archive aperture or dynamic ink.
# Preserve the tip morph while reducing its neutral closed skin once.
candle=bpy.data.objects['tapered_front_candle'];candle.shape_key_remove(candle.data.shape_keys.key_blocks['Restored_tip']);candle.shape_key_remove(candle.data.shape_keys.key_blocks['Basis'])
bpy.context.view_layer.objects.active=candle;modifier=candle.modifiers.new('Phone_candle_skin','DECIMATE');modifier.ratio=.60;bpy.ops.object.modifier_apply(modifier=modifier.name)
candle.shape_key_add(name='Basis');tip=candle.shape_key_add(name='Restored_tip')
for point in tip.data:
    weight=max(0,min(1,(point.co.z-7.6)/1.65));point.co.z+=.24*weight*weight
collection=bpy.data.collections['AuthoredWaxCanyon']
# A portrait composition has its own poured two-tier clock bank. All four
# physical reading cavities remain large without reducing the whole canyon.
def block(name,location,size,material,radius):
    bpy.ops.mesh.primitive_cube_add(size=1,location=location)
    ob=bpy.context.object;ob.name=name;ob.scale=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for owner in list(ob.users_collection):owner.objects.unlink(ob)
    collection.objects.link(ob);ob.data.materials.append(material)
    mod=ob.modifiers.new('Soft_poured_edge','BEVEL');mod.width=radius;mod.segments=5
    bpy.ops.object.modifier_apply(modifier=mod.name)
    for polygon in ob.data.polygons:polygon.use_smooth=True
    return ob
cold=bpy.data.materials['CooledCreamWax'];tile=bpy.data.materials['WaxReadingBed']
bank=block('phone_integrated_clock_bank',(-3.25,-5.9,3.5),(5.95,1.5,6.2),cold,.44)
phone_clock=[]
for index,unit in enumerate(['days','hours','minutes','seconds']):
    x=-4.70+(index%2)*2.86;z=5.25-(index//2)*2.65
    cutter=block('phone_cavity_tool',(x,-6.64,z),(2.24,1.4,2.36),cold,.13)
    bpy.context.view_layer.objects.active=bank
    mod=bank.modifiers.new('Actual_phone_reading_cavity','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cutter
    bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
    block('phone_clock_'+unit+'_wax_bed',(x,-6.00,z),(2.08,.16,2.20),tile,.07)
    source=bpy.data.objects['clock_'+unit];face=source.copy();face.data=source.data.copy();face.name='phone_clock_'+unit;collection.objects.link(face)
    face.location=(x,-6.10,z);face.scale.x=2.01/1.79;face.scale.z=2.12/2.19;phone_clock.append(face.name)

# The portrait pressure bowl is a new rooted portion of the existing pour.
# Translate every shape-key coordinate, not merely the displayed neutral mesh.
original_pool=bpy.data.objects['again_pressure_pool'];pool=original_pool.copy();pool.data=original_pool.data.copy();collection.objects.link(pool)
bpy.data.objects.remove(original_pool,do_unlink=True);pool.name='again_pressure_pool'
cx,cy,cz=-3.25,-8.7,.60
original_center=pool.data.shape_keys.key_blocks['Basis'].data[0].co.copy();delta=Vector((cx,cy,cz))-original_center
for key in pool.data.shape_keys.key_blocks:
    for point in key.data:point.co+=delta
for vertex,point in zip(pool.data.vertices,pool.data.shape_keys.key_blocks['Basis'].data):vertex.co=point.co

mass=bpy.data.objects['continuous_sculpted_wax_mass'];segments=64
def topology(ob):
    bm=bmesh.new();bm.from_mesh(ob.data);result={'boundary':sum(edge.is_boundary for edge in bm.edges),'nonManifold':sum(not edge.is_manifold for edge in bm.edges),'faces':len(bm.faces)};bm.free();return result
print('PHONE_SOURCE_TOPOLOGY',topology(mass))
top=[point.co.copy() for point in pool.data.shape_keys.key_blocks['Basis'].data]
outer=[]
for index in range(segments):
    angle=index/segments*math.tau
    # A slight unequal extension follows the poured floor instead of making a
    # regular button pedestal. Its outer edge actually intersects the old mass.
    variation=1.20+.024*math.sin(angle*3+.7)+.013*math.sin(angle*7)
    x=cx+2.45*variation*math.cos(angle);y=cy+1.62*variation*math.sin(angle)
    hit,point,*_=mass.ray_cast(Vector((x,y,5)),Vector((0,0,-1)))
    outer.append(Vector((x,y,(point.z if hit else .36)+.035)))
verts=[];uv=[]
for point in top:
    radius=math.sqrt(((point.x-cx)/2.45)**2+((point.y-cy)/1.62)**2)
    point.z-=.032+.065*max(0,1-radius*radius)
    verts.append(tuple(point));uv.append((.5+(point.x-cx)/5.9,.5+(point.y-cy)/3.9))
faces=[tuple(p.vertices) for p in pool.data.polygons]
outer_start=len(verts)
for point in outer:verts.append(tuple(point));uv.append((.5+(point.x-cx)/5.9,.5+(point.y-cy)/3.9))
inner_start=1+13*segments
for i in range(segments):
    j=(i+1)%segments;faces.append((inner_start+i,outer_start+i,outer_start+j,inner_start+j))
bottom_start=len(verts)
for point in outer:verts.append((point.x,point.y,-.25));uv.append((.5+(point.x-cx)/5.9,.5+(point.y-cy)/3.9))
for i in range(segments):
    j=(i+1)%segments;faces.append((outer_start+i,bottom_start+i,bottom_start+j,outer_start+j))
bottom=len(verts);verts.append((cx,cy,-.25));uv.append((.5,.5))
for i in range(segments):faces.append((bottom,bottom_start+(i+1)%segments,bottom_start+i))
mesh=bpy.data.meshes.new('Portrait_poured_pressure_platform');mesh.from_pydata(verts,[],faces);mesh.update()
platform=bpy.data.objects.new('phone_rooted_pressure_platform',mesh);collection.objects.link(platform);mesh.materials.append(cold)
layer=mesh.uv_layers.new(name='UVMap')
for polygon in mesh.polygons:
    polygon.use_smooth=True
    for loop in polygon.loop_indices:layer.data[loop].uv=uv[mesh.loops[loop].vertex_index]
bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
print('PHONE_PLATFORM_TOPOLOGY',topology(platform))
# Sculpt the local floor column downward continuously. A whole-mass Boolean
# reclassified distant thin sheets, so do not alter the archive topology. Both
# top and underside receive the same local displacement and retain true depth.
def pool_height(radius,angle):
    angular=(angle%math.tau)/math.tau*segments;index=int(angular)%segments;next_index=(index+1)%segments;fraction=angular-int(angular)
    radial=min(1,radius)*14;ring=min(13,int(radial));blend=radial-ring
    def at(level):
        if level==0:return top[0].z
        a=top[1+(level-1)*segments+index];b=top[1+(level-1)*segments+next_index]
        # The top list is the platform support, already offset below the pool.
        return a.z*(1-fraction)+b.z*fraction
    return at(ring)*(1-blend)+at(ring+1)*blend
changes=[]
for vertex in mass.data.vertices:
    p=vertex.co;dx=(p.x-cx)/2.45;dy=(p.y-cy)/1.62;radius=math.hypot(dx,dy)
    if radius>=1.25:continue
    hit,where,*_=mass.ray_cast(Vector((p.x,p.y,5)),Vector((0,0,-1)))
    if not hit:continue
    factor=max(0,min(1,(radius-1.0)/.25));factor=factor*factor*(3-2*factor)
    support=pool_height(radius,math.atan2(dy,dx))-.045
    target=support*(1-factor)+where.z*factor
    changes.append((vertex,target-where.z))
for vertex,shift in changes:vertex.co.z+=shift
mass.data.update()
bm=bmesh.new();bm.from_mesh(mass.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mass.data);bm.free()
assert topology(mass)['nonManifold']==0 and topology(platform)['nonManifold']==0
print('PHONE_SCULPT_TOPOLOGY',topology(mass))
# Unwrap the actual poured bank so microscopic wax stays a material, not
# stretched source-scene color. The base intersects the existing poured floor.
bpy.ops.object.select_all(action='DESELECT');bank.select_set(True);bpy.context.view_layer.objects.active=bank
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.02);bpy.ops.object.mode_set(mode='OBJECT')
# Boolean cap polygons retain their UVs, but tangent export requires explicit
# triangles. This changes tessellation only, preserving every cavity profile.
for ob in [mass,bank,platform]:
    bpy.context.view_layer.objects.active=ob;tri=ob.modifiers.new('Stable_phone_UV_tessellation','TRIANGULATE');tri.keep_custom_normals=True;bpy.ops.object.modifier_apply(modifier=tri.name)
camera=bpy.data.objects['reference_macro_camera'];camera.location=(-3.25,-27,10);camera.rotation_euler=(Vector((-3.25,-5.2,3.8))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.sensor_fit='VERTICAL';camera.data.sensor_height=36;camera.data.lens=36/(2*math.tan(math.radians(21)))
bpy.context.scene.render.resolution_x=390;bpy.context.scene.render.resolution_y=844
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'authoring'/'scene-mobile.blend'))
bpy.ops.object.select_all(action='DESELECT')
for ob in collection.all_objects:ob.select_set(True)
bpy.data.objects['reference_macro_camera'].select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'scene-mobile.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=True,export_lights=False,export_yup=True,export_texcoords=True,export_normals=True,export_tangents=True)
for ob in collection.all_objects:
    if ob.type=='MESH':ob.data.calc_loop_triangles()
manifest=json.loads((ROOT/'manifest.json').read_text());manifest['phoneAsset']='scene-mobile.glb';manifest['phoneTriangles']=sum(len(ob.data.loop_triangles) for ob in collection.all_objects if ob.type=='MESH')
manifest['phoneClock']=phone_clock
manifest['camera']['phoneRule']={'fov':42,'positionGLTF':[-3.25,10.0,27.0],'targetGLTF':[-3.25,3.8,5.2],'purpose':'centered two-tier poured bank with a rooted shallow pressure bowl in the foreground'}
manifest['phonePressurePool']={'surface':'again_pressure_pool','centerBlender':[cx,cy,cz],'root':'phone_rooted_pressure_platform','ground':'continuous_sculpted_wax_mass','morphTranslationBlender':list(delta),'physicalConstruction':'continuous phone-only concavity sculpt and closed poured platform with overlapping ground roots; all Basis/Pressure coordinates translated together'}
# Preserve verified exhibit stops. The first leg clears the tall candle wall
# before turning into the measured archive channel.
for profile in ['phone390','phone320']:
    prior=manifest['navigationRails'][profile][0]
    manifest['navigationRails'][profile][0]=[[-3.25,10.0,27.0],prior[-1]]
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2))
