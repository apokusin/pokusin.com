"""Authored construction coast and supported blue detour. Blender4.5.14 LTS.

Every interface face is blank. Browser state/stills occupy genuine UV surfaces.
"""
import bpy, math, random, json, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]; rng=random.Random(1081)
CAMERA=Vector((0,-29,19));TARGET=Vector((0,2,1));LENS=48
FORWARD=(TARGET-CAMERA).normalized();RIGHT=FORWARD.cross(Vector((0,0,1))).normalized();UP=RIGHT.cross(FORWARD)
TAN_H=36/(2*LENS);TAN_V=TAN_H/(1487/1058)
def source_point(u,v,z):
 direction=FORWARD+RIGHT*((2*u-1)*TAN_H)+UP*((1-2*v)*TAN_V)
 return CAMERA+direction*((z-CAMERA.z)/direction.z)
def source_size(position,width,height):
 depth=(Vector(position)-CAMERA).dot(FORWARD)
 return width*2*TAN_H*depth,height*2*TAN_V*depth/UP.z
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for m in list(bpy.data.materials):bpy.data.materials.remove(m)

def mat(name,color,rough=.7,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;return m
def tex(name,func,size=512):
 im=bpy.data.images.new(name,width=size,height=size,alpha=False);pixels=[]
 for y in range(size):
  for x in range(size):pixels.extend((*func(x,y),1))
 im.pixels.foreach_set(pixels);im.filepath_raw=str(ROOT/'materials'/f'{name}.png');im.file_format='PNG';im.save();return im
def mapped(m,im,socket,normal=.32):
 n=m.node_tree.nodes;l=m.node_tree.links;t=n.new('ShaderNodeTexImage');t.image=im
 if socket!='Base Color':im.colorspace_settings.name='Non-Color'
 if socket=='Normal':
  b=n.new('ShaderNodeNormalMap');b.inputs['Strength'].default_value=normal;l.new(t.outputs['Color'],b.inputs['Color']);l.new(b.outputs['Normal'],n.get('Principled BSDF').inputs['Normal'])
 else:l.new(t.outputs['Color'],n.get('Principled BSDF').inputs[socket])
grain=random.Random(619)
noise=[grain.random() for _ in range(512*512)]
stone_albedo=tex('salmon_limestone_albedo',lambda x,y:(lambda a:(a,a*.80,a*.67))(.66+noise[y*512+x]*.16+.020*math.sin(x*.025+y*.14)))
stone_rough=tex('limestone_roughness',lambda x,y:(lambda a:(a,a,a))(.7+noise[y*512+x]*.25))
# Normal channels are derivatives of authored relief, not unrelated sine stripes.
stone_height=[noise[y*512+x]*.021+.007*math.sin(x*.042+y*.033)+.005*math.cos(y*.077) for y in range(512) for x in range(512)]
def height_normal(values,x,y,strength):
 dx=(values[y*512+(x+1)%512]-values[y*512+(x-1)%512])*strength
 dy=(values[((y+1)%512)*512+x]-values[((y-1)%512)*512+x])*strength
 n=Vector((-dx,-dy,1)).normalized();return ((n.x+1)*.5,(n.y+1)*.5,(n.z+1)*.5)
stone_normal=tex('limestone_normal',lambda x,y:height_normal(stone_height,x,y,8))
asphalt_albedo=tex('cobalt_aggregate_albedo',lambda x,y:(lambda a:(a*.20,a*.46,a))(.41+noise[y*512+x]*.18))
asphalt_rough=tex('aggregate_roughness',lambda x,y:(lambda a:(a,a,a))(.65+noise[y*512+x]*.22))
asphalt_height=[.023*n+.007*math.sin((i%512)*.067+(i//512)*.042) for i,n in enumerate(noise)]
asphalt_normal=tex('aggregate_normal',lambda x,y:height_normal(asphalt_height,x,y,11))
stone=mat('salmon_quarried_limestone',(.68,.44,.31),.85);mapped(stone,stone_albedo,'Base Color');mapped(stone,stone_rough,'Roughness');mapped(stone,stone_normal,'Normal')
precast_albedo=tex('weathered_precast_albedo',lambda x,y:(lambda a:(a,a*.80,a*.63))(.50+noise[y*512+x]*.14+.035*math.sin(x*.021)*math.cos(y*.034)))
concrete=mat('aged_precast_concrete',(.59,.45,.33),.88);mapped(concrete,precast_albedo,'Base Color');mapped(concrete,stone_rough,'Roughness');mapped(concrete,stone_normal,'Normal',.55)
blue=mat('worn_cobalt_asphalt',(.08,.24,.58),.8);mapped(blue,asphalt_albedo,'Base Color');mapped(blue,asphalt_rough,'Roughness');mapped(blue,asphalt_normal,'Normal')
orange=mat('orange_machine_enamel',(.93,.115,.009),.24,.20)
yellow=mat('caution_lime_paint',(.62,.68,.07),.45,.1)
steel=mat('aged_galvanised_steel',(.36,.38,.37),.38,.84)
dark=mat('rubber_and_charcoal',(.026,.025,.022),.72)
white=mat('old_lane_paint',(.84,.79,.65),.76)
leaf=mat('crack_succulent_yellow_green',(.30,.43,.035),.76)
leaf_light=mat('sunlit_leaf_tips',(.51,.59,.035),.74)
leaf_dark=mat('bush_inner_olive',(.11,.21,.016),.91)
gravel_blue=mat('rubbed_cobalt_aggregate',(.18,.32,.57),.89)
old_paint=mat('aged_paint_underlayer',(.48,.47,.24),.96)
chip=mat('cast_edge_pits',(.27,.21,.14),.94)
rust=mat('rusted_dark_scaffold',(.12,.09,.068),.65,.55)
glass=mat('machine_blue_glass',(.12,.24,.27),.21,.55)
screen=mat('blank_interface_surface',(.07,.073,.066),.68)
water=mat('pale_coastal_water',(.12,.30,.42),.17,.10)
lamp=mat('lamp_emitter',(.9,.73,.34),.6)
p=lamp.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(1,.74,.28,1);p.inputs['Emission Strength'].default_value=4
gold=mat('only_crown_under_roll_lip',(.60,.38,.06),.25,.7)

def mesh(name,verts,faces,m,keep=False):
 data=bpy.data.meshes.new(name+'_mesh');data.from_pydata(verts,[],faces);data.update();o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);data.materials.append(m);o['keep']=keep;return o
def uv(o):
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.1,island_margin=.018);bpy.ops.object.mode_set(mode='OBJECT');o.select_set(False)
def untextured_uv(o):
 # Direct per-face coordinates avoid repeated edit-mode operators on tiny
 # botanical props, while keeping a valid tangent basis for the export.
 layer=o.data.uv_layers.new(name='UVMap') if not o.data.uv_layers else o.data.uv_layers.active
 for polygon in o.data.polygons:
  axes=sorted(range(3),key=lambda axis:abs(polygon.normal[axis]))[:2]
  points=[o.data.vertices[o.data.loops[index].vertex_index].co for index in polygon.loop_indices]
  lo=[min(point[axis] for point in points) for axis in axes];hi=[max(point[axis] for point in points) for axis in axes]
  for index,point in zip(polygon.loop_indices,points):layer.data[index].uv=[(point[axis]-lo[k])/max(.000001,hi[k]-lo[k]) for k,axis in enumerate(axes)]

def bevel(o,width=.025,segments=2):
 b=o.modifiers.new('Worn_edge_radius','BEVEL');b.width=width;b.segments=segments;b.limit_method='ANGLE';b.harden_normals=True
 n=o.modifiers.new('Broad_face_normals','WEIGHTED_NORMAL');n.keep_sharp=True
 for p in o.data.polygons:p.use_smooth=True
 return o
def cube(name,loc,size,m,r=.025,keep=False):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m);o['keep']=keep;return bevel(o,r)
def cyl(name,a,b,r,m,n=16,keep=False):
 a=Vector(a);b=Vector(b);d=b-a;bpy.ops.mesh.primitive_cylinder_add(vertices=n,radius=r,depth=d.length,location=(a+b)/2);o=bpy.context.object;o.name=name;o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y');o.data.materials.append(m);o['keep']=keep;return bevel(o,min(.018,r*.15))
def group(name,loc=(0,0,0)):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.location=loc;return o
def parent(o,g):
 bpy.context.view_layer.update();w=o.matrix_world.copy();o.parent=g;o.matrix_world=w;return o
def face(name,w,h,loc,m=screen):
 o=mesh(name,[(-w/2,0,-h/2),(w/2,0,-h/2),(w/2,0,h/2),(-w/2,0,h/2)],[(0,1,2,3)],m,True);o.location=loc;l=o.data.uv_layers.new(name='UVMap')
 for i,u in enumerate([(0,0),(1,0),(1,1),(0,1)]):l.data[i].uv=u
 return o
def path_curve(name,points,r,m,keep=False):
 c=bpy.data.curves.new(name+'_curve','CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=1;s=c.splines.new('POLY');s.points.add(len(points)-1)
 for p,co in zip(s.points,points):p.co=(*co,1)
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(m);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o=bpy.context.object;o.select_set(False);o['keep']=keep;uv(o);return o

def weather_cast(o,strength=.032):
 bpy.context.view_layer.objects.active=o
 for modifier in list(o.modifiers):
  try:bpy.ops.object.modifier_apply(modifier=modifier.name)
  except RuntimeError:pass
 subdivision=o.modifiers.new('Uneven_cast_profile','SUBSURF');subdivision.subdivision_type='SIMPLE';subdivision.levels=2 if strength>.03 else 1
 tex=bpy.data.textures.new(o.name+'_relief','CLOUDS');tex.noise_scale=.095;tex.noise_depth=2
 displace=o.modifiers.new('Chipped_cast_relief','DISPLACE');displace.texture=tex;displace.strength=strength;displace.mid_level=.52
 uv(o);return o

def quarry(name,loc,size,seed):
 q=random.Random(seed);x,y,z=loc;sx,sy,sz=size
 outline=[(-.5,-.43),(-.37,-.5),(.41,-.48),(.5,-.32),(.47,.4),(.33,.5),(-.36,.47),(-.5,.31)]
 verts=[]
 for layer in range(4):
  zz=z+sz*layer/3
  for i,(a,b) in enumerate(outline):verts.append((x+a*sx+q.uniform(-.075,.075),y+b*sy+q.uniform(-.075,.075),zz+(q.uniform(-.13,.13) if layer else 0)))
 faces=[tuple(range(7,-1,-1)),tuple(range(24,32))]
 for k in range(3):
  for i in range(8):j=(i+1)%8;faces.extend([(k*8+i,k*8+j,(k+1)*8+j),(k*8+i,(k+1)*8+j,(k+1)*8+i)])
 o=mesh(name,verts,faces,stone);bevel(o,.018,1);uv(o);return weather_cast(o,.025)

world=group('construction_coast')
# Full sculpted bed with actual broken coastline and height, no photographic plane.
N=65;verts=[];faces=[]
for j in range(N):
 y=-13+j*43/(N-1)
 for i in range(N):
  x=-18+i*39/(N-1);z=.10+.23*math.sin(x*.35+y*.2)*math.cos(y*.45)+.18*math.sin(x*1.2+y*.4)
  z+=max(0,y-6)*.038
  if x<(-10+.8*math.sin(y*.6)):z=-.45
  verts.append((x,y,z))
for j in range(N-1):
 for i in range(N-1):a=j*N+i;faces.extend([(a,a+1,a+N+1),(a,a+N+1,a+N)])
ground=mesh('sculpted_coastal_bed',verts,faces,stone,True);uv(ground)
cube('sea_bed',(-37,42,-.46),(80,150,.25),water,.01)
for i in range(70):
 x=rng.uniform(-10,11);y=rng.uniform(-9,13)
 if -8<x<1 and 0<y<5:continue
 sx=rng.uniform(.42,1.14);sy=rng.uniform(.40,1.12);height=rng.uniform(.55,1.35)
 vertices=[];polygons=[];sides=9;shift=rng.uniform(-.1,.1)
 outline=[1+rng.uniform(-.24,.18) for _ in range(sides)]
 # Unequal cut terraces and a real cleft replace smooth primitive boulders.
 for level,(z,radius) in enumerate([(0,.87),(.20,1.0),(.58,.82),(.90,.48),(1.12,.16)]):
  for j in range(sides):
   angle=j*math.tau/sides+shift;rr=radius*outline[j]
   if j in [2,3] and level in [1,2]:rr*=.62
   vertices.append((x+math.cos(angle)*rr*sx+level*.035,y+math.sin(angle)*rr*sy-level*.035,.12+z*height+rng.uniform(-.065,.065)))
 polygons=[tuple(range(sides-1,-1,-1)),tuple(range(sides*4,sides*5))]
 for level in range(4):
  for j in range(sides):a=level*sides+j;b=level*sides+(j+1)%sides;polygons.extend([(a,b,b+sides),(a,b+sides,a+sides)])
 rock=mesh('cleft_stratified_boulder_'+str(i),vertices,polygons,stone,True);uv(rock)
 for polygon in rock.data.polygons:polygon.use_smooth=True
 # Small mesh relief remains subordinate to the angular cut planes.
 subdivision=rock.modifiers.new('Cleavage_surface_detail','SUBSURF');subdivision.subdivision_type='CATMULL_CLARK';subdivision.levels=1
 rock_tex=bpy.data.textures.new('cleft_stone_'+str(i),'CLOUDS');rock_tex.noise_scale=.15;rock_tex.noise_depth=2
 relief=rock.modifiers.new('Quarried_face_grit','DISPLACE');relief.texture=rock_tex;relief.strength=.072
for i in range(31):
 x=-8+(i%8)*2.2+rng.uniform(-.4,.4);y=8+(i//8)*2.5+rng.uniform(-.3,.3)
 h=rng.uniform(2.0,6.0);quarry('quarried_background_pier_'+str(i),(x,y,.1),(rng.uniform(.9,1.5),rng.uniform(.9,1.5),h),200+i)
 for z in [.9,2.0,3.2]:
  if z<h:cube('cleavage_seam_'+str(i),(x,y-.7,z),(1.25,.06,.07),concrete,.01)

# Unequal inland terraces, fractured caps and unfinished small connector spans.
for i in range(29):
 x=-13+(i%10)*3.05+rng.uniform(-.44,.44);y=15+(i//10)*3.6
 h=rng.uniform(2.8,5.6);quarry('far_unfinished_quarry_'+str(i),(x,y,.1),(rng.uniform(.72,1.25),rng.uniform(.72,1.4),h),2200+i)
 for dx in [-.27,.27]:cyl('exposed_rebar',(x+dx,y,h-.03),(x+dx,y,h+.42),.028,rust,8)
 if i%3==0:cube('unfinished_precast_span',(x+1.02,y,h-.10),(3.2,.75,.21),concrete,.04)
for i in range(115):
 x=rng.uniform(-11.5,16);y=rng.uniform(-10,21)
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=rng.uniform(.045,.18),location=(x,y,.26));o=bpy.context.object;o.name='broken_quarry_grit';o.data.materials.append(stone);o['keep']=False;uv(o)

print('ROADWORKS_STAGE sculpted coast',flush=True)
# A single closed slab cross-section sweeps the continuous front S / two high loops.
source_route=[(-.07,.975,1),(.17,.890,1.1),(.34,.815,1.25),(.39,.675,1.55),(.37,.57,1.8),(.45,.527,2.1),(.59,.515,2.35),(.72,.466,2.6),(.86,.428,2.95),(.96,.365,3.3),(.983,.303,3.6),(.916,.266,3.85),(.792,.247,4.0),(.675,.245,4.0),(.661,.212,4.1),(.741,.187,4.3),(.875,.188,4.55),(.965,.153,4.8),(.985,.115,5.0),(.911,.096,5.2),(.831,.111,5.35),(.774,.151,5.45),(.824,.199,5.55),(.951,.2,5.65)]
controls=[source_point(*p) for p in source_route]
def catmull(points,steps=20):
 result=[]
 for j in range(len(points)-1):
  p0=Vector(points[max(0,j-1)]);p1=Vector(points[j]);p2=Vector(points[j+1]);p3=Vector(points[min(len(points)-1,j+2)])
  for i in range(steps):
   t=i/steps;result.append((p1*2+(p2-p0)*t+(p0*2-p1*5+p2*4-p3)*t*t+(-p0+p1*3-p2*3+p3)*t*t*t)*.5)
 result.append(Vector(points[-1]));return result
road_points=catmull(controls);road_normals=[];distance=[0]
for i,p in enumerate(road_points):
 d=road_points[min(len(road_points)-1,i+1)]-road_points[max(0,i-1)];d.z=0;d.normalize();road_normals.append(Vector((-d.y,d.x,0)))
 if i:distance.append(distance[-1]+(p-road_points[i-1]).length)
def road_ribbon(name,centerline,normals,halfwidth,thickness,m):
 verts=[];faces=[];uvs=[]
 for i,p in enumerate(centerline):
  w=halfwidth(i);n=normals[i]
  for side,zz in [(-1,0),(1,0),(1,-thickness),(-1,-thickness)]:verts.append(p+n*w*side+Vector((0,0,zz)));uvs.append((distance[min(i,len(distance)-1)]*.30,0 if side<0 else 1))
 for i in range(len(centerline)-1):
  a=i*4;b=a+4;faces.extend([(a,b,b+1,a+1),(a+1,b+1,b+2,a+2),(a+2,b+2,b+3,a+3),(a+3,b+3,b,a)])
 faces.extend([(3,2,1,0),(len(verts)-4,len(verts)-3,len(verts)-2,len(verts)-1)])
 o=mesh(name,verts,faces,m,True);layer=o.data.uv_layers.new(name='UVMap')
 for poly in o.data.polygons:
  for li in poly.loop_indices:layer.data[li].uv=uvs[o.data.loops[li].vertex_index]
 bevel(o,.023,2);return o
road=road_ribbon('continuous_supported_blue_detour',road_points,road_normals,lambda i:1.22-.24*i/len(road_points),.25,blue)
for side in [-1,1]:
 rail=[p+n*(1.18-.24*i/len(road_points))*side+Vector((0,0,.19)) for i,(p,n) in enumerate(zip(road_points,road_normals))]
 path_curve('continuous_guardrail_'+str(side),rail,.031,steel,True)
 for i in range(0,len(road_points),6):
  p=rail[i];cyl('rail_upright',p-Vector((0,0,.18)),p+Vector((0,0,.03)),.016,steel,8)
for i in range(0,len(road_points)-3,6):
 a=road_points[i]+Vector((0,0,.017));b=road_points[i+2]+Vector((0,0,.017));d=b-a
 paint=cube('aged_lane_underlayer',(a+b)/2,(.061,d.length,.014),old_paint,.002);paint.rotation_euler.z=-math.atan2(d.x,d.y)
 for part in range(3):
  if rng.random()<.10:continue
  p=a.lerp(b,(part+.5)/3)+Vector((.006,0,.006));mark=cube('worn_white_lane',(p.x,p.y,p.z),(.045,d.length*.28,.015),white,.003);mark.rotation_euler.z=-math.atan2(d.x,d.y)
grain_vertices=[];grain_faces=[]
for i in range(1800):
 index=rng.randrange(len(road_points));p=road_points[index]+road_normals[index]*rng.uniform(-1.04,1.04)+Vector((0,0,.006));r=rng.uniform(.007,.022);a=len(grain_vertices)
 grain_vertices.extend([p+Vector((-r,-r,0)),p+Vector((r,-r,0)),p+Vector((0,r,0)),p+Vector((0,0,r*.42))]);grain_faces.extend([(a,a+1,a+3),(a+1,a+2,a+3),(a+2,a,a+3)])
aggregate=mesh('embedded_rubbed_road_aggregate',grain_vertices,grain_faces,gravel_blue);uv(aggregate)
for i in range(7,len(road_points)-6,23):
 p=road_points[i];quarry('grounded_road_pier_'+str(i),(p.x,p.y,-.05),(.66,.79,p.z-.13),470+i)
 cube('pier_cap',(p.x,p.y,p.z-.2),(1.9,.88,.15),concrete,.035)

print('ROADWORKS_STAGE continuous supported road',flush=True)
# Heavy upper-left timer sign, cast concrete surround and blue pipe kit.
sign_center=Vector((-5.2,2.9,5.6));sign=group('clock_sign',sign_center)
housing=cube('clock_cast_housing',sign_center,(6.0,.49,3.35),concrete,.17,True);weather_cast(housing,.047);parent(housing,sign)
parent(face('clock_backboard',5.56,2.97,sign_center+Vector((0,-.27,0)),dark),sign)
clock=[]
for i,label in enumerate('dhms'):
 x=-7.30+i*1.40;z=5.40
 parent(cube('clock_'+label+'_cassette',(x,2.565,z),(1.18,.15,1.38),dark,.065,True),sign)
 f=parent(face('clock_'+label,1.08,1.28,(x,2.475,z),dark),sign);clock.append(f.name)
 parent(face('clock_'+label+'_unit',.60,.37,(x,2.474,4.48),dark),sign)
parent(face('clock_heading',4.30,.42,(-5.2,2.475,6.67),dark),sign)
for i in range(95):
 side=i%4;t=rng.uniform(-.96,.96)
 x=sign_center.x+(t*2.86 if side<2 else (-2.83 if side==2 else 2.83));z=sign_center.z+((-1 if side==0 else 1)*1.52 if side<2 else t*1.48)
 radius=rng.uniform(.007,.019);pit=mesh('cast_rim_pore',[(x-radius,2.641,z),(x+radius,2.641,z+.003),(x,2.638,z+radius)],[(0,1,2)],chip,True);uv(pit);parent(pit,sign)
pit_objects=[o for o in sign.children if o.name.startswith('cast_rim_pore')]
if pit_objects:
 bpy.ops.object.select_all(action='DESELECT')
 for o in pit_objects:o.select_set(True)
 bpy.context.view_layer.objects.active=pit_objects[0];bpy.ops.object.join();bpy.context.object.name='clock_cast_rim_pores'
for x in [-7.2,-3.55]:
 for y in [2.6,3.15]:
  cyl('clock_blue_pipe_leg',(x,y,.22),(x,y,4.1),.21,blue,24)
  for z in [.3,.65,3.9]:cyl('clock_pipe_collar',(x,y,z-.07),(x,y,z+.07),.28,blue,24)
  cube('pipe_grounded_foot',(x,y,.25),(.85,.82,.45),blue,.045)
for x in [-7.2,-5.2,-3.2]:
 pts=[(x,2.95,7.2),(x,2.95,7.62),(x,2.55,7.81),(x,2.24,7.52)]
 path_curve('curved_work_lamp_stalk',catmull(pts,8),.049,dark)
 profile=[(.295,7.35),(.27,7.41),(.20,7.52),(.11,7.60),(.065,7.62),(.047,7.62),(.08,7.59),(.17,7.51),(.242,7.40),(.275,7.35)]
 vs=[];fs=[]
 for radius,zz in profile:
  for j in range(48):a=j*math.tau/48;vs.append((x+math.cos(a)*radius,2.24+math.sin(a)*radius,zz))
 for k in range(len(profile)-1):
  for j in range(48):a=k*48+j;b=k*48+(j+1)%48;fs.append((a,b,b+48,a+48))
 shade=mesh('work_lamp_shade',vs,fs,dark);uv(shade)
 for poly in shade.data.polygons:poly.use_smooth=True
 cyl('work_lamp_lit_face',(x,2.24,7.371),(x,2.24,7.388),.225,lamp,48)

# Deep orange pressure cap lives on its own concrete pillar, never a floating button.
action_loc=Vector((-.87,2.8,4.74));action=group('action_pillar',action_loc)
pillar=cube('again_cast_pillar',action_loc,(1.90,.66,2.84),concrete,.105,True);weather_cast(pillar,.038);parent(pillar,action)
cap=group('again_cap_pivot',(-.87,2.25,5.05));parent(cap,action)
parent(cyl('again_black_boot',(-.87,2.27,5.05),(-.87,2.47,5.05),.76,dark,64,True),action)
cap_body=cyl('again_orange_cap',(-.87,1.97,5.05),(-.87,2.27,5.05),.72,orange,64,True);cap_body.modifiers['Worn_edge_radius'].width=.065;cap_body.modifiers['Worn_edge_radius'].segments=4;parent(cap_body,cap)
dome_vertices=[];dome_uv=[];dome_faces=[];rings=12;segments=64
for j in range(rings+1):
 r=max(.0001,j/rings)*.718
 for k in range(segments):
  angle=k*math.tau/segments;dome_vertices.append((-.87+r*math.cos(angle),1.969-.082*(1-(r/.718)**2),5.05+r*math.sin(angle)));dome_uv.append((k/segments,j/rings))
for j in range(rings):
 for k in range(segments):a=j*segments+k;b=j*segments+(k+1)%segments;dome_faces.append((a,a+segments,b+segments,b))
dome=mesh('again_convex_enamel_face',dome_vertices,dome_faces,orange,True);uv(dome);dome['keep']=True;parent(dome,cap)
placeholder=mat('transparent_reserved_ink',(1,1,1),.6);placeholder.diffuse_color=(1,1,1,0);placeholder.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value=0;placeholder.surface_render_method='DITHERED'
ink_vertices=[];ink_faces=[];ink_uv=[];ni=24
for j in range(ni+1):
 for i in range(ni+1):
  u=i/ni;v=j/ni;x=(u-.5)*1.2;z=(v-.5)*1.12;r2=x*x+z*z;ink_vertices.append((x,-.082*max(0,1-r2/(.718**2)),z));ink_uv.append((u,v))
for j in range(ni):
 for i in range(ni):a=j*(ni+1)+i;ink_faces.append((a,a+1,a+ni+2,a+ni+1))
reading=mesh('again_ink',ink_vertices,ink_faces,placeholder,True);layer=reading.data.uv_layers.new(name='UVMap')
for poly in reading.data.polygons:
 for li in poly.loop_indices:layer.data[li].uv=ink_uv[reading.data.loops[li].vertex_index]
reading.location=(-.87,1.958,5.05);reading['keep']=True;parent(reading,cap)
parent(face('press_tally',1.45,.47,(-.87,2.456,3.67),concrete),action)
for x in [-1.4,-.34]:
 cyl('action_blue_leg',(x,2.8,.22),(x,2.8,3.36),.18,blue,24)
 cube('action_foot',(x,2.8,.22),(.62,.72,.35),concrete,.04)
path_curve('clock_action_umbilical',[(-2.2,2.9,4),(-2.2,2.9,2.7),(-1.8,2.9,2.5),(-1.1,2.9,3.0)],.058,dark)

# Connected suspended roll: winding shell and a physically fed descending tongue.
roll=group('road_roll_pivot',(1.9,4.2,5.45))
spiral=[]
for index in range(150):
 t=index/149*math.tau*2.75;r=.27+.23*index/149;spiral.append(Vector((1.9,4.2+math.sin(t)*r,5.45+math.cos(t)*r)))
verts=[];faces=[]
for point in spiral:verts.extend([point+Vector((-.88,0,0)),point+Vector((.88,0,0))])
for index in range(len(spiral)-1):a=index*2;faces.append((a,a+1,a+3,a+2))
shell=mesh('layered_asphalt_roll',verts,faces,blue,True);uv(shell);shell.modifiers.new('True_road_winding_thickness','SOLIDIFY').thickness=.05;parent(shell,roll)
for dx in [-.96,.96]:parent(cyl('roll_steel_axle',(1.9+dx,4.2,5.45),(1.9+dx+(.12 if dx>0 else -.12),4.2,5.45),.085,steel,24,True),roll)
lip=face('roll_lift_lip',1.60,.31,(1.9,3.97,5.90),blue);lip.rotation_euler.x=.30;lip.modifiers.new('Liftable_road_corner_thickness','SOLIDIFY').thickness=.034;bevel(lip,.012,2)
crown=face('underside_crown_ink',.45,.30,(1.9,3.965,5.82),gold);parent(lip,roll);parent(crown,roll)
# Connected lattice tower/jib, with actual side and top triangular members.
for x in [.35,.83]:
 for y in [5.1,5.58]:cyl('crane_tower_chord',(x,y,.1),(x,y,8.1),.043,orange,10)
for z in [index*.62+.2 for index in range(13)]:
 for y in [5.1,5.58]:
  cyl('tower_diagonal',(.35,y,z),(.83,y,z+.61),.020,orange,8);cyl('tower_horizontal',(.35,y,z),(.83,y,z),.022,orange,8)
 for x in [.35,.83]:cyl('tower_side_diagonal',(x,5.1,z),(x,5.58,z+.61),.020,orange,8)
boom=[Vector((.59,5.34,8.02)),Vector((7.6,5.34,9.3))]
for y in [5.15,5.53]:
 for dz in [-.14,.14]:cyl('crane_jib_chord',(boom[0].x,y,boom[0].z+dz),(boom[1].x,y,boom[1].z+dz),.032,orange,10)
for index in range(16):
 a=boom[0].lerp(boom[1],index/16);b=boom[0].lerp(boom[1],(index+1)/16)
 for y in [5.15,5.53]:cyl('crane_jib_triangle',(a.x,y,a.z-.14),(b.x,y,b.z+.14),.018,orange,8)
cube('crane_counterweight',(-.5,5.34,8.05),(1.6,.95,.55),concrete,.04)
# All 13 original works are physically arranged at seven measured source stops.
stations=[]
for show,u,v,z,w,h,angle in [('got',.145,.665,2.4,.17,.15,-.04),('severance',.530,.60,2.8,.17,.15,.09),('house-of-cards',.76,.527,3,.14,.13,.12),('breaking-bad',.735,.36,4,.115,.085,-.10),('archer',.875,.405,3.9,.115,.115,.09),('dexter',.895,.195,5.3,.087,.085,-.15),('sherlock',.895,.078,6.3,.087,.077,-.14)]:
 position=source_point(u,v,z);width,height=source_size(position,w,h);stations.append((show,position,width,height,angle))
ids={'got':['s4','s3-redesign','s3-classic'],'severance':['s2','tracker'],'house-of-cards':['s2'],'breaking-bad':['final','desert-parallax'],'archer':['s5-final'],'dexter':['s8-final','s7-finale'],'sherlock':['final','alpha']}
records=[];extras=[]
for station_index,(show,loc,w,h,rz) in enumerate(stations):
 for version_index,version in enumerate(ids[show]):
  center=Vector(loc)+Vector((version_index*.23,version_index*.20,version_index*.10));g=group(f'station_{show}_{version}_mount',center)
  parent(cube(f'{show}_{version}_enamel_housing',center,(w+.13,.12,h+.14),rust,.04,True),g)
  screen_face=parent(face(f'work_{show}_{version}',w,h,center+Vector((0,-.075,0))),g)
  caption=parent(face(f'caption_{show}_{version}',w,.22,center+Vector((0,-.080,-h*.5-.16)),concrete),g)
  if version_index==0:
   for x in [center.x-w*.38,center.x+w*.38]:cyl('billboard_scaffold_upright',(x,center.y+.05,.16),(x,center.y+.05,center.z+h/2),.044,rust,10)
   for z in [.5,1.1,1.7]:
    if z<center.z-h*.4:cyl('billboard_truss',(center.x-w*.38,center.y+.1,z),(center.x+w*.38,center.y+.1,z+.6),.032,rust,8)
   marker_loc=Vector((center.x+w*.65,center.y-.12,max(.32,center.z-h*.5-.5)))
   cube('numbered_station_stone_'+show,marker_loc,(.54,.43,.67),concrete,.044,True);face('station_number_'+show,.42,.51,marker_loc+Vector((0,-.228,0)),concrete)
   for dx in [-w*.29,w*.29]:
    path_curve('station_lamp_hook',[(center.x+dx,center.y,center.z+h*.5),(center.x+dx,center.y,center.z+h*.5+.31),(center.x+dx,center.y-.25,center.z+h*.5+.25)],.025,dark)
    cyl('station_lamp_emitter',(center.x+dx,center.y-.25,center.z+h*.5+.18),(center.x+dx,center.y-.25,center.z+h*.5+.20),.10,lamp,16)
  g.rotation_euler.z=rz+version_index*.10
  records.append({'id':show+'/'+version,'show':show,'screen':screen_face.name,'caption':caption.name,'mount':g.name,'width':w,'height':h,'versionIndex':version_index,'station':station_index+1})
 links=[]
 if show in ['got','dexter','sherlock','archer','breaking-bad']:links.append(('archive/'+show,'Archive ↗'))
 if show=='dexter':links.append(('timeline/dexter','Timeline'))
 if show=='severance':links.append(('live/severance','Live ↗'))
 for link_index,(link_id,label) in enumerate(links):
  p=Vector(loc)+Vector((-w*.33+link_index*.9,-.09,-h*.5-.54));cube('accessory_plate_'+link_id.replace('/','_'),p,(.86,.08,.32),concrete,.025,True)
  face_node=face('link_'+link_id.replace('/','_'),.81,.28,p+Vector((0,-.055,0)),concrete);extras.append({'id':link_id,'node':face_node.name,'label':label,'show':show})
# Cast title belongs to the ground, with its physical extrusion and bevel.
font=bpy.data.fonts.load(str(ROOT/'typography'/'RobotoCondensed-variable.ttf'));data=bpy.data.curves.new('cast_title_letterforms','FONT');data.body='COUNTDOWNS';data.font=font;data.size=.98;data.extrude=.21;data.bevel_depth=.022;data.bevel_resolution=1;data.resolution_u=4;data.offset=.025
text_object=bpy.data.objects.new('cast_title',data);bpy.context.collection.objects.link(text_object);text_object.location=(-8.7,-1.2,.25);text_object.rotation_euler=(math.pi/2,0,0);data.materials.append(concrete)
bpy.context.view_layer.objects.active=text_object;text_object.select_set(True);bpy.ops.object.convert(target='MESH');title=bpy.context.object;title.select_set(False);title['keep']=True;uv(title)
# Distinct modeled machinery. Every vehicle is batched within its moving group.
def vehicle(name,location,scale=1,roller=False):
 g=group(name,location);x,y,z=location
 def add(o):o['keep']=True;return parent(o,g)
 add(cube(name+'_chassis',(x,y,z+.35),(1.35,.62,.25),dark,.055,True));add(cube(name+'_engine',(x-.37,y,z+.68),(.58,.68,.47),orange,.07,True))
 for index in range(7):add(cube(name+'_radiator_fin',(x-.51+index*.055,y-.354,z+.70),(.022,.035,.26),dark,.004,True))
 for side in [-1,1]:add(cyl(name+'_service_handle',(x-.59,y+side*.355,z+.85),(x-.28,y+side*.355,z+.85),.014,steel,10,True))
 if roller:
  add(cube(name+'_operator_deck',(x+.27,y,z+.58),(.68,.70,.10),orange,.028,True));add(cube(name+'_seat',(x+.18,y,z+.77),(.27,.32,.12),dark,.025,True));add(cube(name+'_seat_back',(x+.01,y,z+.97),(.09,.34,.36),dark,.025,True))
  add(cyl(name+'_steering_column',(x+.47,y,z+.63),(x+.40,y,z+1.06),.031,dark,12,True))
  bpy.ops.mesh.primitive_torus_add(major_radius=.125,minor_radius=.015,major_segments=24,minor_segments=8,location=(x+.40,y,z+1.06));steering=bpy.context.object;steering.name=name+'_steering_wheel';steering.rotation_euler.y=.5;steering.data.materials.append(dark);add(steering)
  for side in [-1,1]:
   add(path_curve(name+'_rollover_hoop',[(x+.02,y+side*.28,z+.58),(x+.02,y+side*.28,z+1.24),(x+.62,y+side*.28,z+1.24),(x+.62,y+side*.28,z+.58)],.024,steel,True));add(cube(name+'_front_fork',(x-.52,y+side*.48,z+.37),(.10,.08,.48),orange,.018,True))
 else:
  cab=mesh(name+'_sloped_cab',[(x+.02,y-.35,z+.48),(x+.62,y-.35,z+.48),(x+.50,y-.35,z+1.23),(x+.1,y-.35,z+1.23),(x+.02,y+.35,z+.48),(x+.62,y+.35,z+.48),(x+.50,y+.35,z+1.23),(x+.1,y+.35,z+1.23)],[(0,1,2,3),(4,7,6,5),(0,4,5,1),(3,2,6,7),(0,3,7,4),(1,5,6,2)],orange,True);uv(cab);add(bevel(cab,.045));add(face(name+'_windshield',.41,.48,(x+.31,y-.37,z+.94),glass));add(cube(name+'_roof',(x+.31,y,z+1.25),(.65,.75,.10),orange,.028,True))
  add(cube(name+'_dump_floor',(x-.38,y,z+.72),(.79,.71,.09),orange,.018,True));add(cube(name+'_dump_tailgate',(x-.77,y,z+.88),(.063,.71,.33),orange,.018,True))
  for side in [-1,1]:add(cube(name+'_dump_sidewall',(x-.38,y+side*.335,z+.88),(.79,.063,.33),orange,.018,True))
  for index in range(3):add(cube(name+'_bed_rib',(x-.65+index*.21,y-.373,z+.88),(.028,.022,.31),orange,.004,True))
 for xx in [x-.45,x+.45]:
  if roller and xx<x:
   add(cyl(name+'_front_steel_drum',(xx,y-.5,z+.25),(xx,y+.5,z+.25),.31,steel,64,True))
   for side in [-1,1]:add(cyl(name+'_drum_flange',(xx,y+side*.501,z+.25),(xx,y+side*.533,z+.25),.28,dark,48,True));add(cyl(name+'_drum_axle',(xx,y+side*.535,z+.25),(xx,y+side*.61,z+.25),.105,orange,32,True))
  else:
   for yy in [y-.39,y+.39]:
    add(cyl(name+'_treaded_tyre',(xx,yy-.12,z+.25),(xx,yy+.12,z+.25),.25,dark,32,True));add(cyl(name+'_wheel_hub',(xx,yy-.125,z+.25),(xx,yy-.13,z+.25),.14,orange,20,True))
    for index in range(16 if roller else 8):
     a=index*math.tau/(16 if roller else 8);block=add(cube(name+'_tyre_cleat',(xx+math.sin(a)*.247,yy,z+.25+math.cos(a)*.247),(.055,.24,.035),dark,.004,True));block.rotation_euler.y=a
 batches={}
 for o in list(g.children):
  if o.type=='MESH':
   bpy.context.view_layer.objects.active=o
   for modifier in list(o.modifiers):
    try:bpy.ops.object.modifier_apply(modifier=modifier.name)
    except RuntimeError:pass
   batches.setdefault(o.data.materials[0].name,[]).append(o)
 for material,objects in batches.items():
  bpy.ops.object.select_all(action='DESELECT')
  for o in objects:o.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name=name+'_'+material
 g.scale=(scale,scale,scale);return g
frontroller=vehicle('road_roller',road_points[18],1.04,True);truck=vehicle('ceremony_truck',road_points[99],.67)
for index,p in enumerate([road_points[143],road_points[216],road_points[300],Vector((-7.8,3.4,.35)),Vector((1.8,6.7,.35))]):vehicle('parked_truck_'+str(index),p,.50)
ex=group('articulated_excavator',(8.8,-4.2,.45));exloc=Vector((8.8,-4.2,.45))
for side in [-.47,.47]:
 for index in range(14):
  a=index/14*math.tau;xx=exloc.x+math.cos(a)*.71;zz=exloc.z+.22+math.sin(a)*.16;parent(cube('excavator_track_shoe',(xx,exloc.y+side,zz),(.16,.30,.065),dark,.012,True),ex)
parent(cube('excavator_turned_deck',exloc+Vector((0,0,.54)),(1.5,1.02,.34),orange,.12,True),ex);parent(cube('excavator_cab',exloc+Vector((.37,0,1.09)),(.66,.81,.91),orange,.11,True),ex);parent(face('excavator_cab_glazing',.47,.57,exloc+Vector((.37,-.421,1.16)),glass),ex)
arm=[exloc+Vector((-.25,0,.8)),exloc+Vector((-1.0,0,2.1)),exloc+Vector((-2.0,0,.93))]
for a,b in zip(arm,arm[1:]):parent(cyl('excavator_lift_arm',a,b,.12,orange,8,True),ex);parent(cyl('excavator_hydraulic',a+Vector((0,-.13,.12)),b+Vector((0,-.13,.06)),.044,steel,16,True),ex)
for a in arm:parent(cyl('excavator_pivot',a+Vector((0,-.17,0)),a+Vector((0,.17,0)),.11,dark,16,True),ex)
parent(cube('excavator_bucket',arm[-1]+Vector((-.19,0,-.19)),(.47,.58,.39),dark,.04,True),ex)
for dy in [-.20,0,.20]:parent(cube('bucket_tooth',arm[-1]+Vector((-.44,dy,-.37)),(.21,.09,.08),steel,.012,True),ex)
for index in range(44):
 p=road_points[10+(index*8)%(len(road_points)-22)];n=road_normals[10+(index*8)%(len(road_points)-22)];p=p+n*(1.38 if index%2 else -1.38)
 bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=.085,radius2=.025,depth=.29,location=p+Vector((0,0,.14)));o=bpy.context.object;o.name='construction_cone';o.data.materials.append(orange);o['keep']=False;cyl('cone_white_band',p+Vector((0,0,.14)),p+Vector((0,0,.18)),.057,white,12)
def terrain_z(x,y):return .10+.23*math.sin(x*.35+y*.2)*math.cos(y*.45)+.18*math.sin(x*1.2+y*.4)+max(0,y-6)*.038
for i in range(105):
 x=rng.uniform(-10.4,14);y=rng.uniform(-10,20);z=terrain_z(x,y)+.03
 if -8<x<-.5 and .0<y<4.5:continue
 height=rng.uniform(.32,.76);radius=rng.uniform(.24,.50);vs=[];fs=[]
 # A branched stem graph creates actual shrub mass from many cupped leaves;
 # no decorative sphere cores remain visible in the vegetation.
 stems=[]
 for branch in range(5):
  angle=branch*2.3999+i;end=Vector((x+math.cos(angle)*radius*.66,y+math.sin(angle)*radius*.66,z+height*rng.uniform(.65,1.1)));root=Vector((x,y,z));stems.append((root,end))
  stemverts=[];stemfaces=[]
  for k in range(3):
   point=root.lerp(end,k/2);r=.009*(1-k*.30)
   for j in range(6):a=j*math.tau/6;stemverts.append(point+Vector((math.cos(a)*r,math.sin(a)*r,0)))
  for k in range(2):
   for j in range(6):a=k*6+j;b=k*6+(j+1)%6;stemfaces.append((a,b,b+6,a+6))
  stem=mesh('branched_shrub_stem',stemverts,stemfaces,leaf_dark);untextured_uv(stem)
 for j in range(55):
  root,end=stems[j%len(stems)];phase=rng.uniform(.2,.96);base=root.lerp(end,phase);a=j*2.399963+i
  length=rng.uniform(.075,.18);blade=rng.uniform(.012,.029);tip=base+Vector((math.cos(a)*length,math.sin(a)*length,length*.43));lateral=Vector((-math.sin(a),math.cos(a),0))*blade;middle=base.lerp(tip,.50)+Vector((0,0,.018));start=len(vs)
  vs.extend([base,middle-lateral,tip,middle+lateral,middle+Vector((0,0,.008))]);fs.extend([(start,start+1,start+4),(start+1,start+2,start+4),(start+2,start+3,start+4),(start+3,start,start+4)])
 o=mesh('many_cupped_shrub_leaves',vs,fs,leaf_light if i%3==0 else leaf);untextured_uv(o)
 for j in range(7):
  a=j*1.3+i;tip=Vector((x+math.cos(a)*.18,y+math.sin(a)*.18,z+height*1.35));base=Vector((x,y,z));mid=base.lerp(tip,.65)+Vector((0,0,.07));lateral=Vector((-.011*math.sin(a),.011*math.cos(a),0))
  o=mesh('curved_dry_grass',[base-lateral,mid-lateral,tip,mid+lateral,base+lateral],[(0,1,2,3,4)],leaf_light);untextured_uv(o)
for i in range(5):
 p=Vector((1.2+i*.30,-7.0,.34));cyl('foreground_drain_pipe',p+Vector((0,0,.14)),p+Vector((0,.72,.14)),.14,steel,24)
cube('lime_contractor_container',(9.0,-8,.6),(2.7,1.6,1.4),yellow,.045)
for i in range(13):cube('container_corrugation',(7.72+i*.20,-8.82,.6),(.07,.04,1.38),yellow,.008)

# Source camera composition is authored in spatial coordinates, not a photo layer.
# Transform the completed clock housing and lamps together; rebuild grounded feet.
for o in list(bpy.context.scene.objects):
 if o.name.startswith(('clock_blue_pipe_leg','clock_pipe_collar','pipe_grounded_foot','action_blue_leg','action_foot')):bpy.data.objects.remove(o,do_unlink=True)
 elif o.name.startswith(('curved_work_lamp_stalk','work_lamp_shade','work_lamp_lit_face')):parent(o,sign)
new_sign=source_point(.325,.225,4.8);sign_w,sign_h=source_size(new_sign,.335,.265)
sign.scale=(sign_w/6,1,sign_h/3.35);sign.location=new_sign
bpy.context.view_layer.update()
for local_x in [-2.0,1.65]:
 x=new_sign.x+local_x*sign.scale.x
 for dy in [-.3,.25]:
  y=new_sign.y+dy;top_z=new_sign.z-sign_h*.5+.13
  cyl('clock_grounded_pipe',(x,y,.25),(x,y,top_z),.25,blue,24)
  for z in [.31,.65,top_z-.10]:cyl('clock_grounded_collar',(x,y,z-.07),(x,y,z+.07),.34,blue,24)
  cube('clock_grounded_foot',(x,y,.23),(.92,.88,.42),blue,.045)
new_action=source_point(.538,.248,4.6);aw,ah=source_size(new_action,.109,.21)
action.scale=(aw/1.9,1,ah/2.84);action.location=new_action
for dx in [-.53,.53]:
 x=new_action.x+dx*action.scale.x
 cyl('again_grounded_pipe',(x,new_action.y,.25),(x,new_action.y,new_action.z-ah*.5+.10),.20,blue,24)
 cube('again_grounded_foot',(x,new_action.y,.23),(.70,.80,.42),concrete,.04)
new_roll=source_point(.695,.128,7.0);old_roll=Vector((1.9,4.2,5.45));roll.location=new_roll
# The winding axis is slightly oblique so its layered end is actually visible.
roll.rotation_euler.z=.28
for o in list(bpy.context.scene.objects):
 if o.name.startswith(('crane_','tower_')):o.location+=Vector((1.7,2.3,0))
 elif o.name.startswith(('roll_lift_harness','feed_branch_grounded_pier')) or o.name in ['connected_feed_ribbon','roll_approach_supported_branch']:bpy.data.objects.remove(o,do_unlink=True)
bpy.context.view_layer.update()
# Start at the same material-bearing outer seam as the spiral; sweep directly into
# the continuous main slab instead of leaving an unrelated vertical blue flap.
outer=roll.matrix_world @ (spiral[-1]-old_roll)
join=road_points[13*20]
feedpoints=catmull([outer,outer+Vector((-.02,-.45,-.47)),join+Vector((-.50,-.46,.14)),join],20)
feed_normals=[]
for i,p in enumerate(feedpoints):
 tangent=feedpoints[min(len(feedpoints)-1,i+1)]-feedpoints[max(0,i-1)]
 n=Vector((tangent.y,-tangent.x,0))
 if n.length<.01:n=Vector((1,0,0))
 feed_normals.append(n.normalized())
feed=road_ribbon('connected_feed_ribbon',feedpoints,feed_normals,lambda i:.87,.09,blue)
bpy.context.view_layer.objects.active=feed
for modifier in list(feed.modifiers):bpy.ops.object.modifier_apply(modifier=modifier.name)
feed.shape_key_add(name='Basis');longer=feed.shape_key_add(name='Finite_connected_feed')
phases=[]
for v in longer.data:
 nearest=min(range(len(feedpoints)),key=lambda j:(v.co-feedpoints[j]).length_squared);phase=nearest/(len(feedpoints)-1);phases.append(phase)
 v.co.y-=math.sin(math.pi*phase)*.32;v.co.z-=math.sin(math.pi*phase)*.16
seam=feed.shape_key_add(name='Coil_turn_seam')
local_outer=spiral[-1]-old_roll
from mathutils import Quaternion
turned=roll.matrix_world@(Quaternion(Vector((1,0,0)),-.68)@local_outer)
seam_delta=turned-outer
for i,v in enumerate(seam.data):v.co+=seam_delta*max(0,1-phases[i]*4)

# White lane paint belongs to the fed tongue and exposes its real curvature.
for i in range(8,len(feedpoints)-3,7):
 a=feedpoints[i]+Vector((0,-.014,.015));b=feedpoints[i+2]+Vector((0,-.014,.015));d=b-a
 marking=cyl('roll_feed_lane',(a.x,a.y,a.z),(b.x,b.y,b.z),.023,white,8)
for p in [feedpoints[-15],feedpoints[-4]]:quarry('feed_branch_grounded_pier',(p.x,p.y,.08),(.56,.54,p.z-.19),810+int(p.y))
# A real lifting yoke joins the axle, hook and authored sloped jib.
boom_x=new_roll.x;boom_y=7.64;boom_z=8.02+(boom_x-2.29)/7.01*1.28
hook=Vector((boom_x,boom_y,boom_z-.20));yoke=new_roll+Vector((0,0,.96))
for dx in [-.82,.82]:
 axle=roll.matrix_world @ Vector((dx,0,0));path_curve('roll_lift_harness',[axle,yoke,hook],.019,steel,True)
cyl('crane_lifting_hook',hook,hook+Vector((0,0,.20)),.038,dark,14)
# Layers have true distinct rims and an open core, not a flat capped cylinder.
for radius in [.28,.37,.46,.51]:
 for side in [-1,1]:
  pts=[roll.matrix_world@Vector((side*.887,math.sin(a)*radius,math.cos(a)*radius)) for a in [j*math.tau/72 for j in range(73)]]
  path_curve('winding_exposed_edge',pts,.016,white)
title.location=source_point(.13,.518,.26);title.scale=(1.50,1.50,1.50)


bpy.context.view_layer.update()
work_lamp_points=[o.matrix_world.translation+Vector((0,0,-.05)) for o in sorted(sign.children,key=lambda o:o.matrix_world.translation.x) if o.name.startswith('work_lamp_lit_face')]
print('ROADWORKS_STAGE complete source assembly',flush=True)
# Batch only immutable scenery by material. Named semantic and moving nodes remain.
bpy.ops.object.select_all(action='DESELECT')
static={}
for o in list(bpy.context.scene.objects):
 if o.type=='MESH' and not o.get('keep'):
  # Apply real bevel/profile geometry before joining so small props retain forms.
  bpy.context.view_layer.objects.active=o
  for modifier in list(o.modifiers):
   try:bpy.ops.object.modifier_apply(modifier=modifier.name)
   except RuntimeError:pass
  static.setdefault(o.data.materials[0].name,[]).append(o)
for material,objects in static.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name='static_'+material

def area(name,loc,target,power,size,color):
 l=bpy.data.lights.new(name,'AREA');l.energy=power;l.size=size;l.color=color;o=bpy.data.objects.new(name,l);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('warm_afternoon',(-12,-6,16),(0,2,0),3800,5,(1,.64,.37));area('sky_fill',(8,-3,12),(0,1,1),750,12,(.48,.65,1))
sun_data=bpy.data.lights.new('source_afternoon_sun','SUN');sun_data.energy=2.9;sun_data.angle=.05;sun_data.color=(1,.71,.45)
sun=bpy.data.objects.new('source_afternoon_sun',sun_data);bpy.context.collection.objects.link(sun);sun.rotation_euler=Vector((1,.55,-1.3)).to_track_quat('-Z','Y').to_euler()
for point in work_lamp_points:
 l=bpy.data.lights.new('sign_work_pool','POINT');l.energy=24;l.color=(1,.71,.27);l.shadow_soft_size=.24;o=bpy.data.objects.new('sign_work_pool',l);bpy.context.collection.objects.link(o);o.location=point
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
try:
 p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='METAL';p.get_devices()
 for d in p.devices:d.use=d.type=='METAL'
 scene.cycles.device='GPU'
except Exception:pass
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.64,.76,.85,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.35
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.25
scene.render.resolution_x=1487;scene.render.resolution_y=1058;scene.render.resolution_percentage=100
bpy.ops.object.camera_add(location=CAMERA);camera=bpy.context.object;camera.name='opening_camera';target=TARGET;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=LENS;camera.data.clip_end=180;scene.camera=camera
camera.data.name='opening_camera'
for o in scene.objects:
 if o.type=='MESH' and not o.data.shape_keys:
  bpy.context.view_layer.objects.active=o
  for modifier in list(o.modifiers):
   try:bpy.ops.object.modifier_apply(modifier=modifier.name)
   except RuntimeError:pass
  tri=o.modifiers.new('Export_normals_tangents','TRIANGULATE');tri.keep_custom_normals=True
  bpy.ops.object.modifier_apply(modifier=tri.name)

# Reduce only secondary surfaces; preserve all semantic faces and moving forms.
import importlib.util
lod_spec=importlib.util.spec_from_file_location('road_surface_lod',ROOT/'authoring'/'optimize_scene.py')
lod_module=importlib.util.module_from_spec(lod_spec);lod_spec.loader.exec_module(lod_module)
lod_module.optimize_scene(scene)

# Bake only fixed mechanical casting contact; the moving cap is excluded.
# This records actual cassette/rim cavities rather than painting fake light.
ao_records=[]
for casting_name in ['clock_cast_housing','again_cast_pillar']:
 casting=bpy.data.objects[casting_name]
 casting.data.materials[0]=casting.data.materials[0].copy();casting.data.materials[0].name=casting_name+'_weathered_concrete'
 material=casting.data.materials[0];nodes=material.node_tree.nodes
 ao=bpy.data.images.new(casting_name+'_contact_ao',width=512,height=512,alpha=False);ao.colorspace_settings.name='Non-Color'
 image_node=nodes.new('ShaderNodeTexImage');image_node.image=ao;nodes.active=image_node
 bpy.ops.object.select_all(action='DESELECT');casting.select_set(True);bpy.context.view_layer.objects.active=casting
 scene.cycles.samples=16;scene.render.bake.margin=6
 # Temporarily hide the moving button from baking so its pressure contact stays
 # owned by the browser shadow, rather than frozen in the rest-state texture.
 cap_objects=[o for o in cap.children if o.type=='MESH']
 for o in cap_objects:o.hide_render=True
 bpy.ops.object.bake(type='AO')
 for o in cap_objects:o.hide_render=False
 ao.filepath_raw=str(ROOT/'materials'/f'{casting_name}_contact_ao.png');ao.file_format='PNG';ao.save()
 output_group=bpy.data.node_groups.get('glTF Material Output')
 if output_group is None:
  output_group=bpy.data.node_groups.new('glTF Material Output','ShaderNodeTree');output_group.interface.new_socket(name='Occlusion',in_out='INPUT',socket_type='NodeSocketFloat');output_group.nodes.new('NodeGroupInput');output_group.nodes.new('NodeGroupOutput')
 settings=nodes.new('ShaderNodeGroup');settings.node_tree=output_group;material.node_tree.links.new(image_node.outputs['Color'],settings.inputs['Occlusion'])
 ao_records.append({'node':casting_name,'map':f'materials/{casting_name}_contact_ao.png','method':'Cycles AO, actual fixed casting/cassette contact; moving cap excluded','size':[512,512]})
scene.cycles.samples=32
for im in bpy.data.images:
 if im.filepath:im.pack()
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'authoring'/'scene.blend'),compress=True)
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
 if o.type in ['MESH','EMPTY','CAMERA']:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'scene.glb'),export_format='GLB',use_selection=True,export_apply=False,export_morph=True,export_texcoords=True,export_normals=True,export_tangents=True,export_cameras=True,export_materials='EXPORT',export_extras=True)
