#!/usr/bin/env python3
from bs4 import BeautifulSoup
from pathlib import Path
import re,json,datetime,zoneinfo,swisseph as swe
ROOT=Path(__file__).resolve().parents[1]
EPUB=Path('/mnt/data/horary_examples_epub/text')
MATRIX=json.loads((ROOT/'fixtures/horary/horary-examples-category-matrix.json').read_text())
SIGNS_PT=['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes']
SIGNS_EN=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
NAMES={'sun':'Sol','moon':'Lua','mercury':'Mercúrio','venus':'Vênus','mars':'Marte','jupiter':'Júpiter','saturn':'Saturno','uranus':'Urano','neptune':'Netuno','pluto':'Plutão','northNode':'Nodo Norte','southNode':'Nodo Sul'}
BODIES={'sun':swe.SUN,'moon':swe.MOON,'mercury':swe.MERCURY,'venus':swe.VENUS,'mars':swe.MARS,'jupiter':swe.JUPITER,'saturn':swe.SATURN,'uranus':swe.URANUS,'neptune':swe.NEPTUNE,'pluto':swe.PLUTO,'northNode':swe.TRUE_NODE}
LOC={
 'London, England':(51.5074,-0.1278,'Europe/London'),
 'Herzliya, Israel':(32.1663,34.8433,'Asia/Jerusalem'),
 'Wauwatosa, WI':(43.0495,-88.0076,'America/Chicago'),
 'Barra Velha/SC, Brazil':(-26.6322,-48.6847,'America/Sao_Paulo'),
 'Thessaloniki, Greece':(40.6401,22.9444,'Europe/Athens'),
 'Milwaukee, WI':(43.0389,-87.9065,'America/Chicago'),
 'Redmond, WA':(47.6740,-122.1215,'America/Los_Angeles'),
 'Warsaw, Poland':(52.2297,21.0122,'Europe/Warsaw'),
 'San Diego, CA':(32.7157,-117.1611,'America/Los_Angeles'),
 'Seattle, WA':(47.6062,-122.3321,'America/Los_Angeles'),
 'Highland Park, IL':(42.1817,-87.8003,'America/Chicago'),
 'Selma, IN':(40.1917,-85.2689,'America/Indiana/Indianapolis'),
 'Poznan, Poland':(52.4064,16.9252,'Europe/Warsaw'),
 'Placitas, NM':(35.3067,-106.4247,'America/Denver'),
}
PAT=re.compile(r'([A-Z][a-z]+\s+\d{1,2},\s+\d{4},\s+\d{1,2}:\d{2}\s+[AP]\.M\.)\s*\|\s*([^|]+?)\s*\|\s*([0-9]+(?:\.[0-9]+)?)\s+([A-Za-z]+)')
AUTHORS=['Fotini Christodoulou','Leah Cuperman','John Frawley','Marcos Monteiro','Molly Morrissey','Kathryn Silvestre']
def norm(x): return x%360
def anti(x): return norm(180-x)
def circ(a,b):
 d=abs(norm(a)-norm(b)); return min(d,360-d)
def parse_local(s,zone):
 s=s.replace('A.M.','AM').replace('P.M.','PM')
 naive=datetime.datetime.strptime(s,'%B %d, %Y, %I:%M %p')
 return naive.replace(tzinfo=zoneinfo.ZoneInfo(zone))
