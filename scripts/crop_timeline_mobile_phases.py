"""Crop new desktop phase BGs (1920x960 ultra-wide) to 9:16 mobile portraits (1080x1920).

Center-crop 540x960 strip from each source, LANCZOS upscale 2x to match
existing target dims (drop-in replacement for /timeline mobile portrait BGs).

Output also includes a single preview sheet (preview_mobile_phases.jpg)
combining all 5 mobile portraits side-by-side at 25% scale for quick review.
"""

from __future__ import annotations
import shutil
from datetime import datetime
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "public" / "images" / "timeline" / "phases"
DST_DIR = ROOT / "public" / "images" / "timeline" / "mobile"

PHASES = [
    ("phase-1-colonial-resistance.webp", "phase-1.webp", "Colonial Resistance"),
    ("phase-2-rise-of-polities.webp",    "phase-2.webp", "Rise of Polities"),
    ("phase-3-unification-democracy.webp","phase-3.webp", "Unification & Democracy"),
    ("phase-4-civil-collapse.webp",      "phase-4.webp", "Civil Collapse"),
    ("phase-5-military-control.webp",    "phase-5.webp", "Military Control"),
]

TARGET_W, TARGET_H = 1080, 1920


def crop_to_portrait(src_path: Path) -> Image.Image:
    src = Image.open(src_path).convert("RGB")
    sw, sh = src.size  # 1920, 960
    # 9:16 strip of full source height
    crop_w = round(sh * 9 / 16)  # 540
    left = (sw - crop_w) // 2
    box = (left, 0, left + crop_w, sh)
    cropped = src.crop(box)
    # Upscale 2x to canonical mobile size
    return cropped.resize((TARGET_W, TARGET_H), Image.LANCZOS)


def main() -> None:
    stamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    print(f"crop_timeline_mobile_phases — stamp {stamp}")
    print(f"src: {SRC_DIR}")
    print(f"dst: {DST_DIR}")
    print()

    rendered: list[Image.Image] = []
    for src_name, dst_name, label in PHASES:
        src_path = SRC_DIR / src_name
        dst_path = DST_DIR / dst_name
        if not src_path.exists():
            raise FileNotFoundError(src_path)
        if dst_path.exists():
            backup = dst_path.with_name(f"{dst_path.name}.bak.{stamp}")
            shutil.copy2(dst_path, backup)
            print(f"  backup: {dst_name} -> {backup.name}")
        out = crop_to_portrait(src_path)
        out.save(dst_path, format="WEBP", quality=88, method=6)
        size_kb = dst_path.stat().st_size / 1024
        print(f"  wrote:  {dst_name}  ({label})  {size_kb:.0f} KB  {out.size[0]}x{out.size[1]}")
        rendered.append(out)
    print()

    # Preview sheet: 5 portraits side-by-side at 25%
    pw = TARGET_W // 4   # 270
    ph = TARGET_H // 4   # 480
    sheet = Image.new("RGB", (pw * 5 + 4 * 8, ph), (15, 15, 18))
    for i, im in enumerate(rendered):
        thumb = im.resize((pw, ph), Image.LANCZOS)
        sheet.paste(thumb, (i * (pw + 8), 0))
    preview_path = DST_DIR / f"_preview_mobile_phases_{stamp}.jpg"
    sheet.save(preview_path, format="JPEG", quality=88)
    print(f"preview: {preview_path}")


if __name__ == "__main__":
    main()
