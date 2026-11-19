#!/usr/bin/env python3
"""Convert visible GoldSrc BSP30 geometry and WAD3 textures to glTF 2.0.

Not a complete GoldSrc engine: brush entities are baked static and lighting,
triggers, visibility, animated textures and gameplay are not implemented.
"""
import argparse
import json
import math
import re
import struct
import zlib
from collections import defaultdict
from pathlib import Path

SCALE = 1 / 32


def unpack(fmt, data, offset=0):
    return struct.unpack_from('<' + fmt, data, offset)


def records(data, fmt):
    size = struct.calcsize('<' + fmt)
    if len(data) % size:
        raise ValueError(f'Lump size {len(data)} is not a multiple of {size}')
    return list(struct.iter_unpack('<' + fmt, data))


def png_chunk(name, data):
    body = name + data
    return struct.pack('>I', len(data)) + body + struct.pack('>I', zlib.crc32(body) & 0xffffffff)


def texture_png(width, height, indices, palette, transparent):
    if width <= 0 or height <= 0 or width * height > 16_777_216:
        raise ValueError('Invalid texture dimensions')
    if len(indices) < width * height or len(palette) < 768:
        raise ValueError('Incomplete texture data')
    rows = bytearray()
    for y in range(height):
        rows.append(0)
        for index in indices[y * width:(y + 1) * width]:
            rows.extend(palette[index * 3:index * 3 + 3])
            rows.append(0 if transparent and index == 255 else 255)
    header = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    return (b'\x89PNG\r\n\x1a\n' + png_chunk(b'IHDR', header)
            + png_chunk(b'IDAT', zlib.compress(bytes(rows))) + png_chunk(b'IEND', b''))


