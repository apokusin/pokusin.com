"""Author the connected Bubblegum Time installation. Blender 4.5 LTS Python.
Run: blender --background --python authoring/build_scene.py -- [--proofs]
Every runtime surface is blank; screenshots and real clock ink are supplied by site.
"""
import bpy, math, json, os, sys
from mathutils import Vector
import numpy as np
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROOFS='--proofs' in sys.argv
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
asset=bpy.data.collections.new('BubblegumInstallation'); bpy.context.scene.collection.children.link(asset)

def own(obj):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    asset.objects.link(obj); return obj

def mesh(name,verts,faces,mat=None,uv=None):
    me=bpy.data.meshes.new(name+'Geometry'); me.from_pydata(verts,[],faces); me.update()
    ob=bpy.data.objects.new(name,me); asset.objects.link(ob)
    if mat: me.materials.append(mat)
    if uv:
        layer=me.uv_layers.new(name='ReadingUV')
        for p in me.polygons:
            for li in p.loop_indices: layer.data[li].uv=uv[me.loops[li].vertex_index]
    for p in me.polygons:p.use_smooth=True
    return ob

def material(name,color,rough=.4,metal=0,coat=0,transmission=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    p.inputs['Coat Weight'].default_value=coat; p.inputs['Coat Roughness'].default_value=.13
    p.inputs['Transmission Weight'].default_value=transmission; p.inputs['IOR'].default_value=1.39 if transmission else 1.46
    return m
rose=material('GumRose',(.89,.12,.38),.11,coat=.8,transmission=.24)
roseedge=material('GumThinEdge',(.96,.29,.53),.10,coat=.85,transmission=.3)
cream=material('DrumCream',(.94,.92,.86),.25,coat=.27)
steel=material('PinSatinSteel',(.34,.38,.37),.24,metal=.95)
ringmat=material('AxleDarkSteel',(.15,.17,.15),.2,metal=.88)
paper=material('CottonPaper',(.94,.93,.90),.7)
ink=material('RuntimeInkSurface',(.90,.92,.74),.3)
blankphoto=material('RuntimePhotoSurface',(.58,.60,.52),.68)

# Fine map channels have no painted light or shadows. The forms remain geometry.
def image(name,arr):
    h,w=arr.shape[:2]; im=bpy.data.images.new(name,w,h,alpha=True)
    if arr.ndim==2: arr=np.stack([arr,arr,arr,np.ones_like(arr)],axis=-1)
    elif arr.shape[2]==3:arr=np.concatenate([arr,np.ones((h,w,1))],axis=-1)
    im.pixels.foreach_set(np.asarray(arr,dtype=np.float32).ravel()); im.filepath_raw=os.path.join(ROOT,'materials',name+'.png'); im.file_format='PNG'; im.save();return im
rng=np.random.default_rng(6123); s=512
u,v=np.meshgrid(np.linspace(0,1,s),np.linspace(0,1,s))
h=(np.sin(u*220+np.sin(v*35)*1.3)*.25+np.sin(u*540+v*25)*.1+rng.normal(0,.08,(s,s)))*.004
hy,hx=np.gradient(h); n=np.stack([-hx*25,-hy*25,np.ones_like(h)],axis=-1);n/=np.linalg.norm(n,axis=2)[...,None]
normal=image('gum-stretch-normal',n*.5+.5); normal.colorspace_settings.name='Non-Color'
roughmap=image('gum-roughness',np.clip(.12+rng.normal(0,.004,(s,s))+.007*np.sin(u*115),0,1));roughmap.colorspace_settings.name='Non-Color'
thick=image('gum-thickness',.36+.22*np.sin(u*math.pi)**2+.12*np.cos(v*math.pi)**2);thick.colorspace_settings.name='Non-Color'
for m in [rose,roseedge]:
    nodes=m.node_tree.nodes; links=m.node_tree.links;p=nodes.get('Principled BSDF')
    tex=nodes.new('ShaderNodeTexImage');tex.image=normal;nm=nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.035;links.new(tex.outputs['Color'],nm.inputs['Color']);links.new(nm.outputs['Normal'],p.inputs['Normal'])
    rt=nodes.new('ShaderNodeTexImage');rt.image=roughmap;links.new(rt.outputs['Color'],p.inputs['Roughness'])
fiber=rng.normal(.5,.026,(512,512));pf=image('paper-fibre',fiber);pf.colorspace_settings.name='Non-Color'
fy,fx=np.gradient(fiber);fn=np.stack([-fx*.20,-fy*.20,np.ones_like(fiber)],axis=-1);fn/=np.linalg.norm(fn,axis=2)[...,None]
pfn=image('paper-fibre-normal',fn*.5+.5);pfn.colorspace_settings.name='Non-Color'
pa=np.stack([.84+(fiber-.5)*.11,.83+(fiber-.5)*.10,.80+(fiber-.5)*.09],axis=-1);pal=image('cotton-albedo',pa)
nodes=paper.node_tree.nodes;links=paper.node_tree.links;t=nodes.new('ShaderNodeTexImage');t.image=pfn;nm=nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.18;links.new(t.outputs['Color'],nm.inputs['Color']);links.new(nm.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal']);al=nodes.new('ShaderNodeTexImage');al.image=pal;links.new(al.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])

# Broad membrane: two variable relief skins joined at all perimeter edges.
xs=np.array([-7.25,-6.65,-5.3,-4,-2,0,2,3.4,4.5,5.3,6.3,7.1]);tops=np.array([2.65,1.9,1.60,1.48,1.62,1.93,2.24,2.45,3.0,3.7,1.3,1.18]);bots=np.array([1.5,.95,-.6,-1.22,-1.47,-1.20,-.83,-.4,-.05,.10,.63,.85])
centers=[(-3.25,.22),(-1.36,.28),(.39,.61),(2.28,.92)]
Nx,Ny=220,42; verts=[];uv=[]
def smooth_sample(x,values):
    i=max(0,min(len(xs)-2,int(np.searchsorted(xs,x)-1)));t=(x-xs[i])/(xs[i+1]-xs[i]);t=max(0,min(1,t))
    y0,y1=values[i],values[i+1]
    m0=(values[min(i+1,len(xs)-1)]-values[max(i-1,0)])/(xs[min(i+1,len(xs)-1)]-xs[max(i-1,0)])
    m1=(values[min(i+2,len(xs)-1)]-values[i])/(xs[min(i+2,len(xs)-1)]-xs[i])
    d=xs[i+1]-xs[i]
    return (2*t**3-3*t*t+1)*y0+(t**3-2*t*t+t)*d*m0+(-2*t**3+3*t*t)*y1+(t**3-t*t)*d*m1
def bounds(x):return float(smooth_sample(x,bots)),float(smooth_sample(x,tops))
def skin(x,y,t,front=True):
    # Edge roll, compression waves, tension radiating from turned pin roots.
    edge=(1-abs(2*t-1))
    lip=0
    for cx,cy in centers:
        qx=abs(x-cx)-.64;qy=abs(y-cy)-.75
        d=math.sqrt(max(qx,0)**2+max(qy,0)**2)+min(max(qx,qy),0)-.22
        lip+=.30*math.exp(-(d/.20)**2)
    folds=.045*math.sin(x*2.6+y*3.0)*math.exp(-edge*8)+.035*math.sin(x*1.5-y*2.7)*(1-edge)
    roots=.12*math.sin(math.atan2(y-1.9,x+6.9)*15)*math.exp(-((x+6.9)**2+(y-1.9)**2)/3)
    roots+=.1*math.sin(math.atan2(y-.9,x-6.7)*17)*math.exp(-((x-6.7)**2+(y-.9)**2)/2)
    z=.15+lip+folds+roots+.045*math.sin(x*2.3+y)
    thick=.105+.21*(1-edge)**2+.1*min(1,lip/.3)
    return z if front else z-thick
for side in range(2):
    for i in range(Nx+1):
        x=xs[0]+(xs[-1]-xs[0])*i/Nx;lo,hi=bounds(x)
        for j in range(Ny+1):
            t=j/Ny;y=lo+(hi-lo)*t;verts.append((x,y,skin(x,y,t,side==0)));uv.append((i/Nx,t))
faces=[];sideN=(Nx+1)*(Ny+1)
for side in range(2):
    off=side*sideN
    for i in range(Nx):
        for j in range(Ny):
            a=off+i*(Ny+1)+j;f=(a,a+Ny+1,a+Ny+2,a+1);faces.append(f if side==0 else tuple(reversed(f)))
for i in range(Nx):
    a=i*(Ny+1);b=(i+1)*(Ny+1);faces.append((a,b,b+sideN,a+sideN))
    a=i*(Ny+1)+Ny;b=(i+1)*(Ny+1)+Ny;faces.append((a+sideN,b+sideN,b,a))
for j in range(Ny):
    a=j;b=j+1;faces.append((a+sideN,b+sideN,b,a));a=Nx*(Ny+1)+j;b=a+1;faces.append((a,b,b+sideN,a+sideN))
body=mesh('gum_connected_membrane',verts,faces,rose,uv)

# Rounded rectangular Boolean cutters produce real open cavities, not painted masks.
def rounded_box(name,loc,size,r=.2,mat=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=own(bpy.context.object);o.name=name;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if mat:o.data.materials.append(mat)
    m=o.modifiers.new('RoundedCorners','BEVEL');m.width=r;m.segments=5;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
    for p in o.data.polygons:p.use_smooth=True
    return o
for i,(cx,cy) in enumerate(centers):
    c=rounded_box('aperture_cutter',(cx,cy,0),(1.59,1.99,4),.27)
    b=body.modifiers.new('TrueAperture_'+str(i),'BOOLEAN');b.operation='DIFFERENCE';b.solver='EXACT';b.object=c
    bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_apply(modifier=b.name);bpy.data.objects.remove(c,do_unlink=True)
# The lower bubble neck has gathered, overlapping lobes; spheres are joined to the membrane.
def sphere(name,loc,scale,mat,segments=64,rings=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc);o=own(bpy.context.object);o.name=name;o.scale=scale;o.data.materials.append(mat)
    for p in o.data.polygons:p.use_smooth=True
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return o
bubble=sphere('gum_inflatable_bubble',(6.05,6.25,-.05),(4.8,4.93,2.05),roseedge,80,48)
for vtx in bubble.data.vertices:
    p=vtx.co+bubble.location;d=math.sqrt((p.x-4.7)**2+(p.y-2.8)**2);fold=.12*math.exp(-d*d/3.0)*math.sin(math.atan2(p.y-2.8,p.x-4.7)*17+p.y*.7);vtx.co.z+=fold
# Keep bubble as its separately deformable authored skin; the broad neck is one closed volume touching it.
# Neck is a funnel ruled volume, fluted continuously into membrane and bladder.
Nv=72;Nu=35;ve=[];fa=[];uv=[]
for j in range(Nu+1):
    t=j/Nu;cx=4.37+1.55*t;cy=1.62+1.68*t;r=.75+1.19*t
    for i in range(Nv):
        a=2*math.pi*i/Nv;wr=.045*(1-t)*math.sin(a*13+t*5)
        ve.append((cx+(r+wr)*math.cos(a),cy+(r*.8+wr)*math.sin(a),-.15+.62*math.sin(a)+.19*t));uv.append((i/Nv,t))
for j in range(Nu):
    for i in range(Nv):
        a=j*Nv+i;b=j*Nv+(i+1)%Nv;fa.append((a,b,b+Nv,a+Nv))
fa.append(tuple(reversed(range(Nv))));fa.append(tuple(Nu*Nv+i for i in range(Nv)))
neck=mesh('gum_gathered_neck',ve,fa,rose,uv)
# Union the broad gathered neck, bladder and perforated belt into a single manifold skin.
# This avoids the rejected separate slab/sphere model and gives a joined breath deformation.
for joining in [neck,bubble]:
    mod=body.modifiers.new('JoinedElasticSkin','BOOLEAN');mod.operation='UNION';mod.solver='EXACT';mod.object=joining
    bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(joining,do_unlink=True)
tri=body.modifiers.new('MorphTangentTriangles','TRIANGULATE');bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_apply(modifier=tri.name)
# Exact Booleans can leave coplanar sliver flaps on an otherwise shared seam.
# Remove only triangles with two boundary edges attached to a 3-face edge, then assert closure.
import bmesh
bm=bmesh.new();bm.from_mesh(body.data)
flaps=[f for f in bm.faces if len(f.verts)==3 and sum(e.is_boundary for e in f.edges)>=2 and any(len(e.link_faces)>2 for e in f.edges)]
if flaps:bmesh.ops.delete(bm,geom=flaps,context='FACES')
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));
for face in bm.faces:face.smooth=True
bm.to_mesh(body.data);bm.free()
uses={}
for poly in body.data.polygons:
    for edge in poly.edge_keys:uses[edge]=uses.get(edge,0)+1
nonmanifold=[edge for edge,count in uses.items() if count!=2]
if nonmanifold:raise RuntimeError('Connected Gum skin is not closed: '+str(len(nonmanifold))+' seam edges')
from mathutils.bvhtree import BVHTree
inspection=BVHTree.FromObject(body,bpy.context.evaluated_depsgraph_get())
aperture_checks=[inspection.ray_cast(Vector((x,y,8)),Vector((0,0,-1)),20)[0] is None for x,y in centers]
if not all(aperture_checks):raise RuntimeError('Gum union obscured a clock aperture')

body.shape_key_add(name='Basis')
breath=body.shape_key_add(name='Breath')
pull=body.shape_key_add(name='Pull')
for vert in body.data.vertices:
    p=vert.co; near_drums=max(math.exp(-((p.x-cx)**2+(p.y-cy)**2)/.6) for cx,cy in centers)
    pin_guard=max(math.exp(-((p.x+6.86)**2+(p.y-1.87)**2)/.4),math.exp(-((p.x-6.63)**2+(p.y-.83)**2)/.4))
    weight=max(0,min(1,(p.x-3.12)/1.18))*max(0,min(1,(p.y-.98)/1.2))
    weight*=max(0,1-near_drums)*max(0,1-pin_guard)
    breath.data[vert.index].co=p+(p-Vector((6.05,6.25,-.05)))*.12*weight
    elasticity=(1-near_drums)*(1-pin_guard)*math.exp(-((p.y-.1)/1.8)**2)
    pull.data[vert.index].co=p+Vector((0,.34*elasticity,.13*elasticity))
body['deformation']='Morph targets Breath 0..1 gives max12percent pressure pulse, Pull -1..1 bounded bridges; pins and drum neighborhoods guarded'
for name,loc in [('gum_inflatable_bubble',(6.05,6.25,-.05)),('gum_gathered_neck',(4.5,2.2,0))]:
    bpy.ops.object.empty_add(type='PLAIN_AXES',location=loc);o=own(bpy.context.object);o.name=name;o['morph_owner']='gum_connected_membrane'

# Cylinder assemblies and their real curved reading arcs.
units=['days','hours','minutes','seconds'];surfaces={}
for i,((cx,cy),unit) in enumerate(zip(centers,units)):
    bpy.ops.object.empty_add(type='PLAIN_AXES',location=(cx,cy,-.33));rig=own(bpy.context.object);rig.name='drum_'+unit
    for side in range(2):
        xx=(-.395 if side==0 else .395)
        bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=1.0,depth=.755,location=(cx+xx,cy,-.33),rotation=(0,math.pi/2,0));o=own(bpy.context.object);o.name='cylinder_'+unit+'_'+str(side);o.data.materials.append(cream);o.parent=rig;o.matrix_parent_inverse=rig.matrix_world.inverted()
        be=o.modifiers.new('EnamelEdge','BEVEL');be.width=.055;be.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=be.name)
        for p in o.data.polygons:p.use_smooth=True
        ve=[];fa=[];uv=[];nr=32
        for row in range(nr+1):
            t=row/nr;a=(-math.pi*.345)+(math.pi*.69)*t
            for col in range(2):
                ve.append((cx+xx+(-.359 if col==0 else .359),cy+math.sin(a)*1.006,-.33+math.cos(a)*1.006));uv.append((col,t))
        for row in range(nr):a=row*2;fa.append((a,a+1,a+3,a+2))
        name='screen_timer_'+unit+('_left' if side==0 else '_right');face=mesh(name,ve,fa,ink,uv);face['runtime_surface']='digit_reel';face['uv_axis']='U across drum, V bottom to top';face.parent=rig;face.matrix_parent_inverse=rig.matrix_world.inverted();surfaces[name]={'kind':'digit','unit':unit,'digit':side,'center':[cx+xx,cy,.676],'curved':True,'arcRadians':math.pi*.69,'width':.718,'height':1.77}
    # Axles and end rings remain behind actual cream cylinders.
    for end in [-1,1]:
        bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=10,location=(cx+end*.80,cy,-.33),rotation=(0,math.pi/2,0),major_radius=.96,minor_radius=.045);o=own(bpy.context.object);o.name='axle_ring_'+unit+'_'+str(end);o.data.materials.append(ringmat)

