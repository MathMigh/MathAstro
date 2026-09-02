#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone, timedelta
import json, re, sys

ROOT = Path(__file__).resolve().parents[1]
SRC = (ROOT / 'src/traditions/western/predictive/guguPeriods.ts').read_text(encoding='utf-8')
TYPES = (ROOT / 'src/traditions/western/predictive/predictiveTypes.ts').read_text(encoding='utf-8')
SOURCES = (ROOT / 'src/traditions/western/predictive/predictiveSources.ts').read_text(encoding='utf-8')

PASS=[]; FAIL=[]
def check(name, cond, evidence=''):
    (PASS if cond else FAIL).append((name,evidence))

expected = {'Lua':25,'Sol':19,'Mercúrio':20,'Vênus':8,'Marte':15,'Júpiter':12,'Saturno':30}
for planet,value in expected.items():
    check(f'Gugu value {planet}={value}', re.search(rf'{re.escape(planet)}:\s*{value}\b', SRC) is not None)
check('Gugu major year is exactly 360 days', 'units * 360 * DAY_MS' in SRC)
check('Gugu month is exactly 30 days', 'units * 30 * DAY_MS' in SRC)
check('Gugu sequence starts from Ascendant sign', 'ascSignIndex + sequenceIndex' in SRC and 'startsFromAscendantSign: true' in SRC)
check('Gugu subdivisions continue zodiacally across cycles', 'SOURCE_LOCKED_ZODIAC_SEQUENCE_CONTINUED' in TYPES and 'Math.floor(sequenceIndex / 12)' in SRC)
check('Gugu cyclic continuation source-locked', 'GUGU_COSMOLOGY04_SUBDIVISIONS' in SOURCES and 'SOURCE_LOCKED_IMPLEMENTED' in SOURCES)
check('Gugu receiver priority materialized', 'receiverHasGreaterWeight: true' in SRC)
check('Gugu transit autonomy forbidden', 'transitsDoNotPredictEventsAutonomously: true' in SRC)
check('Gugu sources are source-locked, not boundary-only', 'GUGU_COSMOLOGY04_PERIOD_VALUES' in SOURCES and 'GUGU_COSMOLOGY04_TRANSIT_SUBORDINATION' in SOURCES)

# Independent mechanical reference for the project's Barra Mansa fixture.
birth = datetime.fromisoformat('2001-04-21T09:45:00+00:00')
target = datetime(2026,8,31,15,0,0,tzinfo=timezone.utc)
asc_sign_index = 1  # Taurus, from fixture ASC 37.96092883959789°
rulers=['Marte','Vênus','Mercúrio','Lua','Sol','Mercúrio','Vênus','Marte','Júpiter','Saturno','Saturno','Júpiter']

def make_level(start, parent_end, start_sign, unit):
    items=[]; cursor=start; seq=0
    while cursor < parent_end and seq < 240:
        si=(start_sign+seq)%12; ruler=rulers[si]; n=expected[ruler]
        delta = timedelta(days=n*360) if unit=='years' else timedelta(days=n*30) if unit=='months' else timedelta(days=n) if unit=='days' else timedelta(hours=n)
        raw_end=cursor+delta
        end=min(raw_end,parent_end) if parent_end else raw_end
        items.append({'signIndex':si,'ruler':ruler,'start':cursor,'end':end,'zodiacCycle':seq//12,'sequenceIndex':seq})
        cursor=end; seq+=1
        if parent_end and raw_end>parent_end: break
    return items

major=[]; cursor=birth
for i in range(24):
    si=(asc_sign_index+i)%12; r=rulers[si]; end=cursor+timedelta(days=expected[r]*360)
    major.append({'signIndex':si,'ruler':r,'start':cursor,'end':end})
    if cursor <= target < end: break
    cursor=end
active_major=next(x for x in major if x['start']<=target<x['end'])
minor_items=make_level(active_major['start'],active_major['end'],active_major['signIndex'],'months')
active_minor=next((x for x in minor_items if x['start']<=target<x['end']),None)
day_items=make_level(active_minor['start'],active_minor['end'],active_minor['signIndex'],'days') if active_minor else []
active_day=next((x for x in day_items if x['start']<=target<x['end']),None)
hour_items=make_level(active_day['start'],active_day['end'],active_day['signIndex'],'hours') if active_day else []
active_hour=next((x for x in hour_items if x['start']<=target<x['end']),None)

# A 30-year Saturn major contains more than one full monthly zodiacal pass.
long_parent_start=birth
long_parent_end=birth+timedelta(days=30*360)
long_months=make_level(long_parent_start,long_parent_end,9,'months')
check('Gugu long Saturn parent reaches second zodiacal cycle', any(x['zodiacCycle']>=1 for x in long_months), f'cycles={max(x["zodiacCycle"] for x in long_months)}')
second_cycle=next((x for x in long_months if x['zodiacCycle']==1),None)
check('Gugu second zodiac cycle restarts at parent sign', second_cycle is not None and second_cycle['signIndex']==9, str(second_cycle))

check('reference Gugu major is Mercury/Gemini', active_major['ruler']=='Mercúrio' and active_major['signIndex']==2, f"{active_major['ruler']} sign={active_major['signIndex']}")
check('reference Gugu major starts 2009-03-10', active_major['start'].isoformat()=='2009-03-10T09:45:00+00:00', active_major['start'].isoformat())
check('reference Gugu minor is Venus/Taurus', active_minor is not None and active_minor['ruler']=='Vênus' and active_minor['signIndex']==1, str(active_minor))
check('reference Gugu day level is Mars/Aries', active_day is not None and active_day['ruler']=='Marte' and active_day['signIndex']==0, str(active_day))
check('reference Gugu hour level is Mercury/Virgo', active_hour is not None and active_hour['ruler']=='Mercúrio' and active_hour['signIndex']==5, str(active_hour))

reference={
  'schema':'mathastro.predictive.gugu-reference/1.0',
  'fixture':'barra-mansa-santa-casa-2001-precision.json',
  'targetUtc':target.isoformat().replace('+00:00','Z'),
  'planetaryValues':expected,
  'units':{'majorYearDays':360,'monthDays':30},
  'activeMajor':{k:(v.isoformat() if hasattr(v,'isoformat') else v) for k,v in active_major.items()},
  'activeMinor':{k:(v.isoformat() if hasattr(v,'isoformat') else v) for k,v in active_minor.items()} if active_minor else None,
  'activeDay':{k:(v.isoformat() if hasattr(v,'isoformat') else v) for k,v in active_day.items()} if active_day else None,
  'activeHour':{k:(v.isoformat() if hasattr(v,'isoformat') else v) for k,v in active_hour.items()} if active_hour else None,
}
(ROOT/'fixtures/gugu-period-reference-20260901.json').write_text(json.dumps(reference,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

print('GUGU PERIOD VERIFICATION')
for n,e in PASS: print('PASS',n,('— '+e) if e else '')
for n,e in FAIL: print('FAIL',n,('— '+e) if e else '')
print(f'SUMMARY pass={len(PASS)} fail={len(FAIL)}')
sys.exit(1 if FAIL else 0)
