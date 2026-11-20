# Infección — prototipo Godot 4

Primer prototipo **offline**, inspirado en CS 1.5 y los mods de infección. No es un port completo de Counter-Strike. Incluye una arena de prueba, movimiento FPS, disparos, recarga, 7 bots sencillos y rondas de infección. Si te infectan, pasás al equipo zombi y atacás cuerpo a cuerpo; al terminar la ronda, empieza otra. Las colisiones de los mapas son de doble cara y, si un personaje cae por un hueco, vuelve a su última posición segura.

## Ejecutar

1. Instalá **Godot 4.3 o posterior**.
2. Abrí `project.godot` en el editor y pulsá **F6/F5** (F5 ejecuta el proyecto).
3. Clic para capturar el cursor; **WASD** para moverte, **espacio** para saltar, **clic izquierdo** para disparar/atacar, **R** para recargar y **Esc** para liberar el cursor.

## Archivos originales de CS 1.5

Si tenés derecho a obtener y usar esos archivos y querés regenerar los recursos, podés descargar localmente la rama examinada con Python 3:

```sh
python tools/download_originals.py
```

El script descarga un commit fijo del repositorio público y guarda el directorio `cstrike` en `assets/original/`, excluido de Git. Son aproximadamente 244 MB descomprimidos. Reabrí el proyecto en Godot para que importe los WAV. **Actualmente se utilizan, si están presentes, los sonidos `ak47-1.wav`, `generic_reload.wav` y `knife_slash1.wav`; además se incluyen conversiones experimentales de mapas, modelos y sprites.** Sin los archivos originales se usa una arena de prueba y no se reproducen esos sonidos. Sin modelos convertidos, los personajes y el arma usan geometría de prueba.

Descargar los archivos no concede permisos de uso o distribución. Comprobá los derechos correspondientes, incluso para uso personal. El repositorio original no declara una licencia general.

## Preparación automática por lotes (experimental)

En este espacio de trabajo se incluyen las conversiones generadas experimentalmente. Si descargás el repositorio desde Git, esas carpetas no se incluyen. Para regenerarlas, descargar los archivos originales si aún no están presentes y convertir todos los mapas, modelos y sprites que soportan las herramientas, ejecutá con Godot cerrado:

```sh
python tools/prepare_all.py
```

El proceso puede tardar varios minutos y requiere espacio libre: aproximadamente 244 MB para los originales, más de 115 MB para conversiones y espacio temporal durante la descarga. Todo se guarda en `assets/original/` y `assets/generated/`, ambas carpetas excluidas de Git. Luego abrí Godot, dejá que importe los recursos y pulsá F5. `de_dust2` es el mapa inicial; **F2** cambia al siguiente mapa convertido y reinicia la partida. El arma y los humanos usan los modelos convertidos si están disponibles.

El informe `assets/generated/catalog.json` lista éxitos, archivos auxiliares, errores y texturas faltantes. Es normal que el programa devuelva un código de error si algún recurso no se puede convertir: el resto queda disponible. Por ejemplo, la rama original contiene `scientist.mdl` sin el archivo de texturas `scientistT.mdl`. Las texturas de Half-Life que no están en la rama deben aportarse por separado:

```sh
python tools/prepare_all.py --wad-dir "RUTA/A/Half-Life/valve"
```

Los sprites se convierten en imágenes PNG y un JSON con sus fotogramas, pero **todavía no están integrados en la interfaz o los efectos**. La conversión por lotes no convierte los ejecutables originales en código Godot ni añade las mecánicas que faltan.

## Usar un mapa original (experimental)

Con los archivos ya descargados, cerrá el editor de Godot y ejecutá desde la carpeta del proyecto:

```sh
python tools/convert_bsp.py --map de_dust2
```

Después abrí el proyecto en Godot, esperá a que termine de importar los archivos y pulsá F5. El juego intentará cargar el mapa convertido y sus puntos de aparición; si no puede, volverá a la arena de prueba. Para otro mapa, reemplazá `de_dust2` por su nombre, por ejemplo `cs_assault`, y reabrí el editor. El resultado se guarda en `assets/generated/map/` y está excluido de Git. Para volver a la arena de prueba, eliminá esa carpeta y reabrí el editor.

La herramienta extrae geometría y texturas BSP/WAD3 a glTF y PNG, y convierte las posiciones de aparición. Algunos mapas usan texturas de `halflife.wad`, que no viene en el repositorio de CS. Si tenés acceso autorizado a los WAD de Half-Life podés añadir su carpeta, por ejemplo:

```sh
python tools/convert_bsp.py --map cs_assault --wad-dir "RUTA/A/Half-Life/valve"
```

Sin esas texturas, las superficies faltantes aparecen en violeta. El conversor imprime cuáles faltan; también quedan listadas en `assets/generated/map/spawns.json`. Los WAD adicionales no se copian automáticamente al proyecto.

## Modelos originales (experimental)

Con el editor cerrado y los archivos descargados, convertí el arma y el jugador:

```sh
python tools/convert_mdl.py assets/original/cstrike/models/v_ak47.mdl --out assets/generated/weapon
python tools/convert_mdl.py assets/original/cstrike/models/player/terror/terror.mdl --out assets/generated/player
```

Reabrí Godot y esperá la importación antes de ejecutar. El prototipo intentará usar el primer modelo como arma en primera persona y el segundo para los bots humanos. Los zombis conservan la geometría de prueba. Si no están presentes, se usan los modelos de prueba. Para desactivarlos, borrá las carpetas `assets/generated/weapon` y `assets/generated/player` y reabrí el editor.

El conversor lee modelos Studio MDL versión 10, transforma los vértices por sus huesos y exporta su **pose base estática**, con texturas y el primer skin/bodygroup. En los modelos que requieren archivos de texturas separados, buscá el `.mdl` complementario en la misma carpeta. La pose base puede no coincidir con la postura del juego; la colocación del arma es aproximada y puede requerir ajuste.

## Limitaciones y próximos pasos

- La conversión de mapas es **experimental y parcial**: puertas y objetos de mapa se hornean como geometría estática; no hay iluminación original, animaciones, agua, escaleras, entidades interactivas ni objetivos. Algunas colisiones pueden diferir del original. La IA no conoce la navegación del mapa y puede quedarse atascada.
- La conversión de modelos no incluye animaciones, esqueleto animado, cambio de skins/bodygroups, efectos especiales ni todas las variantes del formato. Los sprites ya se extraen como PNG, pero aún no se utilizan en el juego; otros archivos originales tampoco están integrados. Descargar el archivo no los hace funcionar automáticamente en Godot.
- La física, las armas y la IA son aproximaciones sencillas, no una reproducción fiel de CS 1.5. La IA no utiliza navegación avanzada.
- No hay red, tienda, clases, progreso ni modos clásicos de bomba/rehenes. No es compatible con servidores o clientes originales.
- La siguiente etapa sería probar los mapas en Godot, mejorar sus colisiones y bots, y desarrollar las animaciones de los modelos.

## Prueba básica

Con Godot instalado y después de importar el proyecto:

```sh
godot --headless --path . --editor --quit
godot --headless --path . --script res://tests/smoke.gd
# Si convertiste mapa, arma y jugador:
godot --headless --path . --script res://tests/assets_smoke.gd
godot --headless --path . --script res://tests/collision_smoke.gd
godot --headless --path . --script res://tests/all_map_spawns.gd
godot --headless --path . --script res://tests/hud_smoke.gd
```

Las pruebas del conversor se pueden ejecutar sin Godot:

```sh
python -m unittest discover -s tests -p "test_*.py" -v
```
