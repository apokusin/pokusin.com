"""Inspect physical reading clearance and closed sculpt topology from .blend."""
import bpy,bmesh,json,math
from mathutils import Vector
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'authoring'/'scene.blend'))
mass=bpy.data.objects['continuous_sculpted_wax_mass']
camera=bpy.data.objects['reference_macro_camera']
report={'source':'editable authored geometry, sampled front normals and real opening camera rays','surfaces':{},'topology':{}}
manifest=json.loads((ROOT/'manifest.json').read_text())
records={entry['screen']:entry for entry in manifest['archives']}
depsgraph=bpy.context.evaluated_depsgraph_get()
for name in ['continuous_sculpted_wax_mass','tapered_front_candle']:
    ob=bpy.data.objects[name];bm=bmesh.new();bm.from_mesh(ob.data)
    report['topology'][name]={'boundaryEdges':sum(e.is_boundary for e in bm.edges),'nonManifoldEdges':sum(not e.is_manifold for e in bm.edges),'faces':len(bm.faces)};bm.free()
for ob in bpy.data.objects:
    if not ob.name.startswith(('clock_','archive_')) or ob.name.endswith(('_bed','wax_bed')):continue
    if ob.type!='MESH':continue
    box=[Vector(v) for v in ob.bound_box];xlo=min(v.x for v in box);xhi=max(v.x for v in box);zlo=min(v.z for v in box);zhi=max(v.z for v in box)
    normal=(ob.matrix_world.to_3x3()@Vector((0,-1,0))).normalized();blocked=0;cameraBlocked=0;total=0;approach={'desktop':0,'phone':0,'phone320':0}
    center=ob.matrix_world@Vector(((xlo+xhi)/2,0,(zlo+zhi)/2))
    for aspect,label in [(1487/1058,'desktop'),(390/844,'phone'),(320/740,'phone320')]:
        distance=max((zhi-zlo)/(math.tan(math.radians(40/2))*1.5),(xhi-xlo)/(aspect*math.tan(math.radians(40/2))*1.5))+1.15
        start=center+normal*distance
        profile='phone390' if label=='phone' else label
        pose=records.get(ob.name,{}).get('viewPoses',{}).get(profile)
        if pose:
            p=pose['positionGLTF'];start=Vector((p[0],-p[2],p[1]))
        elif ob.name.startswith('clock_'):
            # Clock focus returns to the actual complete opening composition,
            # never approaches one number tile along a ground-level normal.
            if label=='desktop':start=camera.location.copy()
            else:
                d=17.2/(2*math.tan(math.radians(21))*aspect)
                start=Vector((-.35,-(3+d),4+d*.108))
        for i in range(9):
            for j in range(9):
                point=ob.matrix_world@Vector((xlo+(xhi-xlo)*(i+.5)/9,0,zlo+(zhi-zlo)*(j+.5)/9));ray=point-start
                hit,*_=bpy.context.scene.ray_cast(depsgraph,start,ray.normalized(),distance=ray.length-.025);approach[label]+=bool(hit)
    for i in range(9):
        for j in range(9):
            point=ob.matrix_world@Vector((xlo+(xhi-xlo)*(i+.5)/9,0,zlo+(zhi-zlo)*(j+.5)/9))
            start=point+normal*.50;hit,pos,n,face=mass.ray_cast(start,-normal,distance=.48)
            blocked+=bool(hit)
            ray=(point-camera.location);length=ray.length
            hit,pos,n,face=mass.ray_cast(camera.location,ray.normalized(),distance=max(0,length-.025));cameraBlocked+=bool(hit);total+=1
    report['surfaces'][ob.name]={'samples':total,'normalClearanceBlocked':blocked,'openingCameraBlocked':cameraBlocked,'approachBlocked':approach}
pool=bpy.data.objects['again_pressure_pool']
report['pool']={'upwardFaces':sum(face.normal.z>0 for face in pool.data.polygons),'downwardFaces':sum(face.normal.z<=0 for face in pool.data.polygons),'faces':len(pool.data.polygons)}
(ROOT/'inspection'/'geometry-clearance.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
