export function addEvidence(list: { title: string }[], item: { title: string; detail: string }) {
  if (list.some((e) => e.title === item.title)) return list;
  return [...list, item];
}
