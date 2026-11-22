/**
 * Wisk3D Core — w3dEngine abstraction
 * Réplica TypeScript de la API unificada que oculta OpenGL/Vulkan/WebGL.
 * En C++: w3dEngine::LoadTexture, DecodeImage, estados de render, etc.
 * Aquí: wrapper sobre Three.js que expone la misma filosofía.
 */
import * as THREE from 'three';

export interface W3DTextureOpts {
  filter?: 'linear'|'nearest';
  wrap?: 'repeat'|'clamp';
  mipmaps?: boolean;
}

export class W3DEngine {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  // Estado interno como en w3dEngine C++
  private _fogEnabled = false;
  private _blending: string = 'opaque';
  private cache = new Map<string, THREE.Texture>();

  constructor(public canvas: HTMLCanvasElement, public opts: { antialias?: boolean } = {}){
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: opts.antialias ?? true, alpha:false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a0f, 60, 220);
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
    this.camera.position.set(0, 1.7, 8);
    this.onResize();
    window.addEventListener('resize', ()=> this.onResize());
  }

  onResize(){
    const w = this.canvas.clientWidth || this.canvas.parentElement?.clientWidth || 800;
    const h = this.canvas.clientHeight || this.canvas.parentElement?.clientHeight || 600;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w/h;
    this.camera.updateProjectionMatrix();
  }

  // --- API fiel a Whisk3D ---
  // w3dEngine::LoadTexture(path, filter, mipmaps) — carga con stb en PC, ICL en Symbian, aquí fetch+TextureLoader
  LoadTexture(path: string, opts: W3DTextureOpts = {}): THREE.Texture {
    if(this.cache.has(path)) return this.cache.get(path)!;
    // Procedural fallback: si no existe archivo, genera textura checker
    const tex = this.createProcedural(path, opts);
    this.cache.set(path, tex);
    // Intento real async (no bloquea)
    new THREE.TextureLoader().load(path,
      t=>{ t.colorSpace=THREE.SRGBColorSpace; if(opts.filter==='nearest'){ t.magFilter=t.minFilter=THREE.NearestFilter; } this.cache.set(path,t); },
      undefined,
      ()=>{} // ignore error, keep procedural
    );
    return tex;
  }

  // w3dEngine::DecodeImage — pixeles RGBA crudos (sprites, etc.)
  DecodeImage(w:number, h:number, generator:(x:number,y:number)=>[number,number,number,number]): THREE.DataTexture {
    const data = new Uint8Array(w*h*4);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const c=generator(x,y);
      const i=(y*w+x)*4;
      data[i]=c[0]; data[i+1]=c[1]; data[i+2]=c[2]; data[i+3]=c[3];
    }
    const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
    tex.needsUpdate=true; tex.colorSpace=THREE.SRGBColorSpace; return tex;
  }

  // Estados de render — sin OpenGL a la vista
  SetFog(enabled:boolean, color=0x0a0a0f, near=60, far=220){
    this._fogEnabled=enabled;
    if(enabled) this.scene.fog = new THREE.Fog(color, near, far);
    else this.scene.fog = null as any;
  }
  SetBlending(mode:'opaque'|'alpha'|'additive'){
    this._blending=mode;
  }
  SetScissor(x:number,y:number,w:number,h:number){
    this.renderer.setScissor(x,y,w,h); this.renderer.setScissorTest(true);
  }
  ClearScissor(){ this.renderer.setScissorTest(false); }

  // Materiales — refcount por ruta (cache) como en Whisk3D Core
  CreateMaterial(opts:{ color?:number, map?:THREE.Texture, metalness?:number, roughness?:number, transparent?:boolean, opacity?:number, wireframe?:boolean }){
    return new THREE.MeshStandardMaterial({
      color: opts.color ?? 0xffffff,
      map: opts.map,
      metalness: opts.metalness ?? 0.1,
      roughness: opts.roughness ?? 0.8,
      transparent: opts.transparent ?? false,
      opacity: opts.opacity ?? 1,
      wireframe: opts.wireframe ?? false,
    });
  }

  // Log estilo printf (archivo en desktop/Symbian, console en WebGL)
  Log(tag:string, fmt:string, ...args:any[]){
    // @ts-ignore
    console.log(`[w3d::${tag}] ${fmt}`, ...args);
  }

  render(){
    this.renderer.render(this.scene, this.camera);
  }

  dispose(){
    this.renderer.dispose();
  }

  private createProcedural(path:string, opts:W3DTextureOpts){
    const isCon = path.includes('concrete') || path.includes('cstrike');
    const size=256;
    const data=new Uint8Array(size*size*3);
    for(let y=0;y<size;y++) for(let x=0;x<size;x++){
      const checker = ((x>>5)&1) ^ ((y>>5)&1);
      const noise = (Math.sin(x*0.08)+Math.cos(y*0.07))*8;
      const base = isCon ? 88 : 45;
      const v = Math.max(0, Math.min(255, base + checker*22 + noise));
      const i=(y*size+x)*3;
      if(path.includes('metal')){ data[i]=v*0.7; data[i+1]=v*0.75; data[i+2]=v+10; }
      else if(path.includes('wood')){ data[i]=v*0.9+20; data[i+1]=v*0.5+10; data[i+2]=v*0.3; }
      else { data[i]=v; data[i+1]=v; data[i+2]=v+5; }
    }
    const tex=new THREE.DataTexture(data, size,size, THREE.RGBAFormat);
    tex.needsUpdate=true; tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
    if(opts.filter==='nearest'){ tex.magFilter=tex.minFilter=THREE.NearestFilter; }
    return tex as unknown as THREE.Texture;
  }
}

// Singleton helpers — como en Whisk3D Core
export let W3D: W3DEngine | null = null;
export function InitW3D(canvas: HTMLCanvasElement){
  W3D = new W3DEngine(canvas);
  return W3D;
}
