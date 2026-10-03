"""Actual exported sculpt clearance for native focus, previews and camera rails.

Exports aspect-specific verified poses; no runtime collision/physics engine.
"""
import bpy,json,math,sys,bmesh
from mathutils import Vector,Quaternion
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
mobile_verify='--mobile-verify' in sys.argv
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'authoring'/('scene-mobile.blend' if mobile_verify else 'scene.blend')))
scene=bpy.context.scene;depsgraph=bpy.context.evaluated_depsgraph_get()
manifest=json.loads((ROOT/'manifest.json').read_text())
profiles=[('desktop',1487/1058,manifest['camera']['fov']),('phone390',390/844,42),('phone320',320/740,42)]
report={'source':'real authored meshes; 81 sight rays per screen from its aspect-specific viewing pose','surfaces':{}}
to_gltf=lambda v:[v.x,v.z,-v.y]
def points(ob):
    corners=[ob.matrix_world@Vector(v) for v in ob.bound_box]
    local=[Vector(v) for v in ob.bound_box]
    xlo=min(v.x for v in local);xhi=max(v.x for v in local);zlo=min(v.z for v in local);zhi=max(v.z for v in local)
    return [ob.matrix_world@Vector((xlo+(xhi-xlo)*(.015+i*.97/8),0,zlo+(zhi-zlo)*(.015+j*.97/8))) for i in range(9) for j in range(9)],corners
def blocked(start,samples):
    total=0
    for point in samples:
        ray=point-start
        hit,*_=scene.ray_cast(depsgraph,start,ray.normalized(),distance=max(0,ray.length-.022))
        total+=bool(hit)
    return total
def path_blocked(points):
    # A small camera-sized swept clearance volume, not only a center line.
    offsets=[Vector(v) for v in [(0,0,0),(.16,0,0),(-.16,0,0),(0,.16,0),(0,-.16,0),(0,0,.16),(0,0,-.16)]]
    count=0
    for a,b in zip(points,points[1:]):
        ray=b-a
        if ray.length<.01:continue
        for offset in offsets:
            hit,*_=scene.ray_cast(depsgraph,a+offset,ray.normalized(),distance=ray.length)
            count+=bool(hit)
    return count
if mobile_verify:
    # Test the actual generated portrait source, including its separate bank,
    # negative bowl, rooted support and every translated pressure-morph point.
    phone_report={'source':'actual saved scene-mobile.blend from export_mobile.py; full portrait bank and rooted bowl; unchanged archive stops','surfaces':{},'rails':{},'opening':{},'topology':{}}
    from_gltf=lambda p:Vector((p[0],-p[2],p[1]))
    for record in manifest['archives']:
        ob=bpy.data.objects[record['screen']];samples,_=points(ob)
        phone_report['surfaces'][record['screen']]={profile:blocked(from_gltf(record['viewPoses'][profile]['positionGLTF']),samples) for profile in ['phone390','phone320']}
    for profile in ['phone390','phone320']:
        phone_report['rails'][profile]=[path_blocked([from_gltf(p) for p in path]) for path in manifest['navigationRails'][profile]]
    for name in ['continuous_sculpted_wax_mass','phone_integrated_clock_bank','phone_rooted_pressure_platform']:
        bm=bmesh.new();bm.from_mesh(bpy.data.objects[name].data)
        phone_report['topology'][name]={'boundaryEdges':sum(edge.is_boundary for edge in bm.edges),'nonManifoldEdges':sum(not edge.is_manifold for edge in bm.edges)};bm.free()
    def glyph_points(ob,u0=.08,u1=.92,v0=.12,v1=.90):
        box=[Vector(v) for v in ob.bound_box];xlo=min(p.x for p in box);xhi=max(p.x for p in box);zlo=min(p.z for p in box);zhi=max(p.z for p in box)
        return [ob.matrix_world@Vector((xlo+(xhi-xlo)*(u0+(u1-u0)*i/8),0,zhi-(zhi-zlo)*(v0+(v1-v0)*j/8))) for i in range(9) for j in range(9)]
    pool=bpy.data.objects[manifest['reset']]
    def pool_points(u0,u1,v0,v1):
        mesh=pool.evaluated_get(depsgraph).to_mesh();mesh.calc_loop_triangles();uv=mesh.uv_layers.active.data;result=[]
        for i in range(9):
            for j in range(9):
                u=u0+(u1-u0)*i/8;v=1-(v0+(v1-v0)*j/8)
                for triangle in mesh.loop_triangles:
                    a,b,c=[uv[index].uv for index in triangle.loops]
                    denominator=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y)
                    if abs(denominator)<1e-9:continue
                    wa=((b.y-c.y)*(u-c.x)+(c.x-b.x)*(v-c.y))/denominator;wb=((c.y-a.y)*(u-c.x)+(a.x-c.x)*(v-c.y))/denominator;wc=1-wa-wb
                    if min(wa,wb,wc)>=-1e-6:
                        result.append(pool.matrix_world@(mesh.vertices[triangle.vertices[0]].co*wa+mesh.vertices[triangle.vertices[1]].co*wb+mesh.vertices[triangle.vertices[2]].co*wc));break
        pool.evaluated_get(depsgraph).to_mesh_clear();return result
    from bpy_extras.object_utils import world_to_camera_view
    camera=bpy.data.objects['reference_macro_camera'];opening=from_gltf(manifest['camera']['phoneRule']['positionGLTF'])
    def pixel_bounds(samples,w,h):
        q=[world_to_camera_view(scene,camera,p) for p in samples]
        return [round(min(p.x for p in q)*w,2),round((1-max(p.y for p in q))*h,2),round(max(p.x for p in q)*w,2),round((1-min(p.y for p in q))*h,2)]
    for profile,w,h in [('phone390',390,844),('phone320',320,740)]:
        scene.render.resolution_x=w;scene.render.resolution_y=h;result={}
        for name in manifest['phoneClock']:
            ob=bpy.data.objects[name];samples,_=points(ob);glyph=glyph_points(ob)
            result[name]={'fullFaceBlocked':blocked(opening,samples),'glyphAndUnitsBlocked':blocked(opening,glyph),'glyphPixelBounds':pixel_bounds(glyph,w,h),'samples':len(glyph)}
        for state,pressure in [('rest',0),('pending',.35)]:
            pool.data.shape_keys.key_blocks['Pressure'].value=pressure;bpy.context.view_layer.update();depsgraph=bpy.context.evaluated_depsgraph_get()
            again=pool_points(.12,.88,.30,.70);tally=pool_points(.415,.585,.794,.966)
            result['pressure_'+state]={'againBlocked':blocked(opening,again),'tallyBlocked':blocked(opening,tally),'againSamples':len(again),'tallySamples':len(tally),'againPixelBounds':pixel_bounds(again,w,h),'tallyPixelBounds':pixel_bounds(tally,w,h)}
        pool.data.shape_keys.key_blocks['Pressure'].value=0;bpy.context.view_layer.update();depsgraph=bpy.context.evaluated_depsgraph_get();phone_report['opening'][profile]=result
    (ROOT/'inspection'/'navigation-clearance-phone.json').write_text(json.dumps(phone_report,indent=2)+'\n')
    print(json.dumps(phone_report,indent=2));sys.exit(0)
