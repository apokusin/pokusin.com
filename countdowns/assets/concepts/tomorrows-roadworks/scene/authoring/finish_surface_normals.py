"""Refresh authored smooth stone normals without rerunning the fixed AO bake.

The builder applies the same smooth flags before subdivision. This utility
updates an existing editable source and its quantized export after art review.
"""
import bpy, importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'authoring'/'scene.blend'))
for obj in bpy.context.scene.objects:
    if obj.type=='MESH' and obj.name.startswith('cleft_stratified_boulder_'):
        for polygon in obj.data.polygons:polygon.use_smooth=True
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'authoring'/'scene.blend'),compress=True)
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type in ['MESH','EMPTY','CAMERA']:obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'scene.glb'),export_format='GLB',use_selection=True,export_apply=False,export_morph=True,export_texcoords=True,export_normals=True,export_tangents=True,export_cameras=True,export_materials='EXPORT',export_extras=True)
spec=importlib.util.spec_from_file_location('road_attribute_pack',ROOT/'authoring'/'pack_attributes.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);module.pack(ROOT/'scene.glb')
