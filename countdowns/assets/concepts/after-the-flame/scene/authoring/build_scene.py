"""After the Flame: a connected macro wax landscape, not a scenery photograph.
Blender 4.5.14 LTS. All ink, clock values and archive faces remain blank in assets.
Run Blender --background --python this_file.py -- [--proofs].
"""
import bpy, bmesh, math, json, random, sys
import numpy as np
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
PROOFS='--proofs' in sys.argv
random.seed(9271)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.context.scene.render.engine='CYCLES';bpy.context.scene.cycles.samples=28
collection=bpy.data.collections.new('AuthoredWaxCanyon');bpy.context.scene.collection.children.link(collection)
def own(ob):
    for c in list(ob.users_collection):c.objects.unlink(ob)
    collection.objects.link(ob);return ob
def mesh(name,verts,faces,material,uv=None,smooth=True):
    data=bpy.data.meshes.new(name+'_mesh');data.from_pydata(verts,[],faces);data.update()
    ob=bpy.data.objects.new(name,data);collection.objects.link(ob);data.materials.append(material)
    for polygon in data.polygons:polygon.use_smooth=smooth
    if uv:
        layer=data.uv_layers.new(name='AuthoredUV')
        for polygon in data.polygons:
            for li in polygon.loop_indices:layer.data[li].uv=uv[data.loops[li].vertex_index]
    return ob
def outward(ob):
    bm=bmesh.new();bm.from_mesh(ob.data)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(ob.data);bm.free();ob.data.update()
def unwrap(ob):
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.1,island_margin=.01);bpy.ops.object.mode_set(mode='OBJECT');ob.select_set(False)
def apply(ob,modifier):
    bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_apply(modifier=modifier.name)
