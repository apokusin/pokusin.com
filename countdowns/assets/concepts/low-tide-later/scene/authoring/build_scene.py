"""Low Tide, Later: authored Y-up coastal installation. Blender 4.5.14 LTS.
Run from repository: Blender --background --python this_file.py -- [--proofs]
Live ink/photographs are blank named surfaces; no baked UI or photographic scenery.
"""
import bpy, bmesh, math, os, sys, json, random
import numpy as np
from mathutils import Vector, Matrix
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROOFS='--proofs' in sys.argv
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
asset=bpy.data.collections.new('LowTideInstallation');bpy.context.scene.collection.children.link(asset)
def own(o):
    for c in list(o.users_collection):c.objects.unlink(o)
    asset.objects.link(o);return o
def mesh(name,verts,faces,mat=None,uv=None,smooth=True):
    data=bpy.data.meshes.new(name+'Geometry');data.from_pydata(verts,[],faces);data.update()
    ob=bpy.data.objects.new(name,data);asset.objects.link(ob)
    if mat:data.materials.append(mat)
    if uv:
        layer=data.uv_layers.new(name='SurfaceUV')
        for p in data.polygons:
            for li in p.loop_indices:layer.data[li].uv=uv[data.loops[li].vertex_index]
    for p in data.polygons:p.use_smooth=smooth
    return ob
