#!/usr/bin/env python3
"""Generate the product grid in index.html from the PRODUCTS list below.

Edit PRODUCTS (names, notes, photos, badges, prices), then run:

    python3 tools/build-products.py
    python3 tools/update-structured-data.py   # keeps Google's data in sync

Cards are written between the <!-- PRODUCTS:START --> / <!-- PRODUCTS:END -->
markers. Each card's "Add to quote", quick view and search read their data from
the card's data-* attributes, so nothing else needs editing.
"""
import html
import re
from pathlib import Path

INDEX = Path(__file__).resolve().parent.parent / "index.html"
WIKI = "https://upload.wikimedia.org/wikipedia/commons/thumb/"

# Photos: free-licensed stand-ins (credited in the footer) until the shop's own photos arrive.
#   "wiki":     Wikimedia Commons file (CC BY-SA 4.0) — used for the parts
#   "unsplash": Unsplash photo id (Unsplash License) — used for the chairs; cropped by Unsplash's image CDN
# To use a local photo, set "src" to e.g. "assets/img/parts/castor.webp" instead.
UNSPLASH = "https://images.unsplash.com/"
PHOTOS = {
    # Chairs (Unsplash; photographer in the comment)
    "ergo-yellow": {"unsplash": "photo-1776548759593-6fa64c60129f"},    # Jesse Kojo Kuntoh
    "ergo-green": {"unsplash": "photo-1790363140499-98c24fc643cd"},     # Jesse Kojo Kuntoh
    "mesh-white": {"unsplash": "photo-1688578735427-994ecdea3ea4"},     # EFFYDESK
    "office-black": {"unsplash": "photo-1748721566880-9e8636f3e5c6"},   # Royaloak India
    "exec-fabric": {"unsplash": "photo-1580480095047-4aa43ab3bd1d"},    # SCOPIC LTD
    "leather-grey": {"unsplash": "photo-1518455027359-f3f8164ba6bd"},   # James McDonald
    "gaming-red": {"unsplash": "photo-1770195483917-b3bb444b7a29"},     # fadoul m
    "castor-carpet": {"unsplash": "photo-1674552641751-fb7ca800deae"},  # Brett Jordan
    # Parts (Wikimedia Commons)
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

# Category ids are used by the filter tabs, category tiles and quick view (CATEGORY_NAMES in main.js).
CATEGORIES = {
    "office": "Office chairs", "gaming": "Gaming chairs", "gas": "Gas lifts", "base": "Wheels & bases",
    "arm": "Armrests", "mech": "Mechanisms", "seat": "Seats & foam",
}

# kind = which "check your old part" guide quick view shows (MEASURE in assets/js/main.js).
# price = None shows "Price on request"; set a number (e.g. 1800) to show "from Rs 1,800".
PRODUCTS = [
    # Chairs: generic types with stand-in photos — replace with the shop's actual imported models.
    dict(id="ch-ergo", cat="office", kind="chair", name="Ergonomic mesh chair", fixes="long days at the desk",
         note="Breathable mesh back, padded seat, adjustable arms and a 5-star base.", photo="ergo-yellow",
         alt="Ergonomic office chair with mesh back and yellow seat", badge="Imported", price=None),
    dict(id="ch-mesh", cat="office", kind="chair", name="Mesh chair with headrest", fixes="back and neck support",
         note="High mesh back with headrest, lumbar support and adjustable arms.", photo="mesh-white",
         alt="White ergonomic mesh office chair with headrest", badge="Imported", price=None),
    dict(id="ch-office", cat="office", kind="chair", name="Office chair — fabric, with arms", fixes="everyday office use",
         note="Padded fabric seat and back, fixed arms, 5-star base.", photo="office-black",
         alt="Black fabric office chair with arms", badge="Imported", price=None),
    dict(id="ch-exec", cat="office", kind="chair", name="Executive chair — high back", fixes="managers' cabins",
         note="Tall upholstered back, thick seat and adjustable arms.", photo="exec-fabric",
         alt="Beige upholstered high-back executive office chair", badge="Imported", price=None),
    dict(id="ch-leather", cat="office", kind="chair", name="Leather office chair", fixes="home offices and reception",
         note="Leatherette seat and back with padded arms and chrome base.", photo="leather-grey",
         alt="Grey leather office chair with chrome base beside a desk", badge="Imported", price=None),
    dict(id="ch-task", cat="office", kind="chair", name="Task chair — mesh back", fixes="staff and study desks",
         note="Compact mesh-back chair with arms, easy on smaller desks.", photo="ergo-green",
         alt="Office task chair with mesh back and green seat", badge="Imported", price=None),
    dict(id="ch-racing", cat="gaming", kind="chair", name="Gaming chair — racing style", fixes="long gaming sessions",
         note="High back, bucket seat, padded arms and pillows.", photo="gaming-red",
         alt="Red and black racing-style gaming chair", badge="Imported", price=None),
    dict(id="ch-gaming", cat="gaming", kind="chair", name="Gaming chair with footrest", fixes="gaming and relaxing",
         note="Recline, lumbar pillow and pull-out footrest.", photo="gaming", pos="50% 35%",
         alt="Black and red gaming chair", badge="Imported", price=None),
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
         note="Push-in replacement wheels that roll smoothly again.", photo="castor-carpet",
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
]


def img_tag(p):
    photo = PHOTOS[p["photo"]]
    fit = photo.get("fit", "cover")
    cls = "size-full transition-transform duration-500 ease-out group-hover:scale-[1.04] " + (
        "object-contain p-6 mix-blend-multiply" if fit == "contain" else "object-cover")
    style = f' style="object-position: {p["pos"]}"' if p.get("pos") and fit == "cover" else ""
    if "unsplash" in photo:
        u = lambda w: f'{UNSPLASH}{photo["unsplash"]}?w={w}&h={w * 5 // 4}&fit=crop&crop=entropy&q=70&auto=format'
        src = (f'src="{u(480)}" srcset="{u(320)} 320w, {u(480)} 480w, {u(720)} 720w" '
               f'sizes="(min-width: 1280px) 300px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 47vw"')
    elif "wiki" in photo:
        h, name = photo["wiki"]
        t = lambda w: f"{WIKI}{h}/{name}/{w}px-{name}"
        src = (f'src="{t(500)}" srcset="{t(330)} 330w, {t(500)} 500w, {t(960)} 960w" '
               f'sizes="(min-width: 1280px) 300px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 47vw"')
    else:
        src = f'src="{photo["src"]}"'
    return f'<img class="{cls}" {src} alt="{html.escape(p["alt"])}" width="480" height="600" loading="lazy" decoding="async"{style}>'


def card(p):
    e = lambda s: html.escape(s, quote=True)
    price = f'from Rs {p["price"]:,}' if p.get("price") else "Price on request"
    label = "Good for" if p["kind"] == "chair" else "Fixes"
    badge = (f'\n              <span class="absolute left-2.5 top-2.5 bg-ink px-2 py-1 text-[11px] font-bold uppercase leading-none '
             f'tracking-wider text-white">{e(p["badge"])}</span>') if p.get("badge") else ""
    return f'''          <li data-cat="{p["cat"]}">
            <article data-card data-id="{e(p["id"])}" data-cat="{p["cat"]}" data-kind="{p["kind"]}" data-name="{e(p["name"])}" data-fixes="{e(p["fixes"])}" data-fixes-label="{label}" data-note="{e(p["note"])}" data-price="{e(price)}" class="group relative flex h-full flex-col">
              <div class="relative aspect-[4/5] overflow-hidden rounded-card bg-sand transition-shadow duration-300 group-hover:shadow-lift">
              {img_tag(p)}{badge}
              <span class="pointer-events-none absolute inset-x-2.5 bottom-2.5 hidden translate-y-2 rounded-md bg-white/95 py-2.5 text-center text-[12px] font-bold uppercase tracking-[0.12em] text-ink opacity-0 shadow-card transition duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 md:block" aria-hidden="true">Quick view</span>
              <button type="button" data-add-quote aria-pressed="false" aria-label="Add {e(p["name"])} to quote" class="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-full bg-white/95 text-ink shadow-card transition duration-150 hover:bg-white active:scale-90 aria-pressed:bg-emerald-700 aria-pressed:text-white [&[aria-pressed=false]_.i-on]:hidden [&[aria-pressed=true]_.i-off]:hidden">
                <svg class="i-off size-5" aria-hidden="true"><use href="#i-plus"/></svg><svg class="i-on size-5" aria-hidden="true"><use href="#i-check"/></svg>
              </button>
              </div>
              <p class="mt-3 text-[12px] font-bold uppercase tracking-wider text-stone-600">{e(CATEGORIES[p["cat"]])}</p>
              <h3 class="mt-0.5 text-[15px] font-medium leading-5 text-ink decoration-ink/30 underline-offset-4 group-hover:underline sm:text-base">
                <button type="button" data-quickview class="text-left after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-600 focus-visible:after:ring-offset-2">{e(p["name"])}</button>
              </h3>
              <p class="mt-1 text-[13px] leading-snug text-stone-600">{label}: {e(p["fixes"])}</p>
              <p class="mt-1.5 text-[15px] font-bold text-ink">{e(price)}</p>
            </article>
          </li>'''


def main():
    block = "<!-- PRODUCTS:START -->\n" + "\n".join(card(p) for p in PRODUCTS) + "\n          <!-- PRODUCTS:END -->"
    src = INDEX.read_text(encoding="utf-8")
    pat = re.compile(r"<!-- PRODUCTS:START -->.*?<!-- PRODUCTS:END -->", re.S)
    if not pat.search(src):
        raise SystemExit("PRODUCTS markers not found in index.html")
    INDEX.write_text(pat.sub(lambda _: block, src, count=1), encoding="utf-8")
    print(f"Catalog built: {len(PRODUCTS)} products in {len(set(p['cat'] for p in PRODUCTS))} categories")


if __name__ == "__main__":
    main()
