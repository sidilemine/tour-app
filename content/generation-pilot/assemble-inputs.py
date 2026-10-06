import json,pathlib,copy,hashlib,math
root=pathlib.Path('content/generation-pilot'); old=json.load(open('content/clerkenwell/plan.json')); st=json.load(open('content/clerkenwell/stories.json'))
def write(n,x): (root/n).write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n')
def dec(s):
 vals=[];v=0;shift=0
 for c in s:
  b=ord(c)-63;v|=(b&31)<<shift;shift+=5
  if b<32: vals.append(~(v>>1) if v&1 else v>>1);v=0;shift=0
 a=b=0;r=[]
 for x,y in zip(vals[::2],vals[1::2]): a+=x;b+=y;r.append(dict(latitude=a/1e6,longitude=b/1e6))
 return r
route=[]; joins=[]
def dist(a,b): return math.hypot((a['latitude']-b['latitude'])*111195,(a['longitude']-b['longitude'])*111195*math.cos(math.radians(a['latitude'])))
def add(points,label):
 if route: joins.append(dict(label=label,metres=dist(route[-1],points[0]),note='Consecutive identical endpoints deduplicated; sub-2m nonidentical joins retained as explicit desk connector.'))
 for p in points:
  if not route or p!=route[-1]: route.append(p)
 return len(route)-1
start=json.load(open(root/'routes/start-response.json'))['trip'];ret=json.load(open(root/'routes/return-response.json'))['trip']
for i,l in enumerate(start['legs']): add(dec(l['shape']),'start-'+str(i))
stopidx={};stopidx['smithfield']=len(route)-1 if route[-1]==old['fixture']['route'][92] else len(route)
add(old['fixture']['route'][92:247],'archived-core')
offset=stopidx['smithfield']-92
for s in old['fixture']['stops']:
 if 92<=s['routeIndex']<=246: stopidx[s['id']]=s['routeIndex']+offset
for i,l in enumerate(ret['legs']): add(dec(l['shape']),'return-'+str(i))
assert max(x['metres'] for x in joins)<2, joins
station=dict(id='farringdon',title='Farringdon — begin on Cowcross Street',standing=route[0],routeIndex=0,approach='Use the Cowcross Street / Farringdon end of the station. Do not begin at the remote Barbican-side Elizabeth line exit.',viewpoint='Choose a clear public pavement spot outside the Cowcross Street entrance, away from the doorway and moving pedestrians. This coordinate is a desk candidate.',access='Public exterior. Start here: the first clip begins immediately. No station entry, ticket or building admission is required for the walk.')
stops=[station]
for s in old['fixture']['stops']:
 if s['id'] in stopidx:
  x=copy.deepcopy(s);x['routeIndex']=stopidx[s['id']];stops.append(x)