def mat(name,color,rough=.8,metal=0,transmission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    p.inputs['Transmission Weight'].default_value=transmission;p.inputs['IOR'].default_value=1.333 if transmission else 1.47
    return m
chalk=mat('ErodedSaltChalk',(.84,.85,.80),.92)
sand=mat('SaltSandBed',(.83,.82,.76),.94)
paper=mat('SaltPaper',(.93,.92,.86),.88)
shellmat=mat('OxidizedScallop',(.64,.25,.13),.56)
weedmat=mat('DriedBrownWeed',(.25,.14,.05),.88)
threadmat=mat('IndigoShoreThread',(.035,.11,.22),.88)
saltmat=mat('SaltMineral',(.88,.91,.89),.68,transmission=.08)
photo=mat('RuntimePhotoSurface',(.20,.27,.30),.8)
ink=mat('RuntimeInkSurface',(.83,.86,.82),.8)
watermat=mat('RuntimeWaterSurface',(.015,.065,.20),.12,transmission=.55)

def image(name,rgb,data=False):
    if rgb.ndim==2:rgb=np.stack([rgb,rgb,rgb],axis=-1)
    h,w=rgb.shape[:2];rgba=np.concatenate([rgb,np.ones((h,w,1))],axis=-1)
    im=bpy.data.images.new(name,w,h,alpha=True)
    if data:im.colorspace_settings.name='Non-Color'
    im.pixels.foreach_set(np.asarray(rgba,dtype=np.float32).ravel());im.filepath_raw=os.path.join(ROOT,'materials',name+'.png');im.file_format='PNG'
    im.save();return im
def maps(material,color,normal=None,rough=None,normal_strength=.3):
    nodes=material.node_tree.nodes;links=material.node_tree.links;p=nodes.get('Principled BSDF')
    for name,img in [('Base Color',color),('Roughness',rough)]:
        if img:tex=nodes.new('ShaderNodeTexImage');tex.image=img;links.new(tex.outputs['Color'],p.inputs[name])
    if normal:
        tex=nodes.new('ShaderNodeTexImage');tex.image=normal;nm=nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=normal_strength;links.new(tex.outputs['Color'],nm.inputs['Color']);links.new(nm.outputs['Normal'],p.inputs['Normal'])
def normal_image(name,height,strength):
    dy,dx=np.gradient(height);n=np.stack([-dx*strength,-dy*strength,np.ones_like(height)],axis=-1);n/=np.linalg.norm(n,axis=-1)[...,None];return image(name,n*.5+.5,True)
rng=np.random.default_rng(5704);N=512
u,v=np.meshgrid(np.linspace(0,1,N),np.linspace(0,1,N));grain=rng.normal(0,.023,(N,N))
# Fine mineral relief and larger shallow pores are separate from authored rim erosion.
porous=rng.normal(0,.015,(N,N))
for i in range(520):
    cx,cy=rng.uniform(0,1,2);r=rng.uniform(.0018,.010)
    porous-=rng.uniform(.04,.12)*np.exp(-((u-cx)**2+(v-cy)**2)/(r*r))
chalk_color=image('chalk-albedo',np.stack([.81+grain*1.5,.805+grain*1.4,.765+grain*1.2],axis=-1));chalk_normal=normal_image('chalk-porous-normal',porous,9)
chalk_rough=image('chalk-roughness',np.clip(.88+porous*.4+grain*.8,.7,.99),True);maps(chalk,chalk_color,chalk_normal,chalk_rough,.95)
sandheight=grain*.8+rng.normal(0,.032,(N,N));mineral=rng.random((N,N));sandgrain=grain*1.8-.065*(mineral>.967)+.055*(mineral<.048);sandcolor=image('salt-sand-albedo',np.stack([.795+sandgrain,.765+sandgrain*.91,.704+sandgrain*.82],axis=-1));sandnormal=normal_image('salt-sand-normal',sandheight,21)
sandrough=image('salt-sand-roughness',np.clip(.90+grain*2,.72,1),True);maps(sand,sandcolor,sandnormal,sandrough,1.25)
fibre=rng.normal(0,.018,(N,N))+.005*np.sin(u*740);papercolor=image('salt-paper-albedo',np.stack([.91+fibre*.7,.905+fibre*.6,.87+fibre*.55],axis=-1));papernormal=normal_image('salt-paper-normal',fibre,8);maps(paper,papercolor,papernormal,None,.17)
angle=(u-.5)*2.70;radius=v
rib=np.cos(angle*20+np.sin(angle*3)*.16)
calcium=np.maximum(0,np.sin(u*91+v*84)*np.sin(v*73-u*52)-.56)*.30
shellcolor=image('shell-rust-albedo',np.stack([.61+.055*rib+calcium,.24+.025*rib+calcium,.115+.015*rib+calcium],axis=-1));shellnormal=normal_image('shell-lamella-normal',.006*np.sin(v*260+np.sin(u*56)*.6)+grain*.24,18);shellrough=image('shell-rust-roughness',np.clip(.59-.06*radius+.08*calcium+grain,.43,.83),True);maps(shellmat,shellcolor,shellnormal,shellrough,.34)
waterheight=.025*np.sin(u*69+np.sin(v*49)*2)+.014*np.sin(u*145-v*91)+.007*np.sin(u*227+v*169);waternormal=normal_image('water-capillary-normal',waterheight,13)

# A shared world-space coastline. Runtime shading uses exactly this field.
def shore_x(z):return -.5+4.5*math.tanh((z+5)/3)-.15*min(max(z,0),18)+.35*math.sin(z*.60)+.55*math.sin(max(z-18,0)*.13)
def smooth(a,b,x):
    t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def bed_height(x,z):
    d=x-shore_x(z);macro=.028*math.sin(x*1.43+z*.55)+.018*math.sin(x*3.3-z*1.72)
    return -.30+.82*smooth(-1.6,2.0,d)+macro-.045*math.exp(-((d+.5)/.62)**2)*(1+.3*math.sin(z*3.4))
def rest_water(x,z):return .20+.021*math.sin(x*1.9+z*.78)+.011*math.sin(x*.76-z*1.48)+.12*math.exp(-((z-5.5-.32*math.sin(x*.62))/.62)**2)
# Actual shallow basins and dry terraces; seven mesh sections permit frustum culling.
patches=[(-14,-6),(-6,2),(2,10),(10,18),(18,26),(26,34),(34,42)]
for index,(z0,z1) in enumerate(patches):
    nx,nz=112,40;verts=[];faces=[];uv=[]
    for j in range(nz+1):
        z=z0+(z1-z0)*j/nz
        for i in range(nx+1):
            x=-18+36*i/nx;verts.append((x,bed_height(x,z),z));uv.append((x/3.6,z/3.6))
    for j in range(nz):
        for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+nx+1,a+nx+2,a+1))
    mesh('shore_bed_'+str(index).zfill(2),verts,faces,sand,uv)
    nx,nz=100,40;verts=[];faces=[];uv=[]
    for j in range(nz+1):
        z=z0+(z1-z0)*j/nz
        for i in range(nx+1):
            x=-18+36*i/nx;verts.append((x,rest_water(x,z),z));uv.append((x/2.5,z/2.5))
    for j in range(nz):
        for i in range(nx):
            a=j*(nx+1)+i;corners=[a,a+nx+1,a+nx+2,a+1]
            if min(bed_height(verts[k][0],verts[k][2]) for k in corners)<.46:faces.append(tuple(corners))
    ob=mesh('sea_surface_'+str(index).zfill(2),verts,faces,watermat,uv);ob['runtime_surface']='depth-aware physical water; not solid occluder'

