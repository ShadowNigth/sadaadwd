import json
import struct
import tempfile
import unittest
from pathlib import Path

from tools.convert_spr import convert


def make_sprite(group=False):
    pack = lambda fmt, *a: struct.pack('<' + fmt, *a)
    header = b'IDSP' + pack('iiifiiifi', 2, 2, 3, 1.0, 2, 2, 1, 0.0, 0)
    palette = pack('H', 256) + bytes(range(256)) * 3
    image = pack('4i', -1, 1, 2, 2) + bytes([1, 2, 3, 255])
    if group:
        return header + palette + pack('ii2f', 1, 2, 0.1, 0.2) + image + image
    return header + palette + pack('i', 0) + image


class SpriteTest(unittest.TestCase):
    def test_single_and_group(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for group in (False, True):
                source = root / 'test.spr'
                source.write_bytes(make_sprite(group))
                output = root / str(group)
                convert(source, output)
                meta = json.loads((output / 'sprite.json').read_text())
                self.assertEqual(len(meta['frames']), 2 if group else 1)
                self.assertEqual(meta['frames'][0]['origin'], [-1, 1])
                self.assertEqual((output / 'frame_000.png').read_bytes()[:8], b'\x89PNG\r\n\x1a\n')
                if group:
                    self.assertAlmostEqual(meta['frames'][1]['interval'], 0.2)

    def test_truncated(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / 'bad.spr'
            source.write_bytes(make_sprite()[:-1])
            with self.assertRaises(ValueError):
                convert(source, Path(tmp) / 'out')


if __name__ == '__main__':
    unittest.main()
