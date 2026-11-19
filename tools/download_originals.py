#!/usr/bin/env python3
"""Download the exact CS 1.5 archive locally; does not grant a license to its contents."""
from pathlib import Path, PurePosixPath
from urllib.request import urlopen
from zipfile import ZipFile
import shutil
import tempfile

COMMIT = "f5837cb509ef09f9352ec8960258893a4c8bf2df"
URL = f"https://codeload.github.com/Ch0wW/counterstrike-betas/zip/{COMMIT}"
ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "assets" / "original"


def main():
    if (DEST / "cstrike").exists():
        raise SystemExit(f"Ya existe {DEST / 'cstrike'}. Bórralo manualmente si querés volver a descargarlo.")
    DEST.mkdir(parents=True, exist_ok=True)
    print("Descargando CS 1.5 (puede tardar varios minutos)...", flush=True)
    with tempfile.TemporaryDirectory() as tmp:
        archive = Path(tmp) / "source.zip"
        with urlopen(URL, timeout=120) as response, archive.open("wb") as out:
            shutil.copyfileobj(response, out)
        with ZipFile(archive) as zip_file:
            files = [i for i in zip_file.infolist() if not i.is_dir()]
            if sum(i.file_size for i in files) > 400_000_000:
                raise ValueError("El archivo descargado es demasiado grande")
            for info in files:
                parts = PurePosixPath(info.filename).parts
                if len(parts) < 2 or ".." in parts or parts[1] != "cstrike":
                    continue
                target = DEST.joinpath(*parts[1:])
                target.parent.mkdir(parents=True, exist_ok=True)
                with zip_file.open(info) as src, target.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
    print(f"Archivos guardados en {DEST / 'cstrike'}. Abrí o reabrí el proyecto en Godot para importarlos.")


if __name__ == "__main__":
    main()