# Four independent continuous profiles: crushed chalk/paper sleeves, never copy cylinders.
profiles=[
 {'unit':'days','center':[-6.10,-2.15],'radius':[1.22,.47],'height':5.05,'rim':[.04,.10,.02,-.03,.04,-.02,.06,.13,.03,-.07,-.02,.10,.04,-.04,.03,.02],'bulges':[1.02,.98,1.01,.96,.99]},
 {'unit':'hours','center':[-3.35,-1.08],'radius':[1.15,.44],'height':4.79,'rim':[-.03,.07,.13,.03,-.06,.04,.02,-.04,.08,.02,-.03,.11,.08,-.02,-.04,.04],'bulges':[1.04,1.01,.98,1.02,.95]},
 {'unit':'minutes','center':[-.70,.03],'radius':[1.12,.46],'height':4.56,'rim':[.10,.04,-.04,.01,.08,.04,-.03,.04,.10,.13,-.04,.04,.08,.00,-.02,.03],'bulges':[1.02,.97,1.04,.99,.96]},
 {'unit':'seconds','center':[1.82,.75],'radius':[1.11,.45],'height':4.38,'rim':[.01,-.03,.09,.13,.02,-.04,.02,.11,.06,-.04,.02,.08,.03,-.06,.02,.04],'bulges':[1.06,1.01,.98,.95,.99]}
]
def periodic(values,a):
    t=(a/(2*math.pi)%1)*len(values);i=int(t);f=t-i;f=f*f*(3-2*f);return values[i]*(1-f)+values[(i+1)%len(values)]*f
def post_point(profile,a,t,offset=0):
    index=['days','hours','minutes','seconds'].index(profile['unit']);rx,rz=profile['radius'];h=profile['height']
    k=min(3,int(t*4));f=t*4-k;bulge=profile['bulges'][k]*(1-f)+profile['bulges'][k+1]*f
    angular=1+.025*math.sin(a*3+index)+.018*math.sin(a*7-index*1.2)
    erosion=(1-t)**7*(.10+.06*math.sin(a*9+index)+.03*math.sin(a*17))
    grooves=.021*math.exp(-((math.sin(a*2+index*.45))/.13)**2)*smooth(.22,.65,t)
    front_guard=1-smooth(.85,1.32,abs(math.atan2(math.sin(a),math.cos(a))))
    grooves+=.018*math.sin(a*18+index)*smooth(.50,.85,t)*(1-front_guard*.84)
    radius=bulge*angular-erosion-grooves
    y=t*h+periodic(profile['rim'],a)*smooth(.86,1,t)+.025*math.sin(t*19+a*8)*(1-smooth(.15,.42,t))
    x=math.sin(a)*rx*radius;z=math.cos(a)*rz*radius
    return (x+math.sin(a)*offset,y,z+math.cos(a)*offset)
