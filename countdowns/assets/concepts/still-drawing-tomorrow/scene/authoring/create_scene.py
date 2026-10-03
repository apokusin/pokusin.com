"""Animation desk assets. Blender 4.5.14 LTS; no rendered text or archive images."""
import bpy,math,random,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
for folder in ['materials','inspection']: (ROOT/folder).mkdir(exist_ok=True)
random.seed(6248)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color,rough=.7,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;return m
def bitmap(name,size,fn,data=False):
 im=bpy.data.images.new(name,width=size,height=size,alpha=False)
 if data: im.colorspace_settings.name='Non-Color'
 px=[]
 for y in range(size):
  for x in range(size):px.extend((*fn(x,y),1))
 im.pixels.foreach_set(px);im.filepath_raw=str(ROOT/'materials'/(name+'.png'));im.file_format='PNG';im.save();im.pack();return im
def texture(m,image,socket):
 n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=image
 m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs[socket])
fibers=[random.uniform(-1,1) for _ in range(1024)]
stock=bitmap('paper-fibers',1024,lambda x,y:(lambda q:(q,q*.991,q*.956))(.84+random.random()*.016+fibers[y]*.004))
roughmap=bitmap('paper-roughness',512,lambda x,y:(lambda q:(q,q,q))(.77+random.random()*.16),True)
paper=mat('cotton_stock',(.9,.87,.80),.85);texture(paper,stock,'Base Color');texture(paper,roughmap,'Roughness')
acetate=mat('worn_clear_acetate',(.91,.9,.84),.22);p=acetate.node_tree.nodes.get('Principled BSDF');p.inputs['Alpha'].default_value=.16;p.inputs['Coat Weight'].default_value=.18;acetate.surface_render_method='DITHERED'
rubber=mat('rubbed_red_rubber',(.35,.055,.036),.96)
rubber_cream=mat('dirty_ivory_rubber',(.47,.44,.38),.96)
cream=mat('wrinkled_eraser_sleeve',(.76,.75,.69),.92);texture(cream,stock,'Base Color');texture(cream,roughmap,'Roughness')
# Irregular graphite contact and tiny rubber pores belong to the actual props.
def contact_grain(x,y):
 return .5+.20*math.sin(x*.073+y*.021)+.16*math.cos(y*.11-x*.035)+.10*math.sin(x*1.7+y*.83)
rubber_wear=bitmap('rubber-contact-wear',512,lambda x,y:(lambda q:(q,q,q))(.90-.20*max(0,contact_grain(x,y))-.13*(abs(x-255)/255)**7))
sleeve_wear=bitmap('graphite-sleeve-contact',512,lambda x,y:(lambda q:(q,q*.983,q*.946))(.86-.08*max(0,contact_grain(x,y))-.11*(abs(y-255)/255)**9-.075*math.exp(-((x-64)/30)**2)))
rubber_normal=bitmap('rubber-pore-normal',512,lambda x,y:(.5+.028*math.sin(x*2.4+y*.81),.5+.027*math.cos(y*2.8-x*.55),.998),True)
for material in [rubber,rubber_cream]:
 texture(material,rubber_wear,'Base Color')
 n=material.node_tree.nodes.new('ShaderNodeTexImage');n.image=rubber_normal
 bump=material.node_tree.nodes.new('ShaderNodeNormalMap');bump.inputs['Strength'].default_value=.48
 material.node_tree.links.new(n.outputs['Color'],bump.inputs['Color']);material.node_tree.links.new(bump.outputs['Normal'],material.node_tree.nodes.get('Principled BSDF').inputs['Normal'])
cream.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(1,1,1,1)
for link in list(cream.node_tree.links):
 if link.to_socket==cream.node_tree.nodes.get('Principled BSDF').inputs['Base Color']:cream.node_tree.links.remove(link)
texture(cream,sleeve_wear,'Base Color')
wood=mat('warm_pencil_wood',(.48,.28,.10),.82);red=mat('scratched_pencil_paint',(.57,.08,.045),.51);black=mat('graphite',(.018,.016,.013),.88);blue=mat('blue_registration',(.055,.16,.50),.62)
ceramic=mat('worn_ivory_ceramic',(.72,.67,.57),.24);coffee=mat('dark_coffee',(.021,.011,.006),.14)
def mesh(name,verts,faces,material,uvs=None):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);ob.data.materials.append(material)
 if uvs:
  layer=me.uv_layers.new(name='UVMap')
  for poly in me.polygons:
   for li in poly.loop_indices:layer.data[li].uv=uvs[me.loops[li].vertex_index]
 for p in me.polygons:p.use_smooth=True
 return ob
