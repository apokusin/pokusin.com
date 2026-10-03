"""Reading-plane clearance, native inventory and authored normals checks."""
import bpy,json,math,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
PHONE='--phone' in sys.argv
if PHONE:
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.import_scene.gltf(filepath=str(ROOT/'scene-mobile.glb'))
else:bpy.ops.wm.open_mainfile(filepath=str(ROOT/'authoring/scene.blend'))
manifest=json.loads((ROOT/'manifest.json').read_text());scene=bpy.context.scene;depsgraph=bpy.context.evaluated_depsgraph_get()
report={'source':('actual phone GLB' if PHONE else 'editable Blender scene')+'; 81 rays per real archive/clock reading face','surfaces':{},'inventory':{}}
names=manifest['clock']+['unit_ink_'+str(i) for i in range(4)]+['again_leaf_print','press_tally_tag']+[record['screen'] for record in manifest['archives']]+[record['surface'] for record in manifest['destinations']]
for name in names:
    ob=bpy.data.objects.get(name)
    if not ob:raise RuntimeError('Missing native counterpart '+name)
    points=[ob.matrix_world@vertex.co for vertex in ob.data.vertices];center=sum(points,Vector())/len(points)
    x=ob.matrix_world.to_3x3()@Vector((1,0,0));up=ob.matrix_world.to_3x3()@Vector((0,0,1));normal=(ob.matrix_world.to_3x3()@Vector((0,-1,0))).normalized()
    bounds=[Vector(value) for value in ob.bound_box];width=max(p.x for p in bounds)-min(p.x for p in bounds);height=max(p.z for p in bounds)-min(p.z for p in bounds)
    uv_layer=ob.data.uv_layers.active.data;ob.data.calc_loop_triangles();uv_triangles=[]
    for triangle in ob.data.loop_triangles:
        uv=[Vector(uv_layer[index].uv) for index in triangle.loops];positions=[ob.data.vertices[index].co for index in triangle.vertices];uv_triangles.append((uv,positions))
    def uv_point(s,t):
        for uv,positions in uv_triangles:
            a,b,c=uv;den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y)
            if abs(den)<1e-9:continue
            wa=((b.y-c.y)*(s-c.x)+(c.x-b.x)*(t-c.y))/den;wb=((c.y-a.y)*(s-c.x)+(a.x-c.x)*(t-c.y))/den;wc=1-wa-wb
            if min(wa,wb,wc)>=-1e-5:return ob.matrix_world@(positions[0]*wa+positions[1]*wb+positions[2]*wc)
        raise RuntimeError('Reading UV missing '+name)
    counts={};hitObjects={}
    for label,aspect in [('desktop',1487/1058),('phone',390/844)]:
        fov=34 if label=='desktop' else 38;tan=math.tan(math.radians(fov/2));distance=max(height/(tan*1.42),width/(aspect*tan*1.42))+.40
        start=center+normal*distance;blocked=0
        for i in range(9):
            for j in range(9):
                # Clock ink follows the actual pulp relief; test its exact UV
                # sample, rather than pretending that curved reading skin flat.
                point=uv_point((i+.5)/9,(j+.5)/9);ray=point-start
                hit,pos,n,index,obj,matrix=scene.ray_cast(depsgraph,start,ray.normalized(),distance=ray.length-.015)
                if hit:blocked+=1;hitObjects[obj.name]=hitObjects.get(obj.name,0)+1
        counts[label]=blocked
    report['surfaces'][name]={'samples':81,'approachBlocked':counts,'nearestOccluders':hitObjects,'normal':list(normal)}
report['inventory']={'archiveCount':len(manifest['archives']),'destinationCount':len(manifest['destinations']),'clockCount':len(manifest['clock']),'goldNotches':int('gold_notched_fold' in bpy.data.objects),'editableSource':True}
(ROOT/'inspection'/('phone-geometry-clearance.json' if PHONE else 'geometry-clearance.json')).write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
