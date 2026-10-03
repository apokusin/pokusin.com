// Offline audit fixture. Real saved source/Three geometry; mocked DOM, rasterization and GPU.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Three from '../../../countdowns/assets/vendor/three.module.min.js';
const source=fs.readFileSync(new URL('../../../countdowns/scene-host.js', import.meta.url),'utf8');
const transformed=source.replace('export async function initSceneHost','async function initSceneHost').replace('await import(`./scene-surfaces.js?v=${version}`)','await deps.surfaces()').replace("await import('./assets/vendor/three.module.min.js')",'await deps.three()').replace('await import(`./concepts/${theme}.scene.js?v=${version}`)','await deps.module(theme)');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const factory=new AsyncFunction('deps',transformed+'\nreturn initSceneHost;');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const warnings=[];const originalWarn=console.warn;console.warn=(...args)=>warnings.push(args);
class Classes{constructor(node){this.node=node;this.values=new Set();}add(...xs){xs.forEach(x=>this.values.add(x));}remove(...xs){xs.forEach(x=>this.values.delete(x));}contains(x){return this.values.has(x);}toggle(x,force){if(force===undefined)force=!this.contains(x);force?this.add(x):this.remove(x);return force;}}
class El extends EventTarget{constructor(tag='div'){super();this.tagName=tag.toUpperCase();this.children=[];this.attributes=new Map();this.classList=new Classes(this);this.style={cssText:'',setProperty(){}};this.hidden=false;this.disabled=false;this.dataset={};this.inert=false;this.offsetHeight=0;}set className(v){this.classList.values=new Set(v.split(/\s+/));}get className(){return [...this.classList.values].join(' ');}get parentNode(){return this.parent||null;}get nextSibling(){const a=this.parent?.children||[],i=a.indexOf(this);return a[i+1]||null;}append(...nodes){for(const node of nodes){node.remove();this.children.push(node);node.parent=this;}}remove(){if(this.parent){const i=this.parent.children.indexOf(this);this.parent.children.splice(i,1);this.parent=null;}}insertBefore(node,next){node.remove();this.children.splice(this.children.indexOf(next),0,node);node.parent=this;}setAttribute(k,v){this.attributes.set(k,String(v));}getAttribute(k){return this.attributes.has(k)?this.attributes.get(k):null;}removeAttribute(k){this.attributes.delete(k);}querySelector(s){return this.queries?.[s]||null;}querySelectorAll(s){return this.queryArrays?.[s]||[];}matches(s){return s==='a[href]'&&this.tagName==='A';}closest(s){if(s==='.shelf')return this.shelf;if(s==='.scene-semantic-twin')return this.classList.contains('scene-semantic-twin')?this:null;return null;}getBoundingClientRect(){return{left:0,top:0,width:innerWidth,height:innerHeight};}hasPointerCapture(){return false;}focus(){this.focuses=(this.focuses||0)+1;}}
Object.defineProperty(El.prototype,'href',{get(){return new URL(this.getAttribute('href')||'',document.baseURI).href;},set(value){this.setAttribute('href',value);}});
El.prototype.cloneNode=function(){const copy=new El(this.tagName);copy.className=this.className;copy.dataset={...this.dataset};copy.textContent=this.textContent;for(const [key,value]of this.attributes)copy.setAttribute(key,value);return copy;};
function installTimeline(env){const shelf=new El();shelf.id='dexter';shelf.className='shelf';const name=new El();name.textContent='Dexter';shelf.queries={'.shelf-name':name};shelf.querySelectorAll=selector=>selector==='a'||selector==='a[href]'?shelf.children.filter(child=>child.tagName==='A'):[];env.document.getElementById('archive-shelves').append(shelf);const source=new El('a');source.className='scene-timeline-link';source.dataset.show='dexter';source.setAttribute('href','/countdowns/dexter/s7-episodes/');source.textContent='Dexter timeline';const template=new El('template');template.content=new El();template.content.queryArrays={'a[data-show]':[source]};const getId=env.document.getElementById;env.document.getElementById=id=>id==='scene-destinations'?template:getId(id);env.document.querySelectorAll=selector=>selector==='.shelf'?[shelf]:selector==='.shelf-more, .scene-timeline-link'||selector==='a[href]'?shelf.querySelectorAll('a[href]'):[];return shelf;}
function environment(){
 globalThis.innerWidth=1000;globalThis.innerHeight=900;globalThis.devicePixelRatio=1;globalThis.location={origin:'http://127.0.0.1:8000',hash:''};
 const window=new EventTarget();window.scrollY=0;window.scrollTo=({top})=>window.scrollY=top;globalThis.window=window;
 const document=new EventTarget(),html=new El('html'),body=new El('body'),wrap=new El(),hero=new El(),shownav=new El(),shelves=new El(),foot=new El(),artHero=new El(),next=new El(),original=new El();
 html.dataset.artVersion='lifecycle-fixture';body.append(wrap,original,artHero);wrap.append(hero,shownav,shelves,foot);hero.append(next);hero.queries={'.next-countdown':next};
 const status=new El('p'),secret=new El('p'),secretButton=new El('button'),legacy=new El('button'),reset=new El('button'),tally=new El(),clock=new El(),timer=new El(),title=new El(),home=new El('a');
 home.href='http://127.0.0.1:8000/';home.setAttribute('href','/');hero.append(status,legacy,reset,tally,clock,timer);original.append(secret,secretButton,title);
 const ov=new El();ov.hidden=true;const byId={'hero-surface':hero,'archive-shelves':shelves,'royal-reset':reset,'reset-count':tally,'clock-status':status,'countdown-secret':secret,'timer-readable':timer,'scene-action':legacy,'art-hero':artHero,ov};
 const queries={'.wrap':wrap,'.shownav':shownav,'.foot':foot,'.royal-clock':clock,'.art-secret-trigger':secretButton,'.art-title':title,'.home-link':home,'#art-hero':artHero};
 document.body=body;document.documentElement=html;document.hidden=false;document.baseURI='http://127.0.0.1:8000/countdowns/';document.fonts=new Set();document.fonts.ready=Promise.resolve();document.getElementById=id=>byId[id]||null;document.querySelector=s=>queries[s]||null;document.querySelectorAll=()=>[];document.createElement=tag=>{const node=new El(tag);if(tag==='div')Object.defineProperty(node,'offsetHeight',{get(){return parseFloat(node.style.height)||0;}});return node;};globalThis.document=document;
 globalThis.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});globalThis.CustomEvent=class extends Event{constructor(type,options){super(type);this.detail=options?.detail;}};
 const raf=new Map();let id=0;globalThis.requestAnimationFrame=fn=>(raf.set(++id,fn),id);globalThis.cancelAnimationFrame=n=>raf.delete(n);const intervals=new Set();globalThis.setInterval=fn=>{intervals.add(fn);return fn;};globalThis.clearInterval=fn=>intervals.delete(fn);
 const descendants=node=>[node,...node.children.flatMap(descendants)];
 return{window,document,html,body,hero,next,status,secret,secretButton,original,legacy,reset,raf,intervals,stageCount:()=>descendants(body).filter(e=>e.classList.contains('scene-first-stage')).length,canvasCount:()=>descendants(body).filter(e=>e.tagName==='CANVAS').length};
}
function dependencies(env,config={}){
 const builds=[],renders=[];let firstGate,secondGate,initialGate;
 class Renderer{constructor(){this.debug={};this.shadowMap={};this.calls=0;this.disposals=0;this.contextLosses=0;renders.push(this);}setPixelRatio(){}setSize(w,h){this.size=[w,h];}render(){this.calls++;}dispose(){this.disposals++;}forceContextLoss(){this.contextLosses++;}}
 const deps={surfaces:async()=>({}),three:async()=>({...Three,WebGLRenderer:Renderer}),module:async()=>({async create(host){
  const index=builds.length,build={host,index,renders:0,cancelled:[],navigation:[],font:{id:index},disposed:0};builds.push(build);
  host.own({dispose(){env.document.fonts.delete(build.font);}});env.document.fonts.add(build.font);
  if(config.badCleanup)host.own({dispose(){throw Error('injected owned disposer failure');}});
  if(config.profileRace&&index===0){await new Promise(resolve=>firstGate=resolve);build.assetMobile=host.mobile;await new Promise(resolve=>secondGate=resolve);}else build.assetMobile=host.mobile;
  if(config.loadingPagehide&&index===0)await new Promise(resolve=>initialGate=resolve);
  const camera=new Three.PerspectiveCamera(35,innerWidth/innerHeight,.1,100);host.useCamera(camera);host.setScrollStops(14);
  return{ready:true,frame(){assert.equal(host.mobile,build.assetMobile,'selected model and authored camera profile stay identical');},render(){build.renders++;if(config.firstRenderFailure||config.laterRenderFailure&&build.renders>1)throw Error('injected render-hook failure');},navigation(p){build.navigation.push(p);},resize(){},cancelInput(reason){build.cancelled.push(reason);if(config.badCleanup&&reason==='graphics')throw Error('injected artist cancellation failure');},capturePose(){return{station:host.progress};},restorePose(){},freeze(){},dispose(){build.disposed++;if(config.badCleanup)throw Error('injected artist disposer failure');}};
 }})};return{deps,builds,renders,get firstGate(){return firstGate;},get secondGate(){return secondGate;},get initialGate(){return initialGate;}};
}
function assertNative(env){assert(!env.html.classList.contains('scene-first-ready'));assert(!env.html.classList.contains('scene-first-loading'));assert(env.html.classList.contains('scene-first-fallback'));assert.equal(env.stageCount(),0);assert.equal(env.canvasCount(),0);assert.equal(env.document.fonts.size,0);assert.equal(env.status.parentNode,env.hero);assert.equal(env.secret.parentNode,env.original);assert.equal(env.secretButton.parentNode,env.next);assert(!env.hero.classList.contains('scene-semantic-twin'));assert.equal(env.legacy.getAttribute('tabindex'),null);assert.equal(env.intervals.size,0);}
const options=()=>({theme:'fixture',getDigits:()=>['30','00','00','00'],getTally:()=>79,getSnapshot:()=>({deadline:9,now:2,ready:true}),requestReset(){throw Error('lifecycle never resets the shared state');},revealSecret(){}});
// Whole-host first-frame promotion is rolled back even if artist/resource cleanup fails.
{
 const env=environment(),d=dependencies(env,{firstRenderFailure:true,badCleanup:true}),init=await factory(d.deps),handle=await init(options());
 assert.equal(handle.healthy,false);assertNative(env);assert.equal(d.renders[0].disposals,1);assert.equal(d.renders[0].contextLosses,1);assert.equal(d.builds[0].disposed,1);handle.dispose();
}
// A later optional render failure also restores the same complete native DOM.
{
 const env=environment(),d=dependencies(env,{laterRenderFailure:true,badCleanup:true}),init=await factory(d.deps),handle=await init(options());
 assert.equal(handle.healthy,true);assert.equal(d.builds[0].renders,1);assert.equal(d.renders[0].calls,0,'custom render owns the first composed frame');
 for(const [id,fn] of [...env.raf]){env.raf.delete(id);fn(1000);}
 assert.equal(handle.healthy,false);assertNative(env);assert.equal(d.renders[0].disposals,1);handle.dispose();
}
// Desktop/phone reconstruction retains native nodes/shared state/progress without duplicates.
{
 const env=environment(),timeline=installTimeline(env),d=dependencies(env),init=await factory(d.deps),handle=await init(options());assert.equal(timeline.querySelectorAll('a[href]').length,1);env.reset.disabled=true;handle.host.scrollTo(.65);
 innerWidth=390;env.window.dispatchEvent(new Event('resize'));await tick();await tick();
 assert.equal(d.builds.length,2);assert.equal(timeline.querySelectorAll('a[href]').length,1,'rebuild keeps one canonical native timeline');assert.equal(handle.host.mobile,true);assert.equal(handle.host.progress,.65);assert.equal(handle.host.getTally(),79);assert.equal(handle.host.pending,true);assert.equal(env.stageCount(),1);assert.equal(env.canvasCount(),1);assert.equal(env.document.fonts.size,1);assert.equal(d.builds[0].disposed,1);assert.equal(d.renders[0].contextLosses,1);
 env.document.dispatchEvent(new CustomEvent('archive:overlay',{detail:{open:true,card:env.reset}}));innerWidth=1000;env.window.dispatchEvent(new Event('resize'));await tick();assert.equal(d.builds.length,2,'an open preview defers profile replacement');assert.equal(handle.host.mobile,true,'frozen scene retains its authored phone profile');
 env.document.dispatchEvent(new CustomEvent('archive:overlay',{detail:{open:false}}));await tick();await tick();assert.equal(d.builds.length,3);assert.equal(timeline.querySelectorAll('a[href]').length,1,'return to desktop retains one native timeline');assert.equal(handle.host.mobile,false);assert.equal(handle.host.progress,.65);assert.equal(env.canvasCount(),1);assert.equal(env.document.fonts.size,1);handle.dispose();assertNative(env);
}
// Viewport crosses and returns across two loading awaits: no mixed model/rig.
{
 const env=environment(),d=dependencies(env,{profileRace:true}),init=await factory(d.deps),promise=init(options());while(!d.firstGate)await tick();innerWidth=390;d.firstGate();while(!d.secondGate)await tick();innerWidth=1000;d.secondGate();const handle=await promise;assert.equal(handle.healthy,true);assert.equal(d.builds.length,1);assert.equal(d.builds[0].assetMobile,false);assert.equal(env.canvasCount(),1);handle.dispose();assertNative(env);
}
// Navigation away during loading does not promote a late controller/font/canvas.
{
 const env=environment(),d=dependencies(env,{loadingPagehide:true}),init=await factory(d.deps),promise=init(options());while(!d.initialGate)await tick();env.window.dispatchEvent(new Event('pagehide'));d.initialGate();const handle=await promise;assert.equal(handle.healthy,false);assertNative(env);assert.equal(d.builds[0].disposed,1);handle.dispose();
}
console.warn=originalWarn;console.log('PASS whole-host: first/later custom-render fault with throwing cleanup restores native DOM; breakpoint/deferred-preview rebuild retains shared state/progress and one canvas/font/native timeline; loading profile round-trip remains coherent; late pagehide completion never promotes. GPU/browser appearance is not tested.');

console.log('RESULTJSON '+JSON.stringify({lifecycleCases:5,cases:['first render fails with throwing cleanup','later render fails with throwing cleanup','desktop-phone-desktop with overlay deferral and canonical timeline','profile crosses and returns during two asset awaits','pagehide during loading']}));
