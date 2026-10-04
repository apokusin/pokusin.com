"""Held in Suspense: editable authored mechanical installation.

Run with Blender 4.5.14 LTS --background --python this_file.py.
The .blend keeps material nodes and the export contains ordinary UV-mapped volumes.
Every UI face is blank: the browser supplies faithful screenshots / live shared values.
"""
import bpy, math, json, random, os, sys
from pathlib import Path
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parents[1]
PHONE = '--phone' in sys.argv
SUFFIX = '-mobile' if PHONE else ''
PROOF_SUFFIX = '-mobile' if PHONE else ''
random.seed(1729)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for dat in list(bpy.data.materials): bpy.data.materials.remove(dat)

def mat(name, color, metal=0, rough=.4):
    m=bpy.data.materials.new(name); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
    return m

def image(name, width, height, fn):
    im=bpy.data.images.new(name,width=width,height=height,alpha=False)
    px=[]
    for y in range(height):
        for x in range(width): px.extend((*fn(x,y),1))
    im.pixels.foreach_set(px)
    im.filepath_raw=str(ROOT/'materials'/f'{name}.png'); im.file_format='PNG'
    im.save(); return im

def link_map(material, name, image_data, socket, scale=(1,1,1)):
    n=material.node_tree.nodes; l=material.node_tree.links
    tex=n.new('ShaderNodeTexImage'); tex.name=name; tex.image=image_data
    if socket=='Normal':
        tex.image.colorspace_settings.name='Non-Color'
        norm=n.new('ShaderNodeNormalMap'); norm.inputs['Strength'].default_value=.12
        l.new(tex.outputs['Color'],norm.inputs['Color'])
        l.new(norm.outputs['Normal'],n.get('Principled BSDF').inputs['Normal'])
    else:
        if socket!='Base Color': tex.image.colorspace_settings.name='Non-Color'
        l.new(tex.outputs['Color'],n.get('Principled BSDF').inputs[socket])

# Directional grooves are material microdetail; silhouette is entirely real mesh.
row_noise=[random.uniform(-1,1) for _ in range(512)]
rough_img=image('brushed_roughness',512,512,lambda x,y: (lambda v:(v,v,v))(.24+row_noise[y]*.016+random.random()*.007))
normal_img=image('brushed_normal',512,512,lambda x,y:(.5,.5+row_noise[y]*.018,1))
slate_noise=[random.random() for _ in range(512*512)]
def mineral(x,y):
    grain=slate_noise[y*512+x]
    cleavage=math.sin(x*.025+y*.11+math.sin(x*.02)*2)
    fleck=.25 if grain>.994 else (.07 if grain>.96 else 0)
    vein=.04 if abs(cleavage)>.982 else 0
    a=.22+grain*.10+.023*cleavage+fleck+vein
    return (a*.83,a*.88,a*.92)
slate_color=image('slate_albedo',512,512,mineral)
slate_rough=image('slate_roughness',512,512,lambda x,y:(lambda v:(v,v,v))(.68+.2*slate_noise[y*512+x]))
slate_normal=image('slate_normal',512,512,lambda x,y:(.5+math.sin(x*.41+y*.13)*.035,.5+math.sin(y*.35)*.045,1))
floor_color=image('limestone_albedo',512,512,lambda x,y:(lambda v:(v,v*.99,v*.97))(.84+.014*math.sin(x*.025+y*.008)+random.random()*.004))
floor_rough=image('limestone_roughness',512,512,lambda x,y:(lambda v:(v,v,v))(.25+random.random()*.05))
silver=mat('satin_brushed_steel',(.58,.60,.62),1,.28)
link_map(silver,'directional_roughness',rough_img,'Roughness'); link_map(silver,'directional_normal',normal_img,'Normal')
polished=mat('polished_bevels_and_collars',(.78,.80,.83),1,.055)
dark=mat('blackened_steel',(.034,.037,.038),.82,.27)
slate=mat('slate_cleavage',(1,1,1),.035,.8)
link_map(slate,'slate_colour',slate_color,'Base Color'); link_map(slate,'slate_rough',slate_rough,'Roughness'); link_map(slate,'slate_normal',slate_normal,'Normal')
floor=mat('pale_polished_limestone',(1,1,1),.02,.28)
link_map(floor,'floor_colour',floor_color,'Base Color'); link_map(floor,'floor_rough',floor_rough,'Roughness')
wall=mat('warm_plaster_wall',(.86,.85,.81),0,.87)
face=mat('clock_print_surface',(.64,.64,.61),.72,.35)
screen=mat('archive_blank_screen',(.07,.075,.077),0,.6)
cable=mat('braided_black_cable',(.023,.026,.028),.68,.28)
gold=mat('hidden_crown_brass',(.55,.35,.08),.72,.3)
glass=mat('window_glass',(.83,.88,.92),0,.05)
glass.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=.6
emission=mat('architectural_daylight',(.88,.93,1),0,.8)
p=emission.node_tree.nodes.get('Principled BSDF'); p.inputs['Emission Color'].default_value=(.88,.93,1,1); p.inputs['Emission Strength'].default_value=1.1
reflection_plaster=mat('reflection_plaster_return',(.44,.46,.45),0,.84)

