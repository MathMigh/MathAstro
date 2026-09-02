from __future__ import annotations
import json, math
from pathlib import Path
import swisseph as swe

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = json.loads((ROOT / "fixtures/mundane-frawley-coventry-1940.json").read_text(encoding="utf-8"))
LAT = float(FIXTURE["location"]["latitude"])
LON = float(FIXTURE["location"]["longitude"])
TOL = FIXTURE["tolerancesDeg"]
checks=[]

def ck(name: str, ok: bool, detail: str=""):
    checks.append((name,bool(ok),detail))
    print(("PASS" if ok else "FAIL"), name, detail)

def norm(v): return v % 360.0

def dist(a,b): return abs(((a-b+180.0)%360.0)-180.0)

def aspect_residual(a,b,angle): return abs(dist(a,b)-angle)

def pos(jd,pid):
    xx,_=swe.calc_ut(jd,pid,swe.FLG_SWIEPH|swe.FLG_SPEED)
    return norm(xx[0])

def jd(y,m,d,h=0.0,calendar=swe.GREG_CAL): return swe.julday(y,m,d,h,calendar)

# 1) Coventry foundation chart — use historical Julian date and Placidus, matching Frawley's radix practice/source chart.
radix_jd=jd(1345,1,21,0.0,swe.JUL_CAL)
radix_cusps,radix_ascmc=swe.houses_ex(radix_jd,LAT,LON,b'P')
radix_asc=norm(radix_ascmc[0]); radix_dsc=norm(radix_asc+180); radix_c8=norm(radix_cusps[7])
ck("REAL Coventry radix ASC is Venus-ruled Libra", 180 <= radix_asc < 210, f"ASC={radix_asc:.6f}°")
# Regression guard: Regiomontanus does not reproduce the source's eighth-cusp/GC-MC fit nearly as well.
regio_cusps,_=swe.houses_ex(radix_jd,LAT,LON,b'R')

# 2) 1921 Grand Conjunction published time.
gc_jd=jd(1921,9,10,4+14/60)
jup=pos(gc_jd,swe.JUPITER); sat=pos(gc_jd,swe.SATURN); mars_gc=pos(gc_jd,swe.MARS)
_,gc_ascmc=swe.houses_ex(gc_jd,LAT,LON,b'R')
gc_mc=norm(gc_ascmc[1])
ck("REAL 1921 GC Jupiter-Saturn exact at published time", dist(jup,sat)*3600 < TOL["exactConjunctionArcsec"], f"sep={dist(jup,sat)*3600:.6f} arcsec")
ck("REAL Coventry radix VIII aligns with 1921 GC MC", dist(radix_c8,gc_mc) < TOL["publishedExactOrConj"], f"radix C8={radix_c8:.6f}° GC MC={gc_mc:.6f}° sep={dist(radix_c8,gc_mc):.6f}°")
ck("REAL source reproduction requires Placidus radix VIII over Regiomontanus", dist(radix_c8,gc_mc) < dist(norm(regio_cusps[7]),gc_mc), f"P={dist(radix_c8,gc_mc):.6f}° R={dist(norm(regio_cusps[7]),gc_mc):.6f}°")
ck("REAL Mars closely squares GC MC", aspect_residual(mars_gc,gc_mc,90) < TOL["closeSquareResidual"], f"residual={aspect_residual(mars_gc,gc_mc,90):.6f}°")

# 3) 1921 Aries ingress.
ing_jd=jd(1921,3,21,3+51/60)
sun_i=pos(ing_jd,swe.SUN); mars_i=pos(ing_jd,swe.MARS); south_true=norm(pos(ing_jd,swe.TRUE_NODE)+180)
ck("REAL 1921 Aries ingress Sun=0 Aries", dist(sun_i,0)*3600 < 1.0, f"Sun={sun_i:.9f}°")
ck("REAL ingress Mars conjunct South Node near 27 Aries", dist(mars_i,south_true) < 1.0 and 26 <= mars_i < 28 and 26 <= south_true < 29, f"Mars={mars_i:.6f}° SN={south_true:.6f}° sep={dist(mars_i,south_true):.6f}°")
ck("REAL ingress Mars/South Node activate Coventry DSC", min(dist(mars_i,radix_dsc),dist(south_true,radix_dsc)) < TOL["publishedExactOrConj"], f"DSC={radix_dsc:.6f}° Mars sep={dist(mars_i,radix_dsc):.6f}° SN sep={dist(south_true,radix_dsc):.6f}°")

# 4) Eclipse used by Frawley, 3 May 1939. At published chart time the syzygy is lunar; Swiss maximum is ~1h earlier.
ecl_jd=jd(1939,5,3,16+11/60)
sun_e=pos(ecl_jd,swe.SUN); moon_e=pos(ecl_jd,swe.MOON)
flag,tret=swe.lun_eclipse_when(jd(1939,5,1),swe.FLG_SWIEPH,0,False)
max_jd=tret[0]
ck("REAL 1939 published eclipse chart is a lunar syzygy", aspect_residual(sun_e,moon_e,180) < 1.0, f"phase residual={aspect_residual(sun_e,moon_e,180):.6f}°")
ck("REAL Swiss lunar eclipse maximum matches same date/window", abs(max_jd-ecl_jd)*24 < 1.1, f"delta={abs(max_jd-ecl_jd)*24:.6f} h flag={flag}")
# Source says Venus is Lord of this eclipse. At the source time the Sun is in Taurus, a Venus domicile.
ck("REAL Coventry eclipse example supports Venus lord at a Taurus solar point", 30 <= sun_e < 60, f"Sun={sun_e:.6f}° Taurus; source Lord=Venus")