def group(name,pos=(0,0,0),angle=0):
 ob=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(ob);ob.location=pos;ob.rotation_euler.z=angle;return ob
def child(ob,parent):ob.parent=parent;return ob
def box(name,pos,dim,material,bevel=.05):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos);ob=bpy.context.object;ob.name=name;ob.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);ob.data.materials.append(material)
 if bevel:
  mod=ob.modifiers.new('worn rounded edges','BEVEL');mod.width=bevel;mod.segments=4;mod=ob.modifiers.new('weighted corner normals','WEIGHTED_NORMAL')
 return ob
def sphere(name,pos,scale,material):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=pos);ob=bpy.context.object;ob.name=name;ob.scale=scale;ob.data.materials.append(material)
 for p in ob.data.polygons:p.use_smooth=True
 return ob
def sheet(name,w,h,material,curl=.0,z=.0,region=None):
 nx,ny=48,36;verts=[];uv=[]
 for j in range(ny+1):
  v=j/ny
  for i in range(nx+1):
   u=i/nx
   sx=(u-.5)*w;sy=(v-.5)*h
   if region:
    fw,fh,cx,cy=region;sx+=cx;sy+=cy;gu=sx/fw+.5;gv=sy/fh+.5
   else:gu=u;gv=v
   # A broad developable rolled corner: the stock bends with every ink vertex.
   fw,fh=(region[0],region[1]) if region else (w,h)
   n=sx if material==acetate else (sx-sy)/math.sqrt(2);crease=fw*.20 if material==acetate else (fw+fh)*.19
   d=max(0,n-crease) if curl else 0;radius=.86/max(.01,curl);theta=d/radius
   delta=radius*math.sin(theta)-d
   # Offset every printed/film layer along the bent stock normal. A vertical
   # offset cuts through the stock once its rolled corner turns past upright.
   x=sx+delta-z*math.sin(theta) if material==acetate else sx+delta/math.sqrt(2)-z*math.sin(theta)/math.sqrt(2)
   y=sy if material==acetate else sy-delta/math.sqrt(2)+z*math.sin(theta)/math.sqrt(2)
   zz=z*math.cos(theta)+radius*(1-math.cos(theta))+.002*math.sin(gu*12+gv*5)
   verts.append((x,y,zz));uv.append((u,v))
 faces=[]
 for j in range(ny):
  for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
 ob=mesh(name,verts,faces,material,uv)
 return ob