def material(name,color,roughness,transmission=0,coat=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=roughness;p.inputs['IOR'].default_value=1.43
    p.inputs['Transmission Weight'].default_value=transmission;p.inputs['Coat Weight'].default_value=coat;p.inputs['Coat Roughness'].default_value=.15
    return m
cold=material('CooledCreamWax',(1,1,1),.52,0,.12)
thin=material('ThinHoneyWax',(.94,.65,.31),.23,.10,.20)
wet=material('MoltenFilm',(.79,.61,.41),.13,.035,.30)
tile=material('WaxReadingBed',(1,1,1),.55)
blank=material('RuntimeArchiveFace',(.04,.027,.027),.8)
wickmat=material('CharredWick',(.025,.013,.012),.96)
gold=material('CreaseCrown',(.52,.25,.045),.29);gold.node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.82
flamemat=material('FlameAmber',(.95,.15,.005),.5)
fp=flamemat.node_tree.nodes.get('Principled BSDF');fp.inputs['Emission Color'].default_value=(1,.29,.012,1);fp.inputs['Emission Strength'].default_value=5
coremat=material('FlameCore',(.99,.86,.57),.5)
cp=coremat.node_tree.nodes.get('Principled BSDF');cp.inputs['Emission Color'].default_value=(1,.79,.36,1);cp.inputs['Emission Strength'].default_value=14

# Separate microscopic channels. No baked light or perspective in these maps.
rng=np.random.default_rng(9271);n=512
u,v=np.meshgrid(np.linspace(0,1,n),np.linspace(0,1,n))
pore=rng.normal(0,.6,(n,n))
grain=np.sin(u*530+np.sin(v*55)*2)*.16+pore*.06
nx=np.gradient(grain,axis=1)*.65;ny=np.gradient(grain,axis=0)*.65
normal=np.stack([-nx,-ny,np.ones_like(nx)],axis=-1);normal/=np.linalg.norm(normal,axis=2)[...,None]
def image(name,array,noncolor=True):
    h,w=array.shape[:2];im=bpy.data.images.new(name,w,h,alpha=True)
    if array.ndim==2:array=np.stack([array,array,array,np.ones_like(array)],axis=-1)
    elif array.shape[-1]==3:array=np.concatenate([array,np.ones((h,w,1))],axis=-1)
    # Non-colour channels must be linear before saving. Setting this after save
    # gamma-encoded the neutral normal and created strongly tilted reflections.
    if noncolor:im.colorspace_settings.name='Non-Color'
    im.pixels.foreach_set(np.asarray(array,dtype=np.float32).ravel());im.filepath_raw=str(ROOT/'materials'/f'{name}.png');im.file_format='PNG';im.save()
    return im
normalmap=image('wax-pore-normal',normal*.5+.5)
rough=image('cooled-wax-roughness',np.clip(.50+grain*.065,.34,.64))
wetrough=image('molten-film-roughness',np.clip(.13+grain*.018,.08,.19))
thickness=image('thin-wax-thickness',np.clip(.3+.23*np.sin(u*math.pi)**2+.07*np.cos(v*math.pi*3),.1,.7))
ash=np.ones((n,n,3))*np.array([.83,.77,.65]);dots=rng.random((n,n))>.9995
ash[dots]=[.30,.21,.13];albedo=image('cream-wax-albedo',ash,False)
def map_material(m,roughness_image,use_albedo=False):
    ns=m.node_tree.nodes;ls=m.node_tree.links;p=ns.get('Principled BSDF')
    coords=ns.new('ShaderNodeTexCoord');mapping=ns.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(8,8,1);ls.new(coords.outputs['UV'],mapping.inputs['Vector'])
    tex=ns.new('ShaderNodeTexImage');tex.image=normalmap
    ls.new(mapping.outputs['Vector'],tex.inputs['Vector'])
    nm=ns.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.24;ls.new(tex.outputs['Color'],nm.inputs['Color']);ls.new(nm.outputs['Normal'],p.inputs['Normal'])
    rm=ns.new('ShaderNodeTexImage');rm.image=roughness_image;ls.new(rm.outputs['Color'],p.inputs['Roughness'])
    ls.new(mapping.outputs['Vector'],rm.inputs['Vector'])
    if use_albedo:
        at=ns.new('ShaderNodeTexImage');at.image=albedo;ls.new(at.outputs['Color'],p.inputs['Base Color']);ls.new(mapping.outputs['Vector'],at.inputs['Vector'])
for m in [cold,tile]:map_material(m,rough,True)
map_material(wet,wetrough)
map_material(thin,wetrough)

def terrain_height(x,y):
    # A low poured channel with broad folded banks; minute pores live in maps.
    left=2.4*math.exp(-((x+8.4)/2.5)**2)*math.exp(-((y-1.4)/6)**2)
    right=2.2/(1+math.exp(-(x-7.5)*.8))*math.exp(-((y-3)/15)**2)
    channel=.11*math.sin(y*.54+x*.27)+.095*math.cos(x*.82-y*.18)
    folded=0;stream=0
    for i in range(8):
        path=-8.8+i*2.55+(.48+.16*(i%3))*math.sin(y*(.22+.035*(i%4))+i*1.7)
        spread=.22+.19*(i%3)
        # Unequal streams split and terminate; poured wax is not parallel rails.
        extent=7.5+(i%4)*2.2;origin=-5+(i%3)*3.1
        stream+=(.45+.12*(i%4))*math.exp(-((x-path)/spread)**2)*math.exp(-((y-origin)/extent)**2)
    for cx,cy,h,sx,sy in [(-5.5,-3,.55,1.1,2.1),(-2,-6,.40,1.5,.8),(5,-7,.5,2.0,1.2),(1,-1,.36,1.3,2.3),(-3,5,.24,2.4,1.4),(2,7,.42,1.8,2.1)]:
        folded+=h*math.exp(-((x-cx)/sx)**2-((y-cy)/sy)**2)
    r=math.sqrt(((x+6.6)/2.6)**2+((y+4.0)/1.75)**2)
    base=.35+left+right+channel+folded+stream
    front=math.exp(-((y+5)/7)**2)*math.exp(-((x-1)/13)**2)
    wake=math.sqrt(((x-2.6)/7.1)**2+((y+3.3)/3.2)**2)
    radial=.11*math.sin(wake*39+math.sin(x*.8)*1.8)*math.exp(-((wake-1.1)/.65)**2)
    base+=front*(.08*math.sin(x*4.3+math.sin(y*2.1)*2)+.055*math.sin(y*5.4+x*1.2)+radial)
    blend=max(0,min(1,(1.3-r)/.38));blend=blend*blend*(3-2*blend)
    bowl=1.30+.19*r*r+.15*math.exp(-((r-1.03)/.12)**2)
    return base*(1-blend)+bowl*blend
nx,ny=200,285;verts=[];uv=[]
for j in range(ny+1):
    y=-22+j/ny*96
    for i in range(nx+1):
        x=-25+i/nx*53;verts.append((x,y,terrain_height(x,y)));uv.append((i/nx*11,j/ny*20))
faces=[]
for j in range(ny):
    for i in range(nx):
        a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
ground=mesh('continuous_poured_floor',verts,faces,cold,uv)
sol=ground.modifiers.new('Actual_wax_base_depth','SOLIDIFY');sol.thickness=.65;sol.offset=-1;apply(ground,sol)
outward(ground)

def rounded_block(name,center,size,mat,radius=.22,warp=.08):
    bpy.ops.mesh.primitive_cube_add(size=1,location=center);ob=own(bpy.context.object);ob.name=name;ob.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);ob.data.materials.append(mat)
    bevel=ob.modifiers.new('Poured_corner_mass','BEVEL');bevel.width=radius;bevel.segments=6;apply(ob,bevel)
    if warp:
        sub=ob.modifiers.new('Sculptable_macro_surface','SUBSURF');sub.subdivision_type='SIMPLE';sub.levels=2;apply(ob,sub)
        for vert in ob.data.vertices:
            p=vert.co;normal=p.normalized();amount=warp*(math.sin(p.x*1.9+p.z*.7)+.4*math.cos(p.y*3.1-p.z*1.6))
            vert.co+=normal*amount
    for polygon in ob.data.polygons:polygon.use_smooth=True
    unwrap(ob);return ob