def mesh(name, verts, faces, material, uv=False):
    data=bpy.data.meshes.new(name+'_mesh'); data.from_pydata(verts,[],faces); data.update()
    ob=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material)
    if uv:
        layer=data.uv_layers.new(name='UVMap')
        for poly in data.polygons:
            for li in poly.loop_indices:
                co=data.vertices[data.loops[li].vertex_index].co
                layer.data[li].uv=(co.x,co.z)
    return ob

def unwrap(ob):
    bpy.context.view_layer.objects.active=ob; ob.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.02)
    bpy.ops.object.mode_set(mode='OBJECT'); ob.select_set(False)

def bevel(ob,width=.045,segments=3):
    mod=ob.modifiers.new('Machined_edge_radius','BEVEL'); mod.width=width; mod.segments=segments
    mod.limit_method='ANGLE'; mod.harden_normals=True
    wn=ob.modifiers.new('Face_weighted_normals','WEIGHTED_NORMAL'); wn.keep_sharp=True; wn.weight=50
    for f in ob.data.polygons: f.use_smooth=True
    return ob

def cube(name, loc, size, material, radius=.025):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); ob=bpy.context.object; ob.name=name
    ob.dimensions=size; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    ob.data.materials.append(material); bevel(ob,radius); return ob

def cyl(name,a,b,r,material,vertices=48):
    a=Vector(a); b=Vector(b); d=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=d.length,location=(a+b)*.5)
    ob=bpy.context.object; ob.name=name; ob.rotation_mode='QUATERNION'; ob.rotation_quaternion=d.to_track_quat('Z','Y')
    ob.data.materials.append(material); bevel(ob,min(r*.13,.025),3); return ob

def group(name,loc=(0,0,0)):
    ob=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(ob); ob.location=loc; return ob

def attach(ob,parent):
    bpy.context.view_layer.update()
    world=ob.matrix_world.copy(); ob.parent=parent; ob.matrix_world=world
    return ob

def annulus(name,center,outer,inner,depth,material,axis=(0,1,0),n=40):
    verts=[]
    for z in [-depth/2,depth/2]:
        for r in [outer,inner]:
            for i in range(n):
                t=i*math.tau/n; verts.append((r*math.cos(t),r*math.sin(t),z))
    faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,n+j,n+i),(2*n+i,3*n+i,3*n+j,2*n+j),(i,2*n+i,2*n+j,j),(n+i,n+j,3*n+j,3*n+i)])
    ob=mesh(name,verts,faces,material); ob.location=center; ob.rotation_mode='QUATERNION'; ob.rotation_quaternion=Vector(axis).to_track_quat('Z','Y')
    bevel(ob,.012,2); unwrap(ob); return ob

def ribbon(name,path,width,depth,material):
    # A continuous mitered closed section follows the actual asymmetric beam fold.
    points=[Vector((p[0],p[2])) for p in path]; left=[]; right=[]
    for i,p in enumerate(points):
        d0=(p-points[max(0,i-1)]); d1=(points[min(len(points)-1,i+1)]-p)
        if d0.length<.0001: d0=d1
        if d1.length<.0001: d1=d0
        d0.normalize(); d1.normalize(); n0=Vector((-d0.y,d0.x)); n1=Vector((-d1.y,d1.x))
        bis=(n0+n1).normalized(); miter=width*.5/max(.35,bis.dot(n0))
        left.append(p+bis*miter); right.append(p-bis*miter)
    contour=left+list(reversed(right)); verts=[]
    y=sum(p[1] for p in path)/len(path)
    for yy in [y-depth/2,y+depth/2]: verts.extend([(p.x,yy,p.y) for p in contour])
    n=len(contour); faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    for i in range(n): j=(i+1)%n; faces.append((i,j,n+j,n+i))
    ob=mesh(name,verts,faces,material); bevel(ob,.028,4); unwrap(ob); return ob

def rope(name,a,b,r=.013,strands=3):
    a=Vector(a); b=Vector(b); d=b-a; axis=d.normalized()
    tangent=axis.cross(Vector((0,0,1)))
    if tangent.length<.1: tangent=axis.cross(Vector((1,0,0)))
    tangent.normalize(); bitan=axis.cross(tangent).normalized()
    curve=bpy.data.curves.new(name+'_braid','CURVE'); curve.dimensions='3D'; curve.resolution_u=1; curve.bevel_depth=r*.44; curve.bevel_resolution=2
    steps=max(20,int(d.length*45))
    for strand in range(strands):
        spline=curve.splines.new('POLY'); spline.points.add(steps)
        for i in range(steps+1):
            t=i/steps; theta=t*d.length*42+strand*math.tau/strands
            co=a+d*t+(tangent*math.cos(theta)+bitan*math.sin(theta))*r*.65
            spline.points[i].co=(*co,1)
    ob=bpy.data.objects.new(name,curve); bpy.context.collection.objects.link(ob); ob.data.materials.append(cable)
    bpy.context.view_layer.objects.active=ob; ob.select_set(True); bpy.ops.object.convert(target='MESH'); ob=bpy.context.object; ob.select_set(False)
    unwrap(ob); return ob

