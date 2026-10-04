// A macro wax canyon. Surfaces inhabit the sculpt, never a DOM projection layer.
export async function create(host) {
  const T=host.THREE,version=document.documentElement.dataset.artVersion,base='assets/concepts/after-the-flame/scene/';
  const {canvasInk,labelInk}=await import('../scene-gallery.js?v='+version);
  const manifest=await fetch(base+'manifest.json?v='+version).then(r=>{if(!r.ok)throw new Error('Wax manifest unavailable');return r.json();});
  const [model]=await Promise.all([
    host.loadGLB(base+(host.mobile&&manifest.phoneAsset?manifest.phoneAsset:'scene.glb')),
    document.fonts.ready
  ]);
  const canyon=model.scene;host.root.add(canyon);
  const node=name=>{const ob=canyon.getObjectByName(name);if(!ob)throw new Error('Missing authored wax surface: '+name);return ob;};
  document.documentElement.style.setProperty('--scene-utility-ink','#efd8b5');
  document.documentElement.style.setProperty('--scene-menu-paper','#2d1c24');
  host.scene.background=new T.Color('#190d17');host.renderer.toneMappingExposure=1.0;
  canyon.traverse(ob=>{if(ob.isMesh){ob.castShadow=!/^(archive_|caption_|clock_|molten_|again_|flame_)/.test(ob.name);ob.receiveShadow=!/^(archive_|caption_|flame_)/.test(ob.name);}});
  host.renderer.shadowMap.type=T.VSMShadowMap;
  const warm=new T.DirectionalLight('#fff1da',1.45);warm.position.set(-8,11,8);warm.target.position.set(1,2,0);
  warm.castShadow=true;warm.shadow.mapSize.set(host.mobile?1024:2048,host.mobile?1024:2048);
  Object.assign(warm.shadow.camera,{left:-12,right:17,top:14,bottom:-10,near:1,far:65});warm.shadow.normalBias=.026;warm.shadow.bias=-.00012;warm.shadow.radius=3.5;warm.shadow.blurSamples=8;warm.shadow.intensity=.52;host.scene.add(warm,warm.target);
  const rim=new T.DirectionalLight('#799ed2',1.15);rim.position.set(13,11,-10);host.scene.add(rim);
  host.scene.add(new T.HemisphereLight('#aa8f78','#21121c',.35));
  const flameLight=new T.PointLight('#ffae53',120,23,2);flameLight.position.set(-5.29,10.43,.49);host.scene.add(flameLight);
  // Reflection shapes agree with the warm source and cool terrace rim.
  const reflectionScene=new T.Scene();reflectionScene.background=new T.Color('#10090e');
  const softbox=(position,color,size)=>{
    const card=host.own(new T.Mesh(new T.PlaneGeometry(...size),new T.MeshBasicMaterial({color,side:T.DoubleSide})));
    card.position.set(...position);card.lookAt(1,3,0);reflectionScene.add(card);
  };
  softbox([-8,11,6],new T.Color(3.0,2.8,2.4),[8,5]);softbox([12,8,-9],new T.Color(.6,.85,1.8),[5,9]);
  const pmrem=host.own(new T.PMREMGenerator(host.renderer)),env=host.own(pmrem.fromScene(reflectionScene,.035,.1,80));
  host.scene.environment=env.texture;host.scene.environmentIntensity=.82;
  const ao=await host.texture(base+'materials/wax-crevice-ao.png',{colorSpace:'linear',flipY:false});
  const mass=node('continuous_sculpted_wax_mass');
  const aoMaterial=material=>{
    const result=host.own(material.clone());result.aoMap=ao;result.aoMapIntensity=.35;
    // A shallow continuous molten skin follows the real upward-facing relief.
    // Vertical porous banks retain their dry response beside these wet pools.
    result.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nvec3 waxMacroNormal=inverseTransformDirection(normalize(vNormal),viewMatrix);\nfloat moltenFacing=smoothstep(.55,.94,waxMacroNormal.y);\nroughnessFactor=mix(roughnessFactor*1.35,.13,moltenFacing*.91);');
    };
    result.customProgramCacheKey=()=> 'wax-cold-bank-wet-relief-v1';result.needsUpdate=true;return result;
  };
  mass.material=Array.isArray(mass.material)?mass.material.map(aoMaterial):aoMaterial(mass.material);
  const camera=new T.PerspectiveCamera(manifest.camera.fov||30,innerWidth/innerHeight,.1,160);host.useCamera(camera);
  host.scene.add(camera);
  const titleGeometry=new T.PlaneGeometry(2.3,.30),titleUv=titleGeometry.attributes.uv;
  for(let i=0;i<titleUv.count;i++)titleUv.setY(i,1-titleUv.getY(i));
  const title=host.own(new T.Mesh(titleGeometry,new T.MeshBasicMaterial()));camera.add(title);
  labelInk(host,title,'C O U N T D O W N S',{font:'400 74px Georgia',color:'#eddac0',width:1024,height:128});
  title.material.depthTest=false;title.renderOrder=20;title.userData.scenePassthrough=true;
  function placeTitle(){
    const height=20*Math.tan(T.MathUtils.degToRad(camera.fov/2));
    title.scale.set(host.mobile?.78:1,host.mobile?.78:1,1);
    title.position.set(host.mobile?0:height*(innerWidth/innerHeight)*.33,height*.435,-10);
  }
  const openingPosition=new T.Vector3(...manifest.camera.positionGLTF),openingTarget=new T.Vector3(...manifest.camera.targetGLTF),target=openingTarget.clone();
  let frozen=false,approach=null,selected=null,activePlaque=null,hovered=null,poolPressure=0,secretLean=0,ceremonyElapsed=99,remoteElapsed=99,ceremonyFrom=0,confirmation=0;
  const pool=node('again_pressure_pool'),flames=[node('flame_outer'),node('flame_core')],crown=node('crease_crown');
  flames.forEach((flame,index)=>{
    flame.castShadow=false;flame.receiveShadow=false;
    flame.material=host.own(new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,side:T.DoubleSide,
      uniforms:{core:{value:index===1?1:0}},
      vertexShader:'varying vec2 flameUv;varying vec3 flameNormal;varying vec3 flameView;void main(){flameUv=vec2(uv.x,1.-uv.y);vec4 mv=modelViewMatrix*vec4(position,1.);flameNormal=normalize(normalMatrix*normal);flameView=-mv.xyz;gl_Position=projectionMatrix*mv;}',
      fragmentShader:'varying vec2 flameUv;varying vec3 flameNormal;varying vec3 flameView;uniform float core;void main(){float facing=pow(abs(dot(normalize(flameNormal),normalize(flameView))),.6);float tip=1.-smoothstep(.82,1.,flameUv.y);float foot=smoothstep(0.,.10,flameUv.y);vec3 colour=mix(vec3(1.,.16,.004),vec3(1.,.92,.57),max(core,facing*.88));gl_FragColor=vec4(colour,(.26+.55*facing+.16*core)*tip*foot);}'
    }));
  });
  const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=128;
  const haloContext=haloCanvas.getContext('2d'),gradient=haloContext.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(255,170,42,.23)');gradient.addColorStop(.3,'rgba(255,119,18,.13)');gradient.addColorStop(1,'rgba(255,95,4,0)');haloContext.fillStyle=gradient;haloContext.fillRect(0,0,128,128);
  const haloMap=host.own(new T.CanvasTexture(haloCanvas)),halo=host.own(new T.Sprite(new T.SpriteMaterial({map:haloMap,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false})));
  halo.position.set(-5.24,10.43,.49);halo.scale.set(3.1,4.2,1);halo.userData.scenePassthrough=true;host.root.add(halo);
  const flamePositions=flames.map(ob=>ob.geometry.attributes.position.array.slice());
  const film=Array.from({length:6},(_,i)=>node('molten_channel_'+i)),candle=node('tapered_front_candle'),wick=node('bent_charred_wick');
  film.forEach(surface=>{surface.visible=false;surface.userData.scenePassthrough=true;});
  const flowUniforms=film.map(surface=>{
    surface.material=host.own(surface.material.clone());const flow={value:-1};
    surface.material.transparent=true;surface.material.opacity=.40;surface.material.depthWrite=false;surface.castShadow=false;
    surface.material.onBeforeCompile=shader=>{
      shader.uniforms.waxFlow=flow;
      shader.vertexShader='varying vec2 waxSurfaceUv;\n'+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n waxSurfaceUv=vec2(uv.x,1.-uv.y);');
      shader.fragmentShader='varying vec2 waxSurfaceUv;\n uniform float waxFlow;\n'+shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n float waxVein=exp(-pow((waxSurfaceUv.y-waxFlow)/.085,2.0))*step(0.0,waxFlow)*step(waxFlow,1.0);\n totalEmissiveRadiance+=vec3(.16,.046,.005)*waxVein;');
    };
    surface.material.customProgramCacheKey=()=> 'wax-uphill-film-v1';return flow;
  });
  const clockNames=host.mobile&&manifest.phoneClock?manifest.phoneClock:manifest.clock;
  if(host.mobile&&manifest.phoneClock)manifest.clock.map(node).forEach(face=>{face.visible=false;});
  const clock=host.numerals({surfaces:clockNames.map(node),font:host.mobile?'400 440px Georgia':'400 400px Georgia',width:512,height:640,baseline:.43,ink:'#29180f'});
  clockNames.map(node).forEach((face,i)=>{
    const unit=host.own(new T.Mesh(face.geometry.clone(),new T.MeshBasicMaterial()));
    unit.position.copy(face.position);unit.quaternion.copy(face.quaternion);unit.scale.copy(face.scale);unit.position.z+=.008;unit.castShadow=false;unit.receiveShadow=true;face.parent.add(unit);
    canvasInk(host,unit,(ctx,w,h)=>{ctx.font=host.mobile?'400 132px Georgia':'400 83px Georgia';ctx.fillStyle='#382018';ctx.textAlign='center';ctx.fillText(['D','H','M','S'][i],w/2,h*.87);},{width:512,height:640,lit:true});
  });
  // Save the genuine wet material before putting transparent ink on its twin.
  const poolBed=host.own(new T.Mesh(pool.geometry.clone(),pool.material));
  poolBed.position.copy(pool.position);poolBed.position.y-=.006;poolBed.quaternion.copy(pool.quaternion);poolBed.scale.copy(pool.scale);pool.parent.add(poolBed);poolBed.receiveShadow=true;poolBed.castShadow=false;
  const pressureInk=canvasInk(host,pool,(ctx,w,h)=>{
    ctx.fillStyle='#2d1a11';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=host.mobile?'italic 360px Georgia':'italic 285px Georgia';ctx.fillText('Again',w*.5,h*.50,w*.86);
  },{width:1024,height:host.mobile?512:640,lit:true});
  // A transparent reel skin follows the same curved pool and pressure morph.
  // UV cropping confines it to the small existing tally position in the wax.
  const tallyGeometry=host.own(pool.geometry.clone()),tallyUv=tallyGeometry.attributes.uv,tallyRestUv=tallyUv.array.slice();
  let tallyLength=0;
  function fitPhoneTally(){
    if(!host.mobile)return;const length=String(host.getTally()).length;if(length===tallyLength)return;tallyLength=length;
    const span=Math.min(.34,.075+length*.038);
    for(let i=0;i<tallyUv.count;i++){tallyUv.setX(i,(tallyRestUv[i*2]-.5)/span+.5);tallyUv.setY(i,(tallyRestUv[i*2+1]-.88)/.36+.5);}tallyUv.needsUpdate=true;
  }
  if(host.mobile)fitPhoneTally();else for(let i=0;i<tallyUv.count;i++){tallyUv.setX(i,(tallyUv.getX(i)-.35)/.30);tallyUv.setY(i,(tallyUv.getY(i)-.725)/.13);}
  const tallySkin=host.own(new T.Mesh(tallyGeometry,new T.MeshBasicMaterial()));
  tallySkin.position.copy(pool.position);tallySkin.position.y+=.009;tallySkin.quaternion.copy(pool.quaternion);tallySkin.scale.copy(pool.scale);pool.parent.add(tallySkin);
  tallySkin.castShadow=false;tallySkin.receiveShadow=true;tallySkin.userData.scenePassthrough=true;
  const tally=host.ink(tallySkin,host.mobile?{font:'italic 132px Georgia',width:288,height:192,baseline:.5,ink:'#2d1a11',paintGlyph(ctx,value,{x,y,width,height}){ctx.font=`italic ${Math.min(height*.95,width*1.48)}px Georgia`;ctx.fillText(value,x,y);}}:{font:'italic 112px Georgia',width:640,height:160,baseline:.53,ink:'#2d1a11'});
  let tallySpin=false;
  // Keep the glossy pressure surface beneath its ink; the ink mesh shares the
  // authored bowl geometry and morph rather than becoming a floating label.
  const workSurfaces=new Map(),anchorSurface=new Map(),destinationSurfaces=new Map(),destinationParents=new Map(),plaques=new Map();
  const records=manifest.archives.map(record=>{
    const exhibit=host.exhibits.find(e=>e.href.includes('/'+record.id.replace(/^(got|dexter|severance|sherlock|archer|breaking-bad|house-of-cards)-/,'')+'/')&&e.show===record.show);
    // Match complete faithful hrefs, including slugs which contain hyphens.
    const item=host.exhibits.find(e=>e.href===`/countdowns/${record.show}/${record.id.slice(record.show.length+1)}/`)||exhibit;
    if(!item)throw new Error('Wax record has no archive destination: '+record.id);
    return {...record,exhibit:item,surface:node(record.screen)};
  });
  function settlePlaques(active=null){
    activePlaque=active;
    for(const [surface,plaque] of plaques){
      const on=surface===active;surface.position.copy(plaque.rest);if(on)surface.position.add(plaque.offset);
      plaque.body.position.copy(surface.position);plaque.body.visible=on;plaque.stem.visible=on;
    }
    canyon.updateMatrixWorld(true);
  }
  function focusPlaque(surface){
    settlePlaques(surface);selected=surface;aim(surface,{immediate:true});
  }
  function surfacePose(surface){
    if(plaques.has(surface)){
      surface.updateWorldMatrix(true,false);
      const plaque=plaques.get(surface),center=new T.Box3().setFromObject(surface).getCenter(new T.Vector3());
      const aspect=innerWidth/innerHeight,fov=host.mobile?42:manifest.camera.fov;
      const size=new T.Box3().setFromObject(surface).getSize(new T.Vector3()),fit=Math.max(size.y,size.x/aspect);
      const distance=fit/(2*Math.tan(T.MathUtils.degToRad(fov/2)))*1.34;
      return {position:center.clone().addScaledVector(plaque.view,distance),target:center,fov};
    }
    const record=records.find(item=>item.surface===surface);
    const profile=host.mobile?(innerWidth<=340?'phone320':'phone390'):'desktop';
    const authored=record?.viewPoses?.[profile];
    if(authored){
      return {position:new T.Vector3(...authored.positionGLTF),target:new T.Vector3(...authored.targetGLTF),fov:authored.fov};
    }
    surface.updateWorldMatrix(true,false);
    const center=new T.Vector3();surface.getWorldPosition(center);
    const attr=surface.geometry.attributes.normal,normal=new T.Vector3(attr.getX(0),attr.getY(0),attr.getZ(0)).transformDirection(surface.matrixWorld);
    const size=new T.Box3().setFromObject(surface).getSize(new T.Vector3()),aspect=innerWidth/innerHeight;
    const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));
    const distance=Math.max(size.y/(tan*1.5),size.x/(aspect*tan*1.5))+1.15;
    return {position:center.clone().addScaledVector(normal,distance),target:center,fov:host.mobile?42:manifest.camera.fov};
  }
  const railProfiles=Object.fromEntries(Object.entries(manifest.navigationRails||{}).map(([profile,paths])=>[profile,paths.map(path=>path.map(point=>new T.Vector3(...point)))]));
  function railPoint(points,phase){
    const lengths=points.slice(1).map((point,i)=>point.distanceTo(points[i])),total=lengths.reduce((sum,length)=>sum+length,0);
    let remaining=phase*total;
    for(let i=0;i<lengths.length;i++){
      if(remaining<=lengths[i]||i===lengths.length-1)return new T.Vector3().lerpVectors(points[i],points[i+1],lengths[i]>0?remaining/lengths[i]:0);
      remaining-=lengths[i];
    }
    return points.at(-1).clone();
  }
  function aim(surface,{immediate=false,onDone}={}){
    if(!plaques.has(surface))settlePlaques();
    const pose=surfacePose(surface);
    if(host.reduced||immediate){camera.position.copy(pose.position);target.copy(pose.target);camera.fov=pose.fov;camera.updateProjectionMatrix();camera.lookAt(target);approach=null;onDone?.();}
    else approach={from:camera.position.clone(),to:pose.position,fromTarget:target.clone(),toTarget:pose.target,fromFov:camera.fov,toFov:pose.fov,start:performance.now()/1000,duration:.68,onDone};
    host.wake();
  }
  function focusSurface(surface){
    if(plaques.has(surface)){focusPlaque(surface);return;}
    const record=records.find(item=>item.surface===surface),index=record?records.indexOf(record):-1;
    if(index>=0&&Math.abs(host.progress-(index+1)/records.length)>.001)host.scrollTo((index+1)/records.length,{immediate:true});
    selected=surface;aim(surface,{immediate:true});
  }
  async function faithfulStill(record){
    const source=await host.texture(record.exhibit.thumbnail,{flipY:false}),image=source.image;
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(1024*record.height/record.width);
    const ctx=canvas.getContext('2d'),ratio=Math.min(canvas.width/image.width,canvas.height/image.height);
    ctx.fillStyle='#121014';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image,(canvas.width-image.width*ratio)/2,(canvas.height-image.height*ratio)/2,image.width*ratio,image.height*ratio);
    const texture=host.own(new T.CanvasTexture(canvas));texture.colorSpace=T.SRGBColorSpace;texture.flipY=false;
    texture.anisotropy=Math.min(4,host.renderer.capabilities.getMaxAnisotropy());
    record.surface.material=host.own(new T.MeshBasicMaterial({map:texture,toneMapped:false}));
  }
  await Promise.all(records.map(async record=>{
    await faithfulStill(record);
    anchorSurface.set(record.exhibit.anchor,record.surface);workSurfaces.set(record.exhibit.show,workSurfaces.get(record.exhibit.show)||record.surface);
    const caption=node(record.caption),label=records.indexOf(record)<3?record.exhibit.showName:record.exhibit.label;
    labelInk(host,caption,label+(record.exhibit.live?' · LIVE':''),{font:'400 48px Georgia',color:'#28180f',width:1024,height:128});
    host.bind(record.surface,{native:record.exhibit.anchor,kind:'preview',
      hover:({active})=>{hovered=active?record.surface:hovered===record.surface?null:hovered;host.wake();},
      focus:()=>focusSurface(record.surface),blur:()=>{if(selected===record.surface)selected=null;},
      activate:()=>aim(record.surface,{onDone:()=>host.openPreview(record.exhibit,{surface:record.surface})})});
  }));
  // These sparse links are ink on authored wax faces below their own exhibit.
  const extras=host.destinations.archive.map(d=>({...d,kind:'archive',label:'Archive ↗'}));
  if(host.destinations.timeline)extras.push({anchor:host.destinations.timeline,show:'dexter',kind:'timeline',label:'Timeline'});
  if(host.destinations.live)extras.push({anchor:host.destinations.live,show:'severance',kind:'live',label:'Live ↗'});
  for(const destination of extras){
    const entry=manifest.destinations.find(d=>d.show===destination.show&&d.kind===destination.kind);
    if(!entry)throw new Error('Missing physical wax destination: '+destination.show+'/'+destination.kind);
    const label=node(entry.surface),baseFace=node(entry.parent);
    label.castShadow=false;label.receiveShadow=false;
    labelInk(host,label,destination.label,{font:'400 54px Georgia',color:'#2e1b12',width:512,height:128});
    destinationSurfaces.set(destination.anchor,label);
    destinationParents.set(label,baseFace);
    label.updateWorldMatrix(true,false);const rest=label.position.clone(),viewPose=surfacePose(baseFace);
    const view=viewPose.position.clone().sub(viewPose.target).normalize(),worldOffset=view.clone().multiplyScalar(2.4).add(new T.Vector3(0,.65,0));
    const inverse=new T.Matrix4().copy(label.parent.matrixWorld).invert();
    const origin=new T.Vector3().setFromMatrixPosition(label.matrixWorld),offset=origin.clone().add(worldOffset).applyMatrix4(inverse).sub(origin.clone().applyMatrix4(inverse));
    label.geometry.computeBoundingBox();const box=label.geometry.boundingBox,size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
    const width=size.x+.06,height=size.y+.06,radius=Math.min(.065,height*.22),shape=new T.Shape(),left=-width/2,right=width/2,bottom=-height/2,top=height/2;
    shape.moveTo(left+radius,bottom);shape.lineTo(right-radius,bottom);shape.quadraticCurveTo(right,bottom,right,bottom+radius);shape.lineTo(right,top-radius);shape.quadraticCurveTo(right,top,right-radius,top);shape.lineTo(left+radius,top);shape.quadraticCurveTo(left,top,left,top-radius);shape.lineTo(left,bottom+radius);shape.quadraticCurveTo(left,bottom,left+radius,bottom);
    const stock=host.own(new T.ExtrudeGeometry(shape,{depth:.05,bevelEnabled:true,bevelThickness:.01,bevelSize:.012,bevelSegments:3,curveSegments:6}));stock.translate(center.x,center.y,center.z-.08);
    const waxMaterial=host.own((Array.isArray(mass.material)?mass.material[0]:mass.material).clone());waxMaterial.aoMap=null;waxMaterial.aoMapIntensity=0;
    const body=host.own(new T.Mesh(stock,waxMaterial));body.name='rooted_wax_plaque_'+label.name;body.position.copy(rest);body.quaternion.copy(label.quaternion);body.scale.copy(label.scale);body.castShadow=true;body.receiveShadow=true;label.parent.add(body);
    const normal=new T.Vector3().fromBufferAttribute(label.geometry.attributes.normal,0).transformDirection(label.matrixWorld);
    // Root the filament in the actual poured skin rather than assuming the
    // authored ink plane coincides with the irregular macro wax relief.
    mass.updateWorldMatrix(true,false);const rootRay=new T.Raycaster();let rootHit=null;
    // Low captions can sit below the cooled lip. Search upward along that
    // same terrace for the first actual root rather than inventing a joint.
    for(const rise of [0,.2,.45,.8,1.25,1.8,2.6]){
      rootRay.set(origin.clone().addScaledVector(normal,.35).add(new T.Vector3(0,rise,0)),normal.clone().negate());rootRay.near=.001;rootRay.far=8;
      rootHit=rootRay.intersectObject(mass,false)[0];if(rootHit)break;
    }
    if(!rootHit)throw new Error('Wax plaque has no poured attachment: '+label.name);
    const start=rootHit.point.clone().addScaledVector(normal,-.012);
    const end=origin.clone().add(worldOffset).addScaledVector(normal,-.07),mid=start.clone().lerp(end,.48).add(new T.Vector3(0,-.18,0));
    const stem=host.own(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([start,mid,end]),18,.04,8,false),waxMaterial));stem.name='connected_wax_plaque_stem_'+label.name;stem.userData.waxRootMeasured=!!rootHit;stem.castShadow=true;stem.receiveShadow=true;host.root.add(stem);
    plaques.set(label,{rest,offset,view,body,stem});body.visible=false;stem.visible=false;
    host.bind(label,{native:destination.anchor,kind:'link',focus:()=>focusPlaque(label)});
  }
  function openingPose(){
    if(host.mobile){
      if(manifest.camera.phoneRule?.positionGLTF)return {position:new T.Vector3(...manifest.camera.phoneRule.positionGLTF),target:new T.Vector3(...manifest.camera.phoneRule.targetGLTF),fov:manifest.camera.phoneRule.fov};
      const distance=17.2/(2*Math.tan(T.MathUtils.degToRad(21))*(innerWidth/innerHeight));
      return {position:new T.Vector3(-.35,4+distance*.108,3+distance),target:new T.Vector3(-.35,4,3),fov:42};
    }
    return {position:openingPosition,target:openingTarget,fov:manifest.camera.fov};
  }
  function opening(){
    settlePlaques();approach=null;selected=null;const pose=openingPose();camera.fov=pose.fov;camera.position.copy(pose.position);target.copy(pose.target);
    camera.lookAt(target);camera.updateProjectionMatrix();placeTitle();
  }
  host.bind(pool,{native:host.dom.reset,kind:'reset',focus:()=>{opening();selected=pool;host.scrollTo(0);},activate:host.requestReset});
  // A non-shadowing generous clue proxy is grounded at the sole tiny crown.
  const clue=host.own(new T.Mesh(new T.SphereGeometry(.40,12,8),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));
  crown.getWorldPosition(clue.position);host.root.add(clue);
  host.bind(clue,{native:host.dom.secretButton,kind:'secret',focus:()=>{opening();secretLean=.32;host.scrollTo(0);},activate:()=>{secretLean=secretLean?0:.32;host.revealSecret();host.wake();}});
  const ring=host.own(new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#ffe1b3',transparent:true,opacity:.78,depthTest:false})));
  ring.matrixAutoUpdate=false;ring.userData.scenePassthrough=true;host.root.add(ring);let ringSource=null;
  host.setScrollStops(records.length+1);
  function navigation(progress){
    settlePlaques();approach=null;selected=null;
    if(progress<=.0001){opening();return;}
    const travel=progress*records.length,at=Math.min(records.length-1,Math.floor(travel)),fraction=travel-at;
    const from=at===0?openingPose():surfacePose(records[at-1].surface);
    const to=surfacePose(records[at].surface);
    const eased=fraction*fraction*(3-2*fraction),profile=host.mobile?(innerWidth<=340?'phone320':'phone390'):'desktop';
    const authoredRail=railProfiles[profile]?.[at];
    if(authoredRail){const path=at===0?[from.position,...authoredRail.slice(1)]:authoredRail;camera.position.copy(railPoint(path,eased));}
    else camera.position.lerpVectors(from.position,to.position,eased);
    target.lerpVectors(from.target,to.target,eased);camera.fov=T.MathUtils.lerp(from.fov,to.fov,eased);
    camera.lookAt(target);camera.updateProjectionMatrix();
  }
  let decorativeTime=0;const flameScreen=new T.Vector3();
  function frame(time,dt){
    clock.update(time);fitPhoneTally();tally.set(host.getTally(),time,{spin:tallySpin,offset:8});tallySpin=false;tally.update(time);
    if(!frozen){decorativeTime+=dt;ceremonyElapsed+=dt;remoteElapsed+=dt;}
    const wave=host.reduced?0:Math.sin(decorativeTime*2.8)*.018+Math.sin(decorativeTime*4.1)*.009;
    const flameCenter=flameScreen.set(-5.24,10.43,.49).project(camera);
    const pointerDistance=Math.hypot(host.pointer.x-flameCenter.x,host.pointer.y-flameCenter.y);
    const proximity=Math.max(0,1-pointerDistance/.36);
    const bend=host.pointer.active&&!host.reduced&&flameCenter.z>-1&&flameCenter.z<1?(host.pointer.x-flameCenter.x)*.22*proximity:0;
    flames.forEach((flame,index)=>{
      const attribute=flame.geometry.attributes.position,rest=flamePositions[index];
      for(let i=0;i<attribute.count;i++){const height=Math.max(0,rest[i*3+1]-9.6);attribute.setX(i,rest[i*3]+(wave+bend)*height*height);}
      attribute.needsUpdate=true;
    });
    const ceremonyShape=host.reduced||ceremonyElapsed>1.7?0:Math.sin(Math.min(1,ceremonyElapsed/1.7)*Math.PI);
    const ramp=Math.min(1,ceremonyElapsed/.18),blend=ramp*ramp*(3-2*ramp);
    confirmation=host.reduced?0:T.MathUtils.lerp(ceremonyFrom,ceremonyShape,blend);
    flameLight.intensity=120*(1+wave*4+confirmation*.14+(remoteElapsed<.45&&!host.reduced?Math.sin(remoteElapsed/.45*Math.PI)*.07:0));
    flameLight.position.y=10.43+confirmation*.20;
    flames.forEach(flame=>flame.position.y=confirmation*.20);wick.position.y=confirmation*.20;
    if(candle.morphTargetInfluences)candle.morphTargetInfluences[0]=confirmation;
    poolPressure=host.reduced?(host.pending?.35:0):T.MathUtils.damp(poolPressure,host.pending?.35:0,15,dt||1/60);
    if(pool.morphTargetInfluences)pool.morphTargetInfluences[0]=poolPressure;
    if(poolBed.morphTargetInfluences)poolBed.morphTargetInfluences[0]=poolPressure;
    if(tallySkin.morphTargetInfluences)tallySkin.morphTargetInfluences[0]=poolPressure;
    film.forEach((surface,index)=>{surface.visible=confirmation>.002&&!host.reduced;if(surface.morphTargetInfluences)surface.morphTargetInfluences[0]=confirmation*Math.max(0,1-index*.10);});
    flowUniforms.forEach((uniform,index)=>{const phase=ceremonyElapsed/.95-index*.035;uniform.value=!host.reduced&&phase>=0&&phase<=1?phase:-1;});
    crown.rotation.z=secretLean;
    if(approach&&!frozen){
      const phase=Math.min(1,(time-approach.start)/approach.duration),ease=phase*phase*(3-2*phase);
      camera.position.lerpVectors(approach.from,approach.to,ease);target.lerpVectors(approach.fromTarget,approach.toTarget,ease);camera.lookAt(target);
      camera.fov=T.MathUtils.lerp(approach.fromFov,approach.toFov,ease);camera.updateProjectionMatrix();
      if(phase>=1){const complete=approach.onDone;approach=null;complete?.();}
    }
    const focus=selected||hovered;ring.visible=!!focus;
    if(focus){if(ringSource!==focus){ring.geometry.dispose();ring.geometry=host.own(new T.EdgesGeometry(focus.geometry,45));ringSource=focus;}focus.updateWorldMatrix(true,false);ring.matrix.copy(focus.matrixWorld);}
  }
  opening();host.registerOccluder(canyon);
  return {ready:true,frame,navigation,
    resize(){if(!frozen)navigation(host.progress);placeTitle();},
    celebrate(){clock.spin();tallySpin=true;ceremonyFrom=confirmation;ceremonyElapsed=0;},remote(){clock.spin();tallySpin=true;remoteElapsed=0;},
    focus(native){
      if(native==='clock'){host.scrollTo(0);return;}
      if(typeof native==='string'){const surface=workSurfaces.get(native);if(surface)focusSurface(surface);return;}
      const surface=anchorSurface.get(native)||destinationSurfaces.get(native);if(surface)focusSurface(surface);
    },
    capturePose(){return{position:camera.position.toArray(),target:target.toArray(),fov:camera.fov,secretLean,poolPressure,decorativeTime,ceremonyElapsed,remoteElapsed,confirmation,ceremonyFrom,selected,activePlaque};},
    restorePose(pose){if(!pose)return;approach=null;camera.position.fromArray(pose.position);target.fromArray(pose.target);camera.fov=pose.fov;secretLean=pose.secretLean;poolPressure=pose.poolPressure;decorativeTime=pose.decorativeTime;ceremonyElapsed=pose.ceremonyElapsed;remoteElapsed=pose.remoteElapsed;confirmation=pose.confirmation;ceremonyFrom=pose.ceremonyFrom;selected=pose.selected;settlePlaques(pose.activePlaque||null);camera.lookAt(target);camera.updateProjectionMatrix();placeTitle();},
    freeze(value){frozen=value;},cancelApproach(){approach=null;},cancelInput(reason){if(['blur','visibility','pagehide','graphics'].includes(reason))approach=null;},
    reducedMotion(value){if(value){const travel=approach;approach=null;ceremonyElapsed=99;remoteElapsed=99;confirmation=0;if(travel){camera.position.copy(travel.to);target.copy(travel.toTarget);camera.fov=travel.toFov;camera.lookAt(target);camera.updateProjectionMatrix();travel.onDone?.();}}clock.update();tally.set(host.getTally(),performance.now()/1000,{immediate:true});},
    dispose(){clock.dispose();tally.dispose();}
  };
}
