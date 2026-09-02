import swisseph as swe, datetime, zoneinfo, json, math, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
lat=-26-37/60-56/3600
lon=-48-41/60-5/3600
zone='America/Sao_Paulo'; tz=zoneinfo.ZoneInfo(zone)
CASES=[
('M-HE-CHAMPION','Will the Champion Retain His Belt?',2015,7,13,11,11,'competition',{'competitionStructure':'incumbent_challenger'}),
('M-HE-BRAZIL','Will Brazil Win the 2014 World Cup?',2014,1,20,12,21,'competition',{'competitionStructure':'tournament_victory'}),
('M-HE-TRIAL','When Will I Win the Money from This Trial?',2011,2,10,9,54,'lawsuit',{}),
('M-HE-BET','Will I Profit from This Bet?',2014,1,20,15,5,'bet',{}),
('M-HE-TRIP-BUSINESS','Should I Make This Trip or Open a Co-Working Spot?',2014,5,6,10,22,'should_i',{'alternatives':[{'id':'trip','label':'trip','house':9},{'id':'business','label':'business','house':10,'profitHouse':11}]}),
('M-HE-REL','Will She Talk to Me Again? Am I Important to Her?',2014,4,3,14,21,'relationship',{'querentSex':'male','quesitedSex':'female','sameSituationSubquestions':['Will she talk to me again?','Am I important to her?']}),
('M-HE-BABY','Is There Anything Wrong With the Baby? When It Will Be Born?',2013,8,26,13,53,'pregnancy',{'pregnancyState':'confirmed','timingUnits':['days']}),
('M-HE-STOMACH','What’s the Problem With My Stomach? What Can I Do to Relieve It?',2013,3,23,10,15,'health',{'subjectHouse':1,'organHouse':5}),
('M-HE-DARRYL','Will Darryl Die?',2013,2,6,2,51,'death',{'subjectHouse':7}),
('M-HE-INTERNET','When Will the Internet Be Cut Off?',2014,7,1,18,1,'custom',{'relevantHouse':6,'serviceProviderHouse':6,'naturalServicePlanet':'mercury','timingUnits':['hours','days','weeks'],'eventAssumed':True,'eventTrigger':{'kind':'sign_change','role':'quesited','planet':'mercury','interpretation':'Gemini voiced -> Cancer mute: the connection stops talking.'}}),
]
SIGNS=['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes']
NAMES={'sun':'Sol','moon':'Lua','mercury':'Mercúrio','venus':'Vênus','mars':'Marte','jupiter':'Júpiter','saturn':'Saturno','uranus':'Urano','neptune':'Netuno','pluto':'Plutão','northNode':'Nodo Norte','southNode':'Nodo Sul'}
BODIES={'sun':swe.SUN,'moon':swe.MOON,'mercury':swe.MERCURY,'venus':swe.VENUS,'mars':swe.MARS,'jupiter':swe.JUPITER,'saturn':swe.SATURN,'uranus':swe.URANUS,'neptune':swe.NEPTUNE,'pluto':swe.PLUTO,'northNode':swe.TRUE_NODE}

def norm(x): return x%360

def anti(x): return norm(180-x)

