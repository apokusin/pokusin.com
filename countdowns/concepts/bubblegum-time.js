// One elastic object holds the real clock and actual archive prints.
export function create(ctx) {
  const T = ctx.THREE;
  const group = new T.Group(); ctx.root.add(group);
  ctx.scene.background = null;
  ctx.renderer.setClearColor(0xd6eac9, 0);
  ctx.renderer.toneMappingExposure = 1.1;
  const hemi = new T.HemisphereLight(0xfaf7e7, 0x809374, 2.1);
  const key = new T.DirectionalLight(0xfff5ec, 3.4); key.position.set(-5, 8, 10);
  const rim = new T.DirectionalLight(0xffd9ec, 2.3); rim.position.set(7, 4, -3);
  group.add(hemi, key, rim);
  const gum = new T.MeshPhysicalMaterial({color:0xf372ac, roughness:.16, metalness:.05, clearcoat:1, clearcoatRoughness:.08});
  const reflectionBytes=new Uint8Array(256*128*4);
  for(let y=0;y<128;y++)for(let x=0;x<256;x++){
    const band=Math.exp(-(((y-44)/8)**2))*Math.exp(-(((x-126)/74)**2));
    const side=Math.exp(-(((x-38)/8)**2))*Math.exp(-(((y-70)/32)**2));
    const value=Math.min(255,28+band*222+side*155),i=(y*256+x)*4;
    reflectionBytes[i]=reflectionBytes[i+1]=reflectionBytes[i+2]=value;reflectionBytes[i+3]=255;
  }
  const reflection=new T.DataTexture(reflectionBytes,256,128);reflection.mapping=T.EquirectangularReflectionMapping;reflection.colorSpace=T.SRGBColorSpace;reflection.needsUpdate=true;
  gum.envMap=reflection;gum.envMapIntensity=.9;
  const pale = new T.MeshPhysicalMaterial({color:0xf1ebd8, roughness:.32, clearcoat:.5});
  const metal = new T.MeshStandardMaterial({color:0xb9beb0, metalness:.85, roughness:.22});
  const gold = new T.MeshStandardMaterial({color:0xecc871, metalness:.65, roughness:.26});
  const tube = (points,radius,material=gum,segments=48) => {
    const path = new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    const mesh = new T.Mesh(new T.TubeGeometry(path,segments,radius,10,false),material);
    group.add(mesh); return mesh;
  };
  function roundPath(path,x,y,w,h,r) {
    path.moveTo(x+r,y); path.lineTo(x+w-r,y); path.quadraticCurveTo(x+w,y,x+w,y+r);
    path.lineTo(x+w,y+h-r); path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    path.lineTo(x+r,y+h); path.quadraticCurveTo(x,y+h,x,y+h-r);
    path.lineTo(x,y+r); path.quadraticCurveTo(x,y,x+r,y);
  }
  const shape = new T.Shape();
  shape.moveTo(-7.2,.15);shape.bezierCurveTo(-6.9,.25,-6.4,.65,-5.9,.97);
  shape.bezierCurveTo(-5.35,1.67,-4.1,1.50,-3.2,1.23);shape.bezierCurveTo(-2.75,1.54,-1.65,1.65,-.80,1.30);
  shape.bezierCurveTo(-.25,1.48,.80,1.58,1.70,1.28);shape.bezierCurveTo(2.25,1.50,3.60,1.55,4.60,1.43);
  shape.bezierCurveTo(5.3,1.70,5.7,2.4,6.4,2.45);shape.bezierCurveTo(6.9,2.2,6.7,1.2,7.10,.7);
  shape.bezierCurveTo(7.4,.3,6.85,-.82,6.3,-1.01);shape.bezierCurveTo(5.7,-1.51,4.22,-1.49,3.65,-1.3);
  shape.bezierCurveTo(2.88,-1.1,1.92,-1.64,1.08,-1.37);shape.bezierCurveTo(.4,-1.05,-.84,-1.63,-1.95,-1.39);
  shape.bezierCurveTo(-2.72,-1.18,-4.25,-1.63,-5.31,-1.36);shape.bezierCurveTo(-6.4,-1.06,-6.27,-.11,-7.2,.15);
  for (const x of [-4.8,-2.05,.7,3.45]) {
    const hole = new T.Path(); roundPath(hole,x,-.91,2.2,1.95,.3); shape.holes.push(hole);
  }
  const ribbon = new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.32,bevelEnabled:true,bevelSize:.19,bevelThickness:.27,bevelSegments:6,curveSegments:22}),gum);
  ribbon.position.set(0,.05,0); ribbon.rotation.z=.095; group.add(ribbon);
  const sculpt=ribbon.geometry.attributes.position.array;
  for(let i=0;i<sculpt.length;i+=3)sculpt[i+2]+=.065*Math.sin(sculpt[i]*2.7+sculpt[i+1]*2.4)+.035*Math.cos(sculpt[i]*1.3-sculpt[i+1]*3.2);
  ribbon.geometry.computeVertexNormals();
  const ribbonBase = ribbon.geometry.attributes.position.array.slice();
  const balloon = new T.Mesh(new T.SphereGeometry(1,64,40),gum);
  balloon.position.set(6.25,3.2,-.5); balloon.scale.set(3.75,4.1,2.35); group.add(balloon);
  tube([[4.7,.6,.1],[5.3,1.6,.2],[5.9,2.5,-.2]],.62);
  const tethers = [
    [[-6.8,.6,-.1],[-7.8,2.9,-.4],[-6.6,4.7,-.7]],
    [[-.8,1.4,-.5],[-1.2,3.5,-.3],[1.6,4.5,-.2]],
    [[6.3,-.5,.1],[5.9,-2,.2],[6.8,-3.9,-.2]],
    [[-1.6,-1.3,-.1],[-.4,-3.1,-.1],[1.4,-4.5,-.3]]
  ].map(points=>tube(points,.1));
  const pins = [];
  for (const p of [[-7.1,.3,.7],[6.7,-.1,.7]]) {
    const pin=new T.Group(); const stem=new T.Mesh(new T.CylinderGeometry(.095,.095,.65,16),metal);
    const head=new T.Mesh(new T.SphereGeometry(.23,20,12),metal); head.scale.set(1,.35,1); head.position.y=.33;
    pin.add(stem,head);pin.position.set(...p);pin.rotation.z=-.4;group.add(pin);pins.push(pin);
  }
  const droplets=[];
  for(let i=0;i<13;i++) {
    const d=new T.Mesh(new T.SphereGeometry(.09+(i%3)*.035,14,10),gum);
    const x=-7+(i*1.137)%14,y=-4.7+(i*1.71)%8.7;
    d.position.set(x,y,-.45);d.scale.y=i%3===0?1.8:1;group.add(d);droplets.push({mesh:d,x,y});
  }
  const crown=new T.Group();
  const band=new T.Mesh(new T.TorusGeometry(.19,.045,7,24),gold);band.rotation.x=Math.PI/2;crown.add(band);
  for(let i=0;i<3;i++){const tooth=new T.Mesh(new T.ConeGeometry(.075,.24,4),gold);tooth.position.set((i-1)*.14,.13,0);crown.add(tooth);}
  crown.position.set(1.4,-3.4,.5); crown.rotation.z=-.1; group.add(crown);ctx.pin(ctx.dom.secretButton,crown,{width:.62});
  const curl=tube([[1.05,-3.55,.1],[1.25,-3.28,.5],[1.6,-3.35,.55],[1.65,-3.65,.05]],.14);
  let frozen=false,focused=false,drag=0,secretFocus=false,dragStart=null,dragging=false,deforming=false;
  const pointerPoint=new T.Vector3();
  ctx.on(ctx.canvas,'pointerdown',e=>{dragStart={x:e.clientX,y:e.clientY,type:e.pointerType};dragging=false;});
  ctx.on(ctx.canvas,'pointermove',e=>{if(!dragStart)return;const dx=e.clientX-dragStart.x,dy=e.clientY-dragStart.y;
    dragging=Math.hypot(dx,dy)>=6&&(dragStart.type==='mouse'||Math.abs(dx)>Math.abs(dy));});
  for(const event of ['pointerup','pointercancel','pointerleave'])ctx.on(ctx.canvas,event,()=>{dragStart=null;dragging=false;ctx.wake();});
  const setFocus = e => { focused=!!e.target.closest?.('.card,.art-secret-trigger'); ctx.wake(); };
  ctx.on(ctx.hero,'focusin',setFocus);ctx.on(ctx.hero,'focusout',()=>{focused=false;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'pointerenter',()=>{secretFocus=true;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'pointerleave',()=>{secretFocus=false;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'focus',()=>{secretFocus=true;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'blur',()=>{secretFocus=false;ctx.wake();});
  const resize=()=>{ctx.fitCamera(ctx.mobile?6.6:5.5,[0,0,0],[0,0,18]);
    group.scale.setScalar(ctx.mobile ? .51 : 1);group.position.set(ctx.mobile?-.5:0,ctx.mobile?1.4:0,0);
    crown.position.set(ctx.mobile?3.4:2.5,ctx.mobile?-3.4:-2.4,.5);
    curl.position.set(crown.position.x-1.4,crown.position.y+3.4,0);};
  resize();
  return {
    resize,overlay(value){frozen=value;},
    animate(time,dt){
      if(frozen)return;
      const moving=!ctx.reduced&&!focused;
      const age=Number.isFinite(ctx.burst)?ctx.burst:99,remote=ctx.remoteAge;
      let breath=0;
      if(!ctx.reduced&&age<1.8){const p=age<.65?Math.max(0,(age-.08)/.57):1-(age-.65)/1.15;const bounded=Math.max(0,Math.min(1,p));breath=bounded*bounded*(3-2*bounded)*.12;}
      else if(!ctx.reduced&&remote<.45)breath=Math.sin(remote/.45*Math.PI)*.02;
      balloon.scale.set(3.75*(1+breath),4.1*(1+breath),2.35*(1+breath));
      const target=moving&&ctx.pointer.down&&dragging?1:0;drag+=(target-drag)*Math.min(1,dt*7);
      const arr=ribbon.geometry.attributes.position.array;
      pointerPoint.set(ctx.pointer.x,ctx.pointer.y,0).unproject(ctx.camera);ribbon.worldToLocal(pointerPoint);
      const px=pointerPoint.x,py=pointerPoint.y;
      const needsDeform=(moving&&ctx.pointer.active)||breath>0||drag>.001;
      if(needsDeform||deforming){for(let i=0;i<arr.length;i+=3){const x=ribbonBase[i],y=ribbonBase[i+1];
          const influence=moving&&ctx.pointer.active?Math.exp(-((x-px)**2+(y-py)**2)*.38):0;
          arr[i+1]=y+influence*drag*.18+breath*Math.sin(x*.75-age*5)*.48;
          arr[i+2]=ribbonBase[i+2]+influence*(ctx.pointer.down?.18:.065);
        }
        ribbon.geometry.attributes.position.needsUpdate=true;
        ribbon.geometry.computeVertexNormals();
      }
      deforming=needsDeform;
      curl.rotation.x=secretFocus?.22:0;crown.rotation.z=-.1+(secretFocus?.07:0);
      for(const d of droplets)d.mesh.position.y=d.y+(moving?Math.sin(time*.55+d.x)*.035:0);
    }
  };
}