assembly=group('counterbalanced_installation')
floor_ob=cube('limestone_floor',(0,0,-.15),(70,70,.3),floor,.04)
wall_ob=cube('rear_plaster_wall',(0,5.5,8),(55,.25,18),wall,.06)
window_group=group('reflection_room')
# Actual side-window architecture produces both chrome reflections and floor shadows.
for z in [2.4,5.9,9.4]:
    for y in [-5.5,-2,1.5]:
        pane=cube(f'window_luminous_{z}_{y}',(-12.4,y,z),(.07,3.25,3.2),emission,.015); pane.visible_shadow=False; attach(pane,window_group)
for y in [-7.15,-3.7,-.25,3.2]: attach(cube(f'window_vertical_mullion_{y}',(-12.2,y,5.8),(.19,.15,11.4),wall,.018),window_group)
for z in [.7,4.1,7.55,11.0]: attach(cube(f'window_horizontal_mullion_{z}',(-12.2,-1.9,z),(.19,10.45,.15),wall,.018),window_group)
attach(cube('dark_reflection_flag',(13,-4,8),(1,2.3,12),dark,.03),window_group)
# The frontal metal reflects toward the viewer; extend actual window architecture
# along the side room behind the authoring camera rather than paint highlights.
for y in [-18,-24,-30,-36,-42]:
    for z in [3,7.5,12]:
        pane=attach(cube(f'front_room_window_{y}_{z}',(-12.4,y,z),(.07,5.65,4.2),emission,.015),window_group); pane.visible_shadow=False
for y in [-15,-21,-27,-33,-39,-45]:
    attach(cube(f'front_room_mullion_{y}',(-12.2,y,7.3),(.19,.15,14.3),dark,.018),window_group)
for z in [.8,5.2,9.8,14.3]:
    attach(cube(f'front_room_horizontal_{z}',(-12.2,-30,z),(.19,30.1,.15),dark,.018),window_group)
attach(cube('front_plaster_return',(0,-48,8),(45,.3,22),reflection_plaster,.05),window_group)
attach(cube('front_architectural_column',(10,-29,8),(1.6,1.2,15),dark,.025),window_group)

# The anchor is quarried mass, with irregular vertical shear facets and lifted
# flakes. It must retain its weight from a side view rather than read as a puck.
def stone_layer(name,cx,cy,z,height,sx,sy,seed):
    rng=random.Random(seed)
    outline=[(-1,-.62),(-.76,-1),(.54,-.97),(1,-.47),(.98,.62),(.72,.99),(-.49,.93),(-1,.38)]
    n=len(outline); ring=[]
    for x,y in outline:
        ring.append((cx+(x+rng.uniform(-.075,.075))*sx,cy+(y+rng.uniform(-.075,.075))*sy))
    verts=[(x,y,z+rng.uniform(-.035,.035)) for x,y in ring]+[(x+rng.uniform(-.09,.09),y+rng.uniform(-.06,.06),z+height+rng.uniform(-.1,.1)) for x,y in ring]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    for i in range(n): j=(i+1)%n; faces.extend([(i,j,n+j),(i,n+j,n+i)])
    ob=mesh(name,verts,faces,slate); bevel(ob,.011,1); unwrap(ob); attach(ob,assembly); return ob
anchor_x=-3.1 if PHONE else -5.25
def cleft_anchor():
    rng=random.Random(417)
    outline=[(-1,-.58),(-.85,-.86),(-.35,-1),(-.22,-.95),(.30,-.97),(.70,-.84),(1,-.48),(1,.20),(.84,.75),(.52,.98),(-.22,.94),(-.75,.78),(-.96,.30)]
    sx=1.05 if PHONE else 1.25; sy=.75; n=len(outline); verts=[]
    for level,height,scale,shift in [(0,.025,1,0),(1,.46,.99,-.07),(2,1.19,.84,-.03)]:
        for i,(x,y) in enumerate(outline):
            # Notches continue vertically through the visible cleavage face.
            notch=-.13 if i==3 else ( .055 if i==4 else 0)
            verts.append((anchor_x+x*sx*scale+shift+rng.uniform(-.018,.018),.15+y*sy*scale+notch,height+rng.uniform(-.06,.06)))
    faces=[tuple(range(n-1,-1,-1)),tuple(range(2*n,3*n))]
    for ring in range(2):
        for i in range(n):
            j=(i+1)%n; faces.extend([(ring*n+i,ring*n+j,(ring+1)*n+j),(ring*n+i,(ring+1)*n+j,(ring+1)*n+i)])
    ob=mesh('slate_anchor',verts,faces,slate); bevel(ob,.009,1); unwrap(ob); attach(ob,assembly)
    return ob
