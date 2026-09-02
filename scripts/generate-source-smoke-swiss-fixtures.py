import swisseph as swe, datetime, zoneinfo, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
SIGNS=['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes']
NAMES={'sun':'Sol','moon':'Lua','mercury':'Mercúrio','venus':'Vênus','mars':'Marte','jupiter':'Júpiter','saturn':'Saturno','uranus':'Urano','neptune':'Netuno','pluto':'Plutão','northNode':'Nodo Norte','southNode':'Nodo Sul'}
BODIES={'sun':swe.SUN,'moon':swe.MOON,'mercury':swe.MERCURY,'venus':swe.VENUS,'mars':swe.MARS,'jupiter':swe.JUPITER,'saturn':swe.SATURN,'uranus':swe.URANUS,'neptune':swe.NEPTUNE,'pluto':swe.PLUTO,'northNode':swe.TRUE_NODE}
# Coordinates are municipality/city centroids; source validates ASC only to <1 degree because published values are rounded.
CASES=[
 dict(id='HE-AUTH',title='Are the Electrical Parts I Bought Fake or Original?',date=(2010,7,15,20,1),zone='Asia/Jerusalem',lat=32.1663,lon=34.8433,place='Herzliya, Israel',topic='authenticity',extra={},asc=('Capricorn',27)),
 dict(id='HE-FUNDED',title='Will My Daughter Get the Funded Spot?',date=(2014,3,20,7,55),zone='America/Chicago',lat=43.0389,lon=-87.9065,place='Milwaukee, WI, USA',topic='government_grant',extra={'subjectHouse':5},asc=('Aries',24)),
 dict(id='HE-DELIVERY',title='What Time Tomorrow Will the Wine Arrive?',date=(2013,2,20,14,21),zone='America/Los_Angeles',lat=32.7157,lon=-117.1611,place='San Diego, CA, USA',topic='delivery',extra={'timingUnits':['hours']},asc=('Cancer',22)),
 dict(id='HE-POWER',title='When Will the Power-Cut End?',date=(2004,11,25,14,50),zone='Europe/London',lat=51.5074,lon=-0.1278,place='London, England',topic='service_change',extra={'naturalServicePlanet':'moon','eventAssumed':True,'eventTrigger':{'kind':'cusp_contact','planet':'moon','house':1,'interpretation':'Artificial light/Moon rises above the eastern horizon.'},'timingUnits':['minutes','hours']},asc=('Taurus',8)),
 dict(id='HE-KIDNAP',title='The Kidnapped Priest',date=(2009,10,22,8,42),zone='Europe/London',lat=51.5074,lon=-0.1278,place='London, England',topic='kidnapping',extra={'subjectHouse':12,'intents':['survival','release','timing'],'eventTrigger':{'kind':'sign_change','planet':'venus','interpretation':'Venus leaves Libra / leaves the captors power.'},'timingUnits':['days','weeks']},asc=('Scorpio',9)),
]

def norm(x): return x%360
def anti(x): return norm(180-x)
def mk_chart(c):
    y,m,d,h,mi=c['date']; tz=zoneinfo.ZoneInfo(c['zone']); local=datetime.datetime(y,m,d,h,mi,tzinfo=tz); utc=local.astimezone(datetime.timezone.utc)
    uh=utc.hour+utc.minute/60+utc.second/3600; jd=swe.julday(utc.year,utc.month,utc.day,uh,swe.GREG_CAL); flags=swe.FLG_SWIEPH|swe.FLG_SPEED
    planets=[]; idx=0
    for typ,body in BODIES.items():
        xx,_=swe.calc_ut(jd,body,flags); lo,la,dist,sp,lasp,dsp=xx[:6]
        planets.append({'name':NAMES[typ],'type':typ,'id':idx,'longitude':lo,'longitudeRaw':lo,'longitudeSpeed':sp,'latitudeRaw':la,'latitudeSpeed':lasp,'distanceRaw':dist,'sign':SIGNS[int(lo//30)%12],'antiscion':anti(lo),'antiscionRaw':anti(lo),'isRetrograde':sp < -1e-6}); idx+=1
    n=next(p for p in planets if p['type']=='northNode'); slo=norm(n['longitudeRaw']+180)
    planets.append({'name':'Nodo Sul','type':'southNode','id':idx,'longitude':slo,'longitudeRaw':slo,'longitudeSpeed':n['longitudeSpeed'],'latitudeRaw':-n.get('latitudeRaw',0),'latitudeSpeed':-n.get('latitudeSpeed',0),'distanceRaw':n.get('distanceRaw'),'sign':SIGNS[int(slo//30)%12],'antiscion':anti(slo),'antiscionRaw':anti(slo),'isRetrograde':n['isRetrograde']})
    cusps,ascmc=swe.houses_ex(jd,c['lat'],c['lon'],b'R'); pcusps,pascmc=swe.houses_ex(jd,c['lat'],c['lon'],b'P'); houses=list(cusps); phouses=list(pcusps)
    birth={'year':y,'month':m,'day':d,'time':f'{h:02d}:{mi:02d}','coordinates':{'name':c['place'],'displayName':c['place'],'latitude':c['lat'],'longitude':c['lon'],'timezone':c['zone'],'timezoneSource':'user','source':'manual','precision':'municipality'}}
    hd={'house':houses,'housesWithSigns':[SIGNS[int(x//30)%12] for x in houses],'ascendant':ascmc[0],'mc':ascmc[1],'armc':ascmc[2],'vertex':ascmc[3],'equatorialAscendant':ascmc[4],'kochCoAscendant':ascmc[5],'munkaseyCoAscendant':ascmc[5],'munkaseyPolarAscendant':ascmc[7],'houseSystem':'Regiomontanus','houseSystemCode':'R','variants':{'regiomontanus':{'system':'Regiomontanus','code':'R','cusps':houses,'ascendant':ascmc[0],'mc':ascmc[1]},'placidus':{'system':'Placidus','code':'P','cusps':phouses,'ascendant':pascmc[0],'mc':pascmc[1]}}}
    meta={'engine':'Swiss Ephemeris','enginePackage':'@swisseph/browser','enginePackageVersion':'1.1.1','julianDayUt':jd,'utcIso':utc.isoformat().replace('+00:00','Z'),'timezone':c['zone'],'zodiac':'Tropical','houseSystem':'Regiomontanus','houseSystemCode':'R','availableHouseSystems':['Regiomontanus','Placidus'],'nodeMode':'Nodo verdadeiro','calendar':'Gregoriano','ephemerisFlags':['SEFLG_SWIEPH','SEFLG_SPEED'],'coordinatePrecision':'municipio','timezoneSource':'user','locationSource':'manual','locationPrecision':'municipality'}
    return {'planets':planets,'housesData':hd,'birthDate':birth,'fixedStars':[],'calculationMetadata':meta}

out=[]
for c in CASES:
    ctx={'topic':c['topic'],'concreteQuestion':c['title'],'questionUnderstood':True,'questionAccepted':True,**c['extra']}
    out.append({'id':c['id'],'title':c['title'],'publishedAsc':{'sign':c['asc'][0],'degree':c['asc'][1]},'context':ctx,'chart':mk_chart(c)})
path=ROOT/'fixtures/horary/source-smoke-e2e-swiss.json'; path.write_text(json.dumps(out,ensure_ascii=False,indent=2)); print(path)
for x in out: print(x['id'],x['chart']['housesData']['ascendant'],x['chart']['calculationMetadata']['utcIso'])
