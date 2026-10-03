"""Not Yet Ripe — authored longitudinal botanical specimens, Blender4.5.14.
Actual mesh anatomy, no photographic scenery or baked countdowns/screenshots.
Run --background --python this_file.py -- [--proofs] [--mobile].
"""
import bpy,bmesh,math,json,random,sys
import numpy as np
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];MOBILE='--mobile' in sys.argv;PROOFS='--proofs' in sys.argv
random.seed(1327);rng=np.random.default_rng(1327)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.context.preferences.filepaths.save_version=0
collection=bpy.data.collections.new('LivingSpecimen');bpy.context.scene.collection.children.link(collection)
def own(ob):
    for c in list(ob.users_collection):c.objects.unlink(ob)
    collection.objects.link(ob);return ob
def mesh(name,verts,faces,mat,uv=None,smooth=True):
    data=bpy.data.meshes.new(name+'_geometry');data.from_pydata(verts,[],faces);data.update()
    ob=bpy.data.objects.new(name,data);collection.objects.link(ob);data.materials.append(mat)
    for p in data.polygons:p.use_smooth=smooth
    if uv:
        layer=data.uv_layers.new(name='AnatomicalUV')
        for p in data.polygons:
            for li in p.loop_indices:layer.data[li].uv=uv[data.loops[li].vertex_index]
    return ob
def parent(ob,p):
    bpy.context.view_layer.update()
    world=ob.matrix_world.copy();ob.parent=p;ob.matrix_world=world;return ob
def empty(name,position=(0,0,0)):
    ob=bpy.data.objects.new(name,None);collection.objects.link(ob);ob.location=position;bpy.context.view_layer.update();return ob
def apply(ob,mod):
    bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_apply(modifier=mod.name)
def normals(ob):
    bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(ob.data);bm.free();ob.data.update()
def material(name,color,rough,trans=0,coat=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1);p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['IOR'].default_value=1.39
    p.inputs['Transmission Weight'].default_value=trans;p.inputs['Coat Weight'].default_value=coat;p.inputs['Coat Roughness'].default_value=.25
    return m
bark=material('CambiumBark',(.38,.34,.13),.79,0,.12);peel=material('DryPittedPeel',(.41,.54,.035),.46,0,.38)
pith=material('OpaqueFibrousPith',(.82,.75,.50),.86);flesh=material('MoistLongitudinalFlesh',(.88,.80,.49),.12,.14,.70)
flesh.node_tree.nodes.get('Principled BSDF').inputs['Coat Roughness'].default_value=.085
membrane=material('FineIvoryMembranes',(.86,.78,.56),.30,.085,.25);leafmat=material('WaxyOliveLeaf',(.31,.39,.10),.56,.075,.20)
veinmat=material('RaisedCentralVein',(.37,.40,.12),.68);papermat=material('CottonSpecimenPaper',(.84,.77,.60),.98)
scarwood=material('FreshExposedCambium',(.25,.20,.12),.87)
threadmat=material('HempThread',(.25,.20,.08),.92);inkblank=material('BlankRuntimeInk',(.88,.80,.54),.8)
gold=material('GoldNotchAndCrown',(.64,.35,.055),.25);gold.node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.84
seedmat=material('SparseCitrusSeeds',(.92,.84,.65),.58);bruise=material('BruisedPlumFruit',(.16,.055,.09),.73)
resetpeel=material('RipeSplitResetPeel',(.83,.37,.032),.34,0,.56)
resetbruise=material('BruisedSplitResetPeel',(.27,.07,.095),.45,0,.35)

# Correlated microscopic families. Macro ridges, cuts and leaves are real geometry.
N=512;u,v=np.meshgrid(np.linspace(0,1,N),np.linspace(0,1,N));noise=rng.normal(0,1,(N,N))
def image(name,array,linear=True):
    h,w=array.shape[:2];im=bpy.data.images.new(name,w,h,alpha=True)
    if linear:im.colorspace_settings.name='Non-Color'
    if array.ndim==2:array=np.stack([array,array,array,np.ones_like(array)],-1)
    elif array.shape[-1]==3:array=np.concatenate([array,np.ones((h,w,1))],-1)
    im.pixels.foreach_set(np.asarray(array,dtype=np.float32).ravel());im.filepath_raw=str(ROOT/'materials'/f'{name}.png');im.file_format='PNG';im.save();return im
def normal_map(name,height,strength):
    nx=-np.gradient(height,axis=1)*strength;ny=-np.gradient(height,axis=0)*strength;n=np.stack([nx,ny,np.ones_like(nx)],-1);n/=np.linalg.norm(n,axis=2)[...,None]
    return image(name,n*.5+.5)
barkh=.24*np.sin(u*78+np.sin(v*23)*5)+.06*noise+.13*np.sin(u*137+v*20)
barknormal=normal_map('bark-fissure-normal',barkh,1.8)
moss=np.clip(.28+.24*np.sin(u*22+np.sin(v*14)*2)+.16*np.cos(u*47-v*17),0,1)
barkbase=np.array([.33,.24,.105])*(1-moss[...,None])+np.array([.39,.40,.135])*moss[...,None]
barkalbedo=image('bark-unlit-albedo',np.clip(barkbase+barkh[...,None]*np.array([.30,.23,.135]),.025,.60),False)
peelh=.3*noise+.12*np.sin(u*540)*np.cos(v*490)
peelnormal=normal_map('peel-pore-normal',peelh,.52)
peelmask=image('peel-ripeness-mask',np.clip(.4+.19*np.sin(u*12+np.sin(v*11)*2)+.13*np.cos(v*19-u*5),0,1))
peelrough=image('dry-peel-roughness',np.clip(.36+.07*noise+.17*np.sin(u*9+v*17)**2,.22,.67))
# Unequal wet vesicles and narrow longitudinal membranes, without painted light.
fleshh=noise*.013
for k in range(1100):
    cx,cy=rng.uniform(0,1,2);sx=rng.uniform(.0014,.0034);sy=rng.uniform(.007,.025)
    dx=(u-cx+.0025*np.sin(v*14+k))/sx;dy=(v-cy)/sy
    fleshh+=.24*np.exp(-(dx*dx+dy*dy)*1.6)