base=cleft_anchor()
for i in range(4):
    flake=stone_layer(f'slate_lifted_cleavage_{i}',anchor_x-.25+i*.18,.20+i*.04,1.03+i*.037,.022,.78-i*.04,.56,44+i)
    flake_center=Vector((anchor_x-.25+i*.18,.20+i*.04,1.03+i*.037))
    flake.data.transform(Matrix.Translation(-flake_center)); flake.location=flake_center
    flake.rotation_euler.y=(-.04+i*.024); flake.rotation_euler.x=.025*i
for i in range(9):
    x=anchor_x+random.uniform(-1.1,1.0); y=random.uniform(-.7,.85)
    stone_layer(f'slate_contact_chip_{i}',x,y,.01,.08,random.uniform(.07,.15),random.uniform(.05,.12),77+i)
anchor_plate=attach(cube('anchor_steel_sole',(anchor_x-.06,-.02,1.28),(1.2,.82,.08),dark,.025),assembly)
for dx in [-.42,.42]:
    for dy in [-.27,.27]: attach(cyl('anchor_hex_bolt',(anchor_x-.06+dx,dy,1.30),(anchor_x-.06+dx,dy,1.38),.072,polished,6),assembly)
lower_path=([(-3.17,0,1.35),(-2.45,0,3.63),(-2.17,0,4.12),(-1.80,0,4.30),(2.48,0,5.52)] if PHONE else [(-5.32,0,1.35),(-4.2,0,3.50),(-3.75,0,3.72),(-1.9,0,4.10),(4.2,0,5.50)])
lower=attach(ribbon('folded_lower_arm',lower_path,.39,.20,silver),assembly)
upper_path=([(-3.3,.13,8.19),(-1.55,.13,8.74),(-.65,.13,9.52),(.60,.13,9.90),(1.82,.13,9.77),(3.30,.13,9.38)] if PHONE else [(-3.65,.13,6.52),(-.2,.13,7.0),(.3,.13,7.40),(1.45,.13,7.70),(3.0,.13,8.94),(6.15,.13,8.03)])
upper=attach(ribbon('upper_balance_arm',upper_path,.26,.16,silver),assembly)
strut_path=([(-3.0,.34,1.33),(-2.32,.34,3.38),(-1.80,.34,4.02)] if PHONE else [(-5.15,.34,1.33),(-4.1,.34,3.38),(-1.9,.34,3.84)])
root_strut=attach(ribbon('return_anchor_strut',strut_path,.18,.11,polished),assembly)

def axle(name,at,r=.13):
    x,y,z=at
    attach(cyl(name+'_axle',(x,y-.2,z),(x,y+.2,z),r,polished),assembly)
    attach(annulus(name+'_front_flange',(x,y-.24,z),r*1.7,r*.63,.05,polished),assembly)
    attach(cyl(name+'_hex',(x,y-.27,z),(x,y-.32,z),r*.56,dark,6),assembly)
axle('anchor_hinge',(anchor_x-.02,0,1.47),.11)
axle('upper_peak_hinge',upper_path[-2],.10)
axle('upper_tip_hinge',upper_path[-1],.077)
axle('lower_terminal_hinge',lower_path[-1],.11)
for i,(x,y,z) in enumerate([lower_path[2],lower_path[3],upper_path[1],upper_path[2]]): axle(f'beam_fold_joint_{i}',(x,y,z),.046)

def face_plane(name,w,h,material,camber=.018):
    # UV's bottom-left=(0,0), front outward=-Y; mild honest metal camber.
    nx,nz=12,18; verts=[]; uvs=[]
    for j in range(nz+1):
        for i in range(nx+1):
            u=i/nx; v=j/nz; verts.append(((u-.5)*w,-camber*math.sin(u*math.pi), (v-.5)*h)); uvs.append((u,v))
    faces=[]
    for j in range(nz):
        for i in range(nx):
            a=j*(nx+1)+i; faces.append((a,a+1,a+nx+2,a+nx+1))
    ob=mesh(name,verts,faces,material); layer=ob.data.uv_layers.new(name='UVMap')
    for poly in ob.data.polygons:
        for li in poly.loop_indices: layer.data[li].uv=uvs[ob.data.loops[li].vertex_index]
    for f in ob.data.polygons: f.use_smooth=True
    return ob

