export type Slot = { id: string; name: string; updated: string; state: unknown };
const KEY = "cd-slots-v2";
export function loadSlots(): Slot[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function writeSlots(slots: Slot[]) {
  localStorage.setItem(KEY, JSON.stringify(slots.slice(0, 3)));
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
