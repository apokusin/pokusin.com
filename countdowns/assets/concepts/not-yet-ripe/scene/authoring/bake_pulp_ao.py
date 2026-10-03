"""Actual per-specimen local AO; no sun or live ink baked into albedo."""
import bpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'authoring/scene.blend'))
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24
for ob in scene.objects:
    if ob.name in ['clock_days','clock_hours','clock_minutes','clock_seconds','again_leaf_print'] or ob.name.startswith(('archive_','caption_','unit_ink','destination_')):ob.hide_render=True
for i in range(4):
    ob=bpy.data.objects['longitudinal_flesh_'+str(i)];ob.hide_render=False
    mat=bpy.data.materials.new('Local pulp AO bake '+str(i));mat.use_nodes=True;ns=mat.node_tree.nodes;ls=mat.node_tree.links;ns.clear()
    ao=ns.new('ShaderNodeAmbientOcclusion');ao.inputs['Distance'].default_value=.34;ao.samples=24
    emission=ns.new('ShaderNodeEmission');ls.new(ao.outputs['Color'],emission.inputs['Color']);output=ns.new('ShaderNodeOutputMaterial');ls.new(emission.outputs[0],output.inputs['Surface'])
    image=bpy.data.images.new('pulp-local-ao-'+str(i),512,512,alpha=False);image.colorspace_settings.name='Non-Color'
    image_node=ns.new('ShaderNodeTexImage');image_node.image=image;ns.active=image_node
    ob.data.materials.clear();ob.data.materials.append(mat)
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    scene.render.bake.margin=8;bpy.ops.object.bake(type='EMIT')
    image.filepath_raw=str(ROOT/'materials'/('pulp-local-ao-'+str(i)+'.png'));image.file_format='PNG';image.save()
print('Actual separate pulp AO baked')