surfaces={}
for profile in profiles:
    unit=profile['unit'];nx,ny=100,48;verts=[];faces=[];uv=[]
    for j in range(ny+1):
        for i in range(nx+1):a=2*math.pi*i/nx;verts.append(post_point(profile,a,j/ny));uv.append((i/nx*2,j/ny*3))
    for j in range(ny):
        for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
    # Torn chalk has a shallow concavity, not a rolled sleeve or a deep cup.
    start=len(verts)
    for ring in range(3):
        for i in range(nx+1):
            a=2*math.pi*i/nx;p=post_point(profile,a,1);scale=[.97,.63,0][ring]
            verts.append((p[0]*scale,profile['height']-.09 if ring==2 else p[1]-[.010,.032,.09][ring],p[2]*scale));uv.append((i/nx,1-ring*.08))
    for i in range(nx):a=ny*(nx+1)+i;b=start+i;faces.append((a,a+1,b+1,b))
    for ring in range(2):
        for i in range(nx):a=start+ring*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
    bottom=len(verts);verts.append((0,0,0));uv.append((.5,.5))
    for i in range(nx):faces.append((bottom,i+1,i))
    body=mesh('post_'+unit,verts,faces,chalk,uv);x,z=profile['center'];body.location=(x,bed_height(x,z)+.015,z)
    profile['baseY']=body.location.y
    for side in range(2):
        # The clock patch shares the exact outer profile and has only a tiny ink offset.
        verts=[];faces=[];uv=[];cols,rows=56,40;a0=-.94+side*.94
        for j in range(rows+1):
            t=.34+.54*j/rows
            for i in range(cols+1):a=a0+.94*i/cols;verts.append(post_point(profile,a,t,.034));uv.append((i/cols,j/rows))
        for j in range(rows):
            for i in range(cols):a=j*(cols+1)+i;faces.append((a,a+1,a+cols+2,a+cols+1))
        name='screen_timer_'+unit+('_left' if side==0 else '_right');surface=mesh(name,verts,faces,ink,uv);surface.parent=body
        surfaces[name]={'kind':'digit','body':body.name,'column':side,'curved':True,'height':profile['height']*.54}
    verts=[];faces=[];uv=[]
    for j in range(13):
        for i in range(25):a=-.24+.48*i/24;t=.245+.095*j/12;verts.append(post_point(profile,a,t,.039));uv.append((i/24,j/12))
    for j in range(12):
        for i in range(24):a=j*25+i;faces.append((a,a+1,a+26,a+25))
    label=mesh('screen_unit_'+unit,verts,faces,ink,uv);label.parent=body;surfaces[label.name]={'kind':'unit','body':body.name}

# A continuous closed scallop: angular scalloping/radial ribs and transverse growth layers.
def shell_point(a,t,back=False):
    ribs=.060*(.35+.65*t**.60)*(math.cos(a*20+.16*math.sin(a*3))*.5+.5)
    length=1.76+.045*math.cos(a*20+.16*math.sin(a*3))+.025*math.sin(a*7)
    radius=t*length;x=math.sin(a)*radius;z=.74-math.cos(a)*radius
    y=.07+.27*math.sin(t*math.pi*.88)*math.cos(a*.43)+ribs+.004*math.sin(t*240+a*3)*t
    return (x,y-(.037+.045*(1-t)) if back else y,z)
cols,rows=100,42;verts=[];faces=[];uv=[];count=(cols+1)*(rows+1)
for back in range(2):
    for j in range(rows+1):
        for i in range(cols+1):a=-1.35+2.70*i/cols;t=.018+.982*j/rows;verts.append(shell_point(a,t,bool(back)));uv.append((i/cols,j/rows))
for side in range(2):
    for j in range(rows):
        for i in range(cols):a=side*count+j*(cols+1)+i;faces.append((a,a+1,a+cols+2,a+cols+1) if not side else (a,a+cols+1,a+cols+2,a+1))
