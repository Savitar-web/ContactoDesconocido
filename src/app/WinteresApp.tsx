import { useEffect, useMemo, useRef, useState } from "react";
import nightData from "../content/dialogue/night.json";
import hackData from "../content/dialogue/hack.json";
import { GREETINGS, liveReplies, type Side } from "../content/dialogue/sideThreads";
import { speak } from "../audio/tts";
import { cast, portraits, ROLES } from "../content/characters/cast";
import { evidenceMap } from "../content/evidence/catalog";
import { fillLine as fill, waitFor as delayOf } from "../engine/dialogueEngine";
import { loadSlots, writeSlots, validateSlots, rawSave, unreadableSave, resetUnreadableSave, type Slot } from "../persistence/saveManager";
import OfflineStatus from './OfflineStatus';
import StorySettings from './StorySettings';
import { recoverStory } from '../engine/storyRecovery';
import { personalMilestone } from '../content/characters/personalArcs';
import NarrativeScene from './NarrativeScene';
import { getEncounter, encounterChoices, personalChapters, selectEncounter, CHOICES_PER_CHARACTER, STAGE_NAMES, type EncounterChoice, type EncounterProgress } from '../content/dialogue/encounters';
import { createWorld, tickWorld, socialChoices, dateChoices, applySocial, getBond, crisisReplies, type World, type SocialChoice } from '../engine/livingWorld';

type Msg = { who: string; text: string; at: string; system?: boolean };
type Profile = { name: string; gender: string; role: string; age: number; birth: string; romance: string; photo?: string };
type Rel = { trust: number; close: number; tension: number };
type Beat = { id: string; chat: string; silent?: boolean; incoming: { who: string; text: string }[]; choices: { text: string; next: string; flag?: string; scene?: string; replies?: { who: string; text: string }[] }[] };
type Save = {
  profile: Profile; rel: Record<string, Rel>; flags: Record<string, boolean>; chapter: number;
  threads: Record<string, Msg[]>; unread: Record<string, number>; contacts: string[]; chats: string[];
  pinned: string[]; lastAt: Record<string, number>; evidence: { title: string; detail: string }[];
  memory: Record<string, string>; left: string[]; greeted: string[]; night: string; nightPlayed: Record<string, boolean>;
  mateoSilent: boolean; used: string[];
  encounters?: Record<string, EncounterProgress>; nightIncoming?: Record<string, number>;
  world?: World;
};
const beats = (nightData as { beats: Beat[] }).beats;
const beatMap = Object.fromEntries(beats.map((b) => [b.id, b]));
function clock() { return new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }); }
function label(id: string) { return id === 'system' ? 'Winteres' : id === "group" ? "La Colmena" : id === "rafael" ? "Rafael" : id === "mama" ? "Mamá de Mateo" : id === "desconocido" ? "Desconocido" : cast[id]?.name || id; }
function blank(profile: Profile, explore = false): Save {
  const rel: Record<string, Rel> = {};
  Object.keys(cast).forEach((id) => { rel[id] = { trust: 0, close: 0, tension: 0 }; });
  return { profile, rel, flags: { freeSignal: explore }, chapter: 1, threads: { mateo: [] }, unread: {}, contacts: explore ? Object.keys(cast) : ["mateo"], chats: explore ? Object.keys(cast) : ["mateo"], pinned: [], lastAt: { mateo: Date.now() }, evidence: [], memory: {}, left: [], greeted: ["mateo"], night: explore ? "END" : "invita", nightPlayed: {}, mateoSilent: false, used: [], encounters: {} };
}
function touch(s: Save, id: string) { s.lastAt = { ...s.lastAt, [id]: Date.now() }; }
function evolve(s: Save, currentChat: string, days = 0): Save {
  const tick = tickWorld(s.world || createWorld(), s.night === 'END', days);
  let next: Save = { ...s, world: tick.world, threads: { ...s.threads }, unread: { ...s.unread }, rel: { ...s.rel }, lastAt: { ...s.lastAt } };
  const deliver = (chat: string, who: string, text: string) => {
    next.threads[chat] = [...(next.threads[chat] || []), { who, text: fill(text, s.profile), at: clock(), system: who === 'system' }];
    next.lastAt[chat] = Date.now();
    if (chat !== currentChat) next.unread[chat] = (next.unread[chat] || 0) + 1;
  };
  for (const message of tick.deliveries) {
    deliver(message.who, message.who, message.text);
    const old = next.rel[message.who] || { trust: 0, close: 0, tension: 0 };
    next.rel[message.who] = { ...old, trust: Math.max(-100, old.trust + (message.trust || 0)) };
  }
  const current = beatMap[s.night];
  if (!s.flags.freeSignal && current && tick.world.turn - tick.world.lastPlotTick >= 3) {
    const destinations = [...new Set(current.choices.map(c => c.next))];
    // Only follow an unambiguous story continuation. Never impersonate a player choice.
    if (destinations.length === 1) {
      const nextId = destinations[0]; const following = beatMap[nextId];
      tick.world.lastPlotTick = tick.world.turn; tick.world.missed.push(s.night);
      tick.world.journal.push({ day: tick.world.day, who: 'group', text: `La Colmena continuó sin tu intervención: ${s.night}. Sus mensajes permanecen en el historial.` });
      deliver(current.chat, 'system', 'Mientras hablabas en privado, la conversación siguió. No respondiste por nadie.');
      const contacts = following?.chat === 'group' ? Object.keys(cast) : next.contacts;
      next = { ...next, contacts, chats: Array.from(new Set([...next.chats, ...(following ? [following.chat] : [])])), night: nextId, nightPlayed: { ...next.nightPlayed, [s.night]: true }, nightIncoming: { ...next.nightIncoming }, mateoSilent: Boolean(following?.silent), chapter: Math.min(10, s.chapter + 1) };
      if (following) {
        for (const incoming of following.incoming) {
          let text = incoming.text;
          if (following.id === 'abre' && incoming.who === 'mateo') text = 'La casa se canceló. Diego no sale del hospital y Lucía tiene turno. Nos quedamos aquí. Invité a {name}, aunque quizá esté en otro chat.';
          if (following.id === 'ruido' && incoming.who === 'angela') text = 'Mateo, no salgas. Cierra y escribe desde dentro. No hace falta que alguien más te lo diga.';
          if (following.id === 'ruptura' && incoming.who === 'angela') text = 'Si vamos a la papelería, que sea de día y con gente en la calle. No otra esquina vacía. Quien quiera venir, que avise.';
          if (following.id === 'rescate' && incoming.who === 'diego') text = 'Voy. De día, con Ángela y con la caseta avisada. No de noche y no solos. No vamos a esperar a que todo el grupo esté disponible.';
          deliver(following.chat, incoming.who, text);
        }
        next.nightIncoming = { ...next.nightIncoming, [nextId]: following.incoming.length };
      }
      if (nextId === 'despues') deliver('group', 'system', 'Diego y Ángela encontraron a Mateo en el cuarto de encargos. Se avisó a la caseta. No estuviste en la búsqueda: lo conoces por lo que el grupo cuenta.');
    }
  }
  return next;
}

