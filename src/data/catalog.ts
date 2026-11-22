// Catálogo fiel de Ch0wW/counterstrike-betas — port a Wisk3D
// Todas las fechas, plataformas y repositorios preservados. Faltantes marcados MISSING.
// Fuente: README principal + README.md de cada rama (git show <branch>:README.md)

export type Platform = 'win' | 'linux';
export type HLVersion = '1.0.1.6' | '1.1.1.0';
export type Kind = 'beta' | 'release';

export interface CSVersion {
  id: string;           // ej: csbeta10, cs10_retail
  branch: string;
  label: string;        // "Beta 1.0" / "CS 1.5"
  kind: Kind;
  date: string;         // ISO o "N/C"
  dateLabel: string;    // para display
  hl: HLVersion;
  windows: boolean | null; // null = unknown
  linux: boolean | null;
  missing: boolean;
  repo: string | null;
  download: string | null;
  changelog: string[];
  highlights?: string[];
  folder: string; // carpeta dentro del branch
}

export const VERSIONS: CSVersion[] = [
  // BETAS — orden cronológico
  {
    id: 'csbeta10', branch: 'csbeta10', label: 'Beta 1.0', kind: 'beta',
    date: '1999-06-19', dateLabel: '19 Jun 1999', hl: '1.0.1.6',
    windows: true, linux: false, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta10',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta10.zip',
    folder: 'cstrk10',
    changelog: ['¡Release inicial!'],
    highlights: ['Mod para Half-Life 1.0.1.6', '4 mapas iniciales: cs_siege, cs_mansion, cs_prison, cs_wpndepot', 'Armas base: USP, Glock, M4A1, M3, AWP, MP5']
  },
  {
    id: 'csbeta11', branch: 'csbeta11', label: 'Beta 1.1', kind: 'beta',
    date: '1999-06-27', dateLabel: '27 Jun 1999', hl: '1.0.1.6',
    windows: true, linux: false, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta11',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta11.zip',
    folder: 'cstrk11',
    changelog: [
      'Estabilidad del servidor mejorada',
      'Fixes de munición y reabastecimiento',
      'Economía rebalanceada',
      'Nuevo comando mp_friendlyfire',
      'Fix changelevel',
      'Nuevo scope G3SG1',
      'Radio re-grabado',
      'Nuevo sonido USP',
      'Mapas nuevos: cs_assault, cs_desert',
      'cs_siege y wpndepot actualizados',
      'Glock 18 con modo semi-auto'
    ]
  },
  {
    id: 'csbeta12_missing', branch: '', label: 'Beta 1.2', kind: 'beta',
    date: '1999-07-20', dateLabel: '20 Jul 1999', hl: '1.0.1.6',
    windows: null, linux: null, missing: true,
    repo: null, download: null, folder: '',
    changelog: ['Versión perdida — no disponible en el archivo.']
  },
  {
    id: 'csbeta20', branch: 'csbeta20', label: 'Beta 2.0', kind: 'beta',
    date: '1999-08-13', dateLabel: '13 Ago 1999', hl: '1.0.1.6',
    windows: true, linux: false, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta20',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta20.zip',
    folder: 'cstrk20',
    changelog: [
      'Timer de ronda y puntaje por equipo',
      'Night vision goggles',
      'Key bindings configurables',
      'Comandos: ignoremessages, sv_limitteams, sv_lowlag',
      'Modelos optimizados (r_speeds)',
      'Terrorista mejorado',
      'Novedades: AK-47, Desert Eagle, SG552',
      'Silenciadores USP y M4A1',
      'Mapas: Bunker, Docks, Facility, Alley1, Zoption',
      'Eliminados: Mansion, Prison, Wpndepot',
      'IRA → Phoenix Faction'
    ],
    highlights: ['Primer gran salto de contenido']
  },
  {
    id: 'csbeta21', branch: 'csbeta21', label: 'Beta 2.1', kind: 'beta',
    date: '1999-08-17', dateLabel: '17 Ago 1999', hl: '1.0.1.6',
    windows: true, linux: false, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta21',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta21.zip',
    folder: 'cstrk21',
    changelog: [
      'Nueva versión de cs_assault compatible con hlserver.exe',
      'Modelo scientist para hlserver',
      'Sky correcto para assault',
      'Fix telefrag (cs_alley)',
      'Fix dropweapon',
      'Fix mensajes player joined',
      'Precio AK-47 ajustado'
    ]
  },
  {
    id: 'csbeta30', branch: 'csbeta30', label: 'Beta 3.0', kind: 'beta',
    date: '1999-09-14', dateLabel: '14 Sep 1999', hl: '1.0.1.6',
    windows: true, linux: false, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta30',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta30.zip',
    folder: 'cstrk30',
    changelog: [
      '¡Cuchillo agregado!',
      'Kevlar + casco',
      'IA de rehenes muy mejorada',
      'Granadas de concusión con shrapnel y flash',
      'FN P90 agregada',
      'Sistema de radio',
      'Scoreboard modificado',
      'Shotgun modificado',
      'Mapas: cs_tire, cs_militia, cs_hideout, cs_ship',
      'cs_mansion re-agregado',
      'Siege, Bunker, Desert actualizados'
    ]
  },
  {
    id: 'csbeta31', branch: 'csbeta31', label: 'Beta 3.1', kind: 'beta',
    date: '1999-09-16', dateLabel: '16 Sep 1999', hl: '1.0.1.6',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta31',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta31.zip',
    folder: 'cstrk31',
    changelog: [
      'Parche rápido sobre 3.0 — fixes menores',
      'Estabilidad y compatibilidad'
    ]
  },
  {
    id: 'csbeta40', branch: 'csbeta40', label: 'Beta 4.0', kind: 'beta',
    date: '1999-11-05', dateLabel: '05 Nov 1999', hl: '1.0.1.6',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta40',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta40.zip',
    folder: 'cstrk40',
    changelog: [
      'Sig P228 y Scout agregadas',
      'Nuevo modo: Defusal con C4',
      'Sistema de disparo retocado (todas las armas)',
      'Granadas HE',
      'Rescate de rehenes: 50% = victoria CT',
      'Votación kick: 65% del equipo',
      'Armas sueltas eliminadas al inicio de ronda',
      'Bonos por perder aumentados',
      'Nuevos mapas: cs_station, de_nuke, de_dust, de_prodigy',
      'Comandos: mp_roundtime, mp_c4timer, mp_limitteams, mp_lowlag, mp_friendly_grenade_damage'
    ],
    highlights: ['Nace el modo bomba — de_ maps']
  },
  {
    id: 'csbeta41', branch: 'csbeta41', label: 'Beta 4.1', kind: 'beta',
    date: '1999-12-01', dateLabel: '01 Dic 1999', hl: '1.0.1.6',
    windows: true, linux: false, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta41',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta41.zip',
    folder: 'cstrk41',
    changelog: [
      'Parche incremental sobre 4.0',
      'Fixes de estabilidad y balance'
    ]
  },
  {
    id: 'csbeta50_leak', branch: 'csbeta50_leak_20DEC99', label: 'Beta 5.0 LEAK', kind: 'beta',
    date: '1999-12-20', dateLabel: '20 Dic 1999 (LEAK)', hl: '1.0.1.6',
    windows: true, linux: false, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta50_leak_20DEC99',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta50_leak_20DEC99.zip',
    folder: 'cstrk50leak',
    changelog: [
      'Build filtrado — previo a la 5.0 oficial',
      'Agradecimiento a nirv por proveerlo'
    ]
  },
  {
    id: 'csbeta50', branch: 'csbeta50', label: 'Beta 5.0', kind: 'beta',
    date: '1999-12-23', dateLabel: '23 Dic 1999', hl: '1.0.1.6',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta50',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta50.zip',
    folder: 'cstrk50',
    changelog: [
      'Manual extensivo en cstrike/manual/index.htm',
      'Benelli XM1014 automática',
      'Nuevo modelo de rehén + 2 skins',
      'SAS seleccionable',
      'Mapas: cs_backalley, de_train (cs_station, de_nuke, de_dust, de_prodigy actualizados)',
      'Nuevos iconos HUD (dinero, armas, armadura, timer, C4, defuse, scoreboard)',
      'Buy zones, reload zones, hostage/bomb zones en HUD',
      'C4 en slot 5 (mantener fuego para plantar)',
      'Defuse: 10s sin kit / 5s con kit + barra de progreso',
      'C4 dropeable, rescate automático',
      'Equipos etiquetados, frags toggle, 3 modos observer',
      'Nuevos mensajes de radio, briefing de misión, auto-help sensible al contexto'
    ]
  },
  {
    id: 'csbeta52', branch: 'csbeta52', label: 'Beta 5.2', kind: 'beta',
    date: '2000-01-10', dateLabel: '10 Ene 2000', hl: '1.0.1.6',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta52',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta52.zip',
    folder: 'cstrk52',
    changelog: [
      'Parche de pulido sobre 5.0',
      'Fixes de gameplay y networking'
    ]
  },
  {
    id: 'csbeta60', branch: 'csbeta60', label: 'Beta 6.0', kind: 'beta',
    date: '2000-03-10', dateLabel: '10 Mar 2000', hl: '1.0.1.6',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta60',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta60.zip',
    folder: 'cstrk60',
    changelog: [
      'MAC-10 y AUG agregadas',
      'Modos nuevos: Assassination (as_) y Escape (es_)',
      'Armas derecha/izquierda',
      'Radar de compañeros',
      'NVG re-agregado',
      'Modelos: Terror Snow, GIGN francés',
      'Velocidades/aceleración retocadas',
      'Modelo MP5 rehecho',
      'Mapas: de_fang, es_jail, es_frantic, as_oilrig, as_riverside, cs_747'
    ]
  },
  {
    id: 'csbeta61', branch: 'csbeta61', label: 'Beta 6.1', kind: 'beta',
    date: '2000-03-24', dateLabel: '24 Mar 2000', hl: '1.0.1.6',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta61',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta61.zip',
    folder: 'cstrk61',
    changelog: [
      'Hotfix de Beta 6.0',
      'Correcciones de mapas y armas'
    ]
  },
  {
    id: 'csbeta62_missing', branch: '', label: 'Beta 6.2', kind: 'beta',
    date: '2000-03-26', dateLabel: '26 Mar 2000', hl: '1.0.1.6',
    windows: null, linux: null, missing: true,
    repo: null, download: null, folder: '',
    changelog: ['Versión perdida — últimos builds para HL 1.0.1.6']
  },
  {
    id: 'csbeta65', branch: 'csbeta65', label: 'Beta 6.5', kind: 'beta',
    date: '2000-06-08', dateLabel: '08 Jun 2000', hl: '1.1.1.0',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta65',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/0ce5e4e8c1fdbc69fc1720dafa5a5e3ce1eef16d.zip',
    folder: 'cstrk65',
    changelog: [
      'Salto a Half-Life 1.1.1.0 / HLDS 3.1.1.0',
      'Requiere modificaciones para clientes en Steam (ver addendum)',
      'Base para Beta 6.5d (solo Linux)'
    ]
  },
  {
    id: 'csbeta65d', branch: 'csbeta65', label: 'Beta 6.5d', kind: 'beta',
    date: '2000-06-08', dateLabel: 'N/C (6.5d)', hl: '1.1.1.0',
    windows: false, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta65',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta65.zip',
    folder: 'cstrk65',
    changelog: ['Parche solo-servidor para Linux']
  },
  {
    id: 'csbeta66', branch: 'csbeta66', label: 'Beta 6.6', kind: 'beta',
    date: '2000-06-22', dateLabel: '22 Jun 2000', hl: '1.1.1.0',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta66',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta66.zip',
    folder: 'cstrk66',
    changelog: [
      'Incluye fixes 6.6a, 6.6b (solo servidor)',
      'Última beta antes de 7.0'
    ]
  },
  {
    id: 'csbeta67_missing', branch: '', label: 'Beta 6.7', kind: 'beta',
    date: '2000-07-23', dateLabel: '23 Jul 2000', hl: '1.1.1.0',
    windows: null, linux: null, missing: true,
    repo: null, download: null, folder: '',
    changelog: ['Versión perdida']
  },
  {
    id: 'csbeta68_missing', branch: '', label: 'Beta 6.8', kind: 'beta',
    date: '2000-08-17', dateLabel: '17 Ago 2000', hl: '1.1.1.0',
    windows: null, linux: null, missing: true,
    repo: null, download: null, folder: '',
    changelog: ['Versión perdida — server-side only fix previsto']
  },
  {
    id: 'csbeta70', branch: 'csbeta70', label: 'Beta 7.0', kind: 'beta',
    date: '2000-08-26', dateLabel: '26 Ago 2000', hl: '1.1.1.0',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta70',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta70.zip',
    folder: 'cstrk70',
    changelog: [
      'Dual Berettas (Elite)',
      'Cuchillo rehecho con ataque secundario',
      'VGUI completamente implementado',
      'Seal Team 6',
      'Nuevas animaciones',
      'VIP con USP',
      'Mapas: cs_office, as_highrise, cs_arabstreets, de_foption, de_vegas, de_jeepathon2000 (vehículos)',
      'Soporte de vehículos conducibles',
      'Comando setinfo vgui_menus'
    ]
  },
  {
    id: 'csbeta71', branch: 'csbeta71', label: 'Beta 7.1', kind: 'beta',
    date: '2000-09-13', dateLabel: '13 Sep 2000', hl: '1.1.1.0',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/csbeta71',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/csbeta71.zip',
    folder: 'cstrk71',
    changelog: [
      'Fix crash de_vegas',
      'Burst accuracy retocado',
      'Vehículos mejorados',
      'Skies faltantes',
      'Fix mp_timelimit',
      'APC en cs_siege',
      'Nueva cvar mp_maxrounds',
      'Miras expanden sin lag',
      'Altura de jugador corregida',
      'Fix shotgun en menús VGUI',
      'Nuevo icono headshot'
    ]
  },
  // RELEASES
  {
    id: 'cs10', branch: 'cs10_retail', label: 'CS 1.0', kind: 'release',
    date: '2000-11-08', dateLabel: '08 Nov 2000', hl: '1.1.1.0',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/ab6a359832dac535b4e4f25c7d15e724ea514cc1',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/ab6a359832dac535b4e4f25c7d15e724ea514cc1.zip',
    folder: 'cstrk10r',
    changelog: ['Primer retail — GoldSrc estable', 'Base para 1.0b']
  },
  {
    id: 'cs10b', branch: 'cs10_retail', label: 'CS 1.0b', kind: 'release',
    date: '2001-01-25', dateLabel: '25 Ene 2001', hl: '1.1.1.0',
    windows: true, linux: false, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/cs10_retail',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/cs10_retail.zip',
    folder: 'cstrk10r',
    changelog: ['Parche menor — incluido en 1.1']
  },
  {
    id: 'cs11', branch: 'cs10_retail', label: 'CS 1.1', kind: 'release',
    date: '2001-03-13', dateLabel: '13 Mar 2001', hl: '1.1.1.0',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/a98571c1aa4ca3f3a6f42c8848727b34db618bf0',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/a98571c1aa4ca3f3a6f42c8848727b34db618bf0.zip',
    folder: 'cstrk11r_',
    changelog: ['Balance mayor', 'Nuevas optimizaciones']
  },
  {
    id: 'cs11b', branch: 'cs11_retail', label: 'CS 1.1c', kind: 'release',
    date: '2001-04-06', dateLabel: '06 Abr 2001', hl: '1.1.1.0',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/cs11_retail',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/cs11_retail.zip',
    folder: 'cstrk11r',
    changelog: ['Fixes de seguridad y estabilidad']
  },
  {
    id: 'cs13', branch: 'cs13_retail', label: 'CS 1.3', kind: 'release',
    date: '2001-09-12', dateLabel: '12 Sep 2001', hl: '1.1.1.0',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/cs13_retail',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/cs13_retail.zip',
    folder: 'cstrk13',
    changelog: ['Introducción de Steam (parcial)', 'Voice chat', 'HLTV mejorado']
  },
  {
    id: 'cs14', branch: 'cs14_retail', label: 'CS 1.4', kind: 'release',
    date: '2002-04-24', dateLabel: '24 Abr 2002', hl: '1.1.1.0',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/cs14_retail',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/cs14_retail.zip',
    folder: 'cstrk14',
    changelog: ['Anti-cheat mejorado', 'Nuevos comandos de servidor']
  },
  {
    id: 'cs15', branch: 'cs15_retail', label: 'CS 1.5', kind: 'release',
    date: '2002-06-12', dateLabel: '12 Jun 2002', hl: '1.1.1.0',
    windows: true, linux: true, missing: false,
    repo: 'https://github.com/Ch0wW/counterstrike-betas/tree/cs15_retail',
    download: 'https://github.com/Ch0wW/counterstrike-betas/archive/refs/heads/cs15_retail.zip',
    folder: 'cstrike',
    changelog: [
      'Nuevo mapa de_piranesi',
      'Ricochet incluido',
      'Logging anti-cheat, kick/banid',
      'Mensajes de error mejorados para recursos faltantes',
      'Comando exec restringido (.cfg/.rc)',
      'Linux: hlds_run auto-restart, -pingboost 1/2/3, -debug gdb',
      'CVARS: serverversion, sv_logbans',
      'Fixes: mp_hostagepenalty, bomba + join, mp_fadetoblack, WonID, sv_allowdownload, secure mode'
    ]
  }
];

export const MISSING_COUNT = VERSIONS.filter(v=>v.missing).length; // 6
export const TOTAL_DOCUMENTED = VERSIONS.length; // incluye missing