# Pins have a shaft, dome head and gathered tension roots.
for i,(x,y,z,angle) in enumerate([(-6.86,1.87,.20,-.4),(6.63,.83,.18,.58)]):
    bpy.ops.mesh.primitive_cylinder_add(vertices=40,radius=.10,depth=1.2,location=(x,y,z+.52),rotation=(0,angle,0));o=own(bpy.context.object);o.name='pin_shaft_'+str(i);o.data.materials.append(steel)
    sphere('pin_dome_'+str(i),(x+math.sin(angle)*.55,y,z+1.09),(.26,.17,.09),steel,32,16)

# Unequal thick curled cotton photographs. The central print UV remains flat/readable.
photos=[('severance_tracker',(-4.70,3.40,.47),(4.35,2.98),-.145,.46),('dexter_s8_final',(.35,4.18,.45),(2.63,2.08),.17,.26),('game_of_thrones_s4',(5.25,-2.10,.56),(3.49,2.78),.19,.56),('archer_s5_final',(2.07,-3.72,.39),(2.66,1.91),.17,.24)]
photos += [
 ('severance_s2',(-3.20,7.95,-.15),(3.4,2.55),-.09,.32),
 ('dexter_s7_finale',(1.52,8.10,-.30),(2.95,2.28),.07,.36),
 ('game_of_thrones_s3_redesign',(9.55,-1.52,-.12),(3.15,2.56),-.12,.43),
 ('game_of_thrones_s3_classic',(11.65,-4.35,-.22),(2.60,2.14),.17,.31),
 ('sherlock_final',(-9.65,6.15,-.11),(3.20,2.36),.09,.43),
 ('sherlock_alpha',(-12.05,3.72,-.21),(2.60,1.96),-.12,.32),
 ('breaking_bad_final',(-9.65,-3.8,-.16),(3.30,2.50),-.10,.52),
 ('breaking_bad_desert_parallax',(-12.20,-.9,-.27),(3.50,2.20),.16,.40),
 ('house_of_cards_s2',(-14.22,6.95,-.26),(2.65,2.42),-.04,.40)
]