fibre=np.sin((u+.009*np.sin(v*17))*math.pi*116)
fleshh+=np.maximum(0,fibre)**14*.045
fleshnormal=normal_map('vesicle-normal',fleshh,2.8)
fleshColour=np.array([.91,.83,.56])+fleshh[...,None]*np.array([.18,.16,.13])+.035*np.sin(u*19+np.sin(v*5))[...,None]
fleshColour-=np.maximum(0,fibre)[...,None]**14*np.array([.028,.021,.010])
fleshalbedo=image('flesh-unlit-albedo',np.clip(fleshColour,.05,.97),False)
fleshthickness=image('flesh-thickness',np.clip(.38+.30*np.sin(u*math.pi)**2+.12*np.sin(v*12),.12,.88))
leafveins=np.exp(-((u-.5)/.012)**2)*.32
for j in range(12):
    rise=(j+.5)/13;line=rise+abs(u-.5)*(.38+.06*math.sin(j))
    leafveins+=np.exp(-((v-line)/.0042)**2)*.18
    for k in [-1,1]:
        finer=line+(u-.5)*k*.23+.04
        leafveins+=np.exp(-((v-finer)/.0018)**2)*.024
leafnormal=normal_map('leaf-vein-normal',leafveins+noise*.014,2.2)
leafMottle=.065*np.sin(u*23+np.sin(v*12)*2)+.042*np.cos(v*47-u*17)
edgeAge=(abs(u-.5)*2)**7*(.035+.045*np.sin(v*41)**2)
leafColour=np.array([.39,.43,.115])+leafveins[...,None]*np.array([.45,.32,.15])+leafMottle[...,None]+noise[...,None]*.018
leafColour+=edgeAge[...,None]*np.array([1.6,.55,-.3])
leafalbedo=image('leaf-unlit-albedo',np.clip(leafColour,.025,.8),False)
leafthickness=image('leaf-thickness',np.clip(.16+.65*(1-abs(u-.5)*2)+leafveins,.08,.95))
paperh=noise*.025+.008*np.sin(v*1200)
papernormal=normal_map('cotton-fibre-normal',paperh,.45)
paperalbedo=image('cotton-unlit-albedo',np.clip(np.array([.86,.81,.68])+paperh[...,None]*.55,.68,.96),False)
def maps(mat,normal=None,albedo=None,rough=None):
    ns=mat.node_tree.nodes;ls=mat.node_tree.links;p=ns.get('Principled BSDF')
    if normal:
        tex=ns.new('ShaderNodeTexImage');tex.image=normal;nm=ns.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.42;ls.new(tex.outputs['Color'],nm.inputs['Color']);ls.new(nm.outputs['Normal'],p.inputs['Normal'])
    if albedo:
        tex=ns.new('ShaderNodeTexImage');tex.image=albedo;ls.new(tex.outputs['Color'],p.inputs['Base Color'])
    if rough:
        tex=ns.new('ShaderNodeTexImage');tex.image=rough;ls.new(tex.outputs['Color'],p.inputs['Roughness'])
maps(bark,barknormal,barkalbedo);maps(peel,peelnormal,None,peelrough);maps(flesh,fleshnormal,fleshalbedo);maps(leafmat,leafnormal,leafalbedo);maps(papermat,papernormal,paperalbedo)
maps(resetpeel,peelnormal,None,peelrough);maps(resetbruise,peelnormal,None,peelrough)
figHeight=.055*np.sin(u*math.pi*27+np.sin(v*15)*.5)+.015*noise
figNormal=normal_map('weathered-fig-normal',figHeight,1.25)
figCreases=np.maximum(0,np.sin(u*math.pi*27+np.sin(v*15)*.5))**12
figMottle=.035*np.sin(u*19+v*22)+.025*noise
figAlbedo=image('weathered-fig-albedo',np.clip(np.array([.19,.075,.105])+figMottle[...,None]-figCreases[...,None]*np.array([.09,.05,.05]),.015,.45),False)
maps(bruise,figNormal,figAlbedo)

def catmull(points,t):
    f=t*(len(points)-1);i=min(len(points)-2,int(f));s=f-i
    a=Vector(points[max(0,i-1)]);b=Vector(points[i]);c=Vector(points[i+1]);d=Vector(points[min(len(points)-1,i+2)])
    return .5*((2*b)+(-a+c)*s+(2*a-5*b+4*c-d)*s*s+(-a+3*b-3*c+d)*s*s*s)
def wood(name,points,r0,r1,mat=bark,steps=100,sides=20,gnarl=1):
    verts=[];uv=[]
    for j in range(steps+1):
        t=j/steps;p=catmull(points,t);a=catmull(points,max(0,t-.002));b=catmull(points,min(1,t+.002));tangent=(b-a).normalized()
        cross=tangent.cross(Vector((0,1,0))).normalized();up=tangent.cross(cross).normalized();r=r0*(1-t)+r1*t
        for k in range(sides):
            angle=k/sides*math.tau;ridge=1+gnarl*(.13*math.sin(angle*7+t*21)+.055*math.sin(angle*13-t*37)+.10*math.sin(t*76))
            knob=gnarl*.16*math.exp(-((t-.31)/.035)**2)*max(0,math.cos(angle-.7))**6+gnarl*.12*math.exp(-((t-.66)/.025)**2)*max(0,math.cos(angle-3.2))**6
            vtx=p+(cross*math.cos(angle)+up*math.sin(angle))*r*(ridge+knob);verts.append(tuple(vtx));uv.append((k/sides,t*max(1,steps/18)))
    faces=[]
    for j in range(steps):
        for k in range(sides):a=j*sides+k;b=j*sides+(k+1)%sides;faces.append((a,b,b+sides,a+sides))
    faces.extend([tuple(reversed(range(sides))),tuple(steps*sides+k for k in range(sides))]);ob=mesh(name,verts,faces,mat,uv);normals(ob);return ob
