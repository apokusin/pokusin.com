// A lit, sculpted wax relief. The authored canyon remains the graphics-loss fallback.

export async function create(ctx) {
  const T=ctx.THREE,world=new T.Group();ctx.root.add(world);
  ctx.scene.background=null;ctx.renderer.setClearColor(0x190d17,0);ctx.renderer.toneMappingExposure=.98;
  const {createLiquidMaterials}=await import(`./liquid-materials.js?v=${document.documentElement.dataset.artVersion||'1'}`);
  const material=createLiquidMaterials(ctx,'wax');
  const ambient=new T.HemisphereLight(0x998ba0,0x190c11,.24),rim=new T.DirectionalLight(0x718dbd,1.05);
  rim.position.set(8,4,1);world.add(ambient,rim);
  const key=new T.DirectionalLight(0xffb661,1.8);key.position.set(-7,7,12);key.castShadow=true;key.shadow.radius=4;
  key.shadow.mapSize.set(ctx.mobile?1024:2048,ctx.mobile?1024:2048);key.shadow.camera.left=-12;key.shadow.camera.right=12;
  key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.camera.near=.5;key.shadow.camera.far=35;key.shadow.normalBias=.025;world.add(key);
  const flameLight=new T.PointLight(0xff982e,14,13,1.7);world.add(flameLight);
  const dark=new T.MeshStandardMaterial({color:0x26171b,roughness:.96});
  const gold=new T.MeshStandardMaterial({color:0xb1843b,roughness:.35,metalness:.73});
  function mesh(geometry,mat=material.wax){const m=new T.Mesh(geometry,mat);m.castShadow=m.receiveShadow=true;world.add(m);return m;}
  const canyon=ctx.texture('assets/concepts/after-the-flame/canyon.webp');
  const canyonMaterial=new T.MeshStandardMaterial({map:canyon,color:0xf6ead9,emissive:0xffffff,emissiveMap:canyon,emissiveIntensity:.32,
    transparent:true,alphaTest:.015,roughness:.67,roughnessMap:material.packed,bumpMap:material.bump,bumpScale:.065});
  const reliefGeometry=new T.PlaneGeometry(2,11,120,84),relief=mesh(reliefGeometry,canyonMaterial);
  const vertices=reliefGeometry.attributes.position,base=new Float32Array(vertices.array);
  function smooth(a,b,x){const p=Math.max(0,Math.min(1,(x-a)/(b-a)));return p*p*(3-2*p);}
  function reliefDepth(u,v){const floor=1.0-smooth(.25,.47,v),terrace=Math.max(0,(u-.47)*1.5)*smooth(.25,.55,v);
    return -1.3+floor*1.5+terrace*1.8+Math.sin(u*30+v*8)*.07+Math.sin(u*73-v*16)*.035+Math.sin(v*43+u*15)*.03;}
  const indices=[],cols=121;
  for(let y=0;y<84;y++)for(let x=0;x<120;x++){const u=(x+.5)/120,v=1-(y+.5)/84;
    const a=y*cols+x,b=a+1,c=a+cols,d=c+1;indices.push(a,c,b,b,c,d);}
  reliefGeometry.setIndex(indices);
  // Only an anchor is needed here: the detailed left candle is part of the relief sculpture.
  const tower=new T.Group();world.add(tower);
  function waxFrame(width,height,seed){const g=new T.Group(),points=[];
    for(let i=0;i<64;i++){const a=i/64*Math.PI*2,c=Math.cos(a),s=Math.sin(a),w=1+.035*Math.sin(i*.79+seed);
      points.push(new T.Vector3(Math.sign(c)*Math.sqrt(Math.abs(c))*width*.5*w,Math.sign(s)*Math.sqrt(Math.abs(s))*height*.5*w,.075*Math.sin(a*5+seed)));}
    const borderGeometry=new T.TubeGeometry(new T.CatmullRomCurve3(points,true),128,.135,12,true),bp=borderGeometry.attributes.position;
    for(let j=0;j<bp.count;j++){const x=bp.getX(j),y=bp.getY(j),z=bp.getZ(j);bp.setXYZ(j,x+.022*Math.sin(y*21+seed)*Math.sin(z*13),y+.018*Math.sin(x*27+seed),z+.024*Math.sin(x*18+y*23+seed)+.010*Math.sin(x*53-y*37));}
    borderGeometry.computeVertexNormals();const border=new T.Mesh(borderGeometry,material.wax);border.castShadow=border.receiveShadow=true;g.add(border);
    const face=new T.Mesh(new T.PlaneGeometry(width*.97,height*.96,12,9),material.wax);face.position.z=-.13;face.receiveShadow=true;g.add(face);
    for(let i=0;i<7;i++){const x=(i/6-.5)*width*.86,l=.10+.08*(.5+.5*Math.sin(seed+i*2.7));
      const curve=new T.CatmullRomCurve3([new T.Vector3(x,height*.5,.04),new T.Vector3(x+.025,height*.5-l*.4,.12),new T.Vector3(x-.02,height*.5-l,.05)]);
      const lip=new T.Mesh(new T.TubeGeometry(curve,9,.045,6,false),material.molten);lip.castShadow=true;g.add(lip);}
    world.add(g);return {group:g,width,height};}
  const clocks=Array.from({length:4},(_,i)=>waxFrame(1.58,1.64,i+3)),clockUnits=[...ctx.dom.clock.querySelectorAll('.clock-unit')];
  clocks.forEach((c,i)=>ctx.pin(clockUnits[i],c.group,{offset:[0,-.03,-.10],width:1.42}));
  const exhibits=ctx.mounts.map((card,i)=>({card,frame:waxFrame(3.15,2.06,i+12)}));
  for(const {card,frame} of exhibits)ctx.pin(card,frame.group,{offset:[0,-.13,.08],width:2.94});
  const pool=new T.Group();world.add(pool);
  const poolFace=new T.Mesh(new T.CircleGeometry(1.45,64),material.molten);poolFace.scale.y=.61;poolFace.position.z=-.06;poolFace.receiveShadow=true;pool.add(poolFace);
  const poolRim=new T.Mesh(new T.TorusGeometry(1.42,.12,10,64),material.wax);poolRim.scale.y=.61;poolRim.castShadow=poolRim.receiveShadow=true;pool.add(poolRim);
  ctx.pin(ctx.dom.reset.parentElement,pool,{offset:[0,-.07,.02],width:2.45});
  const wick=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-.2,0,0),new T.Vector3(0,.21,0),new T.Vector3(.2,.11,0)]),16,.039,8,false),dark);world.add(wick);
  const flameUniforms={uTime:{value:0},uLean:{value:0},uLift:{value:0}};
  const flameMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:flameUniforms,
    vertexShader:`varying vec2 vUv;uniform float uLean;uniform float uLift;void main(){vUv=uv;vec3 p=position;p.x+=uLean*pow(uv.y,2.0);p.y+=uLift*uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader:`varying vec2 vUv;uniform float uTime;void main(){float y=vUv.y,w=.29*(1.0-y)+.025;float bend=.022*sin(y*11.0+uTime*1.8);float flame=1.0-smoothstep(w*.3,w,abs(vUv.x-.5+bend));float a=flame*smoothstep(0.0,.10,y)*(1.0-smoothstep(.82,1.0,y));vec3 c=mix(vec3(1.0,.18,.015),vec3(1.0,.96,.7),pow(flame,2.0));gl_FragColor=vec4(c,a);}`});
  const flame=new T.Mesh(new T.PlaneGeometry(.95,1.65,10,20),flameMaterial);world.add(flame);
  const glowMat=new T.MeshBasicMaterial({color:0xff8d35,transparent:true,opacity:.07,depthWrite:false,blending:T.AdditiveBlending});
  const glow=new T.Mesh(new T.SphereGeometry(.64,24,16),glowMat);glow.scale.set(1,1.65,.2);world.add(glow);
  const reverseFlows=[],flowMaterial=material.molten.clone();flowMaterial.transparent=true;flowMaterial.depthWrite=false;flowMaterial.opacity=0;
  for(let i=0;i<12;i++){const x=Math.sin(i*1.7)*1.15,points=[new T.Vector3(x,-3.1,.65),new T.Vector3(x+.08,-2.3,.77),new T.Vector3(x-.10,-1.35,.8)];
    const m=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),20,.045+(i%3)*.016,8,false),flowMaterial);m.visible=false;reverseFlows.push({mesh:m,x});}
  const crown=new T.Group(),band=new T.Mesh(new T.TorusGeometry(.15,.026,7,28),gold);band.rotation.x=Math.PI/2;crown.add(band);
  for(let i=0;i<3;i++){const tooth=new T.Mesh(new T.ConeGeometry(.052,.19,4),gold);tooth.position.set((i-1)*.11,.10,0);crown.add(tooth);}world.add(crown);ctx.pin(ctx.dom.secretButton,crown,{width:.62});
  let frozen=false,secretFocused=false,secretHovered=false,worldWidth=14;
  ctx.on(ctx.dom.secretButton,'focus',()=>{secretFocused=true;ctx.wake();});ctx.on(ctx.dom.secretButton,'blur',()=>{secretFocused=false;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'pointerenter',()=>{secretHovered=true;ctx.wake();});ctx.on(ctx.dom.secretButton,'pointerleave',()=>{secretHovered=false;ctx.wake();});
  const place=(object,x,y,z=1)=>object.position.set((x-.5)*worldWidth,(.5-y)*11,z);
  function resize(w=ctx.stage.clientWidth,h=ctx.stage.clientHeight){ctx.fitCamera(5.5,[0,0,0],[0,0,18]);worldWidth=11*w/h;
    for(let i=0;i<vertices.count;i++){const u=(base[i*3]+1)/2,v=base[i*3+1]/11+.5;vertices.setXYZ(i,base[i*3]*worldWidth*.5,base[i*3+1],reliefDepth(u,v));}
    vertices.needsUpdate=true;reliefGeometry.computeVertexNormals();
    if(ctx.mobile){canyon.repeat.set(.44,1);canyon.offset.set(.08,0);tower.position.set(-worldWidth*.52,1.5,-.45);tower.scale.set(.37,.77,.50);
      clocks.forEach((c,i)=>{c.group.scale.setScalar(.64);place(c.group,i%2?.74:.43,i<2?.335:.455,.8);});
      exhibits.forEach(({frame},i)=>{frame.group.scale.setScalar(w<361?.56:.68);place(frame.group,[.48,.53,w<361?.57:.65][i],[.865,.68,.18][i],.82);});
      pool.scale.setScalar(.64);place(pool,.63,.575,.9);place(crown,.25,.575,1.05);
      place(wick,.155,.125,.5);place(flame,.155,.065,.5);flame.scale.setScalar(.48);glow.scale.set(.42,.7,.12);
    }else{canyon.repeat.set(1,1);canyon.offset.set(0,0);tower.position.set(-worldWidth*.48,1.5,-.8);tower.scale.set(1,1,1);
      clocks.forEach((c,i)=>{c.group.scale.setScalar(1);place(c.group,.405+i*.125,.735,.65);});
      exhibits.forEach(({frame},i)=>{frame.group.scale.setScalar(i===0?1:.88);place(frame.group,[.82,.83,.60][i],[.245,.475,.445][i],.6);});
      pool.scale.setScalar(1);place(pool,.19,.78,.5);place(crown,.30,.89,.8);
      place(wick,.19,.245,1.6);place(flame,.19,.18,1.6);flame.scale.setScalar(1);glow.scale.set(1,1.65,.2);}
    glow.position.copy(flame.position);flameLight.position.copy(flame.position).add(new T.Vector3(0,0,1.3));
    clocks.forEach((c,i)=>ctx.pin(clockUnits[i],c.group,{offset:[0,-.03,-.10],width:1.42*(ctx.mobile?.64:1)}));
    exhibits.forEach(({card,frame},i)=>ctx.pin(card,frame.group,{offset:[0,-.13,.08],width:2.94*(ctx.mobile?(w<361?.56:.68):i===0?1:.88)}));
    ctx.pin(ctx.dom.reset.parentElement,pool,{offset:[0,-.07,.02],width:2.45*(ctx.mobile?.64:1)});
    reverseFlows.forEach(f=>{f.mesh.position.x=tower.position.x;f.mesh.scale.setScalar(ctx.mobile?.45:1);});
  }resize();
  return {resize,overlay(value){frozen=value;},dispose(){material.dispose();},
    animate(time){if(frozen)return;const still=ctx.reduced,age=ctx.burst,reversal=!still&&age<1.5?Math.sin(age/1.5*Math.PI):0;
      flameUniforms.uTime.value=still?0:time;flameUniforms.uLean.value=still?0:(ctx.pointer.active?ctx.pointer.x*.12:Math.sin(time*1.3)*.045);
      flameUniforms.uLift.value=reversal*.23+(!still&&ctx.remoteAge<.4?Math.sin(ctx.remoteAge/.4*Math.PI)*.08:0);
      flameLight.intensity=14+(still?0:Math.sin(time*3.7)*.4)+reversal*3;glowMat.opacity=.07+reversal*.02;
      flowMaterial.opacity=reversal*.86;
      pool.position.z=(ctx.pending?.44:.5)+(ctx.mobile?.4:0);
      for(const f of reverseFlows){f.mesh.visible=reversal>0;f.mesh.position.y=reversal*.75;f.mesh.scale.y=(ctx.mobile?.45:1)*(1+reversal*.3);}
      crown.rotation.z=secretFocused||secretHovered?-.08:0;}
  };
}
