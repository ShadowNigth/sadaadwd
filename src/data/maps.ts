export interface MapInfo {
  name: string; // bsp
  introduced: string;
  label: string;
  type: 'cs'|'de'|'as'|'es';
  desc: string;
  era: string;
}

export const MAPS: MapInfo[] = [
  { name:'cs_siege', introduced:'csbeta10', label:'Beta 1.0', type:'cs', desc:'Clásico original — APC en 7.1', era:'1999-06' },
  { name:'cs_mansion', introduced:'csbeta10', label:'Beta 1.0', type:'cs', desc:'Mansión — eliminada en 2.0, vuelve en 3.0', era:'1999-06' },
  { name:'cs_prison', introduced:'csbeta10', label:'Beta 1.0', type:'cs', desc:'Prison.WAD', era:'1999-06' },
  { name:'cs_wpndepot', introduced:'csbeta10', label:'Beta 1.0', type:'cs', desc:'Depósito de armas', era:'1999-06' },
  { name:'cs_assault', introduced:'csbeta11', label:'Beta 1.1', type:'cs', desc:'Warehouse — re-trabajado en 2.1', era:'1999-06' },
  { name:'cs_desert', introduced:'csbeta11', label:'Beta 1.1', type:'cs', desc:'Precursor de Dust', era:'1999-06' },
  { name:'cs_bunker', introduced:'csbeta20', label:'Beta 2.0', type:'cs', desc:'Bunker', era:'1999-08' },
  { name:'cs_docks', introduced:'csbeta20', label:'Beta 2.0', type:'cs', desc:'Docks', era:'1999-08' },
  { name:'cs_facility', introduced:'csbeta20', label:'Beta 2.0', type:'cs', desc:'Facility', era:'1999-08' },
  { name:'cs_alley1', introduced:'csbeta20', label:'Beta 2.0', type:'cs', desc:'Alley1 — telefrag fix en 2.1', era:'1999-08' },
  { name:'cs_zoption', introduced:'csbeta20', label:'Beta 2.0', type:'cs', desc:'Zoption', era:'1999-08' },
  { name:'cs_tire', introduced:'csbeta30', label:'Beta 3.0', type:'cs', desc:'Tire', era:'1999-09' },
  { name:'cs_militia', introduced:'csbeta30', label:'Beta 3.0', type:'cs', desc:'Militia — clásico', era:'1999-09' },
  { name:'cs_hideout', introduced:'csbeta30', label:'Beta 3.0', type:'cs', desc:'Hideout', era:'1999-09' },
  { name:'cs_ship', introduced:'csbeta30', label:'Beta 3.0', type:'cs', desc:'Ship — rescue points en 4.0', era:'1999-09' },
  { name:'cs_station', introduced:'csbeta40', label:'Beta 4.0', type:'cs', desc:'Estación — luego cs_estate', era:'1999-11' },
  { name:'de_dust', introduced:'csbeta40', label:'Beta 4.0', type:'de', desc:'¡DE_DUST nace!', era:'1999-11' },
  { name:'de_nuke', introduced:'csbeta40', label:'Beta 4.0', type:'de', desc:'Nuke — interior nuclear', era:'1999-11' },
  { name:'de_prodigy', introduced:'csbeta40', label:'Beta 4.0', type:'de', desc:'Prodigy', era:'1999-11' },
  { name:'cs_backalley', introduced:'csbeta50', label:'Beta 5.0', type:'cs', desc:'Backalley', era:'1999-12' },
  { name:'de_train', introduced:'csbeta50', label:'Beta 5.0', type:'de', desc:'Train — yardas ferroviarias', era:'1999-12' },
  { name:'cs_iraq', introduced:'csbeta50', label:'Beta 5.0', type:'cs', desc:'CS_Iraq', era:'1999-12' },
  { name:'de_fang', introduced:'csbeta60', label:'Beta 6.0', type:'de', desc:'Fang', era:'2000-03' },
  { name:'cs_747', introduced:'csbeta60', label:'Beta 6.0', type:'cs', desc:'Avión 747 secuestrado', era:'2000-03' },
  { name:'as_oilrig', introduced:'csbeta60', label:'Beta 6.0', type:'as', desc:'Assassination: Oil Rig', era:'2000-03' },
  { name:'as_riverside', introduced:'csbeta60', label:'Beta 6.0', type:'as', desc:'Assassination: Riverside', era:'2000-03' },
  { name:'es_jail', introduced:'csbeta60', label:'Beta 6.0', type:'es', desc:'Escape: Jail', era:'2000-03' },
  { name:'es_frantic', introduced:'csbeta60', label:'Beta 6.0', type:'es', desc:'Escape: Frantic', era:'2000-03' },
  { name:'cs_office', introduced:'csbeta70', label:'Beta 7.0', type:'cs', desc:'¡Office — el más jugado!', era:'2000-08' },
  { name:'de_aztec', introduced:'csbeta70', label:'Beta 7.0', type:'de', desc:'Aztec — ruinas', era:'2000-08' },
  { name:'de_vegas', introduced:'csbeta70', label:'Beta 7.0', type:'de', desc:'Vegas — fix crash en 7.1', era:'2000-08' },
  { name:'cs_arabstreets', introduced:'csbeta70', label:'Beta 7.0', type:'cs', desc:'Arab Streets', era:'2000-08' },
  { name:'as_highrise', introduced:'csbeta70', label:'Beta 7.0', type:'as', desc:'Highrise', era:'2000-08' },
  { name:'de_jeepathon', introduced:'csbeta70', label:'Beta 7.0', type:'de', desc:'Jeepathon — test vehículos', era:'2000-08' },
  { name:'de_piranesi', introduced:'cs15', label:'CS 1.5', type:'de', desc:'Piranesi — último oficial GoldSrc', era:'2002-06' },
  { name:'de_cbble', introduced:'csbeta70', label:'Beta 7.0', type:'de', desc:'Cobble', era:'2000-08' },
  { name:'de_storm', introduced:'cs15', label:'CS 1.5', type:'de', desc:'Storm', era:'2002-06' },
  { name:'cs_havana', introduced:'cs15', label:'CS 1.5', type:'cs', desc:'Havana', era:'2002-06' },
  { name:'cs_chateau', introduced:'cs15', label:'CS 1.5', type:'cs', desc:'Chateau', era:'2002-06' },
];
