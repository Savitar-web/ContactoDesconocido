export function waitFor(text: string) {
  return Math.min(4200, 800 + text.length * 22);
}

export function fillLine(text: string, p: { name: string; gender: string }) {
  const mujer = p.gender === "mujer";
  const cortejo = mujer
    ? "Te vi ayer con las cajas y me pareciste guapa. No es un discurso: quería presentarme antes de que la colonia te tragara."
    : "Vi que te mudaste enfrente. No es interés raro: esta colonia se come a quien llega solo.";
  return text
    .replaceAll("{name}", p.name)
    .replaceAll("{lo}", mujer ? "la" : "lo")
    .replaceAll("{solo}", mujer ? "sola" : "solo")
    .replaceAll("{cortejo}", cortejo);
}
