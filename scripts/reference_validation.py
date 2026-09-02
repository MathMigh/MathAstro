#!/usr/bin/env python3
"""Independent high-precision reference fixture for MathAstro natal engine.

This script is an audit oracle, not a production dependency. It uses pyswisseph
against the same birth instant to generate expected values for regression tests.
"""
from __future__ import annotations
import json, math, os
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from pathlib import Path
import swisseph as swe

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'fixtures'/'barra-mansa-santa-casa-2001-precision.json'
REPORT=ROOT/'docs'/'FORMULARIO_VALIDACAO_BARRA_MANSA_2001.md'
STAR_DIR=ROOT/'public'/'vendor'
swe.set_ephe_path(str(STAR_DIR))

LAT=-22.54129765301692
LON=-44.17411375
LOCAL=datetime(2001,4,21,6,45,tzinfo=ZoneInfo('America/Sao_Paulo'))
UTC=LOCAL.astimezone(timezone.utc)
JD=swe.julday(UTC.year, UTC.month, UTC.day, UTC.hour + UTC.minute/60 + UTC.second/3600, swe.GREG_CAL)

SIGNS=['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes']
ELEMENT=['Fogo','Terra','Ar','Água']
MODE=['Cardinal','Fixo','Mutável']*4
DOM=['Marte','Vênus','Mercúrio','Lua','Sol','Mercúrio','Vênus','Marte','Júpiter','Saturno','Saturno','Júpiter']
EXALT={'Sol':0,'Lua':1,'Mercúrio':5,'Vênus':11,'Marte':9,'Júpiter':3,'Saturno':6}
DETR={'Sol':[10],'Lua':[9],'Mercúrio':[8,11],'Vênus':[0,7],'Marte':[1,6],'Júpiter':[2,5],'Saturno':[3,4]}
FALL={'Sol':6,'Lua':7,'Mercúrio':11,'Vênus':5,'Marte':3,'Júpiter':9,'Saturno':0}
TRIP={0:{'day':'Sol','night':'Júpiter'},1:{'day':'Vênus','night':'Lua'},2:{'day':'Saturno','night':'Mercúrio'},3:{'day':'Marte','night':'Marte'}}
TERMS=[
 [('Júpiter',6),('Vênus',14),('Mercúrio',21),('Marte',26),('Saturno',30)],
 [('Vênus',8),('Mercúrio',15),('Júpiter',22),('Saturno',26),('Marte',30)],
 [('Mercúrio',7),('Júpiter',14),('Vênus',21),('Saturno',25),('Marte',30)],
 [('Marte',6),('Júpiter',13),('Mercúrio',20),('Vênus',27),('Saturno',30)],
 [('Saturno',6),('Mercúrio',13),('Vênus',19),('Júpiter',25),('Marte',30)],
 [('Mercúrio',7),('Vênus',13),('Júpiter',18),('Saturno',24),('Marte',30)],
 [('Saturno',6),('Vênus',11),('Júpiter',18),('Mercúrio',24),('Marte',30)],
 [('Marte',6),('Júpiter',14),('Vênus',21),('Mercúrio',27),('Saturno',30)],
 [('Júpiter',8),('Vênus',14),('Mercúrio',19),('Saturno',25),('Marte',30)],
 [('Vênus',6),('Mercúrio',12),('Júpiter',19),('Marte',25),('Saturno',30)],
 [('Saturno',6),('Mercúrio',12),('Vênus',20),('Júpiter',25),('Marte',30)],
 [('Vênus',8),('Júpiter',14),('Mercúrio',20),('Marte',26),('Saturno',30)],
]
FACES=[['Marte','Sol','Vênus'],['Mercúrio','Lua','Saturno'],['Júpiter','Marte','Sol'],['Vênus','Mercúrio','Lua'],['Saturno','Júpiter','Marte'],['Sol','Vênus','Mercúrio'],['Lua','Saturno','Júpiter'],['Marte','Sol','Vênus'],['Mercúrio','Lua','Saturno'],['Júpiter','Marte','Sol'],['Vênus','Mercúrio','Lua'],['Saturno','Júpiter','Marte']]
QUAL=[(1,0),(0,0),(1,1),(0,1),(1,0),(0,0),(1,1),(0,1),(1,0),(0,0),(1,1),(0,1)]
PLAN_QUAL={'Sol':(1,0,1,0),'Lua':(0,1,0,1),'Mercúrio':(0,1,1,0),'Vênus':(0,1,0,1),'Marte':(1,0,1,0),'Júpiter':(1,0,0,1),'Saturno':(0,1,1,0)}
PIDS={'Sol':swe.SUN,'Lua':swe.MOON,'Mercúrio':swe.MERCURY,'Vênus':swe.VENUS,'Marte':swe.MARS,'Júpiter':swe.JUPITER,'Saturno':swe.SATURN,'Urano':swe.URANUS,'Netuno':swe.NEPTUNE,'Plutão':swe.PLUTO,'Nodo Norte':swe.TRUE_NODE}
TRAD=list(PLAN_QUAL)


