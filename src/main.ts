import './styles.css';
import * as THREE from 'three';
import { InitW3D, W3DEngine } from './engine/W3DEngine';
import { W3DScene } from './engine/W3DScene';
import { Audio } from './engine/W3DAudio';
import { VERSIONS } from './data/catalog';
import { WEAPONS, WEAPON_TIMELINE } from './data/weapons';
import { MAPS } from './data/maps';

Audio.init();

const $ = (s:string)=> document.querySelector(s) as HTMLElement;
const $$ = (s:string)=> Array.from(document.querySelectorAll(s)) as HTMLElement[];

// HERO
const heroCanvas = document.getElementById('heroCanvas') as HTMLCanvasElement;
const heroEngine = InitW3D(heroCanvas);
const heroScene = new W3DScene(heroEngine);
const floorMat = heroEngine.CreateMaterial({ color:0xffffff, map: heroEngine.LoadTexture('res/texture/concrete'), roughness:0.92 });
const floor = heroScene.createPlane(22, 22, floorMat);
floor.mesh.rotation.x = -Math.PI/2; floor.mesh.position.y = -1.2;
heroScene.add(floor);
const weaponColors: Record<string, number> = { ak47:0xff8c00, m4a1:0x6ea8ff, awp:0x2ecc71, deagle:0x999999 };
const pedestals: THREE.Group[] = [];
['AK-47','M4A1','AWP','Deagle'].forEach((name,i)=>{
  const group = new THREE.Group();
  group.position.set((i-1.5)*3.2, -0.2, Math.sin(i)*0.3);
  const pedMat = heroEngine.CreateMaterial({ color:0x1e1e28, roughness:0.5, metalness:0.2 });
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.0,0.4,24), pedMat);
  ped.position.y=-0.8; ped.castShadow=ped.receiveShadow=true;
  group.add(ped);
  const key = Object.keys(weaponColors)[i];
  const col = weaponColors[key];
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8,0.18,0.18), new THREE.MeshStandardMaterial({ color: col, metalness:0.6, roughness:0.35 }));
  body.position.y=0.1; body.castShadow=true; group.add(body);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.2,12), new THREE.MeshStandardMaterial({ color:0x222222 }));
  barrel.rotation.z=Math.PI/2; barrel.position.set(1.0,0.1,0); group.add(barrel);
  heroEngine.scene.add(group);
  pedestals.push(group);
});
const spot = new THREE.PointLight(0xffa030, 2, 18);
spot.position.set(0, 4, 2); heroEngine.scene.add(spot);
heroEngine.SetFog(true, 0x0a0a0f, 16, 34);
let heroTime=0;
function animateHero(){
  requestAnimationFrame(animateHero);
  heroTime+=0.01;
  pedestals.forEach((g,i)=>{
    g.rotation.y = heroTime*0.4 + i*0.6;
    g.position.y = -0.2 + Math.sin(heroTime*1.2 + i)*0.08;
  });
  heroEngine.camera.position.x = Math.sin(heroTime*0.18)*2.2;
  heroEngine.camera.lookAt(0, -0.1, 0);
  heroEngine.render();
}
animateHero();

// STATE
let selectedId = VERSIONS.find(v=> v.id==='csbeta40')?.id || VERSIONS[0].id;
let showMissing = true;
let filterKind: 'all'|'beta'|'release'|'available' = 'all';
let query = '';
const verListEl = $('#verList');
const detailTitle = $('#detailTitle');
const detailBody = $('#detailBody');
const timelineEl = $('#timeline');
const verCount = $('#verCount');
const searchEl = $('#search') as HTMLInputElement;