mainrig=empty('branch_hierarchy')
primary=[(-9,.2,-5),(-8.1,.1,-1.5),(-7.3,.5,3.2),(-5,.35,6.5),(-1,.2,7.7),(3,.7,8.4),(6.8,.6,9.0),(9,.75,12)]
if MOBILE:primary=[(-4,.2,-5),(-3.5,.1,-1.5),(-3.0,.5,3.0),(-2.2,.35,6.8),(-.4,.2,8.9),(1.6,.7,9.4),(3,.6,11.0),(4.2,.75,13)]
parent(wood('gnarled_diagonal_branch',primary,.65,.22,steps=180,sides=28),mainrig)
parent(wood('low_left_offshoot',[(-8,.1,-1.5),(-10,-.1,-2.6),(-12,.1,-3.0)],.34,.06,steps=46),mainrig)
curl_branch=parent(wood('upper_curl',[(-1,.2,7.7),(1.6,.8,10),(4,.7,10.9),(5.1,.2,10.1),(4.5,-.1,9.4)],.27,.065,steps=70),mainrig)
curl_branch.shape_key_add(name='Basis');tip=curl_branch.shape_key_add(name='Bounded_tip_return')
for i,point in enumerate(tip.data):
    t=(i//20)/70;weight=max(0,(t-.78)/.22);point.co+=Vector((.0,-.0,.18))*weight*weight
parent(wood('reset_fork',[(-7.8,.1,-2.5),(-6.4,-.3,-2.3),(-4.9,-.6,-1.8)],.32,.07,steps=45),mainrig)
lower_arc=[(-7.8,.3,-2.5),(-4.8,.7,-3.3),(-1.9,.9,-2.4),(1.0,.8,-.25),(4.3,.6,1.4),(7.1,.5,1.8),(9.7,.7,4.0)]
if MOBILE:lower_arc=[(-3.5,.3,-2.5),(-2,.7,-4.2),(0,.9,-3.8),(2.2,.8,-1.9),(3.5,.6,1.2)]
parent(wood('gnarled_lower_archive_arc',lower_arc,.31,.10,steps=120,sides=18),mainrig)
branch_paths=[primary,lower_arc,[(-1,.2,7.7),(1.6,.8,10),(4,.7,10.9),(5.1,.2,10.1),(4.5,-.1,9.4)]]
def nearest_branch(point):return min((catmull(path,t) for path in branch_paths for t in np.linspace(0,1,100)),key=lambda p:(p-point).length)
# Cambium scars are irregular layered ridges sunk into the branch, not painted highlights.
for j,t in enumerate([.14,.26,.39,.51,.67,.81]):
    p=catmull(primary,t);points=[]
    for k in range(24):
        a=k/23*math.tau*.89;points.append(tuple(p+Vector((math.sin(a)*.33,-.36-.045*math.sin(a*3),math.cos(a)*.23))))
    parent(wood('cambium_scar_'+str(j),points,.046,.025,scarwood,steps=46,sides=8,gnarl=.3),mainrig)
for j in range(30):
    t=.08+j*.027;point=catmull(primary,t);radius=.65*(1-t)+.22*t
    # Unequal cambium plates follow the true branch tangent, with lifted tears.
    tangent=(catmull(primary,min(1,t+.005))-catmull(primary,max(0,t-.005))).normalized();cross=tangent.cross(Vector((0,1,0))).normalized()
    angle=.35+j*2.399;offset=cross*math.cos(angle)*radius+Vector((0,-1,0))*abs(math.sin(angle))*radius
    length=.20+.17*(j%4)/3;width=.065+.028*(j%3);p=point+offset
    outline=[(-.83,-.8),(.12,-1),(.81,-.60),(1,.18),(.57,.80),(-.08,.65),(-.67,1),(-1,.21)]
    vv=[tuple(p+tangent*length*a+cross*width*b+Vector((0,-.018*(1+a),0))) for a,b in outline]
    patch=mesh('layered_cambium_plate_'+str(j),vv,[tuple(range(8))],scarwood,[(a*.5+.5,b*.5+.5) for a,b in outline]);solid=patch.modifiers.new('Peeling_layer_thickness','SOLIDIFY');solid.thickness=.035;apply(patch,solid);parent(patch,mainrig)
for j,t in enumerate([.16,.32,.43,.59,.71,.82]):
    point=catmull(primary,t);radius=.65*(1-t)+.22*t
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=12,location=point+Vector((.10,-radius*.85,.04)));knot=own(bpy.context.object);knot.name='raised_branch_knot_'+str(j);knot.scale=(.20+j%2*.09,.15,.29+j%3*.055);knot.data.materials.append(bark)
    for vertex in knot.data.vertices:vertex.co*=1+.11*math.sin(vertex.co.z*8+vertex.co.x*13)
    parent(knot,mainrig)

def front(name,w,h,mat,center=(0,0,0),nx=2,nz=2):
    verts=[];uv=[]
    for j in range(nz+1):
        for i in range(nx+1):verts.append(((i/nx-.5)*w,0,(j/nz-.5)*h));uv.append((i/nx,j/nz))
    faces=[]
    for j in range(nz):
        for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
    ob=mesh(name,verts,faces,mat,uv,False);ob.location=center;return ob

