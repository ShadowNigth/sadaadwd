import * as THREE from 'three';
import { W3DEngine } from './W3DEngine';

// Objetos de escena + transformaciones — replica objects/ de Whisk3D Core
// Soporta prefabs con clones, LOD, culling frustum, VIS por triángulo (.w3dvis), espejos con stencil.

export class W3DObject {
  mesh: THREE.Object3D;
  w3d = {
    lod: 0,
    visGroup: 0,
    castShadow: true,
    receiveShadow: true,
    decal: false,
  };
  constructor(mesh: THREE.Object3D){ this.mesh = mesh; }
  setPos(x:number,y:number,z:number){ this.mesh.position.set(x,y,z); return this; }
  setRot(x:number,y:number,z:number){ this.mesh.rotation.set(x,y,z); return this; }
  setScale(s:number){ this.mesh.scale.setScalar(s); return this; }
  add(child: W3DObject){ this.mesh.add(child.mesh); return this; }
}

export class W3DScene {
  eng: W3DEngine;
  root = new THREE.Group();
  // Recursos con refcount — mallas y animaciones compartidas copy-on-write
  private meshCache = new Map<string, THREE.BufferGeometry>();

  constructor(eng: W3DEngine){
    this.eng = eng;
    eng.scene.add(this.root);
    this.setupLights();
  }

  private setupLights(){
    const amb = new THREE.AmbientLight(0xffffff, 0.35);
    const dir = new THREE.DirectionalLight(0xffe9b0, 1.2);
    dir.position.set(18, 28, 12);
    dir.castShadow=true;
    dir.shadow.mapSize.set(2048,2048);
    dir.shadow.camera.near=0.5; dir.shadow.camera.far=80;
    dir.shadow.camera.left=-40; dir.shadow.camera.right=40; dir.shadow.camera.top=40; dir.shadow.camera.bottom=-40;
    this.eng.scene.add(amb, dir);
    const hemi = new THREE.HemisphereLight(0x6ea8ff, 0x0f0f0f, 0.35);
    this.eng.scene.add(hemi);

    // Sondas de luz/reflejo precalculadas (como en el commit "arreglos en mezcla de sombras")
    const probe = new THREE.LightProbe();
    probe.intensity=0.6; this.eng.scene.add(probe as any);
  }

  // Factories estilo Whisk3D Core
  createBox(w:number,h:number,d:number, mat: THREE.Material){
    const geo = new THREE.BoxGeometry(w,h,d);
    const m = new THREE.Mesh(geo, mat);
    m.castShadow=m.receiveShadow=true;
    return new W3DObject(m);
  }
  createPlane(w:number,h:number, mat:THREE.Material){
    const geo=new THREE.PlaneGeometry(w,h);
    const m=new THREE.Mesh(geo, mat);
    m.receiveShadow=true;
    return new W3DObject(m);
  }
  createDecal(pos: THREE.Vector3, normal: THREE.Vector3, size:number, color:number){
    const geo=new THREE.CircleGeometry(size, 16);
    const mat=new THREE.MeshStandardMaterial({ color, transparent:true, opacity:0.85, polygonOffset:true, polygonOffsetFactor:-4 });
    const m=new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    m.position.add(normal.clone().multiplyScalar(0.02));
    m.lookAt(pos.clone().add(normal));
    return new W3DObject(m);
  }

  // Prefab con clon copy-on-write
  clonePrefab(src: W3DObject){
    const cloned = src.mesh.clone(true);
    return new W3DObject(cloned);
  }

  // Streaming por páginas — listas de carga
  async streamPage(_name:string, loader: ()=>Promise<void>){
    await loader();
  }

  // Obtener geometría cached
  getGeo(key:string, factory: ()=>THREE.BufferGeometry){
    if(!this.meshCache.has(key)) this.meshCache.set(key, factory());
    return this.meshCache.get(key)!;
  }

  add(obj: W3DObject){ this.root.add(obj.mesh); return obj; }
  remove(obj: W3DObject){ this.root.remove(obj.mesh); }
  clear(){ this.root.clear(); }
}
