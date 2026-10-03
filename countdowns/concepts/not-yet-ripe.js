// A living specimen plate: real citrus halves and a bounded botanical reversal.
export function create(ctx) {
  const T=ctx.THREE,group=new T.Group();ctx.root.add(group);ctx.scene.background=null;
  ctx.renderer.setClearColor(0xf1ead8,0);ctx.renderer.toneMappingExposure=1.03;
  ctx.renderer.shadowMap.type=T.VSMShadowMap;
  const hemi=new T.HemisphereLight(0xe7eed8,0x65583a,.72);
  const key=new T.DirectionalLight(0xfff1d5,3.15);key.position.set(-6,8,10);key.castShadow=true;
  key.shadow.mapSize.set(ctx.mobile?1024:2048,ctx.mobile?1024:2048);
  Object.assign(key.shadow.camera,{left:-11,right:11,top:10,bottom:-10,near:.1,far:36});key.shadow.normalBias=.025;key.shadow.bias=-.00015;key.shadow.radius=5;key.shadow.blurSamples=10;
  const rim=new T.DirectionalLight(0xffe9b6,.60);rim.position.set(6,1,-3);ctx.root.add(hemi,key,rim);
  const sweep=new T.Mesh(new T.PlaneGeometry(60,60),new T.ShadowMaterial({color:0x55492e,opacity:.11}));
  sweep.position.z=-2.4;sweep.receiveShadow=true;ctx.root.add(sweep);
  const studio=document.createElement('canvas');studio.width=256;studio.height=128;const drawStudio=studio.getContext('2d');
  drawStudio.fillStyle='#7e775c';drawStudio.fillRect(0,0,256,128);drawStudio.fillStyle='#ece7d2';drawStudio.fillRect(43,18,39,85);drawStudio.fillStyle='#9ca891';drawStudio.fillRect(168,15,55,64);
  const source=new T.CanvasTexture(studio);source.colorSpace=T.SRGBColorSpace;source.mapping=T.EquirectangularReflectionMapping;
  const pmrem=new T.PMREMGenerator(ctx.renderer),environment=pmrem.fromEquirectangular(source);pmrem.dispose();source.dispose();ctx.scene.environment=environment.texture;
  const green=new T.Color(0x91bb27),saffron=new T.Color(0xe5a834),plum=new T.Color(0x492345);
  const pores=new Uint8Array(256*256*4),peelMask=new Uint8Array(256*256*4),peelRough=new Uint8Array(256*256*4),leafGrain=new Uint8Array(256*256*4);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const i=(y*256+x)*4,hash=Math.sin(x*127.13+y*319.7)*43758.5453,n=hash-Math.floor(hash);
    const cell=Math.sin(Math.floor(x/9)*73.17+Math.floor(y/8)*117.53)*43758.31,jitter=cell-Math.floor(cell);
    const cellX=x%9-3.5-jitter*2,cellY=y%8-3.2-jitter*1.6,pit=Math.exp(-(cellX*cellX+cellY*cellY)/(3.6+jitter*4));
    const v=175-pit*72+(n-.5)*34;pores[i]=pores[i+1]=pores[i+2]=v;pores[i+3]=255;peelRough[i]=peelRough[i+1]=peelRough[i+2]=255-pit*85;peelRough[i+3]=255;
    const m=.90+.08*Math.sin(x*.04+y*.016)+.03*Math.sin(y*.28+x*.08);
    peelMask[i]=Math.min(255,242*m);peelMask[i+1]=Math.min(255,244*m);peelMask[i+2]=185*m;peelMask[i+3]=255;
    const lx=x/256-.5,ly=y/256,vein=Math.exp(-Math.abs(lx)*150),secondary=Math.pow(Math.abs(Math.sin(ly*45+Math.abs(lx)*34)),36);
    leafGrain[i]=60+vein*38+secondary*24+n*5;leafGrain[i+1]=86+vein*31+secondary*20+n*7;leafGrain[i+2]=25+vein*15+secondary*9;leafGrain[i+3]=255;
  }
  const poreTexture=new T.DataTexture(pores,256,256);poreTexture.wrapS=poreTexture.wrapT=T.RepeatWrapping;poreTexture.repeat.set(2,2);poreTexture.needsUpdate=true;
  const peelRoughTexture=new T.DataTexture(peelRough,256,256);peelRoughTexture.wrapS=peelRoughTexture.wrapT=T.RepeatWrapping;peelRoughTexture.repeat.set(2,2);peelRoughTexture.needsUpdate=true;
  const peelTexture=new T.DataTexture(peelMask,256,256);peelTexture.colorSpace=T.SRGBColorSpace;peelTexture.wrapS=peelTexture.wrapT=T.RepeatWrapping;peelTexture.needsUpdate=true;
  const segmentAngles=Array.from({length:10},(_,i)=>i*Math.PI/5+.065*Math.sin(i*1.71));
  const fleshBytes=new Uint8Array(512*512*4);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const i=(y*512+x)*4,px=(x-255.5)/256,py=(y-255.5)/256,r=Math.hypot(px,py),a=Math.atan2(py,px);
    let membrane=0;
    for(let j=0;j<segmentAngles.length;j++){const boundary=segmentAngles[j]+.055*Math.sin(r*3.3+j*.7)*(1-r),difference=Math.atan2(Math.sin(a-boundary),Math.cos(a-boundary));
      const width=.013+.009*(.5+.5*Math.sin(j*2.17));membrane=Math.max(membrane,Math.exp(-difference*difference/(width*width)));}
    // Unequal elongated vesicles replace the former perfect printed radial wheel.
    const arc=(a+Math.PI)/(Math.PI*2)*58+.16*Math.sin(r*17+a*3),column=Math.floor(arc),jitter=Math.sin(column*73.13)*43758.5;
    const offset=jitter-Math.floor(jitter),row=r*(29+offset*7)+offset*.71+.16*Math.sin(a*19+r*7);
    const u=arc-Math.floor(arc)-.5,v=row-Math.floor(row)-.5;
    const vesicle=Math.exp(-(u*u*(10+offset*6)+v*v*19)),noise=Math.sin(x*12.43+y*97.72)*435.38;
    const pith=Math.max(0,Math.min(1,(r-.82-.016*Math.sin(a*7))/.085)),core=Math.exp(-r*r*220);
    const light=.77+.16*vesicle+.12*membrane+(noise-Math.floor(noise)-.5)*.019;
    fleshBytes[i]=(236*light)*(1-pith)+244*pith+core*8;fleshBytes[i+1]=(225*light)*(1-pith)+234*pith+core*10;fleshBytes[i+2]=(180*light)*(1-pith)+207*pith+core*20;fleshBytes[i+3]=255;
  }
  const fleshTexture=new T.DataTexture(fleshBytes,512,512);fleshTexture.colorSpace=T.SRGBColorSpace;fleshTexture.needsUpdate=true;
  const fleshMaterial=new T.MeshPhysicalMaterial({color:0xffffff,map:fleshTexture,bumpMap:fleshTexture,bumpScale:.032,roughness:.44,clearcoat:.16,clearcoatRoughness:.32,envMapIntensity:.38,side:T.DoubleSide});
  const pithMaterial=new T.MeshStandardMaterial({color:0xf1e4bb,roughness:.89,bumpMap:poreTexture,bumpScale:.012,envMapIntensity:.15});
  const seedMaterial=new T.MeshStandardMaterial({color:0xf8edcb,roughness:.42,envMapIntensity:.32});
  const stemMaterial=new T.MeshStandardMaterial({color:0x58602e,roughness:.91,bumpMap:poreTexture,bumpScale:.05});
  function mergeParts(parts){const positions=[],normals=[],uvs=[];
    for(const part of parts){const flat=part.index?part.toNonIndexed():part;positions.push(...flat.attributes.position.array);normals.push(...flat.attributes.normal.array);uvs.push(...flat.attributes.uv.array);if(flat!==part)flat.dispose();part.dispose();}
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));return geometry;}
  function makeCutGeometry(phase){const vertices=[],uv=[],indices=[],rings=26,segments=96;
    for(let ring=0;ring<=rings;ring++){const radius=ring/rings*.87,r=ring/rings;
      for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,uneven=1+.012*Math.sin(a*5+phase)+.008*Math.cos(a*9-phase);
        const x=Math.cos(a)*radius*uneven,y=Math.sin(a)*radius*uneven;
        const sacs=Math.max(0,Math.sin(a*31+.7*Math.sin(r*13+phase)))*(.5+.5*Math.sin(r*69+a*5+phase));
        const envelope=Math.sin(r*Math.PI)*Math.min(1,r*3),billow=.018*(1-r*r)+.014*Math.sin(a*8+phase)*Math.sin(r*Math.PI);
        vertices.push(x,y,.024*sacs*envelope+billow);uv.push(.5+x/1.74,.5+y/1.74);
        if(ring<rings&&i<segments){const n=ring*(segments+1)+i;indices.push(n,n+segments+1,n+1,n+1,n+segments+1,n+segments+2);}}
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;}
  function makeFruit(x,y,scale=1) {
    const fruit=new T.Group(),peelMaterial=new T.MeshPhysicalMaterial({color:green,map:peelTexture,roughness:.84,roughnessMap:peelRoughTexture,bumpMap:poreTexture,bumpScale:.082,clearcoat:.16,clearcoatRoughness:.30,envMapIntensity:.22});
    const skinGeometry=new T.SphereGeometry(1,64,40),skinPosition=skinGeometry.attributes.position.array;
    for(let i=0;i<skinPosition.length;i+=3){const vx=skinPosition[i],vy=skinPosition[i+1],vz=skinPosition[i+2];
      const uneven=1+.026*Math.sin(vx*9+vy*5)*Math.cos(vz*8-vy*3)+.014*Math.sin(vx*22+vy*17);
      skinPosition[i]*=uneven*(1-.075*Math.abs(vy));skinPosition[i+1]*=uneven;skinPosition[i+2]*=uneven;}
    skinGeometry.computeVertexNormals();const skin=new T.Mesh(skinGeometry,peelMaterial);skin.scale.set(1,1.31,.46);skin.castShadow=true;skin.receiveShadow=true;fruit.add(skin);
    const cutGeometry=makeCutGeometry(x*.23+y*.17),cut=new T.Mesh(cutGeometry,fleshMaterial);cut.scale.y=1.31;cut.position.z=.463;cut.receiveShadow=true;fruit.add(cut);
    const ringGeometry=new T.TorusGeometry(.91,.058,12,80),ringPosition=ringGeometry.attributes.position.array;
    for(let i=0;i<ringPosition.length;i+=3){const a=Math.atan2(ringPosition[i+1],ringPosition[i]),uneven=1+.015*Math.sin(a*7)+.01*Math.cos(a*13);
      ringPosition[i]*=uneven;ringPosition[i+1]*=uneven;ringPosition[i+2]+=.013*Math.sin(a*11);}
    ringGeometry.computeVertexNormals();const rimMesh=new T.Mesh(ringGeometry,peelMaterial);rimMesh.scale.y=1.31;rimMesh.position.z=.425;rimMesh.castShadow=true;rimMesh.receiveShadow=true;fruit.add(rimMesh);
    const pithGeometry=new T.TorusGeometry(.849,.032,10,96),pithPositions=pithGeometry.attributes.position.array;
    for(let i=0;i<pithPositions.length;i+=3){const a=Math.atan2(pithPositions[i+1],pithPositions[i]),centre=.849,
      distance=Math.hypot(pithPositions[i],pithPositions[i+1]),width=1+.42*Math.sin(a*11+x)+.18*Math.cos(a*5-y),radius=centre+(distance-centre)*width+.014*Math.sin(a*7+x*.13);
      pithPositions[i]=Math.cos(a)*radius;pithPositions[i+1]=Math.sin(a)*radius*1.31;pithPositions[i+2]=pithPositions[i+2]*width+.503+.019*Math.cos(a*8+x);}
    pithGeometry.computeVertexNormals();const pithParts=[pithGeometry];
    // Delicate raised membranes and seeds remain outside the rigid numeral reading zone.
    for(let i=0;i<10;i++){const a=segmentAngles[i],bend=.075*Math.sin(i*1.37+x*.2),end=.812+.016*Math.cos(i*2.1);
      const curve=new T.CatmullRomCurve3([new T.Vector3(Math.cos(a)*.05,Math.sin(a)*.065,.481),new T.Vector3(Math.cos(a+bend)*.46,Math.sin(a+bend)*.46*1.31,.516),new T.Vector3(Math.cos(a)*end,Math.sin(a)*end*1.31,.497)]);
      pithParts.push(new T.TubeGeometry(curve,16,.004+.005*(.5+.5*Math.sin(i*1.9)),6,false));}
    const pithMesh=new T.Mesh(mergeParts(pithParts),pithMaterial);pithMesh.castShadow=true;pithMesh.receiveShadow=true;fruit.add(pithMesh);
    const seeds=new T.InstancedMesh(new T.SphereGeometry(.035,16,10),seedMaterial,3),seedPose=new T.Object3D();
    for(const [i,a] of [1.18,2.19,4.34].entries()){seedPose.position.set(Math.cos(a)*.64,Math.sin(a)*.64*1.31,.539);seedPose.scale.set(.8,1.9,.38);seedPose.rotation.z=-a+.3;seedPose.updateMatrix();seeds.setMatrixAt(i,seedPose.matrix);}fruit.add(seeds);
    const collar=new T.Mesh(new T.ConeGeometry(.13,.18,7),stemMaterial);collar.position.set(0,1.30,.04);collar.rotation.z=.11;collar.castShadow=true;fruit.add(collar);
    const scar=new T.Mesh(new T.SphereGeometry(.15,16,12),new T.MeshStandardMaterial({color:0xb79526,roughness:.90,bumpMap:poreTexture,bumpScale:.015}));scar.position.set(.68,-.67,.2);scar.scale.set(.7,1.8,.25);fruit.add(scar);
    fruit.position.set(x,y,.4);fruit.scale.setScalar(scale);group.add(fruit);return{group:fruit,material:peelMaterial,resetColor:green.clone()};
  }
  const fruits=[makeFruit(-3.2,.65),makeFruit(-.3,.65),makeFruit(2.6,.65),makeFruit(5.5,.65)];
  const resetFruit=makeFruit(-4.8,-2.9,1.1);resetFruit.group.scale.set(1.3,.85,1.1);resetFruit.material.color.copy(saffron);
  const bark=new T.MeshStandardMaterial({color:0x62613b,roughness:.92,bumpMap:poreTexture,bumpScale:.10,envMapIntensity:.16});
  const branchPath=new T.CatmullRomCurve3([new T.Vector3(-7,-4,-.5),new T.Vector3(-6.15,.7,-.4),new T.Vector3(-3.4,2.30,-.3),new T.Vector3(1.6,3.38,-.6),new T.Vector3(7.7,4.5,-.9)]);
  const branchGeometry=new T.TubeGeometry(branchPath,90,.105,16,false),branchVertices=branchGeometry.attributes.position.array;
  for(let i=0;i<branchVertices.length;i+=3){const index=Math.floor(i/3/17),centre=branchPath.getPointAt(index/90),taper=.72+.40*(1-index/90),angle=(i/3%17)/16*Math.PI*2,ridge=1+.23*Math.sin(angle*7+index*.32);
    branchVertices[i]=centre.x+(branchVertices[i]-centre.x)*taper*ridge;branchVertices[i+1]=centre.y+(branchVertices[i+1]-centre.y)*taper*ridge;branchVertices[i+2]=centre.z+(branchVertices[i+2]-centre.z)*taper*ridge;}
  branchGeometry.computeVertexNormals();const branch=new T.Mesh(branchGeometry,bark);branch.castShadow=true;branch.receiveShadow=true;group.add(branch);
  const twigs=[];
  for(let i=0;i<4;i++){
    const x=fruits[i].group.position.x;
    const curve=new T.CatmullRomCurve3([new T.Vector3(x-.17,2.9,.15),new T.Vector3(x+.04,2.25,.2),new T.Vector3(x,1.9,.3)]);
    const mesh=new T.Mesh(new T.TubeGeometry(curve,24,.074,10,false),bark);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);twigs.push(mesh);
  }
  const leafShape=new T.Shape();leafShape.moveTo(0,0);leafShape.bezierCurveTo(-.43,.30,-.56,.78,0,1.25);leafShape.bezierCurveTo(.56,.78,.43,.30,0,0);
  const leafGeometry=new T.ExtrudeGeometry(leafShape,{depth:.018,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:12});
  const leafPositions=leafGeometry.attributes.position.array;
  for(let i=0;i<leafPositions.length;i+=3)leafPositions[i+2]+=.09*Math.sin(leafPositions[i+1]/1.25*Math.PI)*(1-Math.min(1,Math.abs(leafPositions[i])/.45));leafGeometry.computeVertexNormals();
  const leafUV=leafGeometry.attributes.uv.array;for(let i=0,j=0;i<leafPositions.length;i+=3,j+=2){leafUV[j]=leafPositions[i]/1.2+.5;leafUV[j+1]=leafPositions[i+1]/1.25;}leafGeometry.attributes.uv.needsUpdate=true;
  const leafTexture=new T.DataTexture(leafGrain,256,256);leafTexture.colorSpace=T.SRGBColorSpace;leafTexture.needsUpdate=true;
  const leafMaterial=new T.MeshPhysicalMaterial({color:0xb5c37e,map:leafTexture,bumpMap:leafTexture,bumpScale:.025,roughness:.44,clearcoat:.20,clearcoatRoughness:.26,transmission:.06,thickness:.035,ior:1.32,attenuationColor:0xb4c872,attenuationDistance:1.6,envMapIntensity:.45,side:T.DoubleSide});
  const leaves=[];
  for(let i=0;i<15;i++){
    const mesh=new T.Mesh(leafGeometry,leafMaterial);const x=i<8?-6.2+i*1.45:-6.4+(i-8)*.25,y=i<8?2.9+(i%3)*.16:-2.7+(i%3)*.45;
    mesh.castShadow=true;mesh.receiveShadow=true;mesh.position.set(x,y,.5);mesh.rotation.z=(i%2?1:-1)*(.45+(i%4)*.31);mesh.rotation.y=.2;
    const scale=.65+(i%3)*.2;mesh.scale.setScalar(scale);group.add(mesh);leaves.push({mesh,z:mesh.rotation.z,phase:i*.72,open:0});
  }
  const gold=new T.MeshStandardMaterial({color:0xd2ae49,metalness:.62,roughness:.34});
  const crown=new T.Group();const band=new T.Mesh(new T.TorusGeometry(.16,.033,7,20),gold);band.rotation.x=Math.PI/2;crown.add(band);
  for(let i=0;i<3;i++){const p=new T.Mesh(new T.ConeGeometry(.057,.2,4),gold);p.position.set((i-1)*.115,.11,0);crown.add(p);}
  crown.position.set(1.1,-2.8,.7);group.add(crown);ctx.pin(ctx.dom.secretButton,crown,{width:.64});
  const fold=new T.Mesh(leafGeometry,leafMaterial);fold.position.set(.82,-3.08,.86);fold.rotation.set(.12,.2,-.7);fold.scale.set(.73,.75,.73);fold.castShadow=true;fold.receiveShadow=true;group.add(fold);
  const bee=new T.Group();const beeBody=new T.Mesh(new T.SphereGeometry(.1,16,12),new T.MeshStandardMaterial({color:0xc6a02d,roughness:.65}));beeBody.scale.set(.75,.8,1.6);bee.add(beeBody);
  const wingMaterial=new T.MeshStandardMaterial({color:0xf0e9cc,transparent:true,opacity:.45,roughness:.6,side:T.DoubleSide});const wings=[];
  for(const side of [-1,1]){const wing=new T.Mesh(new T.CircleGeometry(.14,16),wingMaterial);wing.position.set(side*.11,.07,.04);wing.scale.set(.8,1.4,1);bee.add(wing);wings.push({wing,side});}
  bee.position.set(-1.2,-2.6,1.7);group.add(bee);
  let frozen=false,focused=false,focusCard=null,hoverCard=null,secretFocused=false,secretHovered=false,lastSample=-1,restRipeness=1,resetAge=999,holdResetFrame=false;
  ctx.on(ctx.hero,'focusin',e=>{focusCard=e.target.closest?.('.card')||null;focused=!!e.target.closest?.('.card,.art-secret-trigger');ctx.wake();});
  ctx.on(ctx.hero,'focusout',()=>{focusCard=null;focused=false;ctx.wake();});
  ctx.on(ctx.hero,'pointerover',e=>{const card=e.target.closest?.('.card');if(card){hoverCard=card;ctx.wake();}});
  ctx.on(ctx.hero,'pointerout',e=>{const card=e.target.closest?.('.card');if(card&&card!==e.relatedTarget?.closest?.('.card')){hoverCard=null;ctx.wake();}});
  ctx.on(ctx.dom.secretButton,'focus',()=>{secretFocused=true;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'blur',()=>{secretFocused=false;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'pointerenter',()=>{secretHovered=true;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'pointerleave',()=>{secretHovered=false;ctx.wake();});
  const calculateRipeness=()=>{const d=ctx.getDigits();const remaining=d[0]*86400+d[1]*3600+d[2]*60+d[3];
    const end=new Date(Date.now()+remaining*1000),previous=new Date(end);const day=end.getUTCDate();previous.setUTCDate(1);previous.setUTCMonth(previous.getUTCMonth()-1);
    const lastDay=new Date(Date.UTC(previous.getUTCFullYear(),previous.getUTCMonth()+1,0)).getUTCDate();previous.setUTCDate(Math.min(day,lastDay));
    restRipeness=Math.max(0,Math.min(1,remaining/Math.max(1,(end-previous)/1000)));};calculateRipeness();
  const targetColor=new T.Color(),leafWorld=new T.Vector3();
  function nearestLeaf(card){if(!card)return null;const target=card.getBoundingClientRect(),stage=ctx.stage.getBoundingClientRect();
    const x=target.left+target.width/2-stage.left,y=target.top-stage.top;
    let nearest=null,distance=Infinity;
    for(const leaf of leaves){leaf.mesh.getWorldPosition(leafWorld);const p=ctx.project(leafWorld);if(!p.visible)continue;
      const d=(p.x-x)**2+(p.y-y)**2;if(d<distance){distance=d;nearest=leaf;}}
    return nearest;}
  const clockUnits=Array.from(ctx.dom.clock.querySelectorAll('.clock-unit'));
  const resize=()=>{ctx.fitCamera(ctx.mobile?6.4:5.5,[0,0,0],[0,0,18]);
    group.scale.setScalar(ctx.mobile?.6:1);group.position.set(ctx.mobile?-.13:0,ctx.mobile?1.3:0,0);
    const narrow=ctx.mobile&&ctx.stage.clientWidth<=360;
    for(let i=0;i<4;i++){fruits[i].group.position.set(ctx.mobile?(narrow?(i%2?1.43:-.68):(i%2?1.45:-1.45)):-3.2+i*2.9,ctx.mobile?(i<2?1.5:-1.4):.30,.4);
      fruits[i].group.scale.setScalar(narrow?.86:1);twigs[i].visible=!ctx.mobile;
      ctx.pin(clockUnits[i],fruits[i].group,{offset:[0,.04,.49],width:ctx.mobile?(narrow?.91:1.10):2.12});}
    resetFruit.group.position.set(ctx.mobile?1.2:-4.8,ctx.mobile?-4:-2.9,.4);
    crown.position.set(ctx.mobile?-2:1.1,ctx.mobile?-3.7:-2.8,.7);fold.position.set(crown.position.x-.28,crown.position.y-.28,.86);
    ctx.pin(ctx.dom.reset,resetFruit.group,{offset:[0,.20,.6],width:ctx.mobile?1.48:2.25});
    ctx.pin(ctx.dom.tally,resetFruit.group,{offset:[0,-.57,.62],width:ctx.mobile?.73:1.02});
  };resize();
  return {resize,dispose(){environment.dispose();},overlay(value){frozen=value;if(!value)holdResetFrame=true;},celebrate(){resetAge=0;holdResetFrame=true;for(const f of fruits)f.resetColor.copy(f.material.color);},
    animate(time,dt){if(frozen)return;const motion=!ctx.reduced&&!focused&&!hoverCard;
      if(holdResetFrame)holdResetFrame=false;else if(resetAge<1.5)resetAge=Math.min(1.5,resetAge+dt);
      if(Math.floor(time)!==lastSample){lastSample=Math.floor(time);calculateRipeness();}
      // Visible scene time preserves a partly completed reversal while a preview is open.
      const age=resetAge;targetColor.lerpColors(saffron,green,restRipeness);
      for(let i=0;i<4;i++){const f=fruits[i];const progress=ctx.reduced?1:Math.max(0,Math.min(1,(age-i*.08)/1.18));
        if(age<1.5)f.material.color.lerpColors(f.resetColor,targetColor,progress);else f.material.color.copy(targetColor);
        f.group.rotation.z=motion?Math.sin(time*.42+i*.32)*.014:0;
      }
      const tip=!ctx.reduced&&age<1.5?Math.sin(age/1.5*Math.PI)*.08:0;twigs[3].scale.y=1+tip;
      const remote=ctx.remoteAge<.3&&!ctx.reduced?Math.sin(ctx.remoteAge/.3*Math.PI)*.045:0;
      const opening=nearestLeaf(focusCard||hoverCard);
      for(const leaf of leaves){const target=leaf===opening?1:0;
        leaf.open=ctx.reduced||focusCard?target:leaf.open+(target-leaf.open)*Math.min(1,dt*12);
        leaf.mesh.rotation.y=.2+leaf.open*.9;
        leaf.mesh.rotation.z=leaf.z+(motion?Math.sin(time*.6+leaf.phase)*.035:0)+remote+leaf.open*(leaf.z<0?-.12:.12);}
      const secretFocus=secretFocused||secretHovered;
      fold.rotation.y=.2+(secretFocus?.75:0);crown.rotation.z=secretFocus?.07:0;
      resetFruit.group.scale.y=.85*(ctx.pending?.98:1);
      if(motion){const px=ctx.pointer.active?Math.max(-2.5,Math.min(1.5,ctx.pointer.x*3)):-1.2,py=ctx.pointer.active?Math.max(-3.3,Math.min(-1.8,ctx.pointer.y*3)):-2.6;
        bee.position.x+=(px-bee.position.x)*Math.min(1,dt*4);bee.position.y+=(py-bee.position.y)*Math.min(1,dt*4);
        for(const w of wings)w.wing.rotation.y=w.side*Math.sin(time*15)*.7;
      }else{for(const w of wings)w.wing.rotation.y=w.side*.15;}
      bee.visible=!ctx.mobile;
    }
  };
}
