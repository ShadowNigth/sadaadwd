#!/usr/bin/env python3
"""Convert a GoldSrc Studio MDL v10 to a textured, static bind-pose glTF.

Animation sequences, controllers, chrome and bodygroup switching are not exported.
The first model of every body part and the first skin family are used.
"""
import argparse
import json
import math
import struct
from collections import defaultdict
from pathlib import Path

try:
    from .convert_bsp import texture_png, xyz
except ImportError:
    from convert_bsp import texture_png, xyz


def unpack(fmt, data, offset):
    size = struct.calcsize('<' + fmt)
    if offset < 0 or offset + size > len(data):
        raise ValueError(f'Datos MDL fuera del archivo en {offset}')
    return struct.unpack_from('<' + fmt, data, offset)


def slice_bytes(data, offset, size):
    if offset < 0 or size < 0 or offset + size > len(data):
        raise ValueError(f'Datos MDL fuera del archivo en {offset}')
    return data[offset:offset + size]


def rotation(angles):
    x, y, z = angles
    cx, cy, cz = math.cos(x), math.cos(y), math.cos(z)
    sx, sy, sz = math.sin(x), math.sin(y), math.sin(z)
    return ((cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx),
            (sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx),
            (-sy, cy * sx, cy * cx))


def matvec(matrix, v):
    return tuple(sum(matrix[i][j] * v[j] for j in range(3)) for i in range(3))


def matmul(a, b):
    return tuple(tuple(sum(a[i][k] * b[k][j] for k in range(3)) for j in range(3)) for i in range(3))


def bone_matrices(data):
    count, start = unpack('ii', data, 140)
    if count < 1 or count > 512:
        raise ValueError('Cantidad de huesos inválida')
    result = []
    for i in range(count):
        values = unpack('32sii6i6f6f', data, start + i * 112)
        parent = values[1]
        translation, angles = values[9:12], values[12:15]
        matrix = rotation(angles)
        if parent >= 0:
            if parent >= len(result):
                raise ValueError('Jerarquía de huesos inválida')
            parent_matrix, parent_position = result[parent]
            translation = tuple(a + b for a, b in zip(matvec(parent_matrix, translation), parent_position))
            matrix = matmul(parent_matrix, matrix)
        result.append((matrix, translation))
    return result


def read_textures(data, path):
    count, start = unpack('ii', data, 180)
    if count == 0:
        expected = (path.stem + 'T' + path.suffix).lower()
        companion = next((candidate for candidate in path.parent.iterdir()
                          if candidate.name.lower() == expected), None)
        if companion is None:
            raise ValueError(f'El modelo necesita texturas externas: {path.stem}T{path.suffix}')
        data = companion.read_bytes()
        if data[:4] != b'IDST' or unpack('i', data, 4)[0] != 10:
            raise ValueError('Archivo de texturas externo inválido')
        count, start = unpack('ii', data, 180)
    if count <= 0 or count > 4096:
        raise ValueError('Cantidad de texturas inválida')
    result = []
    for i in range(count):
        name, flags, width, height, index = unpack('64s4i', data, start + 80 * i)
        if width <= 0 or height <= 0 or width * height > 16_777_216:
            raise ValueError('Dimensiones de textura inválidas')
        pixels = slice_bytes(data, index, width * height)
        palette = slice_bytes(data, index + width * height, 768)
        name = name.split(b'\0')[0].decode('latin1')
        result.append((name, width, height, flags, texture_png(width, height, pixels, palette, bool(flags & 0x40))))
    return result, data