def mk_chart(y,m,d,h,mi):
    local=datetime.datetime(y,m,d,h,mi,tzinfo=tz)
    utc=local.astimezone(datetime.timezone.utc)
    uh=utc.hour+utc.minute/60+utc.second/3600
    jd=swe.julday(utc.year,utc.month,utc.day,uh,swe.GREG_CAL)
    flags=swe.FLG_SWIEPH|swe.FLG_SPEED
    planets=[]; idx=0
    for typ,body in BODIES.items():
        xx,fl=swe.calc_ut(jd,body,flags)
        lo,la,dist,sp,lasp,dsp=xx[:6]
        planets.append({'name':NAMES[typ],'type':typ,'id':idx,'longitude':lo,'longitudeRaw':lo,'longitudeSpeed':sp,'latitudeRaw':la,'latitudeSpeed':lasp,'distanceRaw':dist,'sign':SIGNS[int(lo//30)%12],'antiscion':anti(lo),'antiscionRaw':anti(lo),'isRetrograde':sp < -1e-6});idx+=1
    n=next(p for p in planets if p['type']=='northNode')
    slo=norm(n['longitudeRaw']+180)
    planets.append({'name':'Nodo Sul','type':'southNode','id':idx,'longitude':slo,'longitudeRaw':slo,'longitudeSpeed':n['longitudeSpeed'],'latitudeRaw':-n.get('latitudeRaw',0),'latitudeSpeed':-n.get('latitudeSpeed',0),'distanceRaw':n.get('distanceRaw'),'sign':SIGNS[int(slo//30)%12],'antiscion':anti(slo),'antiscionRaw':anti(slo),'isRetrograde':n['isRetrograde']})
    cusps,ascmc=swe.houses_ex(jd,lat,lon,b'R')
    pcusps,pascmc=swe.houses_ex(jd,lat,lon,b'P')
    houses=list(cusps); phouses=list(pcusps)
    birth={'year':y,'month':m,'day':d,'time':f'{h:02d}:{mi:02d}','coordinates':{'name':'Barra Velha/SC, Brazil','displayName':'Barra Velha, Santa Catarina, Brazil','latitude':lat,'longitude':lon,'timezone':zone,'timezoneSource':'user','source':'manual','precision':'municipality'}}
    hd={'house':houses,'housesWithSigns':[SIGNS[int(x//30)%12] for x in houses],'ascendant':ascmc[0],'mc':ascmc[1],'armc':ascmc[2],'vertex':ascmc[3],'equatorialAscendant':ascmc[4],'kochCoAscendant':ascmc[5],'munkaseyCoAscendant':ascmc[5],'munkaseyPolarAscendant':ascmc[7],'houseSystem':'Regiomontanus','houseSystemCode':'R','variants':{'regiomontanus':{'system':'Regiomontanus','code':'R','cusps':houses,'ascendant':ascmc[0],'mc':ascmc[1],'armc':ascmc[2],'vertex':ascmc[3],'equatorialAscendant':ascmc[4],'kochCoAscendant':ascmc[5],'munkaseyCoAscendant':ascmc[5],'munkaseyPolarAscendant':ascmc[7]},'placidus':{'system':'Placidus','code':'P','cusps':phouses,'ascendant':pascmc[0],'mc':pascmc[1],'armc':pascmc[2],'vertex':pascmc[3],'equatorialAscendant':pascmc[4],'kochCoAscendant':pascmc[5],'munkaseyCoAscendant':pascmc[5],'munkaseyPolarAscendant':pascmc[7]}}}
    meta={'engine':'Swiss Ephemeris','enginePackage':'@swisseph/browser','enginePackageVersion':'1.1.1','julianDayUt':jd,'utcIso':utc.isoformat().replace('+00:00','Z'),'timezone':zone,'zodiac':'Tropical','houseSystem':'Regiomontanus','houseSystemCode':'R','availableHouseSystems':['Regiomontanus','Placidus'],'nodeMode':'Nodo verdadeiro','calendar':'Gregoriano','ephemerisFlags':['SEFLG_SWIEPH','SEFLG_SPEED'],'coordinatePrecision':'municipio','timezoneSource':'user','locationSource':'manual','locationPrecision':'municipality'}
    return {'planets':planets,'housesData':hd,'birthDate':birth,'fixedStars':[],'calculationMetadata':meta}

out=[]
for id,title,y,m,d,h,mi,topic,extra in CASES:
    ctx={'topic':topic,'concreteQuestion':title,'questionUnderstood':True,'questionAccepted':True}
    ctx.update(extra)
    out.append({'id':id,'title':title,'context':ctx,'chart':mk_chart(y,m,d,h,mi)})
path=ROOT/'fixtures/horary/marcos-e2e-swiss.json'
path.write_text(json.dumps(out,ensure_ascii=False,indent=2))
print(path)