clock_nodes=[]
# Unequal source plates rise to the right while their projected lower edges align.
# The values were inverse-projected from source at the committed opening camera.
clock_layout=([('d',-2.10,2.385,2.05),('h',-.84,2.604,2.22),('m',.45,2.841,2.44),('s',1.81,3.068,2.60)] if PHONE else [('d',-2.35,2.385,2.05),('h',-.90,2.604,2.22),('m',.50,2.841,2.44),('s',2.10,3.068,2.60)])
for i,(label,x,center_z,face_height) in enumerate(clock_layout):
    center=Vector((x,-.32,center_z)); h=face_height+.065; w=face_height/2.19+.055
    hanger_z=(4.30+(x+1.8)*(5.52-4.30)/(2.48+1.8)) if PHONE else 4.05+(x+2.1)*.23
    pivot=group(f'clock_{label}_pivot',(x,-.16,hanger_z))
    attach(pivot,assembly)
    parent_plate=group(f'clock_{label}_assembly',center); attach(parent_plate,pivot)
    body=attach(cube(f'clock_{label}_body',center,(w,.115,h),silver,.048),parent_plate)
    ob=face_plane(f'clock_{label}',w-.055,h-.065,face,.012); ob.location=center+Vector((0,-.072,0)); attach(ob,parent_plate)
    # Dark rear cassette and edge fasteners are genuine back/side volumes.
    attach(cube(f'clock_{label}_rear_cassette',center+Vector((.055,.10,0)),(w*.96,.09,h*.96),dark,.024),parent_plate)
    attach(rope(f'clock_{label}_suspension',(x,-.14,hanger_z),(x,-.14,center.z+h/2+.11),.013),pivot)
    attach(annulus(f'clock_{label}_top_eye',(x,-.14,center.z+h/2+.08),.065,.032,.045,polished),parent_plate)
    attach(cyl(f'clock_{label}_beam_clamp',(x,-.25,hanger_z),(x,.08,hanger_z),.056,polished),pivot)
    for dx in [-w*.45,w*.45]:
        for dz in [-h*.455,h*.455]: attach(cyl(f'clock_{label}_fastener',center+Vector((dx,-.071,dz)),center+Vector((dx,-.09,dz)),.017,polished,12),parent_plate)
    attach(cyl(f'clock_{label}_side_hinge',center+Vector((w/2,.00,.77)),center+Vector((w/2+.13,.00,.77)),.077,polished),parent_plate)
    bpy.context.view_layer.update()
    clock_nodes.append({'node':f'clock_{label}','width':w-.055,'height':h-.065,'centerBlender':list(ob.matrix_world.translation),'normalBlender':[0,-1,0],'uv':'bottom-left 0,0; outward front -Y; slight camber'})

archives=([('dexter',(-2.50,.45,6.83),2.48,1.93,-.085,.11),('severance',(-.22,-.34,7.62),2.75,2.17,.025,-.08),('got',(2.17,1.20,7.96),2.62,2.05,-.055,.14)] if PHONE else [('dexter',(-2.5,-.34,5.53),2.48,1.93,-.11,.18),('severance',(2.0,-.20,6.69),2.75,2.17,.065,-.22),('got',(5.83,-.03,6.87),2.62,2.05,-.055,.17)])
archive_nodes=[]
def upper_height(x):
    for a,b in zip(upper_path,upper_path[1:]):
        if a[0]<=x<=b[0]:
            t=(x-a[0])/(b[0]-a[0]); return a[2]*(1-t)+b[2]*t
    return upper_path[0][2] if x<upper_path[0][0] else upper_path[-1][2]
for name,location,w,h,rz,tilt in archives:
    center=Vector(location); g=group(f'archive_{name}_mount',center); attach(g,assembly)
    shell=cube(f'archive_{name}_back',center,(w+.105,.095,h+.105),silver,.025); attach(shell,g)
    s=face_plane(f'archive_{name}_screen',w,h,screen,0); s.location=center+Vector((0,-.061,0)); attach(s,g)
    g.rotation_euler.z=rz; g.rotation_euler.y=tilt; bpy.context.view_layer.update()
    support_offsets=[-w*.34,w*.34] if name!='got' else [-w*.31,w*.11]
    for dx in support_offsets:
        eye=g.matrix_world @ Vector((dx,.015,h/2+.075))
        rail=upper_height(eye.x)
        attach(rope(f'archive_{name}_cable',(eye.x,.13,rail),eye,.014),g)
        attach(annulus(f'archive_{name}_eye',eye,.053,.029,.042,polished),g)
        attach(cyl(f'archive_{name}_collar',(eye.x,-.095,rail),(eye.x,.19,rail),.034,polished),g)
    bpy.context.view_layer.update()
    archive_nodes.append({'id':name,'screen':s.name,'pivot':g.name,'width':w,'height':h,'centerBlender':list(s.matrix_world.translation),'normalBlender':list(g.matrix_world.to_quaternion()@Vector((0,-1,0))),'rotationBlenderRadians':list(g.rotation_euler)})

# Source's inclined cylinder is one coherent weight, never a separate facing button.
top=Vector((5.02,.10,3.89)); end=Vector((5.95,-2.22,2.63)); axis=(end-top).normalized()
if PHONE:
    end=Vector((2.52,-1.85,.84)); top=end-axis*2.8
