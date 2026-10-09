import { useEffect, useMemo, useRef, useState } from "react";
import nightData from "../content/dialogue/night.json";
import hackData from "../content/dialogue/hack.json";
import { GREETINGS, liveReplies, type Side } from "../content/dialogue/sideThreads";
import { speak } from "../audio/tts";
import { loadSlots, writeSlots, type Slot } from "../persistence/saveManager";

type Msg = { who: string; text: string; at: string; system?: boolean };
type Profile = { name: string; gender: string; role: string; age: number; birth: string; romance: string; photo?: string };
type Rel = { trust: number; close: number; tension: number };
type Beat = { id: string; chat: string; incoming: { who: string; text: string }[]; choices: { text: string; next: string; flag?: string; scene?: string; replies?: { who: string; text: string }[] }[] };
type Save = {
  profile: Profile; rel: Record<string, Rel>; flags: Record<string, boolean>; chapter: number;
  threads: Record<string, Msg[]>; unread: Record<string, number>; contacts: string[]; chats: string[];
  pinned: string[]; lastAt: Record<string, number>; evidence: { title: string; detail: string }[];
  memory: Record<string, string>; left: string[]; greeted: string[]; night: string; nightPlayed: Record<string, boolean>;
  mateoSilent: boolean; used: string[];
};
const cast: Record<string, { name: string; bio: string }> = {
  mateo: { name: "Mateo", bio: "El que escribe primero. Cuida de más desde que su hermano se fue." },
  diego: { name: "Diego", bio: "Amigo de Mateo. Cancela feo y no suaviza. Su papá está en el hospital." },
  angela: { name: "Ángela", bio: "Traduce al grupo y se cansa de ser útil." },
  sofia: { name: "Sofía", bio: "Archiva el antes de las cosas. La cadena suelta es su foto." },
  lucia: { name: "Lucía", bio: "Llega tarde del simulacro. No deja que Antonio hable por ella." },
  antonio: { name: "Antonio", bio: "Se anticipa al juicio. Protege un secreto que no es del grupo." },
  valeria: { name: "Valeria", bio: "Anota horas. No se une a bandos." },
  martina: { name: "Martina", bio: "Prima de Iván. Pesa las palabras. No es puerta de nadie." },
  ivan: { name: "Iván", bio: "El turno no cuadra. Debe, y el orden no es lindo." },
};
const portraits: Record<string, string> = {
  mateo: "/portraits/mateo.jpg", diego: "/portraits/diego.jpg", antonio: "/portraits/antonio.jpg",
  angela: "/portraits/angela.jpg", sofia: "/portraits/sofia.jpg", lucia: "/portraits/lucia.jpg",
  valeria: "/portraits/valeria.jpg", martina: "/portraits/martina.jpg", ivan: "/portraits/ivan.jpg",
  group: "/icons/colmena.jpg",
};
const beats = (nightData as { beats: Beat[] }).beats;
const beatMap = Object.fromEntries(beats.map((b) => [b.id, b]));
const ROLES = [
  ["ordinario", "Ordinario", "Sin atajo. Observas, preguntas y dependes de la gente."],
  ["tecnico", "Genio informático", "Puedes entrar a cuentas de Winteres. No es magia y deja rastro."],
  ["observador", "Observador", "Ves horas, fotos y contradicciones que otros pasan."],
  ["persuasivo", "Persuasivo", "Abres conversaciones que a otros se les cierran."],
  ["empatico", "Empático", "Lees el cansancio. También puedes equivocarte."],
  ["investigador", "Investigador", "Ordenas testimonios. No adivinas culpables."],
];
function clock() { return new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }); }
function delayOf(text: string) { return Math.min(4200, 800 + text.length * 22); }
function label(id: string) { return id === "group" ? "La Colmena" : id === "rafael" ? "Rafael" : id === "mama" ? "Mamá de Mateo" : id === "desconocido" ? "Desconocido" : cast[id]?.name || id; }
function fill(text: string, p: Profile) {
  const mujer = p.gender === "mujer";
  return text.replaceAll("{name}", p.name).replaceAll("{lo}", mujer ? "la" : "lo").replaceAll("{solo}", mujer ? "sola" : "solo");
}
function blank(profile: Profile): Save {
  const rel: Record<string, Rel> = {};
  Object.keys(cast).forEach((id) => { rel[id] = { trust: 0, close: 0, tension: 0 }; });
  return { profile, rel, flags: {}, chapter: 1, threads: { mateo: [] }, unread: {}, contacts: ["mateo"], chats: ["mateo"], pinned: [], lastAt: { mateo: Date.now() }, evidence: [], memory: {}, left: [], greeted: ["mateo"], night: "invita", nightPlayed: {}, mateoSilent: false, used: [] };
}
function touch(s: Save, id: string) { s.lastAt = { ...s.lastAt, [id]: Date.now() }; }

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
  const [typed, setTyped] = useState("");
  const [hack, setHack] = useState<string | null>(null);
  const [mind, setMind] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [photo, setPhoto] = useState("");
  const [form, setForm] = useState({ name: "", gender: "mujer", role: "ordinario", romance: "ninguno", age: 21, birth: "2005-04-12" });
  const box = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (!state || !active) return;
    const next = slots.map((s) => s.id === active ? { ...s, state, updated: new Date().toISOString(), name: state.profile.name } : s);
    writeSlots(next); setSlots(next);
  }, [state]);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [state, typing, open]);

  const beat = state ? beatMap[state.night] : undefined;
  const pending = !!(state && beat && beat.chat === open && !state.nightPlayed[state.night] && state.night !== "END");

  async function playBeat(s: Save) {
    const b = beatMap[s.night];
    if (!b || s.nightPlayed[s.night] || b.chat !== open || busy.current) return;
    busy.current = true; setSheet(false);
    for (const inc of b.incoming) {
      setTyper(inc.who);
      setTyping(true);
      await new Promise((r) => setTimeout(r, delayOf(inc.text)));
      setTyping(false);
      new Audio("/sounds/pop.wav").play().catch(()=>{});
      const text = fill(inc.text, s.profile);
      setState((prev) => prev ? { ...prev, lastAt: { ...prev.lastAt, [b.chat]: Date.now() }, threads: { ...prev.threads, [b.chat]: [...(prev.threads[b.chat] || []), { who: inc.who, text, at: clock() }] } } : prev);
    }
    busy.current = false;
  }
  useEffect(() => {
    if (view === "app" && state && beat && beat.chat === open && !state.nightPlayed[state.night]) playBeat(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, open, state?.night]);

  async function choose(choice: Beat["choices"][number]) {
    if (!state || !beat || typing || busy.current) return;
    const next: Save = { ...state, threads: { ...state.threads }, flags: { ...state.flags }, nightPlayed: { ...state.nightPlayed }, chats: [...state.chats], contacts: [...state.contacts], lastAt: { ...state.lastAt }, unread: { ...state.unread }, evidence: [...state.evidence], memory: { ...state.memory }, left: [...state.left], greeted: [...state.greeted], pinned: [...state.pinned], rel: { ...state.rel }, used: [...(state.used || []), choice.text] };
    next.nightPlayed[state.night] = true;
    next.threads[beat.chat] = [...(next.threads[beat.chat] || []), { who: "me", text: fill(choice.text, state.profile), at: clock() }];
    next.memory[beat.chat] = choice.text;
    next.memory.lastChoice = choice.text;
    if (choice.flag) {
      next.flags[choice.flag] = true;
      if (choice.flag === "evidence_van") next.evidence.push({ title: "Van blanca, 22:41", detail: "Foto de Sofía. Placa tapada." });
      if (choice.flag === "timestamps") next.evidence.push({ title: "Horas de Mateo", detail: "Último mensaje 22:44. Portón reiniciado 22:50." });
    }
    if (choice.scene) setScene(choice.scene);
    if (choice.next === "END") { next.night = "END"; next.mateoSilent = true; next.chapter = 6; }
    else {
      const nxt = beatMap[choice.next];
      next.night = choice.next;
      if (nxt && !next.chats.includes(nxt.chat)) next.chats.push(nxt.chat);
      if (nxt && nxt.chat === "group") Object.keys(cast).forEach((id) => { if (!next.contacts.includes(id)) next.contacts.push(id); });
      if (choice.next === "manana" || choice.next === "plan") next.mateoSilent = true;
      if (nxt && nxt.chat !== open) next.unread[nxt.chat] = (next.unread[nxt.chat] || 0) + 1;
      setOpen(nxt?.chat || open);
    }
    touch(next, beat.chat);
    setSheet(false); setState(next);
    const replies = choice.replies || [];
    if (!replies.length) return;
    busy.current = true;
    for (const inc of replies) {
      setTyper(inc.who);
      setTyping(true);
      await new Promise((r) => setTimeout(r, delayOf(inc.text)));
      setTyping(false);
      const text = fill(inc.text, state.profile);
      setState((prev) => prev ? { ...prev, threads: { ...prev.threads, [beat.chat]: [...(prev.threads[beat.chat] || []), { who: inc.who, text, at: clock() }] } } : prev);
    }
    busy.current = false;
  }
  async function sendSide(side: Side) {
    if (!state || typing || busy.current) return;
    if (open === "mateo" && state.mateoSilent) return;
    const chat = open;
    const who = side.who || chat;
    const next: Save = { ...state, threads: { ...state.threads }, rel: { ...state.rel }, lastAt: { ...state.lastAt }, memory: { ...state.memory }, left: [...state.left], greeted: [...state.greeted], used: [...(state.used || []), side.text] };
    next.threads[chat] = [...(next.threads[chat] || []), { who: "me", text: side.text, at: clock() }];
    next.greeted = Array.from(new Set([...next.greeted, chat]));
    if (chat === "group") next.memory.group = side.text;
    touch(next, chat);
    setTyper(who); setState(next); setSheet(false); setTyping(true);
    await new Promise((r) => setTimeout(r, delayOf(side.reply)));
    setTyping(false);
    setState((prev) => {
      if (!prev) return prev;
      const threads = { ...prev.threads, [chat]: [...(prev.threads[chat] || []), { who, text: side.reply, at: clock() }] };
      const left = [...prev.left];
      if (side.leave && !left.includes(who)) {
        left.push(who);
        threads.group = [...(threads.group || []), { who: "system", text: `${label(who)} salió del chat.`, at: clock(), system: true }];
      }
      return { ...prev, left, threads, lastAt: { ...prev.lastAt, [chat]: Date.now() } };
    });
  }
  function startEarly(id: string) {
    if (!state) return;
    const next: Save = { ...state, chats: [...state.chats], contacts: [...state.contacts], threads: { ...state.threads }, lastAt: { ...state.lastAt }, greeted: [...state.greeted] };
    if (!next.contacts.includes(id)) next.contacts.push(id);
    if (!next.chats.includes(id)) next.chats.push(id);
    if (!next.threads[id]) next.threads[id] = [];
    touch(next, id);
    setState(next); setOpen(id); setProfileId(null); setSheet(true);
  }
  const ordered = useMemo(() => {
    if (!state) return [];
    return [...state.chats].sort((a, b) => (state.pinned.includes(a) === state.pinned.includes(b) ? (state.lastAt[b] || 0) - (state.lastAt[a] || 0) : state.pinned.includes(a) ? -1 : 1));
  }, [state]);
  const messages = state?.threads[open] || [];
  const first = state && !state.greeted.includes(open) && open !== "mateo" && open !== "group";
  const used = new Set(state?.used || []);
  const free = ((open === "mateo" && state?.mateoSilent) ? [] : first ? (GREETINGS[open] || []) : (state ? liveReplies(open, { chapter: state.chapter, said: state.memory.lastChoice || state.memory.group }) : [])).filter((c) => !used.has(c.text)).slice(0, 4);
  const storyOpts = (pending && beat ? beat.choices : []).filter((c) => !used.has(c.text)).slice(0, 4);
  const scenes: Record<string, string> = {
    papeleria: "{name} llega a la papelería a las cuatro. El sol da en la banqueta y el portón de servicio está cerrado, con una cadena nueva. Diego ya está, de brazos cruzados, y no saluda a Iván cuando lo ve cruzar la calle. Ángela llama a {name} por su nombre y le dice que no entre {solo} al callejón. Sofía muestra la foto sin publicarla. Nadie encuentra a Mateo. La caseta repite que a las 22:50 el portón se reinició y que no vieron a nadie.",
  };

  useEffect(() => {
    if (!scene) return;
    const full = state ? fill(scenes[scene] || "", state.profile) : "";
    setTyped("");
    let i = 0;
    const t = setInterval(() => { i += 1; setTyped(full.slice(0, i)); if (i >= full.length) clearInterval(t); }, 18);
    return () => clearInterval(t);
  }, [scene]);

  function createSlot() {
    const profile = { ...form, photo };
    const s = blank(profile);
    const slot: Slot = { id: crypto.randomUUID(), name: profile.name, updated: new Date().toISOString(), state: s };
    const nextSlots = [...slots, slot].slice(0, 3);
    writeSlots(nextSlots); setSlots(nextSlots); setActive(slot.id); setState(s); setView("app"); setOpen("mateo");
  }

  if (view === "title") return (
    <div className="screen"><div className="card glass">
      <img src="/icons/winteres.jpg" alt="" width={72} height={72} style={{ borderRadius: 18 }} />
      <h2>Winteres</h2>
      <p className="muted">Tres cartuchos. Al elegir uno nuevo, el alta va por secciones.</p>
      {slots.map((s) => <button key={s.id} className="slot-btn" onClick={() => { setState(s.state as Save); setActive(s.id); setView("app"); setOpen("mateo"); }}><span>Continuar</span><strong>{(s.state as Save).profile?.name || s.name}</strong></button>)}
      {slots.length < 3 && <button className="slot-btn new" onClick={() => { setStep(0); setView("create"); }}><span>Cartucho vacío</span><strong>Nueva partida</strong></button>}
      {slots[0] && <button className="ghost" onClick={() => { const next = slots.slice(1); writeSlots(next); setSlots(next); }}>Borrar la primera</button>}
    </div></div>
  );

  if (view === "create") return (
    <div className="screen"><div className="card glass wa">
      <div className="wa-head"><button className="ghost" onClick={() => step === 0 ? setView("title") : setStep(step - 1)}>Atrás</button><h2>Crear cuenta</h2><div className="steps">{[0,1,2,3,4,5].map((n) => <i key={n} className={n <= step ? "on" : ""} />)}</div></div>
      <div className="side">
        {step === 0 && <><label className="muted">Tu nombre</label><input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cómo te van a llamar" /><button className="primary" disabled={!form.name.trim()} onClick={() => setStep(1)}>Siguiente</button></>}
        {step === 1 && <><label className="muted">Edad y nacimiento</label><input className="field" type="number" min={19} max={23} value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} /><input className="field" type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} /><button className="primary" onClick={() => setStep(2)}>Siguiente</button></>}
        {step === 2 && <><label className="muted">Sexo</label>{[["mujer","Mujer"],["hombre","Hombre"],["otro","Otra"]].map(([v,l]) => <button key={v} className={`sheet-opt ${form.gender===v?"on":""}`} onClick={() => setForm({ ...form, gender: v })}>{l}</button>)}<button className="primary" onClick={() => setStep(3)}>Siguiente</button></>}
        {step === 3 && <><label className="photo-btn">{photo ? <img src={photo} alt="" /> : <strong>+</strong>}<span>Foto</span><input hidden type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => setPhoto(String(r.result||"")); r.readAsDataURL(file); }} /></label><button className="primary" onClick={() => setStep(4)}>Siguiente</button></>}
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
        <div className="brand"><img src="/icons/winteres.jpg" alt="" /><h1>Winteres</h1></div>
        <button className="navbtn" onClick={() => setView("title")}>Partidas</button>
        <button className="navbtn" onClick={() => setPanel("chat")}>Chats</button>
        <button className="navbtn" onClick={() => setPanel("contacts")}>Contactos</button>
        <button className="navbtn" onClick={() => setPanel("notes")}>Cuaderno</button>
        {state.profile.role === "tecnico" && state.mateoSilent && <button className="navbtn" onClick={() => setHack("menu")}>Cuentas</button>}
        <div className="scroll">
          {ordered.map((id) => (
            <div key={id} className={`chatrow ${open===id?"active":""}`}>
              <button className="member chatitem" onClick={() => { setOpen(id); setPanel("chat"); setSheet(false); setListOpen(false); setInfoOpen(false); setState({ ...state, unread: { ...state.unread, [id]: 0 } }); }}>
                <img className="av" src={portraits[id] || "/icons/colmena.jpg"} alt="" />
                <div className="chatmeta">
                  <div className="chatline"><strong>{state.pinned.includes(id)?"📌 ":""}{label(id)}</strong><span>{(state.threads[id]||[]).slice(-1)[0]?.at || ""}</span></div>
                  <div className="preview">{(state.threads[id]||[]).slice(-1)[0]?.who==="me" ? <em className={state.unread[id] ? "" : "seen"}>{state.unread[id] ? "✓" : "✓✓"}</em> : null}<span>{(state.threads[id]||[]).slice(-1)[0]?.text || "Sin mensajes"}</span></div>
                </div>
              </button>
              <div className="dots"><button className="iconbtn" onClick={() => setMenu(menu===id?null:id)}>⋯</button>
                {menu===id && <div className="glass menu"><button className="sheet-opt" onClick={() => { setState({ ...state, pinned: state.pinned.includes(id)?state.pinned.filter(x=>x!==id):[...state.pinned,id] }); setMenu(null); }}>{state.pinned.includes(id)?"Soltar":"Fijar chat"}</button></div>}
              </div>
            </div>
          ))}
        </div>
      </aside>
      <section className="glass col main">
        {panel==="chat" && <>
          <div className="top">
            <button className="iconbtn only-mobile" aria-label="Volver" onClick={() => setListOpen(true)}>←</button>
            <button className="avbtn" onClick={() => setInfoOpen(true)}><img className="av" src={portraits[open]||"/icons/colmena.jpg"} alt="" /></button>
            <div style={{flex:1}}><strong>{label(open)}</strong><div className="muted">{open==="mateo"&&state.mateoSilent?"última conexión 22:46":typing?(open==="group"?`${label(typer)} está escribiendo…`:"escribiendo…"):"en línea"}</div></div>
            <button className="callbtn" aria-label="Videollamada" onClick={() => { setMind("Una videollamada ahora los pondría en el pasillo, con la cara rara y el silencio de Mateo de fondo. No les gusta verse así. Mejor no."); setTimeout(() => setMind(""), 5000); }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="12" height="12" rx="2"/><path d="M15 10l6-3v10l-6-3z"/></svg>
            </button>
            <button className="callbtn" aria-label="Llamada" onClick={() => { setMind("Llamar se sentiría a urgencia falsa. Esta gente no contesta Winteres con la voz a esta hora. Lo dejo."); setTimeout(() => setMind(""), 5000); }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h3l2 5-2 1a12 12 0 006 6l1-2 5 2v3a2 2 0 01-2 2A16 16 0 015 5a2 2 0 012-2z"/></svg>
            </button>
          </div>
          <div className="msgs" ref={box}>
            {messages.map((m,i)=>(
              <div key={i} className={`bubble ${m.who==="me"?"me":""}`}>
                {m.who!=="me"&&<div className="who">{label(m.who)}</div>}
                {m.text}
                <div className="meta">{m.at} <button className="speak" onClick={()=>speak(m.text)}>🔊</button></div>
              </div>
            ))}
            {typing && <div className="bubble typing"><div className="who">{open==="group"?`${label(typer)} está escribiendo`:"escribiendo"}</div><i/><i/><i/></div>}
            {open==="mateo"&&state.mateoSilent&&<div className="muted">Los mensajes a Mateo ya no se entregan.</div>}
          </div>
          <div className="composer">
            <div className="composer-row">
              <button className="iconbtn" aria-label="Sticker" onClick={() => { setMind("Un sticker aquí se oiría a broma. No están para eso."); setTimeout(() => setMind(""), 5000); }}>☺</button>
              <button className="fake" disabled={typing||(open==="mateo"&&state.mateoSilent)} onClick={()=>setSheet(true)}>{typing?"Espera a que terminen…":open==="mateo"&&state.mateoSilent?"No se entrega":"Responder"}</button>
              <button className="iconbtn" aria-label="Audio" onClick={() => { setMind("Un audio ahora sería demasiado íntimo. No creo que les guste oír mi voz en este chat."); setTimeout(() => setMind(""), 5000); }}>●</button>
              <button className="iconbtn" aria-label="Imagen" onClick={() => { setMind("Mandar una foto se sentiría a exhibirme. Con lo que está pasando, no es oportuno."); setTimeout(() => setMind(""), 5000); }}>▦</button>
            </div>
            <div className={`sheet ${sheet&&!typing?"open":""}`}>
              {(pending ? storyOpts : free).slice(0, 4).map((c) => <button key={c.text} className="choice rise" onClick={() => pending ? choose(c) : sendSide(c)}>{fill(c.text, state.profile)}</button>)}
            </div>
          </div>
        </>}
        {panel==="contacts"&&<div className="side">{state.contacts.map((id)=><button key={id} className="member" onClick={()=>setProfileId(id)}><img className="av" src={portraits[id]} alt=""/>{label(id)}</button>)}</div>}
        {panel==="notes"&&<div className="side">{state.evidence.length?state.evidence.map((e)=><div key={e.title} className="choice"><strong>{e.title}</strong><div className="muted">{e.detail}</div></div>):<p className="muted">Todavía no marcas nada.</p>}</div>}
      </section>
      <aside className="glass col col-right"><div className="side">
        <img className="av" src={state.profile.photo||"/icons/winteres.jpg"} alt=""/><strong>{state.profile.name}</strong>
        <p className="muted">{ROLES.find(r=>r[0]===state.profile.role)?.[1]} · {state.profile.age}</p>
        {state.profile.role==="tecnico"&&state.mateoSilent&&<button className="primary" onClick={()=>setHack("menu")}>Entrar a una cuenta</button>}
        <button className="ghost" onClick={()=>setView("title")}>Menú</button>
      </div></aside>
      {infoOpen&&<div className="scene" onClick={()=>setInfoOpen(false)}><div className="card glass info" onClick={(e)=>e.stopPropagation()}><h3>{label(open)}</h3><p className="muted">Info del chat. Puedes escribirles antes de que te escriban.</p>{(open==="group"?Object.keys(cast):[open]).filter(id=>cast[id]).map(id=><div key={id} className="member"><img className="av" src={portraits[id]} alt=""/><div className="chatmeta"><strong>{cast[id].name}</strong><span className="muted">{cast[id].bio}</span></div><button className="ghost" onClick={()=>startEarly(id)}>Escribir</button></div>)}<button className="ghost" onClick={()=>setInfoOpen(false)}>Cerrar</button></div></div>}
      {profileId&&cast[profileId]&&<div className="scene" onClick={()=>setProfileId(null)}><div className="card glass" onClick={(e)=>e.stopPropagation()}>
        <img src={portraits[profileId]} alt="" style={{width:120,height:160,objectFit:"cover",borderRadius:16}}/>
        <h3>{cast[profileId].name}</h3><p>{cast[profileId].bio}</p>
        <button className="primary" onClick={()=>startEarly(profileId)}>Escribir tú primero</button>
      </div></div>}
      {scene&&<div className="fade-scene"><p>{typed}</p><button className="primary" onClick={()=>setScene("")}>Volver al teléfono</button></div>}
      {mind&&<div className="fade-scene mind"><p>{mind}</p></div>}
      {hack&&state.profile.role==="tecnico"&&<div className="hack">
        <button className="ghost" onClick={()=>setHack(null)}>Salir de la intrusión</button>
        <h2>Cuentas de Winteres</h2>
        <p className="muted">No es invisible. Si alguien revisa sesiones, puede verte.</p>
        {hack==="menu"&&<>
          <button className="choice" onClick={()=>setHack("mateo")}>Mateo · familia y Rafael</button>
          <button className="choice" onClick={()=>setHack("diego")}>Diego y Ángela</button>
          <button className="choice" onClick={()=>setHack("antonio")}>Antonio y Lucía</button>
          <button className="choice" onClick={()=>setHack("ivan")}>Iván · otra cuenta</button>
          <button className="choice" onClick={()=>setHack("sofia")}>Sofía y Valeria</button>
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