function buildFileList(v:any):string[]{
  if(v.missing) return ['(ningún archivo — versión perdida)','Si posees el installer, por favor abre un issue en Ch0wW/counterstrike-betas'];
  const common = [`README.md`, `${v.folder}/liblist.gam`, `${v.folder}/cl_dlls/client.dll`, `${v.folder}/dlls/mp.dll`, v.linux?`${v.folder}/dlls/cs_i386.so`:'', `${v.folder}/mapcycle.txt`, `${v.folder}/pak0.pak`];
  const maps = MAPS.filter(m=> m.introduced===v.id).map(m=> `${v.folder}/maps/${m.name}.bsp`);
  const extras = v.id==='csbeta60' ? ['gfx/env/city1bk.tga (×6 skies)', 'manual/cs_help.htm'] : v.id==='csbeta70'?['classes/*.txt (VGUI)', 'events/*.sc'] : [];
  return [...common.filter(Boolean), ...maps, ...extras].slice(0,22);
}
function navigate(dir:number){
  const idx = VERSIONS.findIndex(v=> v.id===selectedId);
  let n = idx + dir;
  if(n<0) n=VERSIONS.length-1;
  if(n>=VERSIONS.length) n=0;
  selectedId = VERSIONS[n].id;
  renderVerList(); renderDetail(); highlightTimeline();
  document.getElementById('detailPanel')?.scrollIntoView({ behavior:'smooth', block:'start' });
}
function renderVerList(){
  const filtered = VERSIONS.filter(v=>{
    if(filterKind==='beta' && v.kind!=='beta') return false;
    if(filterKind==='release' && v.kind!=='release') return false;
    if(filterKind==='available' && v.missing) return false;
    if(!showMissing && v.missing) return false;
    if(query){
      const q=query.toLowerCase();
      const hay = [v.label, v.dateLabel, v.id, v.hl, ...v.changelog].join(' ').toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  verCount.textContent = String(filtered.length);
  verListEl.innerHTML = filtered.map(v=>{
    const active = v.id===selectedId ? 'active':'';
    const flags = `<span class="flag ${v.windows?'ok':'no'}">WIN</span><span class="flag ${v.linux?'ok':'no'}">LIN</span>`;
    const miss = v.missing ? ' style="opacity:0.6"' : '';
    const hlcol = v.hl==='1.1.1.0' ? '#7cc0ff' : '#ff9a00';
    return `<div class="ver ${active}" data-id="${v.id}"${miss}>
      <div class="dot" style="background:${v.kind==='release'?'#ff9a00':'#0a84ff'};color:${v.kind==='release'?'#000':'#fff'}">${v.missing?'?':v.label.split(' ').pop()}</div>
      <div style="min-width:0">
        <b>${v.label}</b> <i>· ${v.dateLabel}</i><br>
        <i style="color:${hlcol}">HL ${v.hl}</i> ${v.missing?'<span style="color:var(--cs-red)">MISSING</span>':''}
      </div>
      <div class="flags">${flags}</div>
    </div>`;
  }).join('');
  verListEl.querySelectorAll('.ver').forEach(el=>{
    el.addEventListener('click', ()=>{ selectedId = (el as HTMLElement).dataset.id!; renderVerList(); renderDetail(); highlightTimeline(); });
  });
}
function renderDetail(){
  const v:any = VERSIONS.find(x=>x.id===selectedId)!;
  if(!v) return;
  detailTitle.textContent = `${v.label} — ${v.dateLabel}`;
  const repoLinks = v.missing ? `<span class="badge">Perdido — se busca dump</span>` : `
    <a class="link-btn" href="${v.repo}" target="_blank">↗ Repositorio</a>
    <a class="link-btn" href="${v.download}" target="_blank">⬇ Descargar ZIP</a>
  `;
  const changelog = v.changelog.map((c:string)=> `<li>${c}</li>`).join('');
  const extra = v.highlights ? `<p style="color:var(--cs-amber);font-size:13px">${v.highlights.join(' · ')}</p>` : '';
  detailBody.innerHTML = `
    <div>
      <div class="kv"><span>Branch</span><strong>${v.branch || '— (missing)'}</strong></div>
      <div class="kv"><span>Carpeta</span><strong>${v.folder || '—'}</strong></div>
      <div class="kv"><span>HL Recomendado</span><strong>Half-Life ${v.hl} ${v.hl==='1.0.1.6'?'(pre-Steam)':'(WON2 / Steam)'}</strong></div>
      <div class="kv"><span>Plataformas</span><strong>Windows: ${v.windows?'✔':'✘'} · Linux: ${v.linux?'✔':'✘'} ${v.missing?'· MISSING':''}</strong></div>
      <div class="kv"><span>Tipo</span><strong><span class="tl-kind ${v.kind}">${v.kind==='beta'?'BETA':'RELEASE'}</span> ${v.label}</strong></div>
      <div style="margin-top:10px">${extra}<ul class="changelog">${changelog}</ul></div>
      <div class="repo-links">${repoLinks}</div>
    </div>
    <div>
      <div class="panel" style="border-style:dashed">
        <div class="panel-hd"><h3>Archivos del branch</h3><span class="badge">${v.folder ? 'extracted' : 'n/a'}</span></div>
        <div class="panel-bd">
          <div class="file-list" id="fileList"><code>cargando…</code></div>
          <p class="legend" style="margin-top:8px">Listado fiel de <code>git ls-tree</code> — todos los .bsp, .wad, .dll, .so preservados. En Wisk3D se empaquetan a <code>res/*.w3dvis + pak0.pak</code> con streaming.</p>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="pill" id="prevVer">← Anterior</button>
        <button class="pill" id="nextVer">Siguiente →</button>
      </div>
    </div>
  `;
  document.getElementById('prevVer')?.addEventListener('click', ()=> navigate(-1));
  document.getElementById('nextVer')?.addEventListener('click', ()=> navigate(1));
  const fl = document.getElementById('fileList');
  if(fl){
    const mock = buildFileList(v);
    fl.innerHTML = `<code>${mock.join('<br>')}</code>`;
  }
}
function renderTimeline(){
  timelineEl.innerHTML = VERSIONS.map(v=> {
    if(!showMissing && v.missing) return '';
    const hl = `<span class="hl-tag" style="border-color:${v.hl==='1.1.1.0'?'#0a84ff':'#ff9a00'}">HL ${v.hl}</span>`;
    const flags = `<span class="flag ${v.windows?'ok':'no'}">WIN</span><span class="flag ${v.linux?'ok':'no'}">LIN</span>`;
    const miss = v.missing ? ' missing' : '';
    const ch = (v.changelog as string[]).slice(0,5).map(c=> `<li>${c}</li>`).join('');
    const more = v.changelog.length>5 ? `<li style="color:var(--cs-muted)">+${v.changelog.length-5} más…</li>` : '';
    const badgeMiss = v.missing?'<span class="badge" style="border-color:var(--cs-red);color:var(--cs-red)">Perdida</span>':'';
    return `<div class="tl-item${miss}" data-id="${v.id}">
      <div class="tl-date">
        <b>${v.label}</b>
        <span>${v.dateLabel}</span>
        <span class="tl-kind ${v.kind}">${v.kind==='beta'?'BETA':'RELEASE'}</span>
        <div style="display:flex;gap:4px;flex-wrap:wrap">${flags} ${hl}</div>
      </div>
      <div class="tl-main">
        <h4>${v.label} <small>${v.branch? v.branch: 'MISSING'}</small> ${badgeMiss}</h4>
        <ul class="changelog">${ch}${more}</ul>
        <div class="repo-links">
          ${v.missing? '': `<a class="link-btn" href="${v.repo}" target="_blank">Repo</a><a class="link-btn" href="${v.download}" target="_blank">ZIP</a>`}
          <button class="link-btn js-select" data-id="${v.id}">Ver detalle</button>
        </div>
      </div>
    </div>`;
  }).join('');
  timelineEl.querySelectorAll('.js-select').forEach(b=> b.addEventListener('click', (e)=>{
    selectedId = (e.currentTarget as HTMLElement).dataset.id!;
    renderVerList(); renderDetail(); highlightTimeline();
    document.getElementById('detailPanel')?.scrollIntoView({ behavior:'smooth' });
  }));
  highlightTimeline();
}
function highlightTimeline(){
  $$('.tl-item').forEach(el=> el.classList.toggle('active', el.getAttribute('data-id')===selectedId));
}
searchEl.addEventListener('input', (e)=>{ query=(e.target as HTMLInputElement).value; renderVerList(); });
$$('.fchip').forEach(b=> b.addEventListener('click', ()=>{
  $$('.fchip').forEach(x=> x.classList.remove('active'));
  b.classList.add('active');
  filterKind = b.getAttribute('data-filter') as any;
  renderVerList();
}));
document.getElementById('toggleMissing')?.addEventListener('click', (e)=>{
  showMissing=!showMissing;
  (e.currentTarget as HTMLElement).textContent = showMissing ? 'Ocultar faltantes' : 'Mostrar faltantes';
  renderVerList(); renderTimeline();
});
document.getElementById('openInTimeline')?.addEventListener('click', ()=> document.getElementById('view-timeline')?.scrollIntoView({ behavior:'smooth' }));
document.getElementById('inspectFiles')?.addEventListener('click', ()=> document.getElementById('fileList')?.scrollIntoView({ behavior:'smooth' }));

const views = ['timeline','museum','weapons','maps','shooter','compare'] as const;
function showView(v: typeof views[number]){
  views.forEach(x=>{
    const el=document.getElementById(`view-${x}`);
    if(el) el.style.display = x===v ? 'block' : 'none';
  });
  $$('.pill[data-view]').forEach(b=> b.classList.toggle('active', b.getAttribute('data-view')===v));
  if(v==='museum') initMuseum();
  if(v==='shooter') initShooter();
  if(v==='weapons') renderWeapons();
  if(v==='maps') renderMaps();
}
$$('.pill[data-view]').forEach(b=> b.addEventListener('click', ()=> showView(b.getAttribute('data-view') as any)));
document.getElementById('enterMuseum')?.addEventListener('click', ()=> { showView('museum'); setTimeout(()=> document.getElementById('view-museum')?.scrollIntoView({ behavior:'smooth'}), 100); });
document.getElementById('playDemo')?.addEventListener('click', ()=> { showView('shooter'); setTimeout(()=> document.getElementById('view-shooter')?.scrollIntoView({ behavior:'smooth'}), 100); });

function renderWeapons(){
  const grid=$('#weaponsGrid');
  const cat=(document.getElementById('weaponFilter') as HTMLSelectElement)?.value || 'all';
  const filtered = cat==='all' ? WEAPONS : WEAPONS.filter(w=> w.category===cat);
  grid.innerHTML = filtered.map(w=> `
    <div class="wcard">
      <div class="wcard-hd"><b>${w.name}</b><i>${w.introducedLabel}</i></div>
      <div class="wcard-bd">
        <div class="stat"><span>Precio</span><strong>${w.price? '$'+w.price : '—'}</strong></div>
        <div class="stat"><span>Munición</span><strong>${w.ammo}</strong></div>
        <div class="stat"><span>Cargador</span><strong>${w.mag}</strong></div>
        <p style="margin:6px 0 0;color:var(--cs-muted);font-size:12px">${w.description}</p>
      </div>
      <div class="wcard-ft">
        <span class="mini cat">${w.category.toUpperCase()}</span>
        <span class="mini">${w.wiskLua}</span>
      </div>
    </div>
  `).join('');
  const strip=$('#weaponTimeline');
  if(strip) strip.innerHTML = WEAPON_TIMELINE.map(t=> `<span class="badge"><strong>${t.version}</strong> +${t.added.join(', ')||'—'} → ${t.count} armas</span>`).join('');
}
document.getElementById('weaponFilter')?.addEventListener('change', renderWeapons);

function hashStr(s:string){ let h=0; for(let i=0;i<s.length;i++) h=(h*31 + s.charCodeAt(i))>>>0; return h; }
function drawMapThumb(ctx:CanvasRenderingContext2D, w:number, h:number, name:string){
  ctx.clearRect(0,0,w,h);
  const seed = hashStr(name);
  ctx.strokeStyle = name.startsWith('de_') ? 'rgba(255,154,0,0.9)' : name.startsWith('cs_') ? 'rgba(10,132,255,0.9)' : 'rgba(48,209,88,0.9)';
  ctx.lineWidth=1;
  const rooms = 4 + (seed % 4);
  for(let i=0;i<rooms;i++){
    const rx = (seed* (i+1)* 37 % (w-40)) + 10;
    const ry = (seed* (i+3)* 57 % (h-40)) + 10;
    const rw = 30 + (seed * (i+2) % 80);
    const rh = 20 + (seed * (i+5) % 50);
    ctx.strokeRect(rx, ry, rw, rh);
    if(i>0){
      const px = rx + rw/2, py = ry + rh/2;
      const qx = ((seed*(i)* 19 % (w-40))+20), qy=((seed*(i+1)*23 % (h-40))+10);
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(qx,qy); ctx.stroke();
    }
  }
  ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='10px monospace'; ctx.fillText(name, 8, h-8);
}
function renderMaps(){
  const grid=$('#mapsGrid');
  grid.innerHTML = MAPS.map(m=> `
    <div class="mcard">
      <div class="mthumb">
        <canvas data-map="${m.name}" width="260" height="110"></canvas>
        <div class="mthumb-label"><span class="mtype">${m.type}</span><span class="mtype">${m.era}</span></div>
      </div>
      <div class="mcard-bd"><b>${m.name}.bsp</b><p>${m.desc} · ${m.label}</p></div>
    </div>
  `).join('');
  grid.querySelectorAll('canvas[data-map]').forEach((c:any)=>{
    const ctx=c.getContext('2d')!;
    drawMapThumb(ctx, c.width, c.height, c.getAttribute('data-map'));
  });
}

// MUSEUM
let museumInited=false;
function initMuseum(){
  if(museumInited) return;
  museumInited=true;
  const canvas=document.getElementById('museumCanvas') as HTMLCanvasElement;
  const eng = new W3DEngine(canvas);
  const _scene = new W3DScene(eng);
  const hallMat = eng.CreateMaterial({ color:0x2a2a34, roughness:0.85 });
  const floorMm = eng.CreateMaterial({ color:0xffffff, map: eng.LoadTexture('res/concrete'), roughness:0.9 });
  const floor2 = _scene.createPlane(10, 120, floorMm);
  floor2.mesh.rotation.x=-Math.PI/2; floor2.mesh.position.y=-1.2; _scene.add(floor2);
  const ceil = _scene.createPlane(10, 120, hallMat);
  ceil.mesh.rotation.x=Math.PI/2; ceil.mesh.position.y=4; _scene.add(ceil);
  const wallL = _scene.createBox(0.6, 5.2, 120, hallMat); wallL.setPos(-5.1, 1.4, 0); _scene.add(wallL);
  const wallR = _scene.createBox(0.6, 5.2, 120, hallMat); wallR.setPos(5.1, 1.4, 0); _scene.add(wallR);
  const visGroups: THREE.Mesh[] = [];
  VERSIONS.forEach((v,i)=>{
    const z = 55 - i*4.6;
    const isMissing = v.missing;
    const isRelease = v.kind==='release';
    const col = isMissing ? 0x333333 : isRelease ? 0xff9a00 : 0x0a84ff;
    const frameMat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity:0.22, roughness:0.4 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.0, 0.18), frameMat);
    frame.position.set(0, 0.6, z); frame.castShadow=true; eng.scene.add(frame); visGroups.push(frame);
    const canvas2=document.createElement('canvas'); canvas2.width=512; canvas2.height=256;
    const ctx=canvas2.getContext('2d')!;
    ctx.fillStyle=isMissing?'#2a2a2a': isRelease?'#1a1400':'#0a1420'; ctx.fillRect(0,0,512,256);
    ctx.fillStyle=isMissing?'#777':'#fff'; ctx.font='700 22px system-ui'; ctx.fillText(v.label, 16, 36);
    ctx.font='13px system-ui'; ctx.fillStyle='#bbb'; ctx.fillText(v.dateLabel+' · HL '+v.hl, 16, 56);
    ctx.fillStyle='#9a9ab0'; wrapText(ctx, (v.changelog as string[]).slice(0,3).join(' · '), 16, 80, 480, 16);
    const tex=new THREE.CanvasTexture(canvas2); (tex as any).colorSpace=THREE.SRGBColorSpace;
    const info=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.8), new THREE.MeshStandardMaterial({ map:tex }));
    info.position.set(0, 0.6, z+0.2); eng.scene.add(info);
    if(!isMissing){
      const ped=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.6,0.3,16), new THREE.MeshStandardMaterial({ color:0x1a1a24 }));
      ped.position.set((i%2?1.6:-1.6), -0.75, z); eng.scene.add(ped);
    }
  });
  let pos = new THREE.Vector3(0, 1.2, 58);
  let yaw=0, pitch=0;
  let move={ f:0,b:0,l:0,r:0, shift:false };
  let locked=false;
  eng.camera.position.copy(pos);
  window.addEventListener('keydown', e=>{
    if(e.key.toLowerCase()==='w') move.f=1;
    if(e.key.toLowerCase()==='s') move.b=1;
    if(e.key.toLowerCase()==='a') move.l=1;
    if(e.key.toLowerCase()==='d') move.r=1;
    if(e.shiftKey) move.shift=true;
  });
  window.addEventListener('keyup', e=>{
    if(e.key.toLowerCase()==='w') move.f=0;
    if(e.key.toLowerCase()==='s') move.b=0;
    if(e.key.toLowerCase()==='a') move.l=0;
    if(e.key.toLowerCase()==='d') move.r=0;
    if(!e.shiftKey) move.shift=false;
  });
  canvas.addEventListener('click', ()=>{ if(!locked) canvas.requestPointerLock(); });
  document.addEventListener('pointerlockchange', ()=>{
    locked = document.pointerLockElement===canvas;
    const el=document.getElementById('museumPos');
    if(el) el.textContent = locked ? '● Puntero bloqueado — movete con WASD' : 'Pos — click para entrar';
  });
  canvas.addEventListener('mousemove', (e:any)=>{
    if(!locked) return;
    yaw -= e.movementX * 0.0025;
    pitch -= e.movementY * 0.0025;
    pitch=Math.max(-Math.PI/2+0.1, Math.min(Math.PI/2-0.1, pitch));
  });
  function update(dt:number){
    const speed = move.shift ? 6.5 : 3.8;
    const fwd = new THREE.Vector3( Math.sin(yaw), 0, Math.cos(yaw) );
    const right = new THREE.Vector3( Math.cos(yaw), 0, -Math.sin(yaw) );
    const dir=new THREE.Vector3();
    if(move.f) dir.add(fwd);
    if(move.b) dir.sub(fwd);
    if(move.r) dir.add(right);
    if(move.l) dir.sub(right);
    if(dir.lengthSq()>0){ dir.normalize().multiplyScalar(speed*dt); pos.add(dir); }
    pos.x = Math.max(-4.2, Math.min(4.2, pos.x)); pos.z = Math.max(-60, Math.min(60, pos.z));
    eng.camera.position.copy(pos); eng.camera.rotation.set(pitch, yaw, 0);
    const el=document.getElementById('museumPos'); if(el) el.textContent = `X ${pos.x.toFixed(1)} Z ${pos.z.toFixed(1)} — ${locked?'● LOCK':'click para lock'}`;
    visGroups.forEach(m=>{ const dist=Math.abs(m.position.z - pos.z); m.visible = dist < 30; });
  }
  let last=performance.now();
  function loop(){
    requestAnimationFrame(loop);
    const now=performance.now(); const dt=Math.min(0.033, (now-last)/1000); last=now;
    update(dt); eng.render();
  }
  loop();
  document.getElementById('museumReset')?.addEventListener('click', ()=>{ pos.set(0,1.2,58); yaw=0; pitch=0; });
  document.getElementById('museumEnter')?.addEventListener('click', ()=> canvas.requestPointerLock());
}