def cut_recess(body,name,center,width,height,depth=2.0,angle=0):
    cutter=rounded_block(name+'_tool',center,(width,depth,height),cold,.15,0)
    cutter.rotation_euler.z=angle
    mod=body.modifiers.new(name+'_negative_space','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cutter;apply(body,mod)
    bpy.data.objects.remove(cutter,do_unlink=True)
    outward(body)

def front_face(name,center,w,h,mat,angle=0):
    nx,nz=2,2;verts=[];uv=[]
    for j in range(nz+1):
        for i in range(nx+1):
            s=i/nx;t=j/nz;verts.append(((s-.5)*w,0,(t-.5)*h));uv.append((s,t))
    faces=[]
    for j in range(nz):
        for i in range(nx):
            a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
    ob=mesh(name,verts,faces,mat,uv);ob.location=center;ob.rotation_euler.z=angle;return ob

# The timer is negative space cut into ONE foreground mass, not four torus rims.
bank=rounded_block('integrated_foreground_clock_bank',(2.65,-3.3,2.08),(10.3,1.75,3.18),cold,.60,.055)
clock=[]
for index,unit in enumerate(['days','hours','minutes','seconds']):
    x=-1.0+index*2.38;z=1.97+index*.045
    # Carved into the final joined/smoothed sculpt below, not before remeshing.
    bed=rounded_block('clock_'+unit+'_wax_bed',(x,-3.69,z),(1.87,.14,2.30),tile,.09,0)
    face=front_face('clock_'+unit,(x,-3.785,z),1.79,2.19,tile)
    clock.append(face.name)

def drip(name,path,radius=.13,mat=thin):
    # An unequal, closed tapered sheet-lobe; every start intersects its wax root.
    controls=[Vector(point) for point in path];points=[]
    for segment in range(len(controls)-1):
        p0=controls[max(0,segment-1)];p1=controls[segment];p2=controls[segment+1];p3=controls[min(len(controls)-1,segment+2)]
        for step in range(7):
            t=step/7;points.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
    points.append(controls[-1]);verts=[];uv=[];sides=16
    for index,p in enumerate(points):
        t=index/(len(points)-1);tangent=(points[min(index+1,len(points)-1)]-points[max(0,index-1)]).normalized()
        side=tangent.cross(Vector((0,1,0)))
        if side.length<.1:side=tangent.cross(Vector((1,0,0)))
        side.normalize();other=tangent.cross(side).normalized()
        rr=radius*(.65+.43*math.sin(t*math.pi)+.34*math.exp(-((t-.82)/.17)**2))*max(.06,min(1,(1-t)*18))
        for k in range(sides):
            angle=k/sides*math.tau;verts.append(tuple(p+side*math.cos(angle)*rr+other*math.sin(angle)*rr*.48));uv.append((k/sides,t))
    faces=[tuple(range(sides-1,-1,-1))]
    for index in range(len(points)-1):
        for k in range(sides):faces.append((index*sides+k,index*sides+(k+1)%sides,(index+1)*sides+(k+1)%sides,(index+1)*sides+k))
    faces.append(tuple(range((len(points)-1)*sides,len(points)*sides)));return mesh(name,verts,faces,mat,uv)

def poured_crest(name,center,radii):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=center)
    ob=own(bpy.context.object);ob.name=name;ob.scale=radii
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);ob.data.materials.append(cold)
    for polygon in ob.data.polygons:polygon.use_smooth=True
    return ob

for index,x in enumerate([-2.13,.19,2.57,4.95,7.34]):
    # Broad rooted pours on the actual dividers. None hangs into a reading face.
    drip('bank_lip_melt_'+str(index),[(x,-4.03,3.53),(x+.02,-4.20,3.08),(x+.08,-4.22,1.35),(x+.18,-4.17,.48)],.26+.045*(index%2),cold)
for index in range(13):
    x=-2.0+index*.76
    poured_crest('bank_lip_crest_'+str(index),(x,-3.78,3.48+.07*math.sin(index*1.7)),(.64,.49,.26+.045*(index%3)))