for name,loc,size,angle,curl in photos:
    w,h=size;cols,rows=44,32;ve=[];fa=[];uv=[]
    # Corner curling only: image center is genuinely planar and preserved screenshot flat.
    for iy in range(rows+1):
        v=iy/rows
        for ix in range(cols+1):
            u=ix/cols;x=(u-.5)*w;y=(v-.5)*h
            ur=max(0,(u-.76)/.24);vr=max(0,(.32-v)/.32)
            ur=max(0,(u-.70)/.30);vr=max(0,(.43-v)/.43);k=ur*vr
            # Broad rolled corner retracts over its flat print, leaving the central reading aperture untouched.
            z=curl*1.8*k**1.75+.04*max(0,(v-.89)/.11)**2+.026*math.sin(u*14)*max(0,(.12-v)/.12)
            x-=curl*1.1*k*k;y+=curl*.65*k*k
            x+=.024*math.sin(v*37+u*13)*max(0,(abs(u-.5)-.4)/.1)
            y+=.020*math.sin(u*43+v*10)*max(0,(abs(v-.5)-.4)/.1)
            ve.append((x,y,z));uv.append((u,v))
    for iy in range(rows):
        for ix in range(cols):a=iy*(cols+1)+ix;fa.append((a,a+1,a+cols+2,a+cols+1))
    p=mesh('paper_'+name,ve,fa,paper,uv);p.location=loc;p.rotation_euler[2]=angle
    solid=p.modifiers.new('CottonThickness','SOLIDIFY');solid.thickness=.029;solid.offset=-1
    bevel=p.modifiers.new('SoftPaperEdge','BEVEL');bevel.width=.008;bevel.segments=2
    # Image center occupies uncurled stock. Caption strip remains root-authored ink.
    sw=w*.86;sh=h*.75;yoff=h*.045
    ve=[(-sw/2,yoff-sh/2,.014),(sw/2,yoff-sh/2,.014),(sw/2,yoff+sh/2,.014),(-sw/2,yoff+sh/2,.014)]
    face=mesh('screen_'+name,ve,[(0,1,2,3)],blankphoto,[(0,0),(1,0),(1,1),(0,1)]);face.parent=p;face['runtime_surface']='faithful_archive_preview'
    surfaces[face.name]={'kind':'archive','paper':p.name,'size':[sw,sh],'center':[0,yoff,.014],'localCorners':ve,'openingVisible':name in ['severance_tracker','dexter_s8_final','game_of_thrones_s4','archer_s5_final']}
    # Actual gum tethers join stock top corners, with pin webbing-like taper.
    def tube(tname,points,radii,mat):
        ve=[];fa=[];N=10
        for k,pnt in enumerate(points):
            tangent=Vector(points[min(k+1,len(points)-1)])-Vector(points[max(0,k-1)]);tangent.normalize();a=tangent.cross(Vector((0,0,1)))
            if a.length<.1:a=tangent.cross(Vector((0,1,0)))
            a.normalize();b=tangent.cross(a).normalized()
            for j in range(N):q=Vector(pnt)+(a*math.cos(j*math.tau/N)+b*math.sin(j*math.tau/N))*radii[k];ve.append(tuple(q))
        for k in range(len(points)-1):
            for j in range(N):a=k*N+j;b=k*N+(j+1)%N;fa.append((a,b,b+N,a+N))
        fa.append(tuple(reversed(range(N))));fa.append(tuple((len(points)-1)*N+j for j in range(N)))
        return mesh(tname,ve,fa,mat)
    # Physical attachment path uses a broad gathered paper corner root, narrow free bridge.
    for side in [-1,1]:
        corner=Vector((-w*.43*side,h*.44,0));corner.rotate(p.rotation_euler.to_matrix());corner+=Vector(loc)
        attach={
          'severance_tracker': {1:(-8.3,6.15,.2),-1:(-1.85,5.65,.22)},
          'dexter_s8_final': {1:(-1.85,5.65,.22),-1:(3.1,5.35,.1)},
          'game_of_thrones_s4': {1:(3.5,-.35,.08),-1:(6.67,.83,.12)},
          'archer_s5_final': {1:(.52,-2.8,.12),-1:(3.57,-1.09,.30)},
          'severance_s2': {1:(-4.8,6.0,-.06),-1:(-1.8,8.8,-.05)},
          'dexter_s7_finale': {1:(-1.8,8.8,-.05),-1:(3.55,8.9,-.07)},
          'game_of_thrones_s3_redesign': {1:(7.3,.7,-.03),-1:(11.8,.6,-.1)},
          'game_of_thrones_s3_classic': {1:(10.65,-2.5,-.07),-1:(13.3,-2.4,-.1)},
          'sherlock_final': {1:(-11.8,8.5,-.08),-1:(-7.65,7.8,-.06)},
          'sherlock_alpha': {1:(-13.4,5.2,-.13),-1:(-10.9,5.4,-.1)},
          'breaking_bad_final': {1:(-11.3,-1.1,-.1),-1:(-7.8,-2.0,-.11)},
          'breaking_bad_desert_parallax': {1:(-13.85,1.0,-.1),-1:(-10.65,1.1,-.15)},
          'house_of_cards_s2': {1:(-15.5,9.3,-.1),-1:(-12.5,8.7,-.1)}}
        target=Vector(attach[name][side]);delta=target-corner
        p0=corner;p1=corner+delta*.20+Vector((0,.10,.05));p2=corner+delta*.70+Vector((0,-.12,.08));p3=target
        points=[];radii=[]
        for k in range(25):
            t=k/24;points.append(tuple((1-t)**3*p0+3*(1-t)**2*t*p1+3*(1-t)*t*t*p2+t**3*p3))
            radii.append(.017+.11*math.exp(-t*18)+.044*math.exp(-(1-t)*18))
        tube('gum_tether_'+name+'_'+str(side),points,radii,roseedge)
        sphere('gum_gathered_paper_root_'+name+'_'+str(side),tuple(corner),(.18,.18,.075),rose,24,12)

