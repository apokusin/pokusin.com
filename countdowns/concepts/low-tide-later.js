// Cyanotype water, eroded chalk and dry photographs share one shallow material world.

export async function create(ctx) {
  const T=ctx.THREE,world=new T.Group();ctx.root.add(world);ctx.scene.background=null;
  ctx.renderer.setClearColor(0xe8f1ec,0);ctx.renderer.toneMappingExposure=1.04;
  const {createLiquidMaterials}=await import(`./liquid-materials.js?v=${document.documentElement.dataset.artVersion||'1'}`);
  const material=createLiquidMaterials(ctx,'chalk');
  for(const key of ['map','bumpMap','roughnessMap']){const fine=material.sand[key].clone();fine.repeat.set(6,5);fine.needsUpdate=true;material.sand[key]=fine;}
  const hemi=new T.HemisphereLight(0xb4d9f4,0x5d778a,.8),sun=new T.DirectionalLight(0xfff9df,3.1);
  sun.position.set(-7,8,12);sun.castShadow=true;sun.shadow.radius=3;sun.shadow.mapSize.set(ctx.mobile?1024:2048,ctx.mobile?1024:2048);
  Object.assign(sun.shadow.camera,{left:-12,right:12,top:8,bottom:-8,near:.5,far:35});sun.shadow.normalBias=.035;world.add(hemi,sun);
  const fill=new T.DirectionalLight(0x5ac6ee,.35);fill.position.set(4,-2,5);world.add(fill);
  const shoreGeometry=new T.PlaneGeometry(2,12,120,84),shore=new T.Mesh(shoreGeometry,material.sand),shorePositions=shoreGeometry.attributes.position,shoreBase=new Float32Array(shorePositions.array);
  shore.position.z=-.72;shore.receiveShadow=true;world.add(shore);
  // Eroded beds are broad layers; small grains only appear in their own diffuse/bump maps.
  for(let i=0;i<shorePositions.count;i++){const x=shorePositions.getX(i),y=shorePositions.getY(i);
    shorePositions.setZ(i,.08*Math.sin(x*9+y*.6)+.035*Math.sin(y*11+x*4));}
  shoreGeometry.computeVertexNormals();
  const ripples=Array.from({length:8},()=>new T.Vector4(-10,-10,-10,0));
  const uniforms={uTime:{value:0},uSurge:{value:0},uRipples:{value:ripples},uStill:{value:0},uReveal:{value:new T.Vector3(.5,.5,0)}};
  const waterMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:T.DoubleSide,
    vertexShader:`varying vec2 vUv;uniform float uTime;uniform float uStill;void main(){vUv=uv;float t=uTime*(1.0-uStill);vec3 p=position;p.z+=.038*(sin(p.x*2.1+t*.31)+sin(p.y*2.6-t*.23));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uSurge;uniform float uStill;uniform vec4 uRipples[8];uniform vec3 uReveal;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
      float edge(float y){return .43+.62*(y-.5)+.012*sin(y*37.0)+.004*sin(y*119.0);}
      void main(){vec2 uv=vUv;float t=uTime*(1.0-uStill),d=edge(uv.y)+uSurge-uv.x;
      float mask=smoothstep(-.003,.008,d);if(mask<.001)discard;
      // Oblique, incommensurate wave directions avoid a visible Cartesian grid.
      vec2 q=uv*vec2(36.0,27.0),q2=uv*vec2(166.0,140.0);
      float a=dot(q,vec2(.82,.57))+sin(dot(q,vec2(-.31,.74))*.41+t*.13)*.65-t*.31;
      float b=dot(q,vec2(-.46,.89))+sin(dot(q,vec2(.67,.26))*.37-t*.11)*.47+t*.23;
      float c=dot(q,vec2(.23,-.97))*1.37+t*.17;
      float a2=dot(q2,vec2(.91,-.41))+t*.19,b2=dot(q2,vec2(.39,.92))-t*.17;
      vec2 slope=vec2(.82,.57)*cos(a)*.13+vec2(-.46,.89)*cos(b)*.095+vec2(.23,-.97)*cos(c)*.045;
      slope+=vec2(.91,-.41)*cos(a2)*.014+vec2(.39,.92)*cos(b2)*.012;
      float ring=0.0;for(int i=0;i<8;i++){float age=uTime-uRipples[i].z;vec2 delta=(uv-uRipples[i].xy)*vec2(1.45,1.0);float r=length(delta),radius=age*.17;
        float life=step(0.0,age)*(1.0-smoothstep(.45,.9,age));float crest=exp(-pow((r-radius)*96.0,2.0))*life*uRipples[i].w;
        ring+=crest*.18;slope+=normalize(delta+vec2(.0001))*crest*.26;}
      float reveal=(1.0-smoothstep(.035,.14,length((uv-uReveal.xy)*vec2(1.45,1.0))))*uReveal.z;slope*=1.0-reveal*.7;
      vec3 N=normalize(vec3(-slope,1.0)),V=normalize(vec3(0.0,.65,1.0)),L=normalize(vec3(-.6,.8,1.2)),R=reflect(-V,N);
      float fresnel=.12+.42*pow(1.0-max(dot(N,V),0.0),2.0),sun=pow(max(dot(reflect(-L,N),V),0.0),96.0);
      float cloud=smoothstep(.29,.79,noise(R.xy*4.6+vec2(t*.015,0.0)));
      vec3 reflection=mix(vec3(.055,.16,.28),vec3(.18,.39,.46),cloud);
      float depth=smoothstep(0.0,.20,d);vec3 base=mix(vec3(.032,.135,.23),vec3(.007,.035,.105),depth);
      base+=vec3(.004,.011,.020)*(.5+.5*sin(a+sin(b)*.35));
      float caustic=pow(.5+.5*sin(a+sin(b)*1.2),18.0)*pow(.5+.5*cos(b*.91),12.0);
      base+=vec3(.045,.105,.13)*caustic*(1.0-depth*.55)*(1.0-reveal*.75);
      vec3 color=mix(base,reflection,fresnel)+sun*vec3(.74,.81,.69)*.16+ring*vec3(.25,.53,.65);
      float foamBand=exp(-abs(d)*68.0),foamBreak=smoothstep(.34,.65,noise(uv*vec2(200.0,180.0)+t*.02));
      color=mix(color,vec3(.76,.86,.84),clamp(foamBand*(.35+foamBreak*.48),0.0,.82));gl_FragColor=vec4(color,mask);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`});
  const waterGeometry=new T.PlaneGeometry(2,12,120,70),water=new T.Mesh(waterGeometry,waterMaterial);water.position.z=-.48;world.add(water);
  const waterPositions=waterGeometry.attributes.position,waterBase=new Float32Array(waterPositions.array);
  const stoneMaterial=material.chalk.clone();stoneMaterial.onBeforeCompile=shader=>{
    shader.vertexShader='varying float vTideHeight;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTideHeight=position.y/2.30+.5;');
    shader.fragmentShader='varying float vTideHeight;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float tide=smoothstep(.14,.29,vTideHeight);float fleck=.5+.5*sin(vRoughnessMapUv.x*91.0+sin(vTideHeight*137.0)*1.8);
      diffuseColor.rgb=mix(vec3(.17,.35,.49),diffuseColor.rgb,clamp(tide+fleck*.085,0.0,1.0));`);
  };stoneMaterial.customProgramCacheKey=()=> 'tide-chalk-stain-v2';
  const stones=[],clockUnits=[...ctx.dom.clock.querySelectorAll('.clock-unit')];
  for(let i=0;i<4;i++){const geometry=new T.CylinderGeometry(.85,.93,2.30,64,18),position=geometry.attributes.position;
    for(let j=0;j<position.count;j++){const x=position.getX(j),y=position.getY(j),z=position.getZ(j),a=Math.atan2(z,x);
      const r=1+.025*Math.sin(a*9+y*1.8+i)+.011*Math.sin(a*23-y*3+i);
      position.setXYZ(j,x*r,y+(y>.99?.045*Math.sin(a*9+i)+.022*Math.sin(a*17):0),z*r);}
    geometry.computeVertexNormals();const stone=new T.Mesh(geometry,stoneMaterial);stone.castShadow=stone.receiveShadow=true;world.add(stone);stones.push(stone);}
  const paperFrames=ctx.mounts.map((card,i)=>{
    const g=new T.Group(),geo=new T.PlaneGeometry(3.1,2.15,26,18),p=geo.attributes.position;
    for(let j=0;j<p.count;j++){const x=p.getX(j),y=p.getY(j),edge=Math.max(0,Math.abs(x)-1.15);
      p.setZ(j,edge*edge*.27+Math.max(0,Math.abs(y)-.72)**2*.30+.008*Math.sin(x*17+y*7+i));}
    geo.computeVertexNormals();const paper=new T.Mesh(geo,material.paper);paper.receiveShadow=paper.castShadow=true;g.add(paper);world.add(g);return {card,group:g};
  });
  const shellGroup=new T.Group();world.add(shellGroup);
  const shape=new T.Shape();shape.moveTo(-.25,-.75);shape.lineTo(-1.09,.2);shape.absarc(0,.2,1.09,Math.PI,0,true);shape.lineTo(.25,-.75);shape.closePath();
  const shell=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:true,bevelThickness:.08,bevelSize:.06,bevelSegments:4,curveSegments:48}),material.shell);shell.castShadow=shell.receiveShadow=true;shellGroup.add(shell);
  const ridgeMaterial=material.shell.clone();ridgeMaterial.color.set(0xdb8151);ridgeMaterial.roughness=.57;
  for(let i=0;i<23;i++){const a=.07+i/22*(Math.PI-.14),x=Math.cos(a)*1.075,y=.2+Math.sin(a)*1.075;
    const curve=new T.CatmullRomCurve3([new T.Vector3((i-11)*.015,-.70,.21),new T.Vector3(x*.53,y*.56-.11,.29),new T.Vector3(x,y,.17)]);
    const rib=new T.Mesh(new T.TubeGeometry(curve,22,.021,7,false),ridgeMaterial);rib.castShadow=true;shellGroup.add(rib);}
  const crown=new T.Group(),band=new T.Mesh(new T.TorusGeometry(.16,.031,7,24),material.chalk);band.rotation.x=Math.PI/2;crown.add(band);
  for(let i=0;i<3;i++){const tooth=new T.Mesh(new T.ConeGeometry(.06,.20,4),material.chalk);tooth.position.set((i-1)*.12,.1,0);crown.add(tooth);}world.add(crown);ctx.pin(ctx.dom.secretButton,crown,{width:.62});
  const poolMaterial=new T.MeshBasicMaterial({color:0x729ed0,transparent:true,opacity:.23,depthWrite:false}),pool=new T.Mesh(new T.CircleGeometry(.43,40),poolMaterial);pool.scale.set(1.18,.7,1);world.add(pool);
  const kelpMaterial=new T.MeshStandardMaterial({color:0x675c38,roughness:.94});
  const kelp=new T.Group();world.add(kelp);
  for(let i=0;i<16;i++){const x=i*.13-1,y=(i%4)*.08,curve=new T.CatmullRomCurve3([new T.Vector3(x,y,0),new T.Vector3(x+.17,y+.25,.06),new T.Vector3(x+.09,y+.55,.09)]);
    const stem=new T.Mesh(new T.TubeGeometry(curve,12,.012,5,false),kelpMaterial);kelp.add(stem);
    for(let j=0;j<3;j++){const leaf=new T.Mesh(new T.SphereGeometry(.046,7,5),kelpMaterial);leaf.position.set(x+.14,y+.18+j*.12,.07);leaf.scale.set(.45,1.6,.18);leaf.rotation.z=.8;kelp.add(leaf);}}
  const grainMaterial=new T.MeshStandardMaterial({color:0xc8cbb8,roughness:1});
  const grains=new T.InstancedMesh(new T.IcosahedronGeometry(.011,0),grainMaterial,220),grainDummy=new T.Object3D();
  let grainIndex=0;for(let i=0;grainIndex<220;i++){const q=(i*.618033)%1,r=(i*.414213)%1;
    if(q<.43+.62*(r-.5)+.03)continue;
    grainDummy.position.set((q-.5)*17,(r-.5)*12,-.30);grainDummy.rotation.set(i*.71,i*.43,i*.29);const s=.45+((i*.7321)%1)*1.3;grainDummy.scale.set(s,s*(.65+((i*.391)%1)*.5),s*.55);grainDummy.updateMatrix();grains.setMatrixAt(grainIndex++,grainDummy.matrix);}world.add(grains);
  let rippleIndex=0,lastLocalRipple=-Infinity,down=null,frozen=false,secretFocused=false,secretHovered=false,remoteRipplePending=false,worldWidth=14;
  const raycaster=new T.Raycaster(),rayPoint=new T.Vector2();
  function ripple(e){if(ctx.reduced||frozen)return;const now=performance.now()/1000;if(now-lastLocalRipple<.12)return;
    const r=ctx.canvas.getBoundingClientRect();rayPoint.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);
    water.updateWorldMatrix(true,false);raycaster.setFromCamera(rayPoint,ctx.camera);const hit=raycaster.intersectObject(water,false)[0];if(!hit)return;
    const x=hit.uv.x,y=hit.uv.y;if(x>.43+.62*(y-.5)+.02)return;
    ripples[rippleIndex].set(x,y,now,1);rippleIndex=(rippleIndex+1)%8;lastLocalRipple=now;ctx.wake();}
  ctx.on(ctx.canvas,'pointermove',e=>{if(e.pointerType==='mouse')ripple(e);});
  ctx.on(ctx.canvas,'pointerdown',e=>{down={x:e.clientX,y:e.clientY,time:performance.now()};});
  ctx.on(ctx.canvas,'pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6&&performance.now()-down.time<400)ripple(e);down=null;});
  ctx.on(ctx.canvas,'pointercancel',()=>{down=null;});ctx.on(window,'blur',()=>{down=null;});
  ctx.on(ctx.dom.secretButton,'focus',()=>{secretFocused=true;ctx.wake();});ctx.on(ctx.dom.secretButton,'blur',()=>{secretFocused=false;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'pointerenter',()=>{secretHovered=true;ctx.wake();});ctx.on(ctx.dom.secretButton,'pointerleave',()=>{secretHovered=false;ctx.wake();});
  const place=(object,x,y,z=1)=>object.position.set((x-.5)*worldWidth,(.5-y)*11,z);
  function resize(w=ctx.stage.clientWidth,h=ctx.stage.clientHeight){ctx.fitCamera(5.5,[0,0,0],[0,0,18]);worldWidth=11*w/h;
    for(let i=0;i<shorePositions.count;i++)shorePositions.setX(i,shoreBase[i*3]*worldWidth*.5);
    for(let i=0;i<waterPositions.count;i++)waterPositions.setX(i,waterBase[i*3]*worldWidth*.5);
    shorePositions.needsUpdate=waterPositions.needsUpdate=true;shoreGeometry.computeVertexNormals();
    stones.forEach((s,i)=>{s.scale.setScalar(ctx.mobile?.61:1);place(s,ctx.mobile?(i%2?.61:.26):.18+i*.16,ctx.mobile?(i<2?.325:.46):.355+i*.035,.32);
      ctx.pin(clockUnits[i],s,{offset:[0,.05,.94],width:1.52*(ctx.mobile?.61:1)});});
    paperFrames.forEach(({card,group},i)=>{group.scale.setScalar(ctx.mobile?.68:i===0?1.22:1);place(group,ctx.mobile?[.40,.62,.51][i]:[.245,.785,.78][i],ctx.mobile?[.685,.875,.15][i]:[.775,.815,.18][i],-.17);
      group.rotation.z=ctx.mobile?[.09,-.07,-.08][i]:[.13,-.11,-.085][i];ctx.pin(card,group,{offset:[0,-.055,.08],width:2.89*(ctx.mobile?.68:i===0?1.22:1)});});
    shellGroup.scale.setScalar(ctx.mobile?.64:1);place(shellGroup,ctx.mobile?.73:.83,ctx.mobile?.555:.505,.10);
    ctx.pin(ctx.dom.reset.parentElement,shellGroup,{offset:[0,-.03,.23],width:1.74*(ctx.mobile?.64:1)});
    place(crown,ctx.mobile?.31:.71,ctx.mobile?.557:.62,.10);pool.position.copy(crown.position);pool.position.z=.035;
    place(kelp,.48,.93,-.25);kelp.scale.setScalar(ctx.mobile?.5:1);
    grains.scale.x=worldWidth/17;
  }resize();
  return {resize,overlay(value){frozen=value;down=null;},remote(){remoteRipplePending=true;},dispose(){material.dispose();},
    animate(time){if(frozen)return;uniforms.uTime.value=time;uniforms.uStill.value=ctx.reduced?1:0;
      const age=ctx.burst,p=age<.45?age/.45:1-(age-.45)/1.15,bounded=Math.max(0,Math.min(1,p));
      uniforms.uSurge.value=!ctx.reduced&&age<1.6?bounded*bounded*(3-2*bounded)*.050:0;
      shellGroup.position.z=ctx.pending?.06:.10;const reveal=secretFocused||secretHovered;
      crown.rotation.z=.2+(reveal?-.08:0);poolMaterial.opacity=reveal?.07:.23;
      uniforms.uReveal.value.set(.5+crown.position.x/worldWidth,.5+crown.position.y/12,reveal?1:0);
      if(remoteRipplePending){if(!ctx.reduced){ripples[rippleIndex].set(.34,.47,time,.35);rippleIndex=(rippleIndex+1)%8;}remoteRipplePending=false;}
    }
  };
}