# Tapered hollow candle with authored vertical melt folds and a broken mouth.
def candle_shell(name,center,radius,height,open_mouth=True):
    segments,layers=96,70;verts=[];uv=[]
    for layer in range(layers+1):
        t=layer/layers
        for k in range(segments):
            angle=k/segments*math.tau
            r=radius*(1-.24*t+.035*math.sin(angle*7+t*2)+.025*math.sin(angle*13+t*4))
            r+=.11*math.cos(angle*4+t*2)*math.sin(t*math.pi)
            # Unequal soft poured folds are part of this closed wall, rather
            # than thin disconnected sleeves which self-shadow as black tears.
            for fold in range(9):
                a=math.pi*1.03+fold/8*math.pi*.91
                delta=(angle-a+math.pi)%math.tau-math.pi
                lower=.035+.12*(fold%4);upper=.94-.075*(fold%3)
                rise=max(0,min(1,(t-lower)/.11));rise=rise*rise*(3-2*rise)
                fall=max(0,min(1,(upper-t)/.10));fall=fall*fall*(3-2*fall)
                r+=(.22+.085*(fold%3))*math.exp(-(delta/(.15+.025*(fold%3)))**2)*rise*fall
            nearest_zero=min(angle,math.tau-angle)
            topwave=(.09*math.sin(angle*4)+.07*math.cos(angle*7)-.24*math.exp(-(nearest_zero/.40)**2))*(t**9)
            verts.append((center[0]+r*math.cos(angle),center[1]+r*math.sin(angle),center[2]+t*height+topwave));uv.append((k/segments,t*4))
    faces=[]
    for layer in range(layers):
        for k in range(segments):faces.append((layer*segments+k,layer*segments+(k+1)%segments,(layer+1)*segments+(k+1)%segments,(layer+1)*segments+k))
    faces.append(tuple(range(segments-1,-1,-1)))
    if open_mouth:
        top_start=len(verts)
        for k in range(segments):
            angle=k/segments*math.tau;verts.append((center[0]+radius*.43*math.cos(angle),center[1]+radius*.43*math.sin(angle),center[2]+height-.45));uv.append((k/segments,4.2))
        for k in range(segments):faces.append((layers*segments+k,layers*segments+(k+1)%segments,top_start+(k+1)%segments,top_start+k))
        faces.append(tuple(range(top_start,top_start+segments)))
    else:faces.append(tuple(range(layers*segments,(layers+1)*segments)))
    ob=mesh(name,verts,faces,cold,uv);outward(ob);return ob
main_candle=candle_shell('tapered_front_candle',(-8.8,.05,.35),2.5,9.15)
back_candle=candle_shell('cropped_candle_wall',(-9.4,3.65,.45),2.7,14.3,False)
for index in range(6):
    angle=math.pi*1.04+index/5*math.pi*.85;r=2.45
    x=-8.8+math.cos(angle)*r;y=.05+math.sin(angle)*r
    start=8.50+math.sin(index*1.9)*.45;end=.35+(index%3)*1.10
    path=[(x,y,start),(x+.10*math.sin(index),y-.09,start-.5),(x+.13,y-.18,(start+end)*.52),(x+.22,y-.26,end+.2),(x+.23,y-.27,end)]
    drip('candle_poured_fold_'+str(index),path,.18+(index%3)*.045,cold)
wick=drip('bent_charred_wick',[(-7.03,-.45,9.2),(-6.79,-.49,9.62),(-6.49,-.5,9.38)],.085,wickmat)
drip('hanging_collapsed_wax_sheet',[(-6.52,-.43,9.38),(-5.95,-.44,9.20),(-5.55,-.46,8.63),(-5.81,-.45,8.11),(-6.25,-.43,7.57)],.12,thin)

# Complete wax terraces, each with a real recessed reading aperture in a mass.
archives=[
 ('got-s4','got',(9.3,4.4,8.92),7.00,3.66),
 ('severance-tracker','severance',(4.25,.95,5.32),3.65,2.61),
 ('dexter-s8-final','dexter',(10.1,1.15,4.40),4.70,3.10),
 ('got-s3-redesign','got',(23.0,20.0,5.50),4.2,2.80),
 ('got-s3-classic','got',(13.8,17.0,4.80),3.5,2.43),
 ('dexter-s7-finale','dexter',(12.0,22.0,5.20),4.0,2.70),
 ('severance-s2','severance',(11.5,27.0,5.90),4.4,2.95),
 ('sherlock-final','sherlock',(13.0,33.0,5.40),3.9,2.6),
 ('sherlock-alpha','sherlock',(14.5,38.0,4.30),3.6,2.50),
 ('archer-s5-final','archer',(20.0,44.0,5.40),4.1,2.50),
 ('breaking-bad-final','breaking-bad',(13.0,50.0,6.00),4.4,2.8),
 ('breaking-bad-desert-parallax','breaking-bad',(15.0,55.0,4.70),3.8,2.50),
 ('house-of-cards-s2','house-of-cards',(12.5,61.0,5.50),4.2,2.75)
]
archive_manifest=[]
archive_cuts=[]
destination_manifest=[]
# A rising closed wax ridge joins the three exhibits from behind. Their front
# terraces and the low central channel remain sculpted into one coherent mass.
ridge_verts=[];ridge_faces=[];rx,ry=36,24
for layer in range(2):
    for j in range(ry+1):
        y=3.35+j/ry*11
        for i in range(rx+1):
            x=4.3+i/rx*17.5
            z=.08 if layer==0 else 2.1+.57*(x-4.3)+.27*math.sin(x*.43+y*.3)
            ridge_verts.append((x,y+.36*math.sin(x*.47),z))