for entry in manifest['archives']:
    ob=bpy.data.objects[entry['screen']];samples,corners=points(ob)
    center=ob.matrix_world.translation
    normal=(ob.matrix_world.to_3x3()@Vector((0,-1,0))).normalized()
    entry['viewPoses']={};result={}
    for profile,aspect,fov in profiles:
        tan=math.tan(math.radians(fov/2));best=None
        # A restrained arc through the poured channel. The smallest change
        # clearing real terrain wins, rather than a front-normal tunnel pose.
        for yaw in [0,-12,-24,-36,-48,-60,12,24,36,48]:
            direction=Quaternion(Vector((0,0,1)),math.radians(yaw))@normal
            for rise in [.0,.12,.24,.42]:
                forward=(direction+Vector((0,0,rise))).normalized()
                right=Vector((0,0,1)).cross(forward).normalized();up=forward.cross(right)
                distance=max(max(abs((p-center).dot(right))/(tan*aspect),abs((p-center).dot(up))/tan)+(p-center).dot(forward) for p in corners)*1.28+.45
                for extra in [1,1.18,.86]:
                    start=center+forward*distance*extra
                    count=blocked(start,samples)
                    access=path_blocked([Vector((0,start.y,start.z)),start])
                    candidate=(count+access*81,abs(yaw)*.01+rise*.15+abs(extra-1),start,forward)
                    if best is None or candidate[:2]<best[:2]:best=candidate
                    if count==0 and access==0:break
                if best[0]==0:break
            if best[0]==0:break
        _,cost,start,forward=best;count=blocked(start,samples)
        entry['viewPoses'][profile]={'positionGLTF':to_gltf(start),'targetGLTF':to_gltf(center),'fov':fov,'aspect':aspect}
        result[profile]={'samples':81,'blocked':count,'channelAccessBlocked':path_blocked([Vector((0,start.y,start.z)),start]),'cameraGLTF':to_gltf(start),'fov':fov}
    report['surfaces'][entry['screen']]=result
manifest['navigationRails']={};report['rails']={}
from_gltf=lambda p:Vector((p[0],-p[2],p[1]))
for profile,aspect,fov in profiles:
    if profile=='desktop':previous=scene.camera.location.copy()
    else:
        distance=17.2/(2*math.tan(math.radians(21))*aspect)
        previous=from_gltf([-.35,4+distance*.108,3+distance])
    rails=[];measurements=[]
    for record in manifest['archives']:
        end=from_gltf(record['viewPoses'][profile]['positionGLTF'])
        direct=[previous,end]
        points=direct if not path_blocked(direct) else [previous,Vector((0,previous.y,previous.z)),Vector((0,end.y,end.z)),end]
        count=path_blocked(points)
        rails.append([to_gltf(p) for p in points]);measurements.append({'destination':record['id'],'sweptRadius':.16,'segmentIntersections':count,'segments':len(points)-1})
        previous=end
    manifest['navigationRails'][profile]=rails;report['rails'][profile]=measurements
manifest['navigationClearance']={'report':'inspection/navigation-clearance.json','source':'Offline real-sculpt sight rays and swept camera rails at desktop / 390 / 320; no runtime physics','profiles':[p[0] for p in profiles]}
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
(ROOT/'inspection'/'navigation-clearance.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({name:{profile:data['blocked'] for profile,data in results.items()} for name,results in report['surfaces'].items()},indent=2))
