// Small surface helpers. Every world owns its geometry, arrangement and camera.
export function canvasInk(host, mesh, paint, {width=1024,height=512,lit=false}={}) {
  const {THREE}=host;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d');
  if(!context)throw new Error('The authored ink surface could not be created');
  const texture=host.own(new THREE.CanvasTexture(canvas));
  texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;
  texture.anisotropy=Math.min(8,host.renderer.capabilities.getMaxAnisotropy());
  const material=host.own(lit?new THREE.MeshStandardMaterial({map:texture,transparent:true,roughness:.82,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}):new THREE.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
  host.own(mesh.material);mesh.material=material;
  const update=()=>{context.clearRect(0,0,width,height);paint(context,width,height);texture.needsUpdate=true;host.wake();};
  update();return {texture,canvas,context,update};
}

export async function mountArchive(host, mesh, exhibit, {lit=false}={}) {
  const map=await host.texture(exhibit.thumbnail,{colorSpace:'srgb',flipY:false});
  const material=host.own(lit?new host.THREE.MeshStandardMaterial({map,roughness:.9,metalness:0}):new host.THREE.MeshBasicMaterial({map,toneMapped:false}));
  host.own(mesh.material);mesh.material=material;mesh.receiveShadow=lit;
  return mesh;
}

export function labelInk(host,mesh,text,{font='500 56px "Barlow Condensed"',color='#222526',align='center',width=1024,height=128}={}){
  return canvasInk(host,mesh,(ctx,w,h)=>{ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.font=font;ctx.fillText(text,align==='center'?w/2:align==='right'?w-24:24,h/2,w-48);},{width,height});
}

export function worldBounds(host,object){
  object.updateWorldMatrix(true,true);return new host.THREE.Box3().setFromObject(object);
}