stride=(rx+1)*(ry+1)
for j in range(ry):
    for i in range(rx):
        a=j*(rx+1)+i;ridge_faces.append((stride+a,stride+a+1,stride+a+rx+2,stride+a+rx+1));ridge_faces.append((a,a+rx+1,a+rx+2,a+1))
for i in range(rx):
    a=i;ridge_faces.append((a,a+1,stride+a+1,stride+a))
    a=ry*(rx+1)+i;ridge_faces.append((a,stride+a,stride+a+1,a+1))
for j in range(ry):
    a=j*(rx+1);ridge_faces.append((a,stride+a,stride+a+rx+1,a+rx+1))
    a=j*(rx+1)+rx;ridge_faces.append((a,a+rx+1,stride+a+rx+1,stride+a))
ridge=mesh('terrace_continuous_rising_backwall',ridge_verts,ridge_faces,cold);outward(ridge)
def station_point(x,y,angle,dx,dy,z):
    return (x+dx*math.cos(angle)-dy*math.sin(angle),y+dx*math.sin(angle)+dy*math.cos(angle),z)
for index,(ident,show,center,w,h) in enumerate(archives):
    x,y,z=center
    angle=0 if index<3 else -.65
    # Deeply rooted plateau reaches all the way to the poured ground, rather
    # than masquerading as a freestanding wax photograph frame.
    body=rounded_block('terrace_'+ident,station_point(x,y,angle,0,.85,(z+h/2+.55)/2),(w+1.15,3.1,z+h/2+.55),cold,.63,.12)
    body.rotation_euler.z=angle
    archive_cuts.append((ident,station_point(x,y,angle,0,-.72,z),w+.30,h+.30,2.6,angle))
    screen=front_face('archive_'+ident,station_point(x,y,angle,0,.23,z),w,h,blank,angle)
    bed=rounded_block('archive_'+ident+'_bed',station_point(x,y,angle,0,.30,z),(w+.03,.10,h+.04),cold,.055,0);bed.rotation_euler.z=angle
    caption=front_face('caption_'+ident,station_point(x,y,angle,0,-.86,z-h/2-.32),w*.94,.35,tile,angle)
    archive_manifest.append({'id':ident,'show':show,'screen':screen.name,'caption':caption.name,'centerBlender':list(screen.location),'width':w,'height':h,'normalBlender':[math.sin(angle),-math.cos(angle),0],'railBlender':[x-4.6,y-3.2,3.1]})
    # Two broad boundary flows reinforce the mass. The clean aperture is cut
    # through these too, so not even their relaxed silhouettes can cover ink.
    for drip_index,dx in enumerate([-(w+.55)/2,(w+.55)/2]):
        path=[station_point(x,y,angle,dx,-.59,z+h/2+.27),station_point(x,y,angle,dx+.07,-.76,z+h/2-.5),station_point(x,y,angle,dx+.10,-.81,.45)]
        drip('terrace_'+ident+'_sheet_'+str(drip_index),path,.18+.035*drip_index,cold)
    for crest_index in range(7):
        dx=(crest_index/6-.5)*(w+.42)
        crest=poured_crest('terrace_'+ident+'_crest_'+str(crest_index),station_point(x,y,angle,dx,-.49,z+h/2+.31+.065*math.sin(crest_index*2.1+index)),(.51,.38,.28+.045*(crest_index%3)));crest.rotation_euler.z=angle
    first_for_show=not any(d['show']==show for d in destination_manifest)
    if first_for_show and show in ['got','dexter','severance','sherlock','archer','breaking-bad']:
        links=['live'] if show=='severance' else ['archive']+(['timeline'] if show=='dexter' else [])
        for link_index,kind in enumerate(links):
            dx=(link_index-(len(links)-1)/2)*1.45
            face=front_face('destination_'+show+'_'+kind,station_point(x,y,angle,dx,-.885,z-h/2-.65),1.35,.27,tile,angle)
            destination_manifest.append({'show':show,'kind':kind,'surface':face.name,'parent':screen.name})

