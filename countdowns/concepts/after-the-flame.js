// Sculpted art establishes the canyon; real geometry carries its light and reverse flow.
export function create(ctx) {
  const T=ctx.THREE,group=new T.Group();ctx.root.add(group);
  ctx.scene.background=null;ctx.renderer.setClearColor(0x190d17,0);ctx.renderer.toneMappingExposure=1.05;
  const ambient=new T.HemisphereLight(0xe6b687,0x190d17,.55);
  const rim=new T.DirectionalLight(0x637a92,.9);rim.position.set(7,2,2);
  const flameLight=new T.PointLight(0xffaa46,45,17,1.7);flameLight.position.set(-4.2,3.05,3);
  group.add(ambient,rim,flameLight);
  const wet=new T.MeshPhysicalMaterial({color:0xe9ca92,roughness:.27,clearcoat:.75,clearcoatRoughness:.2,transparent:true,opacity:0});
  const dark=new T.MeshStandardMaterial({color:0x352a1d,roughness:1});
  const gold=new T.MeshStandardMaterial({color:0xc69a40,roughness:.25,metalness:.72});
  const dripGroup=new T.Group();group.add(dripGroup);const flows=[];
  for(let i=0;i<10;i++) {
    const x=-5.38+Math.sin(i*1.2)*.19,y=-2.35+i*.43;
    const points=[new T.Vector3(x,y,1),new T.Vector3(x+.13,y+.5,1.05),new T.Vector3(x-.04,y+.98,1.1)];
    const mesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),16,.038+(i%3)*.012,7,false),wet);
    dripGroup.add(mesh);flows.push({mesh,y,x,phase:i*.38});
  }
  const wick=new T.Mesh(new T.CylinderGeometry(.038,.05,.53,8),dark);wick.position.set(-4.1,2.55,1.5);wick.rotation.z=-.35;group.add(wick);
  const flameUniforms={uTime:{value:0},uLean:{value:0},uLift:{value:0}};
  const flameMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
    uniforms:flameUniforms,
    vertexShader:`varying vec2 vUv;uniform float uLean;uniform float uLift;void main(){vUv=uv;vec3 p=position;p.x+=uLean*pow(uv.y,2.0);p.y+=uLift*uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader:`varying vec2 vUv;uniform float uTime;void main(){float y=vUv.y;float width=.30*(1.0-y)+.04;float bend=.025*sin(y*13.0+uTime*2.2);float shape=1.0-smoothstep(width*.40,width,abs(vUv.x-.5+bend));float ends=smoothstep(0.0,.12,y)*(1.0-smoothstep(.78,1.0,y));float a=shape*ends;vec3 color=mix(vec3(1.0,.22,.025),vec3(1.0,.94,.62),shape);gl_FragColor=vec4(color,a);}`});
  const flame=new T.Mesh(new T.PlaneGeometry(1.1,1.75,12,20),flameMaterial);flame.position.set(-4.08,3.18,2);group.add(flame);
  const glowMaterial=new T.MeshBasicMaterial({color:0xffad43,transparent:true,opacity:.08,depthWrite:false,blending:T.AdditiveBlending});
  const glow=new T.Mesh(new T.SphereGeometry(.55,20,14),glowMaterial);glow.position.copy(flame.position);glow.scale.set(1,1.8,.3);group.add(glow);
  const ashGeometry=new T.BufferGeometry(),ashCount=48,ashPositions=new Float32Array(ashCount*3),ashSeeds=[];
  for(let i=0;i<ashCount;i++){const seed=(i*.618033)%1;ashSeeds.push(seed);ashPositions[i*3]=-4.1+seed*2.8;ashPositions[i*3+1]=seed*6-2;ashPositions[i*3+2]=.5+(i%7)*.08;}
  ashGeometry.setAttribute('position',new T.BufferAttribute(ashPositions,3));
  const ash=new T.Points(ashGeometry,new T.PointsMaterial({color:0xe5b96e,size:.028,transparent:true,opacity:.45,depthWrite:false}));group.add(ash);
  const crown=new T.Group();const band=new T.Mesh(new T.TorusGeometry(.18,.035,6,24),gold);band.rotation.x=Math.PI/2;crown.add(band);
  for(let i=0;i<3;i++){const p=new T.Mesh(new T.ConeGeometry(.065,.22,4),gold);p.position.set((i-1)*.13,.12,0);crown.add(p);}
  crown.position.set(-2.1,-3.9,2);group.add(crown);ctx.pin(ctx.dom.secretButton,crown,{width:.62});
  let frozen=false,secretFocus=false;
  for(const event of ['focus','pointerenter'])ctx.on(ctx.dom.secretButton,event,()=>{secretFocus=true;ctx.wake();});
  for(const event of ['blur','pointerleave'])ctx.on(ctx.dom.secretButton,event,()=>{secretFocus=false;ctx.wake();});
  const resize=()=>{ctx.fitCamera(ctx.mobile?6:5.5,[0,0,0],[0,0,18]);
    group.scale.setScalar(ctx.mobile?.68:1);group.position.set(ctx.mobile?2.3:0,ctx.mobile?1.7:0,0);};resize();
  return {resize,overlay(value){frozen=value;},
    animate(time,dt){
      if(frozen)return;
      const still=ctx.reduced,age=Number.isFinite(ctx.burst)?ctx.burst:99;
      const reversal=!still&&age<1.5?Math.sin(age/1.5*Math.PI):0;
      const remote=!still&&ctx.remoteAge<.4?Math.sin(ctx.remoteAge/.4*Math.PI)*.09:0;
      flameUniforms.uTime.value=still?0:time;
      flameUniforms.uLean.value=still?0:(ctx.pointer.active?ctx.pointer.x*.18:Math.sin(time*1.37)*.06);
      flameUniforms.uLift.value=reversal*.2+remote;
      flameLight.intensity=45+(still?0:Math.sin(time*3.7)*1.8)+reversal*10;
      glowMaterial.opacity=.075+reversal*.03;
      dripGroup.visible=reversal>0;wet.opacity=reversal*.72;
      for(const f of flows){f.mesh.position.y=reversal*(.4+Math.sin(f.phase-age*3)*.07);f.mesh.scale.y=1+reversal*.12;}
      wick.rotation.z=-.35+reversal*.15;
      ash.visible=!still&&!ctx.mobile;
      if(ash.visible){for(let i=0;i<ashCount;i++){const s=ashSeeds[i],phase=(time*.12+s)%1;ashPositions[i*3]=-4.05+Math.sin(time*.37+i)*(.2+phase*1.7);ashPositions[i*3+1]=2.7+phase*3.5;}
        ashGeometry.attributes.position.needsUpdate=true;}
      crown.rotation.z=secretFocus&&!still?-.085:0;
    }
  };
}
