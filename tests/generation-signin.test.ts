import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, stat, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { CredentialRenewalError, createAuthorization, loadCredentials, loadOverflowEvidence, renewCredentials, type AppCredentials } from '../tools/generation/signin';

const now = 1_800_000_000_000;
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'renewal-test', alg: 'RS256', use: 'sig' };
const claims = { iss: 'https://auth.openai.com', aud: 'oaiapp_renewal_fixture', sub: 'fixture-account', nonce: 'original-nonce', exp: now / 1000 + 3600 };
function token(changes: Record<string, unknown> = {}) {
 const payload = `${Buffer.from(JSON.stringify({ alg:'RS256',kid:jwk.kid })).toString('base64url')}.${Buffer.from(JSON.stringify({...claims,...changes})).toString('base64url')}`;
 return `${payload}.${sign('RSA-SHA256',Buffer.from(payload),privateKey).toString('base64url')}`;
}
const credentials: AppCredentials = { version:1,provider:'chatgpt-plan',clientId:claims.aud,accountSubject:claims.sub,hostId:'urn:uuid:fixture',accessToken:'fixture-old-access',refreshToken:'fixture-old-refresh',idToken:token(),grantedScopes:['openid','offline_access','resource.invoke','chatgpt.tokens.use.direct'],expiresAt:now+20_000,validatedAt:now-3_580_000 };
const replacement = { access_token:'fixture-new-access',refresh_token:'fixture-new-refresh',token_type:'Bearer',expires_in:3600 };
async function setup(c:AppCredentials=credentials) {
 const root=await mkdtemp(path.join(os.tmpdir(),'tour-renewal-')),dir=path.join(root,'local-data/generation-auth');
 await mkdir(dir,{recursive:true,mode:0o700});
 await writeFile(path.join(dir,'credentials.json'),JSON.stringify(c),{mode:0o600});
 await writeFile(path.join(dir,'overflow-evidence.json'),JSON.stringify({disabled:true,source:'owner-observed-chatgpt-usage',clientId:c.clientId,accountSubject:c.accountSubject,verifiedAt:now-1000}),{mode:0o600});
 return {root,dir,cleanup:()=>rm(root,{recursive:true,force:true})};
}
const fixtureFetcher=(response:()=>Response):typeof fetch=>async url=>{
 if(String(url).endsWith('openid-configuration'))return Response.json({issuer:'https://auth.openai.com',jwks_uri:'https://auth.openai.com/.well-known/jwks.json',token_endpoint:'https://auth.openai.com/api/accounts/oauth/token'});
 if(String(url).endsWith('jwks.json'))return Response.json({keys:[jwk]});
 return response();
};

test('refresh rotates atomically with same grant, no scope expansion and unchanged overflow evidence',async()=>{
 const {root,dir,cleanup}=await setup();try {
 const overflow=await loadOverflowEvidence(root);let requests=0;
 const c=await renewCredentials(root,{now:()=>now,fetch:async(url,init)=>{
  requests++;assert.equal(url,'https://auth.openai.com/api/accounts/oauth/token');assert.equal(init?.redirect,'error');
  const body=new URLSearchParams(String(init?.body));
  assert.deepEqual(Object.fromEntries(body),{grant_type:'refresh_token',client_id:credentials.clientId,refresh_token:credentials.refreshToken,resource:'https://api.openai.com/v1'});
  assert.equal(body.has('scope'),false);assert.equal(body.has('client_secret'),false);
  return Response.json(replacement);
 }});
 assert.equal(requests,1);assert.equal(c?.accessToken,replacement.access_token);assert.equal(c?.refreshToken,replacement.refresh_token);
 assert.equal(c?.validatedAt,credentials.validatedAt);assert.equal(c?.refreshedAt,now);assert.equal(c?.accountSubject,credentials.accountSubject);assert.equal(c?.expiresAt,now+3_600_000);
 assert.deepEqual(await loadOverflowEvidence(root),overflow);assert.deepEqual(await loadCredentials(root),c);
 assert.equal((await stat(path.join(dir,'credentials.json'))).mode&0o777,0o600);
 const account=`account-${createHash('sha256').update(`${c!.clientId}:${c!.accountSubject}`).digest('hex')}.json`;
 assert.equal(JSON.parse(await readFile(path.join(dir,account),'utf8')).refreshToken,replacement.refresh_token);
 }finally{await cleanup();}
});

test('overlapping refreshes serialize and reload the replacement rather than reuse a rotating token',async()=>{
 const {root,cleanup}=await setup();try {
 let calls=0;let release!:()=>void;const barrier=new Promise<void>(resolve=>{release=resolve;});
 const fetcher:typeof fetch=async()=>{calls++;await barrier;return Response.json(replacement);};
 const first=renewCredentials(root,{fetch:fetcher,now:()=>now});
 const second=renewCredentials(root,{fetch:fetcher,now:()=>now});
 release();const values=await Promise.all([first,second]);assert.equal(calls,1);assert.deepEqual(values[0],values[1]);
 }finally{await cleanup();}
});