pack_spec=importlib.util.spec_from_file_location('road_attribute_pack',ROOT/'authoring'/'pack_attributes.py')
pack_module=importlib.util.module_from_spec(pack_spec);pack_spec.loader.exec_module(pack_module);pack_module.pack(ROOT/'scene.glb')
manifest={'concept':'tomorrows-roadworks','tool':bpy.app.version_string,'bundle':'scene.glb','status':'Authored scene; independent original/browser/mobile acceptance pending','axes':'Blender(x,y,z)→glTF(x,z,-y)','clock':clock,'heading':'clock_heading','action':'again_ink','tally':'press_tally','roll':'road_roll_pivot','lip':'roll_lift_lip','crown':'underside_crown_ink','feed':'connected_feed_ribbon','feedMorphs':['Finite_connected_feed','Coil_turn_seam'],'truck':'ceremony_truck','road':'continuous_supported_blue_detour','stations':[{'show':s[0],'number':i+1,'marker':'station_number_'+s[0]} for i,s in enumerate(stations)],'archives':records,'destinations':extras,'camera':{'node':'opening_camera','positionGLTF':[camera.location.x,camera.location.z,-camera.location.y],'targetGLTF':[target.x,target.z,-target.y],'fov':math.degrees(2*math.atan(36/(2*camera.data.lens)/(1487/1058))),'lens':camera.data.lens},'routeGLTF':[[p.x,p.z,-p.y] for p in road_points[::20]],'workLampPositionsGLTF':[[p.x,p.z,-p.y] for p in work_lamp_points],'ambientOcclusion':ao_records,'source':'Project-authored volumetric geometry/maps; original artwork measurement only. No photographic foreground.'}
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
if '--proofs' in sys.argv:
 scene.render.filepath=str(ROOT/'proofs'/'opening-authored.png');bpy.ops.render.render(write_still=True)
 clay=mat('inspection_clay',(.37,.37,.34),.7);scene.view_layers[0].material_override=clay;scene.render.resolution_percentage=55;scene.cycles.samples=14
 scene.render.filepath=str(ROOT/'proofs'/'clay-opening.png');bpy.ops.render.render(write_still=True)
 camera.location=(18,-16,15);camera.data.lens=40;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(ROOT/'proofs'/'clay-three-quarter.png');bpy.ops.render.render(write_still=True)
 print('ROADWORKS_EXPORTED',ROOT/'scene.glb')
