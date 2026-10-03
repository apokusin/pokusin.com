// Canvas-backed drum faces use the same slot choreography as the accessible clock.
export async function createFairMachinery(ctx, architecture, world, materials) {
  const T = ctx.THREE;
  const version = document.documentElement.dataset.artVersion || '1';
  const { reelPlan, reelPosition } = await import(`../reels.js?v=${version}`);
  const faces = [], ownedTextures = [];
  function face(surface, { ink = '#f2e5cc', font = 'Georgia', size = 310, width = 512, height = 448 } = {}) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const c = canvas.getContext('2d'), texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace; surface.material.map = texture; surface.material.needsUpdate = true;
    ownedTextures.push(texture);
    const item = { canvas, c, texture, ink, font, size, value: undefined, plans: [], start: 0, queued: null };
    faces.push(item); return item;
  }
  function draw(item, time) {
    const { c, canvas, plans } = item, width = canvas.width, height = canvas.height;
    c.clearRect(0, 0, width, height); c.fillStyle = item.ink;
    c.font = `${item.size}px ${item.font}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const cellWidth = width / item.value.length;
    for (let index = 0; index < item.value.length; index++) {
      c.save(); c.beginPath(); c.rect(index * cellWidth, 0, cellWidth, height); c.clip();
      const plan = plans[index], position = plan ? reelPosition(plan, (time - item.start) * 1000) : 0;
      const cells = plan ? plan.cells : [item.value[index]];
      const row = Math.floor(position);
      for (let n = Math.max(0, row); n <= Math.min(cells.length - 1, row + 1); n++) {
        c.fillText(cells[n], (index + .5) * cellWidth, height * .51 + (n - position) * height, cellWidth * .96);
      }
      c.restore();
    }
    item.texture.needsUpdate = true;
  }
  function set(item, value, time, spin = false, offset = 0) {
    value = String(value);
    if (item.plans.some(Boolean) && !spin && !ctx.reduced) { item.queued = value; return; }
    if (item.value === value && !spin) return;
    const previous = item.value?.slice(-value.length).padStart(value.length, '0');
    item.value = value; item.start = time; item.queued = null;
    item.plans = [...value].map((digit, index) => previous && /\d/.test(digit) && /\d/.test(previous[index]) && !ctx.reduced && (spin || previous[index] !== digit)
      ? reelPlan(previous[index], digit, { spin, direction: spin ? 1 : -1, index: offset + index }) : null);
    draw(item, time);
  }
  const clockFaces = architecture.clock.digitSurfaces.map(surface => face(surface));
  architecture.clock.unitSurfaces.forEach((surface, index) => {
    const item = face(surface, { font: 'Georgia', size: 100, width: 256, height: 128 });
    set(item, ['D', 'H', 'M', 'S'][index], 0);
  });
  const label = face(architecture.reset.labelSurface, { ink: '#263b40', font: 'Georgia', size: 190, height: 224 });
  set(label, 'Again', 0);
  const tally = face(architecture.reset.numberSurface, { ink: '#263b40', font: 'Georgia', size: 110, height: 144 });
  const paperCanvas=document.createElement('canvas');paperCanvas.width=384;paperCanvas.height=256;
  const pc=paperCanvas.getContext('2d'),paperTexture=new T.CanvasTexture(paperCanvas);paperTexture.colorSpace=T.SRGBColorSpace;ownedTextures.push(paperTexture);
  const paperGeometry=new T.PlaneGeometry(.52,.38,6,8);
  const ticket=new T.Mesh(paperGeometry,new T.MeshStandardMaterial({map:paperTexture,roughness:.9,side:T.DoubleSide}));
  ticket.position.set(0,.83,.73);ticket.visible=false;ticket.castShadow=true;architecture.reset.group.add(ticket);
  const paperRest=paperGeometry.attributes.position.array.slice();let ticketAt=-Infinity;
  const statusSurface=new T.Mesh(new T.PlaneGeometry(.80,.18),new T.MeshBasicMaterial({transparent:true,toneMapped:false}));
  statusSurface.position.set(0,1.00,.675);architecture.reset.group.add(statusSurface);
  const statusFace=face(statusSurface,{ink:'#d86b55',font:'Georgia',size:90,width:384,height:100});
  let spinNext = false;
  return {
    update(time) {
      const digits = ctx.getDigits().map(value => String(value).padStart(2, '0'));
      clockFaces.forEach((item, index) => set(item, digits[index], time, spinNext, index * 2));
      const count = document.getElementById('reset-count');
      set(tally, count?.dataset.reelValue || '0', time, spinNext, 8);
      if(spinNext&&!ctx.reduced){
        ticketAt=time;pc.fillStyle='#f2e5cc';pc.fillRect(0,0,384,256);pc.strokeStyle='#d86b55';pc.lineWidth=6;
        pc.beginPath();pc.arc(192,80,38,0,Math.PI*2);pc.stroke();pc.fillStyle='#263b40';pc.font='62px Georgia';pc.textAlign='center';pc.fillText(count?.dataset.reelValue||'0',192,198);
        paperTexture.needsUpdate=true;
      }
      const age=time-ticketAt;ticket.visible=!ctx.reduced&&age<1.35;
      if(ticket.visible){
        const amount=age<.3?1-Math.pow(1-age/.3,3):age<.55?1:Math.pow(Math.max(0,1-(age-.55)/.8),2);
        ticket.position.y=.83+amount*.94;ticket.rotation.z=-.12*amount;
        const attr=paperGeometry.attributes.position;
        for(let i=0;i<attr.count;i++){const y=paperRest[i*3+1];attr.setZ(i,.10*amount*Math.pow((y+.19)/.38,2));}
        attr.needsUpdate=true;paperGeometry.computeVertexNormals();ctx.wake();
      }
      const status=ctx.dom.status.textContent.trim();statusSurface.visible=!!status;
      if(status)set(statusFace,/breather|seconds/.test(status)?'Wait':'Offline',time);
      spinNext = false;
      for (const item of faces) if (item.plans.some(Boolean)) {
        if (ctx.reduced || (time - item.start) * 1000 >= Math.max(...item.plans.filter(Boolean).map(plan => plan.duration + plan.delay))) {
          item.plans = []; draw(item, time);
          if (item.queued !== null) set(item, item.queued, time);
        } else { draw(item, time); ctx.wake(); }
      }
    },
    spin() { spinNext = true; },
    dispose() { ownedTextures.forEach(texture => texture.dispose()); }
  };
}
