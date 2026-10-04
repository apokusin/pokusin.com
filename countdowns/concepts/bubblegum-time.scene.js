// A single authored elastic sculpture. The host supplies only real state/actions.
export async function create(host) {
  const T=host.THREE,version=document.documentElement.dataset.artVersion;
  const {canvasInk,mountArchive,labelInk}=await import('../scene-gallery.js?v='+version);
  const base='assets/concepts/bubblegum-time/scene/';
  const assetURL=path=>new URL(base+path+'?v='+version,document.baseURI).href;
  const faces=[
    new FontFace('Gum Bodoni',`url(${assetURL('typography/BodoniModa-variable.ttf')})`,{weight:'400 900'}),
    new FontFace('Gum Drum',`url(${assetURL('typography/RobotoCondensed-variable.ttf')})`,{weight:'100 900'})
  ];
  host.own({dispose(){for(const face of faces)document.fonts.delete(face);}});
  await Promise.all(faces.map(async face=>{await face.load();if(host.disposed)throw new Error('Disposed during font decode');document.fonts.add(face);}));
  const [model,manifest,titleTexture]=await Promise.all([
    host.loadGLB(base+'scene.glb'),
    fetch(assetURL('manifest.json')).then(r=>{if(!r.ok)throw new Error('Missing gum sculpture manifest');return r.json();}),
    host.texture(base+'typography/title-countdowns.png',{flipY:false})
  ]);
  if(host.disposed)throw new Error('Disposed during sculpture decode');
  const installation=model.scene;host.root.add(installation);
  const node=name=>{const value=installation.getObjectByName(name);if(!value)throw new Error('Missing authored gum node '+name);return value;};
  host.scene.background=new T.Color('#e6f3e0');host.renderer.toneMapping=T.NeutralToneMapping||T.ACESFilmicToneMapping;host.renderer.toneMappingExposure=.95;
  host.renderer.shadowMap.type=T.VSMShadowMap;
  // glTF reading faces have top-origin UVs. Newly created PlaneGeometry needs the same basis.
  function inkGeometry(width,height){const geometry=new T.PlaneGeometry(width,height),uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));return geometry;}
  document.documentElement.style.setProperty('--scene-utility-ink','#10120f');
  document.documentElement.style.setProperty('--scene-menu-paper','#e6f3e0');
  installation.traverse(object=>{if(object.isMesh){object.castShadow=!object.name.startsWith('screen_');object.receiveShadow=true;}});
  const sweep=host.own(new T.Mesh(new T.PlaneGeometry(200,200),new T.MeshStandardMaterial({color:'#e3f2dc',emissive:'#e9f6e3',emissiveIntensity:.08,roughness:.88,metalness:0})));
  sweep.position.z=-2.6;sweep.receiveShadow=true;host.scene.add(sweep);
  const key=host.own(new T.DirectionalLight('#fffdf8',1.8));key.position.set(-7,9,10);key.target.position.set(0,1,0);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.radius=6;key.shadow.intensity=.22;key.shadow.blurSamples=12;Object.assign(key.shadow.camera,{left:-12,right:12,top:13,bottom:-8,near:.5,far:35});key.shadow.bias=-.00008;key.shadow.normalBias=.024;host.scene.add(key,key.target);
  host.scene.add(host.own(new T.HemisphereLight('#f4f7f8','#a7a9ac',1.1)));
  const fill=host.own(new T.DirectionalLight('#f5f7ff',.65));fill.position.set(6,3,9);host.scene.add(fill);
  // Reflection shapes are real studio sources; highlights follow joined folds.
  const room=host.own(new T.Scene());
  room.background=new T.Color('#737780');
  function reflectionPanel(x,y,z,w,h,color,strength=1){
    const material=new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(strength),side:T.DoubleSide});
    const panel=new T.Mesh(new T.PlaneGeometry(w,h),material);panel.position.set(x,y,z);panel.lookAt(0,1,0);room.add(panel);return panel;
  }
  reflectionPanel(-8,5,10,2.8,16,'#fffdf9',3.1);reflectionPanel(1,11,7,15,1.5,'#ffffff',2.7);
  // One broad studio window, including its dark mullions, reflects as a coherent shape.
  const windowSource=new T.Group();windowSource.position.set(7,10,12);windowSource.lookAt(0,1,0);room.add(windowSource);
  const windowPane=new T.Mesh(new T.PlaneGeometry(7.6,11.6),new T.MeshBasicMaterial({color:new T.Color('#ffffff').multiplyScalar(3.5),side:T.DoubleSide}));windowSource.add(windowPane);
  for(const x of [-2.55,0,2.55]){const mullion=new T.Mesh(new T.PlaneGeometry(.10,11.6),new T.MeshBasicMaterial({color:'#292c33',side:T.DoubleSide}));mullion.position.set(x,0,.006);windowSource.add(mullion);}
  const transom=new T.Mesh(new T.PlaneGeometry(7.6,.12),new T.MeshBasicMaterial({color:'#292c33',side:T.DoubleSide}));transom.position.z=.008;windowSource.add(transom);
  reflectionPanel(9,3,8,2.6,12,'#25262e',.8);
  const pmrem=host.own(new T.PMREMGenerator(host.renderer));const environment=host.own(pmrem.fromScene(room,.035,.1,60));
  host.scene.environment=environment.texture;host.scene.environmentIntensity=.85;
  const gumMaterials=new Map();
  installation.traverse(object=>{if(!object.isMesh)return;
    const upgrade=source=>{if(!source.name.startsWith('Gum')||source.isMeshPhysicalMaterial)return source;if(gumMaterials.has(source))return gumMaterials.get(source);const physical=host.own(new T.MeshPhysicalMaterial({name:source.name,color:source.color.clone(),map:source.map,roughnessMap:source.roughnessMap,normalMap:source.normalMap,normalScale:source.normalScale.clone(),metalness:source.metalness,roughness:source.roughness,side:source.side}));gumMaterials.set(source,physical);return physical;};
    object.material=Array.isArray(object.material)?object.material.map(upgrade):upgrade(object.material);
    for(const material of Array.isArray(object.material)?object.material:[object.material]){ 
    if(material.name.startsWith('Gum')){material.color.set(material.name==='GumThinEdge'?'#ffd0e1':'#ff83bd');material.envMapIntensity=1.05;material.clearcoat=.95;material.clearcoatRoughness=.06;material.roughness=material.roughnessMap?1:.12;material.normalScale?.set(.04,.04);if(material.isMeshPhysicalMaterial){material.transmission=.47;material.thickness=.10;material.attenuationDistance=4.5;material.attenuationColor=new T.Color('#f479ac');material.iridescence=.36;material.iridescenceIOR=1.3;material.iridescenceThicknessRange=[110,260];}}
    if(material.name==='DrumCream')material.color.set('#f3eee3');
  }});
  const camera=new T.PerspectiveCamera(33,innerWidth/innerHeight,.1,180);host.useCamera(camera);
  const target=new T.Vector3();
  const body=node('gum_connected_membrane'),skinParts=[];body.traverse(part=>{if(part.morphTargetInfluences)skinParts.push(part);});
  const resetPad=node('reset_droplet'),padRest=resetPad.scale.clone();
  if(host.mobile){resetPad.position.x+=.42;node('reset_bridge').position.x+=.42;}
  const resetSurface=node('screen_reset'),tallySurface=node('screen_tally');
  const units=['days','hours','minutes','seconds'];
  const clock=host.numerals({surfaces:units.map(unit=>[node('screen_timer_'+unit+'_left'),node('screen_timer_'+unit+'_right')]),tally:tallySurface,ink:'#10120F',font:'900 560px "Gum Drum"',tallyFont:'700 205px "Gum Drum"',width:320,height:768,baseline:.53,roughness:.32});
  units.forEach((unit,i)=>{
    const [x,y]=[[-3.25,.22],[-1.36,.28],[.39,.61],[2.28,.92]][i];
    const face=host.own(new T.Mesh(inkGeometry(.40,host.mobile?.40:.27),new T.MeshBasicMaterial()));face.position.set(x,y-1.31,.56);face.rotation.x=-.06;installation.add(face);
    labelInk(host,face,['D','H','M','S'][i],{font:host.mobile?'600 130px "Gum Drum"':'500 105px "Gum Drum"',width:160,height:160});
  });
  canvasInk(host,resetSurface,(ctx,w,h)=>{ctx.fillStyle='#10120F';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='italic 500 110px "Gum Drum"';ctx.fillText('Again',w/2,h*.52,w*.9);},{width:512,height:192});
  const title=host.own(new T.Mesh(inkGeometry(9.3,2.14),new T.MeshBasicMaterial({map:titleTexture,transparent:true,toneMapped:false,depthWrite:false})));
  title.position.set(-3.70,-3.32,.03);title.rotation.z=-.32;title.scale.setScalar(.9);installation.add(title);title.userData.scenePassthrough=true;
  const works=new Map(),paperTargets=new Map(),destinations=new Map(),records=new Map(),cottonTabs=[];let focusMesh=null,approach=null,frozen=false,secretLift=0,pull=0,pullGoal=0,pressure=0,breathAge=99,echoAge=99,breath=0;
  // Two upper continuation prints crossed the front of the joined membrane.
  // Bring their real stock forward and stretch both existing tethers from their
  // fixed web roots; the four opening prints keep their authored placement.
  function clearUpperPrint(name,lift,ends){
    const paper=node('paper_'+name);
    for(const side of [-1,1]){
      const root=node('gum_gathered_paper_root_'+name+'_'+side),tether=node('gum_tether_'+name+'_'+side);
      const corner=root.position.clone(),end=new T.Vector3(...ends[side]),delta=end.clone().sub(corner);
      const curve=new T.CubicBezierCurve3(corner,corner.clone().addScaledVector(delta,.20).add(new T.Vector3(0,.10,.05)),corner.clone().addScaledVector(delta,.70).add(new T.Vector3(0,-.12,.08)),end);
      const samples=curve.getPoints(96),point=new T.Vector3(),nearest=new T.Vector3();
      tether.geometry=host.own(tether.geometry.clone());const positions=tether.geometry.attributes.position;
      for(let i=0;i<positions.count;i++){
        point.fromBufferAttribute(positions,i);let best=Infinity,fraction=0;
        for(let j=0;j<samples.length-1;j++){
          const segment=samples[j+1].clone().sub(samples[j]),length=segment.lengthSq(),t=T.MathUtils.clamp(point.clone().sub(samples[j]).dot(segment)/length,0,1);
          nearest.copy(samples[j]).addScaledVector(segment,t);const distance=point.distanceToSquared(nearest);
          if(distance<best){best=distance;fraction=(j+t)/(samples.length-1);}
        }
        positions.setZ(i,positions.getZ(i)+lift*(1-fraction));
      }
      positions.needsUpdate=true;tether.geometry.computeVertexNormals();tether.geometry.computeBoundingBox();tether.geometry.computeBoundingSphere();root.position.z+=lift;
    }
    paper.position.z+=lift;
  }
  clearUpperPrint('dexter_s7_finale',1.6,{1:[-1.8,8.8,-.05],'-1':[3.55,8.9,-.07]});
  clearUpperPrint('severance_s2',.20,{1:[-4.8,6,-.06],'-1':[-1.8,8.8,-.05]});
  // Printed ink follows the existing cotton triangles, including its rolled
  // corner. A flat quad would disappear beneath that same corner on approach.
  function printedGeometry(stock){
    const source=stock.geometry,p=source.attributes.position,uv=source.attributes.uv,index=source.index;
    const positions=[],texcoords=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),normal=new T.Vector3();
    const limits=[[0,.07,1],[0,.93,-1],[1,.08,1],[1,.83,-1]];
    const clip=(polygon,axis,bound,direction)=>{
      const result=[];
      for(let i=0;i<polygon.length;i++){
        const from=polygon[i],to=polygon[(i+1)%polygon.length],insideFrom=(from.uv[axis]-bound)*direction>=-1e-7,insideTo=(to.uv[axis]-bound)*direction>=-1e-7;
        if(insideFrom)result.push(from);
        if(insideFrom!==insideTo){const t=(bound-from.uv[axis])/(to.uv[axis]-from.uv[axis]);result.push({p:from.p.clone().lerp(to.p,t),uv:[from.uv[0]+(to.uv[0]-from.uv[0])*t,from.uv[1]+(to.uv[1]-from.uv[1])*t]});}
      }
      return result;
    };
    for(let offset=0;offset<(index?index.count:p.count);offset+=3){
      const ids=[0,1,2].map(k=>index?index.getX(offset+k):offset+k);
      a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]);c.fromBufferAttribute(p,ids[2]);normal.crossVectors(b.clone().sub(a),c.clone().sub(a));
      if(normal.z<=0)continue;
      let polygon=ids.map(i=>({p:new T.Vector3().fromBufferAttribute(p,i),uv:[uv.getX(i),uv.getY(i)]}));
      for(const limit of limits)polygon=clip(polygon,...limit);
      for(let i=1;i<polygon.length-1;i++)for(const vertex of [polygon[0],polygon[i],polygon[i+1]]){positions.push(vertex.p.x,vertex.p.y,vertex.p.z+.014);texcoords.push((vertex.uv[0]-.07)/.86,(vertex.uv[1]-.08)/.75);}
    }
    const geometry=host.own(new T.BufferGeometry());geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(texcoords,2));geometry.computeVertexNormals();return geometry;
  }
  function aim(surface,{immediate=false}={}){
    surface.updateWorldMatrix(true,false);const point=new T.Vector3();surface.getWorldPosition(point);
    // Authored reading faces contain nonzero local coordinates, so aim at their true center.
    if(surface.geometry){surface.geometry.computeBoundingBox();point.copy(surface.geometry.boundingBox.getCenter(new T.Vector3()).applyMatrix4(surface.matrixWorld));}
    const normal=new T.Vector3(0,0,1).transformDirection(surface.matrixWorld);
    const size=new T.Box3().setFromObject(surface).getSize(new T.Vector3()),aspect=innerWidth/innerHeight;
    const distance=Math.max(size.y/(Math.tan(T.MathUtils.degToRad(camera.fov/2))*1.35),size.x/(aspect*Math.tan(T.MathUtils.degToRad(camera.fov/2))*1.35))+.6;
    const next=point.clone().addScaledVector(normal,distance);
    if(immediate||host.reduced){camera.position.copy(next);target.copy(point);camera.lookAt(target);approach=null;}
    else approach={from:camera.position.clone(),to:next,fromTarget:target.clone(),toTarget:point,start:performance.now()/1000,duration:.60,complete:null};
    host.wake();
  }
  function focusSurface(surface){const record=[...records.entries()].find(([,record])=>record.surface===surface);if(record)travelTo(record[0]);focusMesh=surface;aim(surface,{immediate:true});}
  function openWork(exhibit,surface){
    focusMesh=surface;aim(surface,{immediate:host.reduced});
    if(approach)approach.complete=()=>host.openPreview(exhibit,{surface});else host.openPreview(exhibit,{surface});
  }
  async function bindWork(name,id){
    const exhibit=host.exhibits.find(exhibit=>exhibit.id===id);if(!exhibit)throw new Error('Missing archive record '+id);
    const surface=node(name),paper=node('paper_'+name.replace(/^screen_/,''));
    surface.geometry=printedGeometry(paper);
    await mountArchive(host,surface,exhibit);works.set(exhibit.anchor,surface);paperTargets.set(surface,paper);records.set(id,{exhibit,surface,paper});
    // Caption is physical ink on the uncurled lower cotton margin.
    const b=paper.geometry.boundingBox||(paper.geometry.computeBoundingBox(),paper.geometry.boundingBox),size=b.getSize(new T.Vector3());
    const caption=host.own(new T.Mesh(inkGeometry(size.x*.87,size.y*.13),new T.MeshBasicMaterial()));caption.position.set(0,-size.y*.405,.022);paper.add(caption);
    labelInk(host,caption,exhibit.showName,{font:'400 58px "Gum Bodoni"',align:'left',width:1024,height:128});
    const season=host.own(new T.Mesh(inkGeometry(size.x*.40,size.y*.11),new T.MeshBasicMaterial()));season.position.set(size.x*.245,-size.y*.47,.034);paper.add(season);
    labelInk(host,season,exhibit.label+(exhibit.live?' · LIVE':''),{font:'400 58px "Gum Bodoni"',align:'right',width:1024,height:128});
    paper.geometry=host.own(paper.geometry.clone());
    const originalPositions=paper.geometry.attributes.position.array.slice(),weights=new Float32Array(paper.geometry.attributes.position.count);
    for(let i=0;i<weights.length;i++){const x=originalPositions[i*3],y=originalPositions[i*3+1],u=(x-b.min.x)/size.x,v=(y-b.min.y)/size.y;weights[i]=Math.max(0,(u-.68)/.32)*Math.max(0,(.43-v)/.43);}
    paper.userData.hover=0;paper.userData.hoverAmount=0;paper.userData.originalPositions=originalPositions;paper.userData.curlWeights=weights;
    surface.userData.originalPositions=surface.geometry.attributes.position.array.slice();surface.userData.curlWeights=new Float32Array(surface.geometry.attributes.position.count);
    for(let i=0;i<surface.userData.curlWeights.length;i++){const x=surface.userData.originalPositions[i*3],y=surface.userData.originalPositions[i*3+1],u=(x-b.min.x)/size.x,v=(y-b.min.y)/size.y;surface.userData.curlWeights[i]=Math.max(0,(u-.68)/.32)*Math.max(0,(.43-v)/.43);}
    host.bind(surface,{native:exhibit.anchor,kind:'preview',hover:({active=true}={})=>{paper.userData.hover=active?1:0;focusMesh=active?surface:null;host.wake();},blur:()=>{paper.userData.hover=0;if(focusMesh===surface)focusMesh=null;},focus:()=>{paper.userData.hover=1;focusSurface(surface);},activate:()=>openWork(exhibit,surface)});
    return surface;
  }
  const openingRecords=[['screen_severance_tracker','severance:tracker'],['screen_dexter_s8_final','dexter:s8-final'],['screen_game_of_thrones_s4','got:s4'],['screen_archer_s5_final','archer:s5-final']];
  const continuation=[['screen_severance_s2','severance:s2'],['screen_dexter_s7_finale','dexter:s7-finale'],['screen_game_of_thrones_s3_redesign','got:s3-redesign'],['screen_game_of_thrones_s3_classic','got:s3-classic'],['screen_sherlock_final','sherlock:final'],['screen_sherlock_alpha','sherlock:alpha'],['screen_breaking_bad_final','breaking-bad:final'],['screen_breaking_bad_desert_parallax','breaking-bad:desert-parallax'],['screen_house_of_cards_s2','house-of-cards:s2']];
  await Promise.all(openingRecords.map(([name,id])=>bindWork(name,id)));
  const gate=new URLSearchParams(location.search).get('assetGate')==='1';
  if(gate)continuation.forEach(([name])=>{node(name).visible=false;node('paper_'+name.replace(/^screen_/,'' )).visible=false;});
  else await Promise.all(continuation.map(([name,id])=>bindWork(name,id)));
  // The tally is ink on the same small joined droplet as Again, not a floating readout.
  resetPad.add(tallySurface);tallySurface.position.set(.08,-.25,.31);tallySurface.scale.set(.43,.43,1);resetSurface.position.y=.15;
  const repeatMark=host.own(new T.Mesh(inkGeometry(.18,.18),new T.MeshBasicMaterial()));repeatMark.position.set(-.29,-.25,.31);resetPad.add(repeatMark);
  labelInk(host,repeatMark,'↻',{font:'400 100px "Gum Drum"',width:160,height:160});
  const resetProxy=host.own(new T.Mesh(new T.PlaneGeometry(1.95,host.mobile?2.0:1.3),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));resetProxy.position.z=.34;resetPad.add(resetProxy);
  host.bind(resetProxy,{native:host.dom.reset,kind:'reset',focus:()=>{opening();focusMesh=resetSurface;},activate:host.requestReset});
  const crown=node('crown_gold_edge');crown.position.z-=.07;const curl=node('crown_gum_curl'),curlRest=curl.position.clone(),hinge=node('crown_curl_hinge'),hingeRest=hinge.position.clone();
  const crownProxy=host.own(new T.Mesh(new T.PlaneGeometry(1.2,1.2),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));crownProxy.position.set(0,-.16,.29);hinge.add(crownProxy);
  host.bind(crownProxy,{native:host.dom.secretButton,kind:'secret',focus:()=>{opening();focusMesh=crown;secretLift=1;},activate:()=>{secretLift=1;host.revealSecret();host.wake();}});
  // Empty material bridges respond to horizontal intent; the host preserves pan-y.
  host.bind(body,{kind:'material',cursor:'grab',drag:({dx})=>{if(host.reduced||frozen)return;pullGoal=T.MathUtils.clamp(dx/(host.mobile?20:32),-1,1);host.wake();},cancel:()=>{pullGoal=0;host.wake();}});
  host.registerOccluder(installation);
  const outline=host.own(new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#a44f73',transparent:true,opacity:.85,depthTest:false})));
  outline.matrixAutoUpdate=false;outline.userData.scenePassthrough=true;outline.visible=false;host.root.add(outline);let outlineSource=null;
  host.setScrollStops(gate?4:14);
  function continuationVisible(value){if(gate)return;for(const [name] of continuation){node(name).visible=value;node('paper_'+name.replace(/^screen_/,'' )).visible=value;}}
  function opening(){
    continuationVisible(!host.mobile);approach=null;focusMesh=null;installation.scale.setScalar(host.mobile?.9:1);title.scale.setScalar(host.mobile?.48:.9);title.position.set(host.mobile?-1.7:-3.70,host.mobile?-4.5:-3.32,.03);camera.fov=33;hinge.position.copy(hingeRest);if(host.mobile){hinge.position.x+=2.6;hinge.position.y-=2.3;}
    if(host.mobile){camera.position.set(-.75,.12,26);target.set(-.75,.12,0);camera.fov=35;}
    else {camera.position.set(...manifest.camera.opening.position);target.set(...manifest.camera.opening.target);}
    camera.lookAt(target);camera.updateProjectionMatrix();
  }
  const railIds=gate?['severance:tracker','got:s4','archer:s5-final']:['severance:tracker','severance:s2','dexter:s7-finale','dexter:s8-final','got:s4','got:s3-redesign','got:s3-classic','archer:s5-final','breaking-bad:final','breaking-bad:desert-parallax','sherlock:alpha','sherlock:final','house-of-cards:s2'];
  const stations=[null,...railIds.map(id=>records.get(id).surface)];
  function travelTo(id){const index=railIds.indexOf(id);if(index<0)return;host.scrollTo((index+1)/(stations.length-1));}
  // Cotton tabs are genuine extra destinations. Their meshes remain attached to their print.
  if(!gate){
    function foldedStock(width,height){
      const positions=[],uvs=[],indices=[],cols=12,rows=4,count=(cols+1)*(rows+1),thickness=.018;
      for(let side=0;side<2;side++)for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
        const u=i/cols,v=j/rows,edge=.005*Math.sin(v*11+u*8),curl=.034*(1-v)**3*Math.sin(u*Math.PI);
        positions.push((u-.5)*width+edge,(v-.5)*height,curl-side*thickness);uvs.push(u,1-v);
      }
      for(let side=0;side<2;side++)for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
        const a=side*count+j*(cols+1)+i,b=a+1,c=a+cols+2,d=a+cols+1;indices.push(...(side?[a,c,b,a,d,c]:[a,b,c,a,c,d]));
      }
      const perimeter=[...Array.from({length:cols+1},(_,i)=>i),...Array.from({length:rows},(_,j)=>(j+1)*(cols+1)+cols),...Array.from({length:cols},(_,i)=>rows*(cols+1)+cols-i-1),...Array.from({length:rows-1},(_,j)=>(rows-j-1)*(cols+1))];
      for(let i=0;i<perimeter.length;i++){const a=perimeter[i],b=perimeter[(i+1)%perimeter.length];indices.push(a,a+count,b+count,a,b+count,b);}
      const geometry=host.own(new T.BufferGeometry());geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
    }
    const mainByShow={got:'got:s4',dexter:'dexter:s8-final',sherlock:'sherlock:final',archer:'archer:s5-final','breaking-bad':'breaking-bad:final',severance:'severance:tracker'};
    const extra=[...host.destinations.archive.map(value=>({...value,label:'Archive ↗'}))];
    if(host.destinations.timeline)extra.push({anchor:host.destinations.timeline,show:'dexter',label:'Timeline ↗'});
    if(host.destinations.live)extra.push({anchor:host.destinations.live,show:'severance',label:'Live ↗'});
    const counts=new Map();
    for(const destination of extra){
      const record=records.get(mainByShow[destination.show]);if(!record)throw new Error('Missing destination support '+destination.show);
      const paper=record.paper;paper.geometry.computeBoundingBox();const size=paper.geometry.boundingBox.getSize(new T.Vector3());
      const index=counts.get(destination.show)||0;counts.set(destination.show,index+1);
      const tab=host.own(new T.Mesh(foldedStock(.36,.27),paper.material));tab.position.set(index?.52:-.18,-size.y*.50-.10,.028);tab.castShadow=true;tab.receiveShadow=true;paper.add(tab);
      const arrow=host.own(new T.Mesh(inkGeometry(.25,.20),new T.MeshBasicMaterial()));arrow.position.z=.050;tab.add(arrow);labelInk(host,arrow,'↗',{font:'500 112px "Gum Drum"',width:160,height:160});
      // The destination name is on a tucked cotton fold, revealed only while focused.
      const fold=host.own(new T.Group());fold.position.set(0,-.13,.028);fold.rotation.x=Math.PI/2;tab.add(fold);
      const tongue=host.own(new T.Mesh(foldedStock(1.30,.28),paper.material));tongue.position.set(.45,-.14,0);tongue.castShadow=true;tongue.receiveShadow=true;fold.add(tongue);
      const label=host.own(new T.Mesh(inkGeometry(1.16,.23),new T.MeshBasicMaterial()));label.position.z=.05;tongue.add(label);labelInk(host,label,destination.label,{font:'500 70px "Gum Bodoni"',width:640,height:128});fold.visible=false;
      const state={tab,fold,open:0,amount:0};cottonTabs.push(state);
      const proxy=host.own(new T.Mesh(new T.PlaneGeometry(.60,.60),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));proxy.position.copy(tab.position);proxy.position.z+=.075;paper.add(proxy);
      destination.anchor.setAttribute('aria-label',record.exhibit.showName+', '+destination.label.replace(' ↗',''));
      destinations.set(destination.anchor,record.surface);host.bind(proxy,{native:destination.anchor,kind:'link',hover:({active})=>{state.open=active?1:0;host.wake();},focus:()=>{state.open=1;focusSurface(record.surface);},blur:()=>{state.open=0;host.wake();}});
    }
    // A folded paper tip with a single arrow hints that the elastic archive continues.
    const archer=records.get('archer:s5-final').paper;const next=host.own(new T.Mesh(inkGeometry(.56,.46),new T.MeshBasicMaterial()));next.position.set(.93,-1.18,.025);archer.add(next);
    labelInk(host,next,'↘',{font:'500 105px "Gum Drum"',width:160,height:160});
    const native=document.querySelector('.shownav a[href$="#breaking-bad"]');
    if(native)host.bind(next,{native,kind:'navigation',focus:()=>focusSurface(next),activate:()=>travelTo('breaking-bad:final')});
  }
  function readingPose(surface){
    surface.updateWorldMatrix(true,false);surface.geometry.computeBoundingBox();const point=surface.geometry.boundingBox.getCenter(new T.Vector3()).applyMatrix4(surface.matrixWorld);
    const size=new T.Box3().setFromObject(surface).getSize(new T.Vector3());const distance=Math.max(size.y/(Math.tan(T.MathUtils.degToRad(camera.fov/2))*1.35),size.x/((innerWidth/innerHeight)*Math.tan(T.MathUtils.degToRad(camera.fov/2))*1.35))+.6;
    const normal=new T.Vector3(0,0,1).transformDirection(surface.matrixWorld);
    return {position:point.clone().addScaledVector(normal,distance),target:point};
  }
  function navigation(progress){
    approach=null;focusMesh=null;
    if(progress<.001){opening();return;}
    continuationVisible(true);
    const first=host.mobile?{position:new T.Vector3(-.75,.12,26),target:new T.Vector3(-.75,.12,0)}:{position:new T.Vector3(...manifest.camera.opening.position),target:new T.Vector3(...manifest.camera.opening.target)};
    const poses=[first,...stations.slice(1).map(readingPose)],distance=progress*(poses.length-1),i=Math.min(poses.length-2,Math.floor(distance));
    const f=Math.min(1,(distance-i)*1.35),ease=f*f*(3-2*f);camera.position.lerpVectors(poses[i].position,poses[i+1].position,ease);target.lerpVectors(poses[i].target,poses[i+1].target,ease);camera.lookAt(target);camera.updateProjectionMatrix();
  }
  function frame(time,dt){
    clock.update(time);const step=dt||1/60;
    pressure=host.reduced?Number(host.pending):T.MathUtils.damp(pressure,host.pending?1:0,12,step);
    resetPad.scale.copy(padRest);resetPad.scale.z*=1-pressure*.18;resetPad.scale.x*=1+pressure*.045;
    if(!frozen){breathAge+=step;echoAge+=step;}
    const age=breathAge,remote=echoAge;
    breath=host.reduced?0:frozen?breath:age<.08?0:age<.65?Math.sin((age-.08)/.57*Math.PI/2):age<1.8?Math.cos((age-.65)/1.15*Math.PI/2)*Math.exp(-(age-.65)*1.3):remote<.45?.16*Math.sin(remote/.45*Math.PI):0;
    pull=host.reduced?0:frozen?pull:T.MathUtils.damp(pull,pullGoal,pullGoal?10:7,step);
    for(const part of skinParts){part.morphTargetInfluences[part.morphTargetDictionary.Breath]=breath;part.morphTargetInfluences[part.morphTargetDictionary.Pull]=pull;}
    curl.position.copy(curlRest);curl.position.z+=secretLift*.30;
    for(const state of cottonTabs){state.amount=host.reduced?state.open:T.MathUtils.damp(state.amount,state.open,14,step);state.fold.visible=state.amount>.01;state.fold.rotation.x=(1-state.amount)*Math.PI/2;}
    for(const paper of paperTargets.values()){
      const previous=paper.userData.hoverAmount,next=host.reduced?0:frozen?previous:T.MathUtils.damp(previous,paper.userData.hover||0,12,step);paper.userData.hoverAmount=next;
      if(Math.abs(next-previous)>.00005){const face=[...paperTargets.entries()].find(([,stock])=>stock===paper)?.[0];for(const layer of [paper,face].filter(Boolean)){const positions=layer.geometry.attributes.position,base=layer.userData.originalPositions,weights=layer.userData.curlWeights;for(let i=0;i<positions.count;i++)positions.array[i*3+2]=base[i*3+2]+weights[i]*next*.17;positions.needsUpdate=true;layer.geometry.computeVertexNormals();}}
    }
    if(approach&&!frozen){const phase=Math.min(1,(time-approach.start)/approach.duration),ease=phase*phase*(3-2*phase);camera.position.lerpVectors(approach.from,approach.to,ease);target.lerpVectors(approach.fromTarget,approach.toTarget,ease);camera.lookAt(target);if(phase===1){const complete=approach.complete;approach=null;complete?.();}}
    outline.visible=!!focusMesh&&document.activeElement!==document.body;
    if(outline.visible){if(outlineSource!==focusMesh){outline.geometry.dispose();outline.geometry=host.own(new T.EdgesGeometry(focusMesh.geometry,25));outlineSource=focusMesh;}focusMesh.updateWorldMatrix(true,false);outline.matrix.copy(focusMesh.matrixWorld);}
  }
  opening();
  return {ready:true,frame,navigation,resize(){navigation(host.progress);},celebrate(){clock.spin();breathAge=host.reduced?99:0;},remote(){clock.spin();echoAge=host.reduced?99:0;},
    focus(native){if(native==='clock'){opening();return;}const surface=works.get(native)||destinations.get(native)||[...works.entries()].find(([anchor])=>host.exhibits.find(e=>e.anchor===anchor)?.show===native)?.[1];if(surface)focusSurface(surface);},
    capturePose(){return{position:camera.position.toArray(),target:target.toArray(),fov:camera.fov,secretLift,pull,pullGoal,pressure,breathAge,echoAge,breath,focusMesh,papers:[...paperTargets.values()].map(paper=>({hover:paper.userData.hover,amount:paper.userData.hoverAmount})),tabs:cottonTabs.map(state=>({open:state.open,amount:state.amount}))};},
    restorePose(pose){if(!pose)return;approach=null;camera.position.fromArray(pose.position);target.fromArray(pose.target);camera.fov=pose.fov;secretLift=pose.secretLift;pull=pose.pull;pullGoal=pose.pullGoal;pressure=pose.pressure;breathAge=pose.breathAge;echoAge=pose.echoAge;breath=pose.breath;focusMesh=pose.focusMesh;[...paperTargets.values()].forEach((paper,index)=>{paper.userData.hover=pose.papers[index].hover;paper.userData.hoverAmount=pose.papers[index].amount;const face=[...paperTargets.entries()].find(([,stock])=>stock===paper)?.[0];for(const layer of [paper,face].filter(Boolean)){const positions=layer.geometry.attributes.position,base=layer.userData.originalPositions,weights=layer.userData.curlWeights;for(let i=0;i<positions.count;i++)positions.array[i*3+2]=base[i*3+2]+weights[i]*pose.papers[index].amount*.17;positions.needsUpdate=true;layer.geometry.computeVertexNormals();}});cottonTabs.forEach((state,index)=>{state.open=pose.tabs[index].open;state.amount=pose.tabs[index].amount;state.fold.visible=state.amount>.01;state.fold.rotation.x=(1-state.amount)*Math.PI/2;});camera.lookAt(target);camera.updateProjectionMatrix();},
    freeze(value){frozen=value;},cancelApproach(){approach=null;},cancelInput(){pullGoal=0;},dispose(){clock.dispose();for(const face of faces)document.fonts.delete(face);}
  };
}
