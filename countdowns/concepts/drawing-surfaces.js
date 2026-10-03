// Different physical surfaces on the animator's table share no generic grain overlay.
export function drawingSurfaces(T, renderer, resources) {
  let seed=91671;
  const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  function texture(kind) {
    const size=512, canvas=document.createElement('canvas');canvas.width=canvas.height=size;
    const c=canvas.getContext('2d'), height=document.createElement('canvas');height.width=height.height=size;
    const h=height.getContext('2d'), rough=document.createElement('canvas');rough.width=rough.height=size;
    const r=rough.getContext('2d');
    c.fillStyle=kind==='paper'?'#f7f2e9':kind==='rubber'?'#c84d39':'#d7ad78';c.fillRect(0,0,size,size);
    h.fillStyle='#808080';h.fillRect(0,0,size,size);r.fillStyle=kind==='paper'?'#efefef':'#dddddd';r.fillRect(0,0,size,size);
    const count=kind==='paper'?9200:kind==='rubber'?6400:3200;
    for(let i=0;i<count;i++) {
      const x=random()*size,y=random()*size,len=kind==='paper'?.4+random()*6:kind==='wood'?4+random()*80:.5+random()*2;
      const shade=random();c.strokeStyle=kind==='paper'?`rgba(119,103,77,${.035+shade*.12})`:kind==='rubber'?`rgba(76,24,18,${.035+shade*.16})`:`rgba(82,48,22,${.025+shade*.11})`;
      c.lineWidth=kind==='paper'?.35:.55;c.beginPath();c.moveTo(x,y);c.lineTo(x+len,y+random()*1.6);c.stroke();
      h.strokeStyle=shade>.6?'#969696':'#707070';h.lineWidth=.65;h.beginPath();h.moveTo(x,y);h.lineTo(x+len,y+random());h.stroke();
      r.fillStyle=shade>.5?'#ffffff':'#cacaca';r.fillRect(x,y,.7,len/3);
    }
    if(kind==='paper')for(let i=0;i<35;i++){c.fillStyle='rgba(95,79,53,.10)';c.beginPath();c.ellipse(random()*size,random()*size,.2+random(),.3+random(),random()*3,0,Math.PI*2);c.fill();}
    const maps=[canvas,height,rough].map((source,i)=>{const t=new T.CanvasTexture(source);if(i===0)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());resources.push(t);return t;});
    return {map:maps[0],bumpMap:maps[1],roughnessMap:maps[2]};
  }
  const paperMaps=texture('paper'),rubberMaps=texture('rubber'),woodMaps=texture('wood');
  const add=(m)=>{resources.push(m);return m;};
  const paper=add(new T.MeshStandardMaterial({color:'#ffffff',roughness:.94,bumpScale:.014,...paperMaps}));
  const rubber=add(new T.MeshStandardMaterial({color:'#ffffff',roughness:.89,bumpScale:.025,...rubberMaps}));
  const wood=add(new T.MeshStandardMaterial({color:'#ffffff',roughness:.79,bumpScale:.015,...woodMaps}));
  const acetate=add(new T.MeshPhysicalMaterial({color:'#fffdf7',transparent:true,opacity:.16,roughness:.19,metalness:0,ior:1.46,clearcoat:.75,clearcoatRoughness:.17,side:T.DoubleSide,depthWrite:false}));
  // Broad window and smaller cool card are reflected by acetate; they aren't painted on it.
  const studio=new T.Scene();studio.background=new T.Color('#aaa39a');
  const shapes=[];
  for(const [x,y,z,w,h,color,intensity] of [[-5,7,7,12,6,'#fffaf1',2.5],[9,3,4,3,9,'#e4ebee',1.15]]) {
    const g=new T.PlaneGeometry(w,h),m=new T.MeshBasicMaterial({color,side:T.DoubleSide});m.color.multiplyScalar(intensity);
    const plane=new T.Mesh(g,m);plane.position.set(x,y,z);plane.lookAt(0,0,0);studio.add(plane);shapes.push(g,m);
  }
  const pmrem=new T.PMREMGenerator(renderer),target=pmrem.fromScene(studio,.045,.1,80);pmrem.dispose();shapes.forEach(r=>r.dispose());
  resources.push(target);return {paper,rubber,wood,acetate,environment:target.texture};
}
