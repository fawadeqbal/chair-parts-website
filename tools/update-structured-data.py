#!/usr/bin/env python3
"""Rebuild the JSON-LD structured data in index.html from the page itself.

Run after editing the FAQ, products, address, phone or hours:

    python3 tools/update-structured-data.py

It reads the FAQ questions/answers and product cards from index.html and writes
one <script type="application/ld+json"> block between the
<!-- STRUCTURED-DATA --> markers in <head>, so search engines always see the
same content as visitors. Business details live in BUSINESS below.
"""
import html
import json
import re
from pathlib import Path

INDEX = Path(__file__).resolve().parent.parent / "index.html"
SITE_URL = "https://fawadeqbal.github.io/chair-parts-website/"

BUSINESS = {
    "name": "Ali Chair Parts",
    "alternateName": "Chair Parts",
    "description": (
        "Importer and seller of office and gaming chairs and replacement chair parts in Kohati Bazar, "
        "Rawalpindi: imported chairs, gas lift cylinders, 5-star chair bases, castor wheels, armrests, "
        "tilt and synchro mechanisms and seat foam. Wholesale, retail and general order supplier."
    ),
    "telephone": "+92-300-2603791",
    "street": "Shop # 0/789, Near Shahid Steel Store, Kohati Bazar",
    "city": "Rawalpindi",
    "postalCode": "46000",
    "region": "Punjab",
    "country": "PK",
    "lat": 33.6221246,
    "lng": 73.0659639,
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=33.6221246%2C73.0659639&query_place_id=ChIJMwD6AACV3zgRhvomL9wCaDM",
    "owner": "Murad Ali",
    # As listed on the shop's Google Maps page; confirm with the owner.
    "openDays": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    "opens": "09:00",
    "closes": "17:00",
    "areaServed": ["Rawalpindi", "Islamabad"],
}


def text(fragment: str) -> str:
    """Strip tags (and decorative aria-hidden bits) and collapse whitespace."""
    fragment = re.sub(r'<(span|svg)[^>]*aria-hidden="true"[^>]*>.*?</\1>', "", fragment, flags=re.S)
    fragment = re.sub(r"<[^>]+>", "", fragment)
    return re.sub(r"\s+", " ", html.unescape(fragment)).strip()


def main() -> None:
    src = INDEX.read_text(encoding="utf-8")

    # Only the FAQ section (the footer's "Photo credits" is a <details> too)
    faq_start = src.index('id="faq-title"')
    faq_html = src[faq_start:src.index("</section>", faq_start)]
    faq = [
        {"@type": "Question", "name": text(q),
         "acceptedAnswer": {"@type": "Answer", "text": text(a)}}
        for q, a in re.findall(r"<details[^>]*>\s*<summary[^>]*>(.*?)</summary>\s*<p[^>]*>(.*?)</p>\s*</details>",
                               faq_html, flags=re.S)
    ]

    products = []
    for card in re.findall(r"<article[^>]*data-card[^>]*>.*?</article>", src, flags=re.S):
        attr = lambda k: html.unescape(re.search(rf'data-{k}="([^"]*)"', card).group(1))
        name = attr("name")
        img = re.search(r'<img[^>]+src="([^"]+)"', card)
        # No "brand": chairs are imported and the shop is not the maker. Add the real brand when known.
        item = {"@type": "Product", "name": name, "description": attr("note")}
        if img:
            item["image"] = img.group(1)
        products.append({"@type": "Offer", "itemOffered": item, "availability": "https://schema.org/InStock",
                         "seller": {"@id": SITE_URL + "#business"}})

    b = BUSINESS
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Store",
                "@id": SITE_URL + "#business",
                "name": b["name"],
                "alternateName": b["alternateName"],
                "description": b["description"],
                "url": SITE_URL,
                "image": SITE_URL + "assets/img/og-image.jpg",
                "logo": SITE_URL + "assets/img/icon-512.png",
                "telephone": b["telephone"],
                "priceRange": "Rs",
                "currenciesAccepted": "PKR",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": b["street"],
                    "addressLocality": b["city"],
                    "postalCode": b["postalCode"],
                    "addressRegion": b["region"],
                    "addressCountry": b["country"],
                },
                "geo": {"@type": "GeoCoordinates", "latitude": b["lat"], "longitude": b["lng"]},
                "hasMap": b["mapsUrl"],
                "openingHoursSpecification": [{
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": b["openDays"], "opens": b["opens"], "closes": b["closes"],
                }],
                "areaServed": [{"@type": "City", "name": c} for c in b["areaServed"]],
                "founder": {"@type": "Person", "name": b["owner"]},
                "contactPoint": {
                    "@type": "ContactPoint", "telephone": b["telephone"], "contactType": "sales",
                    "availableLanguage": ["en", "ur"],
                },
                "knowsAbout": ["Imported office chairs", "Gaming chairs", "Office chair repair parts", "Gas lift cylinders", "Chair castor wheels",
                               "5-star chair bases", "Chair armrests", "Chair tilt mechanisms"],
                "hasOfferCatalog": {
                    "@type": "OfferCatalog", "name": "Office and gaming chairs and parts",
                    "itemListElement": products,
                },
            },
            {
                "@type": "WebSite",
                "@id": SITE_URL + "#website",
                "url": SITE_URL,
                "name": b["name"],
                "inLanguage": "en-PK",
                "publisher": {"@id": SITE_URL + "#business"},
            },
            {
                "@type": "WebPage",
                "@id": SITE_URL + "#webpage",
                "url": SITE_URL,
                "name": text(re.search(r"<title>(.*?)</title>", src, re.S).group(1)),
                "description": html.unescape(re.search(r'<meta name="description" content="([^"]+)"', src).group(1)),
                "isPartOf": {"@id": SITE_URL + "#website"},
                "about": {"@id": SITE_URL + "#business"},
                "primaryImageOfPage": SITE_URL + "assets/img/og-image.jpg",
                "inLanguage": "en-PK",
            },
            {
                "@type": "FAQPage",
                "@id": SITE_URL + "#faq",
                "isPartOf": {"@id": SITE_URL + "#webpage"},
                "mainEntity": faq,
            },
        ],
    }

    block = ("<!-- STRUCTURED-DATA -->\n  <script type=\"application/ld+json\">\n"
             + json.dumps(graph, ensure_ascii=False, indent=2).replace("</", "<\\/")
             + "\n  </script>\n  <!-- /STRUCTURED-DATA -->")
    pattern = re.compile(r"<!-- STRUCTURED-DATA -->(?:.*?<!-- /STRUCTURED-DATA -->)?", re.S)
    if not pattern.search(src):
        raise SystemExit("STRUCTURED-DATA marker not found in index.html")
    src = pattern.sub(lambda _: block, src, count=1)
    INDEX.write_text(src, encoding="utf-8")
    print(f"Structured data updated: {len(products)} products, {len(faq)} FAQ entries")


if __name__ == "__main__":
    main()
