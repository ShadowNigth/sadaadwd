// Wisk3D Math — réplica de math/ de Whisk3D Core (C++03 portado a TS)
// Vectores, matrices 4x4 y cuaterniones — C puro compatible PC/retro

export class Vec3 {
  constructor(public x=0, public y=0, public z=0) {}
  static from(o:{x:number,y:number,z:number}){ return new Vec3(o.x,o.y,o.z); }
  add(v:Vec3){ return new Vec3(this.x+v.x, this.y+v.y, this.z+v.z); }
  sub(v:Vec3){ return new Vec3(this.x-v.x, this.y-v.y, this.z-v.z); }
  mul(s:number){ return new Vec3(this.x*s, this.y*s, this.z*s); }
  dot(v:Vec3){ return this.x*v.x+this.y*v.y+this.z*v.z; }
  cross(v:Vec3){ return new Vec3(this.y*v.z - this.z*v.y, this.z*v.x - this.x*v.z, this.x*v.y - this.y*v.x); }
  len(){ return Math.hypot(this.x,this.y,this.z); }
  norm(){ const l=this.len(); return l>0? this.mul(1/l): new Vec3(); }
  lerp(v:Vec3,t:number){ return new Vec3(this.x+(v.x-this.x)*t, this.y+(v.y-this.y)*t, this.z+(v.z-this.z)*t); }
  toArray(){ return [this.x,this.y,this.z] as const; }
}

export class Quat {
  constructor(public x=0, public y=0, public z=0, public w=1) {}
  static fromAxisAngle(axis:Vec3, ang:number){
    const h=ang/2, s=Math.sin(h);
    return new Quat(axis.x*s, axis.y*s, axis.z*s, Math.cos(h));
  }
  mul(q:Quat){
    return new Quat(
      this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y,
      this.w*q.y - this.x*q.z + this.y*q.w + this.z*q.x,
      this.w*q.z + this.x*q.y - this.y*q.x + this.z*q.w,
      this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z
    );
  }
  norm(){ const l=Math.hypot(this.x,this.y,this.z,this.w); return new Quat(this.x/l,this.y/l,this.z/l,this.w/l); }
}

export class Mat4 {
  m: Float32Array;
  constructor(m?: number[]){
    this.m = new Float32Array(m ?? [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  }
  static identity(){ return new Mat4(); }
  static translate(v:Vec3){
    return new Mat4([1,0,0,0, 0,1,0,0, 0,0,1,0, v.x,v.y,v.z,1]);
  }
  static scale(v:Vec3){
    return new Mat4([v.x,0,0,0, 0,v.y,0,0, 0,0,v.z,0, 0,0,0,1]);
  }
  static rotateY(a:number){
    const c=Math.cos(a), s=Math.sin(a);
    return new Mat4([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
  }
  static perspective(fov:number, aspect:number, near:number, far:number){
    const f=1/Math.tan(fov/2), nf=1/(near-far);
    return new Mat4([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf, -1, 0,0,2*far*near*nf,0]);
  }
  mul(b:Mat4){
    const a=this.m, bm=b.m, r=new Float32Array(16);
    for(let i=0;i<4;i++) for(let j=0;j<4;j++){
      r[i*4+j]= a[i*4+0]*bm[0*4+j] + a[i*4+1]*bm[1*4+j] + a[i*4+2]*bm[2*4+j] + a[i*4+3]*bm[3*4+j];
    }
    return new Mat4(Array.from(r));
  }
  toThreeArray(){ // column-major for Three
    return this.m;
  }
}

// GoldSrc units helpers
export const GOLDSRC = {
  // 1 unit ~ 0.75 inch; player height 72 units
  playerHeight: 72,
  playerEye: 64,
  gravity: 800,
  maxSpeed: 320,
};