perimeter=[*range(cols+1),*[(j+1)*(cols+1)+cols for j in range(rows)],*[rows*(cols+1)+cols-i-1 for i in range(cols)],*[(rows-j-1)*(cols+1) for j in range(rows-1)]]
for i,a in enumerate(perimeter):b=perimeter[(i+1)%len(perimeter)];faces.append((a,b,b+count,a+count))
scallop=mesh('again_scallop',verts,faces,shellmat,uv);scallop.location=(6.60,bed_height(6.60,-.72)+.017,-.72)
verts=[];faces=[];uv=[];nx,ny=64,28
for j in range(ny+1):
    t=.30+.42*j/ny
    for i in range(nx+1):a=-.92+1.84*i/nx;p=list(shell_point(a,t));p[1]+=.021;verts.append(p);uv.append((i/nx,1-j/ny))
for j in range(ny):
    for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
# Ink uses a single rectilinear world projection across the fan, not radial letter wedges.
xmin,xmax=min(p[0] for p in verts),max(p[0] for p in verts);zmin,zmax=min(p[2] for p in verts),max(p[2] for p in verts)
uv=[((p[0]-xmin)/(xmax-xmin),1-(p[2]-zmin)/(zmax-zmin)) for p in verts]
reset=mesh('screen_reset',verts,faces,ink,uv);reset.parent=scallop;surfaces[reset.name]={'kind':'action','body':scallop.name}
tally=mesh('screen_tally',[(-.50,0,-.17),(.50,0,-.17),(.50,0,.17),(-.50,0,.17)],[(0,3,2,1)],ink,[(0,1),(1,1),(1,0),(0,0)]);tally.location=(8.27,bed_height(8.27,-.35)+.035,-.35);surfaces[tally.name]={'kind':'tally','size':[1,.34]}

# Found salt-paper prints: nonuniform wear, real stock thickness and broad curled edges.
prints=[
 ('severance_s2',[5.50,-5.5],[5.35,3.85],.14,.40,'severance:s2'),
 ('game_of_thrones_s4',[-5.35,4.25],[7.20,4.90],-.21,.46,'got:s4'),
 ('dexter_s8_final',[6.25,4.15],[6.15,4.35],.17,.38,'dexter:s8-final'),
 ('severance_tracker',[5.1,-12.0],[4.55,3.35],-.10,.34,'severance:tracker'),
 ('game_of_thrones_s3_redesign',[-11.20,9.40],[5.30,3.95],.11,.32,'got:s3-redesign'),
 ('game_of_thrones_s3_classic',[-4.8,10.50],[4.45,3.30],-.13,.36,'got:s3-classic'),
 ('dexter_s7_finale',[8.3,10.20],[4.45,3.30],-.10,.38,'dexter:s7-finale'),
 ('sherlock_final',[shore_x(16.3)+2.3,16.3],[5.70,4.05],-.12,.43,'sherlock:final'),
 ('sherlock_alpha',[shore_x(16.3)-3.1,16.9],[3.90,3.25],.19,.31,'sherlock:alpha'),
 ('archer_s5_final',[shore_x(23.0)+1.6,23.0],[6.30,3.70],.09,.38,'archer:s5-final'),
 ('breaking_bad_final',[shore_x(30.1)-1.8,30.1],[5.50,4.15],-.16,.45,'breaking-bad:final'),
 ('breaking_bad_desert_parallax',[shore_x(30.1)+4.1,31.9],[4.45,3.70],.12,.38,'breaking-bad:desert-parallax'),
 ('house_of_cards_s2',[shore_x(39.0)+2.30,39.0],[4.80,4.40],-.07,.39,'house-of-cards:s2')
]
for index,(name,center,size,angle,curl,record) in enumerate(prints):
    x,z=center;w,h=size;nx,ny=48,40;verts=[];faces=[];uv=[]
    for j in range(ny+1):
        v=j/ny
        for i in range(nx+1):
            u=i/nx;xx=(u-.5)*w;zz=(v-.5)*h
            edge=max(0,(abs(u-.5)*2-.91)/.09)**2+max(0,(abs(v-.5)*2-.815)/.185)**2
            edgewear=.011*math.sin(u*97+index)+.008*math.sin(v*137+index*.7)
            xx+=edgewear*(abs(u-.5)*2)**10;zz+=edgewear*(abs(v-.5)*2)**10
            corner=max(0,(u-.865)/.135)*max(0,(v-.82)/.18)
            y=.020*edge+.009*math.sin(xx*7+zz*11+index)*edge+curl*corner*corner
            xx-=curl*.28*corner*corner;zz-=curl*.22*corner*corner
            verts.append((xx,y,zz));uv.append((u,v))
    for j in range(ny):
        for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+nx+1,a+nx+2,a+1))
    stock=mesh('paper_'+name,verts,faces,paper,uv);stock.location=(x,max(.265,bed_height(x,z)+.045),z);stock.rotation_euler[1]=angle
    solid=stock.modifiers.new('SaltPaperThickness','SOLIDIFY');solid.thickness=.029;solid.offset=-1
    sw,sh=w*.89,h*.80;screen=mesh('screen_'+name,[(-sw/2,.025,-sh/2),(sw/2,.025,-sh/2),(sw/2,.025,sh/2),(-sw/2,.025,sh/2)],[(0,3,2,1)],photo,[(0,1),(1,1),(1,0),(0,0)]);screen.parent=stock
    surfaces[screen.name]={'kind':'archive','record':record,'paper':stock.name,'size':[sw,sh],'openingVisible':index<3}