def leaf(name,center,length,width,rotation=(0,0,0),fold=.25,curl=.2,gold_notch=False):
    rows=24 if MOBILE else 32;cols=12 if MOBILE else 18;verts=[];uv=[]
    for j in range(rows+1):
        t=j/rows;nick=.12*math.exp(-((t-.31)/.024)**2)+.085*math.exp(-((t-.79)/.025)**2)
        w=width*.5*math.sin(math.pi*t)**.74*(1+.032*math.sin(t*71)-nick)
        for i in range(cols+1):
            q=i/cols*2-1;x=q*w;z=(t-.5)*length;y=fold*q*q*math.sin(math.pi*t)+curl*t*t+.045*math.sin(t*8+q*2)+.15*max(0,(t-.63)/.37)**2*q
            verts.append((x,y,z));uv.append((i/cols,t))
    faces=[]
    for j in range(rows):
        for i in range(cols):a=j*(cols+1)+i;faces.append((a,a+cols+1,a+cols+2,a+1))
    ob=mesh(name,verts,faces,leafmat,uv);solid=ob.modifiers.new('Leaf_actual_thin_edge','SOLIDIFY');solid.thickness=.016;apply(ob,solid)
    ob.location=center;ob.rotation_euler=(rotation[0],rotation[2],rotation[1])
    vein=wood(name+'_central_vein',[(0,curl*t*t-.028,(t-.5)*length) for t in np.linspace(.025,.97,12)],.022,.008,veinmat,steps=38,sides=6,gnarl=0);vein.parent=ob
    parent(ob,mainrig)
    bpy.context.view_layer.update();root=ob.matrix_world@Vector((0,.02,-length*.49));near=nearest_branch(root)
    petiole=wood(name+'_petiole',[tuple(near),tuple((near+root)*.5+Vector((.04,.12,.1))),tuple(root)],.063,.022,bark,steps=24,sides=8,gnarl=.15);parent(petiole,mainrig)
    if gold_notch:
        ob.shape_key_add(name='Basis');key=ob.shape_key_add(name='Unfold_crown')
        for i,p in enumerate(key.data):
            t=verts[i%len(verts)][2]/length+.5;q=abs(verts[i%len(verts)][0])/(width*.5+.001);p.co.y+=.52*math.exp(-((p.co.z-.10)/.75)**2)*(1-q*.3)-.24*q*math.sin(math.pi*t)
    return ob

clocknames=[];fruitrigs=[];peels=[]
fruitposes=[(-3.25,-.45,5.85,2.74,4.05,-.04),(-.60,-.62,5.90,2.52,4.27,.035),(2.08,-.38,5.80,2.65,4.16,-.025),(4.85,-.30,5.63,2.85,4.15,.035)]
if MOBILE:fruitposes=[(-1.65,-.45,7.15,2.45,4.16,-.055),(1.55,-.56,7.38,2.38,4.25,.045),(-1.48,-.50,2.05,2.53,4.20,-.028),(1.72,-.35,2.25,2.55,4.28,.06)]
def profile(t,w,seed):
    exponent=[.42,.56,.48,.40][seed%4]
    return w*.5*max(.001,math.sin(math.pi*t))**exponent*(1+.07*math.sin(t*math.pi*3+seed)+.012*math.cos(t*22+seed))
def pulp_depth(x,t,w,index):
    rad=max(.025,profile(t,w,index)-.415);q=x/rad
    lobes=0
    for k,(center,width,height) in enumerate([(-.68,.20,.055),(-.27,.28,.135),(.21,.23,.10),(.65,.22,.065)]):
        path=center+.048*math.sin(t*7+k+index*.61);lobes+=height*math.exp(-((q-path)/width)**2)
    fibre=.013*math.sin(q*83+t*11+index)*math.sin(t*math.pi)**.7
    seam=.024*math.exp(-((q-.032*math.sin(t*13))/.05)**2)
    return -.072-lobes*math.sin(math.pi*t)**.48-.020*math.sin(t*17+q*6+index)**2+fibre+seam