weight=group('weight_pivot',top+Vector((.1,-.32,.34))); attach(weight,assembly)
body_radius=.85 if PHONE else .67; face_radius=.81 if PHONE else .632
body=attach(cyl('reset_body',top,end,body_radius,polished,96),weight)
# Fine brushed finishing occupies two narrow collars; the main cylinder retains
# the source's continuous polished reflection around its genuine round body.
attach(cyl('counterweight_satin_band',top+axis*.12,top+axis*.30,body_radius+.006,silver,96),weight)
reset=attach(cyl('reset_face',end-axis*.027,end+axis*.027,face_radius,silver,96),weight)
# Explicit radial XY UV on true endcap; runtime ink is bound to this cylinder cap.
for poly in reset.data.polygons:
    for li in poly.loop_indices:
        co=reset.data.vertices[reset.data.loops[li].vertex_index].co
        reset.data.uv_layers.active.data[li].uv=(co.x/(2*face_radius)+.5,co.y/(2*face_radius)+.5)
attach(annulus('counterweight_endcap_ring',end,body_radius+.013,face_radius+.003,.065,polished,axis),weight)
ink_y=(Vector((0,0,1))-axis*axis.z).normalized(); ink_x=ink_y.cross(axis).normalized()
ink_rotation=Matrix((ink_x,ink_y,axis)).transposed().to_quaternion()
radius=.780 if PHONE else .603; n=96
ink_verts=[(0,0,0)]+[(math.cos(i*math.tau/n)*radius,math.sin(i*math.tau/n)*radius,0) for i in range(n)]
ink_faces=[(0,i+1,(i+1)%n+1) for i in range(n)]
ink=mesh('reset_ink',ink_verts,ink_faces,face); ink.location=end+axis*.029; ink.rotation_mode='QUATERNION'; ink.rotation_quaternion=ink_rotation
uv=ink.data.uv_layers.new(name='UVMap')
for poly in ink.data.polygons:
    for li in poly.loop_indices:
        co=ink.data.vertices[ink.data.loops[li].vertex_index].co; uv.data[li].uv=(co.x/(2*radius)+.5,co.y/(2*radius)+.5)
attach(ink,weight)
tally_width=.56 if PHONE else .43; tally_height=.18 if PHONE else .14
tally=mesh('reset_tally',[(-tally_width/2,-tally_height/2,0),(tally_width/2,-tally_height/2,0),(tally_width/2,tally_height/2,0),(-tally_width/2,tally_height/2,0)],[(0,1,2,3)],face)
tally.location=end+axis*.034-ink_y*(radius*.59); tally.rotation_mode='QUATERNION'; tally.rotation_quaternion=ink_rotation
uv=tally.data.uv_layers.new(name='UVMap')
for li,pair in enumerate([(0,0),(1,0),(1,1),(0,1)]): uv.data[li].uv=pair
attach(tally,weight)
for dist in [.06,.30]: attach(annulus('counterweight_top_collar',top+axis*dist,body_radius+.04,body_radius,.075,polished,axis),weight)
# Articulated clevis has real two cheeks and visible cylindrical pin.
for side in [-1,1]:
    loc=top+Vector((side*.28,0,.28)); part=cube('weight_clevis_cheek',loc,(.105,.46,.74),polished,.10); part.rotation_euler.y=-.38; attach(part,weight)
attach(cyl('weight_clevis_axle',top+Vector((-.37,0,.40)),top+Vector((.37,0,.40)),.13,silver),weight)
upper_p=Vector(upper_path[-2]) if PHONE else Vector((3.49,.10,8.57)); lower_p=Vector(lower_path[-1]) if PHONE else Vector((4.27,-.03,5.42))
if PHONE:
    # A rear load channel lets the apertures stay physically clear. True axles
    # bridge the folded arms to the pulley groove, behind the archive mounts.
    upper_rail=upper_p.copy(); lower_rail=lower_p.copy()
    upper_p.y=2.0; lower_p.y=2.0
    attach(cyl('upper_rear_load_shaft',upper_rail,upper_p,.046,polished),assembly)
    attach(cyl('lower_rear_load_shaft',lower_rail,lower_p,.058,polished),assembly)
for name,p,r in [('upper_pulley',upper_p,.20),('lower_pulley',lower_p,.23)]:
    attach(annulus(name,p,r,r*.43,.15,polished),assembly)
    attach(cyl(name+'_axle',p+Vector((0,-.17,0)),p+Vector((0,.17,0)),r*.40,dark),assembly)
for i,offset in enumerate([-.10,.10]):
    start=upper_p+Vector((offset,-.14,-.1)); finish=top+Vector((offset,-.08,.42))
    if PHONE:
        bend=lower_p+Vector((offset,.25,.13))
        attach(rope(f'weight_load_cable_upper_{i}',start,bend,.019),assembly)
        attach(rope(f'weight_load_cable_{i}',bend,finish,.019),assembly)
    else: attach(rope(f'weight_load_cable_{i}',start,finish,.019),assembly)
