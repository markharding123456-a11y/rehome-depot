"""
Rehome Depot — Photo Importer
==============================
Scans images/gallery/ and updates data/inventory.js with new items.

USAGE
    Double-click  tools/import_photos.bat        (recommended for Mark)
    OR
    python tools/import_photos.py                (from the project root)

WHAT IT DOES
    - For each image file in images/gallery/:
        - If it's already in inventory.js (matched by filename), leave it alone.
          Your manual edits to description, category, status, etc. are preserved.
        - If it's new, parse the filename for title and price, then append
          a new entry with category="other", description="", status="available".
    - Reports any filenames it couldn't parse so you can fix them.
    - Reports inventory entries whose image file is missing (in case a photo
      got deleted or moved).
    - Writes the updated array back to data/inventory.js.

FILENAME FORMATS THE IMPORTER ACCEPTS
    Recommended:   "Oak Dining Table - $295.jpg"
    Also accepts:  "Oak Dining Table $295.jpg"
                   "Oak Dining Table 295.jpg"
                   "Oak Dining Table - 295.jpg"
                   "Mid-Century Chair - $150.99.jpg"   (decimals OK)

    The importer looks for a number at the END of the filename (just before
    the extension). Everything before that is the title. A leading "$" and
    any trailing dashes/underscores between the title and the price are
    stripped automatically.

    Image extensions accepted: .jpg .jpeg .png .webp .gif .svg
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# Resolve project root (parent of tools/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
GALLERY_DIR = PROJECT_ROOT / "images" / "gallery"
INVENTORY_PATH = PROJECT_ROOT / "data" / "inventory.js"

ACCEPTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}

# Match a price-like number at the end of the stem.
# Captures: optional $, then digits with optional .NN decimal.
PRICE_TAIL_RE = re.compile(r"\$?(\d+(?:\.\d{1,2})?)\s*$")

# To find the JSON array inside inventory.js
ARRAY_RE = re.compile(
    r"(window\.INVENTORY\s*=\s*)(\[.*?\])(\s*;)",
    re.DOTALL,
)


def parse_filename(filename: str) -> dict | None:
    """Parse 'Item Name - $295.jpg' -> {'title': 'Item Name', 'price': 295}."""
    stem, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
    if "." + ext.lower() not in ACCEPTED_EXTS:
        return None

    m = PRICE_TAIL_RE.search(stem)
    if not m:
        return None

    price_str = m.group(1)
    price = float(price_str) if "." in price_str else int(price_str)
    if isinstance(price, float) and price.is_integer():
        price = int(price)

    title = stem[: m.start()].rstrip(" -_$\t")
    if not title:
        return None

    return {"title": title, "price": price}


def load_inventory() -> list[dict]:
    """Read data/inventory.js and return the items list."""
    if not INVENTORY_PATH.exists():
        return []
    text = INVENTORY_PATH.read_text(encoding="utf-8")
    m = ARRAY_RE.search(text)
    if not m:
        raise SystemExit(
            "Could not find 'window.INVENTORY = [ ... ];' in data/inventory.js. "
            "If you edited the file by hand, make sure it still matches the original shape."
        )
    array_text = m.group(2)
    try:
        return json.loads(array_text)
    except json.JSONDecodeError as e:
        raise SystemExit(
            "data/inventory.js is not valid JSON inside the brackets.\n"
            f"  {e}\n"
            "Common causes: a missing comma, a trailing comma, or unquoted keys.\n"
            "Open the file and check the most recently edited entry."
        )


def save_inventory(items: list[dict]) -> None:
    """Write items back into data/inventory.js, preserving the surrounding code."""
    if INVENTORY_PATH.exists():
        text = INVENTORY_PATH.read_text(encoding="utf-8")
    else:
        text = "window.INVENTORY = [];\n"

    # Pretty-print with 4-space indent. Indent inner objects an extra level so
    # they line up under the array bracket nicely.
    pretty = json.dumps(items, indent=4, ensure_ascii=False)
    # json.dumps gives 4-space; we want the array contents indented to match
    # the existing file style (top-level [ at column 0, items indented 4 spaces).
    # That's already the default, so we can use pretty as-is.

    new_text, count = ARRAY_RE.subn(
        lambda m: m.group(1) + pretty + m.group(3),
        text,
        count=1,
    )
    if count == 0:
        # File doesn't have the marker — write a fresh one.
        new_text = "window.INVENTORY = " + pretty + ";\n"

    INVENTORY_PATH.write_text(new_text, encoding="utf-8")


def main() -> int:
    if not GALLERY_DIR.exists():
        print(f"Gallery folder not found: {GALLERY_DIR}", file=sys.stderr)
        return 1

    inventory = load_inventory()
    by_image = {item["image"]: item for item in inventory}
    next_id = max((item["id"] for item in inventory), default=0) + 1

    on_disk: set[str] = set()
    added: list[dict] = []
    skipped_unparseable: list[str] = []

    for path in sorted(GALLERY_DIR.iterdir()):
        if not path.is_file():
            continue
        if path.suffix.lower() not in ACCEPTED_EXTS:
            continue
        on_disk.add(path.name)
        if path.name in by_image:
            continue  # already known; leave existing entry alone
        parsed = parse_filename(path.name)
        if parsed is None:
            skipped_unparseable.append(path.name)
            continue
        new_item = {
            "id": next_id,
            "title": parsed["title"],
            "category": "other",
            "price": parsed["price"],
            "image": path.name,
            "description": "",
            "status": "available",
        }
        next_id += 1
        inventory.append(new_item)
        by_image[path.name] = new_item
        added.append(new_item)

    missing_images = [item for item in inventory if item["image"] not in on_disk]

    print()
    print("Rehome Depot -- photo import")
    print("-" * 40)
    print(f"Gallery folder: {GALLERY_DIR.relative_to(PROJECT_ROOT)}")
    print(f"Files on disk:  {len(on_disk)}")
    print(f"Items in inventory before: {len(inventory) - len(added)}")
    print(f"New items added:           {len(added)}")
    print()

    if added:
        print("Added the following items:")
        for item in added:
            price = f"${item['price']}" if isinstance(item["price"], (int, float)) else item["price"]
            print(f"  + #{item['id']}  {item['title']}  ({price})")
            print(f"    image: {item['image']}")
            print(f"    category defaults to 'other' -- edit data/inventory.js to change.")
        print()

    if skipped_unparseable:
        print("Could not parse these filenames (no price found at the end):")
        for name in skipped_unparseable:
            print(f"  ?  {name}")
        print("  Rename them like 'Item Name - $123.jpg' and re-run.")
        print()

    if missing_images:
        print("Inventory entries with no matching photo on disk:")
        for item in missing_images:
            print(f"  !  #{item['id']}  {item['title']}  -> {item['image']}")
        print("  These were left in inventory.js. Delete them by hand if no longer needed.")
        print()

    if added:
        save_inventory(inventory)
        print(f"data/inventory.js updated. Refresh the website to see the new items.")
    else:
        print("No changes to data/inventory.js.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
