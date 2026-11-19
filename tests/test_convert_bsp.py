import json
import math
import struct
import tempfile
import unittest
from pathlib import Path

from tools.convert_bsp import convert


def lump_fixture():
    """Minimal BSP30 with one textured world triangle and one spawn."""
    pack = lambda fmt, *args: struct.pack('<' + fmt, *args)
    lumps = [b'' for _ in range(15)]
    lumps[0] = b'{\n"classname" "info_player_start"\n"origin" "32 64 96"\n}\n\x00'
    lumps[1] = pack('4fi', 0, 0, 1, 0, 0)
    # 16x16 embedded texture, four mip levels followed by a 256-color palette.
    mip = (pack('16s6I', b'test', 16, 16, 40, 296, 360, 376)
           + bytes([5]) * 256 + bytes(64 + 16 + 4) + pack('H', 256)
           + bytes(range(256)) * 3)
    lumps[2] = pack('ii', 1, 8) + mip
    lumps[3] = b''.join(pack('3f', *v) for v in ((0, 0, 0), (32, 0, 0), (0, 32, 0)))
    lumps[6] = pack('8fii', 1, 0, 0, 0, 0, 1, 0, 0, 0, 0)
    lumps[7] = pack('HhiHH4Bi', 0, 0, 0, 3, 0, 255, 255, 255, 255, -1)
    lumps[12] = b''.join(pack('HH', *edge) for edge in ((0, 1), (1, 2), (2, 0)))
    lumps[13] = pack('3i', 0, 1, 2)
    lumps[14] = pack('9f7i', *([0.0] * 9), *([0] * 5), 0, 1)
    header = bytearray(pack('i', 30) + bytes(15 * 8))
    body = bytearray()
    for i, lump in enumerate(lumps):
        struct.pack_into('<ii', header, 4 + i * 8, len(header) + len(body), len(lump))
        body.extend(lump)
    return bytes(header + body)


class ConvertBspTest(unittest.TestCase):
    def test_minimal_map(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'game/maps').mkdir(parents=True)
            (root / 'game/maps/demo.bsp').write_bytes(lump_fixture())
            convert(root / 'game', 'demo', root / 'out')
            gltf = json.loads((root / 'out/map.gltf').read_text())
            binary = (root / 'out/geometry.bin').read_bytes()
            meta = json.loads((root / 'out/spawns.json').read_text())
            self.assertEqual(meta['missing_textures'], [])
            self.assertEqual(meta['spawns'], [[1, (96 - 36) / 32 + 0.05, -2]])
            self.assertEqual(gltf['buffers'][0]['byteLength'], len(binary))
            self.assertEqual(gltf['accessors'][0]['count'], 3)
            self.assertEqual(gltf['accessors'][0]['min'], [0, 0, -1])
            self.assertEqual(gltf['accessors'][0]['max'], [1, 0, 0])
            self.assertEqual((root / 'out/texture_000.png').read_bytes()[:8], b'\x89PNG\r\n\x1a\n')
            for accessor in gltf['accessors']:
                view = gltf['bufferViews'][accessor['bufferView']]
                self.assertLessEqual(view['byteOffset'] + view['byteLength'], len(binary))
                self.assertTrue(all(math.isfinite(x) for x in accessor.get('min', [])))

    def test_rejects_non_goldsrc(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'maps').mkdir()
            (root / 'maps/demo.bsp').write_bytes(b'bad map')
            with self.assertRaises(ValueError):
                convert(root, 'demo', root / 'out')


if __name__ == '__main__':
    unittest.main()