def norm(x): return x%360
def sidx(x): return int(norm(x)//30)
def deg(x): return norm(x)%30
def angular(a,b):
 d=abs(norm(a)-norm(b)); return 360-d if d>180 else d
def fmt(x):
 x=norm(x); si=int(x//30); q=x-si*30; d=int(q); mf=(q-d)*60; m=int(mf); sec=round((mf-m)*60)
 if sec==60: sec=0;m+=1
 if m==60:m=0;d+=1
 return f'{SIGNS[si]} {d}°{m:02d}′{sec:02d}″'
def fmtorb(x):
 x=abs(x); d=int(x); mf=(x-d)*60;m=int(mf);sec=round((mf-m)*60)
 return f'{d}°{m:02d}′{sec:02d}″'

def pos(pid,jd=JD,eq=False):
 flags=swe.FLG_SWIEPH|swe.FLG_SPEED|(swe.FLG_EQUATORIAL if eq else 0)
 xx,_=swe.calc_ut(jd,pid,flags); return xx

positions={}
for name,pid in PIDS.items():
 x=pos(pid); e=pos(pid,eq=True)
 positions[name]={'longitude':x[0],'latitude':x[1],'distance':x[2],'longitudeSpeed':x[3],'latitudeSpeed':x[4],'rightAscension':e[0],'declination':e[1],'retrograde':x[3]<0}
positions['Nodo Sul']={**positions['Nodo Norte'],
    'longitude':norm(positions['Nodo Norte']['longitude']+180),
    'latitude':-positions['Nodo Norte']['latitude'],
    'rightAscension':norm(positions['Nodo Norte']['rightAscension']+180),
    'declination':-positions['Nodo Norte']['declination'],
    'latitudeSpeed':-positions['Nodo Norte']['latitudeSpeed'],
}
mean=pos(swe.MEAN_NODE)

r_cusps,r_ascmc=swe.houses(JD,LAT,LON,b'R')
p_cusps,p_ascmc=swe.houses(JD,LAT,LON,b'P')
ASC=r_ascmc[0]; MC=r_ascmc[1]

def house(x,cusps=r_cusps):
 for i in range(12):
  a=cusps[i];b=cusps[(i+1)%12]
  if b<a:
   if x>=a or x<b:return i+1
  elif a<=x<b:return i+1
 return 12

sect='Diurno' if house(positions['Sol']['longitude'])>=7 else 'Noturno'

def dignity(name,longitude):
 si=sidx(longitude); di=deg(longitude); el=si%4
 exalt=next((p for p,s in EXALT.items() if s==si),None)
 trip=TRIP[el]['day' if sect=='Diurno' else 'night']
 term=next(r for r,e in TERMS[si] if di<e)
 face=FACES[si][int(di//10)]
 d=[]; deb=[]
 if DOM[si]==name:d.append(('domicílio',5))
 if exalt==name:d.append(('exaltação',4))
 if trip==name:d.append(('triplicidade',3))
 if term==name:d.append(('termo',2))
 if face==name:d.append(('face',1))
 if si in DETR.get(name,[]):deb.append(('exílio',-5))
 if FALL.get(name)==si:deb.append(('queda',-4))
 if not d and not deb:deb.append(('peregrino',-3))
 return {'sign':SIGNS[si],'degree':di,'rulers':{'domicile':DOM[si],'exaltation':exalt,'triplicity':trip,'term':term,'face':face},'dignities':d,'debilities':deb,'scoreMarcos':sum(v for _,v in d)+sum(v for k,v in deb if k!='peregrino')}

dignities={n:dignity(n,positions[n]['longitude']) for n in TRAD}
# Lord of Nativity: Marcos hierarchy, not additive score.
def essential_vector(name):
 d=dignities[name]['dignities']
 kinds={k for k,_ in d}
 return tuple(int(k in kinds) for k in ('domicílio','exaltação','triplicidade','termo','face'))
max_vector=max(essential_vector(n) for n in TRAD)
lon_candidates=[n for n in TRAD if essential_vector(n)==max_vector]
lord=lon_candidates[0] if len(lon_candidates)==1 else None

# Arabic lots Marcos
F=norm(ASC+positions['Lua']['longitude']-positions['Sol']['longitude']); S=norm(ASC+positions['Sol']['longitude']-positions['Lua']['longitude'])
lots={'Fortuna':F,'Espírito':S,'Necessidade':norm(ASC+F-S),'Amor':norm(ASC+S-F),'Valor':norm(ASC+F-positions['Marte']['longitude']),'Vitória':norm(ASC+positions['Júpiter']['longitude']-S),'Cativeiro':norm(ASC+F-positions['Saturno']['longitude'])}

# House geometry
def placement(name,x):
 h=house(x); nh=1 if h==12 else h+1; nc=r_cusps[nh-1]; cc=r_cusps[h-1]
 return {'point':name,'longitude':x,'geometricHouse':h,'distanceFromCurrentCusp':norm(x-cc),'nextCusp':nh,'distanceToNextCusp':norm(nc-x),'sameSignAsNextCusp':sidx(x)==sidx(nc),'houseArcSize':norm(nc-cc),'withinMarcosBaseFiveDegrees':norm(nc-x)<=5 and sidx(x)==sidx(nc)}
placements=[placement(n,p['longitude']) for n,p in positions.items()]+[placement('Parte '+n,x) for n,x in lots.items()]

# Aspects <= 5° under Marcos current tiered rule: <=3° core, >3°–5° contextual.
aspect_map={0:'conjunção',2:'sextil',3:'quadratura',4:'trígono',6:'oposição',8:'trígono',9:'quadratura',10:'sextil'}

def wrap180(x):return (x+180)%360-180
def asp_pair(a,b):
 la=positions[a]['longitude'];lb=positions[b]['longitude'];sd=(sidx(lb)-sidx(la))%12;typ=aspect_map.get(sd)
 if not typ:return None
 o=angular(la,lb) if typ=='conjunção' else abs(deg(la)-deg(lb))
 return typ,o,sd

def p_at(name,t):return pos(PIDS[name],t)[0]
def v_at(name,t):return pos(PIDS[name],t)[3]

def bisect(fn,a,b):
 fa=fn(a)
 for _ in range(60):
  m=(a+b)/2;fm=fn(m)
  if abs(fm)<1e-11:return m
  if fa*fm<=0:b=m
  else:a=m;fa=fm
 return (a+b)/2

def first_sign_change(name,direction,maxdays=1200):
 start=sidx(positions[name]['longitude']); step={'Lua':.125,'Mercúrio':.25,'Vênus':.25,'Sol':.5,'Marte':.5,'Júpiter':2,'Saturno':4}[name]
 prev=JD
 for e in [i*step for i in range(1,int(maxdays/step)+1)]:
  t=JD+direction*e
  if sidx(p_at(name,t))!=start:
   a,b=sorted((prev,t))
   # refine by sign change only
   for _ in range(55):
    m=(a+b)/2
    if sidx(p_at(name,m))==sidx(p_at(name,a)):a=m
    else:b=m
   return (a+b)/2
  prev=t
 return None
boundaries={}
for n in TRAD:
 pr=first_sign_change(n,-1);nx=first_sign_change(n,1)
 boundaries[n]={'previousIngress':pr,'nextIngress':nx}

def find_root(fn,start,end,step):
 direction=1 if end>=start else -1
 span=abs(end-start)
 prev_t=start
 prev=fn(prev_t)
 elapsed=step
 while elapsed < span:
  t=start+direction*elapsed
  val=fn(t)
  if abs(val-prev)<90 and (val==0 or prev==0 or val*prev<0):
   return bisect(fn,min(prev_t,t),max(prev_t,t))
  prev_t=t
  prev=val
  elapsed+=step
 # Always inspect the exact interval endpoint; roots commonly occur just
 # after a sign ingress and can live in the final sub-step.
 if span > 0:
  t=end
  val=fn(t)
  if abs(val-prev)<90 and (val==0 or prev==0 or val*prev<0):
   return bisect(fn,min(prev_t,t),max(prev_t,t))
 return None

aspect_dynamics=[]
for i,a in enumerate(TRAD):
 for b in TRAD[i+1:]:
  x=asp_pair(a,b)
  if not x:continue
  typ,o,sd=x
  if o>5:continue
  signed_sd=sd if sd<=6 else sd-12; target=signed_sd*30
  fn=lambda t,a=a,b=b,target=target: wrap180((p_at(b,t)-p_at(a,t))-target)
  now=abs(fn(JD)); soon=abs(fn(JD+.01)); motion='applying' if soon<now else 'separating' if soon>now else 'stationary-relative'
  future=min(boundaries[a]['nextIngress'],boundaries[b]['nextIngress']);past=max(boundaries[a]['previousIngress'],boundaries[b]['previousIngress'])
  step=.02 if 'Lua' in (a,b) else .08
  prevroot=find_root(fn,JD-1e-5,past,step);nextroot=find_root(fn,JD+1e-5,future,step)
  blocker=None;blocker_jd=None
  if not nextroot and motion=='applying':
   rv=lambda t,a=a,b=b: v_at(b,t)-v_at(a,t)
   rr=find_root(rv,JD,future,.05)
   blocker='relative-motion-reversal' if rr else 'ingress';blocker_jd=rr or future
  aspect_dynamics.append({'first':a,'second':b,'aspect':typ,'orb':o,'influenceBand':'strong' if o<=3 else 'weak','motionNow':motion,'previousPerfectionJd':prevroot,'previousPerfectionDaysAgo':JD-prevroot if prevroot else None,'nextPerfectionJd':nextroot,'nextPerfectionDays':nextroot-JD if nextroot else None,'blocker':blocker,'blockerJd':blocker_jd})

# Prenatal syzygy
def phase_fn(target):return lambda t:wrap180((p_at('Lua',t)-p_at('Sol',t))-target)
syzy=[]
for target,kind in [(0,'Lua Nova'),(180,'Lua Cheia')]:
 fn=phase_fn(target); root=None
 t=JD-1e-5
 for k in range(128):
  a=t-k*.25;b=a-.25;fa=fn(a);fb=fn(b)
  if abs(fa-fb)<90 and fa*fb<=0:
   root=bisect(fn,b,a);break
 if root: syzy.append({'type':kind,'julianDayUt':root,'daysBeforeBirth':JD-root,'longitude':p_at('Sol',root)})
prenatal=min(syzy,key=lambda x:x['daysBeforeBirth'])

# Fixed stars — exact Swiss positions from curated catalog.
principal={'Regulus','Aldebaran','Antares','Fomalhaut','Sirius','Procyon','Castor','Pollux','Spica','Algol'}
stars=['Aldebaran','Algol','Antares','Regulus','Sirius','Spica','Procyon','Castor','Pollux','Fomalhaut','Schedir','Hamal','Alcyone','Mira','Unukalhai','Baten Kaitos','Praesepe Cluster','Facies','Aculeus','Acumen']
targets=[(n,positions[n]['longitude']) for n in TRAD]+[(f'Cúspide {i+1}',x) for i,x in enumerate(r_cusps)]+[(f'Parte {n}',x) for n,x in lots.items()]
star_matches=[]
for star in stars:
 try: xx,resolved,_=swe.fixstar2_ut(star,JD,swe.FLG_SWIEPH|swe.FLG_SPEED)
 except Exception: continue
 limit=3 if star in principal else 1
 for tname,tlon in targets:
  o=angular(tlon,xx[0]);same=sidx(tlon)==sidx(xx[0])
  if same and o<=limit:star_matches.append({'point':tname,'star':star,'starLongitude':xx[0],'starLatitude':xx[1],'orb':o,'maxOrb':limit})
star_matches.sort(key=lambda x:x['orb'])

# Temperament baseline (same five-point audited heuristic currently implemented).
def signq(si):
 hot,moist=QUAL[si];return {'hot':1 if hot else 0,'cold':0 if hot else 1,'dry':0 if moist else 1,'moist':1 if moist else 0}
def mod(base,si):
 # Sem multiplicadores universais inventados: o signo modula qualitativamente no relatório.
 return dict(base)
def planetq(n):
 h,c,d,m=PLAN_QUAL[n];return {'hot':h,'cold':c,'dry':d,'moist':m}
def add(a,b):return {k:a[k]+b[k] for k in a}
zero={'hot':0,'cold':0,'dry':0,'moist':0}
ascq=signq(sidx(ASC));asc_ruler=DOM[sidx(ASC)];arq=mod(planetq(asc_ruler),sidx(positions[asc_ruler]['longitude']))
sunsi=sidx(positions['Sol']['longitude']);season={'hot':1,'cold':0,'dry':0,'moist':1} if sunsi<=2 else {'hot':1,'cold':0,'dry':1,'moist':0} if sunsi<=5 else {'hot':0,'cold':1,'dry':1,'moist':0} if sunsi<=8 else {'hot':0,'cold':1,'dry':0,'moist':1};seasonq=mod(season,sunsi)
angle=norm(positions['Lua']['longitude']-positions['Sol']['longitude']);phase={'hot':1,'cold':0,'dry':0,'moist':1} if angle<90 else {'hot':1,'cold':0,'dry':1,'moist':0} if angle<180 else {'hot':0,'cold':1,'dry':1,'moist':0} if angle<270 else {'hot':0,'cold':1,'dry':0,'moist':1};phaseq=mod(phase,sidx(positions['Lua']['longitude']))
lordq=mod(planetq(lord),sidx(positions[lord]['longitude'])) if lord else zero
tot=zero.copy()
for q in [ascq,arq,seasonq,phaseq,lordq]:tot=add(tot,q)
components={'Colérico':tot['hot']+tot['dry'],'Sanguíneo':tot['hot']+tot['moist'],'Melancólico':tot['cold']+tot['dry'],'Fleumático':tot['cold']+tot['moist']}
order=sorted(components,key=components.get,reverse=True)
temperament={'totals':tot,'components':components,'ranking':order,'dominant':order[0],'secondary':order[1],'weakest':order[-1],'lordOfNativity':lord,'witnesses':{'Ascendente':ascq,'Regente do Ascendente':arq,'Estação do Sol':seasonq,'Fase da Lua':phaseq,'Senhor da Natividade':lordq},'note':'Ledger técnico dos cinco testemunhos sem multiplicadores 1.25/0.75; a síntese canônica deve preservar reforços/contradições qualitativos e não tratar o total como score autoral.'}

fixture={'input':{'localCivil':LOCAL.isoformat(),'utc':UTC.isoformat(),'timezone':'America/Sao_Paulo','latitude':LAT,'longitude':LON,'julianDayUt':JD},'positions':positions,'houses':{'regiomontanus':list(r_cusps),'placidus':list(p_cusps),'ascendant':ASC,'mc':MC},'nodes':{'trueNorth':positions['Nodo Norte']['longitude'],'trueSouth':positions['Nodo Sul']['longitude'],'meanNorth':mean[0],'meanSouth':norm(mean[0]+180)},'sect':sect,'dignities':dignities,'lordOfNativity':lord,'temperament':temperament,'arabicLots':lots,'placements':placements,'aspectsMarcosInfluence':aspect_dynamics,'prenatalSyzygy':prenatal,'fixedStars':star_matches}
OUT.write_text(json.dumps(fixture,ensure_ascii=False,indent=2),encoding='utf-8')

# Markdown report
L=[]
L += ['# FORMULÁRIO DE VALIDAÇÃO — MAPA NATAL TÉCNICO','', '> **Caso de regressão:** 21/04/2001, 06:45, Santa Casa de Misericórdia de Barra Mansa, RJ. Este documento é técnico; não contém interpretação da personalidade.','', '## 1. Entrada temporal e geográfica','',f'- Hora civil: **21/04/2001 06:45:00** (`America/Sao_Paulo`).',f'- UTC: **{UTC.isoformat()}**.',f'- Coordenadas: **{LAT:.10f}, {LON:.10f}**.',f'- JD(UT): **{JD:.8f}**.','- Zodíaco tropical; Swiss Ephemeris; Nodo verdadeiro canônico; Nodo médio preservado como dado auxiliar.','']
L += ['## 2. Posições astronômicas','', '| Corpo | Longitude | Latitude ecl. | Vel. long. °/dia | RA | Dec | Casa R |','|---|---:|---:|---:|---:|---:|---:|']
for n in list(PIDS)+['Nodo Sul']:
 p=positions[n];L.append(f'| {n} | {fmt(p["longitude"])} | {p["latitude"]:+.6f}° | {p["longitudeSpeed"]:+.9f} | {p["rightAscension"]:.6f}° | {p["declination"]:+.6f}° | {house(p["longitude"])} |')
L += ['',f'- Ascendente: **{fmt(ASC)}**.',f'- MC: **{fmt(MC)}**.',f'- Nodo verdadeiro: **{fmt(positions["Nodo Norte"]["longitude"])}**; Nodo médio: **{fmt(mean[0])}**; diferença: **{fmtorb(positions["Nodo Norte"]["longitude"]-mean[0])}**.','']
L += ['## 3. Cúspides — Regiomontanus e Placidus','', '| Casa | Regiomontanus | Placidus | diferença |','|---:|---:|---:|---:|']
for i,(r,p) in enumerate(zip(r_cusps,p_cusps),1):L.append(f'| {i} | {fmt(r)} | {fmt(p)} | {fmtorb(r-p)} |')
L += ['',f'**Secta:** {sect}.','']
L += ['## 4. Temperamento — cinco testemunhos Marcos','',f'- Senhor da Natividade no caso de validação: **{lord or "não resolvido"}**.','', '> O fixture preserva o ledger interno dos cinco testemunhos, mas não atribui multiplicadores 1,25/0,75 nem apresenta o total como score autoral. A síntese deve ser qualitativa.','']
L += ['## 5. Dignidades essenciais','']
for n in TRAD:
 d=dignities[n];L.append(f'- **{n} — {fmt(positions[n]["longitude"])}:** domicílio {d["rulers"]["domicile"]}; exaltação {d["rulers"]["exaltation"] or "—"}; triplicidade {d["rulers"]["triplicity"]}; termo {d["rulers"]["term"]}; face {d["rulers"]["face"]}; próprias: {d["dignities"] or "nenhuma"}; debilidades: {d["debilities"] or "nenhuma"}.')
L += ['', '## 6. Partes árabes fundamentais — Marcos','', '| Parte | Posição | Casa | Dispositor | Antíscio |','|---|---:|---:|---|---:|']
for n,x in lots.items():L.append(f'| {n} | {fmt(x)} | {house(x)} | {DOM[sidx(x)]} | {fmt(norm(540-x))} |')
L += ['', '## 7. Aspectos de influência natal de Marcos (≤ 5°; núcleo ≤3°, contextual 3–5°) — com dinâmica efemérica','']
for a in aspect_dynamics:
 status='aperfeiçoará' if a['nextPerfectionJd'] else 'já aperfeiçoou' if a['previousPerfectionJd'] else 'não aperfeiçoa na relação atual'
 extra=f'; bloqueio **{a["blocker"]}**' if a['blocker'] else ''
 L.append(f'- **{a["first"]} {a["aspect"]} {a["second"]}** — orbe {fmtorb(a["orb"])}; faixa {a["influenceBand"]}; no instante está {a["motionNow"]}; {status}{extra}.')
L += ['', 'No caso **Vênus–Saturno**, o orbe diminui inicialmente, mas a velocidade relativa se inverte antes da perfeição; o motor não deve chamar isso simplesmente de “aplicativo” por projeção linear de um dia.','']
L += ['## 8. Syzygia pré-natal','',f'- **{prenatal["type"]}** em {fmt(prenatal["longitude"])}; JD {prenatal["julianDayUt"]:.8f}; **{prenatal["daysBeforeBirth"]:.6f} dias** antes do nascimento.','']
L += ['## 9. Estrelas fixas — Swiss Ephemeris, catálogo curado','']
for m in star_matches:L.append(f'- **{m["point"]} ↔ {m["star"]}**: estrela {fmt(m["starLongitude"])}; orbe **{fmtorb(m["orb"])}**; limite {m["maxOrb"]}°; mesma faixa zodiacal.')
if not star_matches:L.append('- Nenhum contato dentro dos limites configurados.')
L += ['', '## 10. Mentalidade — formulário, não interpretação','',f'- Lua: **{fmt(positions["Lua"]["longitude"])}**, {ELEMENT[sidx(positions["Lua"]["longitude"])%4]}, {MODE[sidx(positions["Lua"]["longitude"])]}; fase angular Sol→Lua = **{angle:.6f}°** (4ª fase).',f'- Mercúrio: **{fmt(positions["Mercúrio"]["longitude"])}**, {ELEMENT[sidx(positions["Mercúrio"]["longitude"])%4]}, {MODE[sidx(positions["Mercúrio"]["longitude"])]}; distância solar **{fmtorb(angular(positions["Mercúrio"]["longitude"],positions["Sol"]["longitude"]))}**.',f'- Lua–Mercúrio: mesma relação zodiacal de conjunção, mas separados por **{fmtorb(angular(positions["Lua"]["longitude"],positions["Mercúrio"]["longitude"]))}**, portanto fora da faixa de influência natal de Marcos.','- O relatório deve anexar dignidades, recepções, dispositores, estrelas e modificadores próximos de Lua/Mercúrio; a IA não calcula nada disso.','']
L += ['## 11. Erros antigos corrigidos neste caso','', '- **Nodo verdadeiro** passa a ser o nodo canônico Marcos; o médio fica apenas como dado auxiliar.', '- O relatório conserva **RA, declinação, latitude e velocidade** em vez de somente longitude.', '- Regiomontanus e Placidus são calculados lado a lado, sem misturar as cúspides.', '- Aspectos distinguem **influência atual** de **perfeição real**; Vênus–Saturno demonstra por que a extrapolação linear era insuficiente.', '- Partes são calculadas em precisão decimal integral, sem arredondar para minuto antes da fórmula.', '- Conjunções, inclusive de estrelas, não atravessam fronteira de signo no módulo Marcos.', '- Nenhuma classificação global “mapa forte/fraco” é gerada.', '']
REPORT.write_text('\n'.join(L),encoding='utf-8')
print(OUT)
print(REPORT)
