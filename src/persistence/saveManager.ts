export type Slot = { id: string; name: string; updated: string; state: unknown };
const KEY = "cd-slots-v2";
export function validateSlots(value: unknown): Slot[] {
  if (!Array.isArray(value) || value.length > 3) throw new Error('El archivo debe contener hasta tres partidas.');
  const ids = new Set<string>();
  for (const slot of value) {
    if (!slot || typeof slot.id !== 'string' || ids.has(slot.id) || typeof slot.name !== 'string' || typeof slot.updated !== 'string') throw new Error('Identificador de partida inválido.');
    ids.add(slot.id);
    const s = slot.state;
    if (!s || !s.profile || typeof s.profile.name !== 'string' || !s.threads || !s.rel || !s.flags || !Array.isArray(s.chats) || !Array.isArray(s.contacts) || typeof s.night !== 'string') throw new Error('No es una partida compatible de Winteres.');
    if (!Array.isArray(s.used) || !Array.isArray(s.pinned) || !Array.isArray(s.left) || !Array.isArray(s.evidence) || !Array.isArray(s.greeted) || !s.nightPlayed || !s.memory || !s.lastAt || !s.unread) throw new Error('La partida está incompleta.');
    for (const messages of Object.values(s.threads)) {
      if (!Array.isArray(messages) || messages.some(m => !m || typeof m.text !== 'string' || typeof m.who !== 'string' || typeof m.at !== 'string')) throw new Error('El historial contiene mensajes inválidos.');
    }
    if (s.encounters && (typeof s.encounters !== 'object' || Object.values(s.encounters).some(p => !p || typeof p !== 'object' || !('episode' in p) || !('stage' in p) || !Number.isInteger(p.episode) || Number(p.episode) < 0 || Number(p.episode) > 18 || !Number.isInteger(p.stage) || Number(p.stage) < 0 || Number(p.stage) > 5))) throw new Error('El progreso de encuentros no es válido.');
    if (s.world) {
      const w=s.world;
      if (!Number.isInteger(w.turn) || w.turn<0 || !Number.isInteger(w.day) || w.day<0 || !Number.isInteger(w.lastPlotTick) || !Array.isArray(w.missed) || !Array.isArray(w.events) || !Array.isArray(w.journal) || !w.bonds || ['adult','pregnancy','infidelity'].some(key=>typeof w[key]!=='boolean')) throw new Error('El mundo guardado está incompleto.');
      if(w.events.some((e: {who?:unknown;due?:unknown;text?:unknown;id?:unknown;kind?:unknown})=>!e||typeof e.who!=='string'||typeof e.text!=='string'||typeof e.id!=='string'||typeof e.due!=='number'||!Number.isFinite(e.due)||!['message','betrayal','pregnancy','aftercare','date-expired'].includes(String(e.kind)))) throw new Error('Hay un evento futuro inválido.');
      if(w.journal.some((e:{day?:unknown;who?:unknown;text?:unknown})=>!e||typeof e.day!=='number'||typeof e.who!=='string'||typeof e.text!=='string')) throw new Error('El diario está incompleto.');
      if(Object.values(w.bonds).some(b=>!b||typeof b!=='object'||!('status' in b)||!('agreement' in b)||!('dates' in b)||!('flags' in b)||!('cooldown' in b)||!['friends','dating','partners','apart'].includes(String(b.status))||!['none','exclusive','open'].includes(String(b.agreement))||!Number.isInteger(b.dates)||!Number.isInteger(b.cooldown)||!Array.isArray(b.flags))) throw new Error('Uno de los vínculos guardados no es válido.');
    }
  }
  return value as Slot[];
}
export function loadSlots(): Slot[] {
  try { return validateSlots(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { return []; }
}
export function rawSave() { return localStorage.getItem(KEY); }
export function unreadableSave() { try { validateSlots(JSON.parse(rawSave() || '[]')); return false; } catch { return true; } }
export function resetUnreadableSave() { if (!unreadableSave()) throw new Error('La partida es legible y no se reemplazará.'); localStorage.removeItem(KEY); }
export function writeSlots(slots: Slot[]) {
  validateSlots(slots);
  const raw = rawSave();
  if (raw) {
    try { validateSlots(JSON.parse(raw)); } catch { throw new Error('Existe una partida ilegible. Exporta su recuperación antes de reemplazarla.'); }
  }
  const serialized = JSON.stringify(slots);
  if (raw !== serialized) localStorage.setItem(KEY, serialized);
}
export function loadSave<T>(): T | null {
  const slots = loadSlots();
  return (slots[0]?.state as T) ?? null;
}
export function saveGame(state: unknown) {
  const slots = loadSlots();
  if (!slots.length) return;
  const active = localStorage.getItem("cd-active") || slots[0].id;
  const next = slots.map((s) => s.id === active ? { ...s, state, updated: new Date().toISOString(), name: (state as { profile?: { name?: string } })?.profile?.name || s.name } : s);
  writeSlots(next);
}
