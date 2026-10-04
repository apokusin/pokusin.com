// A continuously supported construction coast; the road owns the reading route.
// All state and real destinations come from the host, never from the miniature.
export function phoneOpeningPose(T,{housing,pillar,cap},width,height){
  // Joined lamp/rubber scenery is parented under the clock group. Frame the
  // actual castings instead of allowing those distant batches to shrink it.
  const bounds=[housing,pillar,cap].map(object=>new T.Box3().setFromObject(object));
  const complete=bounds[0].clone();bounds.slice(1).forEach(box=>complete.union(box));
  const target=complete.getCenter(new T.Vector3()),size=complete.getSize(new T.Vector3());
  const fov=42,aspect=width/height,tangent=Math.tan(T.MathUtils.degToRad(fov/2));
  target.y=-1;
  const rise=.6+.135*T.MathUtils.clamp((height-568)/276,0,1),run=Math.sqrt(1-rise*rise);
  const camera=new T.PerspectiveCamera(fov,aspect,.1,200),corners=[];
  for(const box of bounds)for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z])corners.push(new T.Vector3(x,y,z));
  let distance=size.x/(2*tangent*aspect)*1.09;
  const limit=1-2*14/width;
  for(let iteration=0;iteration<8;iteration++){
    camera.position.copy(target).add(new T.Vector3(0,distance*rise,distance*run));camera.lookAt(target);camera.updateMatrixWorld(true);
    const projected=corners.map(point=>point.clone().project(camera));
    const left=Math.min(...projected.map(point=>point.x)),right=Math.max(...projected.map(point=>point.x));
    const offset=(left+right)*.5,overflow=Math.max(Math.abs(left),Math.abs(right))/limit;
    target.x+=offset*distance*tangent*aspect;
    if(overflow<=1&&Math.abs(offset)<.001)break;
    if(overflow>1)distance*=overflow*1.008;
  }
  return {position:target.clone().add(new T.Vector3(0,distance*rise,distance*run)),target,fov};
}
export function phoneCoastContinuation(T,ground){
  // The closer downward phone view sees beyond the original quarry's far edge.
  // Continue its actual height field and matched UV scale with a bounded strip.
  const positions=ground.geometry.attributes.position,edge=new Map();let far=Infinity;
  for(let i=0;i<positions.count;i++)far=Math.min(far,positions.getZ(i));
  for(let i=0;i<positions.count;i++)if(Math.abs(positions.getZ(i)-far)<.001)edge.set(positions.getX(i).toFixed(4),{x:positions.getX(i),y:positions.getY(i)});
  const points=[...edge.values()].sort((a,b)=>a.x-b.x),vertices=[],uv=[],indices=[],rows=13;
  const height=(x,y)=>.10+.23*Math.sin(x*.35+y*.2)*Math.cos(y*.45)+.18*Math.sin(x*1.2+y*.4)+Math.max(0,y-6)*.038;
  for(let row=0;row<rows;row++)for(const point of points){
    const z=far-row*2,land=point.x>=-10+.8*Math.sin(-z*.6);
    const y=row===0?point.y:land?point.y+height(point.x,-z)-height(point.x,-far):-.45;
    vertices.push(point.x,y,z);uv.push(point.x/4,1+z/4);
  }
  for(let row=0;row<rows-1;row++)for(let column=0;column<points.length-1;column++){
    const a=row*points.length+column,b=a+points.length;indices.push(a,a+1,b+1,a,b+1,b);
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeTangents();
  const mesh=new T.Mesh(geometry,ground.material);mesh.name='phone_far_quarry_continuation';mesh.receiveShadow=true;return mesh;
}
export async function create(host) {
  const T=host.THREE,version=document.documentElement.dataset.artVersion||'1';
  const base='assets/concepts/tomorrows-roadworks/scene/';
  const {canvasInk,labelInk,mountArchive}=await import('../scene-gallery.js?v='+version);
  const font=new FontFace('Road Condensed',`url(${base}typography/RobotoCondensed-variable.ttf?v=${version})`,{weight:'100 900'});
  host.own({dispose(){document.fonts.delete(font);}});
  const [model,manifest]=await Promise.all([
    host.loadGLB(base+'scene.glb'),
    fetch(base+'manifest.json?v='+version).then(response=>{if(!response.ok)throw new Error('Construction coast manifest unavailable');return response.json();}),
    font.load().then(loaded=>{if(!host.disposed)document.fonts.add(loaded);})
  ]);
  const coast=model.scene;host.root.add(coast);
  const node=name=>{const object=coast.getObjectByName(name);if(!object)throw new Error('Missing authored Roadworks part: '+name);return object;};
  const sourcePosition=new T.Vector3(...manifest.camera.positionGLTF),sourceTarget=new T.Vector3(...manifest.camera.targetGLTF);
  const camera=new T.PerspectiveCamera(manifest.camera.fov,innerWidth/innerHeight,.1,200);host.useCamera(camera);
  // Contact shading follows the real construction geometry. Transparent ink,
  // hidden gesture apertures and dust never become artificial occluding slabs.
  const {SSAOPass}=await import('../assets/vendor/addons/postprocessing/SSAOPass.js');
  const contact=new SSAOPass(host.scene,camera,Math.round(innerWidth*.6),Math.round(innerHeight*.6),host.mobile?8:16);
  contact.renderToScreen=true;contact.kernelRadius=2.1;contact.minDistance=.0015;contact.maxDistance=.017;
  contact.copyMaterial.fragmentShader=contact.copyMaterial.fragmentShader.replace('gl_FragColor = opacity * texel;','gl_FragColor = vec4(mix(vec3(1.),texel.rgb,.56),texel.a);');
  host.own({dispose(){contact.ssaoMaterial.dispose();contact.noiseTexture.dispose();contact.dispose();}});
  function render(){
    host.renderer.render(host.scene,camera);
    const hidden=[];host.scene.traverse(object=>{if(object.isMesh&&object.visible&&(Array.isArray(object.material)?object.material.some(m=>m.transparent):object.material?.transparent)){hidden.push(object);object.visible=false;}});
    try{
      contact.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);
      contact.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
      contact.render(host.renderer,null,null);
    }finally{hidden.forEach(object=>{object.visible=true;});}
  }
  const target=sourceTarget.clone();
  document.documentElement.style.setProperty('--scene-utility-ink','#163752');
  document.documentElement.style.setProperty('--scene-menu-paper','#f0c8ac');
  host.renderer.toneMappingExposure=1.02;
  // Sky is atmospheric illustration only. Every foreground mass is a real volume.
  const sky=document.createElement('canvas');sky.width=1024;sky.height=1024;
  const skyContext=sky.getContext('2d'),skyGradient=skyContext.createLinearGradient(0,0,0,1024);
  skyGradient.addColorStop(0,'#88a9cc');skyGradient.addColorStop(.38,'#c3d0dc');skyGradient.addColorStop(.67,'#f7d1b5');skyGradient.addColorStop(1,'#9bb7c1');
  skyContext.fillStyle=skyGradient;skyContext.fillRect(0,0,1024,1024);
  for(const [x,y,rx,ry] of [[110,90,175,44],[640,35,205,57],[930,145,190,28],[380,185,160,28]]){
    const cloud=skyContext.createRadialGradient(x,y,0,x,y,rx);cloud.addColorStop(0,'rgba(255,224,205,.30)');cloud.addColorStop(1,'rgba(255,224,205,0)');
    skyContext.save();skyContext.translate(x,y);skyContext.scale(1,ry/rx);skyContext.translate(-x,-y);skyContext.fillStyle=cloud;skyContext.fillRect(x-rx,y-rx,rx*2,rx*2);skyContext.restore();
  }
  const skyMap=host.own(new T.CanvasTexture(sky));skyMap.colorSpace=T.SRGBColorSpace;host.scene.background=skyMap;
  host.scene.fog=new T.Fog('#bbccd2',48,115);
  coast.traverse(object=>{
    if(!object.isMesh)return;
    object.castShadow=!/^(work_|caption_|link_|clock_[dhms]$|clock_.*_unit$|again_ink|press_tally|station_number_)/.test(object.name);
    object.receiveShadow=!/^(work_|caption_|link_|again_ink|station_number_)/.test(object.name);
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.forEach(material=>{
      if(material.name==='orange_machine_enamel'){
        const enamel=host.own(new T.MeshPhysicalMaterial({color:material.color.clone(),map:material.map,normalMap:material.normalMap,normalScale:material.normalScale.clone(),roughnessMap:material.roughnessMap,roughness:material.roughness,metalness:material.metalness,clearcoat:.94,clearcoatRoughness:.055,envMapIntensity:2.35}));object.material=enamel;
      }
      if(/limestone|quarry_sediment/.test(material.name))material.envMapIntensity=.15;
      if(/concrete/.test(material.name))material.envMapIntensity=.20;
      if(material.map){material.map.anisotropy=Math.min(8,host.renderer.capabilities.getMaxAnisotropy());material.map.needsUpdate=true;}
    });
  });
  const key=new T.DirectionalLight('#ffc994',3.8);key.position.set(-22,19,14);key.target.position.set(1,1,-5);key.castShadow=true;
  key.shadow.mapSize.set(host.mobile?1024:2048,host.mobile?1024:2048);
  Object.assign(key.shadow.camera,{left:-20,right:22,top:22,bottom:-19,near:1,far:85});key.shadow.normalBias=.018;key.shadow.bias=-.00006;key.shadow.radius=2.5;key.shadow.intensity=.75;
  host.scene.add(key,key.target);
  const fill=new T.HemisphereLight('#9bbded','#845330',.72);host.scene.add(fill);
  const rim=new T.DirectionalLight('#9dbbe7',.80);rim.position.set(19,16,-18);host.scene.add(rim);
  // Broad sky and a small warm sun shape are reflected in enamel/steel; rough
  // limestone remains matte. The reflection source agrees with the light rig.
  const reflectionScene=new T.Scene();reflectionScene.background=new T.Color('#b5c5d0');
  const sunShape=host.own(new T.Mesh(new T.PlaneGeometry(16,12),new T.MeshBasicMaterial({color:new T.Color(3,2.6,1.9),side:T.DoubleSide})));
  sunShape.position.set(-16,27,12);sunShape.lookAt(0,2,0);reflectionScene.add(sunShape);
  const enamelWindow=host.own(new T.Mesh(new T.PlaneGeometry(7,13),new T.MeshBasicMaterial({color:new T.Color(3.5,3.1,2.5),side:T.DoubleSide})));
  enamelWindow.position.set(-12,13,29);enamelWindow.lookAt(-1,4,-3);reflectionScene.add(enamelWindow);
  // The camera looks down at the cap. Its curved front reflects the lower
  // foreground, so a low broad window supplies the coherent painted glint.
  const capWindow=host.own(new T.Mesh(new T.PlaneGeometry(12,3.8),new T.MeshBasicMaterial({color:new T.Color(4.2,3.9,3.4),side:T.DoubleSide})));
  capWindow.position.set(-5,-8,23);capWindow.lookAt(-1,3,-4);reflectionScene.add(capWindow);
  const waterSky=host.own(new T.Mesh(new T.PlaneGeometry(25,15),new T.MeshBasicMaterial({color:new T.Color(1.8,2.1,2.5),side:T.DoubleSide})));
  waterSky.position.set(7,25,-25);waterSky.lookAt(0,0,0);reflectionScene.add(waterSky);
  const lower=host.own(new T.Mesh(new T.PlaneGeometry(80,80),new T.MeshBasicMaterial({color:'#b48366',side:T.DoubleSide})));
  lower.rotation.x=-Math.PI/2;lower.position.y=-9;reflectionScene.add(lower);
  const pmrem=host.own(new T.PMREMGenerator(host.renderer)),reflection=host.own(pmrem.fromScene(reflectionScene,.025,.1,100));
  host.scene.environment=reflection.texture;host.scene.environmentIntensity=.36;
  const waterPhase={value:0};
  const water=node('static_pale_coastal_water');
  if(host.mobile){water.scale.x*=2;coast.add(host.own(phoneCoastContinuation(T,node('sculpted_coastal_bed'))));}
  water.material=host.own(new T.MeshPhysicalMaterial({color:'#58768b',roughness:.19,metalness:.16,clearcoat:.85,clearcoatRoughness:.12,envMapIntensity:1.15}));
  water.material.onBeforeCompile=shader=>{
    shader.uniforms.roadWaterPhase=waterPhase;
    shader.vertexShader='varying vec3 roadWaterWorld;\n'+shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nroadWaterWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader='varying vec3 roadWaterWorld;uniform float roadWaterPhase;\n'+shader.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nvec3 roadSeaNormal=inverseTransformDirection(normalize(normal),viewMatrix);\nif(roadSeaNormal.y>.7){vec2 p=roadWaterWorld.xz;float ax=.039*cos(dot(p,vec2(.48,.71))-roadWaterPhase*.21)+.017*cos(dot(p,vec2(1.38,-.63))+roadWaterPhase*.14);float az=.036*cos(dot(p,vec2(.48,.71))-roadWaterPhase*.21)-.014*cos(dot(p,vec2(1.38,-.63))+roadWaterPhase*.14);normal=normalize(mat3(viewMatrix)*normalize(vec3(-ax,1.,-az)));}');
  };
  water.material.customProgramCacheKey=()=> 'roadworks-coastal-water-v1';
  let waterTime=0;
  const sign=node('clock_sign');sign.updateWorldMatrix(true,true);
  const signCenter=new T.Vector3();sign.getWorldPosition(signCenter);
  const workLights=[-.34,0,.34].map((fraction,index)=>{
    const light=new T.PointLight('#ffcd73',25,5,2);
    if(manifest.workLampPositionsGLTF)light.position.fromArray(manifest.workLampPositionsGLTF[index]);
    else{light.position.copy(signCenter);light.position.x+=fraction*10;light.position.y+=3.2;light.position.z+=.47;}
    host.scene.add(light);return light;
  });
  const clock=host.numerals({surfaces:manifest.clock.map(node),ink:'#f7dfbf',font:`900 ${host.mobile?640:580}px "Road Condensed"`,width:512,height:640,baseline:.5});
  manifest.clock.forEach((name,index)=>labelInk(host,node(name+'_unit'),['D','H','M','S'][index],{font:`650 ${host.mobile?148:104}px "Road Condensed"`,color:'#f3dabb',width:256,height:160}));
  canvasInk(host,node(manifest.heading),(ctx,w,h)=>{ctx.fillStyle='#f3dabb';ctx.font='650 78px "Road Condensed"';ctx.letterSpacing='6px';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('NEXT COUNTDOWN',w/2,h/2,w*.95);},{width:1024,height:144});
  const actionInk=node(manifest.action),cap=node('again_cap_pivot'),capRest=cap.position.clone();
  canvasInk(host,actionInk,(ctx,w,h)=>{
    ctx.fillStyle='#fff6df';ctx.font=`600 ${host.mobile?190:118}px Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Again',w*.5,h*.50,w*.82);
  },{width:512,height:512});
  const tallyFace=node(manifest.tally);tallyFace.geometry.computeBoundingBox();
  const tallyWidth=tallyFace.geometry.boundingBox.getSize(new T.Vector3()).x;
  const arrow=tallyFace.clone();arrow.geometry=host.own(tallyFace.geometry.clone());arrow.geometry.scale(.23,1,1);arrow.geometry.translate(-tallyWidth*.37,0,0);tallyFace.parent.add(arrow);host.own(arrow);
  const tallyGeometry=host.own(tallyFace.geometry.clone());host.own(tallyFace.geometry);tallyFace.geometry=tallyGeometry;tallyGeometry.scale(.70,1,1);tallyGeometry.translate(tallyWidth*.12,0,0);
  canvasInk(host,arrow,(ctx,w,h)=>{ctx.strokeStyle='#24261f';ctx.fillStyle='#24261f';ctx.lineWidth=18;ctx.lineCap='round';ctx.beginPath();ctx.arc(w*.5,h*.5,h*.30,Math.PI*.12,Math.PI*1.66);ctx.stroke();ctx.beginPath();ctx.moveTo(w*.73,h*.08);ctx.lineTo(w*.65,h*.43);ctx.lineTo(w*.40,h*.18);ctx.closePath();ctx.fill();},{width:160,height:160,lit:true});
  const tally=host.ink(tallyFace,{ink:'#24261f',font:'700 113px "Road Condensed"',width:288,height:160,baseline:.5});
  let pressure=0,secretLift=0,secretTarget=0,frozen=false,approach=null,selected=null,selectedRecord=null,hovered=null;
  let ceremony=99,remoteAge=99,lastTally=null,dragging=false;
  const roll=node(manifest.roll),rollRest=roll.quaternion.clone(),lip=node(manifest.lip),lipRest=lip.quaternion.clone();
  const crown=node(manifest.crown),feed=node(manifest.feed),truck=node(manifest.truck),truckRest=truck.position.clone(),truckRotation=truck.quaternion.clone();
  const route=manifest.routeGLTF.map(point=>new T.Vector3(...point));
  canvasInk(host,crown,(ctx,w,h)=>{
    ctx.fillStyle='#ecd482';ctx.beginPath();ctx.moveTo(w*.19,h*.70);ctx.lineTo(w*.13,h*.25);ctx.lineTo(w*.36,h*.45);ctx.lineTo(w*.5,h*.12);ctx.lineTo(w*.64,h*.45);ctx.lineTo(w*.87,h*.25);ctx.lineTo(w*.81,h*.70);ctx.closePath();ctx.fill();ctx.fillRect(w*.19,h*.75,w*.62,h*.10);
  },{width:256,height:160,lit:true});
  crown.visible=false;
  const stations=new Map(manifest.stations.map(item=>[item.show,{...item,records:[],center:new T.Vector3()}]));
  const facesByNative=new Map(),destinationsByNative=new Map(),numberByNative=new Map();
  const layers=[],linkLayers=[],touchTargets=[],guideGeometry=host.own(new T.CylinderGeometry(.033,.033,1,8));
  const guideMaterial=host.own(new T.MeshStandardMaterial({color:'#564333',metalness:.52,roughness:.59}));
  function touchTarget(surface,binding){
    const proxy=host.own(new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide})));
    proxy.name='touch_aperture_'+surface.name;host.root.add(proxy);host.bind(proxy,binding);touchTargets.push({surface,proxy});return proxy;
  }
  function surfaceNormal(surface){
    surface.updateWorldMatrix(true,false);const normals=surface.geometry.attributes.normal,n=new T.Vector3();
    for(let i=0;i<normals.count;i++)n.add(new T.Vector3().fromBufferAttribute(normals,i));
    return n.normalize().applyMatrix3(new T.Matrix3().getNormalMatrix(surface.matrixWorld)).normalize();
  }
  function readingPose(surface,{close=false}={}){
    surface.updateWorldMatrix(true,false);
    const bounds=new T.Box3().setFromObject(surface),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
    const normal=surfaceNormal(surface),aspect=innerWidth/innerHeight,fov=host.mobile?42:manifest.camera.fov;
    const fit=Math.max(size.y,size.x/aspect),distance=fit/(2*Math.tan(T.MathUtils.degToRad(fov/2)))*(close?1.18:1.62);
    const position=center.clone().addScaledVector(normal,distance);position.y+=close?.16:Math.max(.3,size.y*.19);
    return {position,target:center,fov};
  }
  function moveTo(pose,{immediate=false,onDone=null}={}){
    if(immediate||host.reduced){approach=null;camera.position.copy(pose.position);target.copy(pose.target);camera.fov=pose.fov;camera.lookAt(target);camera.updateProjectionMatrix();onDone?.();}
    else approach={from:camera.position.clone(),fromTarget:target.clone(),fromFov:camera.fov,to:pose.position.clone(),toTarget:pose.target.clone(),fov:pose.fov,start:performance.now()/1000,duration:.72,onDone};
    host.wake();
  }
  function settleVersions(dt=1/60,immediate=false){
    const blend=immediate||host.reduced?1:1-Math.exp(-dt*9);
    for(const layer of layers){
      // One real enamel billboard telescopes above the scaffold for reading.
      // Its supports stay rooted at the authored pier; neighbouring versions
      // remain in their source positions rather than covering the front skin.
      const active=selectedRecord===layer.id;
      const desired=layer.rest.clone();if(active)desired.y+=6;
      layer.mount.position.lerp(desired,blend);
    }
    for(const link of linkLayers){
      const primary=stations.get(link.show).records[0],delta=primary.mount.position.clone().sub(primary.rest);
      link.surface.position.copy(link.rest).add(delta);
    }
    coast.updateMatrixWorld(true);
    for(const layer of layers){
      layer.guides.forEach((guide,index)=>{
        const side=index?1:-1,point=new T.Vector3(side*layer.width*.34,-layer.height*.5-.08,-.11);
        const end=point.clone().applyMatrix4(layer.mount.matrixWorld);
        const start=end.clone().sub(layer.mount.position.clone().sub(layer.rest));
        const direction=end.clone().sub(start),length=direction.length();guide.visible=length>.015;
        if(length>.015){guide.position.copy(start).add(end).multiplyScalar(.5);guide.scale.y=length;guide.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());}
      });
    }
    host.root.updateMatrixWorld(true);
  }
  function recordForSurface(surface,show){
    return layers.find(layer=>{for(let parent=surface;parent;parent=parent.parent)if(parent===layer.mount)return true;return false;})?.id||stations.get(show)?.records[0]?.id;
  }
  function stationProgress(show,surface){const id=surface?.userData.recordID;const index=id?railRecords.findIndex(r=>r.exhibit.id===id):railRecords.findIndex(r=>r.exhibit.show===show);return (index+1)/railRecords.length;}
  function selectStation(show,{surface=null,immediate=false}={}){
    if(!stations.has(show))return;
    host.scrollTo(stationProgress(show,surface));selected=show;selectedRecord=recordForSurface(surface,show);settleVersions(0,true);
    const face=surface||stations.get(show).records[0]?.surface;if(face)moveTo(readingPose(face),{immediate});
  }
  function focusSurface(surface){
    const show=surface.userData.show;
    if(show)selectStation(show,{surface,immediate:true});else moveTo(readingPose(surface),{immediate:true});
    hovered=surface;
  }
  function preview(exhibit,surface){
    selected=exhibit.show;selectedRecord=recordForSurface(surface,exhibit.show);settleVersions(0,true);hovered=surface;
    moveTo(readingPose(surface,{close:true}),{onDone:()=>host.openPreview(exhibit,{surface})});
  }
  await Promise.all(manifest.archives.map(async record=>{
    const exhibit=host.exhibits.find(item=>item.id===record.id.replaceAll('/',':'));
    if(!exhibit)throw new Error('Missing genuine archive work: '+record.id);
    const surface=node(record.screen),caption=node(record.caption),mount=node(record.mount);
    surface.userData.show=record.show;surface.userData.recordID=exhibit.id;caption.userData.show=record.show;
    await mountArchive(host,surface,exhibit);
    labelInk(host,caption,record.versionIndex===0?exhibit.showName:exhibit.label+(exhibit.live?' · LIVE':''),{font:'750 55px "Road Condensed"',color:'#2c3029',width:1024,height:128});
    const station=stations.get(record.show);station.records[record.versionIndex]={...record,exhibit,surface,mount,caption,rest:mount.position.clone()};
    if(!record.versionIndex)surface.getWorldPosition(station.center);
    const guides=[0,1].map(()=>{const guide=host.own(new T.Mesh(guideGeometry,guideMaterial));guide.castShadow=true;guide.receiveShadow=true;guide.name='telescoping_version_support_'+record.id;host.root.add(guide);return guide;});
    layers.push({id:record.id,show:record.show,index:record.versionIndex,mount,rest:mount.position.clone(),width:record.width,height:record.height,guides});
    facesByNative.set(exhibit.anchor,surface);
    const binding={native:exhibit.anchor,kind:'preview',focus:()=>focusSurface(surface),blur:()=>{if(hovered===surface)hovered=null;},hover:({active})=>{hovered=active?surface:null;host.wake();},activate:()=>preview(exhibit,surface)};
    host.bind(surface,binding);host.bind(caption,binding);
    // A small exposed index tab makes every actual version visible on the stack.
    if(record.versionIndex){
      const indexTab=host.own(new T.Mesh(new T.PlaneGeometry(.36,.44),new T.MeshBasicMaterial()));
      indexTab.name='version_index_'+record.id;indexTab.position.set(record.width/2+.18,0,.065);mount.add(indexTab);
      const uv=indexTab.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));
      canvasInk(host,indexTab,(ctx,w,h)=>{ctx.fillStyle='#daca93';ctx.fillRect(0,0,w,h);ctx.fillStyle='#292b21';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='800 130px "Road Condensed"';ctx.fillText(String(record.versionIndex+1),w/2,h/2);},{width:256,height:256,lit:true});
      host.bind(indexTab,binding);
      touchTarget(indexTab,binding);
    }
  }));
  for(const [show,station] of stations){
    const marker=node(station.marker);marker.userData.show=show;
    labelInk(host,marker,String(station.number).padStart(2,'0'),{font:'900 145px "Road Condensed"',color:'#24261e',width:256,height:320});
    const native=document.querySelector(`.shownav a[href$="#${show}"]`);
    if(native){const binding={native,kind:'station',focus:()=>selectStation(show,{immediate:true}),activate:()=>selectStation(show)};numberByNative.set(native,show);host.bind(marker,binding);touchTarget(marker,binding);}
    station.hoverLight=new T.PointLight('#ffc765',0,5,2);station.hoverLight.position.copy(station.center);station.hoverLight.position.y+=station.records[0].height*.5+.28;station.hoverLight.position.z+=.38;host.scene.add(station.hoverLight);
    // Billboard reading positions retain nearby route/supports; travel follows
    // the continuous road instead of exposing an unrelated below-scene gallery.
  }
  for(const record of manifest.destinations){
    const native=record.id.startsWith('archive/')?host.destinations.archive.find(item=>item.show===record.show)?.anchor:record.id.startsWith('timeline/')?host.destinations.timeline:host.destinations.live;
    if(!native)throw new Error('Missing genuine Roadworks destination: '+record.id);
    const surface=node(record.node);surface.userData.show=record.show;
    labelInk(host,surface,record.label,{font:'700 59px "Road Condensed"',color:'#253129',width:512,height:160});
    destinationsByNative.set(native,surface);linkLayers.push({show:record.show,surface,rest:surface.position.clone()});
    host.bind(surface,{native,kind:'link',focus:()=>focusSurface(surface),hover:({active})=>{hovered=active?surface:null;host.wake();}});
  }
  const resetBinding={native:host.dom.reset,kind:'reset',focus:()=>{opening();hovered=actionInk;},hover:({active})=>{hovered=active?actionInk:null;host.wake();},activate:host.requestReset};
  host.bind(node('again_orange_cap'),resetBinding);host.bind(node('again_convex_enamel_face'),resetBinding);host.bind(actionInk,resetBinding);
  function lift(value,{reveal=false}={}){secretTarget=value;if(reveal)host.revealSecret();host.wake();}
  host.bind(lip,{native:host.dom.secretButton,kind:'secret',focus:()=>{moveTo(readingPose(lip),{immediate:true});lift(1);},press:()=>{dragging=true;},drag:({dx})=>lift(T.MathUtils.clamp(Math.abs(dx)/75,0,1),{reveal:Math.abs(dx)>48}),cancel:()=>{dragging=false;if(secretTarget<.6)lift(0);},activate:()=>{dragging=false;lift(secretTarget>.5?0:1,{reveal:true});}});
  host.registerOccluder(coast);
  // The route's turn signs are physical arrows, rather than a second UI map.
  for(const index of [3,7,12,17,20]){
    const point=route[Math.min(index,route.length-1)],signpost=host.own(new T.Group());signpost.position.copy(point).add(new T.Vector3(-1.35,.38,0));host.root.add(signpost);
    const post=host.own(new T.Mesh(new T.CylinderGeometry(.021,.026,.75,8),new T.MeshStandardMaterial({color:'#585847',metalness:.5,roughness:.55})));post.position.y=-.02;signpost.add(post);
    const arrow=host.own(new T.Mesh(new T.PlaneGeometry(.62,.36),new T.MeshBasicMaterial()));arrow.position.set(0,.31,.025);signpost.add(arrow);
    const uv=arrow.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));
    canvasInk(host,arrow,(ctx,w,h)=>{ctx.fillStyle='#cddb32';ctx.fillRect(0,0,w,h);ctx.fillStyle='#24291a';for(let i=0;i<2;i++){const x=w*(.11+i*.40);ctx.beginPath();ctx.moveTo(x,h*.1);ctx.lineTo(x+w*.22,h*.5);ctx.lineTo(x,h*.9);ctx.lineTo(x+w*.17,h*.9);ctx.lineTo(x+w*.39,h*.5);ctx.lineTo(x+w*.17,h*.1);ctx.closePath();ctx.fill();}},{width:256,height:160,lit:true});
    signpost.userData.scenePassthrough=true;
  }
  // Dust is local and finite. A nearest-solid test prevents traces through a
  // work, road, clock or action. It never changes the route or intercepts scroll.
  const dustCount=52,dust=host.own(new T.InstancedMesh(new T.IcosahedronGeometry(.035,0),new T.MeshStandardMaterial({color:'#dcb998',transparent:true,opacity:.45,roughness:1,depthWrite:false}),dustCount));
  dust.userData.scenePassthrough=true;host.root.add(dust);
  const dustStates=Array.from({length:dustCount},()=>({point:new T.Vector3(),life:0,seed:Math.random()}));
  const dustPose=new T.Object3D(),dustRay=new T.Raycaster(),pointer=new T.Vector2();let dustIndex=0,lastPointerX=-99,lastPointerY=-99;
  for(let i=0;i<dustCount;i++){dustPose.scale.setScalar(0);dustPose.updateMatrix();dust.setMatrixAt(i,dustPose.matrix);}dust.instanceMatrix.needsUpdate=true;
  function openingPose(){
    if(!host.mobile)return {position:sourcePosition.clone(),target:sourceTarget.clone(),fov:manifest.camera.fov};
    // Phone composition follows the clock face/pressure pillar, independently
    // of the desktop island bounds. The route and its first stop remain below.
    return phoneOpeningPose(T,{housing:node('clock_cast_housing'),pillar:node('again_cast_pillar'),cap:node('again_orange_cap')},innerWidth,innerHeight);
  }
  function opening(){selected=null;selectedRecord=null;approach=null;settleVersions(0,true);moveTo(openingPose(),{immediate:true});}
  const railRecords=manifest.stations.flatMap(station=>stations.get(station.show).records);host.setScrollStops(railRecords.length+1);
  function navigation(progress){
    approach=null;hovered=null;
    if(progress<.001){opening();return;}
    const scaled=progress*railRecords.length,index=Math.min(railRecords.length-1,Math.floor(scaled)),fraction=scaled-index,blend=fraction*fraction*(3-2*fraction);
    const stop=railRecords[Math.max(0,Math.min(railRecords.length-1,Math.round(scaled)-1))];selected=stop.show;selectedRecord=stop.id;settleVersions(0,true);
    const start=index===0?openingPose():readingPose(railRecords[index-1].surface),end=readingPose(railRecords[index].surface);
    camera.position.lerpVectors(start.position,end.position,blend);target.lerpVectors(start.target,end.target,blend);camera.fov=T.MathUtils.lerp(start.fov,end.fov,blend);camera.lookAt(target);camera.updateProjectionMatrix();
  }
  function frame(time,dt){
    if(!host.reduced&&!frozen)waterTime+=dt||1/60;
    waterPhase.value=host.reduced?0:waterTime;
    const delta=dt||1/60;clock.update(time);settleVersions(delta);
    if(lastTally!==String(host.getTally())){lastTally=String(host.getTally());tally.set(lastTally,time,{spin:ceremony<.1});}tally.update(time);
    pressure=host.reduced?Number(host.pending):T.MathUtils.damp(pressure,host.pending?1:0,18,delta);cap.position.copy(capRest);cap.position.z-=pressure*.048;
    ceremony+=delta;remoteAge+=delta;
    const phase=host.reduced?1:T.MathUtils.clamp(ceremony/2.35,0,1),pulse=phase<1?Math.sin(Math.PI*phase):0;
    roll.quaternion.copy(rollRest);roll.rotateX(pulse*-.68);
    if(feed.morphTargetInfluences){feed.morphTargetInfluences[0]=pulse;if(feed.morphTargetInfluences.length>1)feed.morphTargetInfluences[1]=pulse;}
    // The single finite truck returns behind its initial pier after parking.
    if(ceremony<2.35&&!host.reduced){
      const start=5,finish=9,position=(start+phase*(finish-start)),i=Math.floor(position),fraction=position-i;
      truck.position.lerpVectors(route[i],route[Math.min(route.length-1,i+1)],fraction);
      const tangent=route[Math.min(route.length-1,i+1)].clone().sub(route[i]);truck.rotation.y=-Math.atan2(tangent.z,tangent.x);
    }else{truck.position.copy(truckRest);truck.quaternion.copy(truckRotation);}
    secretLift=host.reduced?secretTarget:T.MathUtils.damp(secretLift,secretTarget,11,delta);lip.quaternion.copy(lipRest);lip.rotateX(secretLift*-.88);crown.visible=secretLift>.58;
    workLights.forEach((light,index)=>{light.intensity=25+(remoteAge<1.1&&!host.reduced?Math.sin(remoteAge/1.1*Math.PI)*(index===1?8:3):0);});
    stations.forEach(station=>{station.hoverLight.intensity=host.reduced?(hovered?.userData.show===station.show?13:0):T.MathUtils.damp(station.hoverLight.intensity,hovered?.userData.show===station.show?13:0,12,delta);});
    if(approach&&!frozen){
      const progress=Math.min(1,(time-approach.start)/approach.duration),blend=progress*progress*(3-2*progress);
      camera.position.lerpVectors(approach.from,approach.to,blend);target.lerpVectors(approach.fromTarget,approach.toTarget,blend);camera.fov=T.MathUtils.lerp(approach.fromFov,approach.fov,blend);camera.lookAt(target);camera.updateProjectionMatrix();
      if(progress>=1){const done=approach.onDone;approach=null;done?.();}
    }
    if(!host.reduced&&!host.mobile&&!frozen&&host.pointer.active&&!host.pointer.down&&Math.hypot(host.pointer.x-lastPointerX,host.pointer.y-lastPointerY)>.015){
      lastPointerX=host.pointer.x;lastPointerY=host.pointer.y;pointer.set(lastPointerX,lastPointerY);dustRay.setFromCamera(pointer,camera);
      const hit=dustRay.intersectObject(coast,true).find(item=>item.object.material?.opacity!==0);
      if(hit?.object.name==='sculpted_coastal_bed'){
        const particle=dustStates[dustIndex++%dustCount];particle.point.copy(hit.point).add(new T.Vector3((particle.seed-.5)*.15,.045,(particle.seed-.3)*.13));particle.life=.66;
      }
    }
    let dustChanged=false;
    dustStates.forEach((particle,index)=>{
      if(particle.life<=0)return;particle.life=Math.max(0,particle.life-delta);dustPose.position.copy(particle.point);dustPose.position.y+=(.66-particle.life)*.11;dustPose.position.x+=(.66-particle.life)*(particle.seed-.5)*.12;
      dustPose.scale.setScalar(host.reduced?0:Math.sin(Math.PI*particle.life/.66)*.66);dustPose.rotation.set(particle.seed*3,particle.seed*7,0);dustPose.updateMatrix();dust.setMatrixAt(index,dustPose.matrix);dustChanged=true;
    });if(dustChanged)dust.instanceMatrix.needsUpdate=true;
    // A hovered archive lamp glows; the actual preserved image stays faithful.
    const hoveringReset=hovered===actionInk;actionInk.material.color.set(hoveringReset?'#fff2cf':'#ffffff');
    for(const {surface,proxy} of touchTargets){
      proxy.visible=host.mobile;
      if(!proxy.visible)continue;
      surface.updateWorldMatrix(true,false);const center=new T.Box3().setFromObject(surface).getCenter(new T.Vector3()),normal=surfaceNormal(surface);
      proxy.position.copy(center).addScaledVector(normal,.016);proxy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),normal);
      const depth=Math.max(.1,center.clone().sub(camera.position).dot(camera.getWorldDirection(new T.Vector3())));
      const worldHeight=2*depth*Math.tan(T.MathUtils.degToRad(camera.fov/2)),size=worldHeight/innerHeight*46;proxy.scale.set(size,size,1);
    }
  }
  opening();
  return {ready:true,frame,navigation,render,
    resize(){camera.aspect=innerWidth/innerHeight;navigation(host.progress);contact.setSize(Math.round(innerWidth*.6),Math.round(innerHeight*.6));},
    focus(native){
      if(native==='clock'){opening();return;}
      if(typeof native==='string'){selectStation(native,{immediate:true});return;}
      const surface=facesByNative.get(native)||destinationsByNative.get(native);if(surface)focusSurface(surface);
      else if(numberByNative.has(native))selectStation(numberByNative.get(native),{immediate:true});
    },
    celebrate(){clock.spin();ceremony=host.reduced?99:0;},
    remote(){clock.spin();remoteAge=0;},
    capturePose(){return {position:camera.position.toArray(),target:target.toArray(),fov:camera.fov,selected,selectedRecord,secretTarget,secretLift,ceremony,remoteAge,waterTime,pressure,hovered,layers:layers.map(layer=>layer.mount.position.toArray())};},
    restorePose(pose){if(!pose)return;approach=null;selected=pose.selected;selectedRecord=pose.selectedRecord;secretTarget=pose.secretTarget;secretLift=pose.secretLift;ceremony=pose.ceremony;remoteAge=pose.remoteAge;waterTime=pose.waterTime;pressure=pose.pressure;hovered=pose.hovered;camera.position.fromArray(pose.position);target.fromArray(pose.target);camera.fov=pose.fov;layers.forEach((layer,index)=>layer.mount.position.fromArray(pose.layers[index]));settleVersions(0);camera.lookAt(target);camera.updateProjectionMatrix();},
    freeze(value){frozen=value;},cancelApproach(){approach=null;},cancelInput(reason){dragging=false;if(secretTarget<.6)secretTarget=0;if(['blur','visibility','pagehide','graphics'].includes(reason))approach=null;},
    reducedMotion(value){if(value){const travel=approach;approach=null;if(travel){camera.position.copy(travel.to);target.copy(travel.toTarget);camera.fov=travel.fov;camera.lookAt(target);camera.updateProjectionMatrix();travel.onDone?.();}ceremony=99;secretLift=secretTarget;settleVersions(0,true);}clock.update();},
    dispose(){clock.dispose();tally.dispose();}
  };
}
