"""Offline surface LOD, preserving road profile and semantic/dynamic geometry.

Called by build_scene.py before baking/export. Can also be run against an
editable scene.blend after an authoring pass, producing exactly the same LOD.
"""
import bpy, math, sys
from mathutils import Vector
from pathlib import Path

def optimize_scene(scene):
    if scene.get('surface_lod_applied'):
        return
    camera=scene.camera
    stone=bpy.data.objects.get('static_salmon_quarried_limestone')
    if stone:
        # Keep the cast word clear of loose foreground boulders. Identify each
        # disconnected authored rock, not a rectangle cut through the terrain.
        from bpy_extras.object_utils import world_to_camera_view
        adjacency=[[] for _ in stone.data.vertices]
        for edge in stone.data.edges:
            a,b=edge.vertices;adjacency[a].append(b);adjacency[b].append(a)
        seen=set();remove=set()
        for vertex in range(len(adjacency)):
            if vertex in seen:continue
            component=[];pending=[vertex];seen.add(vertex)
            while pending:
                v=pending.pop();component.append(v)
                for neighbor in adjacency[v]:
                    if neighbor not in seen:seen.add(neighbor);pending.append(neighbor)
            center=sum((stone.matrix_world@stone.data.vertices[v].co for v in component),Vector())/len(component)
            projected=world_to_camera_view(scene,camera,center)
            if center.z<2.25 and .08<projected.x<.32 and .505<1-projected.y<.59:
                remove.update(component)
        if remove:
            import bmesh
            bm=bmesh.new();bm.from_mesh(stone.data);bm.verts.ensure_lookup_table()
            bmesh.ops.delete(bm,geom=[bm.verts[i] for i in remove],context='VERTS')
            bm.to_mesh(stone.data);bm.free();stone.data.update()
    for obj in list(scene.objects):
        if obj.type!='MESH' or obj.data.shape_keys:continue
        if not (obj.name.startswith('static_') or '_rubber_and_charcoal' in obj.name):continue
        bpy.context.view_layer.objects.active=obj
        # Planar dissolution first removes export-only triangulation on tiny
        # factory castings. Curved rims/guardrails and leaf folds stay intact.
        if any(word in obj.name for word in ['steel','scaffold','machine_enamel','lane_paint','paint_underlayer','rubber_and_charcoal','precast_concrete']):
            mod=obj.modifiers.new('Secondary_planar_surface_LOD','DECIMATE')
            mod.decimate_type='DISSOLVE';mod.angle_limit=math.radians(3)
            bpy.ops.object.modifier_apply(modifier=mod.name)
        ratio=.48 if 'quarried_limestone' in obj.name else .64
        if any(word in obj.name for word in ['leaf','succulent','aggregate','emitter']):continue
        mod=obj.modifiers.new('Secondary_cast_surface_LOD','DECIMATE')
        mod.ratio=ratio;mod.use_collapse_triangulate=True
        bpy.ops.object.modifier_apply(modifier=mod.name)
    scene['surface_lod_applied']=True
    print('ROADWORKS_STAGE authored surface LOD',flush=True)

if __name__=='__main__':
    root=Path(__file__).resolve().parents[1]
    bpy.ops.wm.open_mainfile(filepath=str(root/'authoring'/'scene.blend'))
    scene=bpy.context.scene
    optimize_scene(scene)
    scene.camera.data.name='opening_camera'
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(root/'authoring'/'scene.blend'),compress=True)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in scene.objects:
        if obj.type in ['MESH','EMPTY','CAMERA']:obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(root/'scene.glb'),export_format='GLB',use_selection=True,export_apply=False,export_morph=True,export_texcoords=True,export_normals=True,export_tangents=True,export_cameras=True,export_materials='EXPORT',export_extras=True)
    import importlib.util
    spec=importlib.util.spec_from_file_location('road_attribute_pack',root/'authoring'/'pack_attributes.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);module.pack(root/'scene.glb')
    scene.cycles.samples=32;scene.render.filepath=str(root/'proofs'/'opening-authored.png')
    bpy.ops.render.render(write_still=True)
