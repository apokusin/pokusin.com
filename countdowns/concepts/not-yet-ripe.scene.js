// An impossible botanical plate. The branch, anatomy and paper carry the UI.
export async function create(host) {
  const T=host.THREE,version=document.documentElement.dataset.artVersion,base='assets/concepts/not-yet-ripe/scene/';
  const {canvasInk,labelInk}=await import('../scene-gallery.js?v='+version);
  const manifest=await fetch(base+'manifest.json?v='+version).then(response=>{if(!response.ok)throw new Error('Botanical manifest unavailable');return response.json();});
  const loadFont=async(name,file)=>{const face=new FontFace(name,`url(${base}typography/${file}?v=${version})`,{weight:'100 900'});host.own({dispose(){document.fonts.delete(face);}});await face.load();if(host.disposed)throw new Error('Botanical scene was replaced while loading its type');document.fonts.add(face);};
  const [model,ripenessMap,leafThickness,fleshThickness]=await Promise.all([
    host.loadGLB(base+(host.mobile&&manifest.phoneAsset?manifest.phoneAsset:'scene.glb')),
    host.texture(base+'materials/peel-ripeness-mask.png',{colorSpace:'linear',flipY:false}),
    host.texture(base+'materials/leaf-thickness.png',{colorSpace:'linear',flipY:false}),
    host.texture(base+'materials/flesh-thickness.png',{colorSpace:'linear',flipY:false}),
    loadFont('Specimen Bodoni','BodoniModa-variable.ttf'),loadFont('Specimen Condensed','RobotoCondensed-variable.ttf')
  ]);
  await document.fonts.ready;
  const pulpAO=await Promise.all(Array.from({length:4},(_,index)=>host.texture(base+'materials/pulp-local-ao-'+index+'.png',{colorSpace:'linear',flipY:false})));
  const botany=model.scene;host.root.add(botany);
  const node=name=>{const object=botany.getObjectByName(name);if(!object)throw new Error('Missing botanical object: '+name);return object;};
  document.documentElement.style.setProperty('--scene-utility-ink','#252318');document.documentElement.style.setProperty('--scene-menu-paper','#eee8d6');
  host.scene.background=new T.Color('#f0e8d5');host.renderer.toneMappingExposure=1.10;host.renderer.shadowMap.type=T.VSMShadowMap;
  botany.traverse(object=>{if(object.isMesh){object.castShadow=!/^(archive_|caption_|clock_|unit_ink|again_leaf_print|destination_|specimen_sweep|bee_wing)/.test(object.name);object.receiveShadow=!/^(archive_|caption_|destination_)/.test(object.name);}});
  const sun=host.own(new T.DirectionalLight('#ffedc3',3.55));sun.position.set(-13,18,14);sun.target.position.set(0,4,0);sun.castShadow=true;
  sun.shadow.mapSize.set(host.mobile?1024:2048,host.mobile?1024:2048);Object.assign(sun.shadow.camera,{left:-14,right:14,top:16,bottom:-14,near:1,far:70});
  sun.shadow.normalBias=.028;sun.shadow.bias=-.00010;sun.shadow.radius=4;sun.shadow.blurSamples=8;sun.shadow.intensity=.27;host.scene.add(sun,sun.target);
  const fill=host.own(new T.DirectionalLight('#dce5ed',.68));fill.position.set(13,7,15);host.scene.add(fill);
  const back=host.own(new T.DirectionalLight('#ffe2a4',.45));back.position.set(-3,10,-8);host.scene.add(back);
  host.scene.add(host.own(new T.HemisphereLight('#f5f0e3','#6b654f',.60)));
  const environmentScene=new T.Scene();environmentScene.background=new T.Color('#d7d3c3');
  const window=host.own(new T.Mesh(new T.PlaneGeometry(12,10),new T.MeshBasicMaterial({color:new T.Color(2.3,2.1,1.7),side:T.DoubleSide})));
  window.position.set(-14,20,10);window.lookAt(0,4,0);environmentScene.add(window);
  const juiceWindow=host.own(new T.Mesh(new T.PlaneGeometry(3.2,12),new T.MeshBasicMaterial({color:new T.Color(3.1,2.9,2.5),side:T.DoubleSide})));
  juiceWindow.position.set(-4,7,19);juiceWindow.lookAt(0,4,0);environmentScene.add(juiceWindow);
  const pmrem=host.own(new T.PMREMGenerator(host.renderer)),environment=host.own(pmrem.fromScene(environmentScene,.035,.1,100));host.scene.environment=environment.texture;host.scene.environmentIntensity=.42;

  // A drawn botanical field is on a distant wall. It supplies no plant geometry.
  const wall=node('specimen_sweep'),drawing=document.createElement('canvas');drawing.width=1024;drawing.height=2048;
  const dc=drawing.getContext('2d');dc.fillStyle='#eee8d7';dc.fillRect(0,0,1024,2048);dc.strokeStyle='rgba(73,65,42,.085)';dc.lineWidth=.65;
  let seed=1327;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let specimen=0;specimen<22;specimen++){
    dc.save();dc.translate(60+random()*900,random()*2000);dc.rotate((random()-.5)*1.2);
    const length=80+random()*110;dc.beginPath();dc.moveTo(0,length);dc.bezierCurveTo(-8,20,12,-20,0,-length);dc.stroke();
    for(let side=-1;side<=1;side+=2)for(let k=0;k<4;k++){
      const at=(k-.5)*length*.35,reach=35+random()*45;dc.beginPath();dc.moveTo(0,at);dc.bezierCurveTo(side*reach*.95,at+8,side*reach,at-35,side*reach*.25,at-65);dc.bezierCurveTo(side*reach*.1,at-45,side*reach*.1,at-15,0,at);dc.stroke();
      for(let vein=1;vein<5;vein++){dc.beginPath();dc.moveTo(side*reach*.09,at-vein*8);dc.lineTo(side*reach*.60,at-vein*8-9);dc.stroke();}
    }dc.restore();
  }
  const wallTexture=host.own(new T.CanvasTexture(drawing));wallTexture.colorSpace=T.SRGBColorSpace;wallTexture.flipY=false;wall.material=host.own(new T.MeshStandardMaterial({map:wallTexture,roughness:1}));wall.castShadow=false;
  // Thin-edge warmth is a bounded surface approximation, never volumetric SSS.
  const transmittedMaterials=new Map();
  botany.traverse(object=>{
    if(!object.isMesh||!/^(leaf_|tag_leaf_|gold_notched_fold$)/.test(object.name)||object.name.endsWith('_central_vein'))return;
    const original=object.material;
    if(!transmittedMaterials.has(original)){
      const material=host.own(original.clone());material.side=T.DoubleSide;material.color.set('#a6b779');material.normalScale?.set(.22,.22);material.clearcoat=.32;material.clearcoatRoughness=.27;
      material.onBeforeCompile=shader=>{
        shader.uniforms.specimenLeafThickness={value:leafThickness};
        shader.fragmentShader='uniform sampler2D specimenLeafThickness;\n'+shader.fragmentShader
          .replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.135,.175,.027),.28);')
          .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nfloat botanicalThickness=texture2D(specimenLeafThickness,vMapUv).r;\nroughnessFactor=mix(.34,.63,botanicalThickness);')
          .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nvec3 botanicalNormal=inverseTransformDirection(normalize(vNormal),viewMatrix);\nfloat leafThin=1.-texture2D(specimenLeafThickness,vMapUv).r;\nfloat leafThrough=pow(max(0.,dot(-botanicalNormal,normalize(vec3(-13.,18.,14.)))),2.);\ntotalEmissiveRadiance+=vec3(.055,.09,.009)*leafThin*leafThrough;');
      };
      material.customProgramCacheKey=()=> 'botanical-thin-leaf-v1';transmittedMaterials.set(original,material);
    }object.material=transmittedMaterials.get(original);
  });
  const fleshMaterials=new Map();
  botany.traverse(object=>{
    if(!object.isMesh||!/^longitudinal_flesh_|^reset_concave_flesh$/.test(object.name))return;
    const original=object.material,index=Number(object.name.match(/longitudinal_flesh_(\d)/)?.[1]),key=object.name;
    if(!fleshMaterials.has(key)){
      const material=host.own(original.clone());material.clearcoat=.94;material.clearcoatRoughness=.055;material.normalScale?.set(.55,.55);
      material.clearcoatNormalMap=material.normalMap;material.clearcoatNormalScale?.set(.23,.23);
      material.transmission=.22;material.thickness=.45;material.thicknessMap=fleshThickness;material.ior=1.34;material.attenuationColor=new T.Color('#e7ba53');material.attenuationDistance=1.7;
      if(Number.isFinite(index)){material.aoMap=pulpAO[index];material.aoMapIntensity=.40;}
      material.onBeforeCompile=shader=>{
        shader.uniforms.specimenFleshThickness={value:fleshThickness};
        shader.fragmentShader='uniform sampler2D specimenFleshThickness;\n'+shader.fragmentShader
          .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nfloat vesicleThickness=texture2D(specimenFleshThickness,vMapUv).r;\nroughnessFactor=mix(.055,.13,vesicleThickness);')
          .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nvec3 fleshWorldNormal=inverseTransformDirection(normalize(vNormal),viewMatrix);\nfloat fleshWarmth=pow(max(0.,dot(-fleshWorldNormal,normalize(vec3(-13.,18.,14.)))),2.);\ntotalEmissiveRadiance+=vec3(.115,.073,.016)*(1.-vesicleThickness)*fleshWarmth;');
      };material.customProgramCacheKey=()=> 'botanical-moist-flesh-v1';fleshMaterials.set(key,material);
    }object.material=fleshMaterials.get(key);
  });
  function trueRipeness(){
    const snapshot=host.getSnapshot?.();if(!snapshot?.ready||!Number.isFinite(snapshot.deadline))return 0;
    const end=new Date(snapshot.deadline),start=new Date(snapshot.deadline),day=end.getUTCDate();start.setUTCDate(1);start.setUTCMonth(start.getUTCMonth()-1);
    const last=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0)).getUTCDate();start.setUTCDate(Math.min(day,last));
    return T.MathUtils.clamp(1-(snapshot.deadline-snapshot.now)/(snapshot.deadline-start.getTime()),0,1);
  }
  let displayedRipeness=trueRipeness(),ceremonyFrom=displayedRipeness,ceremonyElapsed=99,remoteElapsed=99,localTime=0,frozen=false,selected=null,hovered=null,approach=null,pressure=0,secret=0;
  const peelUniforms=manifest.peels.map(name=>{
    const peel=node(name),material=host.own(peel.material.clone()),ripe={value:displayedRipeness},before={value:displayedRipeness},front={value:1},age={value:name.includes('_3')?(name.endsWith('_1')?.82:.45):.035};material.color.set('#ffffff');material.normalScale?.set(.72,.72);material.clearcoat=.38;material.clearcoatRoughness=.22;
    if(name.startsWith('front_peel_lip_')){
      // Broaden the actual cut rind inward without expanding the portrait crop.
      const side=name.endsWith('_-1')?-1:1,geometry=host.own(peel.geometry.clone()),positions=geometry.attributes.position,uv=geometry.attributes.uv;
      for(let index=0;index<positions.count;index++){const across=uv.getX(index),along=uv.getY(index),round=Math.sin(Math.PI*across);positions.setX(index,positions.getX(index)-side*.13*across);positions.setZ(index,positions.getZ(index)+.07*round+.018*Math.sin(along*37+across*17)*round);}
      geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();peel.geometry=geometry;
    }
    material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,{specimenRipeness:ripe,specimenBefore:before,specimenFront:front,specimenAge:age,specimenMask:{value:ripenessMap},specimenGreen:{value:new T.Color('#88a62c')},specimenYellow:{value:new T.Color('#efa426')}});
      shader.vertexShader='varying vec2 specimenPeelUV;\n'+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nspecimenPeelUV=vec2(uv.x,1.-uv.y);');
      shader.fragmentShader='varying vec2 specimenPeelUV;\nuniform float specimenRipeness,specimenBefore,specimenFront,specimenAge;uniform sampler2D specimenMask;uniform vec3 specimenGreen,specimenYellow;\n'+shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat peelMottle=texture2D(specimenMask,specimenPeelUV).r;\nfloat unevenFront=smoothstep(specimenPeelUV.y-.065,specimenPeelUV.y+.065,specimenFront*1.3-.15+(peelMottle-.5)*.18);\nfloat currentRipe=mix(specimenBefore,specimenRipeness,unevenFront);\nfloat fruitColour=clamp(currentRipe*.88+(peelMottle-.42)*.42+specimenAge*(.55+peelMottle),0.,1.);\nvec3 peelColour=mix(specimenGreen,specimenYellow,fruitColour);\nfloat peelScar=smoothstep(.72,.88,peelMottle)*.24;\ndiffuseColor.rgb*=mix(peelColour,vec3(.25,.16,.045),peelScar);');
    };material.customProgramCacheKey=()=> 'longitudinal-ripeness-v2';peel.material=material;return {ripe,before,front};
  });
  const resetLobes=[node('reset_unequal_peel_lobe_0'),node('reset_unequal_peel_lobe_1')],resetLobeRest=resetLobes.map(object=>object.position.clone());
  const camera=new T.PerspectiveCamera(34,innerWidth/innerHeight,.1,150);host.useCamera(camera);host.scene.add(camera);
  const target=new T.Vector3(),openingPose=manifest.camera;
  const titleGeometry=new T.PlaneGeometry(12.8,1.9),uv=titleGeometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));
  const title=host.own(new T.Mesh(titleGeometry,new T.MeshBasicMaterial()));title.position.set(-9.42,4.15,1.8);title.rotation.z=Math.PI/2;title.userData.scenePassthrough=true;host.root.add(title);
  labelInk(host,title,'COUNTDOWNS',{font:'900 248px "Specimen Condensed"',color:'#231e1d',width:2048,height:340});title.castShadow=false;title.material.depthTest=true;
  if(host.mobile)title.visible=false;
  const clockSurfaces=manifest.clock.map(node);
  clockSurfaces.forEach((surface,index)=>{
    // Use the same triangulation as the actual pulp. Independent fine relief
    // grids crossed between samples and cut holes through the printed strokes.
    surface.geometry.computeBoundingBox();const bounds=surface.geometry.boundingBox.clone(),geometry=host.own(node('longitudinal_flesh_'+index).geometry.clone()),positions=geometry.attributes.position,normals=geometry.attributes.normal,uv=geometry.attributes.uv;
    for(let vertex=0;vertex<positions.count;vertex++){
      uv.setXY(vertex,(positions.getX(vertex)-bounds.min.x)/(bounds.max.x-bounds.min.x),(bounds.max.y-positions.getY(vertex))/(bounds.max.y-bounds.min.y));
      positions.setXYZ(vertex,positions.getX(vertex)+normals.getX(vertex)*.012,positions.getY(vertex)+normals.getY(vertex)*.012,positions.getZ(vertex)+normals.getZ(vertex)*.012);
    }
    geometry.computeBoundingBox();geometry.computeBoundingSphere();surface.geometry=geometry;
  });
  const clock=host.numerals({surfaces:clockSurfaces,font:'850 650px "Specimen Condensed"',width:512,height:768,baseline:.48,ink:'#382228'});
  clock.faces.forEach(([face])=>{face.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(vMapUv.x<0.||vMapUv.x>1.||vMapUv.y<0.||vMapUv.y>1.)discard;');};face.material.customProgramCacheKey=()=> 'botanical-pulp-ink-v1';});
  const crispInk=ink=>{ink.texture.minFilter=T.LinearMipmapLinearFilter;ink.texture.magFilter=T.LinearFilter;ink.texture.generateMipmaps=true;ink.texture.anisotropy=Math.min(8,host.renderer.capabilities.getMaxAnisotropy());ink.texture.needsUpdate=true;return ink;};
  function clearPaperInk(face){
    face.geometry=host.own(face.geometry.clone());const p=face.geometry.attributes.position,n=face.geometry.attributes.normal;
    if(n)for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+n.getX(i)*.035,p.getY(i)+n.getY(i)*.035,p.getZ(i)+n.getZ(i)*.035);
    p.needsUpdate=true;face.geometry.computeBoundingSphere();
  }
  manifest.clock.forEach((name,index)=>{const face=node('unit_ink_'+index);clearPaperInk(face);crispInk(labelInk(host,face,['D','H','M','S'][index],{font:'700 160px Georgia',color:'#35251e',width:256,height:256}));face.castShadow=false;});
  const reset=node('again_leaf_print'),tally=node('press_tally_tag'),fold=node('gold_notched_fold'),bee=node('bounded_bee');
  const tallyBed=host.own(new T.Mesh(tally.geometry.clone(),tally.material));tallyBed.position.copy(tally.position);tallyBed.quaternion.copy(tally.quaternion);tallyBed.scale.copy(tally.scale);tallyBed.position.z-=.008;tally.parent.add(tallyBed);tallyBed.castShadow=false;tallyBed.receiveShadow=true;
  const resetInk=labelInk(host,reset,'Again',{font:'600 246px "Specimen Bodoni"',color:'#382127',width:1024,height:420});
  const tallyInk=canvasInk(host,tally,(ctx,w,h)=>{ctx.fillStyle='#382127';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 190px "Specimen Bodoni"';ctx.fillText(String(host.getTally()),w*.5,h*.46,w*.88);},{width:256,height:384});let lastCount=host.getTally();
  const groupOrder=['dexter','severance','got','sherlock','archer','breaking-bad','house-of-cards'];
  const records=manifest.archives.map(record=>{
    const exhibit=host.exhibits.find(item=>item.href===`/countdowns/${record.show}/${record.slug}/`);if(!exhibit)throw new Error('Missing faithful botanical archive: '+record.id);
    return {...record,exhibit,surface:node(record.screen),rig:node(record.rig)};
  });
  const nativeSurfaces=new Map(),firstByShow=new Map(),recordBySurface=new Map();
  function surfacePose(surface){
    surface.updateWorldMatrix(true,false);const center=new T.Box3().setFromObject(surface).getCenter(new T.Vector3());
    const normal=new T.Vector3().fromBufferAttribute(surface.geometry.attributes.normal,0).transformDirection(surface.matrixWorld);
    surface.geometry.computeBoundingBox();const size=surface.geometry.boundingBox.getSize(new T.Vector3());
    const dimension=[size.x,size.y,size.z].sort((a,b)=>b-a),fov=host.mobile?38:34,tan=Math.tan(T.MathUtils.degToRad(fov/2)),aspect=innerWidth/innerHeight;
    const distance=Math.max(dimension[1]/(tan*1.42),dimension[0]/(aspect*tan*1.42))+.40;
    return {position:center.clone().addScaledVector(normal,distance),target:center,fov};
  }
  function aim(surface,{immediate=false,onDone}={}){
    const pose=surfacePose(surface);camera.fov=pose.fov;camera.updateProjectionMatrix();
    if(host.reduced||immediate){camera.position.copy(pose.position);target.copy(pose.target);camera.lookAt(target);approach=null;onDone?.();}
    else approach={from:camera.position.clone(),fromTarget:target.clone(),to:pose.position,toTarget:pose.target,start:performance.now()/1000,duration:.66,onDone};host.wake();
  }
  function focusSurface(surface){
    const record=recordBySurface.get(surface),index=record?records.indexOf(record):-1;
    if(index>=0&&Math.abs(host.progress-(index+1)/records.length)>.001)host.scrollTo((index+1)/records.length);
    selected=surface;aim(surface,{immediate:true});
  }
  async function mountStill(record){
    const texture=await host.texture(record.exhibit.thumbnail,{colorSpace:'srgb',flipY:false}),image=texture.image;
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(1024*record.height/record.width);const ctx=canvas.getContext('2d');
    const ratio=Math.min(canvas.width/image.width,canvas.height/image.height);ctx.fillStyle='#171817';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,(canvas.width-image.width*ratio)/2,(canvas.height-image.height*ratio)/2,image.width*ratio,image.height*ratio);
    const map=host.own(new T.CanvasTexture(canvas));map.flipY=false;map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(4,host.renderer.capabilities.getMaxAnisotropy());record.surface.material=host.own(new T.MeshBasicMaterial({map,toneMapped:false}));
  }
  await Promise.all(records.map(async(record,index)=>{
    await mountStill(record);nativeSurfaces.set(record.exhibit.anchor,record.surface);recordBySurface.set(record.surface,record);if(!firstByShow.has(record.show))firstByShow.set(record.show,record.surface);
    clearPaperInk(node(record.caption));crispInk(labelInk(host,node(record.caption),record.initial?record.exhibit.showName:record.exhibit.label+(record.exhibit.live?' · LIVE':''),{font:'600 100px Georgia',color:'#332b1e',width:1024,height:128}));
    host.bind(record.surface,{native:record.exhibit.anchor,kind:'preview',hover:({active})=>{hovered=active?record.surface:hovered===record.surface?null:hovered;host.wake();},focus:()=>focusSurface(record.surface),blur:()=>{if(selected===record.surface)selected=null;},activate:()=>{selected=record.surface;aim(record.surface,{onDone:()=>host.openPreview(record.exhibit,{surface:record.surface})});}});
  }));
  const extra=host.destinations.archive.map(destination=>({...destination,kind:'archive',label:'More ↗'}));
  if(host.destinations.timeline)extra.push({show:'dexter',kind:'timeline',anchor:host.destinations.timeline,label:'Timeline'});
  if(host.destinations.live)extra.push({show:'severance',kind:'live',anchor:host.destinations.live,label:'Live ↗'});
  for(const destination of extra){
    const entry=manifest.destinations.find(item=>item.show===destination.show&&item.kind===destination.kind);if(!entry)throw new Error('Missing physical botanical destination: '+destination.show+'/'+destination.kind);
    const surface=node(entry.surface),parent=node(entry.parent);labelInk(host,surface,'↗',{font:'400 190px "Specimen Bodoni"',color:'#332b1e',width:256,height:256});nativeSurfaces.set(destination.anchor,surface);
    host.bind(surface,{native:destination.anchor,kind:'link',focus:()=>{focusSurface(parent);selected=surface;}});
    const hitGeometry=surface.geometry.clone();hitGeometry.scale(2.25,2.25,2.25);
    const hit=host.own(new T.Mesh(hitGeometry,new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide})));
    hit.position.copy(surface.position);hit.quaternion.copy(surface.quaternion);hit.scale.copy(surface.scale);
    hit.position.add(new T.Vector3().fromBufferAttribute(surface.geometry.attributes.normal,0).applyQuaternion(surface.quaternion).multiplyScalar(.014));surface.parent.add(hit);hit.castShadow=false;
    host.bind(hit,{native:destination.anchor,kind:'link',focus:()=>{focusSurface(parent);selected=surface;}});
  }
  function opening(){
    approach=null;selected=null;camera.fov=host.mobile?38:openingPose.fov;
    if(host.mobile){const distance=8.8/(2*Math.tan(T.MathUtils.degToRad(19))*(innerWidth/innerHeight));target.set(0,1.5,0);camera.position.set(0,1.5,distance);}
    else{camera.position.fromArray(openingPose.positionGLTF);target.fromArray(openingPose.targetGLTF);}
    camera.lookAt(target);camera.updateProjectionMatrix();
  }
  function resetFocus(){host.scrollTo(0);opening();selected=reset;}
  // The whole split specimen is the visible button. Its concave pulp extends
  // beyond the ink rectangle and must not occlude a press on that same action.
  host.bind(node('split_reset_rig'),{native:host.dom.reset,kind:'reset',activate:host.requestReset});
  resetLobes.forEach(surface=>host.bind(surface,{native:host.dom.reset,kind:'reset',activate:host.requestReset}));
  // The native twin belongs to the central action, although either rind accepts
  // a pointer press. Bind it last so keyboard focus returns to the whole fruit.
  host.bind(reset,{native:host.dom.reset,kind:'reset',focus:resetFocus,activate:host.requestReset});
  const secretProxy=host.own(new T.Mesh(new T.SphereGeometry(host.mobile?.78:.50,12,8),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));
  fold.getWorldPosition(secretProxy.position);secretProxy.position.z+=.48;host.root.add(secretProxy);
  host.bind(secretProxy,{native:host.dom.secretButton,kind:'secret',focus:()=>{host.scrollTo(0);opening();secret=1;},activate:()=>{secret=secret?0:1;host.revealSecret();host.wake();}});
  // The phone specimen has its own authored leaf arrangement. Read its actual
  // rigs rather than require the desktop-only botanical decoration names.
  const branch=node('branch_hierarchy'),fruitRigs=manifest.fruitRigs.map(node),leafRigs=[] ,tagRigs=records.map(record=>record.rig);
  botany.traverse(object=>{if(/^leaf_/.test(object.name)&&!/_central_vein$/.test(object.name))leafRigs.push(object);});
  if(!leafRigs.length)throw new Error('The botanical specimen has no authored leaves');
  const rotations=new Map([...fruitRigs,...leafRigs,...tagRigs,branch].map(object=>[object,object.quaternion.clone()]));
  const axis=new T.Vector3(0,0,1),bend=new T.Quaternion(),leafAxis=new T.Vector3(0,1,0),leafBend=new T.Quaternion(),beeRest=bee.position.clone(),sunOffset=new T.Vector3(-13,18,14),curlTip=node('upper_curl');
  const outline=host.own(new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#564a27',transparent:true,opacity:.7,depthTest:false})));outline.matrixAutoUpdate=false;outline.userData.scenePassthrough=true;host.root.add(outline);let outlined=null;
  host.setScrollStops(records.length+1);
  function navigation(progress){
    approach=null;selected=null;if(progress<.012){opening();return;}
    const travel=progress*records.length,at=Math.min(records.length-1,Math.floor(travel)),fraction=travel-at;
    const first=surfacePose(records[at].surface),previous=at===0?{position:new T.Vector3(...(host.mobile?manifest.phoneCamera.positionGLTF:openingPose.positionGLTF)),target:new T.Vector3(...(host.mobile?manifest.phoneCamera.targetGLTF:openingPose.targetGLTF))}:surfacePose(records[at-1].surface);
    const ease=fraction*fraction*(3-2*fraction);camera.fov=host.mobile?38:34;camera.position.lerpVectors(previous.position,first.position,ease);target.lerpVectors(previous.target,first.target,ease);camera.lookAt(target);camera.updateProjectionMatrix();
  }
  function frame(time,dt){
    clock.update(time);if(lastCount!==host.getTally()){lastCount=host.getTally();tallyInk.update();}
    if(!frozen){localTime+=dt;ceremonyElapsed+=dt;remoteElapsed+=dt;}
    const actualRipeness=trueRipeness();
    const duration=1.5,transition=T.MathUtils.clamp(ceremonyElapsed/duration,0,1);
    displayedRipeness=host.reduced?actualRipeness:T.MathUtils.lerp(ceremonyFrom,actualRipeness,transition*transition*(3-2*transition));
    peelUniforms.forEach((uniform,index)=>{
      const phase=host.reduced?1:T.MathUtils.clamp((ceremonyElapsed-(Math.floor(index/3)%4)*.08)/1.20,0,1);uniform.ripe.value=actualRipeness;uniform.before.value=ceremonyFrom;uniform.front.value=phase;
    });
    pressure=host.reduced?(host.pending?1:0):T.MathUtils.damp(pressure,host.pending?1:0,16,dt||1/60);if(reset.morphTargetInfluences)reset.morphTargetInfluences[0]=pressure;
    resetLobes.forEach((object,index)=>{object.position.copy(resetLobeRest[index]);object.position.y+=(index?-.025:.025)*pressure;});
    const response=host.reduced?0:(remoteElapsed<.32?Math.sin(remoteElapsed/.32*Math.PI)*.013:0);
    const focus=selected||hovered;
    const sway=host.reduced||focus?0:Math.sin(localTime*.54)*.0032;branch.quaternion.copy(rotations.get(branch)).multiply(bend.setFromAxisAngle(axis,sway));
    fruitRigs.forEach((rig,index)=>{const angle=host.reduced||focus?0:Math.sin(localTime*.61-index*.19)*.006;rig.quaternion.copy(rotations.get(rig)).multiply(bend.setFromAxisAngle(axis,angle));});
    leafRigs.forEach((leaf,index)=>{const angle=host.reduced||focus?response:Math.sin(localTime*.83-index*.29)*.019+response;leaf.quaternion.copy(rotations.get(leaf)).multiply(leafBend.setFromAxisAngle(leafAxis,angle));});
    tagRigs.forEach((rig,index)=>{const active=recordBySurface.get(focus)?.rig===rig,angle=host.reduced||active?0:Math.sin(localTime*.64-index*.21)*.006;rig.quaternion.copy(rotations.get(rig)).multiply(bend.setFromAxisAngle(axis,angle));});
    if(fold.morphTargetInfluences)fold.morphTargetInfluences[0]=host.reduced?secret:T.MathUtils.damp(fold.morphTargetInfluences[0],secret,12,dt||1/60);
    if(curlTip.morphTargetInfluences)curlTip.morphTargetInfluences[0]=host.reduced||ceremonyElapsed>1.5?0:Math.sin(ceremonyElapsed/1.5*Math.PI);
    if(!host.reduced){bee.position.copy(beeRest);bee.position.x+=Math.sin(localTime*.47)*.42;bee.position.y+=Math.sin(localTime*.68)*.22;bee.position.z+=Math.cos(localTime*.83)*.18;}
    if(approach&&!frozen){const phase=Math.min(1,(time-approach.start)/approach.duration),ease=phase*phase*(3-2*phase);camera.position.lerpVectors(approach.from,approach.to,ease);target.lerpVectors(approach.fromTarget,approach.toTarget,ease);camera.lookAt(target);if(phase>=1){const done=approach.onDone;approach=null;done?.();}}
    outline.visible=!!focus;if(focus){if(outlined!==focus){outline.geometry.dispose();outline.geometry=host.own(new T.EdgesGeometry(focus.geometry,45));outlined=focus;}focus.updateWorldMatrix(true,false);outline.matrix.copy(focus.matrixWorld);}
    sun.target.position.set(target.x,target.y,0);sun.position.copy(sun.target.position).add(sunOffset);sun.target.updateMatrixWorld();
  }
  opening();host.registerOccluder(botany);
  return {ready:true,frame,navigation,
    celebrate(){clock.spin();ceremonyFrom=displayedRipeness;ceremonyElapsed=0;},remote(){clock.spin();remoteElapsed=0;ceremonyFrom=displayedRipeness;ceremonyElapsed=99;},
    resize(){if(!frozen)navigation(host.progress);},focus(native){if(native==='clock'){host.scrollTo(0);return;}if(typeof native==='string'){const surface=firstByShow.get(native);if(surface)focusSurface(surface);return;}const surface=nativeSurfaces.get(native);if(surface)focusSurface(surface);},
    capturePose(){return{position:camera.position.toArray(),target:target.toArray(),fov:camera.fov,localTime,secret,pressure,selected};},restorePose(pose){if(!pose)return;approach=null;camera.position.fromArray(pose.position);target.fromArray(pose.target);camera.fov=pose.fov;localTime=pose.localTime;secret=pose.secret;pressure=pose.pressure;selected=pose.selected;camera.lookAt(target);camera.updateProjectionMatrix();},
    freeze(value){frozen=value;},cancelApproach(){approach=null;},cancelInput(){},dispose(){clock.dispose();}
  };
}
