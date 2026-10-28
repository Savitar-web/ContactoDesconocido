import story from '../content/dialogue/night.json';
import { fillLine } from './dialogueEngine';
type Message = { who:string; text:string; at:string };
type Recoverable = { profile:{name:string;gender:string}; night:string; nightPlayed:Record<string,boolean>; nightIncoming?:Record<string,number>; threads:Record<string,Message[]>; memory:Record<string,string>; chats:string[]; contacts:string[]; mateoSilent:boolean; chapter:number };
export function recoverStory<T extends Recoverable>(original:T):T {
  const beat=story.beats.find(b=>b.id===original.night);
  if(!beat)return original;
  const s={...original,threads:{...original.threads},nightIncoming:{...original.nightIncoming}};
  const messages=s.threads[beat.chat]||[];
  if(original.nightIncoming?.[beat.id]===undefined) {
    let cursor=0,count=0;
    for(const incoming of beat.incoming) { const index=messages.findIndex((m,i)=>i>=cursor&&m.who===incoming.who&&m.text===fillLine(incoming.text,s.profile));if(index<0)break;cursor=index+1;count++; }
    s.nightIncoming[beat.id]=count;
  }
  // Older builds marked the choice played BEFORE committing its replies and continuation.
  if(s.nightPlayed[beat.id]) {
    const choice=beat.choices.find(c=>c.text===s.memory.lastChoice);
    if(!choice)return s;
    const sent=fillLine(choice.text,s.profile);
    let start=-1;messages.forEach((m,i)=>{if(m.who==='me'&&m.text===sent)start=i;});
    const tail=messages.slice(start+1);const missing=(choice.replies||[]).filter(r=>r.text&&!tail.some(m=>m.who===r.who&&m.text===fillLine(r.text,s.profile)));
    s.threads[beat.chat]=[...messages,...missing.map(r=>({who:r.who,text:fillLine(r.text,s.profile),at:'recuperado'}))];
    const following=story.beats.find(b=>b.id===choice.next);
    s.night=choice.next;s.mateoSilent=Boolean(following?.silent);s.chapter=Math.min(10,s.chapter+1);
    if(following){s.chats=Array.from(new Set([...s.chats,following.chat]));if(following.chat==='group')s.contacts=['mateo','diego','angela','sofia','lucia','antonio','valeria','martina','ivan'];}
  }
  return s;
}