ceiling=Vector(upper_path[-2])+Vector((-.08,.04,.05))
attach(rope('upper_ceiling_tension',ceiling,ceiling+Vector((0,0,4.0)),.013),assembly)

# Hidden crown sits under a turned physical flange.
secret=group('secret_flange_pivot',(anchor_x-.15,-.18,1.48)); attach(secret,assembly)
flange=attach(cube('secret_flange',(anchor_x-.15,-.29,1.48),(.33,.06,.27),silver,.018),secret); flange.rotation_euler.x=-.25
crown=attach(mesh('hidden_crown',[(-.10,-.01,0),(-.12,-.01,.11),(-.045,-.01,.07),(0,-.01,.15),(.045,-.01,.07),(.12,-.01,.11),(.10,-.01,0)],[tuple(range(7))],gold),secret)
crown.location=Vector((-.0,.02,0))
unwrap(crown)

def area(name,loc,target,power,color,size,shape='DISK'):
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.color=color; data.shape=shape; data.size=size
    ob=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(ob); ob.location=loc; ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler(); return ob
area('daylight_key',(-13.8,-5,11.5),(1,0,3.5),2500,(1,.94,.84),4)
sun_data=bpy.data.lights.new('window_sun','SUN'); sun_data.energy=2; sun_data.angle=.010; sun_data.color=(1,.94,.84)
sun=bpy.data.objects.new('window_sun',sun_data); bpy.context.collection.objects.link(sun); sun.location=(-13.8,-5,11.5)
sun.rotation_euler=(Vector((1,0,3.5))-sun.location).to_track_quat('-Z','Y').to_euler()
area('cool_room_bounce',(5,-4,7),(0,0,4),550,(.77,.86,1),7)
area('rear_window_fill',(3,3.6,9),(2,0,3),800,(.9,.95,1),5)
area('long_strip_highlight',(-1,-6,11),(1,0,5),650,(1,1,1),5,'RECTANGLE').data.size_y=.45

scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.samples=24; scene.cycles.use_denoising=True
# Local authoring proofs use Metal compute where available; browser proof remains required.
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type='METAL'; prefs.get_devices()
    for device in prefs.devices: device.use=device.type=='METAL'
    scene.cycles.device='GPU'
except Exception: scene.cycles.device='CPU'
scene.world.color=(.3,.3,.3)
scene.world.use_nodes=True; scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.62,.66,.7,1); scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.25
scene.render.resolution_x=390 if PHONE else 1487; scene.render.resolution_y=844 if PHONE else 1058; scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'; scene.view_settings.look='AgX - Medium High Contrast'; scene.view_settings.exposure=.1
bpy.ops.object.camera_add(location=(.10,-23.4,7.94) if PHONE else (9.2,-27,10.1)); camera=bpy.context.object; camera.name='opening_camera'; camera.data.lens=43 if PHONE else 70; camera.data.clip_end=150
if PHONE: camera.data.sensor_fit='VERTICAL'; camera.data.sensor_height=32
target=Vector((-.30,0,5.6) if PHONE else (.65,0,4.25)); camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler(); scene.camera=camera

# Triangulation preserves tangents on cap n-gons and the sculpted miter faces.
for o in scene.objects:
    if o.type=='MESH':
        tri=o.modifiers.new('Export_tangent_triangulation','TRIANGULATE'); tri.keep_custom_normals=True
# Apply geometry modifiers for reliable exported normals/tangents without changing source.
for im in bpy.data.images:
    if im.filepath: im.pack()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'authoring'/f'held-in-suspense{SUFFIX}.blend'))