stops[1]['approach']='From the Cowcross Street station entrance, follow Cowcross Street east to the St John Street / Charterhouse Street market junction. Use the pedestrian route to the north pavement view of the market halls, clear of loading entrances.'
fixture={**old['fixture'],'id':'clerkenwell-balanced-pilot','version':1,'title':'Clerkenwell — The work behind the street (60-minute pilot)','route':route,'stops':stops,'verification':{'status':'unverified','note':'Supervised manual draft, 6 October 2026. Fresh public pedestrian routing joins a desk-reviewed September core. Visitor positions, current works and station boundary require targeted confirmation before practical use. Package validity is not route acceptance. No field or owner listening result.'}}
returntext='Return northwest along Woodbridge Street to Sekforde Street. Turn southwest down Sekforde towards Aylesbury Street and the Green, using the public pavement rather than Hayward’s Place. Continue around the west side of Old Sessions House to the pedestrian signals on Clerkenwell Road. Cross at the signals, then follow Turnmill Street south to the Cowcross Street station entrance. Keep the return quiet and use the saved map. End the tour when you arrive back at Farringdon.'
intro='We begin outside Farringdon station, at the Cowcross Street entrance. This is a one-hour loop through Clerkenwell, staying outside the buildings. We will meet work that is easy to miss: carrying meat, moving a whole frontage, printing speeches and shaping artificial flowers. You do not need to know the neighbourhood already.\n\nThere are five main stories after this introduction. Between them, leave space for the street and for conversation. Stop somewhere clear before listening; pause whenever a crossing or a busy pavement needs your attention. The way back to this station is included in the hour.\n\nFirst, follow Cowcross Street east towards the market junction. Find a clear place on the north pavement of Charterhouse Street to look across at Smithfield’s halls. The route and written directions are saved with the tour. These are desk-reviewed directions, so follow current pedestrian signs if anything has changed.'
stories=[dict(id='farringdon',title='The work behind the street',transcript=intro,sources=[dict(title='Valhalla pedestrian route reference',url='https://valhalla.github.io/valhalla/api/route/api-reference/')],evidence=[dict(paragraph=p,kind='editorial',basis='Authored pilot introduction and route intent. Route evidence in routes/ and ROUTE.md; public positions remain desk candidates.',sourceUrls=[]) for p in intro.split('\n\n')],directions=[stops[1]['approach'],stops[1]['viewpoint']])]
for s in st['stories']:
 if s['id'] not in stopidx: continue
 x=copy.deepcopy(s);paras=x['transcript'].split('\n\n')
 if x['id']=='smithfield':
  removed=paras.pop(-2);x['evidence']=[e for e in x['evidence'] if e['paragraph']!=removed]
  x['sources']=x['sources'][:3]
 if x['id']=='green':
  before=paras[-2];after='The library still offers education in politics, including online courses in trade unions and Marxism. That is a present-day continuation of the building’s connection with ideas, without requiring you to enter or find a class taking place here.'
  paras[-2]=after
  for e in x['evidence']:
   if e['paragraph']==before: e.update(paragraph=after,basis='Official online course listing reopened 6 October 2026: October–December 2026 courses; explicitly online. Historical relation is editorial interpretation, not in-person class evidence.')
  before=paras[-1];after=before.replace('A short story will play on the Close; the map and written directions remain available.','Keep this stretch quiet; the map and written directions remain available.')
  paras[-1]=after
  for e in x['evidence']:
   if e['paragraph']==before: e['paragraph']=after
  x['directions'][2]=x['directions'][2].replace('skip the Many hands walking chapter. ','')
 if x['id']=='flowers':
  before=paras[-1];paras[-1]=returntext
  for e in x['evidence']:
   if e['paragraph']==before:e.update(paragraph=returntext,basis='New loop return, saved public pedestrian router response 6 October 2026; route topology reviewed at desk. Current crossing/works and precise station boundary remain unverified.')
  x['directions']=[returntext]
 x['transcript']='\n\n'.join(paras)
 for e in x['evidence']:
  if e['kind']!='editorial':e['basis']+=' Historical source-check status inherited from the 20 September research unless evidence.json records a 6 October refresh; no new field observation.'
 stories.append(x)
write('stories.json',{'stories':stories,'chapters':[]})
write('plan.json',{'fixture':fixture,'narration':{'description':'Proposed 60-minute daytime loop: Farringdon, Smithfield, Booth panels, St John’s Gate, Clerkenwell Green, Woodbridge Chapel and Farringdon. Ordinary work in less obvious stories; publicly accessible exteriors only. Desk candidate; all walking is quiet in this version.','introduction':'Begin outside the Cowcross Street entrance to Farringdon station. Press Start here; the introduction plays immediately. This AI-assisted supervised draft adapts researched local material for a new loop and uses local George synthetic narration. It is not a completed gpt-6.1-sol subscription workflow trial. Read the route limitations before importing.','finishInstructions':returntext,'reviewNote':'Listening and walking not yet assessed. Useful feedback: what stayed with you, what confused you, and whether the return and quiet stretches felt right. No requirement to leave a note at each stop.','rightsNote':old['narration']['rightsNote']},'chapters':[],'routeEvidence':'content/generation-pilot/ROUTE.md','authoring':{'profile':'Balanced','targetMinutes':60,'historicalSources':'docs/content/authoring/clerkenwell-2026-09-20','mode':'supervised-manual-adaptation; not subscription baseline','geometryJoins':joins,'routeMetres':sum(dist(a,b) for a,b in zip(route,route[1:])),'freshRouting':{'startSeconds':start['summary']['time'],'returnSeconds':ret['summary']['time']},'assumedWalkingKmPerHour':4.5,'fieldChecked':False}})
write('routes/selected.geojson',{'type':'FeatureCollection','features':[{'type':'Feature','properties':{'status':'desk-candidate','attribution':'© OpenStreetMap contributors, ODbL'},'geometry':{'type':'LineString','coordinates':[[p['longitude'],p['latitude']] for p in route]}}]})
print('route metres',sum(dist(a,b) for a,b in zip(route,route[1:])), 'points',len(route),'joins',joins,'stopindices',stopidx)
print([(s['id'],len(s['transcript'].split())) for s in stories])
