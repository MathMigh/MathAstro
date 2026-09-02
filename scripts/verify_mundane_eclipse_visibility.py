#!/usr/bin/env python3
import math, swisseph as swe
AU_KM=149_597_870.7; RE=6378.137; F=1/298.257223563; RS=696_340; RM=1737.4; RAD=math.pi/180; DEG=180/math.pi
LOC=(-46.6333,-23.5505,760.0)
def ck(name,cond,detail=''):
    print(('PASS' if cond else 'FAIL'),name,detail)
    if not cond: raise SystemExit(1)
def norm(x): return x%360
def signed(x):
    x=norm(x); return x-360 if x>=180 else x
def eq(lon,lat):
    l=lon*RAD;b=lat*RAD;e=23.4392911*RAD
    x=math.cos(b)*math.cos(l);y=math.cos(b)*math.sin(l)*math.cos(e)-math.sin(b)*math.sin(e);z=math.cos(b)*math.sin(l)*math.sin(e)+math.sin(b)*math.cos(e)
    return norm(math.atan2(y,x)*DEG),math.asin(max(-1,min(1,z)))*DEG
def gst(jd):
    T=(jd-2451545)/36525
    return norm(280.46061837+360.98564736629*(jd-2451545)+0.000387933*T*T-T*T*T/38710000)
def topo(jd,body):
    xx,_=swe.calc_ut(jd,body,swe.FLG_SWIEPH|swe.FLG_SPEED)
    ra,dec=eq(xx[0],xx[1]);r=xx[2]*AU_KM/RE;rar=ra*RAD;decr=dec*RAD
    ox=r*math.cos(decr)*math.cos(rar);oy=r*math.cos(decr)*math.sin(rar);oz=r*math.sin(decr)
    phi=LOC[1]*RAD;u=math.atan((1-F)*math.tan(phi));rc=math.cos(u);rs=(1-F)*math.sin(u);th=(gst(jd)+LOC[0])*RAD
    x=ox-rc*math.cos(th);y=oy-rc*math.sin(th);z=oz-rs;dist=math.sqrt(x*x+y*y+z*z)
    tra=norm(math.atan2(y,x)*DEG);tdec=math.asin(z/dist)*DEG;H=signed(gst(jd)+LOC[0]-tra)*RAD
    alt=math.asin(math.sin(phi)*math.sin(tdec*RAD)+math.cos(phi)*math.cos(tdec*RAD)*math.cos(H))*DEG
    return tra,tdec,dist*RE,alt
def sep(a,b):
    r1,d1,_,_=a;r2,d2,_,_=b;r1*=RAD;r2*=RAD;d1*=RAD;d2*=RAD
    return math.acos(max(-1,min(1,math.sin(d1)*math.sin(d2)+math.cos(d1)*math.cos(d2)*math.cos(r1-r2))))*DEG
def disc_eval(jd):
    s=topo(jd,swe.SUN);m=topo(jd,swe.MOON);d=sep(s,m);sr=math.asin(RS/s[2])*DEG;mr=math.asin(RM/m[2])*DEG;over=sr+mr-d;mag=max(0,min(2,over/(2*sr)))
    return d,over,mag,s[3]
def custom_solar_local(start_jd):
    flag,tret=swe.sol_eclipse_when_glob(start_jd,swe.FLG_SWIEPH,0,False);begin,end=tret[2],tret[3]
    if not begin or not end: return flag,tret,None
    best=None;step=2/(24*60)
    j=begin
    while j<=end+1e-9:
        v=disc_eval(min(j,end))
        if v[3]>-0.833 and v[1]>0 and (best is None or v[0]<best[1][0]): best=(j,v)
        j+=step
    if best is None:return flag,tret,None
    l=max(begin,best[0]-4/(24*60));r=min(end,best[0]+4/(24*60))
    for _ in range(28):
        m1=l+(r-l)/3;m2=r-(r-l)/3
        if disc_eval(m1)[0]<disc_eval(m2)[0]:r=m2
        else:l=m1
    j=(l+r)/2;return flag,tret,(j,disc_eval(j))
def date_tuple(jd):
    y,m,d,h=swe.revjul(jd,swe.GREG_CAL);return y,m,d,h
# Physical year anchors
start=swe.julday(2024,3,20);end=swe.julday(2025,3,20)
events=[]
for kind,fn in [('solar',swe.sol_eclipse_when_glob),('lunar',swe.lun_eclipse_when)]:
    cur=start-1
    while True:
        flag,tret=fn(cur,swe.FLG_SWIEPH,0,False);mx=tret[0]
        if mx>end:break
        if mx>=start:events.append((mx,kind,flag))
        cur=mx+1
ck('REAL Aries-2024 year has five physical eclipses',len(events)==5,str([(date_tuple(x[0])[:3],x[1]) for x in sorted(events)]))
# São Paulo: Apr 8 is not locally visible; next visible solar is Oct 2.
local_flag,local_tret,local_attr=swe.sol_eclipse_when_loc(swe.julday(2024,4,1),LOC,swe.FLG_SWIEPH,False)
y,m,d,h=date_tuple(local_tret[0]);ck('REAL São Paulo next visible 2024 solar eclipse is 2 Oct',(y,m,d)==(2024,10,2),f'{y}-{m}-{d} {h:.6f}h mag={local_attr[0]:.9f}')
flag,tret,custom=custom_solar_local(swe.julday(2024,9,20));ck('MathAstro topocentric disc geometry finds Oct 2 locally',custom is not None)
cmx,vals=custom;official=local_tret[0];ck('MathAstro local maximum baseline within 2 minutes of Swiss local',abs(cmx-official)*24*60<2,f'delta_min={abs(cmx-official)*24*60:.4f}')
ck('MathAstro local magnitude baseline within 0.002 of Swiss local',abs(vals[2]-local_attr[0])<0.002,f'custom={vals[2]:.9f} swiss={local_attr[0]:.9f}')
# Confirm Apr 8 global eclipse produces no disc overlap above horizon in São Paulo.
flag8,tret8,custom8=custom_solar_local(swe.julday(2024,4,1));y8,m8,d8,_=date_tuple(tret8[0]);ck('REAL Apr 8 global eclipse identified',(y8,m8,d8)==(2024,4,8));ck('REAL Apr 8 eclipse not locally visible in São Paulo',custom8 is None)
print('SUMMARY mundane eclipse visibility pass=7 fail=0')