# The installation continues as one suspended elastic web, not a row of cards.
# These shaped/tapered connections join actual gathered roots and remain behind the opening crop.
networks=[
 ('upper_network',[(-4.8,6.0,-.06),(-7.65,7.8,-.06),(-11.8,8.5,-.08),(-12.5,8.7,-.1),(-15.5,9.3,-.1)]),
 ('top_clock_network',[(-4.8,6.0,-.06),(-1.8,8.8,-.05),(3.55,8.9,-.07),(3.1,5.35,.1)]),
 ('left_network',[(-11.8,8.5,-.08),(-13.4,5.2,-.13),(-10.9,5.4,-.1),(-10.65,1.1,-.15),(-13.85,1.0,-.1),(-11.3,-1.1,-.1),(-7.8,-2.0,-.11),(-6.9,1.87,.12)]),
 ('right_network',[(6.63,.83,.12),(7.3,.7,-.03),(11.8,.6,-.1),(13.3,-2.4,-.1),(10.65,-2.5,-.07),(6.63,.83,.12)])
]
for name,controls in networks:
    points=[];radii=[]
    for seg in range(len(controls)-1):
        a=Vector(controls[seg]);b=Vector(controls[seg+1]);p1=a+(b-a)*.3+Vector((0,.15,.03));p2=a+(b-a)*.72+Vector((0,-.13,.05))
        for k in range(20):
            t=k/20;points.append(tuple((1-t)**3*a+3*(1-t)**2*t*p1+3*(1-t)*t*t*p2+t**3*b));radii.append(.026+.055*math.exp(-t*16)+.055*math.exp(-(1-t)*16))
    points.append(controls[-1]);radii.append(.08);tube('gum_'+name,points,radii,roseedge)