def specimen(index,pose):
    x,y,z,w,h,tilt=pose;rig=empty('fruit_rig_'+str(index),(x,y,z+h*.5));rig.rotation_euler.y=tilt;parent(rig,mainrig)
    steps=50 if MOBILE else 70;sides=36 if MOBILE else 52;verts=[];uv=[]
    # A longitudinally opened back shell. The actual pith opening is pointed,
    # uneven and full height; the cut is not a circular torus or coin.
    for j in range(steps+1):
        t=j/steps;rad=profile(t,w,index);zz=(t-1)*h
        for k in range(sides+1):
            a=k/sides*math.pi;asym=1+.045*math.sin(a*5+t*15+index);xx=math.cos(a)*rad*asym;yy=math.sin(a)*w*.41*(math.sin(math.pi*t)**.8)+.02
            verts.append((xx,yy,zz));uv.append((k/sides,t))
    faces=[]
    for j in range(steps):
        for k in range(sides):a=j*(sides+1)+k;faces.append((a,a+1,a+sides+2,a+sides+1))
    shell=mesh('clock_peel_'+str(index),verts,faces,peel,uv);shell.parent=rig
    solid=shell.modifiers.new('Uneven_pith_volume','SOLIDIFY');solid.thickness=.11;apply(shell,solid);peels.append(shell.name)
    # Nonuniform anatomical rim authored as lengthwise strips, with real cross
    # section. Pith is opaque, wet sacs are a separate material and relief.
    for side in [-1,1]:
        lipv=[];lipuv=[]
        for j in range(steps+1):
            t=j/steps;rad=profile(t,w,index)
            for k in range(7):
                s=k/6;lipv.append((side*(rad-.30*s),-.02-.135*math.sin(s*math.pi), (t-1)*h));lipuv.append((s,t))
        lipf=[]
        for j in range(steps):
            for k in range(6):
                a=j*7+k;lipf.append((a,a+7,a+8,a+1) if side==1 else(a,a+1,a+8,a+7))
        skin=mesh('front_peel_lip_'+str(index)+'_'+str(side),lipv,lipf,peel,lipuv);skin.parent=rig;peels.append(skin.name)
        pv=[];pu=[]
        for j in range(steps+1):
            t=j/steps;rad=profile(t,w,index)
            for k in range(7):
                s=k/6;width=.115+.035*math.sin(t*18+index+side);xx=side*(rad-.30-width*s);yy=-.055-.065*math.sin(s*math.pi);pv.append((xx,yy,(t-1)*h));pu.append((s,t))
        pf=[]
        for j in range(steps):
            for k in range(6):a=j*7+k;pf.append((a,a+7,a+8,a+1) if side==1 else(a,a+1,a+8,a+7))
        ob=mesh('pith_lobe_'+str(index)+'_'+str(side),pv,pf,pith,pu);ob.parent=rig
    # The cut flesh has elongated segment relief outside the central print zone.
    rows=60 if not MOBILE else 40;cols=40 if not MOBILE else 28;fv=[];fu=[]
    for j in range(rows+1):
        t=.026+j/rows*.948;rad=max(.015,profile(t,w,index)-.415)
        for i in range(cols+1):
            q=i/cols*2-1;xx=rad*q;zz=(t-1)*h
            fv.append((xx,pulp_depth(xx,t,w,index),zz));fu.append((i/cols,j/rows))
    ff=[]
    for j in range(rows):
        for i in range(cols):a=j*(cols+1)+i;ff.append((a,a+1,a+cols+2,a+cols+1))
    fleshob=mesh('longitudinal_flesh_'+str(index),fv,ff,flesh,fu);fleshob.parent=rig
    # Fine unequal septa follow the axis; they never form a radial citrus wheel.
    for k,q in enumerate([-.95,-.85,-.74,.75,.87,.96]):
        pts=[]
        for t in np.linspace(.035,.97,32):
            rad=max(.02,profile(t,w,index)-.20);xx=rad*q+.028*math.sin(t*9+k);pts.append((xx,pulp_depth(xx,t,w,index)-.004,(t-1)*h))
        ob=wood('flesh_membrane_'+str(index)+'_'+str(k),pts,.009,.004,membrane,steps=46,sides=5,gnarl=0);ob.parent=rig
    inkv=[];inkuv=[];ix,iz=28,36
    for j in range(iz+1):
        t=.19+j/iz*.60
        for i in range(ix+1):
            # Follow the true pulp outline even in empty glyph margins. A
            # rectangular ink bed extended underneath the cut pith at its tips.
            halfwidth=min(w*.325,max(.025,profile(t,w,index)-.465)*.95)
            xx=(i/ix*2-1)*halfwidth;inkv.append((xx,pulp_depth(xx,t,w,index)-.016,(t-1)*h));inkuv.append((i/ix,j/iz))
    inkf=[]
    for j in range(iz):
        for i in range(ix):a=j*(ix+1)+i;inkf.append((a,a+1,a+ix+2,a+ix+1))
    face=mesh('clock_'+['days','hours','minutes','seconds'][index],inkv,inkf,inkblank,inkuv);face.parent=rig;clocknames.append(face.name)
    tag=front('unit_tag_'+str(index),.56,.60,papermat,(0,-.095,-h-.36));tag.parent=rig
    solid=tag.modifiers.new('Cotton_tag_edge','SOLIDIFY');solid.thickness=.04;apply(tag,solid)
    # Ink sits in front of the solid cotton lip, not inside its thickness.
    label=front('unit_ink_'+str(index),.48,.48,inkblank,(0,-.164,-h-.35));label.parent=rig
    thread=wood('unit_string_'+str(index),[(0,.05,-h+.06),(.12,-.1,-h-.25),(0,-.09,-h-.4)],.017,.014,threadmat,steps=18,sides=6,gnarl=0);thread.parent=rig
    for s in range(2):
        t=.12+s*.71;bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=(0,0,0));ob=own(bpy.context.object);ob.name='seed_'+str(index)+'_'+str(s)
        ob.scale=(.066,.058,.18);ob.data.materials.append(seedmat);ob.parent=rig;ob.location=(profile(t,w,index)*(-.78 if s==0 else .76),-.19,(t-1)*h)
    stemtop=z+h*.5;branchpoint=catmull(primary,max(.35,min(.86,.48+index*.093)))
    stem=wood('crooked_clock_pedicel_'+str(index),[tuple(branchpoint),(x-.18,.22,stemtop+.72),(x+.15,.02,stemtop+.26),(x,y+.07,stemtop-.06)],.14,.083,steps=40,sides=14)
    parent(stem,mainrig);fruitrigs.append(rig.name)
    return rig
for i,pose in enumerate(fruitposes):specimen(i,pose)

# The lower action is a different broad split specimen with two unequal lobes.
reset_center=(-4.95,-1.0,-1.9) if not MOBILE else(-.15,-.7,-2.5)
reset=empty('split_reset_rig',reset_center);parent(reset,mainrig)
shellv=[];shelluv=[];shellrows=60;shellcols=36
for j in range(shellrows+1):
    t=j/shellrows;x=(t-.5)*4.3;r=max(.015,math.sin(math.pi*t))**.68
    for k in range(shellcols+1):
        angle=k/shellcols*math.pi;z=math.cos(angle)*1.25*r*(1+.07*math.sin(t*12+angle));y=.16+math.sin(angle)*.95*r;shellv.append((x,y,z));shelluv.append((k/shellcols,t))
shellf=[]
for j in range(shellrows):
    for k in range(shellcols):
        a=j*(shellcols+1)+k;shellf.append((a,a+1,a+shellcols+2,a+shellcols+1))
rshell=mesh('reset_longitudinal_back_shell',shellv,shellf,resetbruise,shelluv);rshell.parent=reset
for i,sign in enumerate([-1,1]):
    points=[(-2.18,.18,-.03),(-1.30,-.12,sign*.84),(-.10,-.20,sign*1.20),(1.18,-.08,sign*.93),(2.1,.12,.06)]
    lobe=wood('reset_unequal_peel_lobe_'+str(i),points,.32 if i==0 else .39,.13,resetpeel if i==1 else resetbruise,steps=66,sides=22,gnarl=.5);lobe.parent=reset
    lip=wood('reset_fibrous_lip_'+str(i),[(p[0],p[1]-.21,p[2]*.84) for p in points],.13,.075,pith,steps=62,sides=12,gnarl=.2);lip.parent=reset
rows,cols=25,45;verts=[];uv=[]
for j in range(rows+1):
    vj=j/rows;z=(vj-.5)*1.68
    for i in range(cols+1):
        ui=i/cols;x=(ui-.5)*3.7;y=.06+.18*((x/1.85)**2+(z/.84)**2);verts.append((x,y,z));uv.append((ui,vj))
faces=[]
for j in range(rows):
    for i in range(cols):a=j*(cols+1)+i;faces.append((a,a+1,a+cols+2,a+cols+1))
bed=mesh('reset_concave_flesh',verts,faces,flesh,uv);bed.parent=reset
face=front('again_leaf_print',2.90,1.06,inkblank,(0,-.010,0));face.parent=reset
face.shape_key_add(name='Basis');pressure=face.shape_key_add(name='Press_rim')
for vtx in pressure.data:vtx.co.y+=.025
tally_position=(-2.4,-.30,.36) if not MOBILE else(-2.40,-1.18,.20)
tally=front('press_tally_tag',.68,.88,papermat,tally_position);tally.parent=reset
thread=wood('reset_tally_thread',[(-1.86,.0,.35),(-2.35,-.65 if MOBILE else-.1,.6),(-2.4,-1.10 if MOBILE else-.2,-.15)],.023,.02,threadmat,steps=24,sides=7,gnarl=0);thread.parent=reset

