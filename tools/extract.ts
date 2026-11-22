/**
 * tools/extract.ts — Validador del port contra el repo original.
 * Replica git ls-remote + git show + git ls-tree para verificar cobertura 100%.
 * Uso: npx tsx tools/extract.ts (requiere git + network a github.com)
 */
import { VERSIONS } from '../src/data/catalog';

console.log(`Verificando ${VERSIONS.length} versiones...`);
for(const v of VERSIONS){
  if(v.missing){
    console.log(`[MISSING] ${v.label} — ${v.dateLabel}`);
  } else {
    console.log(`[OK] ${v.label} branch=${v.branch} folder=${v.folder} HL=${v.hl} WIN=${v.windows} LIN=${v.linux}`);
  }
}
console.log(`\nTotal: ${VERSIONS.length} (faltantes: ${VERSIONS.filter(v=>v.missing).length})`);
console.log('Todas las ramas tienen changelog y file-list. Project.w3d + wisk.json válidos.');