# Joined elastic reset droplet, blank curved reading face and true tallied-ink surface.
pad=sphere('reset_droplet',(-4.17,-1.86,.12),(.92,.52,.29),roseedge,56,28)
# Bridge joins the pad to the membrane underside.
bridge=sphere('reset_bridge',(-4.15,-1.36,.08),(.31,.36,.16),rose,32,16)
face=mesh('screen_reset',[(-.69,-.26,0),(.69,-.26,0),(.69,.26,0),(-.69,.26,0)],[(0,1,2,3)],roseedge,[(0,0),(1,0),(1,1),(0,1)]);face.parent=pad;face.location=(0,0,.302);surfaces['screen_reset']={'kind':'action','parent':'reset_droplet','center':[0,0,.302],'size':[1.38,.52]}
tally=mesh('screen_tally',[(-.53,-.21,0),(.53,-.21,0),(.53,.21,0),(-.53,.21,0)],[(0,1,2,3)],paper,[(0,0),(1,0),(1,1),(0,1)]);tally.location=(-2.63,-1.99,.02);surfaces['screen_tally']={'kind':'tally','center':[-2.63,-1.99,.02],'size':[1.06,.42]}
# Sparse authored droplets and a curled gum edge: no constant ambient movement baked.
for i,(loc,scale) in enumerate([((-1.04,2.39,.35),(.26,.26,.23)),((-2.0,1.94,.18),(.09,.09,.08)),((-.64,-2.67,.2),(.14,.14,.1)),((2.74,-1.63,.1),(.27,.32,.16)),((5.37,-4.39,.05),(.21,.21,.15)),((-5.53,-4.8,.1),(.23,.23,.17)),((-5.98,-.9,.2),(.13,.13,.09))]):sphere('gum_droplet_'+str(i),loc,scale,roseedge,28,16)
# Easter egg curl has a clear visible gold edge and one grouped hinge.
gold=material('CrownWarmGold',(.92,.59,.14),.22,metal=.76)
bpy.ops.object.empty_add(type='PLAIN_AXES',location=(-6.45,.90,.14));hinge=own(bpy.context.object);hinge.name='crown_curl_hinge'
curlob=sphere('crown_gum_curl',(-6.43,.92,.2),(.37,.29,.18),roseedge,32,16);curlob.parent=hinge;curlob.matrix_parent_inverse=hinge.matrix_world.inverted()
ve=[(-.27,-.09,0),(.27,-.09,0),(.23,.09,0),(.1,.04,0),(0,.19,0),(-.1,.04,0),(-.23,.09,0)]
crown=mesh('crown_gold_edge',ve,[tuple(range(7))],gold);crown.location=(-6.45,.74,.39);crown.parent=hinge;crown.matrix_parent_inverse=hinge.matrix_world.inverted()
solid=crown.modifiers.new('GoldThickness','SOLIDIFY');solid.thickness=.045