# Individually posed, physically cupped leaves. Gold-notched fold is the sole secret.
leaf_specs=[('left_top',(-6.9,-.1,7.7),3.0,1.4,(0,.20,-.45),.30,.28),('upper_left',(-1.2,.8,11),4.3,2.3,(.1,.12,-.8),.45,.4),('upper_right',(5.9,.8,10.6),3.6,1.8,(-.1,.3,.6),.32,.3),('fruit_left',(-4.6,.4,3.9),3.8,1.8,(.1,-.10,-.8),.36,.5),('fruit_right',(6.15,.6,3.7),4.0,1.8,(.05,.2,.6),.48,.5),('reset_back',(-4.7,.1,-1.8),4.4,2.5,(.05,.15,-1.2),.60,.28),('low_front',(-7.1,-1.7,-5.5),5.0,3.1,(.1,.3,-.8),.48,.4),('right_bottom',(7.8,-.1,-3.9),5.3,2.5,(.06,.12,.6),.55,.42)]
leaf_specs.extend([('upper_twin',(-.1,1.0,11.3),3.8,2.2,(.08,.25,-.43),.4,.45),('curl_inner',(4.4,1.0,9.75),3.8,1.9,(.06,.2,.82),.38,.44),('upper_edge',(9.4,1.1,10.45),4.1,2.3,(.04,.2,-.7),.48,.32),('right_mid',(8.4,1.0,3.2),4.2,2.5,(.05,.2,.65),.42,.5),('reset_twin',(-3.2,1.2,-1.5),4.5,2.7,(.08,.2,-.58),.55,.45),('left_crop',(-9.5,1.1,.2),4.1,2.4,(.05,.2,.9),.4,.33)])
if MOBILE:leaf_specs=[('left_top',(-2.8,.5,8.6),3.5,1.7,(0,.2,-.3),.4,.3),('right_top',(2.9,.6,8.5),3.5,1.8,(0,.2,.7),.5,.4),('clock_mid',(2.7,.8,4.0),3.3,1.5,(0,.2,.7),.4,.3),('reset_back',(-1,.8,-2.0),4.0,2.1,(0,.2,-1.3),.6,.4),('low_front',(-3.2,-1.2,-5),4,2.2,(0,.2,-.6),.5,.35)]
leafnames=[]
for name,center,l,w,rot,fold,curl in leaf_specs:leafnames.append(leaf('leaf_'+name,center,l,w,rot,fold,curl).name)
secret_center=(2.1,-.5,-.25) if not MOBILE else(2.4,-.5,-2.2)
secretleaf=leaf('gold_notched_fold',secret_center,3.3,2.2,(0,.1,-.45),1.02,.30,True)
notch=wood('visible_gold_notch',[(-.10,-.14,-.68),(.19,-.24,-.62),(.36,-.24,-.38)],.033,.018,gold,steps=16,sides=7,gnarl=0);notch.parent=secretleaf
# Crown positioned in the folded leaf's actual pocket, not a second action.
cv=[];cf=[]
for j in range(2):
    for k in range(20):a=k/20*math.tau;r=.23 if j==0 else .27;cv.append((math.cos(a)*r,.12+math.sin(a)*r,.10+(0 if j==0 else(.25 if k%4==0 else .10))))
for k in range(20):cf.append((k,(k+1)%20,(k+1)%20+20,k+20))
crown=mesh('crown_in_fold',cv,cf,gold);crown.parent=secretleaf

# All13 records remain physical tags on successive forks, with curved cotton
# borders and truly flat central screenshot faces. No papers are DOM billboards.
archives=[
 ('dexter','s8-final',(-6.8,-1.15,2.9),3.35,2.42,-.10),
 ('severance','tracker',(7.15,-.48,8.70),4.05,2.58,.12),
 ('got','s4',(6.80,-1.1,-1.25),4.40,2.75,-.16),
 ('got','s3-redesign',(-2.9,-.4,17.0),3.7,2.4,.09),('got','s3-classic',(2.7,.1,18.3),3.1,2.1,-.07),
 ('dexter','s7-finale',(-3.6,-.6,25.0),3.8,2.6,-.08),('severance','s2',(3.5,-.35,33.0),4.1,2.65,.07),
 ('sherlock','final',(-3.3,-.55,40.5),3.8,2.58,-.08),('sherlock','alpha',(2.7,.10,42),3.2,2.2,.055),
 ('archer','s5-final',(3.4,-.55,49.6),3.8,2.5,.095),
 ('breaking-bad','final',(-3.4,-.3,57.0),4.1,2.65,-.075),('breaking-bad','desert-parallax',(2.7,-.65,58.4),3.5,2.38,.10),
 ('house-of-cards','s2',(2.2,-.50,65.4),4.0,2.6,-.055)]
if MOBILE:
    archives[:3]=[('dexter','s8-final',(.25,-1.8,-6.6),4.8,2.65,-.055),('severance','tracker',(2.2,-.5,19.0),3.9,2.5,.075),('got','s4',(-2.0,-1.0,24.6),4.0,2.6,-.10)]
    archives=[record if i<3 else (record[0],record[1],(record[2][0],record[2][1],record[2][2]+13),record[3],record[4],record[5]) for i,record in enumerate(archives)]
