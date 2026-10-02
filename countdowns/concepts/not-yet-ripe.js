// A living specimen plate: real citrus halves and a bounded botanical reversal.
export function create(ctx) {
  const T=ctx.THREE,group=new T.Group();ctx.root.add(group);ctx.scene.background=null;
  ctx.renderer.setClearColor(0xf1ead8,0);ctx.renderer.toneMappingExposure=1.15;
  const hemi=new T.HemisphereLight(0xe5eccb,0x8a7450,2.0);
  const key=new T.DirectionalLight(0xfff3c6,3.1);key.position.set(-6,8,10);
  const rim=new T.DirectionalLight(0xd6e58f,1.0);rim.position.set(6,1,-3);group.add(hemi,key,rim);
  const green=new T.Color(0x91bb27),saffron=new T.Color(0xe5a834),plum=new T.Color(0x492345);
  const pores=new Uint8Array(128*128*4);
  for(let i=0;i<128*128;i++){const n=Math.sin(i*127.13)*43758.5453;const v=150+Math.floor((n-Math.floor(n))*95);pores[i*4]=pores[i*4+1]=pores[i*4+2]=v;pores[i*4+3]=255;}
  const poreTexture=new T.DataTexture(pores,128,128);poreTexture.wrapS=poreTexture.wrapT=T.RepeatWrapping;poreTexture.repeat.set(3,3);poreTexture.needsUpdate=true;
  const fleshMaterial=new T.ShaderMaterial({side:T.DoubleSide,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p);float a=atan(p.y,p.x);float vein=pow(abs(sin(a*5.5)),28.0);float strand=pow(abs(sin(a*68.0+r*12.0)),12.0)*.055;vec3 col=mix(vec3(.90,.83,.59),vec3(.98,.95,.80),vein*.65+strand+.23);col*=1.0-.13*smoothstep(.39,.5,r);float center=1.0-smoothstep(.018,.06,r);col=mix(col,vec3(.97,.95,.81),center);gl_FragColor=vec4(col,1.0);}`});
  function makeFruit(x,y,scale=1) {
    const fruit=new T.Group(),peelMaterial=new T.MeshStandardMaterial({color:green,roughness:.72,bumpMap:poreTexture,bumpScale:.055});
    const skin=new T.Mesh(new T.SphereGeometry(1,44,32),peelMaterial);skin.scale.set(1,1.31,.46);fruit.add(skin);
    const cut=new T.Mesh(new T.CircleGeometry(.87,64),fleshMaterial);cut.scale.y=1.31;cut.position.z=.448;fruit.add(cut);
    const rimMesh=new T.Mesh(new T.TorusGeometry(.91,.066,9,64),peelMaterial);rimMesh.scale.y=1.31;rimMesh.position.z=.40;fruit.add(rimMesh);
    const scar=new T.Mesh(new T.SphereGeometry(.15,12,10),new T.MeshStandardMaterial({color:0xb79526,roughness:.9}));scar.position.set(.68,-.67,.2);scar.scale.set(.7,1.8,.25);fruit.add(scar);
    fruit.position.set(x,y,.4);fruit.scale.setScalar(scale);group.add(fruit);return{group:fruit,material:peelMaterial,resetColor:green.clone()};
  }
  const fruits=[makeFruit(-3.2,.65),makeFruit(-.3,.65),makeFruit(2.6,.65),makeFruit(5.5,.65)];
  const resetFruit=makeFruit(-4.8,-2.9,1.1);resetFruit.group.scale.set(1.3,.85,1.1);resetFruit.material.color.copy(saffron);
  const bark=new T.MeshStandardMaterial({color:0x6e7437,roughness:.95,bumpMap:poreTexture,bumpScale:.1});
  const twigs=[];
  for(let i=0;i<4;i++){
    const x=fruits[i].group.position.x;
    const curve=new T.CatmullRomCurve3([new T.Vector3(x-.17,2.9,.15),new T.Vector3(x+.04,2.25,.2),new T.Vector3(x,1.9,.3)]);
    const mesh=new T.Mesh(new T.TubeGeometry(curve,20,.065,8,false),bark);group.add(mesh);twigs.push(mesh);
  }
  const leafShape=new T.Shape();leafShape.moveTo(0,0);leafShape.bezierCurveTo(-.43,.30,-.56,.78,0,1.25);leafShape.bezierCurveTo(.56,.78,.43,.30,0,0);
  const leafGeometry=new T.ExtrudeGeometry(leafShape,{depth:.018,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:12});
  const leafPositions=leafGeometry.attributes.position.array;
  for(let i=0;i<leafPositions.length;i+=3)leafPositions[i+2]+=.09*Math.sin(leafPositions[i+1]/1.25*Math.PI)*(1-Math.min(1,Math.abs(leafPositions[i])/.45));leafGeometry.computeVertexNormals();
  const leafMaterial=new T.ShaderMaterial({side:T.DoubleSide,
    vertexShader:`varying vec2 vLeaf;varying vec3 vNormal;void main(){vLeaf=position.xy;vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec2 vLeaf;varying vec3 vNormal;void main(){float mainVein=1.0-smoothstep(.008,.022,abs(vLeaf.x));float smallVein=pow(abs(cos(vLeaf.y*25.0+abs(vLeaf.x)*16.0)),28.0)*.27;float light=.6+.4*abs(dot(normalize(vNormal),normalize(vec3(-.4,.7,1.0))));vec3 color=mix(vec3(.25,.36,.085),vec3(.56,.62,.25),mainVein*.55+smallVein);gl_FragColor=vec4(color*light,1.0);}`});
  const leaves=[];
  for(let i=0;i<15;i++){
    const mesh=new T.Mesh(leafGeometry,leafMaterial);const x=i<8?-6.2+i*1.45:-6.4+(i-8)*.25,y=i<8?2.9+(i%3)*.16:-2.7+(i%3)*.45;
    mesh.position.set(x,y,.5);mesh.rotation.z=(i%2?1:-1)*(.45+(i%4)*.31);mesh.rotation.y=.2;
    const scale=.65+(i%3)*.2;mesh.scale.setScalar(scale);group.add(mesh);leaves.push({mesh,z:mesh.rotation.z,phase:i*.72,open:0});
  }
  const gold=new T.MeshStandardMaterial({color:0xd2ae49,metalness:.62,roughness:.34});
  const crown=new T.Group();const band=new T.Mesh(new T.TorusGeometry(.16,.033,7,20),gold);band.rotation.x=Math.PI/2;crown.add(band);
  for(let i=0;i<3;i++){const p=new T.Mesh(new T.ConeGeometry(.057,.2,4),gold);p.position.set((i-1)*.115,.11,0);crown.add(p);}
  crown.position.set(1.1,-2.8,.7);group.add(crown);ctx.pin(ctx.dom.secretButton,crown,{width:.64});
  const fold=new T.Mesh(leafGeometry,leafMaterial);fold.position.set(.82,-3.08,.86);fold.rotation.set(.12,.2,-.7);fold.scale.set(.73,.75,.73);group.add(fold);
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
  const resize=()=>{ctx.fitCamera(ctx.mobile?6.4:5.5,[0,0,0],[0,0,18]);
    group.scale.setScalar(ctx.mobile?.6:1);group.position.set(ctx.mobile?-.13:0,ctx.mobile?1.3:0,0);
    const narrow=ctx.mobile&&ctx.stage.clientWidth<=360;
    for(let i=0;i<4;i++){fruits[i].group.position.set(ctx.mobile?(narrow?(i%2?1.43:-.68):(i%2?1.45:-1.45)):-3.2+i*2.9,ctx.mobile?(i<2?1.5:-1.4):.30,.4);
      fruits[i].group.scale.setScalar(narrow?.86:1);twigs[i].visible=!ctx.mobile;}
    resetFruit.group.position.set(ctx.mobile?1.2:-4.8,ctx.mobile?-4:-2.9,.4);
    crown.position.set(ctx.mobile?-2:1.1,ctx.mobile?-3.7:-2.8,.7);fold.position.set(crown.position.x-.28,crown.position.y-.28,.86);
  };resize();
  return {resize,overlay(value){frozen=value;if(!value)holdResetFrame=true;},celebrate(){resetAge=0;holdResetFrame=true;for(const f of fruits)f.resetColor.copy(f.material.color);},
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