# Thin cyanotype route threads and articulated, flattened brown weed.
def tube(name,points,radii,material,sections=6):
    verts=[];faces=[];uv=[]
    for k,p in enumerate(points):
        tangent=Vector(points[min(k+1,len(points)-1)])-Vector(points[max(k-1,0)]);tangent.normalize();n=tangent.cross(Vector((0,1,0)))
        if n.length<.1:n=tangent.cross(Vector((1,0,0)))
        n.normalize();b=tangent.cross(n).normalized()
        for i in range(sections):a=i/sections*math.tau;verts.append(tuple(Vector(p)+(n*math.cos(a)+b*math.sin(a))*radii[k]));uv.append((i/sections,k/max(1,len(points)-1)))
    for k in range(len(points)-1):
        for i in range(sections):a=k*sections+i;c=k*sections+(i+1)%sections;faces.append((a,c,c+sections,a+sections))
    return mesh(name,verts,faces,material,uv)
points=[]
for k in range(300):z=-13+55*k/299;x=shore_x(z)+.90+.12*math.sin(z*1.43);points.append((x,bed_height(x,z)+.034,z))
tube('indigo_shore_thread',points,[.014]*len(points),threadmat,5)
random.seed(2411)
weedverts=[];weedfaces=[];weeduv=[]
for plant in range(42):
    z=random.uniform(-12,41);x=shore_x(z)+random.uniform(-1.0,1.55);base_y=bed_height(x,z)+.025
    for branch in range(random.randint(3,6)):
        angle=random.uniform(0,math.tau);length=random.uniform(.35,1.35);points=[]
        for k in range(13):
            t=k/12;px=x+math.cos(angle)*length*t+.10*math.sin(t*7+branch);pz=z+math.sin(angle)*length*t;py=bed_height(px,pz)+.021+.025*math.sin(t*math.pi);points.append((px,py,pz))
        # Ribbon leaves include true branches. Joined geometry limits draw calls.
        for k in range(12):
            p,q=Vector(points[k]),Vector(points[k+1]);direction=(q-p).normalized();n=direction.cross(Vector((0,1,0))).normalized();width=.022*(1-k/14)+.004
            start=len(weedverts);weedverts.extend([tuple(p-n*width),tuple(p+n*width),tuple(q+n*width),tuple(q-n*width)]);weedfaces.append((start,start+3,start+2,start+1));weeduv.extend([(0,k/12),(1,k/12),(1,(k+1)/12),(0,(k+1)/12)])
            if k in [4,7,10]:
                side=1 if (k+branch)%2 else -1;tip=p+n*side*random.uniform(.10,.24)+direction*.12;mid=p+n*side*.08
                start=len(weedverts);weedverts.extend([tuple(p),tuple(mid-direction*.035),tuple(tip),tuple(mid+direction*.035)]);weedfaces.append((start,start+1,start+2,start+3));weeduv.extend([(0,0),(.4,0),(1,1),(.4,1)])
