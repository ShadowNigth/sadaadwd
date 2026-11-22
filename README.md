# Counter-Strike Betas — Museo Wisk3D

> **Port completo de [Ch0wW/counterstrike-betas](https://github.com/Ch0wW/counterstrike-betas) a [Wisk3D / Whisk3D](https://github.com/Dante-Leoncini/Whisk3D-Editor)**

[![wisk3D](https://img.shields.io/badge/engine-wisk3D%20Core%203.1-orange)](https://github.com/Dante-Leoncini/Whisk3D-Core)
[![Three.js](https://img.shields.io/badge/render-WebGL2%20%2F%20Three.js-blue)](https://threejs.org)
[![Versiones](https://img.shields.io/badge/versiones-23%20(15%20preservadas)-green)](#)
[![HL](https://img.shields.io/badge/Half--Life-1.0.1.6%20→%201.1.1.0-amber)](#)

Museo interactivo 3D que preserva y reinterpreta las **23 versiones oficiales de Counter-Strike pre-1.6** (Beta 1.0 del 19 Jun 1999 → CS 1.5 del 12 Jun 2002) sobre la abstracción **Wisk3D/Whisk3D**: `w3dEngine` unificado sin OpenGL a la vista, materiales con cache por ruta, LOD + VIS por triángulo (`.w3dvis`), sondas de luz/reflejo, scripting Lua, audio OpenAL y física mínima.

![Museo](public/preview.png)

## ¿Qué incluye? — 100% del archivo original

Este port es **1:1** con el repositorio original. Nada se omite:

- **Todas las ramas**: `git fetch origin refs/heads/<branch>` — 15 preservadas + 6 faltantes marcadas `MISSING` (Beta 1.2, 6.2, 6.7, 6.8, + 6.5d/1.0b variantes) + 2 duplicadas retail.
- **Tablas originales**: fecha, Windows/Linux, HL recomendado, repo, descarga.
- **Changelogs textuales** de cada `README.md` por rama (`git show <branch>:README.md`).
- **Listado de archivos** por branch (`git ls-tree`) → panel “Ver archivos” (`.bsp`, `.wad`, `.dll`, `.so`, `pak0.pak`, `manual/`…).
- **Evolución de armas y mapas** derivada de los changelogs (24 armas, 38 mapas).

Las faltantes se honran como memoria (borde dashed, búsqueda “missing”).

## Modos Wisk3D

| Modo | Descripción |
|------|-------------|
| **Timeline** | Cronología completa 1999→2002 con filtros (beta/release/disponibles) y búsqueda |
| **Museo 3D** | Corredor de 23 salas en primera persona, pointer lock, LOD + frustum culling |
| **Laboratorio de Armas** | 24 armas con categoría, precio, munición, descripción y ruta Lua |
| **Mapas** | 38 BSP wireframe procedural (`cs_siege` → `de_piranesi`) |
| **Shooter Demo** | GoldSrc feel: AK/AWP/Deagle/M4, recarga, recoil, spread, decals, bots |
| **Comparador** | Diff lado a lado de cualquier par de versiones |

## Arquitectura Wisk3D — fiel a Whisk3D Core/Editor

```
src/engine/W3DEngine.ts  → w3dEngine::LoadTexture, DecodeImage, SetFog, SetBlending, etc.
src/engine/W3DMath.ts    → Vec3/Mat4/Quat (C puro)
src/engine/W3DScene.ts   → objects/ + graphics/ (prefabs copy-on-write, streaming, decals)
src/engine/W3DAudio.ts   → audio/ OpenAL → WebAudio
scripts/lua/*.lua        → scripting Lua (player, weapons, game_logic)
wisk.json + project.w3d  → contenedor single-file del Editor
docs/ARCHITECTURE.md     → detalle completo
```

El **juego compilado comparte el MISMO camino de render y el MISMO tick** que el Editor — aquí `requestAnimationFrame` → `update(dt)` → `render()`.

## Inicio rápido

```bash
npm install
npm run dev      # http://localhost:5173 — preview-safe (0.0.0.0)
npm run build
npm run preview
```

## Estructura

```
wisk.json          manifiesto Wisk3D (23 branches, hl_versions, renderer)
project.w3d        contenedor single-file (render, resources, scripts, physics)
src/data/catalog.ts  catálogo maestro (23 entradas)
src/data/weapons.ts  24 armas + timeline
src/data/maps.ts     38 mapas
src/engine/*         abstracción w3dEngine
scripts/lua/*        Lua fiel (ak47.lua, awp.lua, etc.)
res/               → LoadTexture paths (procedural fallback)
docs/              → ARCHITECTURE.md, WISK_PORT.md
tools/extract.ts   → validador de branches
```

## Créditos

- Archivo original: **Ch0wW** (Patreon/Ko-fi), `nirv` por el leak Beta 5.0, contribuidores `FUNDING.yml`.
- Motor: **Dante Leoncini** — [Whisk3D Editor](https://github.com/Dante-Leoncini/Whisk3D-Editor) / [Core](https://github.com/Dante-Leoncini/Whisk3D-Core).
- Port a Wisk3D: **ShadowNigth** para Arena.

## Licencia

Código del port MIT. Archivos del juego © Valve / Half-Life — solo preservación, extraídos sin modificación desde installers originales.

---

**ES:** ¿Tenés una Beta perdida (1.2, 6.2, 6.7, 6.8)? Abrí un issue en el repo original — el museo la integrará automáticamente.
