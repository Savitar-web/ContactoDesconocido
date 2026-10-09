export type Side = { text: string; reply: string; who?: string; fx?: { trust?: number; close?: number; tension?: number }; leave?: boolean; memory?: string };

type Ctx = { chapter: number; said?: string };

export const GREETINGS: Record<string, Side[]> = {
  mateo: [
    { text: "Hola, Mateo. Vi tu mensaje y preferí escribirte yo, sin el grupo de por medio.", reply: "Hola. Me alegra que no te haya molestado el número. No suelo escribirle a desconocidos. Si hoy solo quieres saber dónde está la tienda, también sirve." },
    { text: "Hola. Todavía no ubico ni el portón de servicio. ¿El de la cadena suelta es ese?", reply: "Ese. Sofía lo fotografió, pero no hace falta que la conozcas para cerrarlo. Si quieres, mañana te enseño el atajo y nada más." },
    { text: "Hola. No prometo ser la mejor compañía de la colonia.", reply: "No te pido eso. Me basta con que contestes cuando puedas. Yo pregunto de más desde que mi hermano se fue de casa. Es un defecto, no un cargo." },
    { text: "Hola. Si esto era una bienvenida con agenda, dímelo ahora.", reply: "No hay agenda. Vi las cajas y me acordé de llegar solo. Si te sobra, lo dices y borro el chat. No colecciono gente." },
  ],
  diego: [
    { text: "Hola, Diego. Mateo me pasó el grupo. Preferí presentarme yo.", reply: "Hola. Mateo llega diez minutos antes y se preocupa si no contestas un «ya voy». No es control. Una vez alguien se quedó dormido en el camión." },
    { text: "Hola. No necesito el manual de Mateo. Solo quería saludar.", reply: "Mejor. El manual lo hace él. Yo me siento cuando hay que sentarse. En el hospital de mi viejo, Mateo se quedó en la sala sin pedir nada." },
    { text: "Hola. Si cancelas, avísame antes de las ocho. Apunté tu regla.", reply: "Bien. Esa regla existe porque tres personas dijeron «ya voy» y no fueron. No es un discurso. Es cansancio." },
    { text: "Hola. Puedo no hablar del caso, si algún día lo hay.", reply: "Ojalá no lo haya. Si lo hay, no me pidas que lo suavice. Yo no suavizo." },
  ],
  angela: [
    { text: "Hola, Ángela. No te escribo para que traduzcas al grupo.", reply: "Hola. Entonces ya empezamos mejor que la mayoría. Hoy no quiero ser útil. Si vienes a hablar, habla. Si vienes a que ordene un silencio, hoy no." },
    { text: "Hola. En el grupo dijiste que se puede decir que no. Lo estoy usando.", reply: "Úsalo. Me canso de ser la que convierte el caos en frases amables. Un no dicho a tiempo me ahorra una noche." },
    { text: "Hola. No tienes que contarme el día entero.", reply: "Tampoco tú. Estoy en la ventana. El pasillo del edificio huele a detergente. Eso es todo lo que tengo ahora." },
    { text: "Hola. Si un día no contestas, no lo voy a leer como castigo.", reply: "Gracias. A veces se me acaban las palabras útiles y la gente lo toma personal. No lo es." },
  ],
  sofia: [
    { text: "Hola, Sofía. No vengo a pedirte una foto.", reply: "Hola. Entonces puedes quedarte. La cámara la uso para no tener que estar del todo. Si sales en una, te pregunto antes." },
    { text: "Hola. El portón de servicio sigue con la cadena suelta, ¿verdad?", reply: "A las 19:12 sí. No es arte. Es el antes. Si mañana está cerrada, también lo guardo. Me gusta el antes de las cosas." },
    { text: "Hola. Puedes no explicarme el grupo.", reply: "Mejor. Diego cancela feo, Ángela traduce, Mateo cuida de más. El resto lo vas a oír. No necesitas mi ficha." },
    { text: "Hola. Si quieres silencio, también está bien.", reply: "Silencio pedido no es castigo. Me quedo un rato y no lleno el hueco con una imagen." },
  ],
  lucia: [
    { text: "Hola, Lucía. Te escribo a ti, no a través de Antonio.", reply: "Hola. Eso ya es raro, y me sirve. Antonio a veces habla por mí en el grupo. No somos lo mismo. Si quieres saber de mí, pregunta aquí." },
    { text: "Hola. No hace falta el tono de parte médico.", reply: "Se me pega del simulacro. En casa también me piden listas. Si bajo la formalidad se me nota el cansancio. Hoy dormí tres horas." },
    { text: "Hola. No voy a meterme en historias viejas.", reply: "Mejor. Lo de antes, si existe, lo cuento yo el día que yo elija. No cuando el grupo tenga hambre de chisme." },
    { text: "Hola. Si llegas tarde, no me debes una historia.", reply: "Apuntado. Salgo de la clínica y el chat ya fue tres temas adelante. Contestaré cuando pueda, no cuando el grupo empuje." },
  ],
  antonio: [
    { text: "Hola, Antonio. No vine a pedirte la versión oficial.", reply: "Hola. Entonces estamos raros. La oficial está escrita para que nadie me agarre. La otra es que me da miedo quedar en ridículo. No la cites." },
    { text: "Hola. No voy a competir por el grupo.", reply: "Mejor. Diego colecciona lealtades y yo, sin querer, aliados. Las dos cosas pesan. Si solo saludas, saluda." },
    { text: "Hola. Un consejo no pedido: no hables por Lucía.", reply: "Lo hago cuando me anticipo al juicio. En casa el que se explica tarde ya perdió. No es excusa. Si ella te escribe, créela a ella." },
    { text: "Hola. Puedes decir que no sabes.", reply: "No sé qué va a pasar si una cosa privada se vuelve chisme. Ahí. Lo dije. No lo lleves a La Colmena." },
  ],
  valeria: [
    { text: "Hola, Valeria. No me uno a un bando.", reply: "Hola. Bien. Antonio colecciona aliados y Diego, lealtades. Yo anoto horas. Si no traes bando, puedes quedarte." },
    { text: "Hola. No todo dato es una pieza.", reply: "De acuerdo. A veces anoto para no sentir. Si te trato como archivo, páralo. No es personal. Es el vicio." },
    { text: "Hola. Martina casi no escribe. No la voy a usar.", reply: "Eso, aquí, ya es un dato y también una decisión. Me gusta más la segunda. No conviertas su silencio en sospecha." },
    { text: "Hola. Puedes equivocarte de hora y lo digo sin tribunal.", reply: "Puedo. Y lo odio. Si me corriges con una prueba, te escucho. Si es una corazonada, también, pero te lo voy a decir." },
  ],
  martina: [
    { text: "Hola, Martina. No te escribo para llegar a otra persona.", reply: "Hola. Eso se agradece en una frase. La mayoría abre con otra cosa y termina pidiéndome que convenza a alguien." },
    { text: "Hola. Puedes tardar. No lo leo como rechazo.", reply: "Tardo porque peso las palabras. En mi casa una frase de más se queda en la mesa toda la semana." },
    { text: "Hola. No me debes una ficha.", reply: "Mejor. Existir en el chat cansa. Si un día hablo, es porque yo decidí." },
    { text: "Hola. Si la casa pesa, no hace falta el informe.", reply: "Pesa, algunos días. No quiero consejo. Quería que alguien lo supiera sin convertirlo en asamblea." },
  ],
  ivan: [
    { text: "Hola, Iván. No vine a cobrarte una explicación.", reply: "Hola. Raro. La gente cobra. Si es charla, charla. El turno me deja la cabeza en otra parte y contesto mal." },
    { text: "Hola. Martina no es tu puerta. No voy a tocar ahí.", reply: "Lo sé, y aun así tocan. Si tú no lo haces, ya vas distinto. No te voy a dar un premio." },
    { text: "Hola. El humor se te apaga cuando preguntan la hora. No pregunto la hora.", reply: "Entonces podemos hablar del perro que duerme en la entrada del mercado. Se ve más dueño del sitio que yo." },
    { text: "Hola. Si hoy no puedes, lo dejas.", reply: "Hoy puedo poco. Debo, pago, y el orden no es lindo. Si esperas, a veces digo la verdad a medias." },
  ],
};

