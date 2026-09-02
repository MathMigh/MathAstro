#!/usr/bin/env python3
"""Independent audit of the MathAstro full fixed-star sky.

This validator does not call the application code. It reconstructs the catalogue-precession
fallback from public/vendor/sefstars.txt and checks that the catalogue is genuinely large,
that well-known stars reproduce Astro-Seek-style epoch positions, and that the Barra Mansa
reference chart cannot legitimately return an empty fixed-star contact set.
"""
from __future__ import annotations
import math
from pathlib import Path
import swisseph as swe

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "public" / "vendor" / "sefstars.txt"
JD_BARRA_MANSA = 2452020.90625


def norm(x: float) -> float:
    return x % 360.0


def precess(ra_deg: float, dec_deg: float, jd: float) -> tuple[float, float]:
    T = (jd - 2451545.0) / 36525.0
    zeta = (2306.2181*T + 0.30188*T*T + 0.017998*T*T*T) / 3600.0
    z = (2306.2181*T + 1.09468*T*T + 0.018203*T*T*T) / 3600.0
    theta = (2004.3109*T - 0.42665*T*T - 0.041833*T*T*T) / 3600.0
    a, d = map(math.radians, (ra_deg, dec_deg))
    A = math.cos(d) * math.sin(a + math.radians(zeta))
    B = math.cos(math.radians(theta))*math.cos(d)*math.cos(a+math.radians(zeta)) - math.sin(math.radians(theta))*math.sin(d)
    C = math.sin(math.radians(theta))*math.cos(d)*math.cos(a+math.radians(zeta)) + math.cos(math.radians(theta))*math.sin(d)
    return norm(math.degrees(math.atan2(A, B)) + z), math.degrees(math.asin(max(-1, min(1, C))))


def ecliptic(ra_deg: float, dec_deg: float, jd: float) -> tuple[float, float]:
    T = (jd - 2451545.0) / 36525.0
    eps = 23 + 26/60 + 21.448/3600 - (46.8150*T + 0.00059*T*T - 0.001813*T*T*T)/3600
    a, d, e = map(math.radians, (ra_deg, dec_deg, eps))
    x = math.cos(d)*math.cos(a)
    y = math.cos(d)*math.sin(a)
    z = math.sin(d)
    ye = math.cos(e)*y + math.sin(e)*z
    ze = -math.sin(e)*y + math.cos(e)*z
    return norm(math.degrees(math.atan2(ye, x))), math.degrees(math.asin(max(-1, min(1, ze))))


def read_catalog():
    stars = {}
    raw = 0
    for line in CATALOG.read_text(encoding="utf-8", errors="ignore").splitlines():
        if not line or line.lstrip().startswith("#"):
            continue
        f = line.split(",")
        if len(f) < 14:
            continue
        raw += 1
        nom = f[1].strip()
        if not nom or nom.lower() in stars:
            continue
        mag = float(f[13])
        if mag >= 90:
            continue
        ra = 15 * (float(f[3]) + float(f[4])/60 + float(f[5])/3600)
        sign = -1 if f[6].strip().startswith("-") else 1
        dec = sign * (abs(float(f[6])) + float(f[7])/60 + float(f[8])/3600)
        stars[nom.lower()] = {
            "name": f[0].strip() or nom,
            "nom": nom,
            "eq": f[2].strip(),
            "ra": ra, "dec": dec,
            "pmra": float(f[9]), "pmdec": float(f[10]), "mag": mag,
        }
    return raw, list(stars.values())


def position(star, jd):
    years = (jd - 2451545.0) / 365.25
    cosd = max(abs(math.cos(math.radians(star["dec"]))), 1e-9)
    ra = star["ra"] + (star["pmra"]/1000/cosd)*years/3600
    dec = star["dec"] + (star["pmdec"]/1000)*years/3600
    ra, dec = precess(ra, dec, jd)
    lon, lat = ecliptic(ra, dec, jd)
    return lon, lat, ra, dec


def jd_for_decimal_year(year: float) -> float:
    return 2451545.0 + (year - 2000.0) * 365.25


def angular(a, b):
    d = abs(norm(a) - norm(b))
    return 360-d if d > 180 else d


def main():
    raw, stars = read_catalog()
    assert raw >= 1100, raw
    assert len(stars) >= 1000, len(stars)
    by_name = {s["name"]: s for s in stars}

    # Astro-Seek-style published annual positions: generous 0.08° tolerance
    # (their table is year-rounded; our fallback is exact-time capable).
    checks = {
        "Sheratan": 34 + 16/60,       # Taurus 4°16' (2022)
        "Algol": 56 + 28/60,          # Taurus 26°28' (2022)
        "Kitalpha": 323 + 24/60,       # Aquarius 23°24' (2022)
        "Fomalhaut": 334 + 9/60,       # Pisces 4°09' (2022)
    }
    jd2022 = jd_for_decimal_year(2022.0)
    for name, expected in checks.items():
        lon = position(by_name[name], jd2022)[0]
        assert angular(lon, expected) < 0.08, (name, lon, expected)

    # Exact Swiss Ephemeris comparison: the browser fallback is not called
    # "swiss-exact". Around the regression epoch it must nevertheless remain
    # within one arcminute for principal stars; contacts in the last arcminute
    # of an orb are fail-closed by the TypeScript matcher.
    swe.set_ephe_path(str(ROOT / "public" / "vendor"))
    exact_names = ["Spica", "Algol", "Alcyone", "Sirius", "Castor", "Pollux", "Regulus", "Fomalhaut"]
    exact_diffs = {}
    for name in exact_names:
        fallback_lon = position(by_name[name], JD_BARRA_MANSA)[0]
        exact_lon = swe.fixstar2_ut(name, JD_BARRA_MANSA, swe.FLG_SWIEPH)[0][0]
        diff_arcsec = angular(fallback_lon, exact_lon) * 3600
        exact_diffs[name] = diff_arcsec
        assert diff_arcsec < 60, (name, fallback_lon, exact_lon, diff_arcsec)

    # Reference chart targets from the generated 21/04/2001 06:45 Barra Mansa report.
    targets = {
        "Sun": 31.348611, "Moon": 4.907778, "Mercury": 29.090833,
        "Venus": 1.485278, "Mars": 266.732778, "Jupiter": 71.493333,
        "Saturn": 60.058333, "ASC": 37.955278, "MC": 309.150556,
    }
    principals = {"Regulus","Aldebaran","Antares","Fomalhaut","Sirius","Procyon","Castor","Pollux","Spica","Algol"}
    matches = []
    for star in stars:
        if star["eq"] == "1950":
            continue
        lon = position(star, JD_BARRA_MANSA)[0]
        for point, target in targets.items():
            if int(norm(lon)//30) != int(norm(target)//30):
                continue
            orb = angular(lon, target)
            max_orb = 3 if star["name"] in principals else 1
            if orb <= max_orb:
                matches.append((orb, point, star["name"], lon))
    assert matches, "Barra Mansa reference chart unexpectedly produced zero star contacts"
    assert any(name == "Hamal" and point == "ASC" for _, point, name, _ in matches), matches[:20]

    print(f"PASS full fixed-star sky: raw={raw}, unique_stars={len(stars)}, reference_matches={len(matches)}, max_fallback_exact_error={max(exact_diffs.values()):.3f} arcsec")
    for item in sorted(matches)[:10]:
        print("  ", item)

if __name__ == "__main__":
    main()
