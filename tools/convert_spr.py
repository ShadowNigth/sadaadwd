#!/usr/bin/env python3
"""Convert GoldSrc v2 sprites to PNG frames and JSON metadata."""
import argparse
import json
import struct
import zlib
from pathlib import Path

try:
    from .convert_bsp import png_chunk
except ImportError:
    from convert_bsp import png_chunk


def unpack(fmt, data, offset):
    size = struct.calcsize('<' + fmt)
    if offset < 0 or offset + size > len(data):
        raise ValueError(f'SPR truncado en {offset}')
    return struct.unpack_from('<' + fmt, data, offset)


def convert(path, out):
    path, out = Path(path), Path(out)
    data = path.read_bytes()
    if len(data) < 42 or data[:4] != b'IDSP':
        raise ValueError('No es un sprite GoldSrc')
    version, sprite_type, tex_format, radius, max_w, max_h, count, beam, sync = unpack('iiifiiifi', data, 4)
    if version != 2 or tex_format not in range(4) or count < 0 or count > 4096:
        raise ValueError('Solo se admiten sprites GoldSrc v2')
    colors = unpack('H', data, 40)[0]
    if colors != 256 or len(data) < 42 + 3 * colors:
        raise ValueError('Paleta SPR inválida')
    palette = data[42:42 + 768]
    cursor = 42 + 768
    out.mkdir(parents=True, exist_ok=True)
    frames = []

    def frame(interval=None):
        nonlocal cursor
        x, y, width, height = unpack('4i', data, cursor)
        cursor += 16
        size = width * height
        if width <= 0 or height <= 0 or size > 16_777_216 or cursor + size > len(data):
            raise ValueError('Dimensiones o datos de fotograma inválidos')
        indices = data[cursor:cursor + size]
        cursor += size
        rows = bytearray()
        for row in range(height):
            rows.append(0)
            for index in indices[row * width:(row + 1) * width]:
                if tex_format == 2:  # Index alpha: palette color 255, pixel as alpha.
                    rgb = palette[765:768]
                    alpha = index
                else:
                    rgb = palette[index * 3:index * 3 + 3]
                    alpha = 0 if tex_format == 3 and index == 255 else 255
                rows.extend(rgb)
                rows.append(alpha)
        header = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
        png = (b'\x89PNG\r\n\x1a\n' + png_chunk(b'IHDR', header)
               + png_chunk(b'IDAT', zlib.compress(bytes(rows))) + png_chunk(b'IEND', b''))
        name = f'frame_{len(frames):03}.png'
        (out / name).write_bytes(png)
        frames.append({'image': name, 'origin': [x, y], 'width': width, 'height': height, 'interval': interval})

    for _ in range(count):
        kind = unpack('i', data, cursor)[0]
        cursor += 4
        if kind == 0:
            frame()
        elif kind == 1:
            group_count = unpack('i', data, cursor)[0]
            cursor += 4
            if group_count < 1 or group_count > 4096:
                raise ValueError('Grupo SPR inválido')
            intervals = unpack(f'{group_count}f', data, cursor)
            cursor += 4 * group_count
            for interval in intervals:
                frame(interval)
        else:
            raise ValueError(f'Tipo de fotograma SPR desconocido: {kind}')
    metadata = {'source': path.name, 'type': sprite_type, 'texture_format': tex_format,
                'bounding_radius': radius, 'max_width': max_w, 'max_height': max_h,
                'beam_length': beam, 'sync_type': sync, 'frames': frames}
    (out / 'sprite.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
    print(f'{path.name}: {len(frames)} fotogramas. Resultado: {out}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('sprite', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    convert(args.sprite, args.out)


if __name__ == '__main__':
    main()