def mk_chart(local,lat,lon,place,zone):
 utc=local.astimezone(datetime.timezone.utc); uh=utc.hour+utc.minute/60+utc.second/3600; jd=swe.julday(utc.year,utc.month,utc.day,uh,swe.GREG_CAL); flags=swe.FLG_SWIEPH|swe.FLG_SPEED
 planets=[]; idx=0
 for typ,body in BODIES.items():
  xx,_=swe.calc_ut(jd,body,flags);lo,la,dist,sp,lasp,dsp=xx[:6]
  planets.append({'name':NAMES[typ],'type':typ,'id':idx,'longitude':lo,'longitudeRaw':lo,'longitudeSpeed':sp,'latitudeRaw':la,'latitudeSpeed':lasp,'distanceRaw':dist,'sign':SIGNS_PT[int(lo//30)%12],'antiscion':anti(lo),'antiscionRaw':anti(lo),'isRetrograde':sp < -1e-6}); idx+=1
 n=next(p for p in planets if p['type']=='northNode'); slo=norm(n['longitudeRaw']+180)
 planets.append({'name':'Nodo Sul','type':'southNode','id':idx,'longitude':slo,'longitudeRaw':slo,'longitudeSpeed':n['longitudeSpeed'],'latitudeRaw':-n.get('latitudeRaw',0),'latitudeSpeed':-n.get('latitudeSpeed',0),'distanceRaw':n.get('distanceRaw'),'sign':SIGNS_PT[int(slo//30)%12],'antiscion':anti(slo),'antiscionRaw':anti(slo),'isRetrograde':n['isRetrograde']})
 cusps,ascmc=swe.houses_ex(jd,lat,lon,b'R'); houses=list(cusps)
 birth={'year':local.year,'month':local.month,'day':local.day,'time':local.strftime('%H:%M'),'coordinates':{'name':place,'displayName':place,'latitude':lat,'longitude':lon,'timezone':zone,'timezoneSource':'user','source':'manual','precision':'municipality'}}
 hd={'house':houses,'housesWithSigns':[SIGNS_PT[int(x//30)%12] for x in houses],'ascendant':ascmc[0],'mc':ascmc[1],'armc':ascmc[2],'vertex':ascmc[3],'equatorialAscendant':ascmc[4],'kochCoAscendant':ascmc[5],'munkaseyCoAscendant':ascmc[5],'munkaseyPolarAscendant':ascmc[7],'houseSystem':'Regiomontanus','houseSystemCode':'R'}
 meta={'engine':'Swiss Ephemeris','enginePackage':'PySwissEph audit','enginePackageVersion':getattr(swe,'version','unknown'),'julianDayUt':jd,'utcIso':utc.isoformat().replace('+00:00','Z'),'timezone':zone,'zodiac':'Tropical','houseSystem':'Regiomontanus','houseSystemCode':'R','availableHouseSystems':['Regiomontanus'],'nodeMode':'Nodo verdadeiro','calendar':'Gregoriano','ephemerisFlags':['SEFLG_SWIEPH','SEFLG_SPEED'],'coordinatePrecision':'municipio','timezoneSource':'tzdb','locationSource':'audit-city-centroid','locationPrecision':'municipality'}
 return {'planets':planets,'housesData':hd,'birthDate':birth,'fixedStars':[],'calculationMetadata':meta}

out=[]
for idx,case in enumerate(MATRIX):
 p=EPUB/f'part0000_split_{idx+5:03d}.html'
 text='\n'.join(BeautifulSoup(p.read_text(errors='ignore'),'html.parser').stripped_strings)
 m=PAT.search(text)
 if not m: raise RuntimeError(f'No metadata in {p}')
 date_s,place,deg,sign=m.group(1),m.group(2).strip(),float(m.group(3)),m.group(4)
 if place not in LOC: raise RuntimeError(f'Unknown location {place!r}')
 lat,lon,zone=LOC[place]; local=parse_local(date_s,zone); chart=mk_chart(local,lat,lon,place,zone)
 author=next((a for a in AUTHORS if a in text[:m.start()]),None)
 exp=SIGNS_EN.index(sign)*30+deg; delta=circ(chart['housesData']['ascendant'],exp)
 row={**case,'author':author,'sourceHtml':p.name,'sourceLocalTimestamp':date_s,'sourceLocation':place,'publishedAsc':{'sign':sign,'degree':deg,'longitude':exp},'computedAsc':chart['housesData']['ascendant'],'ascDeltaDegrees':delta,'context':{'topic':case['topics'][0],'concreteQuestion':case['title'],'questionUnderstood':True,'questionAccepted':True,'intents':case['intents']},'chart':chart}
 if case['id']=='HE-10':
  row['sourceInternalConflict']={'field':'ascendant','prose':'19 Cancer','chartImage':'9 Cancer 14 arcmin','note':'The case prose line and embedded chart disagree; Swiss reconstruction matches the chart image.'}
 out.append(row)
path=ROOT/'fixtures/horary/horary-examples-all-swiss.json'; path.write_text(json.dumps(out,ensure_ascii=False,indent=2));
print(path)
print('cases',len(out),'maxAscDelta',max(x['ascDeltaDegrees'] for x in out),'over1',sum(x['ascDeltaDegrees']>=1 for x in out),'over2',sum(x['ascDeltaDegrees']>=2 for x in out))
for x in sorted(out,key=lambda x:x['ascDeltaDegrees'],reverse=True)[:12]: print(x['id'],x['sourceLocation'],x['publishedAsc'],round(x['computedAsc'],4),round(x['ascDeltaDegrees'],4),x['chart']['calculationMetadata']['utcIso'])
