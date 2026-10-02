// Optional art worlds reuse the real archive, clock, and preview rather than duplicating them.
export async function initExhibition(options) {
  const { theme, reducedMotion, requestReset, getDigits, revealSecret } = options;
  const hero = document.getElementById('art-hero');
  const stage = document.getElementById('art-stage');
  const canvas = document.getElementById('art-scene');
  hero.hidden = false;
  const conceptStyle=document.querySelector('link[href^="concepts/"]');if(conceptStyle)document.head.append(conceptStyle);
  const clock = document.querySelector('.royal-clock');
  clock.classList.add('art-clock'); clock.classList.remove('royal-clock');
  clock.querySelector('.throne-space')?.remove();
  clock.querySelectorAll('.clock-unit small').forEach((el,i) => el.textContent = ['D','H','M','S'][i]);
  hero.append(clock);
  const reset = document.getElementById('royal-reset');
  reset.classList.remove('royal-only'); reset.textContent = 'Again';
  reset.removeAttribute('aria-controls'); reset.removeAttribute('aria-expanded');
  const resetArea = hero.querySelector('.art-reset-area');
  const tally = document.querySelector('.press-tally'); tally.classList.add('art-tally');
  tally.querySelector('small').textContent = '';
  const status = document.getElementById('clock-status');
  const secret = document.getElementById('countdown-secret');
  resetArea.append(reset,tally,status,secret,document.getElementById('countdown-ended'));
  hero.append(document.getElementById('timer-readable'));
  const cards = Array.from(document.querySelectorAll('.shelf a.card'));
  const shelves = Array.from(document.querySelectorAll('.shelf'));
  const showData = shelves.map(shelf => ({
    slug:shelf.id, name:shelf.querySelector('.shelf-name').textContent,
    cards:Array.from(shelf.querySelectorAll('a.card')).map(anchor => ({
      anchor, href:anchor.getAttribute('href'), label:anchor.querySelector('.label').textContent,
      thumb:anchor.dataset.thumb
    }))
  }));
  // Art themes use faithful stills in closed mounts; only the overlay runs the actual site.
  for (const card of cards) {
    const frame = card.querySelector('.frame');
    const image = frame.querySelector('img')||document.createElement('img'); image.src = card.dataset.thumb;
    image.alt = ''; image.loading = 'lazy'; image.width = 720; image.height = 450;
    frame.querySelector('iframe')?.remove(); if(!frame.contains(image))frame.prepend(image);
    const shelf = card.closest('.shelf');
    card.setAttribute('aria-label',`${shelf.querySelector('.shelf-name').textContent}, ${card.querySelector('.label').textContent}`);
  }
  const mountsContainer = hero.querySelector('.art-mounts');
  const representative = ['got','dexter','severance'].map(id => {
    const source = showData.find(show=>show.slug===id).cards[0].anchor;
    // Move the bound preview link, retaining its original overlay handler and URL.
    const placeholder = document.createElement('a');
    placeholder.className = 'art-return'; placeholder.href = '#art-hero';
    placeholder.textContent = source.querySelector('.label').textContent;
    placeholder.setAttribute('aria-label',`Return to ${id} preview`);
    source.before(placeholder); mountsContainer.append(source); source.classList.add('art-mount');
    source.dataset.previewLabel=source.querySelector('.label').textContent;
    source.querySelector('.label').textContent=showData.find(show=>show.slug===id).name;
    return source;
  });
  const secretButton = hero.querySelector('.art-secret-trigger');
  secretButton.addEventListener('click', revealSecret);
  const dom = { clock, reset, tally, status, secret, secretButton,
    title:hero.querySelector('.art-title'), mounts:mountsContainer,
    route:hero.querySelector('.art-route'), archiveToggle:hero.querySelector('.art-archive-toggle'),
    joystick:hero.querySelector('.art-joystick') };
  let controller = {}, renderer, scene, camera, root, frame=0, visible=true, stopped=false;
  let lastTime=0, lastDraw=0, burstAt=-Infinity, remoteAt=-Infinity, pending=false;
  const cleanups=[], pins=new Map();
  const pointer={x:0,y:0,active:false,down:false};
  const on=(target,event,handler,opts) => {target.addEventListener(event,handler,opts);cleanups.push(()=>target.removeEventListener(event,handler,opts));};
  const wake=()=>{if(!frame&&!stopped&&visible&&!document.hidden)frame=requestAnimationFrame(animate);};
  on(document,'countdown:pending',e=>{pending=e.detail;hero.classList.toggle('is-pending',pending);controller.pending?.(pending);wake();});
  on(document,'countdown:reset',()=>{burstAt=performance.now()/1000;controller.celebrate?.();wake();});
  on(document,'countdown:remote',()=>{remoteAt=performance.now()/1000;controller.remote?.();wake();});
  on(document,'archive:overlay',e=>{controller.overlay?.(e.detail.open);wake();});
  on(hero,'pointermove',e=>{const r=stage.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*2-1;pointer.y=1-(e.clientY-r.top)/r.height*2;pointer.active=true;wake();});
  on(hero,'pointerleave',()=>{pointer.x=pointer.y=0;pointer.active=false;pointer.down=false;wake();});
  on(canvas,'pointerdown',()=>{pointer.down=true;wake();});
  on(canvas,'pointercancel',()=>{pointer.down=false;pointer.active=false;wake();});
  on(canvas,'lostpointercapture',()=>{pointer.down=false;wake();});
  on(window,'pointerup',()=>{pointer.down=false;wake();});
  on(window,'blur',()=>{pointer.down=false;pointer.active=false;});
  on(document,'visibilitychange',()=>{lastTime=0;wake();});
  on(reducedMotion,'change',()=>{lastTime=0;wake();});
  function clearPins(){
    pins.clear();
    hero.querySelectorAll('.art-pinned').forEach(el=>{el.classList.remove('art-pinned');el.style.visibility='';el.style.left='';el.style.top='';el.style.width='';el.style.translate='';el.style.transform='';});
  }
  function releaseResources(){
    const geometries=new Set(),materials=new Set(),textures=new Set();
    for(const value of [scene?.environment,scene?.background])if(value?.isTexture)textures.add(value);
    scene?.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);for(const m of (Array.isArray(obj.material)?obj.material:[obj.material]))if(m){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}});
    textures.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());geometries.forEach(x=>x.dispose());renderer?.dispose();
  }
  const thumbnailOnlyFallback=()=>{hero.classList.remove('art-scene-ready');hero.classList.add('art-scene-unavailable');};
  function animate(ms) {
    frame=0;if(stopped||!visible||document.hidden)return;
    const phone=stage.clientWidth<700;
    if(ms-lastDraw<(phone?32:16)){wake();return;}
    const dt=lastTime?Math.min((ms-lastTime)/1000,.05):1/60;
    lastTime=lastDraw=ms;
    controller.animate?.(ms/1000,dt);
    for(const [el,pin] of pins){
      const position=pin.object.localToWorld(pin.offset.clone());
      const q=position.clone().project(camera);
      const shown=q.z>-1&&q.z<1&&Math.abs(q.x)<1&&Math.abs(q.y)<1;
      el.style.visibility=shown?'visible':'hidden';
      if(shown){
        el.style.left=`${(q.x+1)*stage.clientWidth/2}px`;
        el.style.top=`${(1-q.y)*stage.clientHeight/2}px`;
        el.style.translate='none';el.style.transform='translate(-50%,-50%)';
        if(pin.width){
          const right=position.clone().add(new ctx.THREE.Vector3(pin.width,0,0)).project(camera);
          el.style.width=`${Math.max(44,Math.abs(right.x-q.x)*stage.clientWidth/2)}px`;
        }
      }
    }
    renderer?.render(scene,camera);
    // Worlds have intentional ambient motion. Reduced-motion scenes sleep between interactions.
    if(!reducedMotion.matches||pointer.down||performance.now()/1000-burstAt<2.5||performance.now()/1000-remoteAt<.7)wake();
  }
  const ctx={theme,stage,canvas,hero,dom,cards,shelves,showData,mounts:representative,pointer,on,wake,
    get mobile(){return stage.clientWidth<700;},get reduced(){return reducedMotion.matches;},
    get pending(){return pending;},get burst(){return Number.isFinite(burstAt)?performance.now()/1000-burstAt:999;},
    get remoteAge(){return Number.isFinite(remoteAt)?performance.now()/1000-remoteAt:999;},
    requestReset,revealSecret,getDigits,
    openPreview(card,{originRect}={}){document.dispatchEvent(new CustomEvent('archive:open',{detail:{card:card.anchor||card,originRect}}));},
    pin(element,object,{offset=[0,0,0],width}={}){pins.set(element,{object,offset:new ctx.THREE.Vector3(...offset),width});element.classList.add('art-pinned');wake();},
    unpin(element){pins.delete(element);element.classList.remove('art-pinned');element.style.visibility='';element.style.translate='';element.style.transform='';},
    setCamera(next){camera=next;ctx.camera=next;},
    fitCamera(span,target=[0,1,0],position=[0,4,14]){
      const aspect=stage.clientWidth/Math.max(1,stage.clientHeight);
      camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;
      camera.position.set(...position);camera.lookAt(...target);camera.updateProjectionMatrix();
    },
    project(position){const p=position.clone().project(camera);return{x:(p.x+1)*stage.clientWidth/2,y:(1-p.y)*stage.clientHeight/2,visible:p.z>-1&&p.z<1&&Math.abs(p.x)<1&&Math.abs(p.y)<1};},
    texture(url){const texture=new ctx.THREE.TextureLoader().load(url,()=>wake(),undefined,()=>wake());texture.colorSpace=ctx.THREE.SRGBColorSpace;return texture;}
  };
  try {
    const THREE=await import('./assets/vendor/three.module.min.js');ctx.THREE=THREE;
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,stage.clientWidth<700?1.25:1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    scene=new THREE.Scene();root=new THREE.Group();scene.add(root);
    camera=new THREE.OrthographicCamera(-8,8,5.5,-5.5,.1,120);
    ctx.renderer=renderer;ctx.scene=scene;ctx.root=root;ctx.camera=camera;
    ctx.fitCamera(5.5);
    const module=await import(`./concepts/${theme}.js?v=${document.documentElement.dataset.artVersion||'1'}`);
    controller=await module.create(ctx)||{};
    camera=ctx.camera;
    const resize=()=>{
      const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
      renderer.setSize(w,h,false);
      if(camera.isPerspectiveCamera){camera.aspect=w/h;camera.updateProjectionMatrix();}
      else{const half=(camera.top-camera.bottom)/2;camera.left=-half*w/h;camera.right=half*w/h;camera.updateProjectionMatrix();}
      controller.resize?.(w,h);camera=ctx.camera;wake();
    };
    const ro=new ResizeObserver(resize);ro.observe(stage);cleanups.push(()=>ro.disconnect());
    const io=new IntersectionObserver(es=>{visible=es[0].isIntersecting;lastTime=0;wake();});io.observe(hero);cleanups.push(()=>io.disconnect());
    on(canvas,'webglcontextlost',e=>{e.preventDefault();stopped=true;cancelAnimationFrame(frame);frame=0;clearPins();thumbnailOnlyFallback();});
    hero.classList.add('art-scene-ready');resize();wake();
  }catch(error){
    stopped=true;cancelAnimationFrame(frame);frame=0;clearPins();
    cleanups.splice(0).forEach(fn=>fn());controller.dispose?.();thumbnailOnlyFallback();releaseResources();
    console.warn('Art scene unavailable; live countdown and archive remain available.',error.message);
  }
  const dispose=()=>{
    stopped=true;cancelAnimationFrame(frame);cleanups.splice(0).forEach(fn=>fn());controller.dispose?.();
    releaseResources();
  };
  on(window,'pagehide',e=>{if(!e.persisted)dispose();});
  return {dispose};
}
