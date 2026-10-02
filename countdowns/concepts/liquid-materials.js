// Small, authored material library for the wax canyon and cyanotype shoreline.
// No photographs, clock values or archive artwork are baked into these maps.
export function createLiquidMaterials(ctx, kind) {
  const T=ctx.THREE, size=256, pixels=new Uint8Array(size*size*4),diffusePixels=new Uint8Array(size*size*4);
  const fract=n=>n-Math.floor(n);
  const hash=(x,y)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453);
  const smooth=n=>n*n*(3-2*n);
  function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=smooth(fract(x)),fy=smooth(fract(y));
    return (hash(ix,iy)*(1-fx)+hash(ix+1,iy)*fx)*(1-fy)+(hash(ix,iy+1)*(1-fx)+hash(ix+1,iy+1)*fx)*fy;}
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const broad=noise(x/35,y/35), pores=hash(x,y), fine=noise(x/5,y/5);
    const flow=.5+.5*Math.sin(y*.21+noise(x/42,y/53)*4);
    const v=kind==='wax'?.79+broad*.12+fine*.06+pores*.03:.72+broad*.14+fine*.08+pores*.06;
    const p=(y*size+x)*4;
    pixels[p]=Math.round(v*255);pixels[p+1]=Math.round((kind==='wax'?.44+flow*.30:.81+fine*.13)*255);
    pixels[p+2]=Math.round((kind==='wax'?.70+broad*.25:.78+pores*.20)*255);pixels[p+3]=255;
    const soot=kind==='wax'?(pores<.011?.46:1):(pores<.011?.87:1);
    const grain=(.84+broad*.11+fine*.05)*soot;
    diffusePixels[p]=Math.round(grain*255);diffusePixels[p+1]=Math.round(grain*252);diffusePixels[p+2]=Math.round(grain*243);diffusePixels[p+3]=255;
  }
  const packed=new T.DataTexture(pixels,size,size);packed.wrapS=packed.wrapT=T.RepeatWrapping;
  packed.minFilter=T.LinearMipmapLinearFilter;packed.magFilter=T.LinearFilter;packed.generateMipmaps=true;packed.needsUpdate=true;
  const bump=new T.DataTexture(pixels.slice(),size,size);bump.wrapS=bump.wrapT=T.RepeatWrapping;
  bump.minFilter=T.LinearMipmapLinearFilter;bump.generateMipmaps=true;bump.needsUpdate=true;
  const diffuse=new T.DataTexture(diffusePixels,size,size);diffuse.colorSpace=T.SRGBColorSpace;diffuse.wrapS=diffuse.wrapT=T.RepeatWrapping;
  diffuse.minFilter=T.LinearMipmapLinearFilter;diffuse.generateMipmaps=true;diffuse.needsUpdate=true;
  // A broad warm window and a cool sky hemisphere create meaningful wet-edge reflections.
  const w=128,h=64,environmentPixels=new Float32Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const u=x/w,v=y/h,sky=Math.max(0,1-v*1.4),window=Math.exp(-((u-.22)**2/.003+(v-.35)**2/.028));
    const rim=Math.exp(-((u-.77)**2/.006+(v-.43)**2/.10)),p=(y*w+x)*4;
    const base=kind==='wax'?[.11+sky*.14,.065+sky*.12,.09+sky*.20]:[.30+sky*.46,.42+sky*.53,.61+sky*.46];
    environmentPixels[p]=base[0]+window*(kind==='wax'?4.2:1.2)+rim*.10;
    environmentPixels[p+1]=base[1]+window*(kind==='wax'?1.65:1.15)+rim*.36;
    environmentPixels[p+2]=base[2]+window*(kind==='wax'?.42:1.03)+rim*.67;environmentPixels[p+3]=1;
  }
  const environment=new T.DataTexture(environmentPixels,w,h,T.RGBAFormat,T.FloatType);
  environment.mapping=T.EquirectangularReflectionMapping;environment.needsUpdate=true;
  const pmrem=new T.PMREMGenerator(ctx.renderer),environmentTarget=pmrem.fromEquirectangular(environment);
  ctx.scene.environment=environmentTarget.texture;ctx.scene.environmentIntensity=kind==='wax'?.45:.55;
  pmrem.dispose();environment.dispose();
  const wax=new T.MeshPhysicalMaterial({color:0xf1d7b0,map:diffuse,roughness:.78,roughnessMap:packed,bumpMap:bump,bumpScale:.09,
    clearcoat:.12,clearcoatRoughness:.50,metalness:0,envMapIntensity:.65});
  wax.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
      `float waxEdge=pow(1.0-abs(normal.z),2.0);float waxThin=.35+.65*texture2D(roughnessMap,vRoughnessMapUv).b;
       outgoingLight+=vec3(1.0,.30,.045)*waxEdge*waxThin*.17;
       #include <opaque_fragment>`);
  };wax.customProgramCacheKey=()=> 'liquid-wax-edge-v1';
  const molten=new T.MeshPhysicalMaterial({color:0xf3d5a5,roughness:.20,bumpMap:bump,bumpScale:.022,clearcoat:1,clearcoatRoughness:.14,envMapIntensity:1.25});
  const chalk=new T.MeshStandardMaterial({color:0xece9d9,map:diffuse,roughness:.89,roughnessMap:packed,bumpMap:bump,bumpScale:.14,envMapIntensity:.2});
  const paper=new T.MeshStandardMaterial({color:0xeeeede,map:diffuse,roughness:.94,bumpMap:bump,bumpScale:.018,side:T.DoubleSide});
  const sand=new T.MeshStandardMaterial({color:0xe0e3d6,map:diffuse,roughness:1,roughnessMap:packed,bumpMap:bump,bumpScale:.12});
  const shell=new T.MeshPhysicalMaterial({color:0xbe5634,roughness:.46,bumpMap:bump,bumpScale:.023,clearcoat:.28,clearcoatRoughness:.43});
  return {wax,molten,chalk,paper,sand,shell,packed,bump,diffuse,
    dispose(){if(ctx.scene.environment===environmentTarget.texture)ctx.scene.environment=null;environmentTarget.dispose();}
  };
}