export function liveReplies(id: string, ctx: Ctx): Side[] {
  const late = ctx.chapter >= 5;
  const said = ctx.said ? `Lo que dijiste en La Colmena se me quedó: «${ctx.said.slice(0, 80)}».` : "";
  const pools: Record<string, Side[]> = {
    mateo: late ? [
      { text: "No te escribo para que seas el desaparecido profesional. Quiero saber si comiste.", reply: `${said} Comí poco. Moretones, no película. No quiero que el grupo gire alrededor del susto.`.trim(), fx: { close: 1 } },
      { text: "Si un día no contesto, no es que te haya dejado.", reply: "Lo anoto. Escribiré una vez. Una. Después espero. No voy a llenarte de «¿estás bien?».", fx: { trust: 1 } },
      { text: "Tu cuidado a veces pesa. Lo digo sin ataque.", reply: "Desde que mi hermano se fue pregunto de más. Si te ahogo, dímelo en el momento.", fx: { tension: 1, trust: 1 } },
      { text: "Mañana, de día, sin sodas. Si quieres.", reply: "Quiero. Con gente en la calle. El atajo sigue ahí. No hace falta escolta.", fx: { close: 2 } },
    ] : [
      { text: "Hoy no necesito que me cuides. Solo quería saber si comiste.", reply: `${said} Comí un sándwich de la papelería. Me gusta que preguntes eso y no si ya resolví el día de todos.`.trim(), fx: { close: 1 } },
      { text: "Cuéntame algo que no sea el grupo.", reply: "Mi mamá deja la luz del pasillo prendida aunque ya no viva nadie que llegue tarde. Apagarla se sentiría como cerrar la puerta.", fx: { close: 2 } },
      { text: "A veces tu forma de ayudar pesa.", reply: "Lo sé. No es un título. Si te sobra, lo dices. No colecciono gente.", fx: { tension: 1 } },
      { text: "El portón lo cierro yo si sigue suelto. No hace falta que lo reportes.", reply: "Gracias. Iba a pasar por sodas y a mirarlo. Diez minutos, dije. Espero que sigan siendo diez.", fx: { trust: 1 } },
    ],
    diego: late ? [
      { text: "No te pido que finjas calma. Te pido que no vayas solo.", reply: `${said} La rabia es justa. El lugar importa más. Si voy solo, pierdo a Mateo y me pierdo yo.`.trim(), fx: { trust: 1 } },
      { text: "Podemos no hablar del caso un minuto.", reply: "Vi un camión igual al de mi viejo y me quedé parado. Ya. Eso era. El hospital me dejó sin paciencia para los silencios.", fx: { close: 1 } },
      { text: "Si te uso de mensajero, dímelo.", reply: "Te lo voy a decir, y feo. No suavizo. Si quieres suave, no soy yo.", fx: { tension: 1 } },
      { text: "Tu límite con Iván es claro. No te pido café.", reply: "Bien. Contigo sigo si no me pides que olvide la llamada. Con él, no.", fx: { trust: 1 }, leave: false },
    ] : [
      { text: "No hace falta que seas brusco para que te crea.", reply: "La brusquedad me sale cuando tengo miedo de sonar blando. En la sala del hospital aprendí que la gente dulce a veces se va.", fx: { close: 1 } },
      { text: "¿Cómo está tu papá? Sin parte médico.", reply: "Estable. Odio esa palabra. Significa que no se muere hoy. Si quieres otra cosa, pregunta otra cosa.", fx: { close: 1 } },
      { text: "Mateo se preocupa de más. No lo voy a reforzar.", reply: `${said} Él se sienta. Yo también, cuando toca. No hace falta que lo cuidemos los dos a la vez.`.trim(), fx: { trust: 1 } },
      { text: "Si esto se vuelve confesionario, te sales. Lo recuerdo.", reply: "Y me salgo. No es castigo. Es que no doy mi vida para ganarme la estancia.", fx: { tension: 1 } },
    ],
    angela: [
      { text: "Hoy no te pido que traduzcas a nadie.", reply: `${said} Gracias. El mío se quedó al final de la lista, como siempre.`.trim(), fx: { close: 2 } },
      { text: "Puedes estar cansada sin explicarlo.", reply: "Estoy cansada. No de ti. De ser a quien le escriben cuando el grupo se traba.", fx: { close: 1 } },
      { text: "¿Hay algo que quieras y no sea útil?", reply: "Un café que no sea cita ni reunión. Me da vergüenza pedirlo. Si vienes, vienes. Si no, el grupo sobrevive.", fx: { close: 2 } },
      { text: "Si me equivoco contigo, corrígeme sin sonrisa de mantenimiento.", reply: "Te corrijo. No voy a suavizarlo para que duela menos. Eso también es respeto.", fx: { trust: 1 } },
    ],
    sofia: [
      { text: "No todo tiene que quedar en foto.", reply: "A veces disparo para no tener que estar. Hoy no te fotografío. El cielo sucio de luz me basta.", fx: { trust: 1 } },
      { text: "Enséñame algo que no sea evidencia.", reply: `${said} Un cielo a las siete. No prueba un horario ni una mentira. Por eso me gusta.`.trim(), fx: { close: 1 } },
      { text: "Tu ironía a veces esconde que te importa.", reply: "A veces es ironía y ya. Otras, sí. No te voy a dar el manual.", fx: { tension: 1, close: 1 } },
      { text: "Si el grupo pide juicio, no publiques.", reply: "No publico. Archivo. Si alguien me pide que borre, archivo peor. Te aviso para que no me lo pidas.", fx: { trust: 1 } },
    ],
    lucia: [
      { text: "Antonio no habla por ti. Te pregunto a ti.", reply: `${said} Entonces pregunta. Lo nuestro, si existe, lo cuento yo. No cuando el grupo tenga hambre.`.trim(), fx: { trust: 2 } },
      { text: "No tienes que sonar a parte médico.", reply: "Se me pega. Si bajo la formalidad se me sale que estoy agotada. Ahí está. Tres horas de sueño.", fx: { close: 1 } },
      { text: "Puedes no saber qué quieres.", reply: "Eso alivia más que un consejo. Hoy no sé si quiero que se sepa o que se guarde. Las dos me dan miedo.", fx: { close: 2 } },
      { text: "Si te humillan con el secreto, no vuelvas a escribirme. Lo entiendo.", reply: "Si lo usas para las horas, úsalo. Si lo usas para sacarnos, me voy del chat y de la conversación.", fx: { tension: 1 } },
    ],
    antonio: [
      { text: "No vine a ganarte una discusión.", reply: "Entonces dilo sin prólogo. Yo también puedo bajar el tono. Me anticipo al juicio porque en casa el que se explica tarde ya perdió.", fx: { trust: 1 } },
      { text: "Tu orgullo se nota antes que tu argumento.", reply: `${said} Cierto. No es una teoría. Es de dónde salgo. Si quieres el argumento, espera a que baje la cara.`.trim(), fx: { tension: 1, close: 1 } },
      { text: "Puedes decir que no sabes, y no lo llevo al grupo.", reply: "No sé qué va a pasar con Lucía si esto se vuelve chisme. Ahí. No lo cites.", fx: { trust: 2 } },
      { text: "Si el grupo te exige coartada pública, puedes irte.", reply: "Me voy antes de quemar una cosa que no es de ustedes. No es huida del caso. Es límite.", fx: { tension: 2 }, leave: true },
    ],
    valeria: [
      { text: "No todo dato es una pieza.", reply: "A veces anoto para no sentir. Si te trato como archivo, páralo.", fx: { trust: 1 } },
      { text: "Cuéntame algo que no cuadre y no importe.", reply: `${said} Me gusta el archivo de la uni a las diez, cuando ya no hay nota que cerrar. No demuestra nada.`.trim(), fx: { close: 1 } },
      { text: "No te unas a mi bando. No tengo.", reply: "Bien. Si algún día te pido lealtad, desconfía. No es mi estilo.", fx: { trust: 1 } },
      { text: "Puedes equivocarte de hora.", reply: "Puedo. Si me corriges con prueba, te escucho. Si es corazonada, también, y te lo digo.", fx: { tension: 1 } },
    ],
    martina: [
      { text: "No te escribo para llegar a Iván.", reply: "Eso se agradece. La mayoría termina pidiéndome que lo convenza.", fx: { trust: 2 } },
      { text: "Puedes tardar. No lo leo como rechazo.", reply: `${said} Tardo porque peso las palabras. En la mesa de mi casa una frase se queda toda la semana.`.trim(), fx: { close: 1 } },
      { text: "Si la casa pesa, no hace falta el informe.", reply: "Hoy no me hablaron en el desayuno. No quiero consejo. Quería que alguien lo supiera sin asamblea.", fx: { close: 2 } },
      { text: "Si el grupo te usa, puedes salirte.", reply: "Me salgo. No es drama. Es que existir ahí para servir de puerta me rompe.", fx: { tension: 1 }, leave: true },
    ],
    ivan: late ? [
      { text: "No vine a cobrarte el relato completo. Vine a oír la hora.", reply: `${said} La hora me delata. El turno no era el turno. No voy a decorarlo.`.trim(), fx: { tension: 1 } },
      { text: "Deja a Martina fuera de esto.", reply: "Debí dejarla fuera antes. La gente toca esa puerta. Si tú no, ya es distinto.", fx: { trust: 1 } },
      { text: "Puedes hablar de otra cosa.", reply: "El perro del mercado sigue ahí. Se ve más dueño que yo. No tiene moraleja.", fx: { close: 1 } },
      { text: "Si el grupo te lincha, no te pido que te quedes.", reply: "Me salgo antes de que conviertan la llamada en sentencia. Después hagan lo que tengan que hacer. Primero él.", fx: { tension: 2 }, leave: true },
    ] : [
      { text: "No vine a cobrarte una explicación.", reply: "Si es charla, charla. El turno me deja la cabeza en otra parte.", fx: { trust: 1 } },
      { text: "Martina no es tu puerta.", reply: `${said} Lo sé. Si no tocas ahí, ya vas distinto.`.trim(), fx: { trust: 1 } },
      { text: "Podemos no hablar de la calle.", reply: "Vi un perro dormido en el mercado. Eso. Sin moraleja.", fx: { close: 1 } },
      { text: "Si el rumor es falso, desmiéntelo tú. No yo.", reply: "El rumor se me queda en la cara de Mateo y alguien lo lee. No lo conviertas tú en expediente.", fx: { tension: 1 } },
    ],
    group: [
      { text: "Hoy no hace falta que todos opinen. Con estar basta.", reply: "Con estar basta. Si alguien no quiere hablar, que no hable.", who: "angela", fx: { close: 1 }, memory: "Hoy no hace falta que todos opinen." },
      { text: "Si cancelan, que cancelen antes. Sin teoría.", reply: "Antes de las ocho. Después ya no es aviso, es hueco.", who: "diego", memory: "Si cancelan, que cancelen antes." },
      { text: "No convirtamos un recado en juicio.", reply: "El cielo está sucio de luz. Eso iba a decir. Nada más.", who: "sofia", memory: "No convirtamos un recado en juicio." },
      { text: "Quien necesite salirse, que se salga. Se puede volver.", reply: "Yo me salgo un rato. No es drama. El turno no pide permiso.", who: "ivan", leave: true, memory: "Quien necesite salirse, que se salga." },
    ],
  };
  return pools[id] || [];
}
