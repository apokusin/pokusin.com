"""Refresh blank physical proofs from the saved editable source, without export."""
import bpy
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'authoring'/'scene.blend'))
scene=bpy.context.scene;scene.cycles.samples=28
try:
    preferences=bpy.context.preferences.addons['cycles'].preferences;preferences.compute_device_type='METAL';preferences.get_devices()
    for device in preferences.devices:device.use=device.type=='METAL'
    scene.cycles.device='GPU'
except Exception:pass
scene.render.filepath=str(root/'inspection'/'final-light.png');bpy.ops.render.render(write_still=True)
clay=bpy.data.materials.new('Current_neutral_inspection_clay');clay.use_nodes=True;bsdf=clay.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(.48,.48,.48,1);bsdf.inputs['Roughness'].default_value=.7
scene.view_layers[0].material_override=clay;scene.render.filepath=str(root/'inspection'/'clay-opening.png');bpy.ops.render.render(write_still=True)
camera=scene.camera;camera.location=(9,-17,10);camera.rotation_euler=(Vector((0,1,4))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(root/'inspection'/'clay-three-quarter.png');bpy.ops.render.render(write_still=True)
