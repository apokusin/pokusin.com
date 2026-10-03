// The installation owns its room, mechanics and camera. The host owns real actions.
export async function create(host) {
  const T=host.THREE, version=document.documentElement.dataset.artVersion;
  const {canvasInk,mountArchive,labelInk}=await import('../scene-gallery.js?v='+version);
  const base='assets/concepts/held-in-suspense/scene/';
  const mobileSuffix=host.mobile?'-mobile':'';
  const [model,manifest]=await Promise.all([
    host.loadGLB(base+'scene'+mobileSuffix+'.glb'),
    fetch(base+'manifest'+mobileSuffix+'.json?v='+version).then(r=>{if(!r.ok)throw new Error('Missing installation manifest');return r.json();}),
    document.fonts.load('500 100px "Barlow Condensed"'),
    document.fonts.load('400 100px "Cormorant Garamond"')
  ]);
  const installation=model.scene;host.root.add(installation);
  const node=name=>{const object=installation.getObjectByName(name);if(!object)throw new Error('Missing authored node: '+name);return object;};
  host.scene.background=new T.Color('#efefea');
  host.renderer.toneMappingExposure=1.16;
  host.renderer.shadowMap.type=T.PCFSoftShadowMap;
  document.documentElement.style.setProperty('--scene-utility-ink','#222526');
  document.documentElement.style.setProperty('--scene-menu-paper','#efefea');
  installation.traverse(object=>{if(object.isMesh){object.castShadow=!object.name.includes('luminous')&&!object.name.includes('front_room_window')&&!object.name.includes('floor');object.receiveShadow=true;}});
  const key=new T.DirectionalLight('#fff7e8',2.5);key.position.set(-13.8,11.5,5);key.target.position.set(1,3,0);
  key.castShadow=true;key.shadow.mapSize.set(2048,2048);
  Object.assign(key.shadow.camera,{left:-16,right:16,top:15,bottom:-8,near:.5,far:60});
  key.shadow.bias=-.00015;key.shadow.normalBias=.025;key.shadow.radius=4;key.shadow.blurSamples=8;key.shadow.intensity=.42;host.scene.add(key,key.target);
  host.scene.add(new T.HemisphereLight('#f5f5ef','#c3b8a6',.82));
  const fill=new T.DirectionalLight('#d7e7ff',.18);fill.position.set(7,6,-8);host.scene.add(fill);
  const grazing=new T.DirectionalLight('#fff4df',.55);grazing.position.set(-5,10,18);grazing.target.position.set(2,3,0);host.scene.add(grazing,grazing.target);
  // Reflect the complete room. In particular the inclined cap sees the pale
  // floor, while the curved body sweeps through windows, plaster and mullions.
  // Capturing windows alone leaves those directions as a dark empty world.
  const environmentScene=new T.Scene();environmentScene.background=new T.Color(.62,.60,.56);
  const room=node('reflection_room').clone(true);
  room.traverse(object=>{if(object.isMesh&&object.material.name==='architectural_daylight'){object.material=host.own(object.material.clone());object.material.emissiveIntensity=4.2;}});
  environmentScene.add(room);
  environmentScene.add(node('limestone_floor').clone(true),node('rear_plaster_wall').clone(true));
  const plasterRadiance=host.own(new T.MeshBasicMaterial({color:new T.Color(.78,.76,.70)}));
  function roomReturn(name,size,position) {
    const surface=host.own(new T.Mesh(new T.BoxGeometry(...size),plasterRadiance));
    surface.name=name;surface.position.set(...position);environmentScene.add(surface);
    return surface;
  }
  roomReturn('reflection_side_plaster',[.2,18,54],[-12.6,8.8,21]);
  roomReturn('reflection_right_plaster',[.2,18,54],[18,8.8,21]);
  roomReturn('reflection_ceiling',[31,.2,54],[2.7,17.7,21]);
  environmentScene.add(new T.HemisphereLight('#fffef6','#c1b4a0',1));
  const envLight=new T.DirectionalLight('#fff4df',2.5);envLight.position.copy(key.position);envLight.target.position.copy(key.target.position);environmentScene.add(envLight,envLight.target);
  const pmrem=host.own(new T.PMREMGenerator(host.renderer));
  const reflection=host.own(pmrem.fromScene(environmentScene,.006,.1,100,{size:256,position:new T.Vector3(2.3,4.3,1)}));
  host.scene.environment=reflection.texture;host.scene.environmentIntensity=1;
  // The weight's mirror finish needs the local architectural parallax. Sampling
  // at the clock/arm center would move the narrow window reflections off its cap.
  installation.updateMatrixWorld(true);
  const weightCenter=new T.Box3().setFromObject(node('reset_body')).getCenter(new T.Vector3());
  // A studio flag gives the inclined mirror cap a readable dark/light edge.
  // It lives in the reflection room, beyond the sculpture's camera framing.
  const flag=host.own(new T.Mesh(new T.PlaneGeometry(4.4,8),new T.MeshBasicMaterial({color:'#191b1e',side:T.DoubleSide})));
  flag.position.copy(weightCenter).add(new T.Vector3(8,-3,10));flag.lookAt(weightCenter);environmentScene.add(flag);
  const reflectedStrip=host.own(new T.Mesh(new T.PlaneGeometry(1.1,8),new T.MeshBasicMaterial({color:new T.Color(2.6,2.5,2.3),side:T.DoubleSide})));
  reflectedStrip.position.copy(flag.position).add(new T.Vector3(-1.2,.1,-.1));reflectedStrip.quaternion.copy(flag.quaternion);environmentScene.add(reflectedStrip);
  const weightReflection=host.own(pmrem.fromScene(environmentScene,.003,.1,100,{size:512,position:weightCenter}));
  node('weight_pivot').traverse(object=>{
    if(!object.isMesh||!['polished_bevels_and_collars','satin_brushed_steel'].includes(object.material.name))return;
    object.material=host.own(object.material.clone());object.material.envMap=weightReflection.texture;
    object.material.envMapIntensity=1.1;object.material.needsUpdate=true;
  });
  pmrem.dispose(); // The two room captures are static; release the convolution work targets.
  const {Reflector}=await import('../assets/vendor/addons/objects/Reflector.js?v='+version);
  const reflectionShader={uniforms:T.UniformsUtils.clone(Reflector.ReflectorShader.uniforms),
    vertexShader:Reflector.ReflectorShader.vertexShader,
    fragmentShader:Reflector.ReflectorShader.fragmentShader.replace(
      'vec4 base = texture2DProj( tDiffuse, vUv );',
      `vec2 uv = vUv.xy / vUv.w;
       vec2 texel = vec2(0.0026);
       vec4 base = texture2D(tDiffuse,uv) * .28;
       base += texture2D(tDiffuse,uv+vec2(texel.x,0.0))*.12;
       base += texture2D(tDiffuse,uv-vec2(texel.x,0.0))*.12;
       base += texture2D(tDiffuse,uv+vec2(0.0,texel.y))*.12;
       base += texture2D(tDiffuse,uv-vec2(0.0,texel.y))*.12;
       base += texture2D(tDiffuse,uv+texel)*.06;
       base += texture2D(tDiffuse,uv-texel)*.06;
       base += texture2D(tDiffuse,uv+vec2(texel.x,-texel.y))*.06;
       base += texture2D(tDiffuse,uv+vec2(-texel.x,texel.y))*.06;`).replace(
      'gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',
      'gl_FragColor = vec4( base.rgb, 0.065 );')};
  const floorReflection=new Reflector(new T.PlaneGeometry(70,70),{shader:reflectionShader,textureWidth:768,textureHeight:768,multisample:0,clipBias:.001});
  floorReflection.rotation.x=-Math.PI/2;floorReflection.position.y=.006;
  floorReflection.material.transparent=true;floorReflection.material.depthWrite=false;
  floorReflection.userData.scenePassthrough=true;host.root.add(floorReflection);
  host.own(floorReflection);host.own(floorReflection.getRenderTarget());
  const camera=new T.PerspectiveCamera(30,innerWidth/innerHeight,.1,200);
  host.useCamera(camera);
  const target=new T.Vector3(...manifest.camera.targetGLTF);
  const sourcePosition=new T.Vector3(...manifest.camera.positionGLTF);
  const readingSurfaces=['d','h','m','s'].map(unit=>node('clock_'+unit));
  const clock=host.numerals({surfaces:readingSurfaces,ink:'#151616',font:'500 740px "Barlow Condensed"',width:512,height:1024,baseline:.46});
  // Unit captions occupy their own ink faces; they do not participate in slot motion.
  readingSurfaces.forEach((surface,i)=>{
    const caption=new T.Mesh(surface.geometry.clone(),new T.MeshBasicMaterial());
    caption.name='unit_caption_'+i;caption.position.copy(surface.position);caption.quaternion.copy(surface.quaternion);caption.scale.copy(surface.scale);
    surface.parent.add(caption);host.own(caption);
    caption.translateZ(.004);
    canvasInk(host,caption,(ctx,w,h)=>{ctx.font='400 '+(host.mobile?118:85)+'px "Barlow Condensed"';ctx.fillStyle='#101112';ctx.textAlign='center';ctx.fillText(['D','H','M','S'][i],w/2,h*.91);},{width:512,height:1024});
  });
  const weight=node('weight_pivot'), weightRest=weight.position.clone();
  const reset=node('reset_ink'), secretFlange=node('secret_flange_pivot');
  let pendingPressure=0, secretLift=0, focusMesh=null, approach=null, frozen=false, ceremonyElapsed=4;
  canvasInk(host,reset,(ctx,w,h)=>{
    ctx.fillStyle='#080909';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='400 '+(host.mobile?142:105)+'px "Cormorant Garamond"';ctx.fillText('Again',w/2,h*.40,w*.72);
    ctx.beginPath();ctx.arc(w*.48,h*.66,8,0,Math.PI*2);ctx.arc(w*.53,h*.66,8,0,Math.PI*2);ctx.fill();
    ctx.fillRect(w*.47,h*.69,11,22);ctx.fillRect(w*.52,h*.69,11,22);
  },{width:512,height:512,lit:true});
  const tally=host.ink(node('reset_tally'),{font:'400 112px "Barlow Condensed"',width:640,height:160,baseline:.53,ink:'#080909'});
  const assemblies=['d','h','m','s'].map(unit=>node('clock_'+unit+'_pivot'));
  const restRotations=assemblies.map(object=>object.rotation.clone());
  installation.updateMatrixWorld(true);
  const loadCables=[];
  installation.traverse(object=>{
    if(!object.isMesh||!/^weight_load_cable_\d/.test(object.name))return;
    const positions=object.geometry.attributes.position,rest=positions.array.slice(),factors=new Float32Array(positions.count);
    const worldPoints=Array.from({length:positions.count},(_,i)=>new T.Vector3().fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld));
    const top=Math.max(...worldPoints.map(p=>p.y)),bottom=Math.min(...worldPoints.map(p=>p.y));
    worldPoints.forEach((p,i)=>{factors[i]=T.MathUtils.clamp((top-p.y)/(top-bottom),0,1);});
    const inverse=new T.Matrix4().copy(object.matrixWorld).invert(),localUp=new T.Vector3(0,1,0).transformDirection(inverse);
    loadCables.push({object,positions,rest,factors,localUp});
  });
  const pulleys=['upper_pulley','lower_pulley'].map(name=>{const object=node(name);return{object,rotation:object.rotation.clone()};});
  function updateLoad() {
    const movement=weight.position.y-weightRest.y;
    for(const cable of loadCables){
      const {positions,rest,factors,localUp}=cable;
      for(let i=0;i<positions.count;i++)positions.setXYZ(i,rest[i*3]+localUp.x*movement*factors[i],rest[i*3+1]+localUp.y*movement*factors[i],rest[i*3+2]+localUp.z*movement*factors[i]);
      positions.needsUpdate=true;
    }
    pulleys.forEach((p,i)=>{p.object.rotation.copy(p.rotation);p.object.rotation.z+=movement/(i?.23:.20);});
  }
  const exhibits=new Map(), destinations=new Map(), stations=new Map(), layers=[];
  const stationOrder=["severance","dexter","got","sherlock","archer","breaking-bad","house-of-cards"];
  let activeStation=null;
  const firstNames={dexter:'archive_dexter_screen',severance:'archive_severance_screen',got:'archive_got_screen'};
  const firstRecords={dexter:host.exhibits.find(e=>e.show==='dexter'),severance:host.exhibits.find(e=>e.show==='severance'),got:host.exhibits.find(e=>e.show==='got')};
  function aimAt(surface,{immediate=false}={}) {
    surface.updateWorldMatrix(true,false);
    const point=new T.Vector3();surface.getWorldPosition(point);
    const normals=surface.geometry.getAttribute('normal'),normal=new T.Vector3();
    for(let i=0;i<normals.count;i++)normal.add(new T.Vector3().fromBufferAttribute(normals,i));
    normal.normalize().applyMatrix3(new T.Matrix3().getNormalMatrix(surface.matrixWorld)).normalize();
    const bounds=new T.Box3().setFromObject(surface), size=bounds.getSize(new T.Vector3());
    const aspect=innerWidth/innerHeight;
    const distance=Math.max(size.y/Math.tan(T.MathUtils.degToRad(camera.fov/2)),size.x/(aspect*Math.tan(T.MathUtils.degToRad(camera.fov/2))))*.56+.55;
    const next=clearReadingPosition(surface,point,normal,distance);
    if(immediate||host.reduced){camera.position.copy(next);target.copy(point);camera.lookAt(target);approach=null;}
    else approach={from:camera.position.clone(),to:next,fromTarget:target.clone(),toTarget:point,start:performance.now()/1000,duration:.65,onDone:null};
    host.wake();
  }
  const clearanceRay=new T.Raycaster(),clearanceDirection=new T.Vector3();
  function clearReadingPosition(surface,point,normal,distance) {
    // The portrait mounts overlap in depth. Choose a real side of the assembly
    // from which its entire aperture is visible, using the actual solid meshes.
    const uv=surface.geometry.attributes.uv,positions=surface.geometry.attributes.position;
    const samples=[];
    const gridCount=positions.count>16?9:3;
    const grid=Array.from({length:gridCount},(_,i)=>.025+.95*i/(gridCount-1));
    for(const u of grid)for(const v of grid){
      let nearest=0,error=Infinity;
      for(let i=0;i<uv.count;i++){const e=(uv.getX(i)-u)**2+(uv.getY(i)-v)**2;if(e<error){error=e;nearest=i;}}
      samples.push(new T.Vector3().fromBufferAttribute(positions,nearest).applyMatrix4(surface.matrixWorld));
    }
    const solids=[];host.root.updateMatrixWorld(true);
    host.root.traverse(o=>{if(!o.isMesh||o===surface||o.userData.scenePassthrough||!o.visible)return;
      const material=Array.isArray(o.material)?o.material[0]:o.material;
      if(!material?.transparent||material.opacity>.45)solids.push(o);
    });
    let best=null,bestHits=Infinity,bestBlockers=[];
    const preferred=point.x>=0?1:-1;
    for(const yaw of [0,preferred*6,-preferred*6,preferred*12,-preferred*12,preferred*18,-preferred*18,preferred*24,-preferred*24,preferred*30,-preferred*30,preferred*36,-preferred*36,preferred*48,-preferred*48,preferred*60,-preferred*60]){
      const direction=normal.clone().applyAxisAngle(new T.Vector3(0,1,0),T.MathUtils.degToRad(yaw));
      const candidate=point.clone().addScaledVector(direction,distance);
      let blocked=0,blockers=[];
      for(const sample of samples){
        clearanceDirection.copy(sample).sub(candidate);clearanceRay.near=.1;clearanceRay.far=clearanceDirection.length()-.025;
        clearanceRay.set(candidate,clearanceDirection.normalize());
        const hits=clearanceRay.intersectObjects(solids,false);if(hits.length){blocked++;blockers.push({node:hits[0].object.name,hit:hits[0].point.toArray(),target:sample.toArray()});}
      }
      if(blocked<bestHits){bestHits=blocked;best=candidate;bestBlockers=blockers;}
      if(!blocked)break;
    }
    surface.userData.readingClearance={blocked:bestHits,samples:samples.length,blockers:bestBlockers,position:best.toArray(),normal:normal.toArray(),center:point.toArray()};
    return best;
  }
  function focusSurface(surface) {
    if(!surface)return;
    const show=surface.userData.show;
    if(show){const main=surface.userData.exhibit||host.exhibits.find(e=>e.show===show);host.scrollTo((railRecords.indexOf(main)+1)/railRecords.length);activeStation=show;settleLayers(1);}
    focusMesh=surface;surface.userData.focusUntil=Infinity;aimAt(surface,{immediate:true});
  }
  async function preview(exhibit,surface) {
    focusMesh=surface;
    if(host.reduced){aimAt(surface,{immediate:true});host.openPreview(exhibit,{surface});return;}
    aimAt(surface);
    approach.onDone=()=>host.openPreview(exhibit,{surface});
  }
  function bindWork(surface,exhibit) {
    exhibits.set(exhibit.anchor,surface);surface.userData.show=exhibit.show;surface.userData.exhibit=exhibit;
    host.bind(surface,{native:exhibit.anchor,kind:'preview',
      hover:({active})=>{if(active)focusMesh=surface;else if(document.activeElement!==exhibit.anchor&&focusMesh===surface)focusMesh=null;host.wake();},
      blur:()=>{if(document.activeElement!==exhibit.anchor&&focusMesh===surface)focusMesh=null;},
      focus:()=>focusSurface(surface),activate:()=>preview(exhibit,surface)});
  }
  await Promise.all(Object.entries(firstNames).map(async([show,name])=>{
    const surface=node(name),record=firstRecords[show];
    await mountArchive(host,surface,record);
    bindWork(surface,record);
  }));
  const resetBinding={native:host.dom.reset,kind:'reset',focus:()=>{opening();focusMesh=reset;},activate:host.requestReset};
  // Every part of the inked endcap shares the action. A tally skin must not
  // become an unbound solid blocking the actual button underneath it.
  // The cylinder wall belongs to the same physical press, including oblique
  // taps just above the cap where its solid body is the nearest ray hit.
  host.bind(node('reset_body'),resetBinding);host.bind(node('reset_tally'),resetBinding);host.bind(reset,resetBinding);host.bind(node('reset_face'),resetBinding);
  host.bind(node('secret_flange'),{native:host.dom.secretButton,kind:'secret',
    focus:()=>{opening();secretLift=1;focusMesh=node('secret_flange');},
    activate:()=>{secretLift=secretLift?0:1;host.revealSecret();host.wake();}});
  // A subtle real geometry focus outline follows each face, never a screen-space pin.
  const outline=host.own(new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#a8783b',transparent:true,opacity:.8,depthTest:false})));
  let outlineSource=null;outline.matrixAutoUpdate=false;
  host.root.add(outline);outline.visible=false;outline.userData.scenePassthrough=true;
  // Each show is a mechanically connected plate cassette. Later versions sit
  // behind its front plate and fan only when that station is deliberately read.
  const steel=node('folded_lower_arm').material;
  const cableMaterial=host.own(new T.MeshStandardMaterial({color:'#25282a',metalness:.6,roughness:.34}));
  const cableGeometry=host.own(new T.CylinderGeometry(.013,.013,1,8));
  function tensionCable(start,end) {
    const wire=host.own(new T.Mesh(cableGeometry,cableMaterial));
    wire.name='cassette_tension_wire';
    wire.position.copy(start).add(end).multiplyScalar(.5);
    const direction=end.clone().sub(start);wire.scale.y=direction.length();
    wire.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());
    wire.castShadow=true;host.root.add(wire);return wire;
  }
  function framedPlate(template,w,h) {
    const group=host.own(new T.Group());
    const face=template.clone();face.geometry=template.geometry.clone();face.material=template.material.clone();
    face.position.set(0,0,.061);face.quaternion.identity();face.scale.set(1,1,1);
    face.geometry.computeBoundingBox();const b=face.geometry.boundingBox,size=b.getSize(new T.Vector3());
    face.geometry.translate(-b.getCenter(new T.Vector3()).x,-b.getCenter(new T.Vector3()).y,-b.getCenter(new T.Vector3()).z);
    face.scale.set(w/size.x,h/size.y,1);group.add(face);
    // Reuse the authored beveled plate, retaining its edge profile and brushed UVs.
    const back=node('archive_dexter_back').clone();back.geometry=back.geometry.clone();back.material=steel;
    back.position.set(0,0,0);back.quaternion.identity();back.geometry.computeBoundingBox();
    const dimensions=back.geometry.boundingBox.getSize(new T.Vector3());back.scale.set((w+.10)/dimensions.x,(h+.10)/dimensions.y,1);back.castShadow=true;back.receiveShadow=true;group.add(back);
    for(const x of [-w*.32,w*.32]) {
      const eye=new T.Mesh(new T.TorusGeometry(.046,.015,8,12),steel);eye.position.set(x,h/2+.065,0);group.add(eye);
    }
    host.root.add(group);return {group,face};
  }
  const templates=Object.values(firstNames).map(node);
  const sizes=[[2.6,2],[2.25,1.7],[2.25,1.8],[2.3,1.5],[2.2,1.5],[2.7,1.9],[1.95,1.65]];
  const full=new URLSearchParams(location.search).get('assetGate')!=='1';
  for(let groupIndex=0;groupIndex<stationOrder.length;groupIndex++){
    const show=stationOrder[groupIndex],records=host.exhibits.filter(e=>e.show===show),[w,h]=sizes[groupIndex];
    const main=firstNames[show]?node(firstNames[show]):null;
    const station={show,faces:[],center:new T.Vector3()};stations.set(show,station);
    if(main){main.getWorldPosition(station.center);station.faces.push(main);}
    else station.center.set(9+(groupIndex-3)*5.8,5.8+(groupIndex%2)*1.1,-1.6-(groupIndex-3)*.6);
    if(!full)continue;
    for(let index=0;index<records.length;index++){
      const record=records[index];if(exhibits.has(record.anchor))continue;
      const {group,face}=framedPlate(templates[groupIndex%3],w,h);
      group.name='cassette_'+record.id;face.name='reading_'+record.id;
      group.position.copy(station.center);group.position.x+=index*.07;group.position.y-=index*.065;group.position.z-=.14*index;
      if(main)group.quaternion.copy(main.parent.getWorldQuaternion(new T.Quaternion()));
      else{group.rotation.y=-.10-(groupIndex%2)*.07;group.rotation.z=groupIndex%2?-.03:.04;}
      const rest=group.position.clone(),spread=rest.clone().add(new T.Vector3(index*(w+.34),index*.1,index*1.2));
      const layer={show,group,rest,spread,face,w,h,index,cables:[],supports:[]};layers.push(layer);
      group.updateWorldMatrix(true,true);
      const railY=group.position.y+h*.5+1.22;
      for(const x of [-w*.32,w*.32]){
        const eye=new T.Vector3(x,h*.5+.10,0).applyMatrix4(group.matrixWorld);
        const attachment=new T.Vector3(eye.x,railY,eye.z-.05);
        layer.cables.push({wire:tensionCable(eye,attachment),attachment,x});
        const support=tensionCable(attachment,new T.Vector3(attachment.x+.01,attachment.y,attachment.z));support.name='cassette_fan_support_'+record.id;support.material=steel;support.scale.x=5;support.scale.z=5;layer.supports.push({mesh:support,anchor:attachment.clone()});
      }
      if(!main){
        const rail=node('upper_balance_arm').clone();rail.geometry=rail.geometry.clone();rail.material=steel;
        rail.geometry.computeBoundingBox();const bounds=rail.geometry.boundingBox,center=bounds.getCenter(new T.Vector3()),extent=bounds.getSize(new T.Vector3());
        rail.geometry.translate(-center.x,-center.y,-center.z);rail.scale.set(6.2/extent.x,.28/extent.y,1);
        rail.position.set(group.position.x-1,railY,group.position.z-.05);rail.castShadow=true;host.root.add(rail);host.own(rail);
      }
      await mountArchive(host,face,record);bindWork(face,record);station.faces.push(face);host.registerOccluder(group);
      const lip=host.own(new T.Mesh(new T.PlaneGeometry(.32,.16),new T.MeshBasicMaterial()));
      const uv=lip.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));
      lip.position.set(w*.5+.17,-h*.5+.09,.06);group.add(lip);
      labelInk(host,lip,String(index+1),{width:128,height:64,font:'500 43px "Barlow Condensed"'});
      host.bind(lip,{native:record.anchor,kind:'preview',focus:()=>focusSurface(face),activate:()=>{focusSurface(face);return preview(record,face);}});
    }
    const extras=host.destinations.archive.filter(d=>d.show===show);
    if(show==='dexter'&&host.destinations.timeline)extras.push({anchor:host.destinations.timeline,label:'Timeline'});
    if(show==='severance'&&host.destinations.live)extras.push({anchor:host.destinations.live,label:'Live ↗'});
    for(let i=0;i<extras.length;i++){
      const dest=extras[i],tab=host.own(new T.Mesh(new T.PlaneGeometry(.65,.27),new T.MeshBasicMaterial()));
      tab.name='destination_'+show+'_'+i;
      const uv=tab.geometry.attributes.uv;for(let j=0;j<uv.count;j++)uv.setY(j,1-uv.getY(j));
      const actualHeight=main?new T.Box3().setFromObject(main).getSize(new T.Vector3()).y:h;
      tab.position.copy(station.center).add(new T.Vector3(.4+i*.72,-actualHeight/2-.34,.14));tab.userData.show=show;host.root.add(tab);
      labelInk(host,tab,dest.label||'Archive ↗',{width:512,height:160,font:'500 70px "Barlow Condensed"'});
      destinations.set(dest.anchor,tab);host.bind(tab,{native:dest.anchor,kind:'link',focus:()=>focusSurface(tab)});
    }
  }
  function updateLayerRig(layer) {
      layer.group.updateWorldMatrix(true,true);
      const displacement=layer.group.position.clone().sub(layer.rest);
      for(const support of layer.supports){const end=support.anchor.clone().add(displacement);support.mesh.position.copy(support.anchor).add(end).multiplyScalar(.5);const direction=end.sub(support.anchor);support.mesh.scale.y=Math.max(.01,direction.length());support.mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.length()>.001?direction.normalize():new T.Vector3(1,0,0));}
      for(const cable of layer.cables){
        const eye=new T.Vector3(cable.x,layer.h*.5+.10,0).applyMatrix4(layer.group.matrixWorld);
        const attachment=cable.attachment.clone().add(displacement);attachment.x=eye.x;
        cable.wire.position.copy(eye).add(attachment).multiplyScalar(.5);
        const direction=attachment.sub(eye);cable.wire.scale.y=direction.length();cable.wire.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());
      }
  }
  function settleLayers(dt) {
    if(frozen)return;
    for(const layer of layers){
      const goal=activeStation===layer.show?layer.spread:layer.rest;
      layer.group.position.lerp(goal,host.reduced||dt===1?1:1-Math.exp(-dt*8));updateLayerRig(layer);
    }
  }
  // The source's seven quiet notches are a direct station route, with native URLs.
  const indexNav=document.createElement('nav');indexNav.setAttribute('aria-label','Suspended stations');
  indexNav.style.cssText='position:fixed;z-index:25;left:'+(host.mobile?'3px':'24px')+';top:15%;display:grid;gap:'+(host.mobile?'7px':'14px');
  host.stage.append(indexNav);host.own({dispose(){indexNav.remove();}});
  stationOrder.forEach((show,i)=>{
    const link=document.createElement('a');link.href='#'+show;link.setAttribute('aria-label',host.groups.find(g=>g.id===show).name);
    link.style.cssText='display:grid;place-items:center;width:44px;height:44px;color:#242525;text-decoration:none';
    const mark=document.createElement('span');mark.style.cssText='width:10px;height:2px;background:currentColor;transition:width .2s';link.append(mark);indexNav.append(link);
    host.on(link,'click',event=>{event.preventDefault();const main=host.exhibits.find(e=>e.show===show);host.scrollTo((railRecords.indexOf(main)+1)/railRecords.length);activeStation=show;settleLayers(1);const face=stations.get(show)?.faces[0];if(face)aimAt(face);});
    host.on(link,'focus',()=>{mark.style.transition=host.reduced?'none':'width .2s';mark.style.width='22px';});host.on(link,'blur',()=>{mark.style.transition=host.reduced?'none':'width .2s';mark.style.width='10px';});
  });
  host.registerOccluder(installation);
  // Small faceted steel shavings form a real floor patch, stirred only nearby.
  let seed=31781;
  const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const filingCount=4600,filingPositions=new Float32Array(filingCount*3),filingSizes=new Float32Array(filingCount);
  const filings=host.own(new T.InstancedMesh(new T.OctahedronGeometry(1,0),new T.MeshStandardMaterial({color:'#262b2c',metalness:.64,roughness:.61}),filingCount));
  const filingPose=new T.Object3D();
  for(let i=0;i<filingCount;i++){
    const trail=i<1100,a=random()*Math.PI*2,r=Math.pow(random(),.8)*(host.mobile?1.35:2.4);
    filingPositions[i*3]=trail?(host.mobile?-3.7+random()*6.7:-5+random()*10):(host.mobile?2.52:5.4)+Math.cos(a)*r*1.45;
    filingPositions[i*3+1]=.011+random()*.015;
    filingPositions[i*3+2]=trail?(.4+random()*.18):(host.mobile?1.45:1.65)+Math.sin(a)*r*.65;
    filingSizes[i]=.005+Math.pow(random(),3)*.027;
    filingPose.position.fromArray(filingPositions,i*3);filingPose.rotation.set(random()*2,random()*3,random()*2);
    filingPose.scale.setScalar(filingSizes[i]);filingPose.updateMatrix();filings.setMatrixAt(i,filingPose.matrix);
  }
  filings.instanceMatrix.needsUpdate=true;filings.receiveShadow=true;filings.userData.scenePassthrough=true;host.root.add(filings);
  const filingRestMatrices=filings.instanceMatrix.array.slice();
  const floorRay=new T.Raycaster(),floorPoint=new T.Vector3(),pointerVector=new T.Vector2(),floorPlane=new T.Plane(new T.Vector3(0,1,0),0);
  let filingsDisturbed=false,filingRelax=0;
  const railRecords=stationOrder.flatMap(show=>host.exhibits.filter(e=>e.show===show));host.setScrollStops(railRecords.length+1);
  function opening() {
    approach=null;focusMesh=null;activeStation=null;
    camera.fov=manifest.camera.yfovDegrees||model.cameras[0]?.fov||30;
    if(host.mobile){
      target.set(...manifest.camera.targetGLTF);
      const direction=sourcePosition.clone().sub(target).normalize(),aspect=innerWidth/innerHeight;
      const distance=Math.max(manifest.camera.fitWidth/aspect,manifest.camera.fitHeight)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));
      camera.position.copy(target).addScaledVector(direction,distance);
    }else{
      camera.fov=model.cameras[0]?.fov||30;camera.position.copy(sourcePosition);target.set(...manifest.camera.targetGLTF);
    }
    camera.lookAt(target);camera.updateProjectionMatrix();
  }
  function navigation(progress) {
    approach=null;focusMesh=null;
    if(progress<.001){opening();return;}
    const record=railRecords[Math.max(0,Math.min(railRecords.length-1,Math.round(progress*railRecords.length)-1))];activeStation=record.show;settleLayers(1);
    const surface=exhibits.get(record.anchor);if(surface)aimAt(surface,{immediate:true});
  }
  function frame(time,dt) {
    clock.update(time);tally.set(host.getTally(),time);tally.update(time);settleLayers(dt||1/60);
    if(!frozen){
    pendingPressure=host.reduced?(host.pending?1:0):T.MathUtils.damp(pendingPressure,host.pending?1:0,15,dt||1/60);
    if(!host.reduced)ceremonyElapsed+=dt||0;
    const age=ceremonyElapsed;
    const impulse=host.reduced||age>3?0:Math.sin(age*8.5)*Math.exp(-age*1.65);
    weight.position.copy(weightRest);weight.position.y-=impulse*.17+pendingPressure*.032;
    updateLoad();
    assemblies.forEach((assembly,i)=>{assembly.rotation.copy(restRotations[i]);assembly.rotation.z+=impulse*.018*Math.sin(i*.7+age);});
    secretFlange.rotation.x=host.reduced?(secretLift?-.8:0):T.MathUtils.damp(secretFlange.rotation.x,secretLift?-.8:0,10,dt||1/60);
    }
    if(approach&&!frozen){
      const phase=Math.min(1,(time-approach.start)/approach.duration),ease=phase*phase*(3-2*phase);
      camera.position.lerpVectors(approach.from,approach.to,ease);target.lerpVectors(approach.fromTarget,approach.toTarget,ease);camera.lookAt(target);
      if(phase>=1){const complete=approach.onDone;approach=null;complete?.();}
    }
    let attracting=false;
    if(!host.reduced&&host.pointer.active&&!frozen){
      pointerVector.set(host.pointer.x,host.pointer.y);floorRay.setFromCamera(pointerVector,camera);
      if(floorRay.ray.intersectPlane(floorPlane,floorPoint)&&floorPoint.x>(host.mobile?-.7:2.5)&&floorPoint.x<(host.mobile?4.3:9)&&floorPoint.z>-.5&&floorPoint.z<4){
        attracting=true;filingsDisturbed=true;filingRelax=1;
        for(let i=1100;i<filingCount;i++){
          filingPose.position.fromArray(filingPositions,i*3);
          const dx=floorPoint.x-filingPose.position.x,dz=floorPoint.z-filingPose.position.z,d=Math.hypot(dx,dz),force=Math.exp(-d*d*5)*.13;
          filingPose.position.x+=dx*force;filingPose.position.z+=dz*force;
          filingPose.position.y+=force*Math.sin(i*13.73);
          filingPose.rotation.set(.3,Math.atan2(dx,dz),.2);filingPose.scale.setScalar(filingSizes[i]);filingPose.updateMatrix();filings.setMatrixAt(i,filingPose.matrix);
        }
        filings.instanceMatrix.needsUpdate=true;
      }
    }
    if(!attracting&&filingsDisturbed&&!frozen){
      if(host.reduced){filings.instanceMatrix.array.set(filingRestMatrices);filings.instanceMatrix.needsUpdate=true;filingsDisturbed=false;filingRelax=0;}
      else{
      filingRelax=Math.max(0,filingRelax-(dt||1/60)*2.5);
      for(let i=1100;i<filingCount;i++){
        filings.getMatrixAt(i,filingPose.matrix);filingPose.matrix.decompose(filingPose.position,filingPose.quaternion,filingPose.scale);
        const restX=filingPositions[i*3],restZ=filingPositions[i*3+2],ease=1-Math.exp(-(dt||1/60)*9);
        filingPose.position.x+=(restX-filingPose.position.x)*ease;filingPose.position.z+=(restZ-filingPose.position.z)*ease;
        filingPose.position.y=filingPositions[i*3+1];filingPose.updateMatrix();filings.setMatrixAt(i,filingPose.matrix);
      }
      filings.instanceMatrix.needsUpdate=true;if(filingRelax===0){filingsDisturbed=false;filings.instanceMatrix.array.set(filingRestMatrices);}
      }
    }
    outline.visible=!!focusMesh;
    if(outline.visible){if(outlineSource!==focusMesh){outline.geometry.dispose();outline.geometry=host.own(new T.EdgesGeometry(focusMesh.geometry,30));outlineSource=focusMesh;}focusMesh.updateWorldMatrix(true,false);outline.matrix.copy(focusMesh.matrixWorld);}
  }
  opening();
  return {ready:true,frame,navigation,
    resize(){navigation(host.progress);},
    celebrate(){ceremonyElapsed=host.reduced?4:0;clock.spin();tally.set(host.getTally(),performance.now()/1000,{spin:!host.reduced,immediate:host.reduced});},remote(){clock.spin();},
    focus(native){if(native==='clock'){opening();return;}const surface=exhibits.get(native)||destinations.get(native);if(surface)focusSurface(surface);else if(typeof native==='string'){const exhibit=host.exhibits.find(e=>e.show===native);if(exhibit&&exhibits.has(exhibit.anchor))focusSurface(exhibits.get(exhibit.anchor));}},
    capturePose(){return{position:camera.position.toArray(),target:target.toArray(),fov:camera.fov,secretLift,activeStation,pendingPressure,ceremonyElapsed,flangeRotation:secretFlange.rotation.toArray(),weightPosition:weight.position.toArray(),clockRotations:assemblies.map(o=>o.rotation.toArray()),layerPositions:layers.map(l=>l.group.position.toArray()),filingMatrices:filings.instanceMatrix.array.slice(),filingsDisturbed,filingRelax,focusUUID:focusMesh?.uuid};},
    restorePose(pose){if(!pose)return;approach=null;camera.position.fromArray(pose.position);target.fromArray(pose.target);camera.fov=pose.fov;secretLift=pose.secretLift;activeStation=pose.activeStation;pendingPressure=pose.pendingPressure;ceremonyElapsed=pose.ceremonyElapsed;secretFlange.rotation.fromArray(pose.flangeRotation);weight.position.fromArray(pose.weightPosition);updateLoad();assemblies.forEach((o,i)=>o.rotation.fromArray(pose.clockRotations[i]));layers.forEach((l,i)=>{l.group.position.fromArray(pose.layerPositions[i]);updateLayerRig(l);});filings.instanceMatrix.array.set(pose.filingMatrices);filings.instanceMatrix.needsUpdate=true;filingsDisturbed=pose.filingsDisturbed;filingRelax=pose.filingRelax;focusMesh=pose.focusUUID?host.root.getObjectByProperty('uuid',pose.focusUUID):null;camera.lookAt(target);camera.updateProjectionMatrix();},
    freeze(value){frozen=value;},cancelApproach(){approach=null;},
    cancelInput(reason){if(['blur','visibility','pagehide','graphics','escape','resize'].includes(reason))approach=null;},
    reducedMotion(value){if(!value)return;ceremonyElapsed=4;pendingPressure=host.pending?1:0;weight.position.copy(weightRest);weight.position.y-=pendingPressure*.032;updateLoad();assemblies.forEach((o,i)=>o.rotation.copy(restRotations[i]));secretFlange.rotation.x=secretLift?-.8:0;settleLayers(1);filings.instanceMatrix.array.set(filingRestMatrices);filings.instanceMatrix.needsUpdate=true;filingsDisturbed=false;filingRelax=0;if(approach){camera.position.copy(approach.to);target.copy(approach.toTarget);camera.lookAt(target);approach=null;}tally.set(host.getTally(),performance.now()/1000,{immediate:true});},
    dispose(){clock.dispose();tally.dispose();}
  };
}
