#!/usr/bin/env python3
"""Download if needed and batch-convert supported CS 1.5 assets locally."""
import argparse
import json
import shutil
from pathlib import Path

try:
    from . import convert_bsp, convert_mdl, convert_spr, download_originals
except ImportError:
    import convert_bsp
    import convert_mdl
    import convert_spr
    import download_originals

ROOT = Path(__file__).resolve().parent.parent


def prepare(game_dir, output, wad_dirs=()):
    game_dir, output = Path(game_dir), Path(output)
    if not (game_dir / 'maps').is_dir() or not (game_dir / 'models').is_dir():
        raise ValueError(f'No se encontró una carpeta cstrike válida en {game_dir}')
    output.mkdir(parents=True, exist_ok=True)
    result = {'maps': [], 'models': [], 'sprites': [], 'errors': [], 'notes': []}
    for source in sorted((game_dir / 'maps').glob('*.bsp')):
        try:
            out = output / 'maps' / source.stem
            convert_bsp.convert(game_dir, source.stem, out, wad_dirs)
            meta = json.loads((out / 'spawns.json').read_text(encoding='utf-8'))
            result['maps'].append({'name': source.stem, 'path': f'maps/{source.stem}/map.gltf',
                                   'spawns': len(meta['spawns']), 'missing_textures': meta['missing_textures']})
        except (OSError, ValueError, IndexError, OverflowError) as exc:
            result['errors'].append({'file': str(source.relative_to(game_dir)), 'error': str(exc)})
    for source in sorted((game_dir / 'models').rglob('*.mdl')):
        relative = source.relative_to(game_dir / 'models')
        data = source.read_bytes()
        # IDSQ files contain animation sequence groups, not standalone meshes.
        # Some IDST files contain textures only, and are read as companions by convert_mdl.
        if data[:4] == b'IDSQ' or (data[:4] == b'IDST' and len(data) >= 144 and int.from_bytes(data[140:144], 'little') == 0):
            result['notes'].append({'file': str(source.relative_to(game_dir)), 'note': 'archivo auxiliar de secuencias o texturas; no es una malla independiente'})
            continue
        try:
            out = output / 'models' / relative.with_suffix('')
            convert_mdl.convert(source, out)
            result['models'].append({'name': relative.as_posix(), 'path': 'models/' + relative.with_suffix('').as_posix() + '/model.gltf'})
        except (OSError, ValueError, IndexError, OverflowError) as exc:
            result['errors'].append({'file': str(source.relative_to(game_dir)), 'error': str(exc)})
    for source in sorted((game_dir / 'sprites').rglob('*.spr')):
        relative = source.relative_to(game_dir / 'sprites')
        try:
            out = output / 'sprites' / relative.with_suffix('')
            convert_spr.convert(source, out)
            result['sprites'].append({'name': relative.as_posix(), 'path': 'sprites/' + relative.with_suffix('').as_posix() + '/sprite.json'})
        except (OSError, ValueError, IndexError, OverflowError) as exc:
            result['errors'].append({'file': str(source.relative_to(game_dir)), 'error': str(exc)})
    # Copy only generated assets, never the original binaries. Fallbacks work if a model failed.
    for source_rel, dest in [('models/v_ak47', 'weapon'), ('models/player/terror/terror', 'player')]:
        source = output / source_rel
        if (source / 'model.gltf').exists():
            shutil.copytree(source, output / dest, dirs_exist_ok=True)
    # Sounds are not converted: Godot imports supported original WAV files.
    sound_output = output / 'sounds'
    sound_output.mkdir(parents=True, exist_ok=True)
    for name in ('ak47-1.wav', 'generic_reload.wav', 'knife_slash1.wav'):
        source = game_dir / 'sound' / 'weapons' / name
        if source.is_file():
            shutil.copy2(source, sound_output / name)
    (output / 'catalog.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"\nResultado: {len(result['maps'])} mapas, {len(result['models'])} modelos, {len(result['sprites'])} sprites; {len(result['errors'])} errores.")
    print('Informe:', output / 'catalog.json')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--game-dir', type=Path, default=ROOT / 'assets/original/cstrike')
    parser.add_argument('--out', type=Path, default=ROOT / 'assets/generated')
    parser.add_argument('--wad-dir', type=Path, action='append', default=[])
    parser.add_argument('--no-download', action='store_true', help='No descargar si faltan los archivos originales')
    args = parser.parse_args()
    if not args.game_dir.exists() and args.game_dir == ROOT / 'assets/original/cstrike' and not args.no_download:
        download_originals.main()
    result = prepare(args.game_dir, args.out, args.wad_dir)
    if result['errors']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
