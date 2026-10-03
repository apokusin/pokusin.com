"""Print actual first intersection for a failed authored photograph sight ray."""
import bpy,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'authoring'/'scene.blend'))
manifest=json.loads((root/'manifest.json').read_text());graph=bpy.context.evaluated_depsgraph_get()
record=next(r for r in manifest['archives'] if r['id']=='breaking-bad-desert-parallax')
ob=bpy.data.objects[record['screen']];w,h=record['width'],record['height']
for profile in ['phone390','phone320']:
    p=record['viewPoses'][profile]['positionGLTF'];start=Vector((p[0],-p[2],p[1]))
    for i in range(9):
        for j in range(9):
            point=ob.matrix_world@Vector(((.015+i*.97/8-.5)*w,0,(.015+j*.97/8-.5)*h));ray=point-start
            hit,location,normal,index,body,matrix=bpy.context.scene.ray_cast(graph,start,ray.normalized(),distance=ray.length-.022)
            if hit:print(profile,i,j,body.name,'hit',list(location),'target',list(point),'gap',(location-point).length)
