export const SAVE_VERSION = 1;
export function migrate(raw: { version?: number; state?: unknown }) {
  if (!raw || raw.version !== 1 || !raw.state) throw new Error("Partida incompatible");
  return raw.state;
}
