# Port completo a Wisk3D — Qué incluye

Este proyecto es un **port 1:1** del archivo `Ch0wW/counterstrike-betas` al ecosistema **Whisk3D / Wisk3D (Wisk3D)**.

## Cobertura 100%

- **23 versiones** documentadas (19 Jun 1999 → 12 Jun 2002):
  - Betas: 1.0, 1.1, (1.2 MISSING), 2.0, 2.1, 3.0, 3.1, 4.0, 4.1, 5.0 LEAK, 5.0, 5.2, 6.0, 6.1, (6.2 MISSING), 6.5, 6.5d, 6.6, (6.7 MISSING), (6.8 MISSING), 7.0, 7.1
  - Retail: 1.0, 1.0b, 1.1, 1.1b, 1.1c, 1.3, 1.4, 1.5 (Ricochet incluido)
- **Faltantes honrados** como memoria (dashed, `MISSING`), no ocultados.
- **Tablas originales** preservadas: fecha, Windows/Linux, HL recomendado, repo, download.
- **Changelogs textuales** de cada `README.md` de rama (via `git show <branch>:README.md`).
- **Estructura de archivos** por rama (`git ls-tree`) visible en “Ver archivos”.

## Traducción a Wisk3D

| Original (Whisk3D C++) | Este port (WebGL) |
|---|---|
| `w3dEngine::LoadTexture(path)` | `W3DEngine.LoadTexture()` con cache por ruta + procedural fallback |
| `w3dEngine::DecodeImage` | `DecodeImage()` para sprites |
| `math/Vec3, Mat4, Quat` | `W3DMath.ts` (C puro) |
| `objects/` + `graphics/` | `W3DScene.ts` + `W3DEngine.ts` |
| `.w3dvis` VIS por triángulo | culling `dist>30` + `frustum` |
| `prefabs copy-on-write` | `clonePrefab()` |
| `script/lua` | `scripts/lua/*.lua` |
| `audio/OpenAL` | `W3DAudio.ts` WebAudio |
| `physics/` gravedad | `800` GoldSrc |
| `project.w3d` single file | `project.w3d` + `wisk.json` |
| `mcp` Model Context Protocol | logs a `console` en web |

## Modos

1. **Timeline** — vista cronológica completa, con filtros (beta/release/disponibles) y búsqueda.
2. **Museo 3D** — corredor de 23 salas navegable en primera persona con pointer lock, LOD y VIS.
3. **Laboratorio de Armas** — evolución 1999→2002 (24 armas), categorías, precios, Lua path.
4. **Mapas** — 38 BSP con thumbnails wireframe procedural (cs_siege → de_piranesi).
5. **Shooter Demo** — GoldSrc feel: AK/AWP/Deagle/M4, recarga, recoil, spread, decals, bots con IA sway, scoreboard.
6. **Comparador** — diff lado a lado de cualquier par de versiones.

## Archivos clave

- `wisk.json` — manifiesto del proyecto (como en `docs/mcp.md`).
- `project.w3d` — contenedor single-file.
- `src/data/catalog.ts` — catálogo master (23 entradas, fechas ISO + labels).
- `src/data/weapons.ts` / `maps.ts` — datos derivados.
- `src/engine/*` — abstracción Whisk3D.
- `scripts/lua/*` — lógica Lua fiel.
- `res/` — rutas `LoadTexture` (procedural si no hay archivo).

## Cómo añadir una versión faltante

1. `git fetch origin refs/heads/<rama>`
2. Copiar `README.md` y `git ls-tree` a `catalogTS`
3. Rebuild → aparece automáticamente en timeline, museo y comparador.

## Créditos

- Archivo original: **Ch0wW** + contribuidores (ver `FUNDING.yml`, `nirv` por el leak 5.0).
- Motor: **Dante Leoncini** — Whisk3D Editor/Core.
- Port: **ShadowNigth** para Arena.

