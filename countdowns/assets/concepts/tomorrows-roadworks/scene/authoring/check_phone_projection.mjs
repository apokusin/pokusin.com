// Real exported bounds + the runtime's exact phone camera function. No browser,
// renderer or texture mock is used; appearance still requires browser review.
import fs from 'node:fs';
import * as T from '../../../../vendor/three.module.min.js';
import {phoneOpeningPose,phoneCoastContinuation} from '../../../../../concepts/tomorrows-roadworks.scene.js';
const root=new URL('../',import.meta.url),raw=fs.readFileSync(new URL('scene.glb',root));
const length=raw.readUInt32LE(12),doc=JSON.parse(raw.subarray(20,20+length));
const objects=doc.nodes.map(node=>{
  const object=new T.Object3D();object.name=node.name||'';
  if(node.matrix)object.matrix.fromArray(node.matrix).decompose(object.position,object.quaternion,object.scale);
  else{object.position.fromArray(node.translation||[0,0,0]);object.quaternion.fromArray(node.rotation||[0,0,0,1]);object.scale.fromArray(node.scale||[1,1,1]);}
  if(node.mesh!==undefined)for(const primitive of doc.meshes[node.mesh].primitives){
    const accessor=doc.accessors[primitive.attributes.POSITION],view=doc.bufferViews[accessor.bufferView],points=[];
    const start=28+length+(view.byteOffset||0)+(accessor.byteOffset||0),stride=view.byteStride||12;
    if(accessor.componentType!==5126)throw new Error('Expected exact float positions');
    for(let i=0;i<accessor.count;i++)for(let axis=0;axis<3;axis++)points.push(raw.readFloatLE(start+i*stride+axis*4));
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));object.add(new T.Mesh(geometry,new T.MeshBasicMaterial()));
  }
  return object;
});
doc.nodes.forEach((node,i)=>node.children?.forEach(j=>objects[i].add(objects[j])));
const world=new T.Scene();doc.scenes[doc.scene||0].nodes.forEach(index=>world.add(objects[index]));world.updateMatrixWorld(true);
const node=name=>world.getObjectByName(name),bounds=name=>new T.Box3().setFromObject(node(name));
const terrain=node('sculpted_coastal_bed'),terrainMesh=terrain.children.find(child=>child.isMesh),extension=phoneCoastContinuation(T,terrainMesh);
fs.writeFileSync(new URL('proofs/phone-coast-continuation.json',root),JSON.stringify({vertices:[...extension.geometry.attributes.position.array],indices:[...extension.geometry.index.array],waterScaleX:2})+'\n');
function screenBounds(camera,name,width,height){
  const box=bounds(name),points=[];
  for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){
    const p=new T.Vector3(x,y,z).project(camera);points.push([(p.x*.5+.5)*width,(.5-p.y*.5)*height]);
  }
  return {left:Math.min(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),right:Math.max(...points.map(p=>p[0])),bottom:Math.max(...points.map(p=>p[1]))};
}
const report={method:'Actual GLB positions and node transforms; exact exported runtime phoneOpeningPose; font outline height 455/640 measured from licensed Roboto Condensed weight900 at640px; browser pixels remain a separate gate',continuationTriangles:extension.geometry.index.count/3,profiles:{}};
for(const[profile,width,height]of[['phone390',390,844],['phone320',320,568]]){
  const pose=phoneOpeningPose(T,{housing:node('clock_cast_housing'),pillar:node('again_cast_pillar'),cap:node('again_orange_cap')},width,height),camera=new T.PerspectiveCamera(pose.fov,width/height,.1,200);
  camera.position.copy(pose.position);camera.lookAt(pose.target);camera.updateMatrixWorld(true);
  const surfaces=Object.fromEntries(['clock_cast_housing','clock_heading','clock_d','clock_h','clock_m','clock_s','clock_d_unit','clock_h_unit','clock_m_unit','clock_s_unit','again_orange_cap','again_ink','press_tally'].map(name=>[name,screenBounds(camera,name,width,height)]));
  const glyphHeights=['clock_d','clock_h','clock_m','clock_s'].map(name=>(surfaces[name].bottom-surfaces[name].top)*455/640);
  if(glyphHeights.some(height=>height<30))throw new Error(profile+' numeral outline below30px');
  const cap=surfaces.again_orange_cap;
  if(Math.min(cap.right-cap.left,cap.bottom-cap.top)<44)throw new Error(profile+' physical reset below44px');
  if(Object.values(surfaces).some(box=>box.left<0||box.top<58||box.right>width||box.bottom>height))throw new Error(profile+' reading/action outside safe viewport');
  // The real front terrain edge is z13. Its center must be below the viewport;
  // the larger sea bed's front edge sits behind the nearer phone camera.
  const edge=new T.Vector3(pose.target.x,0,13).project(camera),edgePixels=(.5-edge.y*.5)*height;
  if(edgePixels<height)throw new Error(profile+' front terrain boundary visible');
  report.profiles[profile]={width,height,positionGLTF:pose.position.toArray(),targetGLTF:pose.target.toArray(),fov:pose.fov,surfaces,minimumNumeralOutlinePixels:Math.min(...glyphHeights),physicalResetPixels:[cap.right-cap.left,cap.bottom-cap.top],frontTerrainEdgePixels:edgePixels};
}
fs.writeFileSync(new URL('proofs/phone-opening-projection.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(report.profiles).map(([profile,p])=>[profile,{camera:p.positionGLTF,target:p.targetGLTF,minGlyph:p.minimumNumeralOutlinePixels,reset:p.physicalResetPixels,frontEdge:p.frontTerrainEdgePixels}])),null,2));