def convert(path, out):
    path, out = Path(path), Path(out)
    data = path.read_bytes()
    if len(data) < 244 or data[:4] != b'IDST' or unpack('i', data, 4)[0] != 10:
        raise ValueError('Solo se admiten modelos GoldSrc Studio MDL versión 10')
    bones = bone_matrices(data)
    textures, texture_data = read_textures(data, path)
    numskinref, skinfamilies, skinindex = unpack('iii', texture_data, 192)
    if numskinref < 1 or skinfamilies < 1 or numskinref > 4096:
        raise ValueError('Tabla de skins inválida')
    skinrefs = unpack(f'{numskinref}h', texture_data, skinindex)
    numparts, partindex = unpack('ii', data, 204)
    if numparts < 1 or numparts > 256:
        raise ValueError('Cantidad de partes inválida')
    grouped = defaultdict(list)
    for part in range(numparts):
        _name, nummodels, _base, modelindex = unpack('64siii', data, partindex + part * 76)
        if nummodels < 1:
            continue
        model = unpack('64sif10i', data, modelindex)  # First model in this body part.
        nummesh, meshindex, numverts, vertboneindex, vertindex, numnorms, normboneindex, normindex = model[3:11]
        if not (0 <= nummesh <= 4096 and 0 <= numverts <= 100000 and 0 <= numnorms <= 100000):
            raise ValueError('Conteo de malla inválido')
        vertbones = slice_bytes(data, vertboneindex, numverts)
        normbones = slice_bytes(data, normboneindex, numnorms)
        verts = []
        norms = []
        for i in range(numverts):
            vertex = unpack('3f', data, vertindex + i * 12)
            if vertbones[i] >= len(bones):
                raise ValueError('Índice de hueso de vértice inválido')
            matrix, translation = bones[vertbones[i]]
            verts.append(xyz(tuple(a + b for a, b in zip(matvec(matrix, vertex), translation))))
        for i in range(numnorms):
            normal = unpack('3f', data, normindex + i * 12)
            if normbones[i] >= len(bones):
                raise ValueError('Índice de hueso de normal inválido')
            n = xyz(matvec(bones[normbones[i]][0], normal))
            length = math.sqrt(sum(x * x for x in n))
            norms.append(tuple(x / length for x in n) if length else (0.0, 1.0, 0.0))
        for mesh_i in range(nummesh):
            _numtris, cursor, skinref, _numnorms, _normindex = unpack('5i', data, meshindex + mesh_i * 20)
            if skinref < 0 or skinref >= len(skinrefs):
                raise ValueError('Índice de skin inválido')
            texid = skinrefs[skinref]
            if texid < 0 or texid >= len(textures):
                raise ValueError('Índice de textura inválido')
            _, width, height, _flags, _png = textures[texid]
            while True:
                count = unpack('h', data, cursor)[0]
                cursor += 2
                if count == 0:
                    break
                if abs(count) > 32767:
                    raise ValueError('Lista de triángulos inválida')
                strip = []
                for _ in range(abs(count)):
                    vi, ni, s, t = unpack('4h', data, cursor)
                    cursor += 8
                    if vi < 0 or vi >= len(verts) or ni < 0 or ni >= len(norms):
                        raise ValueError('Índice de triángulo inválido')
                    strip.append((verts[vi], norms[ni], (s / width, t / height)))
                for i in range(2, len(strip)):
                    if count < 0:
                        triangle = (strip[0], strip[i - 1], strip[i])
                    elif i % 2:
                        triangle = (strip[i - 1], strip[i - 2], strip[i])
                    else:
                        triangle = (strip[i - 2], strip[i - 1], strip[i])
                    grouped[texid].extend(triangle)
    if not grouped:
        raise ValueError('El modelo no contiene triángulos')
    out.mkdir(parents=True, exist_ok=True)
    binary = bytearray()
    views, accessors, materials, images, gltf_textures, primitives = [], [], [], [], [], []

    def accessor(values, kind, bounds=False):
        while len(binary) % 4:
            binary.append(0)
        start = len(binary)
        for row in values:
            binary.extend(struct.pack('<' + 'f' * len(row), *row))
        views.append({'buffer': 0, 'byteOffset': start, 'byteLength': len(binary) - start, 'target': 34962})
        item = {'bufferView': len(views) - 1, 'componentType': 5126, 'count': len(values), 'type': kind}
        if bounds:
            item['min'] = [min(v[i] for v in values) for i in range(3)]
            item['max'] = [max(v[i] for v in values) for i in range(3)]
        accessors.append(item)
        return len(accessors) - 1

    for texid, mesh in sorted(grouped.items()):
        name, _, _, flags, png = textures[texid]
        filename = f'texture_{texid:03}.png'
        (out / filename).write_bytes(png)
        images.append({'uri': filename})
        gltf_textures.append({'sampler': 0, 'source': len(images) - 1})
        material = {'name': name, 'doubleSided': True, 'pbrMetallicRoughness': {'metallicFactor': 0, 'roughnessFactor': 1, 'baseColorTexture': {'index': len(gltf_textures) - 1}}}
        if flags & 0x40:
            material['alphaMode'] = 'MASK'
        materials.append(material)
        pos = accessor([v[0] for v in mesh], 'VEC3', True)
        normal = accessor([v[1] for v in mesh], 'VEC3')
        uv = accessor([v[2] for v in mesh], 'VEC2')
        primitives.append({'attributes': {'POSITION': pos, 'NORMAL': normal, 'TEXCOORD_0': uv}, 'material': len(materials) - 1, 'mode': 4})
    gltf = {'asset': {'version': '2.0', 'generator': 'convert_mdl.py'}, 'scene': 0,
            'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0, 'name': path.stem}],
            'meshes': [{'primitives': primitives}], 'materials': materials,
            'buffers': [{'uri': 'geometry.bin', 'byteLength': len(binary)}], 'bufferViews': views,
            'accessors': accessors, 'samplers': [{'wrapS': 10497, 'wrapT': 10497}], 'textures': gltf_textures, 'images': images}
    (out / 'geometry.bin').write_bytes(binary)
    (out / 'model.gltf').write_text(json.dumps(gltf, separators=(',', ':')), encoding='utf-8')
    print(f'{path.name}: {len(bones)} huesos, {sum(len(v) for v in grouped.values()) // 3} triángulos, {len(grouped)} texturas. Resultado: {out}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('model', type=Path, help='Ruta al archivo .mdl')
    parser.add_argument('--out', type=Path, default=Path('assets/generated/weapon'))
    args = parser.parse_args()
    convert(args.model, args.out)


if __name__ == '__main__':
    main()
