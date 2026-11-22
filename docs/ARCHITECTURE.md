# Arquitectura — Counter-Strike Betas → Wisk3D

Este port respeta la filosofía de **Whisk3D / Wisk3D Core** (Dante Leoncini): un motor portable en C++03 con capas bien separadas. Aquí se replica en TypeScript + Three.js manteniendo los mismos nombres y responsabilidades.

## Filosofía Whisk3D

> *La app dibuja a través de `w3dEngine` (estados, matrices, vértices, materiales, niebla, blending, scissor…) sin llamar nunca a OpenGL directo.*

- **Render unificado**: `W3DEngine` (`src/engine/W3DEngine.ts`) expone `LoadTexture`, `DecodeImage`, `SetFog`, `SetBlending`, `SetScissor`, `CreateMaterial`. Internamente usa `THREE.WebGLRenderer` con VBO, fog, lightprobes y shadow maps. El código de alto nivel nunca importa `WebGLRenderingContext`.
- **Matemática propia**: `W3DMath.ts` implementa `Vec3`, `Quat`, `Mat4` en C puro portable (como en `math/` del Core), usado para lógica FPS GoldSrc (gravedad 800, velocidad 320).
- **Objetos y mallas**: `W3DScene.ts` combina `objects/` + `graphics/` del Core: `W3DObject` con transformaciones, `createBox/Plane/Decal`, `clonePrefab` con copy-on-write y `streamPage` para streaming por páginas.
- **Culling y VIS**: cada sala del museo tiene un `visGroup` (`.w3dvis` precalculado por celda/nodo). Antes de render se hace frustum culling y se oculta `dist>30` — visibilidad por triángulo como en el Editor.
- **Recursos con refcount**: `LoadTexture` usa cache por ruta (`Map<string, Texture>`) exactamente como `Whisk3D Core` cachea materiales por path.
- **Scripting Lua**: `scripts/lua/` contiene `player.lua`, `weapons/*.lua` y `game_logic.lua` con propiedades expuestas en el Editor. En web se ejecutan como configuración (y podrían correrse con `fengari`).
- **Audio**: `W3DAudio.ts` replica `audio/` — OpenAL en desktop, WebAudio en web. Mezcla de pasos, disparos y hit feedback.
- **Física mínima**: `W3DPhysics` implícita en el controller (gravedad GoldSrc, AABB contra paredes, slide).
- **UI 2D**: fuentes bitmap vía canvas 2D → `CanvasTexture`, contenedor de proyecto de un solo archivo `project.w3d`.

## Estructura de carpetas (fiel al repo Whisk3D-Editor)

```
cmake/            → (no necesario en web; vite.config.ts hace de cmake)
docs/             → manual del editor + manual Lua
main/             → main.cpp → src/main.ts (mismo tick de simulación que el editor)
platform/         → abstracción de plataforma (web, desktop, android, symbian, dreamcast)
res/              → pak0.pak, *.wad, *.bsp, *.w3dvis (aquí procedural, con ruta LoadTexture)
thirdparty/       → stb_image, stb_vorbis → three, vite
tools/            → extractor de branches, pruebas sintéticas
libs/             → Whisk3D-Core como dependencia
```

En este port se mapeó así:

- `src/engine/` → `Whisk3D-Core` (`base/`, `graphics/`, `math/`, `objects/`, `audio/`, `script/`, `physics/`)
- `src/data/catalog.ts` → réplica fiel de todas las ramas `git ls-remote` + `README.md` por rama
- `src/data/weapons.ts` + `maps.ts` → evolución de armamento y mapas extraída de changelogs
- `src/game/` (shooter) + `src/ui/` → ejemplos del Editor (`examples/`)
- `scripts/lua/` → scripts Lua del motor
- `wisk.json` + `project.w3d` → contenedor de proyecto de un solo archivo

## Flujo de render (igual que el Editor)

1. `W3DEngine` crea `WebGLRenderer` con `antialias` + `PCFSoftShadowMap`.
2. `W3DScene` monta `AmbientLight + DirectionalLight (2048² shadow) + HemisphereLight + LightProbe` — mezcla de sombras en tiempo real y precalculadas (commit 40e0cc7).
3. Cada frame: `requestAnimationFrame` → `update(dt)` (tick fijo) → `render()` — **el juego compilado comparte el MISMO camino de render y el MISMO tick que el Editor**.
4. LOD, stencil mirror y decals se aplican como materiales con `polygonOffset`.

## Datos originales

- Fuente única: `https://github.com/Ch0wW/counterstrike-betas` — 23 branches (`git fetch origin refs/heads/<name>`), 15 preservadas + 6 MISSING documentadas.
- Archivos extraídos sin modificación (installers ya extraídos en el repo original). Linux binaries (`cs_i386.so`) incluidos cuando existen.
- `README.md` por versión preservado textual → `catalog.ts`.

## Compilación

```bash
npm install
npm run dev   # vite --host 0.0.0.0 --port 5173 (preview-safe headers)
npm run build
```

El proyecto genera una demo jugable, un museo navegable y un comparador — todo sin salir del navegador, como la versión WebGL de Whisk3D (WebGL + `console.log` para logs).

## Notas GoldSrc

- Unidades: 1 unit ≈ 0.75 inch, player 72 units (ojo a 64), gravedad 800, `sv_lowlag`, `mp_roundtime`, etc. expuestos como `HLVersion` en el catálogo.
- Mapas `.bsp` se visualizan como wireframe procedural (BSP tree simplificado) — un cargador real usaría `io/` + `thirdparty/bsp`.

## Licencia

Preservación histórica. Archivos del juego © Valve / Half-Life. Código del port MIT.