# Partial molten skins lie exactly on the real channel, with deformations rooted
# in that surface. These are not floating tubes or photographic specular strokes.
for index in range(6):
    verts=[];uv=[];length=5.8+index*.35
    for j in range(45):
        t=j/44;y=-7+t*length;x=-6.4+index*1.38+.42*math.sin(t*3.7+index)
        width=.20+.14*math.sin(t*math.pi)
        for k in range(5):
            xx=x+(k/4-.5)*width;verts.append((xx,y,terrain_height(xx,y)+.027));uv.append((k/4,t))
    faces=[]
    for j in range(44):
        for k in range(4):a=j*5+k;faces.append((a,a+1,a+6,a+5))
    film=mesh('molten_channel_'+str(index),verts,faces,wet,uv)
    film.shape_key_add(name='Basis');key=film.shape_key_add(name='Return_uphill')
    for i,point in enumerate(key.data):
        t=(i//5)/44;point.co.y+=.40*math.sin(t*math.pi);point.co.z+=.055*math.sin(t*math.pi)

# Genuine shallow bowl; its ink plane is tangent to the physical pressure floor.
verts=[(-6.6,-4.0,terrain_height(-6.6,-4.0)+.034)];uv=[(.5,.5)]
segments,rings=64,14
for j in range(1,rings+1):
    r=j/rings
    for k in range(segments):
        angle=k/segments*math.tau;x=-6.6+2.45*r*math.cos(angle);y=-4.0+1.62*r*math.sin(angle)
        verts.append((x,y,terrain_height(x,y)+.033));uv.append((.5+.5*r*math.cos(angle),.5+.5*r*math.sin(angle)))
faces=[]
for k in range(segments):faces.append((0,1+k,1+(k+1)%segments))
for j in range(rings-1):
    for k in range(segments):
        a=1+j*segments+k;b=1+j*segments+(k+1)%segments;faces.append((a,a+segments,b+segments,b))
pool=mesh('again_pressure_pool',verts,faces,wet,uv)
pool.shape_key_add(name='Basis');press=pool.shape_key_add(name='Pressure')
for point in press.data:
    r=math.sqrt(((point.co.x+6.6)/2.45)**2+((point.co.y+4.0)/1.62)**2);point.co.z-=.12*max(0,1-r*r)

def flame(name,radius,height,material,offset=(0,0,0)):
    verts=[];uv=[];segments,layers=24,28
    for j in range(layers+1):
        t=j/layers;rr=radius*math.sin(t*math.pi)**.76*(1-.35*t)
        for k in range(segments):
            a=k/segments*math.tau;verts.append((-6.79+offset[0]+rr*math.cos(a)+.10*t*t,-.49+offset[1]+rr*.6*math.sin(a),9.60+offset[2]+t*height));uv.append((k/segments,t))
    faces=[]
    for j in range(layers):
        for k in range(segments):a=j*segments+k;faces.append((a,j*segments+(k+1)%segments,(j+1)*segments+(k+1)%segments,a+segments))
    return mesh(name,verts,faces,material,uv)
flame('flame_outer',.26,1.83,flamemat);flame('flame_core',.115,1.10,coremat,(0,-.035,.035))
for ob in collection.all_objects:
    if ob.name in ['tapered_front_candle','bent_charred_wick','hanging_collapsed_wax_sheet','flame_outer','flame_core'] or ob.name.startswith('candle_poured_fold_'):
        for vertex in ob.data.vertices:vertex.co.x+=1.5

# One tiny brass crown caught in a foreground fold, with an exposed gold edge.
crown_center=Vector((-3.73,-6.78,terrain_height(-3.73,-6.78)+.13))
verts=[];faces=[];points=10
for row in range(2):
    for i in range(points):
        a=i/points*math.tau;r=.19;z=.02 if row==0 else (.33 if i%2==0 else .12)
        verts.append(tuple(crown_center+Vector((math.cos(a)*r,math.sin(a)*r,z))))
for i in range(points):faces.append((i,(i+1)%points,points+(i+1)%points,points+i))
crown=mesh('crease_crown',verts,faces,gold,smooth=False)
for point in crown.data.vertices:point.co-=crown_center
crown.location=crown_center
sol=crown.modifiers.new('Thin_brass_body','SOLIDIFY');sol.thickness=.018;apply(crown,sol);unwrap(crown)

scene=bpy.context.scene;scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.055,.009,.032,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.20
def light(name,kind,position,color,energy,size=3):
    data=bpy.data.lights.new(name,kind);data.color=color;data.energy=energy
    if kind=='AREA':data.shape='DISK';data.size=size
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=position
    ob.rotation_euler=(Vector((1,0,3))-ob.location).to_track_quat('-Z','Y').to_euler();return ob
light('Flame_contact','POINT',(-5.3,-.6,10.45),(1,.48,.12),700)
light('Broad_warm_readability','AREA',(-5,-8,10),(1,.69,.42),900,7)
light('Cool_terrace_edge','AREA',(12,5,10),(.27,.44,.72),1100,5)
camera_data=bpy.data.cameras.new('reference_macro_camera');camera=bpy.data.objects.new('reference_macro_camera',camera_data);scene.collection.objects.link(camera)
camera.location=(0,-23.6,9.0);target=Vector((1.0,.5,4.3));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera_data.lens=33
scene.camera=camera;scene.render.resolution_x=1487;scene.render.resolution_y=1058;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
# Join real touching volumes and remesh their macro intersections. This produces
# continuous wax banks, without detached picture-frame outlines or pasted cords.
static=[ob for ob in collection.all_objects if ob.type=='MESH' and (ob.name.startswith(('terrace_','bank_lip_')) or ob.name in ['continuous_poured_floor','integrated_foreground_clock_bank','cropped_candle_wall'])]
bpy.ops.object.select_all(action='DESELECT')
for ob in static:ob.select_set(True)
bpy.context.view_layer.objects.active=ground;bpy.ops.object.join();mass=bpy.context.object;mass.name='continuous_sculpted_wax_mass'
outward(mass)
remesh=mass.modifiers.new('Connected_voxel_sculpt','REMESH');remesh.mode='VOXEL';remesh.voxel_size=.15;remesh.use_smooth_shade=True;apply(mass,remesh)
smooth=mass.modifiers.new('Melted_surface_relaxation','SMOOTH');smooth.factor=.5;smooth.iterations=4;apply(mass,smooth)
# The broad relief was already authored in the floor and soft closed volumes.
# No random macro displacement is allowed to turn wax into jagged torn skin.
decimate=mass.modifiers.new('Runtime_macro_level','DECIMATE');decimate.ratio=.25;apply(mass,decimate)
outward(mass)
# Reading negatives are final geometry operations. Each screen sits .35 m in
# front of the real recess back; remeshing cannot fill this clean clearance.
for index,unit in enumerate(['days','hours','minutes','seconds']):
    x=-1.0+index*2.38;z=1.97+index*.045
    cut_recess(mass,'clock_cavity_'+unit,(x,-4.00,z+.03),2.09,2.54,2.15)
for ident,center,w,h,depth,angle in archive_cuts:
    cut_recess(mass,'archive_recess_'+ident,center,w,h,depth,angle)
bevel=mass.modifiers.new('Soft_final_cavity_edges','BEVEL');bevel.width=.055;bevel.segments=3;bevel.limit_method='ANGLE';bevel.angle_limit=.58;apply(mass,bevel)
decimate=mass.modifiers.new('Preserve_macro_reduce_micro_triangulation','DECIMATE');decimate.ratio=.34;apply(mass,decimate)
outward(mass)
unwrap(mass)
# Fit every molten skin to the final exported ground, including its uphill pose.
# This prevents the thin film from becoming disconnected strips above a sculpt.
for skin in [pool]+[ob for ob in collection.all_objects if ob.name.startswith('molten_channel_')]:
    for key in skin.data.shape_keys.key_blocks:
        for point in key.data:
            hit,where,normal,index=mass.ray_cast(Vector((point.co.x,point.co.y,point.co.z+2)),Vector((0,0,-1)))
            if hit:point.co.z=where.z+(.055 if skin==pool else .008)
    if skin==pool:
        for point in skin.data.shape_keys.key_blocks['Pressure'].data:
            r=math.sqrt(((point.co.x+6.6)/2.45)**2+((point.co.y+4.0)/1.62)**2);point.co.z-=.12*max(0,1-r*r)
# The candle's poured folds are a second closed sculpt so its small bounded
# restoration can deform the real body. There are no overlapping wax sleeves.
bpy.ops.object.select_all(action='DESELECT')
for ob in collection.all_objects:
    if ob==main_candle or ob.name.startswith('candle_poured_fold_'):ob.select_set(True)
bpy.context.view_layer.objects.active=main_candle;bpy.ops.object.join()
outward(main_candle)
remesh=main_candle.modifiers.new('Continuous_candle_fold_skin','REMESH');remesh.mode='VOXEL';remesh.voxel_size=.065;remesh.use_smooth_shade=True;apply(main_candle,remesh)
smooth=main_candle.modifiers.new('Rounded_poured_candle_folds','SMOOTH');smooth.factor=.5;smooth.iterations=3;apply(main_candle,smooth)
outward(main_candle);unwrap(main_candle)
ao=bpy.data.images.new('wax-crevice-ao',1024,1024,alpha=False);ao.colorspace_settings.name='Non-Color'
for slot in mass.material_slots:
    texture=slot.material.node_tree.nodes.new('ShaderNodeTexImage');texture.name='Bake_crevice_AO';texture.image=ao;slot.material.node_tree.nodes.active=texture
bpy.ops.object.select_all(action='DESELECT');mass.select_set(True);bpy.context.view_layer.objects.active=mass
scene.cycles.samples=16;scene.render.bake.margin=4;bpy.ops.object.bake(type='AO')
ao.filepath_raw=str(ROOT/'materials'/'wax-crevice-ao.png');ao.file_format='PNG';ao.save()
for ob in [main_candle]:
    decimate=ob.modifiers.new('Candle_runtime_level','DECIMATE');decimate.ratio=.28;apply(ob,decimate)
main_candle.shape_key_add(name='Basis');tip=main_candle.shape_key_add(name='Restored_tip')
for point in tip.data:
    weight=max(0,min(1,(point.co.z-7.6)/1.65));point.co.z+=.24*weight*weight
import importlib.util
clearance_spec=importlib.util.spec_from_file_location('wax_recess_clearance',ROOT/'authoring'/'refine_navigation_geometry.py')
clearance_module=importlib.util.module_from_spec(clearance_spec);clearance_spec.loader.exec_module(clearance_module)
clearance_module.refine(scene,archive_manifest)
for ob in collection.all_objects:
    if ob.type=='MESH' and not ob.data.shape_keys:
        triangle=ob.modifiers.new('Export_reading_normals_tangents','TRIANGULATE');triangle.keep_custom_normals=True;apply(ob,triangle)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'authoring'/'scene.blend'))