upper=[(8,.7,11.8),(3.8,.6,15),(0,.8,21),(-.6,.8,27),(.7,.8,34),(-.4,.6,41),(1.0,.7,48),(-.8,.8,55),(.8,.7,62),(0,.7,70)]
if MOBILE:upper=[(4,.7,12),(2,.6,17),(0,.8,25),(-.6,.8,34),(.7,.8,43),(-.4,.6,52),(1.0,.7,61),(-.8,.8,70),(.8,.7,79),(0,.7,85)]
parent(wood('climbing_specimen_branch',upper,.25,.075,steps=270,sides=16),mainrig)
branch_paths.append(upper)
archive_manifest=[];destinations=[];tagrigs=[]
def paper(name,w,h):
    nx,nz=20,16;vv=[];uv=[]
    for j in range(nz+1):
        t=j/nz
        for i in range(nx+1):
            s=i/nx;edge=max(0,(abs(s-.5)-.40)/.10);curl=.12*edge**2*max(0,(.28-t)/.28)+.04*edge**2*math.sin(s*4+t*3)
            vv.append(((s-.5)*w,curl,(t-.5)*h));uv.append((s,t))
    ff=[]
    for j in range(nz):
        for i in range(nx):a=j*(nx+1)+i;ff.append((a,a+1,a+nx+2,a+nx+1))
    ob=mesh(name,vv,ff,papermat,uv);solid=ob.modifiers.new('Visible_cotton_edge','SOLIDIFY');solid.thickness=.044;apply(ob,solid);return ob
for index,(show,slug,center,w,h,tilt) in enumerate(archives):
    ident=show+'-'+slug;x,y,z=center;rig=empty('tag_rig_'+ident,(x,y,z+h*.5+.52));rig.rotation_euler.y=tilt;parent(rig,mainrig)
    body=paper('cotton_tag_'+ident,w+.52,h+.80);body.parent=rig;body.location=(0,.035,-h*.5-.48)
    # Genuine punched hole with explicit inner wall, cut through cotton border.
    bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=.074,depth=.5,location=(0,-.1,0));cutter=own(bpy.context.object);cutter.rotation_euler.x=math.pi/2;cutter.parent=rig;cutter.location=(0,.02,-.19)
    bpy.context.view_layer.update();mod=body.modifiers.new('Punched_thread_hole','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter;mod.solver='EXACT';apply(body,mod);bpy.data.objects.remove(cutter,do_unlink=True)
    screen=front('archive_'+ident,w,h,inkblank,(0,-.026,-h*.5-.42));screen.parent=rig
    caption=front('caption_'+ident,w,.31,inkblank,(0,-.035,-h-.66));caption.parent=rig
    topz=z+h*.5+.56;attachment=nearest_branch(Vector((x,.22,topz+.32)))
    parent(wood('fork_'+ident,[tuple(attachment),tuple((attachment+Vector((x,.22,topz+.32)))*.5+Vector((-.18,.22,.35))),(x,.22,topz+.32)],.09,.035,steps=32,sides=10),mainrig)
    string=wood('thread_'+ident,[(0,.02,.45),(.10,-.10,.25),(-.04,-.10,-.27),(.07,.04,-.32)],.021,.017,threadmat,steps=24,sides=7,gnarl=0);string.parent=rig
    if index>2:
        leafy=leaf('tag_leaf_'+ident,(x+(2.1 if x<0 else-2.1),.4,z+1.3),2.7,1.3,(0,.10,(-.5 if x<0 else.5)),.45,.24);leafnames.append(leafy.name)
    archive_manifest.append({'id':ident,'show':show,'slug':slug,'screen':screen.name,'caption':caption.name,'rig':rig.name,'width':w,'height':h,'initial':index<3});tagrigs.append(rig.name)
    kinds=[]
    if index in [0,2,7,9,10]:kinds.append('archive')
    if index==0:kinds.append('timeline')
    if index==1:kinds.append('live')
    for n,kind in enumerate(kinds):
        tab=front('destination_'+show+'_'+kind,.44,.35,inkblank,((-1 if n==0 else 1)*w*.32,-.043,-h-.76));tab.parent=rig
        tabbody=front('destination_bed_'+show+'_'+kind,.52,.42,papermat,((-1 if n==0 else 1)*w*.32,-.005,-h-.76));tabbody.parent=rig
        destinations.append({'show':show,'kind':kind,'surface':tab.name,'parent':screen.name})

# Deliberate framing props, an unequal pair of closed bruised specimens.
for j,(center,scale) in enumerate([((9.1,.8,11.3),(1.2,.9,1.8)),((8.2,.6,-.5),(1.2,.85,1.7))]):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=14,location=center);ob=own(bpy.context.object);ob.name='closed_bruised_specimen_'+str(j);ob.scale=scale;ob.data.materials.append(bruise);parent(ob,mainrig)
    for vtx in ob.data.vertices:
        p=vtx.co;p*=1+.042*math.sin(math.atan2(p.y,p.x)*13+p.z*.9)+.022*math.sin(p.z*12+p.x*6)
    for p in ob.data.polygons:p.use_smooth=True
bee=empty('bounded_bee',(-1.2,-1.6,-.8))
for name,pos,scale,mat in [('bee_body',(0,0,0),(.16,.11,.11),veinmat),('bee_head',(.16,0,.02),(.075,.08,.08),bark),('bee_wing_a',(-.04,.035,.10),(.19,.025,.095),membrane),('bee_wing_b',(-.04,-.05,.10),(.18,.025,.095),membrane)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=7);ob=own(bpy.context.object);ob.name=name;ob.scale=scale;ob.data.materials.append(mat);ob.parent=bee;ob.location=pos

# Pale specimen sweep is actual distant geometry; its faint drawing field is
# separately authored in runtime, never a photograph supporting missing bark.
sweep=front('specimen_sweep',50,170,papermat,(0,3.6,35));sweep.data.materials[0]=material('ChalkSweep',(.88,.84,.73),1)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.world.color=(.28,.27,.22)
world=bpy.data.worlds.new('PaleStudioWorld');scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.64,.61,.51,1);world.node_tree.nodes['Background'].inputs[1].default_value=.35
def area(name,position,power,size,color,target):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color;ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=position;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
area('Broad_upper_left_sun',(-11,-9,15),1500,7,(1,.93,.79),(0,0,4));area('Olive_cool_fill',(10,-6,7),600,10,(.79,.87,1),(0,0,4))
data=bpy.data.cameras.new('specimen_camera');camera=bpy.data.objects.new('specimen_camera',data);scene.collection.objects.link(camera)
if MOBILE:camera.location=(0,-27.7,1.5);target=Vector((0,-.1,1.5));data.lens=42
else:camera.location=(-.2,-29.2,4.3);target=Vector((-.2,0,4.3));data.lens=40
camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();scene.camera=camera
scene.render.resolution_x=390 if MOBILE else 1487;scene.render.resolution_y=844 if MOBILE else 1058;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
bpy.context.view_layer.update()
def batch(objects,name):
    objects=list(objects)
    if len(objects)<2:return
    bpy.ops.object.select_all(action='DESELECT')
    for object in objects:object.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name=name
