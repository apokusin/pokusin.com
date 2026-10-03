// A coast is the navigation surface. State and native actions belong to the host.
export async function create(host){
  const T=host.THREE,version=document.documentElement.dataset.artVersion;
  const {canvasInk,labelInk,mountArchive}=await import('../scene-gallery.js?v='+version);
  const base='assets/concepts/low-tide-later/scene/',url=path=>new URL(base+path+'?v='+version,document.baseURI).href;
  const fonts=[new FontFace('Tide Hand',`url(${url('typography/Caveat-variable.ttf')})`,{weight:'400 700'}),new FontFace('Tide Serif',`url(${url('typography/BodoniModa-variable.ttf')})`,{weight:'400 900'}),new FontFace('Tide Sans',`url(${url('typography/RobotoCondensed-variable.ttf')})`,{weight:'100 900'})];
  host.own({dispose(){fonts.forEach(face=>document.fonts.delete(face));}});
  await Promise.all(fonts.map(async face=>{await face.load();if(host.disposed)throw new Error('Disposed during Tide font decode');document.fonts.add(face);}));
  const [model,manifest,normalMap,titleMap,glyphImage]=await Promise.all([
    host.loadGLB(base+'scene.glb'),fetch(url('manifest.json')).then(r=>{if(!r.ok)throw new Error('Missing Tide manifest');return r.json();}),
    host.texture(base+'materials/water-capillary-normal.png',{colorSpace:'linear',flipY:false}),host.texture(base+'typography/title-countdowns.png',{flipY:false}),
    (async()=>{const image=new Image();image.src=url('typography/chalk-glyphs.png');await image.decode();return image;})()
  ]);
  if(host.disposed)throw new Error('Disposed during Tide asset decode');
  const installation=model.scene;host.root.add(installation);
  const node=name=>{const value=installation.getObjectByName(name);if(!value)throw new Error('Missing authored Tide node '+name);return value;};
  const units=['days','hours','minutes','seconds'],posts=units.map(unit=>node('post_'+unit)),postRest=posts.map(post=>({position:post.position.clone(),scale:post.scale.clone()}));
  const beds=[],waters=[];installation.traverse(object=>{if(object.isMesh){object.castShadow=!object.name.startsWith('screen_')&&!object.name.startsWith('sea_surface_');object.receiveShadow=true;if(object.name.startsWith('shore_bed_'))beds.push(object);if(object.name.startsWith('sea_surface_'))waters.push(object);}});
  if(beds.length!==7||waters.length!==7)throw new Error('Incomplete authored shoreline');
  normalMap.wrapS=normalMap.wrapT=T.RepeatWrapping;normalMap.repeat.set(1,1);
  const camera=new T.PerspectiveCamera(27,innerWidth/innerHeight,.1,130);host.useCamera(camera);const target=new T.Vector3(),viewDirection=new T.Vector3(0,24,17).normalize();
  host.scene.background=new T.Color('#DCE8EB');host.renderer.toneMapping=T.NeutralToneMapping||T.ACESFilmicToneMapping;host.renderer.toneMappingExposure=1.02;host.renderer.shadowMap.type=T.VSMShadowMap;
  document.documentElement.style.setProperty('--scene-utility-ink','#113f73');document.documentElement.style.setProperty('--scene-menu-paper','#e8f1ec');
  const homeLink=host.destinations.home,homeColor=homeLink?.style.color;if(homeLink)homeLink.style.color='#eef1e8';host.own({dispose(){if(homeLink)homeLink.style.color=homeColor||'';}});
  const sun=host.own(new T.DirectionalLight('#fffdf7',2.1));sun.position.set(-8,16,-9);sun.target.position.set(0,0,0);sun.castShadow=true;sun.shadow.mapSize.set(host.mobile?1024:2048,host.mobile?1024:2048);sun.shadow.radius=4;sun.shadow.blurSamples=10;Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:60});sun.shadow.bias=-.00008;sun.shadow.normalBias=.017;host.scene.add(sun,sun.target);
  host.scene.add(host.own(new T.HemisphereLight('#D8EDF8','#63737b',.62)));
  const reflection=host.own(new T.Scene());reflection.background=new T.Color('#92B7CF');
  const sky=host.own(new T.Mesh(new T.SphereGeometry(45,24,12),new T.MeshBasicMaterial({color:'#bbd7e7',side:T.BackSide})));reflection.add(sky);
  function cloud(x,y,z,w,h,intensity){const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color('#fffdfa').multiplyScalar(intensity),side:T.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);reflection.add(panel);}
  cloud(-11,20,5,14,7,3.4);cloud(9,18,-8,19,5,2.4);cloud(-2,22,-14,10,8,1.8);cloud(-5,8,16,22,2.4,2.8);
  const pmrem=host.own(new T.PMREMGenerator(host.renderer)),environment=host.own(pmrem.fromScene(reflection,.035,.1,70));host.scene.environment=environment.texture;host.scene.environmentIntensity=.65;

  const rippleSlots=Array.from({length:8},()=>new T.Vector4(0,0,-100,0));let rippleIndex=0,lastRipple=-100,pointerDown=null,frozen=false,approach=null,focusMesh=null,secretLift=0,decorativeTime=0,localFrontAt=-100,remoteFrontAt=-100,remoteQueued=false;
  const postContacts=posts.map((post,i)=>new T.Vector4(post.position.x,post.position.z,...manifest.runtime.posts[i].radius));
  const printContacts=Array.from({length:13},()=>new T.Vector4(0,0,0,0)),printAxes=Array.from({length:13},()=>new T.Vector4(1,0,0,0));
  const uniforms={uTideTime:{value:0},uStill:{value:host.reduced?1:0},uSurge:{value:0},uFront:{value:0},uShoreShift:{value:0},uRipples:{value:rippleSlots},uPosts:{value:postContacts},uPrints:{value:printContacts},uPrintAxes:{value:printAxes}};
  const field=`
    uniform float uTideTime,uStill,uSurge,uFront,uShoreShift;
    uniform vec4 uRipples[8],uPosts[4],uPrints[13],uPrintAxes[13];
    varying vec3 vTideWorld;
    float shoreX(float z){return -.5+4.5*tanh((z+5.)/3.)-.15*min(max(z,0.),18.)+.35*sin(z*.60)+.55*sin(max(z-18.,0.)*.13);}
    float bedY(vec2 p){p.x-=uShoreShift;float d=p.x-shoreX(p.y);float macro=.028*sin(p.x*1.43+p.y*.55)+.018*sin(p.x*3.3-p.y*1.72);return -.30+.82*smoothstep(-1.6,2.,d)+macro-.045*exp(-pow((d+.5)/.62,2.))*(1.+.3*sin(p.y*3.4));}
    float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float grainNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);}
    float disturbance(vec2 p){float sum=0.;for(int i=0;i<8;i++){float age=uTideTime-uRipples[i].z;float radius=length(p-uRipples[i].xy);if(age>=0.&&age<.9)sum+=uRipples[i].w*.031*sin(radius*16.-age*12.)*exp(-radius*2.1-age*3.5)*sin(age/.9*3.14159);}return sum;}
    float flowHeight(vec2 p,float time){
      vec2 q=p-uShoreShift*vec2(1.,0.);float warp=.8*sin(q.x*.82+q.y*.36)+.34*sin(q.y*1.37-q.x*.48);
      return .045*sin(q.x*1.6+q.y*2.7+warp+time*.32)+.024*sin(q.x*3.8-q.y*2.4+warp*.7-time*.27)+.009*sin(q.x*7.3+q.y*4.4+warp*.8+time*.43);
    }
    float detailHeight(vec2 p,float time){
      vec2 q=p-uShoreShift*vec2(1.,0.);vec2 current=vec2(time*.10,-time*.047);vec2 warp=vec2(grainNoise(q*1.8+current),grainNoise(q*1.8+vec2(8.7,3.6)-current));
      vec2 flowing=q+warp*.44;float h=flowHeight(p,time)+.0065*(grainNoise(flowing*7.3+current)-.5)+.003*(grainNoise(flowing*16.7+current*1.8)-.5)+.001*(grainNoise(flowing*31.3-current*2.1)-.5);
      for(int i=0;i<4;i++){vec4 c=uPosts[i];vec2 a=p-c.xy;float r=length(a/vec2(1.,.68));h+=.006*sin(r*11.-time*.37+grainNoise(a*2.1)*2.)*exp(-max(0.,r-1.)*1.5);}
      return h;
    }
    float cellBorder(vec2 p){vec2 id=floor(p),f=fract(p);float nearest=10.,second=10.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 off=vec2(hash21(id+g),hash21(id+g+vec2(83.2,17.7)));float d=length(g+off-f);if(d<nearest){second=nearest;nearest=d;}else second=min(second,d);}return second-nearest;}
    vec2 waterCells(vec2 p,float time){return p*vec2(2.3,3.5)+vec2(1.1*sin(p.y*1.48+time*.13)+.54*sin(p.x*2.14),.70*sin(p.x*1.66-time*.12)+.45*sin(p.y*2.08));}
    float printProtection(vec2 p){float mask=0.;for(int i=0;i<13;i++){vec4 c=uPrints[i];if(c.z>.01){vec2 a=p-c.xy;vec2 l=vec2(a.x*uPrintAxes[i].x-a.y*uPrintAxes[i].y,a.x*uPrintAxes[i].y+a.y*uPrintAxes[i].x);float inside=(1.-smoothstep(c.z*.565,c.z*.60,abs(l.x)))*(1.-smoothstep(c.w*.625,c.w*.66,abs(l.y)));mask=max(mask,inside);}}return mask;}
    float tideY(vec2 p){vec2 q=p;q.x-=uShoreShift;float time=uStill>.5?0.:uTideTime;float y=.20+flowHeight(p,time);y+=.065*exp(-pow((q.y-5.5-.62*sin(q.x*.72)-sin(time*.09)*.15)/.43,2.));float d=q.x-shoreX(q.y);y+=uSurge*.18*exp(-pow((d+1.95-uFront*2.50)/.67,2.));y+=uStill>.5?0.:disturbance(p);for(int i=0;i<13;i++){vec4 c=uPrints[i];if(c.z>.01){vec2 a=p-c.xy;vec2 l=vec2(a.x*uPrintAxes[i].x-a.y*uPrintAxes[i].y,a.x*uPrintAxes[i].y+a.y*uPrintAxes[i].x);float inside=(1.-smoothstep(c.z*.56,c.z*.66,abs(l.x)))*(1.-smoothstep(c.w*.62,c.w*.72,abs(l.y)));y=mix(y,min(y,uPrintAxes[i].z-.045),inside);}}return y;}

  `;
  function injectWorld(shader){Object.assign(shader.uniforms,uniforms);shader.vertexShader=field+shader.vertexShader;shader.fragmentShader=field+shader.fragmentShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvTideWorld=(modelMatrix*vec4(transformed,1.)).xyz;');}
  const seaMaterial=host.own(new T.MeshPhysicalMaterial({color:'#23547b',roughness:.115,metalness:0,ior:1.333,transmission:.86,thickness:.48,attenuationColor:'#719dbd',attenuationDistance:1.65,envMapIntensity:2.35,clearcoat:1,clearcoatRoughness:.07,side:T.FrontSide}));
  seaMaterial.onBeforeCompile=shader=>{
    injectWorld(shader);
    shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
      vec2 tidePoint=(modelMatrix*vec4(position,1.)).xz;float ex=.075;float dx=(tideY(tidePoint+vec2(ex,0))-tideY(tidePoint-vec2(ex,0)))/(2.*ex);float dz=(tideY(tidePoint+vec2(0,ex))-tideY(tidePoint-vec2(0,ex)))/(2.*ex);objectNormal=normalize(vec3(-dx,1.,-dz));`);
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y=tideY((modelMatrix*vec4(position,1.)).xz);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      float normalPhase=uStill>.5?0.:uTideTime;vec2 wp=vTideWorld.xz;float ne=.008;
      float nx=(detailHeight(wp+vec2(ne,0),normalPhase)-detailHeight(wp-vec2(ne,0),normalPhase))/(2.*ne);float nz=(detailHeight(wp+vec2(0,ne),normalPhase)-detailHeight(wp-vec2(0,ne),normalPhase))/(2.*ne);
      vec3 flowingNormal=normalize(mat3(viewMatrix)*vec3(-nx,1.,-nz));normal=normalize(mix(normal,flowingNormal,.86));nonPerturbedNormal=normal;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float tideDepth=vTideWorld.y-bedY(vTideWorld.xz);if(tideDepth<.004||printProtection(vTideWorld.xz)>.64)discard;
      float tidePhase=uStill>.5?0.:uTideTime;vec2 cells=waterCells(vTideWorld.xz,tidePhase);float n1=grainNoise(vTideWorld.xz*6.8+vec2(tidePhase*.055,0.));float n2=grainNoise(vTideWorld.xz*32.4);
      float lace=1.-smoothstep(.012,.065,cellBorder(cells));float fineLace=1.-smoothstep(.005,.035,cellBorder(cells*2.07+vec2(4.7,12.3)));
      float shoreRibbon=exp(-pow((tideDepth-.018-.012*sin(vTideWorld.z*17.+n1*4.))/.017,2.));
      vec2 foamFlow=vTideWorld.xz+vec2(tidePhase*.028,-tidePhase*.014)+vec2(grainNoise(vTideWorld.xz*1.7),grainNoise(vTideWorld.xz*1.7+vec2(8.3,2.6)))*.55;
      float foamMass=.60*grainNoise(foamFlow*2.6)+.28*grainNoise(foamFlow*6.3+vec2(4.1,1.7))+.12*grainNoise(foamFlow*17.4);
      float foamPatches=smoothstep(.53,.66,foamMass)*(1.-smoothstep(.55,.70,grainNoise(foamFlow*12.3+vec2(3.2,9.7))));
      float organicLace=(1.-smoothstep(.017,.048,abs(foamMass-.52)))*smoothstep(.26,.60,n1);
      float brokenFoam=foamPatches*.78+organicLace*.31+lace*.065+fineLace*.025;
      float shoreFoam=brokenFoam*exp(-max(0.,tideDepth-.035)*4.7)+shoreRibbon*.73;
      float contactFoam=0.;for(int i=0;i<4;i++){vec4 p=uPosts[i];vec2 contact=(vTideWorld.xz-p.xy)/p.zw;float rim=length(contact)-1.;float fringe=.026*sin(atan(contact.y,contact.x)*17.+tidePhase*.12);float core=exp(-pow((rim-.035-fringe)/.043,2.))*(.46+.54*n2);float wake=brokenFoam*exp(-max(0.,rim-.07)*2.1)*smoothstep(-.01,.18,rim);contactFoam=max(contactFoam,core+wake*.48);}
      float printFoam=0.;for(int i=0;i<13;i++){vec4 c=uPrints[i];if(c.z>.01){vec2 a=vTideWorld.xz-c.xy;vec2 l=vec2(a.x*uPrintAxes[i].x-a.y*uPrintAxes[i].y,a.x*uPrintAxes[i].y+a.y*uPrintAxes[i].x);vec2 d=abs(l)-vec2(c.z*.565,c.w*.625);float edge=max(d.x,d.y);float film=1.-smoothstep(.04,.18,uPrintAxes[i].z-vTideWorld.y);float fringe=exp(-pow((edge-.022)/.048,2.))*smoothstep(-.01,.015,edge);printFoam=max(printFoam,fringe*film*(.42+.58*lace));}}
      float crest=.065*exp(-pow((vTideWorld.z-5.5-.62*sin((vTideWorld.x-uShoreShift)*.72)-sin(tidePhase*.09)*.15)/.43,2.));
      float crestFoam=smoothstep(.046,.064,crest)*brokenFoam*smoothstep(.27,.70,n1);
      float tideFoam=clamp(shoreFoam+contactFoam*.80+printFoam*.72+crestFoam*.67,0.,.95);
      float shoal=1.-smoothstep(.08,.60,tideDepth);float variation=.82+.18*grainNoise(vTideWorld.xz*2.2+vec2(tidePhase*.08,0.));
      diffuseColor.rgb*=mix(vec3(.52,.68,.84),vec3(.86,1.0,1.05),shoal)*variation;
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.91,.94,.93),tideFoam);`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.63,tideFoam);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_fragment>',T.ShaderChunk.transmission_fragment.replace('material.transmission = transmission;','material.transmission = transmission * (1. - tideFoam * .95) * (1. - smoothstep(.09, .28, tideDepth));').replace('material.thickness = thickness;','material.thickness = clamp(tideDepth * .72, .025, .65);'));
  };
  seaMaterial.customProgramCacheKey=()=> 'tide-physical-common-shore-v2';
  waters.forEach(water=>{water.material=seaMaterial;water.receiveShadow=true;water.userData.scenePassthrough=true;});
  const sandMaterial=beds[0].material; sandMaterial.envMapIntensity=.18;sandMaterial.normalScale.set(1.35,1.35);
  sandMaterial.onBeforeCompile=shader=>{injectWorld(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float wetDepth=tideY(vTideWorld.xz)-vTideWorld.y;float wet=clamp(wetDepth*3.2+.20,0.,.68);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.53,.65,.74),wet);
    float time=uStill>.5?0.:uTideTime;vec2 p=vTideWorld.xz;float vein=1.-smoothstep(.012,.085,cellBorder(waterCells(p,time)));
    float caustic=vein*smoothstep(.008,.065,wetDepth)*(1.-smoothstep(.18,.34,wetDepth));float mineral=grainNoise(p*110.);diffuseColor.rgb*=.94+.10*mineral;diffuseColor.rgb+=caustic*vec3(.13,.18,.20);`);};sandMaterial.customProgramCacheKey=()=> 'tide-bed-caustics-v2';
  const chalkMaterial=posts[0].material;chalkMaterial.envMapIntensity=.13;chalkMaterial.normalScale.set(.95,.95);
  chalkMaterial.onBeforeCompile=shader=>{injectWorld(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float absorb=.38+grainNoise(vTideWorld.xz*5.8+vTideWorld.y)*.28;float capillary=tideY(vTideWorld.xz)+absorb;
    float wet=1.-smoothstep(capillary-.15,capillary+.21,vTideWorld.y);float fleck=grainNoise(vTideWorld.xz*24.+vTideWorld.yy*17.);
    wet*=smoothstep(.20,.62,fleck+.28);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.018,.065,.145),wet*.88);`);};chalkMaterial.customProgramCacheKey=()=> 'tide-chalk-capillary-v1';
  const weed=node('brown_branching_weed');weed.material.side=T.DoubleSide;
  weed.material.onBeforeCompile=shader=>{injectWorld(shader);shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nif(uStill<.5)transformed.y+=disturbance((modelMatrix*vec4(position,1.)).xz)*.48;');};weed.material.customProgramCacheKey=()=> 'tide-ribbon-disturbance-v1';

  const paintGlyph=(ctx,value,{x,y,width,height})=>{
    const digit=Number(value);if(!Number.isInteger(digit)||digit<0||digit>9)return;
    const scale=Math.min(width/384,height*.98/512),w=384*scale,h=512*scale;
    // The faithful Bodoni atlas has one-pixel hairline joins. At a phone's
    // curved reading angle these disappear into a mip, leaving isolated dots.
    // A bounded four-source-pixel ink spread preserves the same glyph shapes.
    if(host.mobile)for(let i=0;i<8;i++){
      const angle=i*Math.PI/4,dx=Math.cos(angle)*4*scale,dy=Math.sin(angle)*4*scale;
      ctx.drawImage(glyphImage,digit*384,0,384,512,x-w/2+dx,y-h/2+dy,w,h);
    }
    ctx.drawImage(glyphImage,digit*384,0,384,512,x-w/2,y-h/2,w,h);
  };
  const clock=host.numerals({surfaces:units.map(unit=>[node('screen_timer_'+unit+'_left'),node('screen_timer_'+unit+'_right')]),ink:'#113f73',font:'400 545px "Tide Serif"',width:384,height:512,baseline:.46,roughness:.88,paintGlyph});
  units.forEach((unit,i)=>{
    const surface=node('screen_unit_'+unit),label=['D','H','M','S'][i];
    if(!host.mobile){labelInk(host,surface,label,{font:'400 116px "Tide Serif"',color:'#113f73',width:192,height:160});return;}
    canvasInk(host,surface,(ctx,w,h)=>{
      ctx.font='600 150px "Tide Serif"';ctx.fillStyle=ctx.strokeStyle='#113f73';
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=4.5;ctx.lineJoin='round';
      ctx.strokeText(label,w/2,h/2);ctx.fillText(label,w/2,h/2);
    },{width:192,height:160});
  });
  const shell=node('again_scallop'),shellRest=shell.position.clone(),tally=node('screen_tally'),tallyRest=tally.position.clone(),crown=node('salt_crystal_crown'),crownRest=crown.position.clone();
  let tallySpin=false,lastTallyLength=0;
  const count=host.ink(tally,{ink:'#113f73',font:'400 140px "Tide Serif"',width:288,height:160,baseline:.5,roughness:.88,paintGlyph(ctx,value,{x,y,width,height}){ctx.font=`400 ${Math.min(height*.98,width*1.60)}px "Tide Serif"`;ctx.fillText(value,x,y);}});
  function fitTally(){const length=String(host.getTally()).length;if(length===lastTallyLength)return;lastTallyLength=length;const phone=host.mobile?1.2:1;tally.scale.set(Math.min(1.4,Math.max(.46,length*.24))*phone,1,1.50*phone);}
  canvasInk(host,node('screen_reset'),(ctx,w,h)=>{ctx.font='400 155px "Tide Serif"';ctx.fillStyle='#fff4dc';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Again',w/2,h*.52,w*.92);},{width:640,height:192,lit:true});
  host.bind(shell,{native:host.dom.reset,kind:'reset',focus:()=>{returnToOpening();focusMesh=shell;},activate:host.requestReset});
  function inkPlane(w,h){const geometry=new T.PlaneGeometry(w,h),uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));return geometry;}
  const crownProxy=host.own(new T.Mesh(new T.PlaneGeometry(.85,.85),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));crownProxy.rotation.x=-Math.PI/2;crownProxy.position.y=.36;crown.add(crownProxy);
  host.bind(crownProxy,{native:host.dom.secretButton,kind:'secret',hover:({active})=>{secretLift=active?1:0;host.wake();},focus:()=>{returnToOpening();secretLift=1;focusMesh=crown;},activate:()=>{secretLift=1;host.revealSecret();host.wake();}});
  const title=host.own(new T.Mesh(inkPlane(.72,5.20),new T.MeshBasicMaterial({map:titleMap,transparent:true,depthWrite:false,toneMapped:false})));title.rotation.x=-Math.PI/2;title.position.set(8.83,.59,-5.16);title.userData.scenePassthrough=true;installation.add(title);const titleRest=title.position.clone();

  const records=new Map(),works=new Map(),destinations=new Map(),papers=[],paperRest=new Map();
  const archiveFaces=Object.entries(manifest.runtime.surfaces).filter(([,surface])=>surface.kind==='archive');
  const gate=new URLSearchParams(location.search).get('assetGate')==='1';
  await Promise.all(archiveFaces.map(async([name,spec],index)=>{
    const surface=node(name),paper=node(spec.paper);paperRest.set(paper,{position:paper.position.clone(),rotation:paper.rotation.clone(),scale:paper.scale.clone()});
    if(gate&&!spec.openingVisible){paper.visible=false;return;}
    const exhibit=host.exhibits.find(value=>value.id===spec.record);if(!exhibit)throw new Error('Missing Tide work '+spec.record);await mountArchive(host,surface,exhibit);
    records.set(exhibit.id,{exhibit,surface,paper,index,spec});works.set(exhibit.anchor,surface);papers.push(paper);
    // A thin clear saline film catches real environment highlights above the faithful print.
    const filmMaterial=host.own(new T.MeshPhysicalMaterial({color:'#ffffff',transparent:true,opacity:.16,roughness:.09,metalness:0,ior:1.333,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
    filmMaterial.onBeforeCompile=shader=>{injectWorld(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      float phase=uStill>.5?0.:uTideTime;vec2 p=vTideWorld.xz;float e=.009;float sx=(detailHeight(p+vec2(e,0),phase)-detailHeight(p-vec2(e,0),phase))/(2.*e);float sz=(detailHeight(p+vec2(0,e),phase)-detailHeight(p-vec2(0,e),phase))/(2.*e);normal=normalize(mat3(viewMatrix)*vec3(-sx*.38,1.,-sz*.38));nonPerturbedNormal=normal;`);shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float wetFilm=1.-smoothstep(.04,.35,vTideWorld.y-tideY(vTideWorld.xz));diffuseColor.a*=wetFilm*(.18+.82*smoothstep(.21,.48,max(abs(vMapUv.x-.5),abs(vMapUv.y-.5))));`);};
    // USE_MAP gives the saline layer the original face UV without changing its image below.
    filmMaterial.map=surface.material.map;filmMaterial.onBeforeCompile=(original=>shader=>{original(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','');})(filmMaterial.onBeforeCompile);filmMaterial.customProgramCacheKey=()=> 'tide-clear-print-film-v1';
    const film=host.own(new T.Mesh(host.own(surface.geometry.clone()),filmMaterial));film.position.y=.009;film.userData.scenePassthrough=true;surface.add(film);

    paper.geometry=host.own(paper.geometry.clone());const b=(paper.geometry.computeBoundingBox(),paper.geometry.boundingBox),size=b.getSize(new T.Vector3());
    const caption=host.own(new T.Mesh(inkPlane(size.x*.86,.36),new T.MeshBasicMaterial()));caption.rotation.x=-Math.PI/2;caption.position.set(0,.062,size.z*.57);paper.add(caption);labelInk(host,caption,exhibit.showName,{font:'400 103px "Tide Hand"',color:'#113f73',width:1024,height:128});
    const version=host.own(new T.Mesh(inkPlane(size.x*.63,.22),new T.MeshBasicMaterial()));version.visible=false;version.rotation.x=-Math.PI/2;version.position.set(0,.063,size.z*.67);paper.add(version);labelInk(host,version,exhibit.label+(exhibit.live?' · LIVE':''),{font:'400 60px "Tide Sans"',color:'#113f73',width:1024,height:128});
    records.get(exhibit.id).versionFace=version;
    const basePositions=paper.geometry.attributes.position.array.slice(),weights=new Float32Array(paper.geometry.attributes.position.count);for(let i=0;i<weights.length;i++){const u=(basePositions[i*3]-b.min.x)/size.x,v=(basePositions[i*3+2]-b.min.z)/size.z;weights[i]=Math.max(0,(u-.65)/.35)*Math.max(0,(v-.67)/.33);}
    paper.userData.curlBase=basePositions;paper.userData.curlWeights=weights;paper.userData.hover=0;paper.userData.lift=0;
    host.bind(surface,{native:exhibit.anchor,kind:'preview',hover:({active})=>{paper.userData.hover=active?1:0;version.visible=!!active;host.wake();},focus:()=>{paper.userData.hover=1;version.visible=true;focusSurface(surface);},blur:()=>{paper.userData.hover=0;version.visible=false;},activate:()=>openWork(exhibit,surface)});
  }));
  const tabStates=[];
  function destinationTab(record,native,label,index=0){
    const paper=record.paper;paper.geometry.computeBoundingBox();const b=paper.geometry.boundingBox,size=b.getSize(new T.Vector3());
    const stock=host.own(new T.Mesh(new T.BoxGeometry(.38,.025,.31),paper.material));stock.position.set(index?.44:-.15,.047,size.z*.50+.10);paper.add(stock);stock.castShadow=true;stock.receiveShadow=true;
    const arrow=host.own(new T.Mesh(inkPlane(.29,.26),new T.MeshBasicMaterial()));arrow.rotation.x=-Math.PI/2;arrow.position.y=.022;stock.add(arrow);labelInk(host,arrow,'↗',{font:'500 112px "Tide Sans"',color:'#113f73',width:160,height:160});
    const labelFace=host.own(new T.Mesh(inkPlane(1.7,.27),new T.MeshBasicMaterial()));labelFace.rotation.x=-Math.PI/2;labelFace.position.set(.54,.041,.35);stock.add(labelFace);labelInk(host,labelFace,label,{font:'400 107px "Tide Hand"',color:'#113f73',width:768,height:128});labelFace.visible=false;
    const proxy=host.own(new T.Mesh(new T.PlaneGeometry(.7,.7),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));proxy.rotation.x=-Math.PI/2;proxy.position.y=.065;stock.add(proxy);
    const state={face:labelFace,active:0};tabStates.push(state);native.setAttribute('aria-label',record.exhibit.showName+', '+label.replace(' ↗',''));destinations.set(native,record.surface);
    host.bind(proxy,{native,kind:'link',hover:({active})=>{state.active=active?1:0;labelFace.visible=!!active;host.wake();},focus:()=>{state.active=1;labelFace.visible=true;focusSurface(record.surface);},blur:()=>{state.active=0;labelFace.visible=false;}});
  }
  if(!gate){
    const main={got:'got:s4',dexter:'dexter:s8-final',sherlock:'sherlock:final',archer:'archer:s5-final','breaking-bad':'breaking-bad:final',severance:'severance:s2'},counts=new Map();
    for(const destination of host.destinations.archive){destinationTab(records.get(main[destination.show]),destination.anchor,'Archive ↗');counts.set(destination.show,1);}
    if(host.destinations.timeline)destinationTab(records.get(main.dexter),host.destinations.timeline,'Timeline ↗',1);
    if(host.destinations.live)destinationTab(records.get(main.severance),host.destinations.live,'Live ↗');
    // Adjacent versions are found through a thin paper edge, never another action on the picture.
    for(const group of host.groups){const versions=group.exhibits.filter(exhibit=>records.has(exhibit.id));if(versions.length<2)continue;const mainRecord=records.get(main[group.id]||versions[0].id);let next=versions.findIndex(value=>value.id===mainRecord.exhibit.id)+1;
      const edge=host.own(new T.Mesh(inkPlane(.38,.33),new T.MeshBasicMaterial()));mainRecord.paper.geometry.computeBoundingBox();const b=mainRecord.paper.geometry.boundingBox;edge.rotation.x=-Math.PI/2;edge.position.set(b.max.x+.17,.050,b.max.z-.30);mainRecord.paper.add(edge);labelInk(host,edge,'↘',{font:'400 115px "Tide Sans"',color:'#113f73',width:160,height:160});
      // Do not rebind a preview's semantic anchor to this separate navigation gesture.
      const proxy=host.own(new T.Mesh(new T.PlaneGeometry(.7,.7),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));proxy.rotation.x=-Math.PI/2;proxy.position.copy(edge.position);proxy.position.y+=.025;mainRecord.paper.add(proxy);host.bind(proxy,{kind:'navigation',activate:()=>{focusSurface(records.get(versions[next%versions.length].id).surface);next++;}});
    }
  }

  const raycaster=new T.Raycaster(),rayVector=new T.Vector2();
  function ripple(clientX,clientY){
    if(host.reduced||frozen||host.pending)return;const time=decorativeTime;if(time-lastRipple<.12)return;
    const rect=host.canvas.getBoundingClientRect();rayVector.set((clientX-rect.left)/rect.width*2-1,1-(clientY-rect.top)/rect.height*2);camera.updateMatrixWorld();raycaster.setFromCamera(rayVector,camera);
    const hits=raycaster.intersectObjects([...waters,...papers,...posts,shell],true);let hit=null;for(const value of hits){if(value.object.userData.scenePassthrough&&waters.includes(value.object)){if(value.point.y-bedHeight(value.point.x,value.point.z)>.012){hit=value;break;}}else return;}if(!hit)return;
    rippleSlots[rippleIndex].set(hit.point.x,hit.point.z,time,1);rippleIndex=(rippleIndex+1)%8;lastRipple=time;host.wake();
  }
  host.on(host.canvas,'pointermove',event=>{if(event.pointerType==='mouse'&&!host.pointer.down)ripple(event.clientX,event.clientY);});
  host.on(host.canvas,'pointerdown',event=>{pointerDown={x:event.clientX,y:event.clientY,time:performance.now(),type:event.pointerType};});
  host.on(host.canvas,'pointerup',event=>{if(pointerDown?.type==='touch'&&Math.hypot(event.clientX-pointerDown.x,event.clientY-pointerDown.y)<6&&performance.now()-pointerDown.time<350)ripple(event.clientX,event.clientY);pointerDown=null;});
  host.on(host.canvas,'pointercancel',()=>{pointerDown=null;});host.on(host.canvas,'lostpointercapture',()=>{pointerDown=null;});host.on(window,'blur',()=>{pointerDown=null;});host.on(document,'visibilitychange',()=>{if(document.hidden)pointerDown=null;});
  // Water is transparent to picking; solid authored posts, stock and shell still occlude.
  beds.forEach(bed=>host.registerOccluder(bed));posts.forEach(post=>host.registerOccluder(post));papers.forEach(paper=>host.registerOccluder(paper));host.registerOccluder(shell);host.registerOccluder(crown);
  const outline=host.own(new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#113f73',transparent:true,opacity:.75,depthTest:false})));outline.matrixAutoUpdate=false;outline.userData.scenePassthrough=true;outline.visible=false;host.root.add(outline);let outlineSource=null;
  function shoreX(z){return -.5+4.5*Math.tanh((z+5)/3)-.15*Math.min(Math.max(z,0),18)+.35*Math.sin(z*.60)+.55*Math.sin(Math.max(z-18,0)*.13);}
  function bedHeight(x,z){const d=x-uniforms.uShoreShift.value-shoreX(z),t=T.MathUtils.clamp((d+1.6)/3.6,0,1);x-=uniforms.uShoreShift.value;return -.30+.82*t*t*(3-2*t)+.028*Math.sin(x*1.43+z*.55)+.018*Math.sin(x*3.3-z*1.72)-.045*Math.exp(-Math.pow((d+.5)/.62,2))*(1+.3*Math.sin(z*3.4));}
  function clearPaperOfBed(paper){
    // The shore slopes under a print's whole footprint, not just its center.
    // Keep the actual stock above its highest covered bed with the same .045m gap.
    paper.geometry.computeBoundingBox();paper.updateWorldMatrix(true,false);
    const bounds=paper.geometry.boundingBox,point=new T.Vector3();let lift=0;
    for(let row=0;row<=24;row++)for(let column=0;column<=24;column++){
      point.set(T.MathUtils.lerp(bounds.min.x,bounds.max.x,column/24),bounds.min.y,T.MathUtils.lerp(bounds.min.z,bounds.max.z,row/24)).applyMatrix4(paper.matrixWorld);
      lift=Math.max(lift,bedHeight(point.x,point.z)+.045-point.y);
    }
    if(lift>0){paper.getWorldPosition(point);point.y+=lift;paper.parent.worldToLocal(point);paper.position.copy(point);paper.updateWorldMatrix(false,true);}
  }
  function synchronizeContacts(){
    posts.forEach((post,i)=>postContacts[i].set(post.position.x,post.position.z,manifest.runtime.posts[i].radius[0]*post.scale.x,manifest.runtime.posts[i].radius[1]*post.scale.z));
    for(const record of records.values()){const {paper,index,spec}=record;printContacts[index].set(paper.position.x,paper.position.z,spec.size[0]*paper.scale.x,spec.size[1]*paper.scale.z);printAxes[index].set(Math.cos(paper.rotation.y),Math.sin(paper.rotation.y),paper.position.y+.025*paper.scale.y,1);}
  }
  function arrange(){
    const phone=host.mobile;uniforms.uShoreShift.value=phone?-3.35:0;beds.forEach(bed=>bed.position.x=uniforms.uShoreShift.value);waters.forEach(water=>water.position.x=uniforms.uShoreShift.value);weed.position.x=uniforms.uShoreShift.value;node('salt_crumb_clusters').position.x=uniforms.uShoreShift.value;node('indigo_shore_thread').position.x=uniforms.uShoreShift.value;
    posts.forEach((post,i)=>{post.position.copy(postRest[i].position);post.scale.copy(postRest[i].scale);if(phone){const [x,z]=[[-1.13,-2.45],[1.16,-1.75],[-.70,1.15],[1.48,2.03]][i];post.scale.multiplyScalar(.74);post.position.set(x,bedHeight(x,z)+.02,z);}});
    shell.position.copy(shellRest);tally.position.copy(tallyRest);tally.scale.setScalar(1);crown.position.copy(crownRest);crown.scale.setScalar(1);title.position.copy(titleRest);title.scale.setScalar(1);
    for(const [paper,rest] of paperRest){paper.position.copy(rest.position);paper.rotation.copy(rest.rotation);paper.scale.copy(rest.scale);}
    if(phone){shell.position.set(1.55,bedHeight(1.55,3.72)+.016,3.72);shell.scale.setScalar(.64);tally.position.set(2.92,bedHeight(2.92,3.86)+.05,3.86);tally.scale.setScalar(1.20);crown.position.set(1.75,bedHeight(1.75,5.05)+.02,5.05);crown.scale.setScalar(1);title.position.set(3.05,.57,-4.7);title.scale.setScalar(.64);
      const leading=records.get('severance:s2')?.paper;if(leading){leading.position.set(-.42,.58,6.15);leading.scale.setScalar(.70);leading.rotation.y=.08;}
      // Every real record occupies its own shore interval on a phone; no variant is left behind a main show.
      mainIds.slice(1).forEach((id,index)=>{const record=records.get(id);if(!record)return;const z=9.35+index*2.7,x=shoreX(z)+uniforms.uShoreShift.value+.85+.18*Math.sin((index+1)*1.5);record.paper.position.set(x,Math.max(.58,bedHeight(x,z)+.045),z);record.paper.scale.setScalar(.52);});
    }else shell.scale.setScalar(1);
    papers.forEach(clearPaperOfBed);
    lastTallyLength=0;fitTally();synchronizeContacts();sun.shadow.mapSize.set(phone?1024:2048,phone?1024:2048);sun.shadow.needsUpdate=true;
  }
  function opening(){approach=null;focusMesh=null;camera.fov=27;if(host.mobile){camera.fov=28;camera.position.set(.20,24.5,19.0);target.set(.20,.10,1.45);}else{camera.position.set(...manifest.camera.opening.position);target.set(...manifest.camera.opening.target);}camera.lookAt(target);camera.updateProjectionMatrix();}
  function readingPose(surface){
    surface.updateWorldMatrix(true,false);surface.geometry.computeBoundingBox();const point=surface.geometry.boundingBox.getCenter(new T.Vector3()).applyMatrix4(surface.matrixWorld),box=new T.Box3().setFromObject(surface),size=box.getSize(new T.Vector3()),aspect=innerWidth/innerHeight;
    const vertical=size.z*.82+size.y*.58,horizontal=size.x,distance=Math.max(vertical/(Math.tan(T.MathUtils.degToRad(camera.fov/2))*1.25),horizontal/(aspect*Math.tan(T.MathUtils.degToRad(camera.fov/2))*1.25))+1.2;
    return {target:point,position:point.clone().addScaledVector(viewDirection,distance)};
  }
  function aim(surface,{immediate=false,complete=null}={}){const pose=readingPose(surface);if(immediate||host.reduced){camera.position.copy(pose.position);target.copy(pose.target);camera.lookAt(target);approach=null;complete?.();}else approach={from:camera.position.clone(),to:pose.position,fromTarget:target.clone(),toTarget:pose.target,start:performance.now()/1000,duration:.60,complete};host.wake();}
  function returnToOpening(){if(host.progress>.0001)host.scrollTo(0);opening();}
  function focusSurface(surface){const record=[...records.values()].find(value=>value.surface===surface),index=mainIds.indexOf(record?.exhibit.id);if(index>=0){const stop=(index+1)/mainIds.length;if(Math.abs(host.progress-stop)>.0001)host.scrollTo(stop);}focusMesh=surface;aim(surface,{immediate:true});}
  function openWork(exhibit,surface){focusMesh=surface;aim(surface,{complete:()=>host.openPreview(exhibit,{surface})});}
  const mainIds=gate?['severance:s2','got:s4','dexter:s8-final']:['severance:s2','severance:tracker','got:s4','got:s3-redesign','got:s3-classic','dexter:s8-final','dexter:s7-finale','sherlock:final','sherlock:alpha','archer:s5-final','breaking-bad:final','breaking-bad:desert-parallax','house-of-cards:s2'];host.setScrollStops(mainIds.length+1);
  function navigation(progress){approach=null;focusMesh=null;if(progress<.001){opening();return;}const initial=host.mobile?{position:new T.Vector3(.20,24.5,19.0),target:new T.Vector3(.20,.10,1.45)}:{position:new T.Vector3(...manifest.camera.opening.position),target:new T.Vector3(...manifest.camera.opening.target)};const poses=[initial,...mainIds.map(id=>readingPose(records.get(id).surface))],position=progress*(poses.length-1),i=Math.min(poses.length-2,Math.floor(position)),f=Math.min(1,position-i),ease=f*f*(3-2*f);camera.position.lerpVectors(poses[i].position,poses[i+1].position,ease);target.lerpVectors(poses[i].target,poses[i+1].target,ease);camera.lookAt(target);sun.position.set(target.x-8,16,target.z-9);sun.target.position.set(target.x,0,target.z);}
  function frame(time,dt){
    if(!frozen&&remoteQueued){remoteQueued=false;remoteFrontAt=decorativeTime;}
    clock.update(time);fitTally();count.set(host.getTally(),time,{spin:tallySpin,offset:8});tallySpin=false;count.update(time);if(!host.reduced&&!frozen)decorativeTime+=dt||1/60;uniforms.uTideTime.value=decorativeTime;uniforms.uStill.value=host.reduced?1:0;
    const age=decorativeTime-localFrontAt,remote=decorativeTime-remoteFrontAt;let amplitude=0,front=0;if(!host.reduced&&!frozen){if(age<.6){front=age/.6;amplitude=Math.sin(front*Math.PI/2);}else if(age<2.0){front=1-(age-.6)/1.4;amplitude=Math.cos((age-.6)/1.4*Math.PI/2);}else if(remote<1.3){front=Math.min(1,remote/.5);amplitude=.33*Math.sin(remote/1.3*Math.PI);}}uniforms.uSurge.value=Math.max(0,amplitude);uniforms.uFront.value=Math.max(0,front);
    const step=dt||1/60,shellY=(host.mobile?bedHeight(1.55,3.72)+.016:shellRest.y)-(host.pending?.065:0),crownY=(host.mobile?bedHeight(1.75,5.05)+.02:crownRest.y)+secretLift*.05;
    shell.position.y=host.reduced?shellY:T.MathUtils.damp(shell.position.y,shellY,14,step);crown.position.y=host.reduced?crownY:T.MathUtils.damp(crown.position.y,crownY,10,step);
    for(const paper of papers){const lift=host.reduced||frozen?0:paper.userData.hover*.055;let local=0;if(!host.reduced&&!frozen)for(const slot of rippleSlots){const a=decorativeTime-slot.z;if(a>=0&&a<.9){const d=Math.hypot(paper.position.x-slot.x,paper.position.z-slot.y);local+=Math.sin(a/.9*Math.PI)*Math.exp(-d*1.6-a*3)*.035;}}const old=paper.userData.lift,next=host.reduced?0:T.MathUtils.damp(old,lift+local,11,step);paper.userData.lift=next;if(Math.abs(next-old)>.00004){const positions=paper.geometry.attributes.position,original=paper.userData.curlBase,weights=paper.userData.curlWeights;for(let i=0;i<positions.count;i++)positions.array[i*3+1]=original[i*3+1]+weights[i]*next;positions.needsUpdate=true;paper.geometry.computeVertexNormals();}}
    if(approach&&!frozen){const f=Math.min(1,(time-approach.start)/approach.duration),ease=f*f*(3-2*f);camera.position.lerpVectors(approach.from,approach.to,ease);target.lerpVectors(approach.fromTarget,approach.toTarget,ease);camera.lookAt(target);if(f===1){const complete=approach.complete;approach=null;complete?.();}}
    sun.position.set(target.x-8,16,target.z-9);sun.target.position.set(target.x,0,target.z);
    outline.visible=!!focusMesh&&document.activeElement!==document.body;if(outline.visible){if(outlineSource!==focusMesh){outline.geometry.dispose();outline.geometry=host.own(new T.EdgesGeometry(focusMesh.geometry,35));outlineSource=focusMesh;}focusMesh.updateWorldMatrix(true,false);outline.matrix.copy(focusMesh.matrixWorld);}
  }
  function capturePose(){return{position:camera.position.toArray(),target:target.toArray(),fov:camera.fov,focusName:focusMesh?.name||null,secretLift,decorativeTime,shellY:shell.position.y,crownY:crown.position.y,surge:uniforms.uSurge.value,front:uniforms.uFront.value,ripples:rippleSlots.map(slot=>slot.toArray()),paperState:[...records.values()].map(({paper,versionFace})=>[paper.name,paper.userData.lift,paper.userData.hover,versionFace.visible]),tabState:tabStates.map(state=>[state.active,state.face.visible])};}
  function restorePose(pose){
    if(!pose)return;approach=null;camera.position.fromArray(pose.position);target.fromArray(pose.target);camera.fov=pose.fov;focusMesh=pose.focusName?installation.getObjectByName(pose.focusName):null;secretLift=pose.secretLift;
    if(Number.isFinite(pose.decorativeTime))decorativeTime=pose.decorativeTime;uniforms.uTideTime.value=decorativeTime;
    if(Number.isFinite(pose.shellY))shell.position.y=pose.shellY;if(Number.isFinite(pose.crownY))crown.position.y=pose.crownY;uniforms.uSurge.value=pose.surge||0;uniforms.uFront.value=pose.front||0;
    pose.ripples?.forEach((value,i)=>rippleSlots[i].fromArray(value));
    for(const [name,lift,hover,captionVisible] of pose.paperState||[]){const record=[...records.values()].find(value=>value.paper.name===name);if(!record)continue;const {paper,versionFace}=record;paper.userData.lift=lift;paper.userData.hover=hover;versionFace.visible=captionVisible;const position=paper.geometry.attributes.position,original=paper.userData.curlBase,weights=paper.userData.curlWeights;for(let i=0;i<position.count;i++)position.array[i*3+1]=original[i*3+1]+weights[i]*lift;position.needsUpdate=true;paper.geometry.computeVertexNormals();}
    pose.tabState?.forEach(([active,visible],index)=>{if(tabStates[index]){tabStates[index].active=active;tabStates[index].face.visible=visible;}});camera.lookAt(target);camera.updateProjectionMatrix();
  }
  arrange();opening();
  return {ready:true,frame,navigation,capturePose,restorePose,resize(){approach=null;arrange();navigation(host.progress);},celebrate(){clock.spin();tallySpin=true;if(!frozen)localFrontAt=decorativeTime;},remote(){clock.spin();tallySpin=true;if(frozen)remoteQueued=true;else remoteFrontAt=decorativeTime;},focus(native){if(native==='clock'){returnToOpening();return;}const group=host.exhibits.find(exhibit=>exhibit.show===native&&works.has(exhibit.anchor));const surface=works.get(native)||destinations.get(native)||(group&&works.get(group.anchor));if(surface)focusSurface(surface);},freeze(value){frozen=value;pointerDown=null;},cancelApproach(){approach=null;},cancelInput(){pointerDown=null;},dispose(){clock.dispose();count.dispose();fonts.forEach(face=>document.fonts.delete(face));}};
}
