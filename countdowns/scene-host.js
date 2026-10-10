// An opt-in host shares behavior, never a gallery composition or default camera.
export async function initSceneHost(options) {
  // Several worlds author a separate phone specimen. Recreate only that scene,
  // keeping the real timer, native archive and shared request state in place.
  let current, stopped = false, rebuilding = null, requested = false;
  async function build(resume) {
    const instance = await createSceneHost({...options, resume, requestRebuild});
    if (stopped) {instance.dispose(); return;}
    current = instance;
    if (requested && !rebuilding) requestRebuild();
  }
  function requestRebuild() {
    if (stopped) return;
    requested = true;
    if (!current) return;
    if (rebuilding) return rebuilding;
    rebuilding = Promise.resolve().then(async () => {
      while (requested && !stopped) {
        requested = false;
        const progress = current?.host?.progress || 0;
        current?.dispose();
        await build({progress});
      }
    }).catch(error => console.warn('The resized scene could not finish loading; the native archive remains available.', error.message))
      .finally(() => {rebuilding = null; if (requested && !stopped) requestRebuild();});
    return rebuilding;
  }
  await build();
  return {
    dispose(){stopped = true; requested = false; current?.dispose();},
    get healthy(){return !stopped && !!current?.healthy;},
    get host(){return current?.host;}
  };
}

