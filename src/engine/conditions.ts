export function hasFlag(flags: Record<string, boolean>, id?: string) { return !id || !!flags[id]; }