records=[('got','s4'),('got','s3-redesign'),('got','s3-classic'),('dexter','s8-final'),('dexter','s7-finale'),('sherlock','final'),('sherlock','alpha'),('archer','s5-final'),('breaking-bad','final'),('breaking-bad','desert-parallax'),('house-of-cards','s2'),('severance','s2'),('severance','tracker')]
layouts={'got':(-.7,3.25,.25,5.1,3.2,.075),'dexter':(-4.3,2.45,.23,3.5,2.65,.19),'severance':(3.65,2.72,.52,5.0,3.35,-.16),'sherlock':(4.0,2.6,.10,4.0,2.9,-.12),'archer':(4.15,2.3,.12,4.6,3.1,-.10),'breaking-bad':(4.1,2.15,.15,4.55,3.0,-.06),'house-of-cards':(4.05,2.20,.20,4.55,3.0,-.045)}
manifest={'tool':'Blender 4.5.14 LTS','coordinates':'X right Y up Z toward camera; export_yup=False','camera':{'position':[0,-1.4,23],'target':[0,.1,0],'height':10.6},'groups':[],'archives':[],'required':['scene.glb','materials/paper-fibers.png','materials/paper-roughness.png','artwork/graphite-digits.png','artwork/runner-cycle-spaced.png']}
for gi,(show,layout) in enumerate(layouts.items()):
 x,y,z,w,h,angle=layout;root=group('folio_'+show,(x,y,z),angle);manifest['groups'].append({'show':show,'pivot':root.name,'center':[x,y,z],'width':w,'height':h})
 entries=[r for r in records if r[0]==show]
 for vi,(_,slug) in enumerate(entries):
  cel=group('cel_'+show+'_'+slug,(vi*.08,-vi*.09,-vi*.048));child(cel,root)
  backing=sheet('stock_'+show+'_'+slug,w,h,paper,curl=0,z=-.01);child(backing,cel)
  # Genuine underside plus edge separation, never a detached corner triangle.
  sol=backing.modifiers.new('physical stock edge','SOLIDIFY');sol.thickness=.012
  bpy.context.view_layer.objects.active=backing;bpy.ops.object.modifier_apply(modifier=sol.name)
  film=sheet('acetate_'+show+'_'+slug,w,h,acetate,curl=1.15,z=.013);child(film,cel)
  image=sheet('screen_'+show+'_'+slug,w*.9,h*.72,paper,curl=0,z=.028,region=(w,h,0,-.04))
  child(image,cel)
  caption=sheet('caption_'+show+'_'+slug,w*.9,.25,paper,z=.025);caption.location=(0,h*.41,.0);child(caption,cel)
  manifest['archives'].append({'show':show,'slug':slug,'screen':image.name,'caption':caption.name,'cel':cel.name,'width':w,'height':h,'version':vi})
  for px in [-w*.43,0,w*.43]:
   # Punched registration holes cut cleanly through actual stock.
   bpy.ops.mesh.primitive_cylinder_add(vertices=20,radius=.055,depth=.4,location=(px,h*.445,0));cutter=bpy.context.object;child(cutter,cel)
   bpy.context.view_layer.update();mod=backing.modifiers.new('punched peg hole','BOOLEAN');mod.object=cutter
   bpy.context.view_layer.objects.active=backing;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
  pin=sphere('blue_peg_'+show+'_'+slug,(-w*.455,h*.415,.025),(.042,.042,.012),blue);child(pin,cel)
 # Staggered exposed paper index tabs; readable names are dynamic browser ink.
 tab=sheet('tab_'+show,1.38,.34,paper,z=.02);tab.location=(w/2+.15,-h/2+.3+gi*.11,0);child(tab,root)
clockroot=group('clock_cel',(-1.25,-.35,.19),-.018)
back=sheet('clock_stock',9.45,3.25,paper,curl=.22,z=-.01);child(back,clockroot);back.modifiers.new('clock stock edge','SOLIDIFY').thickness=.013
film=sheet('clock_acetate',9.45,3.25,acetate,curl=.22,z=.018);child(film,clockroot)
manifest['clock']=[]
for i,unit in enumerate('dhms'):
 face=sheet('clock_'+unit,2.18,2.35,paper,curl=.22,z=.024,region=(9.45,3.25,-3.48+i*2.32,.1));child(face,clockroot);manifest['clock'].append(face.name)
 label=sheet('unit_'+unit,1.5,.23,paper,curl=.22,z=.032,region=(9.45,3.25,-3.48+i*2.32,-1.26));child(label,clockroot)
# Worn eraser: imperfect rubber volume, chipped corners and a fibrous printed sleeve.
eraser=group('eraser_pivot',(-4.2,-3.25,.28),-.22)
rb=child(box('rubber_core',(.45,0,.16),(2.15,1.12,.45),rubber_cream,.18),eraser)
cap=child(box('red_rubber_cap',(-1.10,0,.16),(.87,1.13,.45),rubber,.17),eraser)
for ob in [rb,cap]:
 bpy.context.view_layer.objects.active=ob
 for mod in list(ob.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
for i in range(12):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=(-1.10+random.uniform(-.36,.34),random.choice([-.56,.56]),.25+random.uniform(-.08,.12)))
 cut=bpy.context.object;cut.scale=(random.uniform(.025,.06),.035,.022);child(cut,eraser)
 bpy.context.view_layer.update();mod=cap.modifiers.new('compressed worn rubber edge','BOOLEAN');mod.object=cut;bpy.context.view_layer.objects.active=cap;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cut,do_unlink=True)