test('valid access skips renewal; missing offline permission never dispatches a refresh',async()=>{
 for(const [c,expectedCalls] of [[{...credentials,expiresAt:now+3_600_000},0],[{...credentials,grantedScopes:['openid','resource.invoke','chatgpt.tokens.use.direct']},0]] as [AppCredentials,number][]){
 const {root,cleanup}=await setup(c);try {let calls=0;const promise=renewCredentials(root,{now:()=>now,fetch:async()=>{calls++;throw Error('must not fetch');}});
 if(c.expiresAt>now+60_000)assert.deepEqual(await promise,c);else await assert.rejects(promise,(e:unknown)=>e instanceof CredentialRenewalError&&e.code==='offline_access_required');assert.equal(calls,expectedCalls);
 }finally{await cleanup();}}
});

test('temporary refresh and invalid client errors preserve tokens and never echo response text',async()=>{
 for(const mode of ['network','server','client']){
 const {root,cleanup}=await setup();try {
 await assert.rejects(renewCredentials(root,{now:()=>now,fetch:async()=>{
  if(mode==='network')throw Error(credentials.refreshToken);
  return Response.json({error:mode==='client'?'invalid_client':'server_error',error_description:credentials.refreshToken},{status:mode==='client'?400:503});
 }}),(e:unknown)=>e instanceof CredentialRenewalError&&!e.message.includes(credentials.refreshToken!)&&!e.reauthorizationRequired);
 assert.deepEqual(await loadCredentials(root),credentials);
 }finally{await cleanup();}}
});

test('terminal refresh rejection clears unusable token copies while retaining original registration and overflow evidence',async()=>{
 for(const code of ['invalid_grant','invalid_refresh_token','token_expired','refresh_token_expired','refresh_token_invalidated','refresh_token_reused']){
 const {root,dir,cleanup}=await setup();try {
 await assert.rejects(renewCredentials(root,{now:()=>now,fetch:async()=>Response.json({error:code,error_description:credentials.accessToken},{status:400})}),(e:unknown)=>e instanceof CredentialRenewalError&&e.code===code&&e.reauthorizationRequired);
 assert.equal(await loadCredentials(root),null);
 const registration=JSON.parse(await readFile(path.join(dir,'registration.json'),'utf8'));
 assert.deepEqual(registration,{clientId:credentials.clientId,accountSubject:credentials.accountSubject,hostId:credentials.hostId});
 const auth=createAuthorization('http://127.0.0.1:12345/auth/callback',registration.hostId,registration);
 assert.equal(auth.pending.clientId,credentials.clientId);assert.equal(auth.pending.accountSubject,credentials.accountSubject);assert.equal(new URL(auth.url).searchParams.has('id_token_hint'),false);
 assert.equal((await loadOverflowEvidence(root))?.verifiedAt,now-1000);
 }finally{await cleanup();}}
});

test('refresh accepts signed same-account ID token with omitted nonce, rejects account, nonce and signature substitution',async()=>{
 for(const changes of [null,{sub:'other-account'},{nonce:'different'},{aud:'oaiapp_other'}]){
 const {root,cleanup}=await setup();try {
 const id=changes===null?token({nonce:undefined}):token(changes);
 const promise=renewCredentials(root,{now:()=>now,fetch:fixtureFetcher(()=>Response.json({...replacement,id_token:id}))});
 if(changes===null){assert.equal((await promise)?.idToken,id);assert.equal((await loadCredentials(root))?.validatedAt,credentials.validatedAt);}
 else {await assert.rejects(promise,(e:unknown)=>e instanceof CredentialRenewalError&&e.code==='refresh_identity_validation_failed');assert.deepEqual(await loadCredentials(root),credentials);}
 }finally{await cleanup();}}
 const {root,cleanup}=await setup();try {
 await assert.rejects(renewCredentials(root,{now:()=>now,fetch:fixtureFetcher(()=>Response.json({...replacement,id_token:token().slice(0,-15)+'invalid'}))}),/refresh_identity_validation_failed/);
 }finally{await cleanup();}
});

test('refresh refuses missing replacement and changed explicit scopes without overwriting prior credentials',async()=>{
 for(const changes of [{refresh_token:undefined},{scope:'openid resource.invoke chatgpt.tokens.use.direct'},{scope:credentials.grantedScopes.join(' ')+' unexpected.scope'}]){
 const {root,cleanup}=await setup();try {
 await assert.rejects(renewCredentials(root,{now:()=>now,fetch:fixtureFetcher(()=>Response.json({...replacement,...changes}))}),CredentialRenewalError);
 assert.deepEqual(await loadCredentials(root),credentials);
 }finally{await cleanup();}}
});

test('original nonce survives a nonce-free refresh so the next signed rotation remains identity-bound',async()=>{
 const {root,cleanup}=await setup();try {
 const first=await renewCredentials(root,{now:()=>now,fetch:fixtureFetcher(()=>Response.json({...replacement,id_token:token({nonce:undefined})}))});
 assert.equal(first?.authorizationNonce,'original-nonce');
 const later=now+3_590_000;
 const second=await renewCredentials(root,{now:()=>later,fetch:fixtureFetcher(()=>Response.json({...replacement,refresh_token:'fixture-third-refresh',id_token:token({exp:later/1000+3600})}))});
 assert.equal(second?.authorizationNonce,'original-nonce');assert.equal(second?.refreshToken,'fixture-third-refresh');assert.equal(second?.validatedAt,credentials.validatedAt);
 }finally{await cleanup();}
});
