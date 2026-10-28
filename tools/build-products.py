#!/usr/bin/env python3
"""Generate the product catalog in index.html from the PRODUCTS list below.

Edit PRODUCTS (names, notes, photos, badges, prices), then run:

    python3 tools/build-products.py
    python3 tools/update-structured-data.py   # keeps Google's data in sync

Cards are written between the <!-- PRODUCTS:START --> / <!-- PRODUCTS:END -->
markers, grouped by category. Each card's "Add to quote" and quick view read
their data from the card's data-* attributes, so nothing else needs editing.
"""
import html
import re
from pathlib import Path

INDEX = Path(__file__).resolve().parent.parent / "index.html"
WIKI = "https://upload.wikimedia.org/wikipedia/commons/thumb/"

# Photos: Wikimedia Commons stand-ins (credited in the footer) until the shop's own photos arrive.
# To use a local photo, set "src" to e.g. "assets/img/parts/castor.webp" and leave "wiki" out.
PHOTOS = {
    "gaslift": {"wiki": ("3/3f", "Chair_gaslift.jpg"), "fit": "contain"},
    "gasdis": {"wiki": ("7/75", "Chair_gas_spring_disassembled.jpg"), "fit": "contain"},
    "caster": {"wiki": ("0/04", "Chair_caster.jpg")},
    "buero": {"wiki": ("d/d4", "Buerostuhl_%28fcm%29.jpg")},
    "sihoo04": {"wiki": ("8/8b", "Sihoo_M57_mesh_office_chair_04.jpg")},
    "sihoo13": {"wiki": ("7/79", "Sihoo_M57_mesh_office_chair_13.jpg")},
    "sihoo15": {"wiki": ("6/69", "Sihoo_M57_mesh_office_chair_15.jpg")},
    "sihoo19": {"wiki": ("c/c7", "Sihoo_M57_mesh_office_chair_19.jpg")},
    "sihoo20": {"wiki": ("8/8c", "Sihoo_M57_mesh_office_chair_20.jpg")},
    "sihoo21": {"wiki": ("e/e0", "Sihoo_M57_mesh_office_chair_21.jpg")},
    "sihoo22": {"wiki": ("d/d1", "Sihoo_M57_mesh_office_chair_22.jpg")},
    "gaming": {"wiki": ("b/b2", "Gaming_chair.jpg")},
}

# Category order = display order. "blurb" sits beside the group heading.
CATEGORIES = [
    ("gas", "Gas lifts", "For a seat that sinks or won't adjust"),
    ("base", "Wheels & bases", "For stuck wheels or a cracked base"),
    ("arm", "Armrests", "For loose or broken arms"),
    ("mech", "Mechanisms", "For a chair that won't tilt or lock"),
    ("seat", "Seats & foam", "For a flat or torn cushion"),
    ("chair", "Complete chairs", "Mesh office and gaming chairs"),
]

# kind = which "check your old part" guide quick view shows (see MEASURE in assets/js/main.js).
# price = None shows "Price on request"; set a number (e.g. 1800) to show "from Rs 1,800".
PRODUCTS = [
    dict(id="gl-std", cat="gas", kind="gas", name="Gas lift cylinder — standard", fixes="seat sinking",
         note="The part that holds your seat up. Fits most office chairs.", photo="gaslift",
         alt="Office chair gas lift cylinder", badge="Most asked", price=None),
    dict(id="gl-hd", cat="gas", kind="gas", name="Gas lift cylinder — heavy duty", fixes="sinking under weight",
         note="Stronger cylinder for executive and gaming chairs.", photo="sihoo20", pos="50% 70%",
         alt="Chrome gas lift column under an office chair seat", price=None),
    dict(id="gl-short", cat="gas", kind="gas", name="Gas lift cylinder — short", fixes="seat too high",
         note="Lower height for gaming and compact chairs.", photo="gasdis",
         alt="Gas lift cylinder and its inner parts", price=None),
    dict(id="cw-5", cat="base", kind="castor", name="Castor wheels (set of 5)", fixes="stuck or broken wheels",
         note="Push-in replacement wheels that roll smoothly again.", photo="caster",
         alt="Black office chair castor wheel", badge="Easy to fit", price=None),
    dict(id="bs-nylon", cat="base", kind="base", name="5-star nylon base", fixes="cracked or wobbly base",
         note="Strong black base for office and computer chairs.", photo="buero", pos="50% 92%",
         alt="Black five-star nylon office chair base", price=None),
    dict(id="bs-chrome", cat="base", kind="base", name="5-star chrome base", fixes="cracked base + upgrade",
         note="Polished metal base that makes any chair look premium.", photo="sihoo13", pos="50% 85%",
         alt="Polished chrome five-star office chair base", price=None),
    dict(id="ar-adj", cat="arm", kind="arm", name="Adjustable armrest (pair)", fixes="loose or broken arms",
         note="Height-adjustable with soft PU pad.", photo="sihoo22", pos="50% 45%",
         alt="Adjustable office chair armrest", badge="Easy to fit", price=None),
    dict(id="ar-fix", cat="arm", kind="arm", name="Fixed armrest (pair)", fixes="broken arms",
         note="Rigid nylon arms for staff and visitor chairs.", photo="buero", pos="50% 52%",
         alt="Fixed loop armrests on a black office chair", price=None),
    dict(id="mc-tilt", cat="mech", kind="mech", name="Tilt mechanism plate", fixes="won't tilt or lock",
         note="Seat plate with tilt lever and tension knob.", photo="sihoo21", pos="50% 60%",
         alt="Tilt mechanism plate under an office chair seat", price=None),
    dict(id="mc-sync", cat="mech", kind="mech", name="Synchro mechanism", fixes="stiff or loose recline",
         note="Seat and back recline together, with lock positions.", photo="sihoo19", pos="50% 55%",
         alt="Mesh office chair with synchro recline mechanism", price=None),
    dict(id="st-foam", cat="seat", kind="seat", name="Seat foam & cover", fixes="flat or torn cushion",
         note="Comfortable new cushion in fabric or leatherette.", photo="sihoo15", pos="50% 60%",
         alt="Office chair seat cushion", price=None),
    dict(id="ch-mesh", cat="chair", kind="chair", name="Mesh office chair with headrest", fixes="back pain at the desk",
         note="Breathable mesh back, adjustable arms and headrest.", photo="sihoo04", pos="50% 30%",
         alt="Black mesh office chair with headrest and chrome base", price=None),
    dict(id="ch-gaming", cat="chair", kind="chair", name="Gaming chair with footrest", fixes="long gaming sessions",
         note="Recline, lumbar pillow and pull-out footrest.", photo="gaming", pos="50% 35%",
         alt="Black and red gaming chair", price=None),
]


