export const cast: Record<string, { name: string; age: number; bio: string; voice: string }> = {
  mateo: { name: "Mateo", age: 21, bio: "El que escribe primero. Cuida de más desde que su hermano se fue.", voice: "Frases largas, se disculpa y no deja un ruido sin mirar." },
  diego: { name: "Diego", age: 22, bio: "Amigo de Mateo. Cancela feo y no suaviza. Su papá está en el hospital.", voice: "Corto, sin lástima, se sale si el chat se vuelve confesionario." },
  angela: { name: "Ángela", age: 21, bio: "Traduce al grupo y se cansa de ser útil.", voice: "Ordena el miedo. Llama a la gente por su nombre." },
  sofia: { name: "Sofía", age: 20, bio: "Archiva el antes de las cosas. La cadena suelta es su foto.", voice: "Describe lo que vio. No adorna." },
  lucia: { name: "Lucía", age: 22, bio: "Llega tarde del simulacro. No deja que Antonio hable por ella.", voice: "Entra y sale. Reclama su propia versión." },
  antonio: { name: "Antonio", age: 23, bio: "Se anticipa al juicio. Protege un secreto que no es del grupo.", voice: "Prólogos. Se corrige si le piden solo el hecho." },
  valeria: { name: "Valeria", age: 22, bio: "Anota horas. No se une a bandos.", voice: "Cronología sin adjetivos." },
  martina: { name: "Martina", age: 19, bio: "Prima de Iván. Pesa las palabras. No es puerta de nadie.", voice: "Pocas frases. Se va si la usan de acceso." },
  ivan: { name: "Iván", age: 23, bio: "El turno no cuadra. Debe, y el orden no es lindo.", voice: "Bromea y después sostiene una hora distinta." },
};

export const portraits: Record<string, string> = {
  mateo: "/portraits/mateo.jpg", diego: "/portraits/diego.jpg", antonio: "/portraits/antonio.jpg",
  angela: "/portraits/angela.jpg", sofia: "/portraits/sofia.jpg", lucia: "/portraits/lucia.jpg",
  valeria: "/portraits/valeria.jpg", martina: "/portraits/martina.jpg", ivan: "/portraits/ivan.jpg",
  group: "/icons/colmena.jpg",
};

export const ROLES: [string, string, string][] = [
  ["ordinario", "Ordinario", "Sin atajo. Observas, preguntas y dependes de la gente."],
  ["tecnico", "Genio informático", "Puedes entrar a cuentas de Winteres. No es magia y deja rastro."],
  ["observador", "Observador", "Ves horas, fotos y contradicciones que otros pasan."],
  ["persuasivo", "Persuasivo", "Abres conversaciones que a otros se les cierran."],
  ["empatico", "Empático", "Lees el cansancio. También puedes equivocarte."],
  ["investigador", "Investigador", "Ordenas testimonios. No adivinas culpables."],
];
