import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { z } from 'zod';
import { distance, type Coordinate } from '../../../src/domain/fixture';

const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
const point=z.object({lat:z.number().min(-85).max(85),lon:z.number().min(-180).max(180)});
const feature=z.object({type:z.enum(['node','way']),id:z.number().int().positive(),tags:z.record(z.string(),z.string()),lat:z.number().optional(),lon:z.number().optional(),geometry:z.array(point.nullable()).max(20000).optional()});
const snapshotSchema=z.object({schemaVersion:z.literal(1),sourceUrl:z.string().url(),sourceSha256:z.string().regex(/^[a-f0-9]{64}$/),sourceMd5:z.string(),sourceBytes:z.number().positive(),preparedAt:z.string(),mapDataAt:z.string(),bounds:z.tuple([z.number(),z.number(),z.number(),z.number()]),elements:z.array(feature).min(1).max(50000),limitation:z.string()});
export type LocalMapSnapshot=z.infer<typeof snapshotSchema>;
export interface LocalMapReference {path:string;sha256:string}
const extractPath=/^\/europe\/united-kingdom\/england\/greater-london-\d{6}\.osm\.pbf$/;
/** Recognize provider resources even when a query identity is missing/malformed. */
export function isMapEvidenceResource(url:URL){
 return !url.username&&!url.password&&
  ((url.origin==='https://overpass-api.de'&&url.pathname==='/api/interpreter')||
   (url.origin==='https://download.geofabrik.de'&&extractPath.test(url.pathname)));
}
export function isMapEvidenceIdentity(url:URL){
 return isMapEvidenceResource(url)&&/^#query-[a-f0-9]{64}$/.test(url.hash);
}
export function loadLocalMap(reference:LocalMapReference):LocalMapSnapshot{
 const path=realpathSync(resolve(reference.path)),root=realpathSync(resolve('local-data')),rel=relative(root,path);
 assert.ok(rel&&!rel.startsWith('..')&&!rel.startsWith('/'),'Map snapshot must remain in local-data');
 assert.ok(statSync(path).size<=32_000_000,'Local snapshot exceeds size limit');
 const bytes=readFileSync(path);assert.equal(hash(bytes),reference.sha256,'Map snapshot changed after brief binding');
 const snapshot=snapshotSchema.parse(JSON.parse(bytes.toString('utf8'))),url=new URL(snapshot.sourceUrl);
 assert.ok(url.origin==='https://download.geofabrik.de'&&extractPath.test(url.pathname)&&!url.search&&!url.hash,'Documented dated extract identity required');
 assert.ok(Number.isFinite(Date.parse(snapshot.mapDataAt))&&Number.isFinite(Date.parse(snapshot.preparedAt)),'Dated map provenance required');
 const [west,south,east,north]=snapshot.bounds;assert.ok(west<east&&south<north&&east-west<=.2&&north-south<=.2,'Bounded snapshot extent required');
 return snapshot;
}
const coordinate=(p:{lat:number;lon:number}):Coordinate=>({latitude:p.lat,longitude:p.lon});
function nearest(feature:LocalMapSnapshot['elements'][number],center:Coordinate){
 if(feature.type==='node'&&feature.lat!==undefined&&feature.lon!==undefined)return distance(center,{latitude:feature.lat,longitude:feature.lon});
 const points=feature.geometry??[];let best=Infinity;
 for(let i=0;i<points.length;i++){
  const a=points[i];if(!a)continue;best=Math.min(best,distance(center,coordinate(a)));
  const b=points[i+1];if(!b)continue;
  const scale=Math.cos(center.latitude*Math.PI/180),dx=(b.lon-a.lon)*scale,dy=b.lat-a.lat;
  const t=Math.max(0,Math.min(1,(((center.longitude-a.lon)*scale)*dx+(center.latitude-a.lat)*dy)/(dx*dx+dy*dy||1)));
  best=Math.min(best,distance(center,{latitude:a.lat+(b.lat-a.lat)*t,longitude:a.lon+(b.lon-a.lon)*t}));
 }
 return best;
}
/** Query the same immutable dated evidence without network requests or authored tour reuse. */
export function localMapQuery(snapshot:LocalMapSnapshot,reference:LocalMapReference,center:Coordinate,radius:number,transport=false,crossing=false){
 assert.ok(Number.isFinite(radius)&&radius>0&&radius<=250,'Map feature radius must be within250metres');
 const dy=radius/111195,dx=dy/Math.cos(center.latitude*Math.PI/180),[west,south,east,north]=snapshot.bounds;
 assert.ok(center.longitude-dx>=west&&center.longitude+dx<=east&&center.latitude-dy>=south&&center.latitude+dy<=north,'Map query exceeds local snapshot extent');
 const roadTypes=['trunk','primary','secondary','tertiary','residential','unclassified','service','living_street','pedestrian'];
 const wanted=(f:LocalMapSnapshot['elements'][number])=>transport?['station','subway_entrance'].includes(f.tags.railway)||f.tags.building==='train_station':crossing?f.tags.highway==='crossing'||f.tags.footway==='crossing'||f.tags.highway==='footway'||(f.type==='way'&&roadTypes.includes(f.tags.highway)):!!(f.tags.name||f.tags.highway||f.tags.entrance||f.tags.barrier||f.tags.building||f.tags.access);
 const matched=snapshot.elements.filter(wanted).map(f=>({f,d:nearest(f,center)})).filter(x=>x.d<=radius).sort((a,b)=>a.d-b.d||a.f.id-b.f.id);
 const elements:(z.infer<typeof feature>&{geometryTruncated?:boolean})[]=[];
 for(const {f} of matched.slice(0,200)){
  const geometry=f.geometry?.map(p=>p&&Math.abs(p.lat-center.latitude)<=dy&&Math.abs(p.lon-center.longitude)<=dx?p:null);
  const result={...f,...(geometry?{geometry:geometry.slice(0,100),geometryTruncated:geometry.length>100}: {})};
  if(JSON.stringify([...elements,result]).length>24000)break;elements.push(result);
 }
 const query=JSON.stringify({snapshotSha256:reference.sha256,center,radius,transport,crossing});
 const url=snapshot.sourceUrl+'#query-'+hash(query);
 const text='OpenStreetMap mapped features only; current public access, safe standing and visibility are unverified. '+JSON.stringify(elements);
 return {url,requestUrl:snapshot.sourceUrl,text,elements,hash:hash(text),bodyHash:snapshot.sourceSha256,retrievedAt:snapshot.preparedAt,mapDataAt:snapshot.mapDataAt,
  cachePath:reference.path,cacheHit:true,query,queryLimit:200,queryLimitReached:matched.length>200,returnedCount:matched.length,selectedCount:elements.length,
  geometryClippedToQueryBox:true,truncated:matched.length>elements.length||elements.some(e=>e.geometryTruncated===true),
  ...(transport?{focus:'transport' as const,excludedNonTransportCount:0}:{}),...(crossing?{focus:'crossing' as const,excludedUnrelatedCount:0}:{}),
  connectionAttempts:undefined,sourceSnapshotSha256:reference.sha256,sourceBytes:snapshot.sourceBytes,localSnapshot:true,
  attribution:'© OpenStreetMap contributors, ODbL; Geofabrik dated extract',physicalClearance:'unverified' as const,
  limitation:snapshot.limitation+' Features outside this extent or omitted by result limits are not evidence of absence.'};
}