# Export ONLY the authored bundle plus its artist camera. No duplicate lights.
bpy.ops.object.select_all(action='DESELECT')
for ob in collection.all_objects:ob.select_set(True)
camera.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'scene.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=True,export_lights=False,export_yup=True,export_texcoords=True,export_normals=True,export_tangents=True)
to_gltf=lambda p:[p[0],p[2],-p[1]]
for ob in collection.all_objects:
    if ob.type=='MESH':ob.data.calc_loop_triangles()
triangles=sum(len(ob.data.loop_triangles) for ob in collection.all_objects if ob.type=='MESH')
manifest={'concept':'after-the-flame','tool':'Blender 4.5.14 LTS','status':'authored candidate; browser fidelity not accepted','units':'metres','source':'project-authored analytic sculpt/profiles, joined voxel mass and explicit Boolean recesses; no photographed scenery','camera':{'positionGLTF':to_gltf(camera.location),'targetGLTF':to_gltf(target),'fov':math.degrees(2*math.atan(camera_data.sensor_width/(2*camera_data.lens)/(1487/1058)))},'clock':clock,'reset':'again_pressure_pool','secret':'crease_crown','archives':archive_manifest,'destinations':destination_manifest,'critical':['scene.glb','materials/cream-wax-albedo.png','materials/wax-pore-normal.png','materials/cooled-wax-roughness.png','materials/molten-film-roughness.png','materials/wax-crevice-ao.png'],'triangleCount':triangles,'motion':['molten_channel_0..5 Return_uphill morph','again_pressure_pool Pressure morph','flame vertex bend','bounded candle-tip contraction'],'limits':'Wax thickness/transmission is a surface approximation, not volumetric scattering. AO is baked separately from actual sculpt; no baked direct light. No simulated fluid.'}
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2))
(ROOT/'lighting'/'rig.json').write_text(json.dumps({'warmKey':[-5,10,8],'flame':[-6.8,8.45,.6],'coolRim':[12,10,-5],'reference':'flame-contact warm pools and cool rear-right relief, no photographed specular light'},indent=2))
if PROOFS:
    scene.render.filepath=str(ROOT/'inspection'/'final-light.png');bpy.ops.render.render(write_still=True)
    clay=material('Neutral_inspection_clay',(.48,.48,.48),.7)
    scene.view_layers[0].material_override=clay;scene.render.filepath=str(ROOT/'inspection'/'clay-opening.png');bpy.ops.render.render(write_still=True)
    camera.location=(9,-17,10);camera.rotation_euler=(Vector((0,1,4))-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(ROOT/'inspection'/'clay-three-quarter.png');bpy.ops.render.render(write_still=True)
    scene.view_layers[0].material_override=None
print('Wax bundle authored:',ROOT)
