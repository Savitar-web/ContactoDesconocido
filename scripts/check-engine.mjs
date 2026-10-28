import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';
const modules=new Map();
function load(file) {
  if(file.endsWith('.json'))return JSON.parse(readFileSync(file,'utf8'));
  const full=resolve(file.endsWith('.ts')?file:`${file}.ts`);
  if(modules.has(full))return modules.get(full).exports;
  const mod={exports:{}};modules.set(full,mod);
  const source=ts.transpileModule(readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',source)(name=>load(resolve(dirname(full),name)),mod,mod.exports);
  return mod.exports;
}
const e=load('src/content/dialogue/encounters');
const w=load('src/engine/livingWorld');
const persistence=load('src/persistence/saveManager');
const recovery=load('src/engine/storyRecovery');
let branches=0;
for(const {id,episodes,choices}of e.encounterCatalog()) {
  assert.equal(episodes,18);assert.equal(choices,432);
  const ids=new Set(),texts=new Set(),replies=new Set();
  for(let episode=0;episode<18;episode++)for(let stage=0;stage<6;stage++) {
    const options=e.encounterChoices(id,{...e.freshProgress(),episode,stage});
    assert.equal(options.length,4);
    for(const choice of options) { assert(!ids.has(choice.id));ids.add(choice.id);texts.add(choice.text);replies.add(choice.reply);assert(!/undefined|NaN|\{name\}/.test(choice.reply));assert(choice.reply.length>100);branches++; }
  }
  assert.equal(ids.size,432);assert.equal(texts.size,432);assert.equal(replies.size,432);
  let progress=e.freshProgress();
  for(let turn=0;turn<108;turn++)progress=e.encounterChoices(id,progress)[0].next;
  assert.equal(progress.completed,18);assert.equal(e.getEncounter(id,progress),null);
  assert.equal(e.encounterChoices(id,progress).length,0);
  assert.equal(e.selectEncounter(id,0,progress),null,'completed chapters must not farm trust');
  let partial=e.encounterChoices(id)[1].next;
  partial=e.selectEncounter(id,3,partial);assert.equal(partial.stage,0);
  partial=e.encounterChoices(id,partial)[2].next;
  partial=e.selectEncounter(id,0,partial);assert.equal(partial.stage,1);assert.equal(partial.approach,1);
  assert.equal(e.selectEncounter(id,12,partial),null,'deep episodes need prior shared history');
  let world=w.createWorld();
  let option=w.socialChoices(world,id,0,0,false).find(c=>c.effect==='interest');assert(option.locked);
  option=w.socialChoices(world,id,30,4,true).find(c=>c.effect==='interest');assert(option.locked,'a crisis is not a date opportunity');
  option=w.socialChoices(world,id,30,4,false).find(c=>c.effect==='interest');assert(!option.locked);
  world=w.applySocial(world,id,'interest');
  if(['lucia','antonio'].includes(id))world=w.applySocial(world,id,'past');
  world=w.applySocial(world,id,'date');assert.equal(w.getBond(world,id).dates,0);
  let tick=w.tickWorld(world,true,1);world=tick.world;assert(tick.deliveries.length);assert.equal(w.dateChoices(world,id).length,2);
  world=w.applySocial(world,id,'attend');assert.equal(w.getBond(world,id).dates,1);
  option=w.socialChoices(world,id,30,4,false).find(c=>c.effect==='partner');assert(!option.locked);
  world=w.applySocial(world,id,'partner');world=w.applySocial(world,id,'exclusive');assert.equal(w.getBond(world,id).status,'partners');
  assert(w.socialChoices(world,id,30,4,false).find(c=>c.effect==='intimate').locked);
  world.adult=true;world.pregnancy=true;world=w.applySocial(world,id,'intimate');
  assert(w.socialChoices(world,id,30,4,false).some(c=>c.effect==='pregnancy-player'));
  world=w.applySocial(world,id,'pregnancy-player');assert.equal(w.getBond(world,id).pregnancy,'waiting');
  tick=w.tickWorld(world,true,13);world=tick.world;assert.equal(w.getBond(world,id).pregnancy,'waiting');
  tick=w.tickWorld(world,true,1);world=tick.world;assert.equal(w.getBond(world,id).pregnancy,'confirmed');
  const reproductive=w.socialChoices(world,id,30,4,false);assert(reproductive.some(c=>c.effect==='abort'));assert(reproductive.some(c=>c.effect==='continue'));
  world=w.applySocial(world,id,'abort');assert.equal(w.getBond(world,id).pregnancy,'interrupted');
  tick=w.tickWorld(world,true,3);assert(tick.deliveries.some(d=>d.text.includes('compañía o espacio')));
}
// Missed commitments, broken exclusivity, autonomy, cancellations and disabling new sensitive branches.
let world=w.createWorld();world.adult=true;world.infidelity=true;
world=w.applySocial(world,'mateo','interest');world=w.applySocial(world,'mateo','date');
world=w.tickWorld(world,true,1).world;let tick=w.tickWorld(world,true,2);world=tick.world;
assert(tick.deliveries.some(d=>d.trust===-4));assert.equal(w.dateChoices(world,'mateo').length,0);
world=w.applySocial(world,'mateo','partner');world=w.applySocial(world,'mateo','exclusive');world=w.applySocial(world,'sofia','interest');
assert(w.socialChoices(world,'sofia',40,5,false).find(c=>c.effect==='date').locked);
world=w.applySocial(world,'sofia','conceal');tick=w.tickWorld(world,true,2);world=tick.world;
assert.equal(w.getBond(world,'mateo').status,'apart');assert.equal(w.getBond(world,'sofia').status,'apart');assert(tick.deliveries.some(d=>d.who==='mateo'));
world=w.applySocial(world,'lucia','partner');world=w.applySocial(world,'lucia','pregnancy-partner');world=w.tickWorld(world,true,14).world;world=w.applySocial(world,'lucia','pressure');
world=w.tickWorld(world,true,100).world;assert(w.socialChoices(world,'lucia',100,18,false).find(c=>c.effect==='interest').locked);
world.adult=false;world.pregnancy=true;world=w.applySocial(world,'ivan','partner');world=w.applySocial(world,'ivan','intimate');assert(!w.socialChoices(world,'ivan',40,5,false).some(c=>c.effect.startsWith('pregnancy-')));
const frozen=structuredClone(world);w.tickWorld(world,true,1);assert.deepEqual(world,frozen,'world updates must not mutate a previous save');
const first=JSON.parse(readFileSync('src/content/dialogue/night.json','utf8')).beats[0];
const legacy={profile:{name:'Alex',gender:'otro'},night:first.id,nightPlayed:{[first.id]:true},threads:{mateo:[{who:'me',text:first.choices[0].text,at:'22:00'}]},memory:{lastChoice:first.choices[0].text},chats:['mateo'],contacts:['mateo'],mateoSilent:false,chapter:1};
let recovered=recovery.recoverStory(legacy);assert.equal(recovered.night,first.choices[0].next);assert.equal(recovered.threads.mateo.length,2);assert.deepEqual(recovery.recoverStory(recovered),{...recovered,nightIncoming:{...recovered.nightIncoming,colonia:0}},'recovery must not duplicate a reply');
const map=new Map();globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
map.set('cd-slots-v2','{broken');assert.deepEqual(persistence.loadSlots(),[]);assert.throws(()=>persistence.writeSlots([]));assert.equal(map.get('cd-slots-v2'),'{broken');
assert.throws(()=>persistence.validateSlots([{id:'x',name:'x',updated:'x',state:{world:{}}}]));
const validSlot={id:'test',name:'Alex',updated:'2026-10-27',state:{...legacy,rel:{},flags:{},unread:{},lastAt:{},used:[],pinned:[],left:[],evidence:[],greeted:[],world:w.createWorld()}};
assert.equal(persistence.validateSlots([validSlot]).length,1);
assert.throws(()=>persistence.validateSlots([{...validSlot,state:{...validSlot.state,world:{...validSlot.state.world,events:[{id:'bad'}]}}}]));
console.log(`PASS: ${branches} unique authored-context branches, all nine romance routes, chapter resumes, consent gates, delayed pregnancy/aftercare, missed dates, betrayal, immutable saves.`);