# Static detail is consolidated within its physical parent, preserving all live
# reading surfaces, pivots and authored morphs. Neither LOD changes anatomy poses.
for i in range(4):
    batch((ob for ob in bpy.data.objects['fruit_rig_'+str(i)].children if ob.name.startswith('flesh_membrane_')),'longitudinal_membranes_'+str(i))
    batch((ob for ob in bpy.data.objects['fruit_rig_'+str(i)].children if ob.name.startswith('seed_')),'sparse_seeds_'+str(i))
    batch((ob for ob in bpy.data.objects['fruit_rig_'+str(i)].children if ob.name.startswith('pith_lobe_')),'unequal_pith_lobes_'+str(i))
batch((ob for ob in mainrig.children if ob.type=='MESH' and ob.name.startswith(('fork_','crooked_clock_pedicel_','leaf_')) and ob.name.endswith('_petiole')),'joined_leaf_petioles')
batch((ob for ob in mainrig.children if ob.type=='MESH' and ob.name.startswith('fork_')),'joined_archive_forks')
batch((ob for ob in mainrig.children if ob.type=='MESH' and ob.name.startswith('layered_cambium_plate_')),'layered_cambium_plates')
for ob in collection.all_objects:
    if ob.type!='MESH' or ob.data.shape_keys or ob.name.startswith(('clock_days','clock_hours','clock_minutes','clock_seconds','longitudinal_flesh_','unit_ink','archive_','caption_','destination_','again_leaf_print','press_tally_tag','specimen_sweep')):continue
    if len(ob.data.polygons)<70:continue
    decimate=ob.modifiers.new('Authored_runtime_LOD','DECIMATE');decimate.ratio=.38 if MOBILE else .54;apply(ob,decimate)
for ob in collection.all_objects:
    if ob.type=='MESH':ob.data.calc_loop_triangles()
triangles=sum(len(ob.data.loop_triangles) for ob in collection.all_objects if ob.type=='MESH')
filename='scene-mobile.glb' if MOBILE else'scene.glb'
bpy.ops.object.select_all(action='DESELECT')
for ob in collection.all_objects:ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/filename),export_format='GLB',use_selection=True,export_animations=False,export_yup=True,export_normals=True,export_texcoords=True,export_materials='EXPORT',export_apply=False)
if not MOBILE:
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'authoring'/'scene.blend'))
    manifest={'tool':'Blender4.5.14LTS','source':'authoring/build_scene.py + editable scene.blend','ownership':'All shape/map source is authored here; no photographed scene, direct lighting, timer values or archive images baked into assets.',
      'camera':{'positionGLTF':[-.2,4.3,29.2],'targetGLTF':[-.2,4.3,0],'fov':math.degrees(data.angle_y)},'clock':clocknames,'fruitRigs':fruitrigs,'peels':peels,'leaves':leafnames,'archiveRigs':tagrigs,'archives':archive_manifest,'destinations':destinations,'triangles':triangles,
      'critical':['scene.glb','materials/peel-ripeness-mask.png','materials/leaf-thickness.png','materials/flesh-thickness.png']+['materials/pulp-local-ao-'+str(i)+'.png' for i in range(4)]+['typography/BodoniModa-variable.ttf','typography/RobotoCondensed-variable.ttf'],
      'materials':{'bark':'authored fissures/knots/ridges + dry maps','peel':'longitudinal half shell + unequal opaque pith + pores and ripeness mask','flesh':'elongated relief/actual membranes/seeds + vesicle normal/thickness','leaves':'cupped/folded actual solid leaf+modeled midrib+vein/thickness maps','paper':'curled .044m cotton with punched holes/thread; flat image centre'},
      'readingSurfaces':{'clock':'actual lobed pulp skin with faithful UV-bound native reel ink; no separate protected planar panel','archives':'flat unaltered image centres within curled threaded cotton papers','destinations':'small physical arrow folds with generous non-shadowing native-link proxies'},
      'navigation':'1+13 actual individual works, every version reachable by touch scroll and native focus; no content buried in seven show-only stops',
      'motion':['bounded branch and twig lag','focused papers still','gold_notched_fold Unfold_crown','again_leaf_print Press_rim','confirmed1500ms peel front'],
      'limits':'Thin transmission approximation, no volumetric botany/cloth/physics simulation. Triangle counts are geometry measurements, not device performance claims.'}
    (ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2))
else:
    manifest=json.loads((ROOT/'manifest.json').read_text());manifest['phoneAsset']=filename;manifest['phoneTriangles']=triangles;manifest['phoneCamera']={'positionGLTF':[0,1.5,27.7],'targetGLTF':[0,1.5,.1],'fov':38,'horizontalSpan':8.8};(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2))
if PROOFS:
    for name in clocknames+['again_leaf_print']+['unit_ink_'+str(i) for i in range(4)]:bpy.data.objects[name].hide_render=True
    scene.render.filepath=str(ROOT/'inspection'/('phone-final-light.png' if MOBILE else'final-light.png'));bpy.ops.render.render(write_still=True)
    if not MOBILE:
        clay=material('Neutral_clay',(.63,.63,.63),.95);old=[]
        for ob in collection.all_objects:
            if ob.type=='MESH':old.append((ob,list(ob.data.materials)));ob.data.materials.clear();ob.data.materials.append(clay)
        scene.render.filepath=str(ROOT/'inspection'/'clay-opening.png');bpy.ops.render.render(write_still=True)
        camera.location=(-6,-25,7.0);camera.rotation_euler=(Vector((0,0,4.3))-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(ROOT/'inspection'/'clay-three-quarter.png');bpy.ops.render.render(write_still=True)
print('FRUIT_EXPORT',filename,triangles)