def decode_miptex(data, offset=0):
    if offset < 0 or offset + 40 > len(data):
        raise ValueError('Bad miptex offset')
    raw_name, width, height, m0, m1, m2, m3 = unpack('16s6I', data, offset)
    name = raw_name.split(b'\0')[0].decode('latin1')
    if not m0 or not m3 or width <= 0 or height <= 0 or width * height > 16_777_216:
        raise ValueError('Missing or invalid miptex')
    indices = data[offset + m0:offset + m0 + width * height]
    # WAD3/BSP30 stores palette after the fourth mip level.
    palette_at = offset + m3 + (width // 8) * (height // 8)
    if palette_at + 2 > len(data):
        raise ValueError('Missing palette')
    count = unpack('H', data, palette_at)[0]
    if count != 256:
        raise ValueError(f'Unsupported palette size {count}')
    palette = data[palette_at + 2:palette_at + 2 + 768]
    return name, width, height, texture_png(width, height, indices, palette, name.startswith('{'))


def wad_textures(directories):
    result = {}
    for wad in (p for directory in directories for p in directory.glob('*')):
        if wad.suffix.lower() != '.wad':
            continue
        data = wad.read_bytes()
        if len(data) < 12 or data[:4] != b'WAD3':
            continue
        count, directory = unpack('ii', data, 4)
        if count < 0 or directory < 0 or directory + count * 32 > len(data):
            continue
        for i in range(count):
            pos, disk_size, _size, kind, compression, _pad, raw_name = unpack('iiiBBH16s', data, directory + i * 32)
            if kind != 0x43 or compression != 0 or pos < 0 or pos + disk_size > len(data):
                continue
            name = raw_name.split(b'\0')[0].decode('latin1').lower()
            # Keep bytes from the whole lump, not the enclosing WAD.
            result.setdefault(name, data[pos:pos + disk_size])
    return result


def entities(text):
    parsed = []
    for block in re.findall(r'\{([^{}]*)\}', text, re.DOTALL):
        pairs = re.findall(r'"([^"\n]*)"\s*"([^"\n]*)"', block)
        parsed.append(dict(pairs))
    return parsed


def xyz(v):
    return (v[0] * SCALE, v[2] * SCALE, -v[1] * SCALE)


def convert(game_dir, map_name, out, extra_wad_dirs=()):
    source = game_dir / 'maps' / (map_name + '.bsp')
    data = source.read_bytes()
    if len(data) < 124 or unpack('i', data)[0] != 30:
        raise ValueError('Solo se admiten mapas GoldSrc BSP versión 30')
    lumps = []
    for i in range(15):
        offset, size = unpack('ii', data, 4 + i * 8)
        if offset < 0 or size < 0 or offset + size > len(data):
            raise ValueError(f'Lump {i} fuera de los límites del archivo')
        lumps.append(data[offset:offset + size])
    ent = entities(lumps[0].decode('latin1'))
    vertices = records(lumps[3], '3f')
    planes = records(lumps[1], '4fi')
    texinfo = records(lumps[6], '8fii')
    faces = records(lumps[7], 'HhiHH4Bi')
    edges = records(lumps[12], 'HH')
    surfedges = [x[0] for x in records(lumps[13], 'i')]
    models = records(lumps[14], '9f7i')
    texture_lump = lumps[2]
    if len(texture_lump) < 4:
        raise ValueError('Lump de texturas inválido')
    count = unpack('i', texture_lump)[0]
    if count < 0 or count > 100000 or 4 + 4 * count > len(texture_lump):
        raise ValueError('Cantidad de texturas inválida')
    wads = wad_textures([game_dir, *extra_wad_dirs])
    textures = []
    missing = []
    for i in range(count):
        offset = unpack('i', texture_lump, 4 + i * 4)[0]
        if offset < 0 or offset + 40 > len(texture_lump):
            textures.append(None)
            continue
        raw, width, height = unpack('16sII', texture_lump, offset)
        name = raw.split(b'\0')[0].decode('latin1')
        if not width or not height or width * height > 16_777_216:
            textures.append(None)
            continue
        png = None
        try:
            _, _, _, png = decode_miptex(texture_lump, offset)
        except ValueError:
            if name.lower() in wads:
                try:
                    _, width, height, png = decode_miptex(wads[name.lower()])
                except ValueError:
                    pass
        if png is None:
            missing.append(name)
        textures.append((name, width, height, png))

    # World and solid brush entities only. Do not turn triggers into visible walls.
    model_indices = {0}
    solid_types = {'func_wall', 'func_wall_toggle', 'func_door', 'func_door_rotating', 'func_breakable', 'func_pushable'}
    for e in ent:
        if e.get('classname') in solid_types and re.fullmatch(r'\*\d+', e.get('model', '')):
            model_indices.add(int(e['model'][1:]))
    selected = set()
    for i in model_indices:
        if i >= len(models):
            continue
        first, number = models[i][-2:]
        if first < 0 or number < 0 or first + number > len(faces):
            raise ValueError('Rango de caras del modelo inválido')
        selected.update(range(first, first + number))

    grouped = defaultdict(list)
    skipped = 0
    for face_id in sorted(selected):
        plane_id, side, first_edge, edge_count, ti, *_ = faces[face_id]
        if plane_id >= len(planes) or ti >= len(texinfo) or edge_count < 3 or first_edge < 0 or first_edge + edge_count > len(surfedges):
            skipped += 1
            continue
        info = texinfo[ti]
        tex_id = info[8]
        if tex_id < 0 or tex_id >= len(textures) or textures[tex_id] is None:
            skipped += 1
            continue
        name, width, height, _ = textures[tex_id]
        if name.lower() in {'aaatrigger', 'clip', 'origin', 'null', 'skip', 'hint'}:
            continue
        poly = []
        for surfedge in surfedges[first_edge:first_edge + edge_count]:
            if abs(surfedge) >= len(edges):
                poly = []
                break
            edge = edges[abs(surfedge)]
            vertex_id = edge[0] if surfedge >= 0 else edge[1]
            if vertex_id >= len(vertices):
                poly = []
                break
            v = vertices[vertex_id]
            uv = ((sum(v[k] * info[k] for k in range(3)) + info[3]) / width,
                  (sum(v[k] * info[k + 4] for k in range(3)) + info[7]) / height)
            poly.append((xyz(v), uv))
        if len(poly) < 3:
            skipped += 1
            continue
        normal = xyz(planes[plane_id][:3])
        normal = tuple(n * (-32 if side else 32) for n in normal)
        a, b, c = (p[0] for p in poly[:3])
        ab = [b[j] - a[j] for j in range(3)]
        ac = [c[j] - a[j] for j in range(3)]
        cross = (ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0])
        reverse = sum(cross[j] * normal[j] for j in range(3)) < 0
        for j in range(1, len(poly) - 1):
            tri = (poly[0], poly[j + 1], poly[j]) if reverse else (poly[0], poly[j], poly[j + 1])
            for position, uv in tri:
                grouped[tex_id].append((position, normal, uv))
    if not grouped:
        raise ValueError('No se encontraron caras visibles')

    out.mkdir(parents=True, exist_ok=True)
    buffer = bytearray()
    views, accessors, materials, images, texs, primitives = [], [], [], [], [], []

    def add_accessor(values, component, typ, bounds=False):
        while len(buffer) % 4:
            buffer.append(0)
        offset = len(buffer)
        for row in values:
            buffer.extend(struct.pack('<' + 'f' * len(row), *row))
        views.append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(buffer) - offset, 'target': 34962})
        entry = {'bufferView': len(views) - 1, 'componentType': component, 'count': len(values), 'type': typ}
        if bounds:
            entry['min'] = [min(v[i] for v in values) for i in range(3)]
            entry['max'] = [max(v[i] for v in values) for i in range(3)]
        accessors.append(entry)
        return len(accessors) - 1

    for tex_id, mesh in grouped.items():
        name, _, _, png = textures[tex_id]
        mat = {'name': name, 'pbrMetallicRoughness': {'metallicFactor': 0, 'roughnessFactor': 1}, 'doubleSided': True}
        if png:
            filename = f'texture_{tex_id:03}.png'
            (out / filename).write_bytes(png)
            images.append({'uri': filename})
            texs.append({'sampler': 0, 'source': len(images) - 1})
            mat['pbrMetallicRoughness']['baseColorTexture'] = {'index': len(texs) - 1}
            if name.startswith('{'):
                mat['alphaMode'] = 'MASK'
        else:
            mat['pbrMetallicRoughness']['baseColorFactor'] = [0.65, 0.25, 0.65, 1]
        materials.append(mat)
        position = add_accessor([v[0] for v in mesh], 5126, 'VEC3', True)
        normal = add_accessor([v[1] for v in mesh], 5126, 'VEC3')
        uv = add_accessor([v[2] for v in mesh], 5126, 'VEC2')
        primitives.append({'attributes': {'POSITION': position, 'NORMAL': normal, 'TEXCOORD_0': uv}, 'material': len(materials) - 1, 'mode': 4})
    gltf = {'asset': {'version': '2.0', 'generator': 'convert_bsp.py'}, 'scene': 0,
            'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0, 'name': map_name}],
            'meshes': [{'primitives': primitives}], 'materials': materials,
            'buffers': [{'uri': 'geometry.bin', 'byteLength': len(buffer)}], 'bufferViews': views,
            'accessors': accessors, 'samplers': [{'wrapS': 10497, 'wrapT': 10497}], 'textures': texs, 'images': images}
    (out / 'geometry.bin').write_bytes(buffer)
    (out / 'map.gltf').write_text(json.dumps(gltf, separators=(',', ':')), encoding='utf-8')
    spawns = []
    for e in ent:
        if e.get('classname') not in {'info_player_start', 'info_player_deathmatch'}:
            continue
        try:
            v = [float(x) for x in e['origin'].split()]
            if len(v) != 3 or not all(math.isfinite(x) for x in v):
                continue
            spawns.append([v[0] * SCALE, (v[2] - 36) * SCALE + 0.05, -v[1] * SCALE])
        except (ValueError, KeyError):
            continue
    (out / 'spawns.json').write_text(json.dumps({'map': map_name, 'spawns': spawns, 'missing_textures': missing}, indent=2), encoding='utf-8')
    print(f'{map_name}: {len(selected)} caras, {sum(len(m) for m in grouped.values()) // 3} triángulos, {len(spawns)} puntos de aparición.')
    print(f'Texturas sin encontrar: {len(missing)}' + (': ' + ', '.join(missing) if missing else ''))
    print(f'Caras inválidas/omitidas: {skipped}. Resultado: {out}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--game-dir', type=Path, default=Path('assets/original/cstrike'))
    parser.add_argument('--wad-dir', type=Path, action='append', default=[],
                        help='Carpeta adicional con WADs, por ejemplo el directorio valve de Half-Life')
    parser.add_argument('--map', default='de_dust2', dest='map_name')
    parser.add_argument('--out', type=Path, default=Path('assets/generated/map'))
    args = parser.parse_args()
    if not re.fullmatch(r'[A-Za-z0-9_-]+', args.map_name):
        parser.error('Nombre de mapa inválido')
    convert(args.game_dir, args.map_name, args.out, args.wad_dir)


if __name__ == '__main__':
    main()