weed=mesh('brown_branching_weed',weedverts,weedfaces,weedmat,weeduv);weed['motion']='shared local disturbance field; millimeter ribbon response'

# Authored mineral crumbs: sparse boundary clusters, joined instead of hundreds of draws.
verts=[];faces=[];random.seed(1997)
for i in range(620):
    z=random.uniform(-13,41);x=shore_x(z)+random.uniform(-.15,3.4);y=bed_height(x,z);s=random.uniform(.018,.065);h=s*random.uniform(.35,.80);offset=len(verts)
    a=random.random()*math.tau
    for k in range(4):
        q=a+k*math.pi/2;verts.append((x+math.cos(q)*s,y+.006,z+math.sin(q)*s))
    verts.append((x+s*.13,y+h,z-s*.08));faces.extend([(offset,offset+1,offset+4),(offset+1,offset+2,offset+4),(offset+2,offset+3,offset+4),(offset+3,offset,offset+4)])
mesh('salt_crumb_clusters',verts,faces,saltmat,smooth=False)

# Sole Easter egg: a five-prong crown built from salt facets, beside the dry shell.
verts=[(-.28,0,-.07),(.28,0,-.07),(.28,0,.07),(-.28,0,.07),(-.28,.11,-.07),(.28,.11,-.07),(.28,.11,.07),(-.28,.11,.07)]
faces=[(0,3,2,1),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)]
for i in range(5):
    x=(i-2)*.105;h=[.22,.28,.35,.27,.21][i];start=len(verts);verts.extend([(x-.047,.10,-.067),(x+.047,.10,-.067),(x+.047,.10,.067),(x-.047,.10,.067),(x+.01,h,.005)]);faces.extend([(start,start+1,start+4),(start+1,start+2,start+4),(start+2,start+3,start+4),(start+3,start,start+4)])
crown=mesh('salt_crystal_crown',verts,faces,saltmat,smooth=False);crown.location=(7.75,bed_height(7.75,1.40)+.008,1.40);crown.rotation_euler[1]=-.25

# Final modifiers and ordinary static export; rendering rig excluded from the runtime.
closed_validation={}
for ob in list(asset.objects):
    if ob.type=='MESH':
        if ob.name.startswith('post_') or ob.name=='again_scallop':
            bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
            degenerate=[face for face in bm.faces if face.calc_area()<.000000001]
            if degenerate:bmesh.ops.delete(bm,geom=degenerate,context='FACES')
            bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bad=[edge for edge in bm.edges if not edge.is_manifold]
            if bad:raise RuntimeError(ob.name+' has open sculpted seams: '+str(len(bad)))
            closed_validation[ob.name]={'nonManifoldEdges':len(bad),'closed':True}
            bm.to_mesh(ob.data);bm.free()
        tri=ob.modifiers.new('ExportTangentTriangles','TRIANGULATE');bpy.context.view_layer.objects.active=ob
        for modifier in list(ob.modifiers):bpy.ops.object.modifier_apply(modifier=modifier.name)
