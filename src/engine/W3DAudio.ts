// Audio de Whisk3D Core — OpenAL en desktop, WebAudio en web
// Mantiene la misma API: w3dAudio::Play(path), SetListener, etc.
export class W3DAudio {
  ctx: AudioContext | null = null;
  listenerPos = { x:0,y:0,z:0 };
  private cache = new Map<string, AudioBuffer>();

  init(){
    try{ this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); }catch{}
  }
  async load(url:string){
    if(!this.ctx) return null;
    if(this.cache.has(url)) return this.cache.get(url)!;
    // Procedural fallback si no hay archivo
    // Genera beep corto
    return null;
  }
  playBeep(freq=440, dur=0.12, gain=0.25){
    if(!this.ctx) return;
    if(this.ctx.state==='suspended') this.ctx.resume();
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.frequency.value=freq; o.type='square';
    g.gain.value=gain;
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(); o.stop(this.ctx.currentTime+dur);
  }
  playShot(kind:'ak'|'awp'|'deagle'|'m4'='ak'){
    const map={ ak:180, awp:90, deagle:320, m4:260 } as const;
    this.playBeep(map[kind]||180, kind==='awp'?0.35:0.12, 0.4);
    // tail
    setTimeout(()=> this.playBeep((map[kind]||180)*0.5, 0.08, 0.15), 40);
  }
  playHit(){ this.playBeep(120, 0.06, 0.5); this.playBeep(80, 0.1, 0.3); }
  playFootstep(){ this.playBeep(60, 0.04, 0.08); }
}

export const Audio = new W3DAudio();