bpy.ops.object.select_all(action='DESELECT')
export_objects=[o for o in scene.objects if o.type in {'MESH','EMPTY','CAMERA'}]
for o in export_objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/f'scene{SUFFIX}.glb'),export_format='GLB',use_selection=True,export_apply=True,export_texcoords=True,export_normals=True,export_tangents=True,export_materials='EXPORT',export_cameras=True,export_lights=False,export_extras=True)
# Read the exported perspective: Blender sensor fit can make angle_y differ
# from the exported camera at a wide/portrait render aspect.
import struct
glb=(ROOT/f'scene{SUFFIX}.glb').read_bytes(); json_size=struct.unpack_from('<I',glb,12)[0]
gltf=json.loads(glb[20:20+json_size]); camera_perspective=gltf['cameras'][0]['perspective']
manifest={
    'concept':'held-in-suspense','tool':bpy.app.version_string,'selectedTool':'Blender 4.5.14 LTS','status':'authored asset gate; independent browser/source acceptance pending',
    'license':'Project-authored geometry/materials, same repository license; Blender binary not distributed',
    'bundle':f'scene{SUFFIX}.glb','geometryGroup':'counterbalanced_installation','editable':f'authoring/held-in-suspense{SUFFIX}.blend','script':'authoring/create_scene.py','composition':'portrait physical rig' if PHONE else 'reference opening',
    'axes':{'authoring':'Blender +Z up, -Y front','runtime':'glTF +Y up, +Z front','mapping':'Blender(x,y,z) -> glTF(x,z,-y)'},
    'clockFaces':clock_nodes,'archives':archive_nodes,
    'reset':{'face':'reset_face','ink':'reset_ink','tally':'reset_tally','body':'reset_body','pivot':'weight_pivot','radius':face_radius,'inkRadius':radius,'endcapCenterBlender':list(end),'normalBlender':list(axis),'tangentXBlender':list(ink_x),'tangentYBlender':list(ink_y),'inkLocalUVcornersGLTF':[[-radius,0,radius],[radius,0,radius],[radius,0,-radius],[-radius,0,-radius]],'inkNormalLocalGLTF':[0,1,0],'uv':'reset_ink explicit circularface UV radial0..1, tangentY projectedworldup; metalbody separate; corners ordered00/10/11/01'},
    'articulation':['clock_d_pivot','clock_h_pivot','clock_m_pivot','clock_s_pivot','weight_pivot','upper_pulley','lower_pulley','secret_flange_pivot'],
    'room':{'geometry':'reflection_room','lightDirectionBlender':[-13.8,-5,11.5],'use':'Use PMREM from the authored window/flag room; window highlights and actual cast-shadow key agree; luminous panes cast no shadows, physical mullions do'},
    'camera':{'node':'opening_camera','positionBlender':list(camera.location),'targetBlender':list(target),'positionGLTF':[camera.location.x,camera.location.z,-camera.location.y],'targetGLTF':[target.x,target.z,-target.y],'lensMillimeters':camera.data.lens,'sensorWidthMillimeters':36,'aspect':scene.render.resolution_x/scene.render.resolution_y,'yfovRadians':camera_perspective['yfov'],'yfovDegrees':math.degrees(camera_perspective['yfov']),'fitWidth':8.0 if PHONE else None,'fitHeight':14.9 if PHONE else None},
    'materials':[{ 'name':m.name,'mapped': [n.image.name for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image] } for m in bpy.data.materials],
    'nodes':[o.name for o in export_objects],'required':[f'scene{SUFFIX}.glb'],
    'textures':{'sizes':'512 square','colour':['slate_albedo','limestone_albedo'],'data':['brushed_roughness','brushed_normal','slate_roughness','slate_normal','limestone_roughness']},
    'transferBytes':(ROOT/f'scene{SUFFIX}.glb').stat().st_size,'triangleEstimate':sum(len(o.data.polygons)*2 for o in scene.objects if o.type=='MESH'),
}
(ROOT/f'manifest{SUFFIX}.json').write_text(json.dumps(manifest,indent=2)+'\n')
(ROOT/'lighting'/'rig.json').write_text(json.dumps({'key':{'positionBlender':[-13.8,-5,11.5],'targetBlender':[1,0,3.5],'sunStrength':2,'sunAngleRadians':.01,'areaFillSize':4,'areaFillWatts':2500,'color':[1,.94,.84]},'bounce':{'positionBlender':[5,-4,7],'areaSize':7,'powerWatts':550},'source':'Actual side-window geometry in reflection_room; source and shadows must remain coherent in Three. Luminous panes do not cast shadows; mullions do. Frontalreflection reachesactualsidewindow continuationbehindcamera.'},indent=2)+'\n')
scene.render.filepath=str(ROOT/'inspection'/f'final-light{PROOF_SUFFIX}.png'); bpy.ops.render.render(write_still=True)
# Clay neutralizes all surface maps; inspect the actual geometry from independent view.
clay=mat('inspection_clay',(.32,.32,.30),0,.63)
scene.view_layers[0].material_override=clay; scene.render.resolution_percentage=50; scene.cycles.samples=16
for o in scene.objects:
    if o.type=='LIGHT': o.data.energy*=.28
scene.view_settings.exposure=-.4
scene.render.filepath=str(ROOT/'inspection'/f'clay-reference{PROOF_SUFFIX}.png'); bpy.ops.render.render(write_still=True)
camera.location=(11,-19,11) if PHONE else (13,-16,10.5); camera.rotation_euler=(Vector((0,0,5.0) if PHONE else (.6,0,4.0))-camera.location).to_track_quat('-Z','Y').to_euler(); camera.data.lens=43
scene.render.filepath=str(ROOT/'inspection'/f'clay-three-quarter{PROOF_SUFFIX}.png'); bpy.ops.render.render(write_still=True)
camera.location=(-12,-1,8); camera.rotation_euler=(Vector((1,0,4))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(ROOT/'inspection'/f'clay-side{PROOF_SUFFIX}.png'); bpy.ops.render.render(write_still=True)
print('ASSET_HANDOFF',ROOT/f'scene{SUFFIX}.glb')