export default function WinteresApp() {
  const [slots, setSlots] = useState<Slot[]>(() => loadSlots());
  const [view, setView] = useState<"title" | "create" | "app">("title");
  const [step, setStep] = useState(0);
  const [state, setState] = useState<Save | null>(null);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState("mateo");
  const [panel, setPanel] = useState<"chat" | "notes" | "contacts">("chat");
  const [sheet, setSheet] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typer, setTyper] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [scene, setScene] = useState("");
  const [hack, setHack] = useState<string | null>(null);
  const [mind, setMind] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [photo, setPhoto] = useState("");
  const [form, setForm] = useState({ name: "", gender: "mujer", role: "ordinario", romance: "ninguno", age: 21, birth: "2005-04-12" });
  const box = useRef<HTMLDivElement>(null);
  const currentOpen = useRef(open);
  currentOpen.current = open;
  const busy = useRef(false);
  const session = useRef(0);
  const [explore, setExplore] = useState(false);
  const [notice, setNotice] = useState('');
  const [recoveryExported, setRecoveryExported] = useState(false);
  const [search, setSearch] = useState('');
  const [visibleMessages, setVisibleMessages] = useState(100);
  const [draft, setDraft] = useState<{chat:string;text:string}|null>(null);
  const [typingChat, setTypingChat] = useState('mateo');
  const [responseMode, setResponseMode] = useState<'plot' | 'personal' | 'bond'>('plot');
  const [sound, setSound] = useState(() => localStorage.getItem('winteres-sound') !== 'off');
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const [speed, setSpeed] = useState(() => localStorage.getItem('winteres-speed') === 'fast');
  const importRef = useRef<HTMLInputElement>(null);
  const stickToBottom=useRef(true);
  useEffect(()=>{
    if(view!=='app'||!box.current)return;
    const node=box.current;const observer=new ResizeObserver(()=>{if(stickToBottom.current)node.scrollTop=node.scrollHeight;});observer.observe(node);return()=>observer.disconnect();
  },[view,panel]);

  function leaveToTitle() { session.current++; busy.current = false; setTyping(false); setDraft(null); setSheet(false); setScene(''); setView('title'); }
  function pop() { if (soundRef.current) new Audio('/sounds/pop.wav').play().catch(() => {}); }
  function exportSaves() {
    const blob = new Blob([JSON.stringify({ format: 'winteres-backup-v1', slots, original: slots.length ? undefined : rawSave() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `winteres-${new Date().toISOString().slice(0,10)}.json`; a.click(); setRecoveryExported(true); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importSaves(file?: File) {
    if (!file) return;
    try {
      if (file.size > 15_000_000) throw new Error('La copia supera los 15 MB.');
      const parsed = JSON.parse(await file.text()); const imported = validateSlots(Array.isArray(parsed) ? parsed : parsed.slots);
      if (!imported.length) throw new Error('La copia no contiene partidas.');
      const newSlots = [...slots];
      for (const slot of imported) {
        if (newSlots.some(s => s.id === slot.id)) throw new Error('Esa partida ya existe. Exporta y elimina su versión actual si quieres restaurarla.');
        if (newSlots.length >= 3) throw new Error('No hay suficientes cartuchos libres. Tus partidas actuales se conservaron.');
        newSlots.push(slot);
      }
      writeSlots(newSlots); setSlots(newSlots); setNotice('Copia importada. Tus otras partidas siguen intactas.');
    } catch (e) { setNotice(e instanceof Error ? e.message : 'No se pudo importar la copia.'); }
  }
  async function setProfilePhoto(file?: File) {
    if (!file) return;
    try {
      if (file.size > 12_000_000) throw new Error('Elige una imagen menor de 12 MB.');
      const bitmap = await createImageBitmap(file); const canvas = document.createElement('canvas'); canvas.width = canvas.height = 320;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('No se pudo procesar la foto.');
      const side = Math.min(bitmap.width, bitmap.height); ctx.drawImage(bitmap, (bitmap.width-side)/2, (bitmap.height-side)/2, side, side, 0, 0, 320, 320); bitmap.close(); setPhoto(canvas.toDataURL('image/jpeg', .8));
    } catch (e) { setNotice(e instanceof Error ? e.message : 'No se pudo abrir la foto.'); }
  }

  useEffect(() => {
    if (!state || !active) return;
    setSlots(prev => prev.map(s => s.id === active ? { ...s, state, updated: new Date().toISOString(), name: state.profile.name } : s));
  }, [state, active]);
  useEffect(() => {
    try { if (slots.length) writeSlots(slots); }
    catch { setNotice('No se pudo guardar en este dispositivo. Exporta tus partidas antes de cerrar.'); }
  }, [slots]);
  useEffect(() => { setVisibleMessages(100); stickToBottom.current=true; }, [open]);
  useEffect(() => { localStorage.setItem('winteres-sound', sound ? 'on' : 'off'); }, [sound]);
  useEffect(() => { localStorage.setItem('winteres-speed', speed ? 'fast' : 'normal'); }, [speed]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSheet(false); setListOpen(false); setInfoOpen(false); setProfileId(null); setMind(''); } };
    window.addEventListener('keydown', escape); return () => { window.removeEventListener('keydown', escape); };
  }, []);
  const messageCount=state?.threads[open]?.length||0;
  useEffect(() => { if (box.current && stickToBottom.current) box.current.scrollTop = box.current.scrollHeight; }, [messageCount, typing, open]);

  const beat = state ? beatMap[state.night] : undefined;
  const pending = !!(state && beat && beat.chat === open && !state.nightPlayed[state.night] && state.night !== "END");
  const world = state?.world || createWorld();
  const crisis = Boolean(state?.mateoSilent);
  const bond = getBond(world, open);
  const social = [...dateChoices(world, open), ...socialChoices(world, open, state?.rel[open]?.trust || 0, state?.encounters?.[open]?.completed || 0, crisis)];
  useEffect(() => { setResponseMode(pending ? 'plot' : 'personal'); }, [open, pending]);

  async function playBeat(s: Save) {
    const b = beatMap[s.night];
    if (!b || s.nightPlayed[s.night] || busy.current || (s.nightIncoming?.[s.night] || 0) >= b.incoming.length) return;
    const token = session.current;
    busy.current = true; setSheet(false);
    for (let index = s.nightIncoming?.[s.night] || 0; index < b.incoming.length; index++) {
      const inc = b.incoming[index];
      setTypingChat(b.chat); setTyper(inc.who);
      setTyping(true);
      await new Promise((r) => setTimeout(r, speed ? 100 : delayOf(inc.text)));
      if (token !== session.current) return;
      setTyping(false);
      pop();
      const text = fill(inc.text, s.profile);
      setState((prev) => prev ? { ...prev, unread:{...prev.unread,...(b.chat!==currentOpen.current?{[b.chat]:(prev.unread[b.chat]||0)+1}:{})},nightIncoming: { ...prev.nightIncoming, [s.night]: index + 1 }, lastAt: { ...prev.lastAt, [b.chat]: Date.now() }, threads: { ...prev.threads, [b.chat]: [...(prev.threads[b.chat] || []), { who: inc.who, text, at: clock() }] } } : prev);
    }
    busy.current = false;
  }
  useEffect(() => {
    if (view === "app" && state && beat && !state.nightPlayed[state.night]) playBeat(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, open, state?.night, typing]);

  async function exchange(text: string, reply: string, reduce: (prev: Save) => Save, onDone?: () => void) {
    if (!state || typing || busy.current || (open === 'mateo' && state.mateoSilent)) return;
    const chat = open; const token = session.current;
    busy.current = true; setSheet(false); setTyper(chat); setTypingChat(chat); setTyping(true); setDraft({chat, text});
    await new Promise(r => setTimeout(r, speed ? 100 : delayOf(reply)));
    if (token !== session.current) return;
    // A whole turn commits together. Reloading or leaving during typing cannot strand a branch.
    setState(prev => prev ? reduce(prev) : prev);
    pop(); setDraft(null); setTyping(false); busy.current = false; onDone?.();
  }
  async function choose(choice: Beat['choices'][number]) {
    if (!state || !beat) return;
    const chat = beat.chat; const fromId = state.night; const nextBeat = beatMap[choice.next];
    await exchange(fill(choice.text, state.profile), (choice.replies || []).map(r=>r.text).join(' '), prev => {
      const flags = {...prev.flags}; const evidence = [...prev.evidence];
      if(choice.flag) { flags[choice.flag] = true; const ev=evidenceMap[choice.flag]; if(ev && !evidence.some(e=>e.title===ev[0])) evidence.push({title:ev[0],detail:ev[1]}); }
      const messages: Msg[] = [{who:'me',text:fill(choice.text,prev.profile),at:clock()}, ...(choice.replies || []).filter(r=>r.text).map(r=>({who:r.who,text:fill(r.text,prev.profile),at:clock()}))];
      const next:Save = {...prev,flags,evidence,used:[...prev.used,choice.text],nightPlayed:{...prev.nightPlayed,[fromId]:true},memory:{...prev.memory,[chat]:choice.text,lastChoice:choice.text},lastAt:{...prev.lastAt,[chat]:Date.now()},threads:{...prev.threads,[chat]:[...(prev.threads[chat] || []),...messages]},chats:Array.from(new Set([...prev.chats,...(nextBeat?[nextBeat.chat]:[])])),contacts:nextBeat?.chat==='group'?Object.keys(cast):prev.contacts,unread:{...prev.unread,...(nextBeat&&nextBeat.chat!==chat?{[nextBeat.chat]:(prev.unread[nextBeat.chat]||0)+1}:{})},night:choice.next,mateoSilent:Boolean(nextBeat?.silent),chapter:Math.min(10,prev.chapter+1)};
      const nextWorld=tickWorld(next.world || createWorld(),next.night==='END').world; nextWorld.lastPlotTick=nextWorld.turn; next.world=nextWorld;
      return next;
    }, () => { if(choice.scene) setScene(choice.scene); });
  }
  async function sendSide(side:Side) {
    const chat=open; const who=side.who || chat;
    await exchange(side.text,side.reply,prev=>{
      const old=prev.rel[who] || {trust:0,close:0,tension:0}; const clamp=(n:number)=>Math.max(-100,Math.min(100,n));
      const threads={...prev.threads,[chat]:[...(prev.threads[chat]||[]),{who:'me',text:side.text,at:clock()},{who,text:side.reply,at:clock()}]};
      const left=[...prev.left];
      if(side.leave&&!left.includes(who)) { left.push(who); threads.group=[...(threads.group||[]),{who:'system',text:`${label(who)} salió del chat.`,at:clock(),system:true}]; }
      return evolve({...prev,threads,left,greeted:Array.from(new Set([...prev.greeted,chat])),used:[...prev.used,side.text],memory:{...prev.memory,[chat]:side.memory||side.text},lastAt:{...prev.lastAt,[chat]:Date.now()},rel:{...prev.rel,[who]:{trust:clamp(old.trust+(side.fx?.trust||0)),close:clamp(old.close+(side.fx?.close||0)),tension:clamp(old.tension+(side.fx?.tension||0))}}},chat);
    });
  }
  async function sendEncounter(choice:EncounterChoice) {
    const chat=open;
    await exchange(choice.text,choice.reply,prev=>{
      const old=prev.rel[chat]||{trust:0,close:0,tension:0}; const clamp=(n:number)=>Math.max(-100,Math.min(100,n));
      const w=structuredClone(prev.world || createWorld());
      if(choice.followup) { w.events.push({id:`encounter:${choice.id}`,who:chat,due:w.day+2,text:choice.followup,kind:'message'}); w.journal.push({day:w.day,who:chat,text:choice.memory}); }
      const milestone=choice.followup?personalMilestone(chat,choice.next.completed,old.trust+choice.trust):null;
      const milestoneId=`personal:${chat}:${choice.next.completed}`;
      if(milestone && !getBond(w,chat).flags.includes(milestoneId)) { const b=getBond(w,chat);w.bonds[chat]={...b,flags:[...b.flags,milestoneId]};w.events.push({id:milestoneId,who:chat,due:w.day+3,text:milestone,kind:'message'}); }
      return evolve({...prev,world:w,encounters:{...prev.encounters,[chat]:choice.next},rel:{...prev.rel,[chat]:{trust:clamp(old.trust+choice.trust),close:clamp(old.close+choice.close),tension:clamp(old.tension+choice.tension)}},memory:{...prev.memory,[`encounter:${chat}`]:choice.memory},lastAt:{...prev.lastAt,[chat]:Date.now()},threads:{...prev.threads,[chat]:[...(prev.threads[chat]||[]),{who:'me',text:choice.text,at:clock()},{who:chat,text:choice.reply,at:clock()}]}},chat);
    });
  }
  async function sendSocial(choice:SocialChoice) {
    if(choice.locked) { setNotice(choice.locked); return; }
    const chat=open;
    await exchange(choice.text,choice.reply,prev=>{
      // Recheck eligibility at commit: context may have changed while an incoming beat arrived.
      const w=prev.world || createWorld(); const available=[...dateChoices(w,chat),...socialChoices(w,chat,prev.rel[chat]?.trust||0,prev.encounters?.[chat]?.completed||0,prev.mateoSilent)].find(c=>c.id===choice.id);
      if(!available || available.locked) return prev;
      return evolve({...prev,world:applySocial(w,chat,choice.effect),lastAt:{...prev.lastAt,[chat]:Date.now()},threads:{...prev.threads,[chat]:[...(prev.threads[chat]||[]),{who:'me',text:choice.text,at:clock()},{who:chat,text:choice.reply,at:clock()}]}},chat);
    });
  }
  function passDay() {
    if(!state||busy.current) return;
    if(state.night!=='END') { setNotice('La noche de La Colmena sigue en marcha. Puedes hablar con otras personas; la historia avanza cada tres intercambios privados.'); return; }
    setState(prev=>prev?evolve(prev,open,1):prev);
  }
  function enterFictionAccount(id:string) {
    if(!state||state.profile.role!=='tecnico'||!state.mateoSilent||!cast[id])return;
    setHack(id);
    setState(prev=>{
      if(!prev||prev.flags[`intrusion:${id}`])return prev;
      const w=structuredClone(prev.world||createWorld());
      w.events.push({id:`intrusion:${id}`,who:id,due:w.day+1,kind:'message',text:'Vi una sesión de mi cuenta que no era mía. Lo que pasó no te daba permiso para leer toda mi vida. Si vamos a seguir hablando, necesito que no vuelvas a hacerlo.'});
      w.journal.push({day:w.day,who:id,text:'Accediste sin permiso a una cuenta ficticia. La lectura dejó un rastro y afectó la confianza.'});
      const rel=prev.rel[id]||{trust:0,close:0,tension:0};const flags={...prev.flags,[`intrusion:${id}`]:true};const evidence=[...prev.evidence];
      if(id==='mateo'){flags.rafael_msg=true;const ev=evidenceMap.rafael_msg;if(!evidence.some(e=>e.title===ev[0]))evidence.push({title:ev[0],detail:ev[1]});}
      return {...prev,world:w,flags,evidence,rel:{...prev.rel,[id]:{...rel,trust:Math.max(-100,rel.trust-8),tension:Math.min(100,rel.tension+4)}}};
    });
  }
  function startEarly(id: string) {
    if (!state) return;
    const next: Save = { ...state, chats: [...state.chats], contacts: [...state.contacts], threads: { ...state.threads }, lastAt: { ...state.lastAt }, greeted: [...state.greeted] };
    if (!next.contacts.includes(id)) next.contacts.push(id);
    if (!next.chats.includes(id)) next.chats.push(id);
    if (!next.threads[id]) next.threads[id] = [];
    touch(next, id);
    setState(next); setOpen(id); setPanel('chat'); setListOpen(false); setInfoOpen(false); setProfileId(null); setSheet(true);
  }
  const ordered = useMemo(() => {
    if (!state) return [];
    return [...state.chats].sort((a, b) => (state.pinned.includes(a) === state.pinned.includes(b) ? (state.lastAt[b] || 0) - (state.lastAt[a] || 0) : state.pinned.includes(a) ? -1 : 1));
  }, [state]);
  const messages = state?.threads[open] || [];
  const first = state && !state.greeted.includes(open) && open !== "mateo" && open !== "group";
  const used = new Set(state?.used || []);
  const free = ((open === "mateo" && state?.mateoSilent) ? [] : crisis ? crisisReplies(open) : first ? (GREETINGS[open] || []) : (state ? liveReplies(open, { chapter: !state.flags.freeSignal&&(state.night==='END'||['despues','epilogo'].includes(state.night))?10:1, said: state.memory.lastChoice || state.memory.group }) : [])).filter((c) => crisis || !used.has(c.text)).slice(0, 4);
  const storyOpts = (pending && beat ? beat.choices : []).slice(0, 4);
  const encounter = state && !first && !(open === 'mateo' && state.mateoSilent) ? getEncounter(open, state.encounters?.[open]) : null;
  const extraChoices = encounter && !crisis ? encounterChoices(open, state?.encounters?.[open]) : [];
  const scenes: Record<string, string> = {
    papeleria: "{name} llega a la papelería a las cuatro. El sol da en la banqueta y el portón de servicio está cerrado, con una cadena nueva. Diego ya está y no saluda a Iván. Ángela te llama por tu nombre y te dice que no entres {solo} al callejón. Sofía muestra la foto sin publicarla. Nadie encuentra a Mateo. La caseta repite que a las 22:50 el portón se reinició.",
    rescate: "De día, con la caseta avisada, {name} no entra {solo}. Detrás de la papelería hay un cuarto de encargos con reja. Huele a cajas. Mateo está sentado, con la sudadera sucia, y al verte dice tu nombre antes de poder explicar nada. Diego no lo llena de preguntas. Ángela le pasa agua. Nadie graba.",
  };

  const sceneText = scene && state ? fill(scenes[scene] || '', state.profile) : '';

  function createSlot() {
    const profile = { ...form, photo };
    const s = blank({ ...profile, name: profile.name.trim().slice(0, 40) }, explore);
    const slot: Slot = { id: crypto.randomUUID(), name: profile.name, updated: new Date().toISOString(), state: s };
    const nextSlots = [...slots, slot].slice(0, 3);
    try { writeSlots(nextSlots); } catch { setNotice('No se pudo guardar la nueva partida. Exporta tus datos y revisa el espacio disponible.'); return; }
    session.current++; setSlots(nextSlots); setActive(slot.id); setState(s); setView("app"); setOpen("mateo");
  }

  if (view === "title") return (
    <div className="screen landing"><div className="ambient-orbit" aria-hidden="true" />
      <div className="landing-copy"><div className="eyebrow"><i className="live-dot"/> UNA HISTORIA AL OTRO LADO DE LA PANTALLA</div><h1>Contacto<br/><span>Desconocido<span className="title-dot">.</span></span></h1><p>Una desaparición. Nueve vidas que no caben en un chat.<br/>Cada respuesta cambia la distancia entre ustedes.</p><div className="hero-stats"><div><strong>09</strong><span>VOCES PROPIAS</span></div><div><strong>3.888</strong><span>OPCIONES DE DIÁLOGO</span></div><div><strong>100%</strong><span>HISTORIA OFFLINE</span></div></div><div className="portrait-orbit">{Object.keys(cast).map(id => <img key={id} src={portraits[id]} alt={cast[id].name} title={cast[id].name}/>)}</div><small className="fiction-note">Ficción interactiva · Decisiones, intimidad y memoria · Sin cuenta ni servidores de chat</small></div>
      <div className="card glass launch-card"><div className="brand"><img src="/icons/winteres.jpg" alt=""/><div><h2>Winteres</h2><span className="eyebrow">TU PRÓXIMA CONEXIÓN</span></div><span className="version">02 / EVOLUTION</span></div>
      <p className="muted">Elige una señal. Tu progreso se guarda en este dispositivo.</p>
      {slots.map((s) => <div className="save-row" key={s.id}><button className="slot-btn" onClick={() => { session.current++; busy.current = false; setTyping(false); setState(recoverStory(s.state as Save)); setActive(s.id); setView("app"); setOpen("mateo"); setPanel('chat'); }}><span>CONTINUAR · {(s.state as Save).flags.freeSignal ? 'FRECUENCIA LIBRE' : 'HISTORIA PRINCIPAL'}</span><strong>{(s.state as Save).profile?.name || s.name}<b>↗</b></strong></button><button className="delete-save" aria-label={`Eliminar partida ${s.name}`} onClick={() => { if (!window.confirm(`¿Eliminar la partida de ${s.name}? Exporta una copia si quieres conservarla.`)) return; try { const next = slots.filter(x => x.id !== s.id); writeSlots(next); setSlots(next); } catch { setNotice('No se pudo eliminar la partida.'); } }}>×</button></div>)}
      {slots.length < 3 && <><button className="slot-btn new" onClick={() => { setExplore(false); setStep(0); setPhoto(''); setView("create"); }}><span>01 / LA COLMENA</span><strong>Comenzar la historia <b>↗</b></strong><small>Entra en la noche que lo cambia todo.</small></button><button className="slot-btn explore" onClick={() => { setExplore(true); setStep(0); setPhoto(''); setView('create'); }}><span>02 / FRECUENCIA LIBRE</span><strong>Conocer a los nueve <b>↗</b></strong><small>162 encuentros personales. Sin adelantar el misterio.</small></button></>}
      <div className="backup-tools"><button className="ghost" onClick={exportSaves}>↓ Exportar partidas</button><button className="ghost" onClick={() => importRef.current?.click()}>↑ Importar copia</button><input ref={importRef} type="file" hidden accept="application/json,.json" onChange={e => { void importSaves(e.target.files?.[0]); e.target.value = ''; }}/></div>
      {notice && <p className="notice" role="alert">{notice}</p>}
      {unreadableSave() && <div className="notice" role="alert">Hay datos guardados que no se pueden leer. Exporta una copia de recuperación antes de empezar otra partida.<button className="ghost" disabled={!recoveryExported} onClick={()=>{if(window.confirm('¿Guardaste la copia de recuperación? Se quitarán únicamente los datos ilegibles para poder iniciar otra partida.')){resetUnreadableSave();setSlots([]);setNotice('Ya puedes crear una partida o importar una copia válida.');}}}>Restablecer después de exportar</button></div>}
      <OfflineStatus/><div className="local-note">◈ Tu historia permanece contigo. Exporta una copia antes de borrar los datos del navegador.</div>
    </div></div>
  );

  if (view === "create") return (
    <div className="screen"><div className="card glass wa">
      <div className="wa-head"><button className="ghost" onClick={() => step === 0 ? leaveToTitle() : setStep(step - 1)}>← Atrás</button><span className="eyebrow">{explore ? 'FRECUENCIA LIBRE' : 'LA COLMENA'} / 0{step+1}</span><h2>Tu identidad,<br/>tu manera de estar.</h2><p className="muted">Un perfil ficticio. No necesitas usar datos reales.</p><div className="steps">{[0,1,2,3,4,5].map((n) => <i key={n} className={n <= step ? "on" : ""} />)}</div>{notice && <p role="alert" className="notice">{notice}</p>}</div>
      <div className="side">
        {step === 0 && <><label htmlFor="player-name" className="muted">Tu nombre</label><input id="player-name" maxLength={40} autoComplete="nickname" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cómo te van a llamar" /><button className="primary" disabled={!form.name.trim()} onClick={() => setStep(1)}>Siguiente</button></>}
        {step === 1 && <><label htmlFor="player-age" className="muted">Edad del personaje (19–23)</label><input id="player-age" className="field" type="number" min={19} max={23} value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} /><label htmlFor="player-birth" className="muted">Nacimiento ficticio</label><input id="player-birth" className="field" type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} /><button className="primary" disabled={form.age < 19 || form.age > 23 || !form.birth} onClick={() => setStep(2)}>Siguiente</button></>}
        {step === 2 && <><label className="muted">Sexo</label>{[["mujer","Mujer"],["hombre","Hombre"],["otro","Otra"]].map(([v,l]) => <button key={v} className={`sheet-opt ${form.gender===v?"on":""}`} onClick={() => setForm({ ...form, gender: v })}>{l}</button>)}<button className="primary" onClick={() => setStep(3)}>Siguiente</button></>}
        {step === 3 && <><label className="photo-btn">{photo ? <img src={photo} alt="Tu foto de perfil" /> : <strong>+</strong>}<span>Foto opcional</span><input hidden type="file" accept="image/*" onChange={e => void setProfilePhoto(e.target.files?.[0])} /></label><button className="primary" onClick={() => setStep(4)}>Siguiente</button></>}
        {step === 4 && <><label className="muted">Elige un rol</label><div className="role-grid">{ROLES.map(([v,l,d]) => <button key={v} type="button" className={`role-card ${form.role===v?"on":""}`} onClick={() => setForm({ ...form, role: v })}><strong>{l}</strong><span>{d}</span></button>)}</div><button className="primary" onClick={() => setStep(5)}>Siguiente</button></>}
        {step === 5 && <><label className="muted">Interés</label>{[["mujeres","Mujeres"],["hombres","Hombres"],["ambos","Más de un género"],["ninguno","Ahora no"]].map(([v,l]) => <button key={v} className={`sheet-opt ${form.romance===v?"on":""}`} onClick={() => setForm({ ...form, romance: v })}>{l}</button>)}<button className="primary" onClick={createSlot}>Entrar a Winteres</button></>}
      </div>
    </div></div>
  );

  if (!state) return null;
  const hackChats = hackData as Record<string, { who: string; text: string }[]>;
  return (
    <div className="shell">
      <aside className={`glass col col-left ${listOpen ? "show" : ""}`}>
        <div className="brand"><img src="/icons/winteres.jpg" alt="" /><div><h1>Winteres<span className="title-dot">.</span></h1><span className="eyebrow">CONEXIONES HUMANAS</span></div><button className="iconbtn only-mobile" aria-label="Cerrar contactos" onClick={() => setListOpen(false)}>×</button></div>
        <div className="nav-grid"><button className="navbtn" onClick={leaveToTitle}>⌂ Partidas</button>
        <button className={`navbtn ${panel === 'chat' ? 'active' : ''}`} onClick={() => { setPanel("chat"); setListOpen(false); }}>◌ Chats</button>
        <button className={`navbtn ${panel === 'contacts' ? 'active' : ''}`} onClick={() => { setPanel("contacts"); setListOpen(false); }}>◎ Personas</button>
        <button className={`navbtn ${panel === 'notes' ? 'active' : ''}`} onClick={() => { setPanel("notes"); setListOpen(false); }}>▤ Cuaderno</button></div>
        <div className="section-label">SEÑALES RECIENTES <span>{ordered.length}</span></div><input className="chat-search" aria-label="Buscar conversación" placeholder="Buscar una conexión…" value={search} onChange={e => setSearch(e.target.value)}/>
        {state.profile.role === "tecnico" && state.mateoSilent && <button className="navbtn" onClick={() => setHack("menu")}>Cuentas</button>}
        <div className="scroll">
          {ordered.filter(id => label(id).toLocaleLowerCase().includes(search.toLocaleLowerCase())).map((id) => (
            <div key={id} className={`chatrow ${open===id?"active":""}`}>
              <button className="member chatitem" onClick={() => { setOpen(id); setPanel("chat"); setSheet(false); setListOpen(false); setInfoOpen(false); setState({ ...state, unread: { ...state.unread, [id]: 0 } }); }}>
                <img className="av" src={portraits[id] || "/icons/colmena.jpg"} alt="" />
                <div className="chatmeta">
                  <div className="chatline"><strong>{state.pinned.includes(id)?"📌 ":""}{label(id)}{Boolean(state.unread[id])&&<b className="unread-count">{state.unread[id]}</b>}</strong><span>{(state.threads[id]||[]).slice(-1)[0]?.at || ""}</span></div>
                  <div className="preview">{(state.threads[id]||[]).slice(-1)[0]?.who==="me" ? <em className={state.unread[id] ? "" : "seen"}>{state.unread[id] ? "✓" : "✓✓"}</em> : null}<span>{(state.threads[id]||[]).slice(-1)[0]?.text || "Sin mensajes"}</span></div>
                </div>
              </button>
              <div className="dots"><button className="iconbtn" aria-label={`Opciones de ${label(id)}`} onClick={() => setMenu(menu===id?null:id)}>⋯</button>
                {menu===id && <div className="glass menu"><button className="sheet-opt" onClick={() => { setState({ ...state, pinned: state.pinned.includes(id)?state.pinned.filter(x=>x!==id):[...state.pinned,id] }); setMenu(null); }}>{state.pinned.includes(id)?"Soltar":"Fijar chat"}</button></div>}
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-footer"><i className="live-dot"/> {state.flags.freeSignal ? 'FRECUENCIA LIBRE' : `HISTORIA / CAPÍTULO ${state.chapter}`}<span>◈ LOCAL</span></div>
      </aside>
      <section className="glass col main">
        {panel==="chat" && <>
          <div className="top">
            <button className="iconbtn only-mobile" aria-label="Volver" onClick={() => setListOpen(true)}>←</button>
            <button className="avbtn" aria-label={`Ver información de ${label(open)}`} onClick={() => setInfoOpen(true)}><img className="av" src={portraits[open]||"/icons/colmena.jpg"} alt="" /></button>
            <div style={{flex:1}}><strong>{label(open)}</strong><div className="muted">{open==="mateo"&&state.mateoSilent?"última conexión 22:46":typing&&typingChat===open?(open==="group"?`${label(typer)} está escribiendo…`:"escribiendo…"):"en línea"}</div></div>
            <button className="callbtn" aria-label="Videollamada" onClick={() => { setMind("Una videollamada ahora los pondría en el pasillo, con la cara rara y el silencio de Mateo de fondo. No les gusta verse así. Mejor no."); setTimeout(() => setMind(""), 5000); }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="12" height="12" rx="2"/><path d="M15 10l6-3v10l-6-3z"/></svg>
            </button>
            <button className="callbtn" aria-label="Llamada" onClick={() => { setMind("Llamar se sentiría a urgencia falsa. Esta gente no contesta Winteres con la voz a esta hora. Lo dejo."); setTimeout(() => setMind(""), 5000); }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h3l2 5-2 1a12 12 0 006 6l1-2 5 2v3a2 2 0 01-2 2A16 16 0 015 5a2 2 0 012-2z"/></svg>
            </button>
          </div>
          <div className="chat-context"><span>◈ {state.flags.freeSignal ? 'FRECUENCIA LIBRE' : 'LA COLMENA'}</span><span>{cast[open] ? `${state.encounters?.[open]?.completed || 0}/18 ENCUENTROS` : 'HISTORIA PRINCIPAL'}</span><button className="text-btn" onClick={() => { setSound(!sound); }} aria-label={sound ? 'Silenciar sonidos' : 'Activar sonidos'}>{sound ? 'SONIDO ON' : 'SONIDO OFF'}</button></div>
          {beat && beat.chat !== open && <button className="plot-notification" onClick={() => { setOpen(beat.chat); setSheet(false); }}><span className="live-dot"/> La Colmena sigue en marcha<span>{label(beat.chat)} · Ver mensajes ↗</span></button>}
          <div className="msgs" ref={box} onScroll={e=>{const n=e.currentTarget;stickToBottom.current=n.scrollHeight-n.clientHeight-n.scrollTop<160;}}>
            {messages.length > visibleMessages && <button className="ghost load-earlier" onClick={() => {const before=box.current?.scrollHeight||0;setVisibleMessages(n => n + 100);requestAnimationFrame(()=>{if(box.current)box.current.scrollTop=box.current.scrollHeight-before;});}}>Ver 100 mensajes anteriores</button>}
            {!messages.length && !typing && <div className="empty-chat"><div className="empty-signal">◎</div><span className="eyebrow">UNA CONEXIÓN POR DESCUBRIR</span><h2>Al otro lado está {label(open)}.</h2><p>{cast[open]?.bio || 'Algunas historias empiezan con una pregunta.'}</p><button className="primary" onClick={() => setSheet(true)}>Iniciar conversación ↗</button></div>}
            {messages.slice(-visibleMessages).map((m,i)=>(
              <div key={i} className={`bubble ${m.who==="me"?"me":""}`}>
                {m.who!=="me"&&<div className="who">{label(m.who)}</div>}
                {m.text}
                <div className="meta">{m.at} <button className="speak" aria-label="Leer mensaje en voz alta" onClick={()=>speak(m.text)}>◖))</button></div>
              </div>
            ))}
            {draft?.chat === open && <div className="bubble me draft">{draft.text}<div className="meta">enviando…</div></div>}
            {typing && typingChat===open && <div className="bubble typing"><div className="who">{open==="group"?`${label(typer)} está escribiendo`:"escribiendo"}</div><i/><i/><i/></div>}
            {open==="mateo"&&state.mateoSilent&&<div className="muted">Los mensajes a Mateo ya no se entregan.</div>}
          </div>
          <div className="composer">
            <div className="response-tabs" role="group" aria-label="Tipo de conversación">{pending && <button className={responseMode==='plot'?'active':''} onClick={()=>{setResponseMode('plot');setSheet(true);}}>La historia</button>}{cast[open] && <><button className={responseMode==='personal'?'active':''} onClick={()=>{setResponseMode('personal');setSheet(true);}}>Su historia</button><button className={responseMode==='bond'?'active':''} onClick={()=>{setResponseMode('bond');setSheet(true);}}>Nuestro vínculo</button></>}<span>DÍA {world.day+1}</span></div>
            {encounter && !crisis && responseMode==='personal' && <div className="encounter-strip"><span className="encounter-number">{String(encounter.progress.episode + 1).padStart(2, '0')}</span><div><span className="eyebrow">ENCUENTRO / {encounter.phase}</span><strong>{encounter.title}</strong></div><div className="encounter-steps" aria-label={`Etapa ${encounter.progress.stage + 1} de 6`}>{STAGE_NAMES.map((s,i) => <i key={s} className={i <= encounter.progress.stage ? 'on' : ''}/>)}</div></div>}
            {cast[open] && !crisis && responseMode==='personal' && <details className="chapter-selector"><summary>Elegir de qué hablar <span>{state.encounters?.[open]?.completed||0}/18</span></summary><div>{personalChapters(open,state.encounters?.[open]).map(chapter=><button key={chapter.index} disabled={chapter.locked||chapter.finished||typing} onClick={e=>{const selected=selectEncounter(open,chapter.index,state.encounters?.[open]);if(selected){setState(prev=>prev?{...prev,encounters:{...prev.encounters,[open]:selected}}:prev);setSheet(true);e.currentTarget.closest('details')?.removeAttribute('open');}}}><span>{chapter.finished?'✓':chapter.locked?'◇':String(chapter.index+1).padStart(2,'0')}</span>{chapter.title}{chapter.locked&&<small>{chapter.index>=12?'Se abre tras 5 encuentros':'Se abre tras 2 encuentros'}</small>}</button>)}</div></details>}
            <div className="composer-row">
              <button className="iconbtn" aria-label="Sticker" onClick={() => { setMind("Un sticker aquí se oiría a broma. No están para eso."); setTimeout(() => setMind(""), 5000); }}>☺</button>
              <button className="fake" disabled={typing||(open==="mateo"&&state.mateoSilent)} onClick={()=>setSheet(true)}>{typing?"Espera a que terminen…":open==="mateo"&&state.mateoSilent?"No se entrega":"Responder"}</button>
              <button className="iconbtn" aria-label="Audio" onClick={() => { setMind("Un audio ahora sería demasiado íntimo. No creo que les guste oír mi voz en este chat."); setTimeout(() => setMind(""), 5000); }}>●</button>
              <button className="iconbtn" aria-label="Imagen" onClick={() => { setMind("Mandar una foto se sentiría a exhibirme. Con lo que está pasando, no es oportuno."); setTimeout(() => setMind(""), 5000); }}>▦</button>
            </div>
            <div className={`sheet ${sheet&&!typing?"open":""}`}>
              <div className="choice-heading"><span>{responseMode==='plot' && pending ? 'TU RESPUESTA CAMBIA LA HISTORIA' : responseMode==='bond' ? 'ACERCARSE TAMBIÉN ES ESCUCHAR UN LÍMITE' : 'ELIGE CÓMO ACERCARTE'}</span><button className="text-btn" aria-label="Cerrar respuestas" onClick={() => setSheet(false)}>×</button></div>
              {responseMode==='plot' && pending ? storyOpts.map((c,i) => <button key={c.text} className="choice rise" onClick={() => choose(c)}><span className="choice-index">0{i+1}</span>{fill(c.text, state.profile)}</button>) : responseMode==='bond' ? <><p className="encounter-prompt">{label(open)} · {bond.status==='partners'?'Pareja':bond.status==='dating'?'Conociéndonos':bond.status==='apart'?'Con distancia':'Amistad'}{bond.agreement==='exclusive'?' · Exclusividad acordada':bond.agreement==='open'?' · Acuerdo abierto':''}</p>{social.map(c=><button key={c.id} className={`choice ${c.locked?'locked-choice':''}`} onClick={()=>sendSocial(c)} aria-disabled={Boolean(c.locked)}><span className="choice-index">{c.locked?'◇':'↗'}</span><span>{c.text}{c.locked&&<small>{c.locked}</small>}</span></button>)}<p className="muted">Puedes ajustar los temas que deseas explorar en Cuaderno → Límites de historia.</p></> : <>{crisis && <p className="encounter-prompt">Mateo no contesta. Las conversaciones largas y los planes pueden esperar; hoy el grupo habla desde esta preocupación.</p>}{extraChoices.length > 0 && <p className="encounter-prompt">{encounter?.opening}</p>}{extraChoices.map((c,i) => <button key={c.id} className="choice rise" onClick={() => sendEncounter(c)}><span className="choice-index">0{i+1}</span>{c.text}</button>)}{(first || crisis) ? free.map(c=><button key={c.text} className="choice" onClick={()=>sendSide(c)}>{c.text}</button>) : free.length>0 && <details className="everyday"><summary>Charla cotidiana</summary>{free.map(c => <button key={c.text} className="choice" onClick={() => sendSide(c)}>{c.text}</button>)}</details>}{!extraChoices.length && !free.length && <p className="muted">{cast[open] ? 'No hay nuevos encuentros personales ahora. Puedes cambiar de conversación o revisar La Colmena.' : 'No hay respuestas pendientes en este chat. Puedes visitar tus contactos.'}</p>}</>}
            </div>
          </div>
        </>}
        {panel==="contacts"&&<div className="side people-panel"><div className="eyebrow">EL OTRO LADO DE LA SEÑAL</div><h2>Nueve vidas.<br/>Ninguna es una pista.</h2><p className="muted">Directorio de la colonia. Puedes iniciar una conversación con cualquiera; conocer un perfil no significa conocer su intimidad.</p><div className="people-grid">{Object.keys(cast).map((id)=><button key={id} className="person-card" onClick={()=>setProfileId(id)}><img src={portraits[id]} alt="" loading="lazy"/><div><span className="eyebrow">{state.encounters?.[id]?.completed || 0}/18 ENCUENTROS · {CHOICES_PER_CHARACTER} DECISIONES</span><h3>{label(id)}</h3><p>{cast[id].bio}</p><span className="person-link">Abrir conexión ↗</span></div></button>)}</div></div>}
        {panel==="notes"&&<div className="side notebook"><span className="eyebrow">ARCHIVO PERSONAL / SOLO EN TU DISPOSITIVO</span><h2>Lo que permanece.</h2><details className="limits-panel"><summary>Límites de historia y paso del tiempo</summary><StorySettings world={world} onChange={patch=>setState(prev=>prev?{...prev,world:{...(prev.world||createWorld()),...patch}}:prev)} onDay={passDay} canPass={state.night==='END'} speed={speed} onSpeed={()=>setSpeed(!speed)}/></details><h3>Evidencias de la historia</h3>{state.evidence.length?state.evidence.map((e)=><div key={e.title} className="choice"><strong>{e.title}</strong><div className="muted">{e.detail}</div></div>):<p className="muted">Aún no hay evidencias. Los encuentros personales no añaden pruebas al misterio.</p>}<h3>El tiempo deja huellas</h3>{world.journal.slice(-30).reverse().map((entry,i)=><div className="world-entry" key={`${world.journal.length-i}`}><span>DÍA {entry.day+1} · {label(entry.who)}</span><p>{entry.text}</p></div>)}<h3>Memoria de tus vínculos</h3>{Object.keys(cast).filter(id => state.memory[`encounter:${id}`]).map(id => <div className="memory-card" key={id}><img className="av" src={portraits[id]} alt=""/><div><strong>{label(id)}</strong><p>{state.memory[`encounter:${id}`]}</p></div></div>)}<button className="ghost" onClick={exportSaves}>↓ Exportar toda mi historia</button></div>}
      </section>
      <aside className="glass col col-right"><div className="side">
        <img className="av" src={state.profile.photo||"/icons/winteres.jpg"} alt=""/><strong>{state.profile.name}</strong>
        <p className="muted">{ROLES.find(r=>r[0]===state.profile.role)?.[1]} · {state.profile.age}</p><div className="section-label">ESTADO DEL VÍNCULO</div><h2>{label(open)}</h2><p className="muted">{cast[open]?.bio || 'Las piezas de una misma noche.'}</p>{cast[open] && <div className="relation-meters">{[['Confianza', state.rel[open]?.trust || 0], ['Cercanía', state.rel[open]?.close || 0], ['Tensión', state.rel[open]?.tension || 0]].map(([name,value]) => <div key={name}><label>{name}<span>{Number(value)>0?'+':''}{value}</span></label><div className="bar"><span style={{width:`${(Number(value)+100)/2}%`}}/></div></div>)}<p className="muted">No hay respuestas perfectas. La cercanía no sustituye los límites.</p></div>}<div className="mini-memory">{state.memory[`encounter:${open}`] || 'Las decisiones de tus encuentros aparecerán aquí.'}</div><div className="settings-row"><span>Ritmo de lectura</span><button className="ghost" aria-pressed={speed} onClick={() => setSpeed(!speed)}>{speed ? 'Rápido' : 'Natural'}</button></div>
        {state.profile.role==="tecnico"&&state.mateoSilent&&<button className="primary" onClick={()=>setHack("menu")}>Entrar a una cuenta</button>}
        <button className="ghost" onClick={passDay}>{state.night==='END'?'Dejar pasar un día →':'El mundo sigue →'}</button><button className="ghost" onClick={leaveToTitle}>Volver a partidas</button><OfflineStatus/>
      </div></aside>
      <nav className="mobile-nav" aria-label="Navegación principal"><button onClick={() => setListOpen(true)} className={panel==='chat'?'active':''}>◌<span>Chats</span></button><button onClick={() => setPanel('contacts')} className={panel==='contacts'?'active':''}>◎<span>Personas</span></button><button onClick={() => setPanel('notes')} className={panel==='notes'?'active':''}>▤<span>Cuaderno</span></button><button onClick={leaveToTitle}>⌂<span>Partidas</span></button></nav>
      {notice && <div className="toast" role="alert">{notice}<button className="text-btn" aria-label="Cerrar aviso" onClick={() => setNotice('')}>×</button></div>}
      {infoOpen&&<div className="scene" onClick={()=>setInfoOpen(false)}><div className="card glass info" onClick={(e)=>e.stopPropagation()}><h3>{label(open)}</h3><p className="muted">Info del chat. Puedes escribirles antes de que te escriban.</p>{(open==="group"?Object.keys(cast):[open]).filter(id=>cast[id]).map(id=><div key={id} className="member"><img className="av" src={portraits[id]} alt=""/><div className="chatmeta"><strong>{cast[id].name}</strong><span className="muted">{cast[id].bio}</span></div><button className="ghost" onClick={()=>startEarly(id)}>Escribir</button></div>)}<button className="ghost" onClick={()=>setInfoOpen(false)}>Cerrar</button></div></div>}
      {profileId&&cast[profileId]&&<div className="scene" role="dialog" aria-modal="true" aria-label={`Perfil de ${label(profileId)}`} onClick={()=>setProfileId(null)}><div className="card glass profile-dialog" onClick={(e)=>e.stopPropagation()}><button className="dialog-close iconbtn" aria-label="Cerrar perfil" onClick={() => setProfileId(null)}>×</button>
        <img src={portraits[profileId]} alt="" style={{width:120,height:160,objectFit:"cover",borderRadius:16}}/>
        <h3>{cast[profileId].name}</h3><p>{cast[profileId].bio}</p>
        <button className="primary" onClick={()=>startEarly(profileId)}>Escribir tú primero</button>
      </div></div>}
      {scene&&<NarrativeScene text={sceneText} onClose={()=>setScene('')}/>}
      {mind&&<div className="fade-scene mind"><p>{mind}</p></div>}
      {hack&&state.profile.role==="tecnico"&&<div className="hack">
        <button className="ghost" onClick={()=>setHack(null)}>Salir de la intrusión</button>
        <h2>Cuentas de Winteres</h2>
        <p className="muted">No es invisible. Si alguien revisa sesiones, puede verte.</p>
        {hack==="menu"&&<>
          <button className="choice" onClick={()=>enterFictionAccount("mateo")}>Mateo · familia y Rafael</button>
          <button className="choice" onClick={()=>enterFictionAccount("diego")}>Diego y Ángela</button>
          <button className="choice" onClick={()=>enterFictionAccount("antonio")}>Antonio y Lucía</button>
          <button className="choice" onClick={()=>enterFictionAccount("ivan")}>Iván · otra cuenta</button>
          <button className="choice" onClick={()=>enterFictionAccount("sofia")}>Sofía y Valeria</button>
        </>}
        {hack==="mateo"&&<><h3>Mateo con su mamá</h3>{hackChats.mateo_mama.map((m,i)=><div key={i} className="bubble"><div className="who">{label(m.who)}</div>{m.text}</div>)}<h3>Mateo con Rafael</h3>{hackChats.rafael.map((m,i)=><div key={i} className="bubble"><div className="who">{label(m.who)}</div>{m.text}</div>)}<p>El último mensaje de Rafael no es un rechazo. Es una instrucción. El no de la salida y esta hora pueden ser la misma persona.</p></>}
        {hack==="diego"&&hackChats.diego_angela.map((m,i)=><div key={i} className="bubble"><div className="who">{label(m.who)}</div>{m.text}</div>)}
        {hack==="antonio"&&hackChats.antonio_lucia.map((m,i)=><div key={i} className="bubble"><div className="who">{label(m.who)}</div>{m.text}</div>)}
        {hack==="ivan"&&hackChats.ivan_extra.map((m,i)=><div key={i} className="bubble"><div className="who">{label(m.who)}</div>{m.text}</div>)}
        {hack==="sofia"&&hackChats.sofia_valeria.map((m,i)=><div key={i} className="bubble"><div className="who">{label(m.who)}</div>{m.text}</div>)}
      </div>}
    </div>
  );
}
