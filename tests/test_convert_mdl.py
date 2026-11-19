import json
import struct
import tempfile
import unittest
from pathlib import Path

from tools.convert_mdl import convert, matvec, rotation


def mdl_fixture():
    data = bytearray(244)
    data[:4] = b'IDST'
    struct.pack_into('<i', data, 4, 10)

    def append(fmt, *args):
        at = len(data)
        data.extend(struct.pack('<' + fmt, *args))
        return at

    bone = append('32sii6i6f6f', b'root', -1, 0, *([-1] * 6), 32, 0, 0, 0, 0, 0, *([0.0] * 6))
    vertbones = len(data)
    data.extend(b'\0' * 3)
    normbones = len(data)
    data.extend(b'\0')
    verts = append('9f', 0, 0, 0, 32, 0, 0, 0, 32, 0)
    normals = append('3f', 0, 0, 1)
    commands = append('h', 3)
    for record in ((0, 0, 0, 0), (1, 0, 1, 0), (2, 0, 0, 1)):
        append('4h', *record)
    append('h', 0)
    mesh = append('5i', 1, commands, 0, 1, 0)
    model = append('64sif10i', b'model', 0, 0.0, 1, mesh, 3, vertbones, verts, 1, normbones, normals, 0, 0)
    part = append('64siii', b'part', 1, 1, model)
    skin = append('h', 0)
    pixels = len(data)
    data.extend(bytes([0, 1, 2, 3]) + bytes(range(256)) * 3)
    texture = append('64s4i', b'texture', 0, 2, 2, pixels)
    struct.pack_into('<ii', data, 140, 1, bone)
    struct.pack_into('<ii', data, 180, 1, texture)
    struct.pack_into('<iii', data, 192, 1, 1, skin)
    struct.pack_into('<ii', data, 204, 1, part)
    struct.pack_into('<i', data, 72, len(data))
    return data


class ConvertMdlTest(unittest.TestCase):
    def test_static_triangle(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'demo.mdl').write_bytes(mdl_fixture())
            convert(root / 'demo.mdl', root / 'output')
            data = json.loads((root / 'output/model.gltf').read_text())
            positions = data['accessors'][0]
            self.assertEqual(positions['count'], 3)
            self.assertEqual(positions['min'], [1, 0, -1])
            self.assertEqual(positions['max'], [2, 0, 0])
            self.assertEqual(data['buffers'][0]['byteLength'], (root / 'output/geometry.bin').stat().st_size)
            self.assertEqual((root / 'output/texture_000.png').read_bytes()[:8], b'\x89PNG\r\n\x1a\n')

    def test_rejects_invalid_model(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'bad.mdl').write_bytes(b'invalid')
            with self.assertRaises(ValueError):
                convert(root / 'bad.mdl', root / 'output')

    def test_rotation(self):
        from math import pi
        result = matvec(rotation((0, 0, pi / 2)), (1, 0, 0))
        self.assertAlmostEqual(result[0], 0)
        self.assertAlmostEqual(result[1], 1)
        self.assertAlmostEqual(result[2], 0)


if __name__ == '__main__':
    unittest.main()
