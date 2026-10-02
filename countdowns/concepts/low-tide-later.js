// A masked shallow tide wraps tactile chalk and a ridged shell, never live content.
export function create(ctx) {
  const T=ctx.THREE,group=new T.Group();ctx.root.add(group);ctx.scene.background=null;
  ctx.renderer.setClearColor(0xe8f1ec,0);ctx.renderer.toneMappingExposure=1.05;
  const hemi=new T.HemisphereLight(0xc9d9f2,0x7d8d98,2.1);
  const sun=new T.DirectionalLight(0xfff9e6,3.1);sun.position.set(-6,8,12);group.add(hemi,sun);
  const blue=new T.Color(0x123ca6),foam=new T.Color(0xc7ddde);
  const ripples=Array.from({length:8},()=>new T.Vector4(-10,-10,-10,0));
  const uniforms={uTime:{value:0},uSurge:{value:0},uBlue:{value:blue},uFoam:{value:foam},uRipples:{value:ripples},uStill:{value:0},uReveal:{value:new T.Vector3(.5,.5,0)}};
  const waterMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:T.DoubleSide,
    vertexShader:`varying vec2 vUv;uniform float uTime;uniform float uStill;void main(){vUv=uv;vec3 p=position;p.z+=(1.0-uStill)*.028*(sin(p.x*2.0+uTime*.4)+sin(p.y*2.8-uTime*.3));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uSurge;uniform float uStill;uniform vec3 uBlue;uniform vec3 uFoam;uniform vec4 uRipples[8];uniform vec3 uReveal;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){vec2 uv=vUv;float edge=.43+.62*(uv.y-.5)+.008*sin(uv.y*71.0)+.005*sin(uv.y*143.0);float d=edge+uSurge-uv.x;
      float mask=smoothstep(-.007,.008,d);if(mask<.001)discard;
      float t=uTime*(1.0-uStill);float current=sin(uv.x*69.0+sin(uv.y*47.0+t*.18)*2.0-t*.24)*sin(uv.y*74.0+uv.x*15.0+t*.15);
      float current2=sin(uv.x*101.0-uv.y*33.0+t*.13)*sin(uv.y*103.0+t*.1);
      float shore=exp(-abs(d)*80.0);float ring=0.0;
      for(int i=0;i<8;i++){float age=uTime-uRipples[i].z;float r=length((uv-uRipples[i].xy)*vec2(1.45,1.0));float radius=age*.17;float life=step(0.0,age)*(1.0-smoothstep(.45,.9,age));ring+=exp(-pow((r-radius)*110.0,2.0))*life*.18*uRipples[i].w;}
      float grain=hash(floor(uv*1400.0))*.06-.03;float veins=pow(abs(sin(uv.x*88.0+sin(uv.y*67.0+t*.15)*1.6)),22.0)*pow(abs(sin(uv.y*99.0+t*.12)),14.0)*.16;
      float reveal=(1.0-smoothstep(.035,.14,length((uv-uReveal.xy)*vec2(1.45,1.0))))*uReveal.z;float detail=1.0-reveal*.75;
      vec3 col=uBlue*(.87+(current*.1+current2*.055)*detail+grain);col=mix(col,uFoam,clamp(shore*.7+(ring+veins+pow(max(0.0,current),9.0)*.14)*detail,0.0,.78));gl_FragColor=vec4(col,mask);}`});
  const water=new T.Mesh(new T.PlaneGeometry(20,12,70,45),waterMaterial);water.position.z=-.6;group.add(water);
  const grit=new Uint8Array(128*128*4);
  for(let i=0;i<128*128;i++){const seed=Math.sin(i*73.51)*43758.54,n=(seed-Math.floor(seed))*.13+.87;grit[i*4]=232*n;grit[i*4+1]=228*n;grit[i*4+2]=213*n;grit[i*4+3]=255;}
  const gritTexture=new T.DataTexture(grit,128,128);gritTexture.colorSpace=T.SRGBColorSpace;gritTexture.wrapS=gritTexture.wrapT=T.RepeatWrapping;gritTexture.repeat.set(4,3);gritTexture.needsUpdate=true;
  const chalk=new T.MeshStandardMaterial({color:0xe8e4d5,roughness:.95,map:gritTexture,bumpMap:gritTexture,bumpScale:.07});
  const stain=new T.MeshStandardMaterial({color:0x53759a,roughness:.9,transparent:true,opacity:.36});
  const stones=[],bands=[];
  for(let i=0;i<4;i++){
    const geometry=new T.CylinderGeometry(.87,.92,2.35,32,8);
    const arr=geometry.attributes.position.array;
    for(let n=0;n<arr.length;n+=3){const factor=1+.035*Math.sin(arr[n]*17+arr[n+2]*13+i)+.022*Math.sin(arr[n+1]*19+arr[n]*11+i*.5);arr[n]*=factor;arr[n+2]*=factor;if(arr[n+1]>1)arr[n+1]+=.065*Math.sin(arr[n]*19+arr[n+2]*13+i);}
    geometry.computeVertexNormals();const mesh=new T.Mesh(geometry,chalk);
    mesh.position.set(-5.1+i*2.55,1.45-i*.38,.55);mesh.rotation.z=(i-1.5)*.025;group.add(mesh);stones.push(mesh);
    const wetBand=new T.Mesh(new T.CylinderGeometry(.936,.947,.29,32,1,true),stain);wetBand.position.copy(mesh.position);wetBand.position.y-=1.03;group.add(wetBand);bands.push(wetBand);
  }
  const shellGroup=new T.Group();shellGroup.position.set(5.2,-.2,1);shellGroup.rotation.z=-.13;group.add(shellGroup);
  const shellMaterial=new T.MeshStandardMaterial({color:0xc76239,roughness:.58});
  const ridgeMaterial=new T.MeshStandardMaterial({color:0xdb8253,roughness:.7});
  const shape=new T.Shape();shape.moveTo(-.25,-.87);shape.lineTo(-1.09,.2);shape.absarc(0,.2,1.09,Math.PI,0,true);shape.lineTo(.25,-.87);shape.closePath();
  const shell=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelThickness:.07,bevelSize:.05,bevelSegments:3,curveSegments:32}),shellMaterial);shellGroup.add(shell);
  for(let i=0;i<20;i++){const a=.08+i/19*(Math.PI-.16),x=Math.cos(a)*1.075,y=.2+Math.sin(a)*1.075;
    const curve=new T.CatmullRomCurve3([new T.Vector3((i-9.5)*.012,-.73,.19),new T.Vector3(x*.5,y*.52-.13,.24),new T.Vector3(x,y,.15)]);
    const rib=new T.Mesh(new T.TubeGeometry(curve,18,.023,6,false),ridgeMaterial);shellGroup.add(rib);}
  function chip(geometry){const vertices=geometry.attributes.position.array;
    for(let i=0;i<vertices.length;i+=3){const x=vertices[i],y=vertices[i+1],z=vertices[i+2];
      const edge=1+.06*Math.sin(x*71+y*39+z*57);vertices[i]*=edge;vertices[i+1]*=1+.05*Math.cos(x*53+z*31);vertices[i+2]*=edge;}
    geometry.computeVertexNormals();return geometry;}
  const crown=new T.Group();const band=new T.Mesh(chip(new T.TorusGeometry(.16,.032,6,20)),chalk);band.rotation.x=Math.PI/2;crown.add(band);
  for(let i=0;i<3;i++){const tooth=new T.Mesh(chip(new T.ConeGeometry(.06,.19,4)),chalk);tooth.position.set((i-1)*.12,.1,0);crown.add(tooth);}
  crown.position.set(3.9,-1.8,.8);crown.rotation.z=.2;group.add(crown);ctx.pin(ctx.dom.secretButton,crown,{width:.62});
  const poolMaterial=new T.MeshBasicMaterial({color:0x729ed0,transparent:true,opacity:.23,depthWrite:false});
  const pool=new T.Mesh(new T.CircleGeometry(.4,32),poolMaterial);pool.scale.set(1.18,.7,1);pool.position.set(3.9,-1.8,.73);group.add(pool);
  const kelpMaterial=new T.MeshStandardMaterial({color:0x766b3c,roughness:1});
  for(let i=0;i<8;i++){
    const x=-7.4+i*.45,y=-3.8+i*.22;
    const curve=new T.CatmullRomCurve3([new T.Vector3(x,y,.15),new T.Vector3(x+.3,y+.2,.15),new T.Vector3(x+.15,y+.55,.15)]);
    const stem=new T.Mesh(new T.TubeGeometry(curve,12,.015,5,false),kelpMaterial);group.add(stem);
  }
  let rippleIndex=0,lastLocalRipple=-Infinity,down=null,frozen=false,secretFocused=false,secretHovered=false,remoteRipplePending=false;
  const raycaster=new T.Raycaster(),rayPoint=new T.Vector2();
  function ripple(e){if(ctx.reduced||frozen)return;const now=performance.now()/1000;if(now-lastLocalRipple<.12)return;
    const r=ctx.canvas.getBoundingClientRect();rayPoint.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);
    water.updateWorldMatrix(true,false);raycaster.setFromCamera(rayPoint,ctx.camera);const hit=raycaster.intersectObject(water,false)[0];if(!hit)return;
    const x=hit.uv.x,y=hit.uv.y;
    if(x>.43+.62*(y-.5)+.02)return;ripples[rippleIndex].set(x,y,now,1);rippleIndex=(rippleIndex+1)%8;lastLocalRipple=now;ctx.wake();}
  ctx.on(ctx.canvas,'pointermove',e=>{if(e.pointerType==='mouse')ripple(e);});
  ctx.on(ctx.canvas,'pointerdown',e=>{down={x:e.clientX,y:e.clientY,time:performance.now()};});
  ctx.on(ctx.canvas,'pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6&&performance.now()-down.time<400)ripple(e);down=null;});
  ctx.on(ctx.dom.secretButton,'focus',()=>{secretFocused=true;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'blur',()=>{secretFocused=false;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'pointerenter',()=>{secretHovered=true;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'pointerleave',()=>{secretHovered=false;ctx.wake();});
  const resize=()=>{ctx.fitCamera(ctx.mobile?6.2:5.5,[0,0,0],[0,1.6,18]);
    if(ctx.mobile){group.scale.setScalar(.55);group.position.set(.7,1.0,0);}else{group.scale.setScalar(1);group.position.set(0,0,0);}
    for(let i=0;i<4;i++){stones[i].position.set(ctx.mobile?(i%2?-.55:-3.2):-5.1+i*2.55,ctx.mobile?(i<2?3.4:1.4):1.45-i*.38,.55);bands[i].position.copy(stones[i].position);bands[i].position.y-=1.03;}
    shellGroup.position.set(ctx.mobile?.2:5.2,ctx.mobile?-1.85:-.2,1);
    crown.position.set(ctx.mobile?-3.1:3.9,ctx.mobile?-2.4:-1.8,.8);
    pool.position.set(crown.position.x,crown.position.y,.73);
  };resize();
  return {resize,overlay(value){frozen=value;},remote(){remoteRipplePending=true;},
    animate(time){if(frozen)return;uniforms.uTime.value=time;uniforms.uStill.value=ctx.reduced?1:0;
      const age=ctx.burst;
      const p=age<.45?age/.45:1-(age-.45)/1.15,bounded=Math.max(0,Math.min(1,p));
      uniforms.uSurge.value=!ctx.reduced&&age<1.6?bounded*bounded*(3-2*bounded)*.055:0;
      shellGroup.scale.setScalar(ctx.pending?.985:1);
      const reveal=secretFocused||secretHovered;
      crown.rotation.z=.2+(reveal?-.09:0);poolMaterial.opacity=reveal?.07:.23;
      uniforms.uReveal.value.set(.5+crown.position.x/20,.5+crown.position.y/12,reveal?1:0);
      if(remoteRipplePending){if(!ctx.reduced){ripples[rippleIndex].set(.34,.47,time,.35);rippleIndex=(rippleIndex+1)%8;}remoteRipplePending=false;}
    }
  };
}