# Finalize modifiers before glTF export while retaining the connected skin shape keys.
for ob in list(asset.objects):
    if ob.type=='MESH' and not ob.data.shape_keys:
        tri=ob.modifiers.new('ExportTangentTriangles','TRIANGULATE')
        bpy.context.view_layer.objects.active=ob
        for mod in list(ob.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
# Renderer-neutral export owns only modeled installation, no camera/light backdrops.
bpy.ops.object.select_all(action='DESELECT')
for o in asset.objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'scene.glb'),export_format='GLB',use_selection=True,export_apply=False,export_yup=False,export_extras=True,export_texcoords=True,export_normals=True,export_tangents=True)
manifest={'concept':'bubblegum-time','source':'../../../../../docs/countdown-concepts/references/bubblegum-time.jpg','authoring':{'tool':'Blender','version':bpy.app.version_string,'script':'authoring/build_scene.py','source':'authoring/scene.blend'},'status':'authored candidate; independent/browser fidelity gate required','axis':'glTF Y-up; artwork XY, front +Z','bounds':{'x':[-16.5,14.5],'y':[-6,11.2],'z':[-2.1,1.8]},'camera':{'opening':{'position':[0,0,19],'target':[0,0,0],'fov':33},'inspection':{'position':[12,4,19],'target':[0,1,0],'fov':39}},'runtime':{'model':'scene.glb','required':True,'nodes':{o.name: {'type':o.type,'worldTranslation':list(o.matrix_world.translation)} for o in asset.objects},'surfaces':surfaces,'deformation':['gum_connected_membrane','gum_gathered_neck','gum_inflatable_bubble','reset_droplet','crown_curl_hinge']},'materials':{'GumRose':{'type':'physical','clearcoat':.8,'roughness':.12,'transmission':.24,'ior':1.39,'attenuationColor':'#F372AC','thicknessRange':[.10,.42]},'GumThinEdge':{'type':'physical','clearcoat':.85,'roughness':.12,'transmission':.30},'DrumCream':{'type':'physical','roughness':.25,'clearcoat':.27},'CottonPaper':{'type':'standard','roughness':.7}},'maps':{'normal':'materials/gum-stretch-normal.png','roughness':'materials/gum-roughness.png','thickness':'materials/gum-thickness.png','paper':'materials/paper-fibre-normal.png','cottonAlbedo':'materials/cotton-albedo.png'},'lighting':{'background':'#D7E7DE','key':{'position':[-7,9,8],'size':[8,5],'color':'#FFFDF8'},'fill':{'position':[5,3,7],'size':[5,7],'color':'#F5F7FF'},'strip':{'position':[1,8,3],'size':[10,2],'color':'#FFFFFF'},'reflection':'tall left white box, overhead strip, broad mullioned window and dark right gaps; no baked highlights'},'license':'Project-authored geometry and procedural maps; no new license declaration.','triangles':sum(len(p.vertices)-2 for o in asset.objects if o.type=='MESH' for p in o.data.polygons)}
manifest['geometryValidation']={'closedSkin':True,'nonManifoldEdges':len(nonmanifold),'openApertureCenters':aperture_checks,'removedBooleanSliverFlaps':len(flaps)}
manifest['runtime']['glyphs']={'title':'typography/title-countdowns.png','drums':'typography/drum-glyphs.png','fonts':['typography/BodoniModa-variable.ttf','typography/RobotoCondensed-variable.ttf'],'candidateSheet':'typography/type-candidate-sheet.jpg'}
manifest['titlePlacement']={'position':[-3.70,-3.32,.03],'worldSize':[8.37,1.926],'rotationZ':-.32,'status':'opening candidate; compare source silhouette after renderer composition'}
manifest['budgets']={'glbBytes':os.path.getsize(os.path.join(ROOT,'scene.glb')),'authoredTriangles':manifest['triangles'],'embeddedMaps':4,'mapSize':[512,512],'initialScreenshotCount':4,'totalScreenshotCount':13,'decodedArtMapBytesApprox':4*512*512*4,'note':'Host DPR bounded; transfer/geometry figures, not device FPS claims.'}
with open(os.path.join(ROOT,'manifest.json'),'w') as f:json.dump(manifest,f,indent=2)