async function createSceneHost({theme, reducedMotion = matchMedia('(prefers-reduced-motion: reduce)'), getDigits, getTally, getSnapshot, requestReset, revealSecret, resume, requestRebuild}) {
  const phoneAtCreation = innerWidth < 700;
  const html = document.documentElement, version = html.dataset.artVersion || '1';
  const {createInkFace, createNumerals, loadSurfaceTexture, projectSurface} = await import(`./scene-surfaces.js?v=${version}`);
  const assetURL = value => {const url = new URL(value, document.baseURI); if (url.origin === location.origin) url.searchParams.set('v', version); return url.href;};
  const wrap = document.querySelector('.wrap'), hero = document.getElementById('hero-surface');
  const shelves = [...document.querySelectorAll('.shelf')], cards = [...document.querySelectorAll('.shelf a.card')];
  const destinationTemplate = document.getElementById('scene-destinations');
  const destinationIdentity = href => {const url = new URL(href, document.baseURI); url.searchParams.delete('theme'); return url.href;};
  destinationTemplate?.content.querySelectorAll('a[data-show]').forEach(source => {
    const shelf = shelves.find(item => item.id === source.dataset.show);
    if (!shelf) return;
    const key = destinationIdentity(source.getAttribute('href'));
    const matches = [...shelf.querySelectorAll('a[href]')].filter(anchor => destinationIdentity(anchor.getAttribute('href')) === key);
    if (!matches.length) shelf.append(source.cloneNode(true));
    else matches.slice(1).forEach(anchor => {if (anchor.classList.contains('scene-timeline-link')) anchor.remove();});
  });
  document.querySelectorAll('.shelf-more, .scene-timeline-link').forEach(anchor => {
    const href = new URL(anchor.href); href.searchParams.set('theme', theme); anchor.href = href.href;
  });
  // Scene descriptors keep archive identity; native anchors retain the real live destination.
  const exhibits = cards.map((anchor, index) => ({
    id: (anchor.dataset.archiveHref || anchor.getAttribute('href')).replace(/^\/countdowns\//, '').replace(/\/$/, '').replaceAll('/', ':'),
    show: anchor.closest('.shelf').id, label: anchor.querySelector('.label').textContent.trim(),
    showName: anchor.closest('.shelf').querySelector('.shelf-name').textContent.trim(), live: !!anchor.querySelector('.chip'),
    href: anchor.dataset.archiveHref || anchor.getAttribute('href'), thumbnail: anchor.dataset.thumb, thumb: anchor.dataset.thumb, anchor, index
  }));
  exhibits.forEach(item => item.anchor.setAttribute('aria-label', `${item.showName}, ${item.label}${item.live ? ', live' : ''}`));
  const groups = shelves.map(shelf => ({id: shelf.id, slug: shelf.id, name: shelf.querySelector('.shelf-name').textContent.trim(), exhibits: exhibits.filter(e => e.show === shelf.id)}));
  const dom = {
    clock: document.querySelector('.royal-clock'), reset: document.getElementById('royal-reset'),
    tally: document.getElementById('reset-count'), status: document.getElementById('clock-status'),
    secret: document.getElementById('countdown-secret'), secretButton: document.querySelector('.art-secret-trigger'),
    title: document.querySelector('.art-title'), timerReadable: document.getElementById('timer-readable')
  };
  const destinations = {
    home: document.querySelector('.home-link'), worlds: [...document.querySelectorAll('[data-theme-link]')],
    groups, archive: [...document.querySelectorAll('.shelf-more')].map(anchor => ({anchor, href: anchor.getAttribute('href'), show: anchor.closest('.shelf').id})),
    timeline: [...document.querySelectorAll('a[href]')].find(a => a.getAttribute('href')?.includes('/dexter/s7-episodes/')),
    live: [...document.querySelectorAll('a[href]')].find(a => a.href.startsWith('https://severancecountdown.com'))
  };
  let controller = {}, renderer, scene, root, camera, frame = 0, stopped = false, healthy = false;
  let lastTime = 0, lastDraw = 0, progress = resume?.progress || 0, stopCount = 1, scrollSuppressed = false, rebuildQueued = false;
  let pending = false, burstAge = 999, remoteAge = 999, overlay = false, pose = null, origin = null, previewToken = 0;
  let suppressFocus = false, candidate = null, hovered = null, hoveredRect = null, suppressedClick = null, activePreview = null;
  const cleanups = [], cleanupErrors = [], owned = new Set(), disposedResources = new WeakSet(), closedImages = new WeakSet(), bindings = new Map(), nativeBindings = new Map(), occluders = new Set(), pressedPointers = new Set();
  const stage = document.createElement('div'); stage.className = 'scene-first-stage';
  const canvas = document.createElement('canvas'); canvas.className = 'scene-first-canvas'; canvas.setAttribute('aria-hidden', 'true'); stage.append(canvas);
  const runway = document.createElement('div'); runway.className = 'scene-first-runway'; runway.setAttribute('aria-hidden', 'true');
  const clockReturn = document.createElement('button'); clockReturn.type = 'button'; clockReturn.className = 'scene-clock-return'; clockReturn.textContent = 'Clock'; clockReturn.hidden = true;
  const focusCaption = document.createElement('div'); focusCaption.className = 'scene-focus-caption'; focusCaption.hidden = true;
  const hoverLink = document.createElement('a'); hoverLink.className = 'scene-native-hover'; hoverLink.tabIndex = -1; hoverLink.setAttribute('aria-hidden', 'true'); hoverLink.hidden = true;
  const secretOrigin = {parent: dom.secretButton.parentNode, next: dom.secretButton.nextSibling};
  const statusOrigin = {parent: dom.status.parentNode, next: dom.status.nextSibling};
  const secretMessageOrigin = {parent: dom.secret.parentNode, next: dom.secret.nextSibling};
  const secretMessageStyle = dom.secret.style.cssText;
  const legacyAction = document.getElementById('scene-action'), legacyTabIndex = legacyAction.getAttribute('tabindex');
  const semantics = [hero, document.querySelector('.shownav'), document.getElementById('archive-shelves'), document.querySelector('.foot')].filter(Boolean);
  html.classList.add('scene-first-loading'); document.body.append(stage);
  // Loading is a complete native archive too, including the sole crown action.
  hero.querySelector('.next-countdown').append(dom.secretButton);
  dom.secretButton.classList.add('scene-fallback-crown');
  const pointer = {x: 0, y: 0, clientX: 0, clientY: 0, active: false, down: false};
  const on = (target, type, fn, options) => {if (stopped) return fn; target.addEventListener(type, fn, options); cleanups.push(() => target.removeEventListener(type, fn, options)); return fn;};
  on(dom.secretButton, 'click', () => healthy ? reveal() : revealSecret());
  const wake = () => {if (!frame && !stopped && !document.hidden && renderer && camera) frame = requestAnimationFrame(draw);};
  const tryCleanup = fn => {try {fn();} catch (error) {cleanupErrors.push(error);}};
  function own(resource) {
    if (resource) {
      if (stopped) release(resource);
      else if (!owned.has(resource)) {
        owned.add(resource);
        // Focus outlines replace their geometry. Do not retain every already
        // disposed outline for the rest of a long gallery visit.
        if (resource.isBufferGeometry) {
          const forget = () => {owned.delete(resource); resource.removeEventListener('dispose', forget);};
          resource.addEventListener('dispose', forget);
        }
      }
    }
    return resource;
  }
  function release(resource) {
    if (!resource || typeof resource !== 'object' || disposedResources.has(resource)) return;
    disposedResources.add(resource);
    if (Array.isArray(resource)) {resource.forEach(release); return;}
    if (resource.isObject3D) {
      [...resource.children].forEach(release);
      release(resource.geometry); release(resource.material);
      release(resource.skeleton);
      // Three's light disposer owns its shadow render targets. Reflector's
      // disposer owns exactly its material and target, already tracked here.
      if (!resource.isLight || !resource.dispose) release(resource.shadow);
      if (resource.isReflector) release(resource.getRenderTarget());
    }
    if (resource.isScene) {release(resource.background); release(resource.environment);}
    if (resource.isMaterial) Object.values(resource).forEach(value => {if (value?.isTexture) release(value);});
    if (resource.isTexture) {
      const data = resource.source?.data;
      for (const image of Array.isArray(data) ? data : [data]) if (image?.close && !closedImages.has(image)) {closedImages.add(image); tryCleanup(() => image.close());}
    }
    if (!resource.isReflector) tryCleanup(() => resource.dispose?.());
  }
  function cancelInput(reason = 'cancel') {
    if (candidate?.nativeLink) suppressedClick = {mesh: candidate.record?.mesh, time: performance.now()};
    if (candidate?.record) candidate.record.cancel?.(reason);
    candidate = null; pointer.down = false;
    if (pointer.id !== undefined && canvas.hasPointerCapture?.(pointer.id)) canvas.releasePointerCapture(pointer.id);
    controller.cancelInput?.(reason);
    if (['blur', 'visibility', 'pagehide', 'graphics'].includes(reason) && !overlay) {
      ++previewToken; activePreview = null; controller.cancelApproach?.(); restorePose();
    }
    if (['blur', 'visibility', 'pagehide', 'graphics', 'overlay'].includes(reason)) pressedPointers.clear();
  }
  function hideHover() {hoverLink.hidden = true; hoveredRect = null;}
  function restoreNode(node, saved) {if (saved.next?.parentNode === saved.parent) saved.parent.insertBefore(node, saved.next); else saved.parent.append(node);}
  function fallback(error) {
    if (stopped) return;
    stopped = true; healthy = false;
    // A broken artist callback must never prevent the real page from returning.
    tryCleanup(() => cancelInput('graphics'));
    candidate = null; pointer.down = false; pressedPointers.clear();
    ++previewToken; cancelAnimationFrame(frame); frame = 0;
    html.classList.remove('scene-first-ready', 'scene-first-loading'); html.classList.add('scene-first-fallback');
    semantics.forEach(node => node.classList.remove('scene-semantic-twin'));
    dom.status.classList.remove('scene-status'); dom.secret.classList.remove('scene-secret-note');
    restoreNode(dom.status, statusOrigin); restoreNode(dom.secret, secretMessageOrigin); restoreNode(dom.secretButton, secretOrigin);
    dom.secret.style.cssText = secretMessageStyle;
    if (legacyTabIndex === null) legacyAction.removeAttribute('tabindex'); else legacyAction.setAttribute('tabindex', legacyTabIndex);
    dom.secretButton.classList.remove('scene-semantic-twin');
    hero.querySelector('.next-countdown').append(dom.secretButton); dom.secretButton.classList.add('scene-fallback-crown');
    stage.remove(); runway.remove(); clockReturn.remove(); focusCaption.remove(); hoverLink.remove();
    document.querySelector('#art-hero').hidden = true;
    tryCleanup(() => controller.dispose?.());
    cleanups.splice(0).forEach(tryCleanup);
    dom.secretButton.addEventListener('click', revealSecret);
    cleanups.push(() => dom.secretButton.removeEventListener('click', revealSecret));
    release(scene); owned.forEach(release); owned.clear();
    tryCleanup(() => renderer?.dispose()); tryCleanup(() => renderer?.forceContextLoss());
    // The real modal survives graphics loss; its original card is visible again.
    if (origin && document.getElementById('ov')?.hidden) origin.focus({preventScroll: true});
    if (error) console.warn('This scene could not finish loading; the real countdown and archive remain available.', error.stack || error.message || error);
    if (cleanupErrors.length) console.warn('Scene cleanup completed despite a failed disposer.', cleanupErrors.splice(0));
  }
  function setScrollStops(stops = 1) {
    stopCount = Math.max(1, Number.isFinite(stops) ? stops : stops.length || 1);
    runway.style.height = `${Math.max(1, stopCount) * innerHeight}px`;
  }
  function scrollToProgress(next, {immediate = true} = {}) {
    progress = Math.max(0, Math.min(1, next));
    scrollSuppressed = true;
    window.scrollTo({top: progress * Math.max(0, runway.offsetHeight - innerHeight), behavior: immediate || reducedMotion.matches ? 'instant' : 'smooth'});
    controller.navigation?.(progress); clockReturn.hidden = progress < .035;
    requestAnimationFrame(() => {scrollSuppressed = false;}); wake();
  }
  function savePose(native) {
    if (!pose) {pose = {scene: controller.capturePose?.(), progress, scrollY: window.scrollY, viewportHeight: innerHeight, clockHidden: clockReturn.hidden}; origin = native;}
  }
  function restorePose() {
    const saved = pose; pose = null;
    if (!saved) return;
    controller.restorePose?.(saved.scene); progress = saved.progress;
    const scrollY = saved.viewportHeight === innerHeight ? saved.scrollY : saved.progress * Math.max(0, runway.offsetHeight - innerHeight);
    scrollSuppressed = true; window.scrollTo({top: scrollY, behavior: 'instant'});
    clockReturn.hidden = saved.clockHidden ?? progress < .035; suppressFocus = true;
    requestAnimationFrame(() => {scrollSuppressed = false; suppressFocus = false;}); wake();
  }
  function invoke(record, event) {
    if (!healthy || stopped || overlay || record.native?.disabled || record.kind === 'reset' && pending) return;
    if (record.native?.matches('a.card-live')) {
      document.dispatchEvent(new CustomEvent('archive:open', {detail: {card: record.native}}));
      return;
    }
    if (pose) {controller.cancelApproach?.(); activePreview = null; restorePose();}
    if (record.kind === 'preview') {savePose(record.native); activePreview = {anchor: record.native, surface: record.mesh};}
    const token = ++previewToken;
    let result;
    if (record.activate) result = record.activate(event, record);
    else if (record.kind === 'reset') result = requestReset();
    else if (record.kind === 'secret') result = reveal();
    else if (record.kind === 'preview') host.openPreview(exhibits.find(item => item.anchor === record.native) || record.native, {surface: record.mesh});
    else if (record.native) {
      // A native action without an artist hook keeps its real default behavior.
      nativeBindings.delete(record.native); record.native.click(); nativeBindings.set(record.native, record);
    }
    if (result?.catch) result.catch(error => {if (token === previewToken) {activePreview = null; controller.cancelApproach?.(); restorePose(); console.warn('Scene action could not complete.', error.message);}});
    wake();
  }
  function reveal() {
    revealSecret();
    dom.secret.classList.add('scene-secret-note');
    // Position the genuine status message, rather than manufacture a second one.
    stage.append(dom.secret); dom.secret.style.cssText = '';
    const rect = hoveredRect;
    dom.secret.style.left = `${Math.max(12, Math.min(innerWidth - 220, rect ? rect.left + rect.width / 2 - 90 : innerWidth * .55))}px`;
    dom.secret.style.top = `${Math.max(65, Math.min(innerHeight - 70, rect ? rect.top + rect.height + 10 : innerHeight * .76))}px`;
  }
  function bind(mesh, options) {
    const record = {...options, mesh}; bindings.set(mesh, record);
    if (record.native) nativeBindings.set(record.native, record);
    return () => {bindings.delete(mesh); if (nativeBindings.get(record.native) === record) nativeBindings.delete(record.native);};
  }
  function bindingFor(object) {while (object) {if (bindings.has(object)) return bindings.get(object); object = object.parent;} return null;}
  function visible(object) {while (object) {if (!object.visible || object.userData.scenePassthrough) return false; object = object.parent;} return true;}
  let raycaster, pointerVector;
  function pick(clientX, clientY) {
    if (!healthy || overlay || !camera) return null;
    const r = canvas.getBoundingClientRect();
    pointerVector.set((clientX - r.left) / r.width * 2 - 1, 1 - (clientY - r.top) / r.height * 2);
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(); raycaster.setFromCamera(pointerVector, camera);
    const targets = occluders.size ? [...new Set([...bindings.keys(), ...occluders])] : [root];
    const hits = raycaster.intersectObjects(targets, true).filter(hit => visible(hit.object));
    for (const hit of hits) {
      const material = Array.isArray(hit.object.material) ? hit.object.material[hit.face?.materialIndex || 0] : hit.object.material;
      if (material?.opacity === 0 && !bindingFor(hit.object)) continue;
      const record = bindingFor(hit.object);
    if (record) return {...record, hit};
      // Nearest opaque/physical solid blocks every action behind it.
      if (!material?.transparent || material.opacity > .45 || hit.object.userData.sceneOccluder) return null;
    }
    return null;
  }
  function updateHover(hit) {
    if (hovered?.mesh !== hit?.mesh) {
      hovered?.hover?.({pointer: true, active: false}); hovered = hit;
      hovered?.hover?.({pointer: true, active: true});
    }
    canvas.style.cursor = hit ? hit.cursor || (hit.kind === 'reset' && pending ? 'wait' : 'pointer') : '';
    if (!hit?.native?.matches('a[href]')) {hideHover(); return;}
    const rect = projectSurface(host, hit.mesh);
    if (!rect) {hideHover(); return;}
    hoveredRect = rect;
    hoverLink.href = hit.native.href; hoverLink.target = hit.native.target; hoverLink.rel = hit.native.rel;
    hoverLink.setAttribute('aria-label', hit.native.getAttribute('aria-label') || hit.native.textContent.trim());
    const previous = nativeBindings.get(hoverLink); if (previous?.mesh !== hit.mesh) nativeBindings.set(hoverLink, hit);
    Object.assign(hoverLink.style, {left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, clipPath: `polygon(${rect.corners.map(p => `${(p.x - rect.left) / rect.width * 100}% ${(p.y - rect.top) / rect.height * 100}%`).join(',')})`});
    hoverLink.hidden = false;
  }
  function draw(ms) {
    frame = 0; if (stopped || document.hidden || !healthy || !camera) return;
    if (ms - lastDraw < (innerWidth < 700 ? 30 : 15)) {wake(); return;}
    const dt = lastTime ? Math.min(.05, (ms - lastTime) / 1000) : 1 / 60; lastTime = lastDraw = ms;
    try {
      if (!overlay) {
        burstAge += dt; remoteAge += dt;
        controller.frame?.(ms / 1000, dt);
      }
      if(controller.render)controller.render(dt);else renderer.render(scene, camera);
    } catch (error) {fallback(error); return;}
    if (pointer.active && !candidate && !overlay) updateHover(pick(pointer.clientX, pointer.clientY));
    if (!reducedMotion.matches && !overlay) wake();
  }
  const host = {
    theme, stage, canvas, dom, exhibits, groups, showData: groups, destinations, pointer, on, wake, own,
    get disposed(){return stopped;}, get camera(){return camera;}, get reduced(){return reducedMotion.matches;},
    // Asset choice and camera rig share one profile across every loading await.
    // Crossing the boundary recreates this host; previews defer that recreation.
    get mobile(){return phoneAtCreation;}, get pending(){return pending;}, get progress(){return progress;},
    get burst(){return burstAge;}, get remoteAge(){return remoteAge;},
    getDigits, getTally: getTally || (() => dom.tally.dataset.reelValue || '0'), getSnapshot,
    requestReset, revealSecret: reveal,
    useCamera(next){camera = next; wake();}, bind,
    registerOccluder(mesh){occluders.add(mesh); return () => occluders.delete(mesh);},
    setScrollStops, scrollTo: scrollToProgress,
    projectRect: mesh => projectSurface(host, mesh),
    texture: (url, options) => loadSurfaceTexture(host, assetURL(url), options),
    ink: (mesh, options) => createInkFace(host, mesh, options),
    numerals: options => createNumerals(host, options),
    openPreview(exhibit, {originRect, surface} = {}) {
      if (stopped || overlay || !healthy) return;
      const anchor = exhibit.anchor || exhibit;
      if (!activePreview || activePreview.anchor !== anchor) return;
      savePose(anchor);
      const rect = originRect || (surface && projectSurface(host, surface));
      document.dispatchEvent(new CustomEvent('archive:open', {detail: {card: anchor, originRect: rect}}));
    },
    async loadGLB(url) {
      const {GLTFLoader} = await import(`./assets/vendor/addons/loaders/GLTFLoader.js?v=${version}`);
      if (stopped) throw new Error('Scene disposed before model loading');
      const model = await new GLTFLoader().loadAsync(assetURL(url));
      if (stopped) {release(model.scene); throw new Error('Scene disposed during model loading');}
      own(model.scene);
      // Record the loaded resources before artists replace an ink material or
      // clone a reading geometry. Detached originals are still owned by us.
      model.scene.traverse(object => {own(object.geometry); own(object.material); own(object.skeleton);});
      const images = new Set();
      model.scene.traverse(object => (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => {
        if (material) Object.values(material).forEach(value => {if (value?.isTexture && value.source?.data) images.add(value.source.data);});
      }));
      await Promise.all([...images].map(image => image.decode ? image.decode() : Promise.resolve()));
      if (stopped) {release(model.scene); throw new Error('Scene disposed during model image decoding');}
      return model;
    }
  };
  // Loading has a lifecycle too: navigation away must dispose a model that
  // finishes later, before it can ever replace the native archive.
  on(window, 'pagehide', e => {if (e.persisted) {cancelInput('pagehide'); cancelAnimationFrame(frame); frame = 0;} else fallback();});
  on(window, 'pageshow', () => {lastTime = 0; wake();});
  try {
    const THREE = await import('./assets/vendor/three.module.min.js'); host.THREE = THREE;
    if (stopped) return {dispose(){cleanups.splice(0).forEach(fn => fn());}, healthy: false, host};
    renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: 'low-power'});
    renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
      throw new Error('Scene shader could not compile: ' + (gl.getShaderInfoLog(fragment) || gl.getShaderInfoLog(vertex) || gl.getProgramInfoLog(program)));
    };
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene(); root = new THREE.Group(); scene.add(root);
    Object.assign(host, {renderer, scene, root}); raycaster = new THREE.Raycaster(); pointerVector = new THREE.Vector2();
    on(canvas, 'webglcontextlost', event => {event.preventDefault(); fallback(new Error('Graphics context lost'));});
    const module = await import(`./concepts/${theme}.scene.js?v=${version}`);
    if (stopped) return {dispose(){cleanups.splice(0).forEach(fn => fn());}, healthy: false, host};
    controller = await module.create(host) || {}; await controller.ready; await document.fonts.ready;
    if (stopped) {controller.dispose?.(); return {dispose(){cleanups.splice(0).forEach(fn => fn());}, healthy: false, host};}
    if (phoneAtCreation !== (innerWidth < 700)) {
      fallback(); requestRebuild();
      return {dispose(){cleanups.splice(0).forEach(fn => fn());}, healthy: false, host};
    }
    if (!camera) throw new Error('The concept did not supply its own camera');
    // A composed frame, with all critical assets decoded, precedes semantic clipping.
    const resize = () => {
      if (stopped) return; cancelInput('resize'); ++previewToken;
      if (phoneAtCreation !== (innerWidth < 700)) {
        rebuildQueued = true;
        if (!overlay && healthy) requestRebuild();
        return;
      }
      rebuildQueued = false;
      if (!overlay) {activePreview = null; controller.cancelApproach?.(); restorePose();}
      const width = innerWidth, height = innerHeight;
      renderer.setSize(width, height, false);
      if (!overlay) controller.resize?.(width, height);
      if (camera.isPerspectiveCamera) {camera.aspect = width / height; camera.updateProjectionMatrix();}
      setScrollStops(stopCount); hideHover(); lastTime = 0; wake();
    };
    resize();
    const initialGroup = location.hash.slice(1);
    if (!resume && groups.some(group => group.id === initialGroup)) controller.focus?.(initialGroup);
    pending = !!dom.reset.disabled; controller.pending?.(pending);
    controller.frame?.(performance.now() / 1000, 0); if(controller.render)controller.render(0);else renderer.render(scene, camera);
    document.body.append(runway); stage.append(clockReturn, focusCaption, hoverLink, dom.status, dom.secretButton);
    dom.status.classList.add('scene-status'); dom.secretButton.classList.remove('scene-fallback-crown'); dom.secretButton.classList.add('scene-semantic-twin');
    semantics.forEach(node => node.classList.add('scene-semantic-twin'));
    html.classList.remove('scene-first-loading', 'scene-first-fallback'); html.classList.add('scene-first-ready'); healthy = true;
    if (resume || progress > 0) scrollToProgress(progress);
    dom.secretButton.hidden = false; clockReturn.hidden = progress < .035;
    legacyAction.tabIndex = -1;
    document.getElementById('art-hero').classList.add('hero-awake');
    on(window, 'resize', resize);
    on(window, 'scroll', () => {
      if (overlay || scrollSuppressed) return;
      activePreview = null; controller.cancelApproach?.(); pose = null; origin = null;
      progress = Math.max(0, Math.min(1, window.scrollY / Math.max(1, runway.offsetHeight - innerHeight)));
      controller.navigation?.(progress); clockReturn.hidden = progress < .035; hideHover(); wake();
    }, {passive: true});
    on(clockReturn, 'click', () => {cancelInput('clock'); controller.focus?.('clock'); scrollToProgress(0);});
    on(document, 'countdown:pending', e => {pending = !!e.detail; controller.pending?.(pending); wake();});
    on(document, 'countdown:reset', () => {burstAge = reducedMotion.matches ? 999 : 0; controller.celebrate?.(); wake();});
    on(document, 'countdown:remote', () => {remoteAge = reducedMotion.matches ? 999 : 0; controller.remote?.(); wake();});
    on(document, 'archive:overlay', e => {
      overlay = !!e.detail.open; cancelInput('overlay'); hideHover(); ++previewToken;
      stage.inert = overlay;
      if (overlay) {savePose(e.detail.card); controller.freeze?.(true);}
      else {controller.freeze?.(false); activePreview = null; restorePose(); origin = null; if (rebuildQueued) requestRebuild();}
      wake();
    });
    on(document, 'focusin', e => {
      if (overlay || suppressFocus || e.target === hoverLink) return;
      if (pose) {activePreview = null; controller.cancelApproach?.(); restorePose();}
      const record = nativeBindings.get(e.target);
      focusCaption.hidden = true;
      if (record) {
        if (record.focus) record.focus({keyboard: true}); else controller.focus?.(record.native);
        // A plaque or crown can move the camera without moving the scroll rail.
        if (record.kind === 'link' || record.kind === 'secret') clockReturn.hidden = false;
        wake();
      }
      else if (e.target.matches('.shownav a')) {
        controller.focus?.(e.target.getAttribute('href').split('#').pop()); wake();
      }
      else if (e.target.closest('.scene-semantic-twin')) {
        focusCaption.textContent = e.target.getAttribute('aria-label') || e.target.textContent.trim(); focusCaption.hidden = false;
      }
    });
    on(document, 'focusout', e => {if (e.target !== hoverLink) nativeBindings.get(e.target)?.blur?.({keyboard: true}); focusCaption.hidden = true;});
    // Capture an ordinary activation before the legacy card handler. Modified,
    // middle and context-menu links remain real browser links with their own URL.
    on(document, 'click', event => {
      const action = event.target.closest('a,button'), record = nativeBindings.get(action);
      if (record) {
        if (action === hoverLink) {
          const actual = pick(event.clientX, event.clientY);
          if (actual?.mesh !== record.mesh) {event.preventDefault(); event.stopImmediatePropagation(); hideHover(); return;}
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        if (suppressedClick?.mesh === record.mesh && performance.now() - suppressedClick.time < 700) {
          suppressedClick = null; event.preventDefault(); event.stopImmediatePropagation(); return;
        }
        // The live exhibit is a real outbound link, without a camera approach.
        if (record.native?.matches('a.card-live')) return;
        event.preventDefault(); event.stopImmediatePropagation(); invoke(record, event); return;
      }
      const groupLink = action?.closest('.shownav a');
      if (groupLink && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault(); const id = groupLink.getAttribute('href').split('#').pop(); controller.focus?.(id); wake();
      }
    }, true);
    for (const eventName of ['auxclick', 'contextmenu']) on(hoverLink, eventName, event => {
      if (pick(event.clientX, event.clientY)?.mesh !== nativeBindings.get(hoverLink)?.mesh) {
        event.preventDefault(); event.stopImmediatePropagation(); hideHover();
      }
    });
    on(window, 'pointermove', event => {
      if (candidate && event.pointerId !== pointer.id) return;
      pointer.clientX = event.clientX; pointer.clientY = event.clientY;
      pointer.x = event.clientX / innerWidth * 2 - 1; pointer.y = 1 - event.clientY / innerHeight * 2;
      pointer.active = true;
      if (candidate) {
        const dx = event.clientX - candidate.x, dy = event.clientY - candidate.y;
        if (Math.hypot(dx, dy) > 7) candidate.moved = true;
        if (candidate.moved && candidate.record?.drag && Math.abs(dx) > Math.abs(dy) * 1.3) candidate.record.drag({dx, dy, event, hit: candidate.record.hit});
        else if (Math.abs(dy) > 7 && event.pointerType === 'touch') cancelInput('pan-y');
      } else if (event.target === canvas || event.target === hoverLink) updateHover(pick(event.clientX, event.clientY));
      else if (!event.target.closest('.scene-first-stage')) hideHover();
      wake();
    }, {passive: true});
    on(stage, 'pointerdown', event => {
      if (event.button !== 0 || overlay || event.target !== canvas && event.target !== hoverLink) return;
      pressedPointers.add(event.pointerId);
      if (pressedPointers.size > 1 || candidate) {cancelInput('multitouch'); return;}
      const record = pick(event.clientX, event.clientY);
      pointer.down = true; pointer.id = event.pointerId;
      candidate = {record, x: event.clientX, y: event.clientY, moved: false, nativeLink: event.target === hoverLink};
      record?.press?.({event, hit: record.hit}); wake();
    });
    on(window, 'pointerup', event => {
      pressedPointers.delete(event.pointerId);
      if (!candidate || event.pointerId !== pointer.id) return;
      const press = candidate; candidate = null; pointer.down = false;
      if (press?.nativeLink && press.moved) suppressedClick = {mesh: press.record?.mesh, time: performance.now()};
      if (press?.record && !press.moved && !press.nativeLink && !overlay) {
        const releaseHit = pick(event.clientX, event.clientY);
        if (releaseHit?.mesh === press.record.mesh) invoke(press.record, event);
      } else press?.record?.cancel?.('release');
      wake();
    });
    for (const type of ['pointercancel', 'lostpointercapture']) on(window, type, event => {pressedPointers.delete(event.pointerId); if (event.pointerId === pointer.id) cancelInput(type);});
    on(window, 'blur', () => {pointer.active = false; cancelInput('blur'); hideHover();});
    on(document, 'visibilitychange', () => {
      cancelInput('visibility'); lastTime = 0;
      document.getElementById('art-hero').classList.toggle('hero-awake', !document.hidden);
      if (document.hidden) {cancelAnimationFrame(frame); frame = 0;} else wake();
    });
    on(document, 'keydown', e => {if (e.key === 'Escape' && !overlay) {++previewToken; activePreview = null; controller.cancelApproach?.(); restorePose(); cancelInput('escape');}});
    on(reducedMotion, 'change', () => {
      lastTime = 0; controller.reducedMotion?.(reducedMotion.matches);
      if (reducedMotion.matches) {
        burstAge = remoteAge = 999;
        controller.cancelApproach?.();
        if (activePreview && !overlay) host.openPreview(activePreview.anchor, {surface: activePreview.surface});
      }
      wake();
    });
    const ticker = setInterval(wake, 1000); cleanups.push(() => clearInterval(ticker));
    wake();
    if (rebuildQueued) requestRebuild();
  } catch (error) {fallback(error);}
  return {dispose(){fallback(); cleanups.splice(0).forEach(fn => fn());}, get healthy(){return healthy;}, host};
}
