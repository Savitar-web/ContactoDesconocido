import { cast } from '../content/characters/cast';
import type { Side } from '../content/dialogue/sideThreads';
export type Bond = { status: 'friends' | 'dating' | 'partners' | 'apart'; agreement: 'none' | 'exclusive' | 'open'; dates: number; flags: string[]; cooldown: number; pregnancy?: 'waiting' | 'confirmed' | 'continuing' | 'interrupted' | 'undecided'; gestation?: 'player' | 'partner' };
export type WorldEvent = { id: string; who: string; due: number; text: string; kind: 'message' | 'betrayal' | 'pregnancy' | 'aftercare' | 'date-expired'; target?: string };
export type World = { turn: number; day: number; lastPlotTick: number; missed: string[]; bonds: Record<string, Bond>; events: WorldEvent[]; journal: { day: number; who: string; text: string }[]; adult: boolean; pregnancy: boolean; infidelity: boolean };
export type SocialChoice = { id: string; text: string; reply: string; effect: string; locked?: string };
export function createWorld(): World { return { turn: 0, day: 0, lastPlotTick: 0, missed: [], bonds: {}, events: [], journal: [], adult: false, pregnancy: false, infidelity: false }; }
export function getBond(world: World, id: string): Bond { return world.bonds[id] || { status: 'friends', agreement: 'none', dates: 0, flags: [], cooldown: 0 }; }
const dates: Record<string, [string, string, string]> = {
  mateo: ['una merienda en la terraza', 'Preparé dos tazas. Esta vez pregunté antes de preparar el sitio para ti.', 'Quiero estar contigo sin convertir el cuidado en una manera de retenerte.'],
  diego: ['caminar por el parque después de la visita', 'Puedo una hora. Quiero verte, no rendir un examen de cómo estoy.', 'Me importas. Si soy seco, puedes decírmelo. No te toca traducirme toda la vida.'],
  angela: ['un café en un sitio que elijas tú', 'Hoy no organicé nada. Al principio me puso nerviosa; después pude mirarte de verdad.', 'Quiero una pareja, no otra responsabilidad. Me gusta que podamos repartir hasta las cosas pequeñas.'],
  sofia: ['ver una exposición sin sacar fotografías', 'La cámara se quedó en casa. Me acordaré de la tarde por lo que hablamos.', 'Quiero que tengamos algo que no necesite estar publicado para existir.'],
  lucia: ['cenar temprano antes de una mañana libre', 'Dormí antes de venir. Esta cita es una elección, no otra tarea entre dos turnos.', 'Me gustas. Mi tiempo y mi voz siguen siendo míos cuando estoy contigo.'],
  antonio: ['pasear por la plaza sin preparar un discurso', 'Llegué con tres frases ensayadas y al verte olvidé las tres. Mejor así.', 'Quiero intentarlo contigo sin pedirte que adivines lo que no digo.'],
  valeria: ['buscar un libro y merendar después', 'Apunté la hora por costumbre. Después cerré el cuaderno y dejamos de seguir el plan.', 'No puedo demostrar que esto vaya a salir bien. Sí puedo elegir cuidarlo contigo.'],
  martina: ['ir a una librería que no conoce el grupo', 'Esta vez elegí el lugar yo. Gracias por no preguntar si a mi primo también le gustaría.', 'Quiero intentarlo porque quiero yo. No por llevarle la contraria a nadie.'],
  ivan: ['comer algo junto al mercado', 'Elegimos un sitio que puedo pagar. Pude dejar de hacer bromas sobre la carta y escucharte.', 'Me gustas. No voy a usar el humor para dejarte todas las conversaciones difíciles.'],
};
const boundaries: Record<string, string> = {
  mateo: 'No me pidas un sí solo para que no te sientas rechazado. Necesito estar seguro de que quiero.', diego: 'Hoy no. Te lo digo sin rodeos porque te respeto.', angela: 'Si para gustarte tengo que estar disponible siempre, no quiero ese trato.', sofia: 'La cercanía no te da derecho a publicar lo que te cuento.', lucia: 'Si digo que paremos, paramos. También cuando ya hayamos empezado a acercarnos.', antonio: 'No quiero esconder una relación dentro de otra explicación.', valeria: 'Podemos volver a hablarlo. Eso no convierte mi respuesta de hoy en un sí provisional.', martina: 'No me convenzas de algo que acabo de decir que no quiero.', ivan: 'No quiero prometer por miedo a que te vayas. Sería volver a hacer lo mismo.',
};
export function socialChoices(world: World, id: string, trust: number, completed: number, crisis: boolean): SocialChoice[] {
  if (!cast[id]) return [];
  const b = getBond(world, id); const [date, , commitment] = dates[id];
  const choices: SocialChoice[] = [];
  const gate = crisis ? 'Ahora hay una desaparición en curso. Podemos hablar, pero no concertar una cita.' : b.cooldown > world.day ? 'Pidió espacio. Deja pasar unos días antes de retomar este tema.' : '';
  const deepen = b.flags.includes('coerced') ? 'Después de la presión sobre su decisión reproductiva, no quiere retomar la relación.' : completed < 2 || trust < 10 ? 'Conoce primero su historia: al menos dos encuentros y confianza suficiente.' : gate;
  if (b.status === 'friends' || b.status === 'apart') choices.push({ id: 'interest', text: 'Me atraes. ¿Te gustaría que exploráramos algo más, sin obligación?', reply: `${commitment} Podemos tener una cita, sin dar por hecho todo lo demás.`, effect: 'interest', locked: deepen });
  if (['dating', 'partners'].includes(b.status)) {
    if (['lucia', 'antonio'].includes(id) && !b.flags.includes('past-cleared')) choices.push({ id: 'past', text: 'Antes de avanzar, quiero que lo que haya con otra persona esté aclarado por ustedes.', reply: id === 'lucia' ? 'Lo que había con Antonio no estaba definido. Hablé con él: no voy a empezar contigo mientras él crea otra cosa. Tampoco voy a enseñarte esa conversación como comprobante.' : 'Lo hablé con Lucía sin hablar por ella. Lo que intentamos no seguía siendo una pareja. No quiero empezar algo contigo dejando a nadie dentro de una mentira.', effect: 'past', locked: gate });
    const prior = ['lucia', 'antonio'].includes(id) && !b.flags.includes('past-cleared') ? 'Primero deben aclarar el vínculo previo con la otra persona.' : '';
    if (!b.flags.includes('date-pending') && !b.flags.includes('date-ready')) choices.push({ id: 'date', text: `¿Te gustaría ${date}?`, reply: `Sí. ${date.charAt(0).toUpperCase() + date.slice(1)}. Dejemos claro que podemos cambiar el plan si avisamos; te escribiré cuando llegue el día.`, effect: 'date', locked: prior || gate });
    if (b.dates > 0 && b.status === 'dating') choices.push({ id: 'partner', text: 'Quiero que seamos pareja. ¿Tú también quieres?', reply: commitment, effect: 'partner', locked: prior || (completed < 4 || trust < 22 ? 'Necesitan más historia compartida: cuatro encuentros y una confianza mayor.' : gate) });
    if (b.status === 'partners') {
      const others = Object.entries(world.bonds).filter(([other, bond]) => other !== id && bond.status === 'partners');
      if (b.agreement !== 'exclusive') choices.push({ id: 'exclusive', text: 'Quiero acordar exclusividad contigo, sin dejar otros vínculos sin aclarar.', reply: 'Sí, si lo elegimos los dos y no hay otra persona creyendo que sigue en una relación contigo. Si eso cambia, lo hablamos antes.', effect: 'exclusive', locked: others.length ? 'Aclara o termina primero las otras relaciones que siguen abiertas.' : gate });
      if (b.agreement !== 'open') choices.push({ id: 'open', text: 'Quiero proponer una relación abierta. Si no te sirve, no quiero empujarte.', reply: 'Puedo explorar ese acuerdo, con información antes de que ocurra algo y sin usarlo para esconder a nadie. Mis límites también pueden cambiar; si dejan de encajar, hablamos o terminamos.', effect: 'open', locked: gate });
    }
    if (b.status === 'partners' && !b.flags.includes('intimate')) choices.push({ id: 'intimate', text: '¿Quieres compartir una noche íntima? Podemos parar o cambiar de idea.', reply: 'Quiero, y me gusta que podamos decir que no sin tener que defenderlo. Hablamos de límites y cuidado en privado. La noche queda entre nosotros. [Fundido a negro.]', effect: 'intimate', locked: !world.adult ? 'Activa los temas adultos en Límites de historia si quieres explorar esta ruta.' : gate });
    if (world.adult && world.pregnancy && b.flags.includes('intimate') && !b.pregnancy) {
      choices.push({ id: 'pregnancy-player', text: 'Abrir un arco de embarazo no planificado en el que mi personaje pueda gestar.', reply: 'Esta rama establece que tu personaje puede gestar, independientemente de su identidad. La posibilidad queda abierta para las próximas semanas; no hay todavía un resultado ni una decisión tomada por ti.', effect: 'pregnancy-player', locked: gate });
      choices.push({ id: 'pregnancy-partner', text: 'Abrir un arco de embarazo no planificado en el que esta pareja pueda gestar.', reply: 'Esta rama establece que tu pareja puede gestar, independientemente de su identidad. La posibilidad queda abierta para las próximas semanas. Si se confirma un embarazo, la decisión sobre su cuerpo será suya.', effect: 'pregnancy-partner', locked: gate });
    }
    choices.push({ id: 'end', text: 'Quiero terminar esta relación con claridad, aunque nos duela.', reply: `${boundaries[id]} Si quieres terminar, no voy a convertir el cariño en una obligación. Necesitaré distancia antes de saber si podemos ser amigos.`, effect: 'end' });
  }
  const exclusive = Object.entries(world.bonds).filter(([other, bond]) => other !== id && bond.status === 'partners' && bond.agreement === 'exclusive');
  if (b.status === 'dating' && exclusive.length) {
    for (const c of choices) if (['date','partner','intimate'].includes(c.effect)) c.locked = 'Prometiste exclusividad a otra persona. Habla con ella y termina o cambia el acuerdo antes de avanzar.';
    if (world.adult && world.infidelity && !b.flags.includes('concealed')) choices.push({ id: 'conceal', text: `Ocultar mi relación con ${cast[exclusive[0][0]].name} y continuar esta cita. Sé que rompe nuestro acuerdo.`, reply: 'La cita ocurre, pero no dijiste que habías prometido exclusividad a otra persona. La omisión queda en la historia; que todavía no se haya hablado no la convierte en un acuerdo.', effect: 'conceal', locked: gate });
  }
  if (b.pregnancy === 'confirmed' || b.pregnancy === 'undecided') {
    if (b.gestation === 'player') choices.unshift(
      { id:'continue', text:'Mi personaje decide continuar el embarazo y quiere hablar de cómo sostenerlo.', reply:'La decisión de continuar no resuelve trabajo, dinero ni miedo. Tu pareja propone hablar de responsabilidades concretas, sin dar por hecho que el vínculo afectivo tiene que continuar a cualquier precio.', effect:'continue' },
      { id:'abort', text:'Mi personaje decide interrumpir el embarazo y buscar acompañamiento profesional.', reply:'Tu decisión es escuchada. El proceso ocurre fuera de escena, con atención profesional. Después puedes pedir compañía, intimidad o una conversación corriente. No tienes que representar una emoción concreta para que tu decisión sea válida.', effect:'abort' },
      { id:'undecided', text:'No sé qué quiero decidir. Necesito espacio y apoyo profesional, sin presión.', reply:'La conversación puede quedar abierta sin que alguien decida por ti. Acuerdas buscar apoyo profesional y volver a hablar de lo que necesitas, sin prometer una respuesta esta noche.', effect:'undecided' });
    else choices.unshift(
      { id:'listen', text:'Quiero saber qué quieres tú y cómo acompañarte, sin decidir por ti.', reply:`${commitment} Quiero hablar con un profesional antes de decidir y necesito que no conviertas mi duda en una promesa. Te contaré mi decisión cuando pueda hablar de ella.`, effect:'listen' },
      { id:'pressure', text:'Decirle que debe continuar el embarazo para demostrar que me quiere.', reply:`No. Mi cuerpo no es una prueba de cariño. ${boundaries[id]} Ahora necesito distancia y apoyo que no dependa de complacerte.`, effect:'pressure' });
  }
  return choices;
}
export function applySocial(world: World, id: string, effect: string): World {
  const next: World = structuredClone(world); const b = { ...getBond(next,id), flags:[...getBond(next,id).flags] }; next.bonds[id] = b;
  const flag = (f: string) => { if (!b.flags.includes(f)) b.flags.push(f); };
  const schedule = (kind: WorldEvent['kind'], days: number, text: string, target?: string) => next.events.push({ id:`${id}:${effect}:${next.turn}`,who:id,due:next.day+days,text,kind,target });
  switch(effect) {
    case 'interest': b.status='dating'; break;
    case 'past': flag('past-cleared'); break;
    case 'date': flag('date-pending'); schedule('message',1,'Llegó el día de la cita. ¿Mantenemos el plan? Puedes confirmar o avisar que no vas.'); schedule('date-expired',3,'Me quedé esperando sin saber si ibas a venir. Si no podías, necesitaba que me avisaras. Ahora prefiero dejar unos días antes de otro plan.'); break;
    case 'attend': b.dates++; b.flags=b.flags.filter(f=>f!=='date-ready'); flag('date-shared'); next.journal.push({day:next.day,who:id,text:`Compartieron ${dates[id][0]}. ${dates[id][1]}`}); schedule('message',2,`${dates[id][1]} No hace falta repetir la misma tarde para que haya otra.`); break;
    case 'cancel-date': b.flags=b.flags.filter(f=>f!=='date-ready'); schedule('message',1,'Gracias por avisar que no ibas a venir. Me habría dolido quedarme esperando; podemos proponer otra fecha.'); break;
    case 'partner': b.status='partners'; break;
    case 'exclusive': b.agreement='exclusive'; break;
    case 'open': b.agreement='open'; break;
    case 'intimate': flag('intimate'); break;
    case 'conceal': { flag('concealed'); const other=Object.entries(next.bonds).find(([key,v])=>key!==id&&v.status==='partners'&&v.agreement==='exclusive'); if(other) { schedule('betrayal',2,`Me enteré de que seguiste viendo a ${cast[id].name} mientras habíamos acordado exclusividad. No es por sentir algo: decidiste ocultarlo. No voy a continuar con ese acuerdo roto.`,other[0]); } break; }
    case 'end': b.status='apart'; b.agreement='none'; b.cooldown=next.day+4; b.flags=b.flags.filter(f=>!['date-pending','date-ready'].includes(f)); next.events=next.events.filter(e=>e.who!==id || !['message','date-expired'].includes(e.kind)); break;
    case 'pregnancy-player': case 'pregnancy-partner': b.gestation=effect==='pregnancy-player'?'player':'partner'; b.pregnancy='waiting'; schedule('pregnancy',14,b.gestation==='player'?'Han pasado unas semanas. Tu personaje tiene un embarazo confirmado. La decisión es suya; el apoyo puede pedirse sin prometer un desenlace.':'Han pasado unas semanas. Tu pareja te cuenta un embarazo confirmado. Necesita que escuches qué quiere hacer, sin sustituir su decisión.'); break;
    case 'continue': b.pregnancy='continuing'; schedule('aftercare',7,'La decisión de continuar empieza a tocar horarios, gastos y apoyos. Sentarse a repartir responsabilidades no borra la incertidumbre, pero impide que todo recaiga en una sola persona.'); break;
    case 'abort': b.pregnancy='interrupted'; schedule('aftercare',3,'Han pasado unos días. Tu pareja pregunta si quieres compañía o espacio. No da por hecho tristeza, alivio ni arrepentimiento: puedes sentir una cosa, varias o no querer hablar.'); break;
    case 'undecided': b.pregnancy='undecided'; break;
    case 'listen': { flag('listened'); const continues=['mateo','angela','valeria','martina'].includes(id); schedule('aftercare',2,continues?'He hablado con apoyo profesional y con personas de confianza. He decidido continuar el embarazo. Quiero saber qué apoyo puedes ofrecer de verdad; no es una petición para que prometas seguir siendo mi pareja.':'He hablado con apoyo profesional. He decidido interrumpir el embarazo. No necesito que lo apruebes para decidir; sí quiero saber si puedes acompañarme respetándolo. La atención y el proceso quedan fuera de escena.'); b.pregnancy=continues?'continuing':'interrupted'; break; }
    case 'pressure': flag('coerced'); b.status='apart'; b.agreement='none'; b.cooldown=next.day+7; break;
  }
  next.journal.push({day:next.day,who:id,text:effect==='abort'?'Decidió interrumpir el embarazo.':effect==='continue'?'Decidió continuar el embarazo.':effect==='pressure'?'La presión reproductiva rompió la relación.':`Vínculo: ${effectLabels[effect] || effect}.`});
  return next;
}
export const effectLabels: Record<string,string> = { interest:'atracción expresada sin obligación',past:'vínculo anterior aclarado',date:'cita propuesta',attend:'cita compartida','cancel-date':'cita cancelada con aviso',partner:'pareja acordada',exclusive:'exclusividad acordada',open:'acuerdo abierto',intimate:'intimidad consentida',conceal:'ocultación de un vínculo',end:'ruptura con claridad','pregnancy-player':'arco reproductivo del protagonista','pregnancy-partner':'arco reproductivo de la pareja',undecided:'decisión abierta',listen:'acompañamiento sin imponer' };
export function tickWorld(world: World, afterCase: boolean, days = 0) {
  const next: World = structuredClone(world); next.turn++;
  if (afterCase) next.day += days || (next.turn % 6 === 0 ? 1 : 0);
  const due = next.events.filter(e=>e.due<=next.day); next.events=next.events.filter(e=>e.due>next.day);
  const deliveries: {who:string;text:string;trust?:number}[]=[];
  for(const e of due) {
    const who=e.target || e.who; const b={...getBond(next,who),flags:[...getBond(next,who).flags]}; next.bonds[who]=b;
    if(e.kind==='betrayal') { b.status='apart'; b.agreement='none'; b.cooldown=next.day+7; b.flags.push('betrayed'); const other={...getBond(next,e.who),flags:[...getBond(next,e.who).flags]}; other.status='apart'; other.agreement='none'; other.cooldown=next.day+7; next.bonds[e.who]=other; deliveries.push({who:e.who,text:'Me enteré de que otra persona creía seguir teniendo una relación exclusiva contigo. No me dejaste elegir con esa información. Necesito distancia.',trust:-15}); }
    if(e.kind==='pregnancy') b.pregnancy='confirmed';
    if(e.kind==='date-expired') { if(!b.flags.includes('date-ready')) continue; b.flags=b.flags.filter(f=>f!=='date-ready'); b.cooldown=next.day+2; }
    if(e.kind==='message' && e.id.includes(':date:')) { b.flags=b.flags.filter(f=>f!=='date-pending'); b.flags.push('date-ready'); }
    deliveries.push({who,text:e.text,trust:e.kind==='date-expired'?-4:e.kind==='betrayal'?-20:0}); next.journal.push({day:next.day,who,text:e.text});
  }
  return {world:next,deliveries};
}
export function dateChoices(world:World,id:string):SocialChoice[] {
  const b=getBond(world,id); if(!b.flags.includes('date-ready')) return [];
  return [ {id:'attend',text:'Confirmar la cita y estar presente.',reply:dates[id][1],effect:'attend'}, {id:'cancel-date',text:'Avisar que no puedo ir, sin dejarle esperando.',reply:'Gracias por avisar. Podemos hablar de otra fecha cuando sea posible.',effect:'cancel-date'} ];
}
export function crisisReplies(id:string):Side[] {
  const answers:Record<string,string> = {
    diego:'Sigo aquí. No me pidas que lo llame tranquilidad. Si sé algo, lo digo en el grupo para que no haya nueve versiones.',
    angela:'Estoy haciendo lo que puedo, pero no voy a coordinar también cómo deberíamos sentirnos. Si tienes un dato, al grupo; si necesitas hablar, aquí.',
    sofia:'Estoy mirando lo que de verdad vi. Una foto puede mostrar una cosa y dejar fuera el resto. No voy a rellenarlo con un nombre.',
    lucia:'Voy entrando cuando puedo. No puedo estar pendiente de nueve privados y del grupo a la vez. No interpretes los minutos sin respuesta.',
    antonio:'Estoy intentando no contestar como si cada pregunta ya fuera una acusación. Si algo no lo sé, prefiero decirlo.',
    valeria:'Separo lo que vimos de lo que suponemos. Las horas pueden corregirse. Lo que todavía no sabemos no es una prueba contra nadie.',
    martina:'Estoy aquí. No quiero que vuelvan a preguntarme por mi primo como si yo pudiera explicar todo lo que hace.',
    ivan:'Estoy leyendo. Si preguntan por mí, que me pregunten a mí. No voy a desaparecer para ahorrarme una conversación difícil.',
  };
  if(!answers[id]) return [];
  return [{text:'Sigo aquí. ¿Quieres decirme cómo estás llevando lo que pasa con Mateo?',reply:answers[id],fx:{trust:0}}, {text:'No voy a reenviar este privado. Si aparece un dato importante, lo llevamos al grupo.',reply:`De acuerdo. ${answers[id]}`,fx:{trust:0}}, {text:'Si necesitas un momento, lo respeto. Puedo volver a mirar La Colmena mientras tanto.',reply:`Gracias por dejarme ese margen. ${answers[id]}`,fx:{trust:0}}, {text:'¿Hay algo nuevo que sepas de primera mano, sin completar los huecos?',reply:`Si tengo algo nuevo lo pondré allí. Por ahora no voy a inventarte una respuesta para que parezca que avanzamos. ${answers[id]}`,fx:{trust:0}}];
}
