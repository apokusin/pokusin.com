// Offline audit fixture. Real saved source/Three geometry; mocked DOM, rasterization and GPU.
import {fileURLToPath} from 'node:url';
import {records as raw, archiveDestinations, timeline} from './native-records.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as Three from '../../../countdowns/assets/vendor/three.module.min.js';
import {GLTFLoader} from '../../../countdowns/assets/vendor/addons/loaders/GLTFLoader.js';
import {createNumerals,createInkFace,projectSurface} from '../../../countdowns/scene-surfaces.js';
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const noop=()=>{};
class Element {constructor(tag){this.tagName=tag;this.style={setProperty:noop};this.dataset={};this.children=[];this.attributes={};this.classList={add:noop,remove:noop};}append(...values){this.children.push(...values);}remove(){}setAttribute(name,value){this.attributes[name]=value;}getAttribute(name){return this.attributes[name]||'';}matches(selector){return selector==='a[href]'&&this.tagName==='a';}getContext(){return new Proxy({canvas:this,measureText:text=>({width:text.length*30}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),getImageData:()=>({data:new Uint8ClampedArray(4)})},{get:(target,key)=>key in target?target[key]:noop,set:(target,key,value)=>(target[key]=value,true)});}getBoundingClientRect(){return{left:0,top:0,width:innerWidth,height:innerHeight};}}
const names={got:'Game of Thrones',dexter:'Dexter',sherlock:'Sherlock',archer:'Archer','breaking-bad':'Breaking Bad','house-of-cards':'House of Cards',severance:'Severance'};
const anchor=(href,label)=>{const a=new Element('a');a.href=href;a.target=href.startsWith('https:')?'_blank':'';a.rel=a.target?'noopener noreferrer':'';a.textContent=label;a.attributes.href=href;return a;};
const exhibits=raw.map((item,index)=>({...item,index,id:item.href.replace(/^\/countdowns\//,'').replace(/\/$/,'').replaceAll('/',':'),showName:names[item.show],anchor:Object.assign(anchor(item.href,item.label),{target:item.target,rel:item.rel})}));
const groups=Object.entries(names).map(([id,name])=>({id,name,exhibits:exhibits.filter(e=>e.show===id)}));
const groupsById=new Map(groups.map(g=>[g.id,anchor('?theme=test#'+g.id,g.name)]));
globalThis.window=globalThis;globalThis.self=globalThis;globalThis.location={search:'',href:'http://127.0.0.1:8000/countdowns/'};
globalThis.innerWidth=1487;globalThis.innerHeight=900;
const fonts=new Set();fonts.ready=Promise.resolve();fonts.load=async()=>[];
globalThis.document={baseURI:location.href,activeElement:null,body:new Element('body'),documentElement:{dataset:{artVersion:'audit'},style:{setProperty:noop}},createElement:tag=>new Element(tag),fonts,querySelector:selector=>{const id=selector.match(/#([^"'\]]+)/)?.[1];return groupsById.get(id)||null;}};
globalThis.FontFace=class {async load(){return this;}};
globalThis.Image=class {constructor(){this.width=this.naturalWidth=1600;this.height=this.naturalHeight=1000;}async decode(){}};
globalThis.fetch=async value=>{const url=new URL(value,location.href);const text=await fs.readFile(repo+decodeURIComponent(url.pathname).replace(/^\//,''),'utf8');return{ok:true,json:async()=>JSON.parse(text)};};
const T={...Three,PMREMGenerator:class{constructor(){}fromScene(){return new Three.WebGLRenderTarget(4,4);}dispose(){}}};
function stripMaps(value){if(!value||typeof value!=='object')return;for(const key of Object.keys(value)){if(/Texture$/.test(key))delete value[key];else stripMaps(value[key]);}}
async function model(path){const b=await fs.readFile(repo+'countdowns/'+path);const length=b.readUInt32LE(12),json=JSON.parse(b.subarray(20,20+length));for(const material of json.materials||[])stripMaps(material);json.textures=[];json.images=[];const text=Buffer.from(JSON.stringify(json));const pad=(4-text.length%4)%4,jsonChunk=Buffer.concat([text,Buffer.alloc(pad,32)]),binary=b.subarray(20+length),head=Buffer.alloc(20);head.writeUInt32LE(0x46546c67);head.writeUInt32LE(2,4);head.writeUInt32LE(20+jsonChunk.length+binary.length,8);head.writeUInt32LE(jsonChunk.length,12);head.writeUInt32LE(0x4e4f534a,16);const all=Buffer.concat([head,jsonChunk,binary]);return new GLTFLoader().parseAsync(all.buffer.slice(all.byteOffset,all.byteOffset+all.byteLength),'');}
const results=[];
for(const theme of ['tomorrows-roadworks','bubblegum-time','after-the-flame','low-tide-later','not-yet-ripe','still-drawing-tomorrow','held-in-suspense']) for(const phone of [false,true]){
 innerWidth=phone?390:1487;innerHeight=phone?844:900;
 const bindings=[],owned=new Set(),canvas=new Element('canvas');let controller,camera,progress=0,stops=0,opens=[];
 const dom={reset:new Element('button'),secretButton:new Element('button'),tally:new Element('span')};
 const destinations={home:anchor('/','Home'),archive:archiveDestinations.map(({show,href})=>({show,anchor:anchor(href,'Archive')})),timeline:anchor(timeline,'Timeline'),live:anchor('https://severancecountdown.com/','Live')};
 const host={THREE:T,scene:new T.Scene(),root:new T.Group(),renderer:{shadowMap:{},capabilities:{getMaxAnisotropy:()=>4}},canvas,stage:new Element('div'),theme,dom,exhibits,groups,destinations,pointer:{active:false,x:0,y:0},get disposed(){return false;},get mobile(){return innerWidth<700;},get reduced(){return false;},get pending(){return false;},get progress(){return progress;},get camera(){return camera;},get burst(){return 999;},get remoteAge(){return 999;},wake:noop,on:noop,own:r=>(owned.add(r),r),useCamera:c=>camera=c,loadGLB:model,texture:async()=>new T.Texture(new Image()),numerals:opts=>createNumerals(host,opts),ink:(m,opts)=>createInkFace(host,m,opts),setScrollStops:n=>stops=n,scrollTo:n=>{progress=n;controller?.navigation?.(n);},bind:(mesh,record)=>bindings.push({...record,mesh}),registerOccluder:noop,getDigits:()=>[29,12,45,56],getTally:()=>14,getSnapshot:()=>({ready:true,now:Date.now(),deadline:Date.now()+864000000}),requestReset:noop,revealSecret:noop,openPreview:(e)=>opens.push(e.anchor||e),projectRect:mesh=>projectSurface(host,mesh)};
 host.scene.add(host.root);
 try{
  const module=await import(repo+'countdowns/concepts/'+theme+'.scene.js');controller=await module.create(host);await controller.ready;controller.resize?.(innerWidth,innerHeight);controller.frame?.(performance.now()/1000,1/60);
  const previews=new Map(bindings.filter(b=>b.kind==='preview').map(b=>[b.native,b]));assert.equal(previews.size,13,theme+' previews');const links=new Map(bindings.filter(b=>b.kind==='link').map(b=>[b.native,b]));assert.equal(links.size,7,theme+' links');assert(stops>=14,theme+' stops');
  for(const exhibit of exhibits){const binding=previews.get(exhibit.anchor);binding.focus?.();binding.activate?.();controller.frame?.(performance.now()/1000+2,1/60);assert.equal(opens.at(-1),exhibit.anchor,theme+' preview '+exhibit.id);const pose=controller.capturePose?.();controller.freeze?.(true);controller.restorePose?.(pose);controller.freeze?.(false);controller.cancelApproach?.();controller.cancelInput?.('pointercancel');}
  for(const binding of links.values())binding.focus?.();controller.focus?.('clock');results.push({theme,profile:phone?'390x844':'1487x900',previews:previews.size,links:links.size,stops,previewActivations:opens.length});console.log('PASS',theme,phone?'phone':'desktop','13 preview actions, 7 native links,',stops,'scroll stops; focus/preview/pose/cancel callbacks.');
 }catch(error){console.error('FAIL',theme,phone?'phone':'desktop',error.stack);process.exitCode=1;}
 finally{controller?.dispose?.();host.scene.traverse(o=>{o.geometry?.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose());o.isLight&&o.dispose();});for(const r of owned)if(!r?.isObject3D)r?.dispose?.();}
}

console.log('RESULTJSON '+JSON.stringify({controllerProfiles:results.length,previewActivations:results.reduce((n,r)=>n+r.previewActivations,0),nativeDestinationFocuses:results.reduce((n,r)=>n+r.links,0),profiles:results}));