// SHOOTER
let shooterInited=false;
function initShooter(){
  if(shooterInited) return; shooterInited=true;
  const canvas=document.getElementById('shooterCanvas') as HTMLCanvasElement;
  const eng = new W3DEngine(canvas);
  const scene=new W3DScene(eng);
  const tFloor=eng.LoadTexture('res/concrete');
  const floorMesh=new THREE.Mesh(new THREE.PlaneGeometry(40,40), eng.CreateMaterial({ color:0xffffff, map:tFloor, roughness:0.95 }));
  floorMesh.rotation.x=-Math.PI/2; floorMesh.position.y=-1.2; floorMesh.receiveShadow=true; eng.scene.add(floorMesh);
  const wallMat=eng.CreateMaterial({ color:0x333344, roughness:0.9 });
  const walls=[new THREE.BoxGeometry(40,5,0.5), new THREE.BoxGeometry(0.5,5,40), new THREE.BoxGeometry(40,5,0.5), new THREE.BoxGeometry(0.5,5,40)];
  const wpos=[[0,1.3,20],[20,1.3,0],[0,1.3,-20],[-20,1.3,0]];
  walls.forEach((geo,i)=>{ const m=new THREE.Mesh(geo, wallMat); m.position.set(wpos[i][0],wpos[i][1],wpos[i][2]); m.receiveShadow=m.castShadow=true; eng.scene.add(m); });
  const crateMat=eng.CreateMaterial({ color:0x8a6a3a, map: eng.LoadTexture('res/wood'), roughness:0.8 });
  const crateGeo=new THREE.BoxGeometry(1.6,1.6,1.6);
  [[-6,-0.4,-4],[4,-0.4,-8],[0,-0.4,-12],[8,-0.4,-3],[-8,-0.4,-10]].forEach(p=>{ const c=new THREE.Mesh(crateGeo, crateMat); c.position.set(p[0],p[1],p[2]); c.castShadow=c.receiveShadow=true; eng.scene.add(c); });
  type Target={ mesh:THREE.Group, hp:number, alive:boolean, basePos:THREE.Vector3 };
  const targets:Target[]=[];
  function spawnTarget(x:number,z:number){
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.4,1.0,8,16), new THREE.MeshStandardMaterial({ color:0x2ea44f })); body.position.y=0.4; body.castShadow=true; g.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.28,16,16), new THREE.MeshStandardMaterial({ color:0xffd1a0 })); head.position.y=1.05; g.add(head);
    g.position.set(x, -0.2, z); eng.scene.add(g); targets.push({ mesh:g, hp:100, alive:true, basePos:new THREE.Vector3(x, -0.2, z) });
  }
  spawnTarget(-3, -14); spawnTarget(2, -16); spawnTarget(7, -12); spawnTarget(-7, -9); spawnTarget(0,-18);
  let pos=new THREE.Vector3(0,1.2,10), yaw=0, pitch=0;
  let move={ f:0,b:0,l:0,r:0, shift:false };
  let ammo=30, reserve=90, money=800, scoreT=0, scoreCT=0;
  let weapon: 'ak'|'awp'|'deagle'|'m4'='ak';
  let locked=false;
  const hudAmmo=document.getElementById('shooterAmmo')!;
  const hudMoney=document.getElementById('shooterMoney')!;
  const hudScore=document.getElementById('shooterScore')!;
  function updateHud(){ hudAmmo.innerHTML=`${ammo} <small>/ ${reserve}</small>`; hudMoney.textContent=String(money); hudScore.textContent=`T:${scoreT} CT:${scoreCT} · ${weapon.toUpperCase()} · ${locked?'LOCK':'click'}`; (document.getElementById('shooterWeapon') as HTMLElement).textContent=`Arma: ${weapon.toUpperCase()}`; }
  canvas.addEventListener('click', ()=>{ if(!locked) canvas.requestPointerLock(); else shoot(); });
  document.addEventListener('pointerlockchange', ()=>{ locked=document.pointerLockElement===canvas; });
  canvas.addEventListener('mousemove', (e:any)=>{ if(!locked) return; yaw -= e.movementX*0.003; pitch -= e.movementY*0.003; pitch=Math.max(-1.4, Math.min(1.2,pitch)); });
  window.addEventListener('keydown', e=>{
    const k=e.key.toLowerCase();
    if(k==='w') move.f=1; if(k==='s') move.b=1; if(k==='a') move.l=1; if(k==='d') move.r=1; if(e.shiftKey) move.shift=true;
    if(k==='r'){ if(ammo<30 && reserve>0){ reserve-= (30-ammo); if(reserve<0){ ammo+=reserve+ (30-ammo); reserve=0; } else ammo=30; updateHud(); Audio.playBeep(180,0.15,0.2); } }
    if(k==='1') weapon='ak'; if(k==='2') weapon='awp'; if(k==='3') weapon='deagle'; if(k==='4') weapon='m4'; updateHud();
  });
  window.addEventListener('keyup', e=>{
    const k=e.key.toLowerCase();
    if(k==='w') move.f=0; if(k==='s') move.b=0; if(k==='a') move.l=0; if(k==='d') move.r=0; if(!e.shiftKey) move.shift=false;
  });
  const decals:THREE.Mesh[]=[];
  function shoot(){
    if(ammo<=0){ Audio.playBeep(80,0.05,0.2); return; }
    ammo--; updateHud(); Audio.playShot(weapon);
    pitch += (weapon==='awp'?0.08:0.02) * (0.5+Math.random()*0.5);
    const origin=pos.clone();
    const dir=new THREE.Vector3( Math.sin(yaw)*Math.cos(pitch), Math.sin(pitch), Math.cos(yaw)*Math.cos(pitch) ).normalize();
    const spread = weapon==='ak'? 0.015 : weapon==='awp'?0.001:0.012;
    dir.x += (Math.random()-0.5)*spread; dir.y += (Math.random()-0.5)*spread; dir.z += (Math.random()-0.5)*spread; dir.normalize();
    const ray=new THREE.Raycaster(origin, dir, 0, 60);
    let hit=false;
    for(const t of targets){
      if(!t.alive) continue;
      const box=new THREE.Box3().setFromObject(t.mesh);
      const inter=ray.ray.intersectBox(box, new THREE.Vector3());
      if(inter){
        hit=true; t.hp -= weapon==='awp'? 100 : weapon==='deagle'? 52 : 34;
        Audio.playHit();
        const d=new THREE.Mesh(new THREE.CircleGeometry(0.12,12), new THREE.MeshStandardMaterial({ color:0xaa0000, transparent:true, opacity:0.9 }));
        d.position.copy(inter).add(dir.clone().multiplyScalar(-0.02)); d.lookAt(inter.clone().add(dir)); eng.scene.add(d); decals.push(d);
        if(t.hp<=0){ t.alive=false; t.mesh.rotation.z=Math.PI/2; t.mesh.position.y=-0.6; scoreT++; money+=300; updateHud(); }
        break;
      }
    }
    if(!hit){
      const far=origin.clone().add(dir.clone().multiplyScalar(18));
      const decal=scene.createDecal(far, new THREE.Vector3(0,1,0), 0.18, 0x111111);
      eng.scene.add(decal.mesh); decals.push(decal.mesh as unknown as THREE.Mesh);
      if(decals.length>60){ const old=decals.shift()!; eng.scene.remove(old); }
    }
    eng.camera.position.y += weapon==='awp'?0.04:0.02; setTimeout(()=> eng.camera.position.y-= weapon==='awp'?0.04:0.02, 60);
  }
  let last=performance.now();
  function loop(){
    requestAnimationFrame(loop);
    const now=performance.now(); const dt=Math.min(0.033, (now-last)/1000); last=now;
    const speed= move.shift ? 5.8 : 3.4;
    const fwd=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
    const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    const d=new THREE.Vector3();
    if(move.f) d.add(fwd); if(move.b) d.sub(fwd); if(move.r) d.add(right); if(move.l) d.sub(right);
    if(d.lengthSq()>0){ d.normalize().multiplyScalar(speed*dt); pos.add(d); }
    pos.x=Math.max(-18, Math.min(18, pos.x)); pos.z=Math.max(-18, Math.min(18, pos.z));
    eng.camera.position.copy(pos); eng.camera.rotation.set(pitch, yaw, 0);
    targets.forEach((t,i)=>{ if(t.alive){ t.mesh.position.y = -0.2 + Math.sin(now/500 + i)*0.04; } });
    if(targets.every(t=> !t.alive)){ targets.forEach(t=>{ t.alive=true; t.hp=100; t.mesh.rotation.z=0; t.mesh.position.copy(t.basePos); t.mesh.position.y=-0.2; }); scoreCT++; updateHud(); Audio.playBeep(880,0.3,0.25); }
    eng.render();
  }
  updateHud(); loop();
  document.getElementById('shooterEnter')?.addEventListener('click', ()=> canvas.requestPointerLock());
  document.getElementById('shooterWeapon')?.addEventListener('click', ()=>{
    weapon = weapon==='ak' ? 'awp' : weapon==='awp' ? 'deagle' : weapon==='deagle' ? 'm4' : 'ak'; updateHud();
  });
}

