export interface Weapon {
  id: string;
  name: string;
  aka?: string;
  category: 'pistol'|'shotgun'|'smg'|'rifle'|'sniper'|'mg'|'grenade'|'equipment'|'knife';
  introduced: string; // version id
  introducedLabel: string;
  price: number | null;
  ammo: string;
  mag: number | string;
  wiskLua: string; // path al script lua
  description: string;
}

export const WEAPONS: Weapon[] = [
  { id:'knife', name:'Knife', category:'knife', introduced:'csbeta10', introducedLabel:'Beta 1.0', price:0, ammo:'—', mag:'—', wiskLua:'scripts/lua/weapons/knife.lua', description:'Cuchillo — agregado formalmente en Beta 3.0, secundaria en 7.0' },
  { id:'usp', name:'USP .45', category:'pistol', introduced:'csbeta10', introducedLabel:'Beta 1.0', price:400, ammo:'.45 ACP', mag:12, wiskLua:'scripts/lua/weapons/usp.lua', description:'Pistola CT base, silenciable desde Beta 2.0' },
  { id:'glock', name:'Glock 18', aka:'Glock 18 Select Fire', category:'pistol', introduced:'csbeta10', introducedLabel:'Beta 1.0', price:400, ammo:'9mm', mag:20, wiskLua:'scripts/lua/weapons/glock.lua', description:'Ráfaga de 3 — semi-auto en 1.1' },
  { id:'m3', name:'M3 Super 90', category:'shotgun', introduced:'csbeta10', introducedLabel:'Beta 1.0', price:1250, ammo:'12 gauge', mag:8, wiskLua:'scripts/lua/weapons/m3.lua', description:'Escopeta base' },
  { id:'m4a1', name:'M4A1', aka:'Colt M4A1', category:'rifle', introduced:'csbeta10', introducedLabel:'Beta 1.0', price:3100, ammo:'5.56mm', mag:30, wiskLua:'scripts/lua/weapons/m4a1.lua', description:'Con scope 2x en 1.0, silenciador en 2.0' },
  { id:'awp', name:'AWP', aka:'Arctic Warfare Magnum', category:'sniper', introduced:'csbeta10', introducedLabel:'Beta 1.0', price:4750, ammo:'.338 Magnum', mag:10, wiskLua:'scripts/lua/weapons/awp.lua', description:'Magnum — 1 shot kill' },
  { id:'mp5', name:'MP5-N', category:'smg', introduced:'csbeta10', introducedLabel:'Beta 1.0', price:1500, ammo:'9mm', mag:30, wiskLua:'scripts/lua/weapons/mp5.lua', description:'SMG estándar — rehecho en Beta 6.0' },
  { id:'p228', name:'P228', aka:'SIG P228', category:'pistol', introduced:'csbeta40', introducedLabel:'Beta 4.0', price:600, ammo:'9mm', mag:13, wiskLua:'scripts/lua/weapons/p228.lua', description:'Agregada en 4.0' },
  { id:'scout', name:'Scout', aka:'Steyr Scout', category:'sniper', introduced:'csbeta40', introducedLabel:'Beta 4.0', price:2750, ammo:'7.62mm', mag:10, wiskLua:'scripts/lua/weapons/scout.lua', description:'Sniper ligero 4.0' },
  { id:'he', name:'HE Grenade', category:'grenade', introduced:'csbeta40', introducedLabel:'Beta 4.0', price:300, ammo:'HE', mag:1, wiskLua:'scripts/lua/weapons/hegrenade.lua', description:'Alta explosiva' },
  { id:'flash', name:'Flashbang', category:'grenade', introduced:'csbeta30', introducedLabel:'Beta 3.0', price:200, ammo:'Flash', mag:1, wiskLua:'scripts/lua/weapons/flashbang.lua', description:'Concussion — fix wav en 4.0' },
  { id:'p90', name:'FN P90', category:'smg', introduced:'csbeta30', introducedLabel:'Beta 3.0', price:2350, ammo:'5.7mm', mag:50, wiskLua:'scripts/lua/weapons/p90.lua', description:'Nueva en 3.0' },
  { id:'ak47', name:'AK-47', category:'rifle', introduced:'csbeta20', introducedLabel:'Beta 2.0', price:2500, ammo:'7.62mm', mag:30, wiskLua:'scripts/lua/weapons/ak47.lua', description:'Precio ajustado en 2.1' },
  { id:'deagle', name:'Desert Eagle', category:'pistol', introduced:'csbeta20', introducedLabel:'Beta 2.0', price:650, ammo:'.50 AE', mag:7, wiskLua:'scripts/lua/weapons/deagle.lua', description:'Handcannon' },
  { id:'sg552', name:'SG552 Commando', category:'rifle', introduced:'csbeta20', introducedLabel:'Beta 2.0', price:3500, ammo:'5.56mm', mag:30, wiskLua:'scripts/lua/weapons/sg552.lua', description:'Con scope' },
  { id:'xm1014', name:'XM1014', aka:'Benelli XM1014', category:'shotgun', introduced:'csbeta50', introducedLabel:'Beta 5.0', price:3000, ammo:'12 gauge', mag:7, wiskLua:'scripts/lua/weapons/xm1014.lua', description:'Auto-shotgun 5.0' },
  { id:'mac10', name:'MAC-10', category:'smg', introduced:'csbeta60', introducedLabel:'Beta 6.0', price:1400, ammo:'.45 ACP', mag:30, wiskLua:'scripts/lua/weapons/mac10.lua', description:'Terror SMG' },
  { id:'aug', name:'Bullpup AUG', aka:'Steyr AUG', category:'rifle', introduced:'csbeta60', introducedLabel:'Beta 6.0', price:3500, ammo:'5.56mm', mag:30, wiskLua:'scripts/lua/weapons/aug.lua', description:'CT bullpup con scope' },
  { id:'elite', name:'Dual Elites', aka:'.40 Dual Elites', category:'pistol', introduced:'csbeta70', introducedLabel:'Beta 7.0', price:1000, ammo:'.40 S&W', mag:30, wiskLua:'scripts/lua/weapons/elite.lua', description:'Berettas duales 7.0' },
  { id:'m249', name:'M249 PARA', category:'mg', introduced:'csbeta10', introducedLabel:'Beta 1.0', price:5750, ammo:'5.56mm', mag:100, wiskLua:'scripts/lua/weapons/m249.lua', description:'Ametralladora ligera' },
  { id:'g3sg1', name:'G3/SG-1', category:'sniper', introduced:'csbeta10', introducedLabel:'Beta 1.0', price:5000, ammo:'7.62mm', mag:20, wiskLua:'scripts/lua/weapons/g3sg1.lua', description:'Auto-sniper' },
  { id:'tmp', name:'TMP', category:'smg', introduced:'csbeta60', introducedLabel:'Beta 6.0', price:1250, ammo:'9mm', mag:30, wiskLua:'scripts/lua/weapons/tmp.lua', description:'CT SMG' },
  { id:'sg550', name:'SG550', category:'sniper', introduced:'cs15', introducedLabel:'CS 1.5', price:4200, ammo:'5.56mm', mag:30, wiskLua:'scripts/lua/weapons/sg550.lua', description:'Última adición retail' },
  { id:'fiveseven', name:'Five-SeveN', category:'pistol', introduced:'cs15', introducedLabel:'CS 1.5', price:750, ammo:'5.7mm', mag:20, wiskLua:'scripts/lua/weapons/fiveseven.lua', description:'1.5' },
  { id:'ump45', name:'UMP45', category:'smg', introduced:'cs15', introducedLabel:'CS 1.5', price:1700, ammo:'.45 ACP', mag:25, wiskLua:'scripts/lua/weapons/ump45.lua', description:'1.5' },
];

export const WEAPON_TIMELINE = [
  { version:'Beta 1.0', count: 8, added:['USP','Glock','M3','M4A1','AWP','MP5','M249','G3SG1'] },
  { version:'Beta 1.1', count: 8, added:[] },
  { version:'Beta 2.0', count: 11, added:['AK-47','Deagle','SG552'] },
  { version:'Beta 3.0', count: 14, added:['Knife','P90','Flashbang (concussion)'] },
  { version:'Beta 4.0', count: 17, added:['P228','Scout','HE'] },
  { version:'Beta 5.0', count: 18, added:['XM1014'] },
  { version:'Beta 6.0', count: 20, added:['MAC10','AUG','TMP (formal)'] },
  { version:'Beta 7.0', count: 21, added:['Dual Elite'] },
  { version:'CS 1.5', count: 24, added:['SG550','Fiveseven','UMP45'] },
];
