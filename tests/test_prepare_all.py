import json
import tempfile
import unittest
from pathlib import Path

from test_convert_bsp import lump_fixture
from test_convert_mdl import mdl_fixture
from test_convert_spr import make_sprite
from tools.prepare_all import prepare


class PrepareAllTest(unittest.TestCase):
    def test_catalog_includes_successes_and_missing_model(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            game = root / 'cstrike'
            for directory in ['maps', 'models', 'sprites']:
                (game / directory).mkdir(parents=True)
            (game / 'maps/demo.bsp').write_bytes(lump_fixture())
            (game / 'models/demo.mdl').write_bytes(mdl_fixture())
            (game / 'models/bad.mdl').write_bytes(b'bad')
            (game / 'sprites/demo.spr').write_bytes(make_sprite())
            report = prepare(game, root / 'output')
            self.assertEqual(len(report['maps']), 1)
            self.assertEqual(len(report['models']), 1)
            self.assertEqual(len(report['sprites']), 1)
            self.assertEqual(len(report['errors']), 1)
            self.assertEqual(report['errors'][0]['file'], 'models/bad.mdl')
            self.assertEqual(json.loads((root / 'output/catalog.json').read_text()), report)
            for item in report['maps'] + report['models'] + report['sprites']:
                self.assertTrue((root / 'output' / item['path']).is_file())

    def test_missing_game_directory(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                prepare(Path(tmp) / 'missing', Path(tmp) / 'output')


if __name__ == '__main__':
    unittest.main()