bpy.ops.object.select_all(action='DESELECT')
for ob in asset.objects:ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'scene.glb'),export_format='GLB',use_selection=True,export_yup=False,export_normals=True,export_tangents=True,export_extras=True)
manifest={'concept':'low-tide-later','status':'authored candidate; source/browser fidelity review pending','source':'../../../../../docs/countdown-concepts/references/low-tide-later.jpg','axis':'Y up, XZ shore, +Z foreground','authoring':{'tool':'Blender','version':bpy.app.version_string,'script':'authoring/build_scene.py','source':'authoring/scene.blend'},'camera':{'opening':{'position':[0,24,17],'target':[0,0,0],'fov':27},'inspection':{'position':[12,15,18],'target':[0,1,0],'fov':38}},'runtime':{'model':'scene.glb','nodes':{o.name:{'worldTranslation':list(o.matrix_world.translation)} for o in asset.objects},'surfaces':surfaces,'posts':profiles,'waterLevel':.20,'bedPatches':patches},'maps':{name:'materials/'+name+'.png' for name in ['chalk-albedo','chalk-porous-normal','chalk-roughness','salt-sand-albedo','salt-sand-normal','salt-sand-roughness','salt-paper-albedo','salt-paper-normal','shell-rust-albedo','shell-lamella-normal','shell-rust-roughness','water-capillary-normal']},'lighting':{'key':{'position':[-8,16,-9],'color':'#FFFDF7','size':[8,8]},'skyFill':'#D6E9F3','reflection':'broad daylight sky and clouds; no baked glints','water':'true transmission/refraction, common bed depth, contact foam and bed-scoped caustic approximation'},'license':'Project-authored geometry and procedural maps; no new license declaration. Bundled font licenses separate.','budgets':{'glbBytes':os.path.getsize(os.path.join(ROOT,'scene.glb')),'authoredTriangles':sum(len(p.vertices)-2 for o in asset.objects if o.type=='MESH' for p in o.data.polygons),'textures':11,'mapSize':[512,512],'totalScreenshotCount':13,'note':'Seven shore/water patches cull independently. Actual visible triangles/device FPS require browser measurement.'}}
manifest['geometryValidation']={'closedVolumes':closed_validation,'postProfiles':4,'shellRibs':'20 converging continuous ridges, nonuniform outer scalloping, transverse growth layers'}
with open(os.path.join(ROOT,'manifest.json'),'w') as f:json.dump(manifest,f,indent=2)
studio=bpy.data.collections.new('InspectionStudio_NOT_EXPORTED');bpy.context.scene.collection.children.link(studio)
def studio_own(o):
    for c in list(o.users_collection):c.objects.unlink(o)
    studio.objects.link(o);return o
def light(name,position,power,size,color):
    bpy.ops.object.light_add(type='AREA',location=position);o=studio_own(bpy.context.object);o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
light('BroadDaylight',(-8,16,-9),2300,9,(1,.99,.96));light('CoolSkyFill',(7,10,-5),600,12,(.79,.90,1))
def camera_look_at(camera,target):
    forward=(Vector(target)-camera.location).normalized();right=forward.cross(Vector((0,1,0))).normalized();up=right.cross(forward).normalized()
    camera.rotation_euler=Matrix((right,up,-forward)).transposed().to_quaternion().to_euler()
bpy.ops.object.camera_add(location=(0,24,17));camera=studio_own(bpy.context.object);camera_look_at(camera,(0,0,0));camera.data.lens=53.5;camera.data.sensor_width=36;bpy.context.scene.camera=camera
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=8;scene.cycles.use_denoising=True;scene.render.resolution_x=1487;scene.render.resolution_y=1058;scene.render.resolution_percentage=100;scene.world.color=(.55,.65,.74);scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'authoring','scene.blend'))
if PROOFS:
    # Blender material preview is structural evidence; browser owns the tidal shader.
    scene.render.filepath=os.path.join(ROOT,'proofs','opening-authored.png');bpy.ops.render.render(write_still=True)
    camera.location=(12,15,18);camera_look_at(camera,(0,1,0));scene.render.filepath=os.path.join(ROOT,'proofs','geometry-three-quarter.png');bpy.ops.render.render(write_still=True)
    clay=mat('InspectionClay',(.65,.67,.65),.83)
    for ob in asset.objects:
        if ob.type=='MESH' and not ob.name.startswith('sea_surface_'):ob.data.materials.clear();ob.data.materials.append(clay)
        elif ob.name.startswith('sea_surface_'):ob.hide_render=True
    scene.render.filepath=os.path.join(ROOT,'proofs','clay-three-quarter.png');bpy.ops.render.render(write_still=True)
print('LOW_TIDE_EXPORT_COMPLETE',os.path.join(ROOT,'scene.glb'))