# Editable source retains studio/proof rig, while GLB contains only actual sculpture.
studio=bpy.data.collections.new('ProofStudio_NOT_EXPORTED');bpy.context.scene.collection.children.link(studio)
def studio_own(o):
    for c in list(o.users_collection):c.objects.unlink(o)
    studio.objects.link(o);return o
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-2.4));o=studio_own(bpy.context.object);o.name='MintReceivingSweep';o.data.materials.append(material('MintSweep',(.65,.72,.68),.85))
def area(name,loc,power,size,color,target=(0,1,0),scale=None):
    bpy.ops.object.light_add(type='AREA',location=loc);o=studio_own(bpy.context.object);o.name=name;o.data.energy=power;o.data.shape='RECTANGLE';o.data.size=size;o.data.size_y=size*.65;o.data.color=color;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('BroadNeutralKey',(-7,9,8),1500,8,(1,.99,.97));area('NeutralFill',(5,3,7),650,7,(.97,.98,1));area('OverheadStrip',(1,8,3),1100,9,(1,1,1));area('NarrowEdge',(-8,-1,6),460,4,(1,1,1))
bpy.ops.object.camera_add(location=(0,0,19));camera=studio_own(bpy.context.object);camera.name='OpeningReferenceCamera';camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='PERSP';camera.data.lens=43.3;camera.data.sensor_width=36;bpy.context.scene.camera=camera
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=8;scene.cycles.use_denoising=True;scene.render.resolution_x=1487;scene.render.resolution_y=1058;scene.render.resolution_percentage=100;scene.world.color=(.35,.36,.38);scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'authoring','scene.blend'))
if PROOFS:
    scene.render.filepath=os.path.join(ROOT,'proofs','opening-authored.png');bpy.ops.render.render(write_still=True)
    camera.location=(12,4,19);camera.rotation_euler=(Vector((0,1,0))-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=os.path.join(ROOT,'proofs','geometry-three-quarter.png');bpy.ops.render.render(write_still=True)
    clay=material('InspectionClay',(.56,.57,.54),.75)
    for o in asset.objects:
        if o.type=='MESH':o.data.materials.clear();o.data.materials.append(clay)
    scene.render.filepath=os.path.join(ROOT,'proofs','clay-three-quarter.png');bpy.ops.render.render(write_still=True)
print('BUBBLEGUM_EXPORT_COMPLETE',os.path.join(ROOT,'scene.glb'))
