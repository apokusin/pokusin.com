"""Read-only actual-mesh phone sight rays and blank-face physical proofs."""
import bpy,json,math,sys
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'authoring'/'scene.blend'))
scene=bpy.context.scene;report=json.loads((ROOT/'proofs'/'phone-opening-projection.json').read_text());result={'method':'Saved authored meshes;81 sight samples per ink face from exact runtime phone camera; no source save','profiles':{}}
from_gltf=lambda p:Vector((p[0],-p[2],p[1]))
extension=json.loads((ROOT/'proofs'/'phone-coast-continuation.json').read_text())
positions=extension['vertices'];indices=extension['indices'];data=bpy.data.meshes.new('phone_far_quarry_continuation')
data.from_pydata([from_gltf(positions[i:i+3]) for i in range(0,len(positions),3)],[],[tuple(indices[i:i+3]) for i in range(0,len(indices),3)]);data.materials.append(bpy.data.materials['coastal_quarry_sediment']);data.update()
obj=bpy.data.objects.new('phone_far_quarry_continuation',data);bpy.context.collection.objects.link(obj);uv=data.uv_layers.new(name='UVMap')
for polygon in data.polygons:
    polygon.use_smooth=True
    for index in polygon.loop_indices:
        point=data.vertices[data.loops[index].vertex_index].co;uv.data[index].uv=(point.x/4,point.y/4)
bpy.data.objects['static_pale_coastal_water'].scale.x*=extension['waterScaleX']
camera=scene.camera
def flat_samples(obj,u0=.08,u1=.92,v0=.12,v1=.88):
    points=[Vector(v) for v in obj.bound_box];lo=min(p.x for p in points);hi=max(p.x for p in points);bottom=min(p.z for p in points);top=max(p.z for p in points)
    return [obj.matrix_world@Vector((lo+(hi-lo)*(u0+(u1-u0)*i/8),0,bottom+(top-bottom)*(v0+(v1-v0)*j/8))) for i in range(9) for j in range(9)]
def uv_samples(obj,u0,u1,v0,v1):
    mesh=obj.data;mesh.calc_loop_triangles();uv=mesh.uv_layers.active.data;samples=[]
    for i in range(9):
        for j in range(9):
            u=u0+(u1-u0)*i/8;v=v0+(v1-v0)*j/8
            for triangle in mesh.loop_triangles:
                a,b,c=[uv[index].uv for index in triangle.loops];den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y)
                if abs(den)<1e-9:continue
                wa=((b.y-c.y)*(u-c.x)+(c.x-b.x)*(v-c.y))/den;wb=((c.y-a.y)*(u-c.x)+(a.x-c.x)*(v-c.y))/den;wc=1-wa-wb
                if min(wa,wb,wc)>=-1e-6:
                    samples.append(obj.matrix_world@(mesh.vertices[triangle.vertices[0]].co*wa+mesh.vertices[triangle.vertices[1]].co*wb+mesh.vertices[triangle.vertices[2]].co*wc));break
    return samples
def visibility(start,samples):
    blocked=[];depsgraph=bpy.context.evaluated_depsgraph_get()
    for point in samples:
        ray=point-start;hit,location,normal,index,obj,*_=scene.ray_cast(depsgraph,start,ray.normalized(),distance=max(0,ray.length-.014))
        if hit:blocked.append(obj.name)
    return {'samples':len(samples),'blocked':len(blocked),'occluders':sorted(set(blocked))}
for profile,p in report['profiles'].items():
    camera.location=from_gltf(p['positionGLTF']);target=from_gltf(p['targetGLTF']);camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.sensor_fit='VERTICAL';camera.data.sensor_height=36;camera.data.lens=36/(2*math.tan(math.radians(p['fov']/2)))
    scene.render.resolution_x=p['width'];scene.render.resolution_y=p['height'];scene.render.resolution_percentage=100;bpy.context.view_layer.update()
    readings={}
    for name in ['clock_d','clock_h','clock_m','clock_s','clock_d_unit','clock_h_unit','clock_m_unit','clock_s_unit','press_tally']:
        readings[name]=visibility(camera.location,flat_samples(bpy.data.objects[name]))
    readings['again_ink']=visibility(camera.location,uv_samples(bpy.data.objects['again_ink'],.09,.91,.24,.76))
    result['profiles'][profile]=readings
    if '--proofs' in sys.argv:
        scene.cycles.samples=32;scene.render.filepath=str(ROOT/'proofs'/f'phone-opening-{p["width"]}.png');bpy.ops.render.render(write_still=True)
(ROOT/'proofs'/'phone-opening-contacts.json').write_text(json.dumps(result,indent=2)+'\n')
print('ROAD_PHONE_CONTACTS',json.dumps(result),flush=True)