sleeve=child(box('eraser_sleeve',(.09,0,.195),(1.89,1.14,.43),cream,.048),eraser)
face=sheet('again_ink',1.84,.9,cream,z=.42);face.location.x=.09;child(face,eraser)
tally=sheet('tally_ink',1.4,.40,paper,z=.018);tally.location=(-2.35,-2.65,.04)
# Actual pencil wood, hexagonal lacquer and graphite tip; no generic icon.
for pi,(x,y,angle) in enumerate([(6.4,-2.6,.50),(6.1,-3.7,.63)]):
 pencil=group('pencil_'+str(pi),(x,y,.16),angle)
 bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=.073,depth=3.5,location=(0,0,0));body=bpy.context.object;body.name='hex_lacquer_'+str(pi);body.rotation_euler.x=math.pi/2;body.data.materials.append(red if pi else black);child(body,pencil)
 bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=.072,radius2=0,depth=.55,location=(0,1.99,0));tip=bpy.context.object;tip.name='exposed_wood_'+str(pi);tip.rotation_euler.x=-math.pi/2;tip.data.materials.append(wood);child(tip,pencil)
 bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=.027,radius2=0,depth=.19,location=(0,2.21,0));lead=bpy.context.object;lead.name='graphite_tip_'+str(pi);lead.rotation_euler.x=-math.pi/2;lead.data.materials.append(black);child(lead,pencil)
for i in range(9):
 x=random.uniform(5,6.4);y=random.uniform(-1.8,-.6);r=random.uniform(.065,.23);length=random.uniform(2.2,4.5);tilt=random.uniform(-.5,.5);verts=[]
 for j in range(21):
  t=j/20;a=t*length;edge=.015+.045*math.sin(t*math.pi);zz=.023+math.sin(a*.65)*random.uniform(.07,.095)
  verts.extend([(x+math.cos(a)*r,y+math.sin(a)*r,zz),(x+math.cos(a)*(r+edge),y+math.sin(a)*(r+edge),zz+edge*tilt)])
 ob=mesh('curled_shaving_'+str(i),verts,[(j*2,j*2+1,j*2+3,j*2+2) for j in range(20)],wood);ob.modifiers.new('thin wooden edge','SOLIDIFY').thickness=.003
for i in range(35):
 sphere('eraser_crumb_'+str(i),(-3.2+random.uniform(-1.2,1.7),-3.1+random.uniform(-.65,.4),-.035),(random.uniform(.015,.035),random.uniform(.008,.018),random.uniform(.006,.016)),rubber if i%3==0 else rubber_cream)
# Cropped ceramic mug and believable dark liquid meniscus.
mug=group('coffee_mug',(6.2,5.35,.15))
profile=[(.0,.0),(.49,.0),(.62,.13),(.65,.63),(.67,.69),(.61,.71),(.57,.64),(.55,.12),(.0,.12)]
verts=[];faces=[];N=64
for r,z in profile:
 for j in range(N):a=j/N*math.tau;verts.append((r*math.cos(a),r*math.sin(a),z))
for k in range(len(profile)-1):
 for j in range(N):a=k*N+j;b=k*N+(j+1)%N;faces.append((a,b,b+N,a+N))
child(mesh('ceramic_cup',verts,faces,ceramic),mug)
bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=.559,depth=.01,location=(0,0,.53));liquid=bpy.context.object;liquid.name='coffee_surface';liquid.data.materials.append(coffee);child(liquid,mug)
# Desk stock is a receiving volume; its broad fibre grain belongs to paper.
box('warm_drawing_table',(0,0,-.24),(30,22,.36),paper,.10)
# Authoring inspection light. Runtime mirrors the same daylight hierarchy.
bpy.ops.object.light_add(type='AREA',location=(-7,8,13));light=bpy.context.object;light.data.energy=1700;light.data.shape='RECTANGLE';light.data.size=7;light.data.size_y=10;light.rotation_euler=(Vector((0,0,0))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(0,-1.4,23));cam=bpy.context.object;cam.rotation_euler=(Vector((0,.1,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=14.9;bpy.context.scene.camera=cam
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=20;scene.render.resolution_x=1487;scene.render.resolution_y=1058;scene.render.resolution_percentage=100;scene.world.color=(.38,.36,.31)
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG'
for ob in list(bpy.context.scene.objects):
 if ob.type=='MESH':
  mod=ob.modifiers.new('Explicit_export_triangles','TRIANGULATE')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'authoring'/'still-drawing-tomorrow.blend'))
bpy.ops.export_scene.gltf(filepath=str(ROOT/'scene.glb'),export_format='GLB',export_yup=False,export_apply=True,export_cameras=False,export_lights=False,export_tangents=True)
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
if '--render-proof' in __import__('sys').argv:
 scene.render.filepath=str(ROOT/'inspection'/'authored-light.png');bpy.ops.render.render(write_still=True)
