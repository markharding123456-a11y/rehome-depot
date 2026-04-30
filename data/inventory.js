/* ============================================================
   Rehome Depot — Inventory Data
   ============================================================
   This file is BOTH valid JavaScript (for the browser) AND
   contains a JSON-compatible array (for the import script).
   The Python importer at tools/import_photos.py reads and
   rewrites the array between the brackets below.

   HOW TO ADD ITEMS THE EASY WAY:
     1. Drop photos into images/gallery/, named like:
            Oak Dining Table - $295.jpg
     2. Double-click tools/import_photos.bat
     3. Refresh the website

   HOW TO EDIT BY HAND:
     Each item is a JSON object. Edit the fields, save the file.
     Keep keys quoted (e.g. "title", not title) so the importer
     can still parse it.

   FIELDS:
     id           unique number (set automatically by the importer)
     title        item name (shown on card and lightbox)
     category     "furniture" | "decor" | "lighting" | "other"
     price        number in dollars (or the string "Inquire")
     image        filename inside images/gallery/
     description  short blurb shown in the lightbox (can be empty)
     status       "available" | "sold" | "hold"
   ============================================================ */

window.INVENTORY = [
    {
        "id": 1,
        "title": "Mid-Century Walnut Sideboard",
        "category": "furniture",
        "price": 385,
        "image": "sideboard.svg",
        "description": "Six-foot walnut sideboard with sliding doors and original brass pulls. Light wear on the top, otherwise excellent condition. Perfect as a media console or dining buffet.",
        "status": "available"
    },
    {
        "id": 2,
        "title": "Pair of Brass Table Lamps",
        "category": "lighting",
        "price": 95,
        "image": "lamps.svg",
        "description": "Matched pair of brass column lamps with cream linen shades. Both rewired and tested. Sold as a set.",
        "status": "available"
    },
    {
        "id": 3,
        "title": "Vintage Gold-Framed Mirror",
        "category": "decor",
        "price": 145,
        "image": "mirror.svg",
        "description": "Ornate gilt-frame oval mirror, approximately 28\" x 36\". Frame in very good condition with a beautiful warm patina.",
        "status": "hold"
    },
    {
        "id": 4,
        "title": "Oak Farmhouse Dining Table",
        "category": "furniture",
        "price": 525,
        "image": "table.svg",
        "description": "Solid oak trestle-base dining table, seats 6 comfortably. Top has been hand-sanded and re-oiled. A real workhorse piece.",
        "status": "available"
    },
    {
        "id": 5,
        "title": "Set of 4 Ladder-Back Chairs",
        "category": "furniture",
        "price": 180,
        "image": "chairs.svg",
        "description": "Four matching ladder-back chairs with rush seats. All four solid, no wobbles. Pairs beautifully with a farmhouse-style table.",
        "status": "sold"
    },
    {
        "id": 6,
        "title": "Persian-Style Area Rug",
        "category": "decor",
        "price": 225,
        "image": "rug.svg",
        "description": "Approximately 8' x 10' wool-blend rug in deep reds and navy. Cleaned and treated. Excellent condition with no thin spots.",
        "status": "available"
    }
];