def img_attrs(p):
    photo = PHOTOS[p["photo"]]
    fit = photo.get("fit", "cover")
    cls = "size-full transition-transform duration-300 ease-out group-hover:scale-[1.03] " + (
        "object-contain bg-white p-3" if fit == "contain" else "object-cover")
    style = f' style="object-position: {p["pos"]}"' if p.get("pos") and fit == "cover" else ""
    if "wiki" in photo:
        h, name = photo["wiki"]
        t = lambda w: f"{WIKI}{h}/{name}/{w}px-{name}"
        src = f'src="{t(500)}" srcset="{t(330)} 330w, {t(500)} 500w, {t(960)} 960w" sizes="(min-width: 1024px) 270px, (min-width: 768px) 31vw, 47vw"'
    else:
        src = f'src="{photo["src"]}"'
    return f'<img class="{cls}" {src} alt="{html.escape(p["alt"])}" width="500" height="375" loading="lazy" decoding="async"{style}>'


def card(p):
    e = lambda s: html.escape(s, quote=True)
    badge = (f'\n                <span class="absolute left-2 top-2 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase '
             f'tracking-wider text-amber-800 ring-1 ring-amber-200">{e(p["badge"])}</span>') if p.get("badge") else ""
    price = f'from Rs {p["price"]:,}' if p.get("price") else "Price on request"
    return f'''            <li>
              <article data-card data-id="{e(p["id"])}" data-cat="{p["cat"]}" data-kind="{p["kind"]}" data-name="{e(p["name"])}" data-fixes="{e(p["fixes"])}" data-note="{e(p["note"])}" data-price="{e(price)}"
                class="group relative flex h-full flex-col overflow-hidden rounded-card border border-slate-200 bg-white shadow-card transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lift">
                <div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {img_attrs(p)}{badge}
                </div>
                <div class="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
                  <h4 class="line-clamp-2 text-[15px] font-bold leading-5 sm:text-[17px] sm:leading-[22px]">
                    <button type="button" data-quickview class="text-left after:absolute after:inset-0 after:z-0 after:rounded-card focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-600">{e(p["name"])}</button>
                  </h4>
                  <p class="text-[13px] font-semibold leading-snug text-slate-700"><span class="font-medium text-slate-500">Fixes:</span> {e(p["fixes"])}</p>
                  <p class="hidden text-sm leading-5 text-slate-600 sm:block">{e(p["note"])}</p>
                  <p class="mt-auto pt-1 text-[13px] font-semibold text-slate-900 sm:text-sm">{e(price)}</p>
                  <button type="button" data-add-quote aria-pressed="false" class="btn btn-action relative z-10 min-h-11 whitespace-nowrap px-2.5 text-[15px] sm:px-3 aria-pressed:bg-emerald-50 aria-pressed:text-emerald-800 aria-pressed:ring-1 aria-pressed:ring-emerald-200 aria-pressed:hover:bg-emerald-100 [&[aria-pressed=true]>svg]:hidden">
                    <svg class="hidden size-[18px] shrink-0 sm:block" aria-hidden="true"><use href="#i-plus"/></svg><span data-label>Add to quote</span>
                  </button>
                </div>
              </article>
            </li>'''


def main():
    groups = []
    for cat, title, blurb in CATEGORIES:
        items = [p for p in PRODUCTS if p["cat"] == cat]
        if not items:
            continue
        n = len(items)
        groups.append(f'''          <section data-group="{cat}" aria-labelledby="g-{cat}" class="rounded-2xl border border-slate-200 bg-white/70 p-2.5 sm:p-4">
            <div class="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
              <h3 id="g-{cat}" class="font-display text-[26px] font-bold leading-none">{html.escape(title)}</h3>
              <p class="text-sm text-slate-600">{html.escape(blurb)} · {n} part{"s" if n != 1 else ""}</p>
            </div>
            <ul role="list" class="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4">
{chr(10).join(card(p) for p in items)}
            </ul>
          </section>''')
    block = "<!-- PRODUCTS:START -->\n" + "\n".join(groups) + "\n          <!-- PRODUCTS:END -->"
    src = INDEX.read_text(encoding="utf-8")
    pat = re.compile(r"<!-- PRODUCTS:START -->.*?<!-- PRODUCTS:END -->", re.S)
    if not pat.search(src):
        raise SystemExit("PRODUCTS markers not found in index.html")
    INDEX.write_text(pat.sub(lambda _: block, src, count=1), encoding="utf-8")
    print(f"Catalog built: {len(PRODUCTS)} products in {len(groups)} groups")


if __name__ == "__main__":
    main()