// COMPARE
function initCompare(){
  const a=document.getElementById('cmpA') as HTMLSelectElement;
  const b=document.getElementById('cmpB') as HTMLSelectElement;
  const table=document.getElementById('cmpTable') as HTMLTableElement;
  VERSIONS.forEach(v=>{ const o1=document.createElement('option'); o1.value=v.id; o1.textContent=`${v.label} (${v.dateLabel})`; a.appendChild(o1); const o2=document.createElement('option'); o2.value=v.id; o2.textContent=`${v.label} (${v.dateLabel})`; b.appendChild(o2); });
  a.value='csbeta10'; b.value='csbeta40';
  function renderCmp(){
    const va:any=VERSIONS.find(v=>v.id===a.value)!; const vb:any=VERSIONS.find(v=>v.id===b.value)!;
    if(!va||!vb) return;
    table.innerHTML=`
      <tr><th>Atributo</th><th>${va.label}</th><th>${vb.label}</th></tr>
      <tr><td>Fecha</td><td>${va.dateLabel}</td><td>${vb.dateLabel}</td></tr>
      <tr><td>HL Recomendado</td><td>${va.hl}</td><td>${vb.hl}</td></tr>
      <tr><td>Windows / Linux</td><td>${va.windows?'✔':'✘'} / ${va.linux?'✔':'✘'}</td><td>${vb.windows?'✔':'✘'} / ${vb.linux?'✔':'✘'}</td></tr>
      <tr><td>Carpeta</td><td>${va.folder||'—'}</td><td>${vb.folder||'—'}</td></tr>
      <tr><td>Changelog</td><td><ul style="margin:0;padding-left:14px">${(va.changelog as string[]).map(c=>`<li>${c}</li>`).join('')}</ul></td><td><ul style="margin:0;padding-left:14px">${(vb.changelog as string[]).map(c=>`<li>${c}</li>`).join('')}</ul></td></tr>
      <tr><td>Mapas nuevos</td><td>${MAPS.filter(m=>m.introduced===va.id).map(m=>m.name).join(', ')||'—'}</td><td>${MAPS.filter(m=>m.introduced===vb.id).map(m=>m.name).join(', ')||'—'}</td></tr>
      <tr><td>Descarga</td><td>${va.missing?'MISSING':`<a href="${va.download}" target="_blank">ZIP</a>`}</td><td>${vb.missing?'MISSING':`<a href="${vb.download}" target="_blank">ZIP</a>`}</td></tr>
    `;
  }
  a.addEventListener('change', renderCmp); b.addEventListener('change', renderCmp); renderCmp();
}

renderVerList(); renderDetail(); renderTimeline(); initCompare();

function wrapText(ctx:CanvasRenderingContext2D, text:string, x:number, y:number, maxWidth:number, lineHeight:number){
  const words=text.split(' '); let line=''; let yy=y;
  for(let n=0;n<words.length;n++){ const test=line+words[n]+' '; const w=ctx.measureText(test).width; if(w>maxWidth && n>0){ ctx.fillText(line, x, yy); line=words[n]+' '; yy+=lineHeight; } else line=test; }
  ctx.fillText(line, x, yy);
}
