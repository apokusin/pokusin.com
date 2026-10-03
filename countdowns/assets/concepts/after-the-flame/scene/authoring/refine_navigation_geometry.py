"""Keep later photographs shallow within their genuine eroded wax recesses.

The opening three recesses retain their deeper source geometry. Later works
face a winding channel, so their image beds lie nearer the mouth, preserving
wax in front/behind while keeping their edges visible from channel-side poses.
"""
import bpy,json
from pathlib import Path
from mathutils import Vector

def refine(scene,records):
    if not scene.get('later_recess_clearance_applied'):
        for record in records[3:]:
            surface=bpy.data.objects[record['screen']]
            normal=(surface.matrix_world.to_3x3()@Vector((0,-1,0))).normalized()
            for name in [surface.name,surface.name+'_bed']:
                bpy.data.objects[name].location+=normal*.82
            record['centerBlender']=list(surface.location)
        scene['later_recess_clearance_applied']=True
    if not scene.get('later_recess_edge_clearance_applied'):
        for record in records[3:]:
            surface=bpy.data.objects[record['screen']]
            normal=(surface.matrix_world.to_3x3()@Vector((0,-1,0))).normalized()
            for name in [surface.name,surface.name+'_bed']:bpy.data.objects[name].location+=normal*.20
            record['centerBlender']=list(surface.location)
        scene['later_recess_edge_clearance_applied']=True
    if not scene.get('clock_bed_front_clearance_applied'):
        for unit in ['days','hours','minutes','seconds']:
            for name in ['clock_'+unit,'clock_'+unit+'_wax_bed']:bpy.data.objects[name].location.y-=.14
        scene['clock_bed_front_clearance_applied']=True
    bpy.context.view_layer.update()

if __name__=='__main__':
    root=Path(__file__).resolve().parents[1]
    bpy.ops.wm.open_mainfile(filepath=str(root/'authoring'/'scene.blend'))
    manifest=json.loads((root/'manifest.json').read_text());scene=bpy.context.scene
    refine(scene,manifest['archives'])
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(root/'authoring'/'scene.blend'))
    bpy.ops.object.select_all(action='DESELECT')
    for ob in bpy.data.collections['AuthoredWaxCanyon'].all_objects:ob.select_set(True)
    bpy.data.objects['reference_macro_camera'].select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(root/'scene.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=True,export_lights=False,export_yup=True,export_texcoords=True,export_normals=True,export_tangents=True)
    (root/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