# 5) Full Moon on the raid night.
fm_jd=jd(1940,11,15,2+23/60)
sun_f=pos(fm_jd,swe.SUN); moon_f=pos(fm_jd,swe.MOON); mars_f=pos(fm_jd,swe.MARS)
ck("REAL raid Full Moon phase at published time", aspect_residual(sun_f,moon_f,180) < TOL["phaseResidual"], f"residual={aspect_residual(sun_f,moon_f,180):.9f}°")
ck("REAL raid Moon is about 22 Taurus", 51.0 <= moon_f <= 53.5, f"Moon={moon_f:.6f}°")
ck("REAL raid Moon hits Coventry radical VIII", dist(moon_f,radix_c8) < 1.0, f"sep={dist(moon_f,radix_c8):.6f}°")
ck("REAL raid Moon returns to 1921 GC MC degree", dist(moon_f,gc_mc) < 1.0, f"sep={dist(moon_f,gc_mc):.6f}°")
ck("REAL raid Mars hits Coventry radical ASC", dist(mars_f,radix_asc) < 1.0, f"Mars={mars_f:.6f}° ASC={radix_asc:.6f}° sep={dist(mars_f,radix_asc):.6f}°")


# 6) Marcos Monteiro real teaching example: pandemic onset hierarchy (Aula 9, Estrelas Fixas).
# The methodological regression is temporal: the late-2019 onset belongs to the 2000 GC,
# not the December-2020 GC that happened after the process had already begun.
marcos_fixture=json.loads((ROOT / "fixtures/mundane-marcos-pandemic-2019.json").read_text(encoding="utf-8"))
process_onset=jd(2019,11,1,0)
gc2000=jd(2000,5,28,16+5/60+13/3600)
gc2020=jd(2020,12,21,18+20/60+37/3600)
ck("REAL Marcos pandemic origin uses 2000 GC before onset", gc2000 < process_onset < gc2020, f"onset JD={process_onset:.6f}")
ck("REAL Marcos 2000 GC anchor is astronomically exact", dist(pos(gc2000,swe.JUPITER),pos(gc2000,swe.SATURN))*3600 < 1.0, f"sep={dist(pos(gc2000,swe.JUPITER),pos(gc2000,swe.SATURN))*3600:.6f} arcsec")
ck("REAL Marcos 2020 GC anchor is astronomically exact but post-onset", dist(pos(gc2020,swe.JUPITER),pos(gc2020,swe.SATURN))*3600 < 1.0 and gc2020>process_onset, f"sep={dist(pos(gc2020,swe.JUPITER),pos(gc2020,swe.SATURN))*3600:.6f} arcsec")
# July 2, 2019 solar eclipse.
flag_s,tret_s=swe.sol_eclipse_when_glob(jd(2019,7,1),swe.FLG_SWIEPH,0,False)
solar_max=tret_s[0]
y,m,d,h=swe.revjul(solar_max,swe.GREG_CAL)
ck("REAL Marcos nearest 2019 eclipse is solar on 2 July", (y,m,d)==(2019,7,2), f"max={y:04d}-{m:02d}-{d:02d} {h:.6f}h flag={flag_s}")
# Source-defined structural invariants at the physical maximum, set for Beijing.
beijing_lat=float(marcos_fixture["location"]["latitude"]); beijing_lon=float(marcos_fixture["location"]["longitude"])
_,beijing_ascmc=swe.houses_ex(solar_max,beijing_lat,beijing_lon,b'R')
sun_s=pos(solar_max,swe.SUN); moon_s=pos(solar_max,swe.MOON); fortune=norm(beijing_ascmc[0]+moon_s-sun_s)
ck("REAL Marcos solar-eclipse Sun/Moon contact is structural", dist(sun_s,moon_s)<0.2, f"sep={dist(sun_s,moon_s):.6f}°")
ck("REAL Marcos solar-eclipse Fortune/ASC contact is structural", dist(fortune,beijing_ascmc[0])<0.2, f"sep={dist(fortune,beijing_ascmc[0]):.6f}°")
# Exact 2019 cardinal ingresses used for narrowing.
def sun_root(target,start,end):
    a=start;b=end; fa=((pos(a,swe.SUN)-target+180)%360)-180
    for _ in range(70):
        mid=(a+b)/2; fm=((pos(mid,swe.SUN)-target+180)%360)-180
        if fa*fm<=0: b=mid
        else: a=mid;fa=fm
    return (a+b)/2
aries2019=sun_root(0,jd(2019,3,19),jd(2019,3,22)); libra2019=sun_root(180,jd(2019,9,21),jd(2019,9,24)); cap2019=sun_root(270,jd(2019,12,20),jd(2019,12,23))
ck("REAL Marcos Aries 2019 ingress exact", dist(pos(aries2019,swe.SUN),0)*3600<1.0, f"{swe.revjul(aries2019,swe.GREG_CAL)}")
ck("REAL Marcos Libra 2019 ingress exact", dist(pos(libra2019,swe.SUN),180)*3600<1.0, f"{swe.revjul(libra2019,swe.GREG_CAL)}")
ck("REAL Marcos onset precedes Capricorn 2019 ingress", process_onset<cap2019, f"Capricorn ingress={swe.revjul(cap2019,swe.GREG_CAL)}")

failed=[x for x in checks if not x[1]]
print(f"SUMMARY real-case pass={len(checks)-len(failed)} fail={len(failed)}")
raise SystemExit(1 if failed else 0)
