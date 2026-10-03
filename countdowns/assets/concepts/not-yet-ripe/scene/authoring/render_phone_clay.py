"""Neutral portrait proof of the exact exported phone model, no live ink."""
import bpy,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'scene-mobile.glb'))
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=18
clay=bpy.data.materials.new('Neutral portrait clay');clay.use_nodes=True;p=clay.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(.62,.62,.62,1);p.inputs['Roughness'].default_value=.96
for ob in scene.objects:
    if ob.type=='MESH':
        ob.data.materials.clear();ob.data.materials.append(clay)
        if ob.name in ['clock_days','clock_hours','clock_minutes','clock_seconds','again_leaf_print'] or ob.name.startswith('unit_ink'):ob.hide_render=True
world=bpy.data.worlds.new('Neutral portrait studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.70,.70,.70,1);world.node_tree.nodes['Background'].inputs[1].default_value=.50;scene.world=world
data=bpy.data.lights.new('Broad portrait window','AREA');data.energy=1600;data.size=8;ob=bpy.data.objects.new('Broad portrait window',data);scene.collection.objects.link(ob);ob.location=(-10,-10,15);ob.rotation_euler=(Vector((0,0,3))-ob.location).to_track_quat('-Z','Y').to_euler()
data=bpy.data.cameras.new('Portrait camera');camera=bpy.data.objects.new('Portrait camera',data);scene.collection.objects.link(camera);camera.location=(0,-26.72,3.4);camera.rotation_euler=(Vector((0,0,3.4))-camera.location).to_track_quat('-Z','Y').to_euler();data.sensor_fit='VERTICAL';data.lens=data.sensor_height/(2*math.tan(math.radians(19)));scene.camera=camera
scene.render.resolution_x=390;scene.render.resolution_y=844;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX';scene.render.filepath=str(ROOT/'inspection/phone-clay.png');bpy.ops.render.render(write_still=True)
