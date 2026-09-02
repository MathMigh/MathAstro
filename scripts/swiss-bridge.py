#!/usr/bin/env python3
import sys,json,swisseph as swe
B={'sun':swe.SUN,'moon':swe.MOON,'mercury':swe.MERCURY,'venus':swe.VENUS,'mars':swe.MARS,'jupiter':swe.JUPITER,'saturn':swe.SATURN,'uranus':swe.URANUS,'neptune':swe.NEPTUNE,'pluto':swe.PLUTO,'northNode':swe.TRUE_NODE}
FLAGS=swe.FLG_SWIEPH|swe.FLG_SPEED
for line in sys.stdin:
    try:
        r=json.loads(line); jd=float(r['jd']); out={}
        for t in r['types']:
            if t=='southNode':
                xx,_=swe.calc_ut(jd,swe.TRUE_NODE,FLAGS); lon=(xx[0]+180)%360; sp=xx[3]
            else:
                body=B[t];xx,_=swe.calc_ut(jd,body,FLAGS);lon=xx[0];sp=xx[3]
            out[t]={'longitude':lon,'longitudeSpeed':sp,'isRetrograde':sp<0}
        sys.stdout.write(json.dumps({'ok':True,'out':out})+'\n');sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(json.dumps({'ok':False,'error':str(e)})+'\n');sys.stdout.flush()
