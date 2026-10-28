/** Changes in their lives happen offscreen too. A romance is one strand, not their whole story. */
const arcs:Record<string,[string,string,string]>={
  mateo:[
    'Abrí la caja de mi hermano. Había una libreta sin terminar y un cable que ya no sirve para nada. Esperaba una explicación, como si la hubiera dejado doblada entre las hojas. No la había. Volví a guardar algunas cosas y otras las puse en mi estante. No te escribo para que me digas qué significa.',
    'Hablé con mi mamá de la luz del pasillo. Ella no la deja por el mismo motivo que yo imaginaba: dice que tropieza cuando se levanta. Me dio vergüenza haber construido una historia entera sin preguntarle. Acordamos hablar los domingos. Sin pasar lista el resto de la semana.',
    'Moví el cuarto otra vez y esta vez no busqué permiso en una foto de antes. Sigo preguntando si llegaste; ahora intento no convertir la segunda pregunta en una orden. Me inscribí en un taller de encuadernación. Quiero aprender a guardar cosas sin quedarme viviendo dentro de ellas.',
  ],
  diego:[
    'Pedí un relevo. Mi hermana no podía el martes, podía el jueves. Parece una tontería contarlo, pero yo había decidido que negarse un día era negarse a todo. Fui a clase ese jueves. No me volví menos hijo por estar en otro sitio unas horas.',
    'Mi padre preguntó por el partido antes de que yo preguntara por él. Hablamos diez minutos de algo que no era el hospital. No significa que todo vaya bien; significa que esa conversación también cabe. Dejé de mandar un parte cada vez que alguien me saluda.',
    'Entregué el trabajo atrasado. No quedó brillante y no voy a fingir que fue una lección preciosa sobre superar obstáculos. Lo entregué, pedí los apuntes y puse dos tardes de descanso en el calendario familiar. En casa protestaron por una. La mantuve.',
  ],
  angela:[
    'Devolví la lista del cumpleaños al grupo. Alguien dijo que yo lo hago más rápido. Le contesté que saber hacerlo no es haber aceptado hacerlo. Hubo diez minutos incómodos y después alguien compró el regalo. La incomodidad no acabó con la amistad.',
    'Fui sola a la función. Al salir tuve algo que contar que no empezaba por el problema de otra persona. También perdí un plan porque nadie lo organizó. Me dio rabia; no lo rescaté a última hora. Estoy aprendiendo a no llamar abandono a cada cosa que dejo de sostener.',
    'Me ofrecieron coordinar una actividad del barrio. Dije que sí, pero con tareas y horarios escritos, y otra persona a cargo conmigo. No quiero dejar de cuidar cosas. Quiero poder elegir cuáles. Si vuelvo a hacerlo todo, puedes recordarme lo que estoy diciendo ahora; no hace falta que me vigiles.',
  ],
  sofia:[
    'Imprimí la foto movida. En papel se ve el barrido de luz que en el teléfono parecía un error. La puse encima del escritorio. No la presenté a un concurso ni le busqué una frase triste. Me gusta y la quiero cerca. Estoy probando que eso sea suficiente.',
    'Mostré las fotos de la esquina. Alguien preguntó si el proyecto era sobre una desaparición. Le dije que no; eran las tardes que había ido allí. Me costó no aprovechar una lectura más dramática. Una persona compró una copia de la más sencilla.',
    'Acepté un encargo pagado. Envié una tarifa y una pregunta sobre los permisos antes de llevar la cámara. Algunas fotos no se publicarán porque quienes salen no quieren. El trabajo sigue valiendo. La tarde libre siguiente salí sin cámara y no sentí que tuviera que traer algo a cambio.',
  ],
  lucia:[
    'Pedí el cambio de guardia. Me dijeron que podía haber avisado antes; tenían razón en eso, no en que mi tiempo no importara. Acordamos otra fecha. Dormí una noche entera y al día siguiente pude estudiar una página sin leerla cinco veces.',
    'En prácticas repetí una tarea que antes había hecho mal. Esta vez salió. No me volvió infalible, pero pude dejar de contar el error como si fuera una presentación de quién soy. También dije que no a otra consulta por mensaje. Querer ayudar no me da una autoridad que todavía no tengo.',
    'Estoy preparando la siguiente rotación. Hice un plan que incluye estudiar, estar con gente y desaparecer del teléfono para dormir. No lo voy a cumplir perfecto. Me importa que quien esté conmigo no lo lea como una competencia por su sitio. Mi vida no tiene que quedarse pequeña para que quepa una relación.',
  ],
  antonio:[
    'Probé lo de decir el hecho primero en casa. No salió una conversación bonita; me interrumpieron igual. Pero no terminé contando una cosa privada para ganar la discusión. Me fui a mi cuarto enfadado y con esa parte todavía mía. Supongo que eso también es una diferencia.',
    'Lucía me paró cuando iba a contestar por ella. Esta vez dije tienes razón y no añadí una explicación de cuatro minutos. Después hablamos de lo que cada uno quería contar. No me toca mandar una captura de esa charla para demostrar que aprendí algo.',
    'Pedí ayuda para aprender a discutir sin vivir cada pregunta como una acusación. No tengo una versión nueva y perfecta de mí. Ayer me volví a adelantar y luego pude reconocerlo. Estoy intentando que la reparación ocurra antes de que la otra persona tenga que tranquilizarme.',
  ],
  valeria:[
    'Dejé dos versiones distintas de una hora en el cuaderno y al lado puse quién recordaba cada una. No elegí la más conveniente. Tardé una tarde en dejar de sentir que el hueco era un fallo mío. Hay cosas que no se aclaran porque yo las ordene mejor.',
    'Me disculpé con Martina por corregirla delante de todos. No repetí el dato ni expliqué lo útil que era mi intención. Dijo gracias y seguimos con otra cosa. Me preparé para una conversación enorme y resultó que la parte importante cabía en dos frases.',
    'Empecé un cuaderno que no es una cronología. Hay una escena, una receta mal copiada y una página en blanco que dejé sin corregir. Sigo llevando el otro cuaderno. No quiero perder la precisión; quiero que deje de ser la única manera que tengo de estar con alguien.',
  ],
  martina:[
    'Enseñé el dibujo a una amiga. No dijo que tuviera que dedicarme a esto ni que fuera increíble. Se quedó mirando y me preguntó por una ventana que había dibujado torcida. Me gustó que estuviera ahí conmigo sin decidir lo que debía hacer después.',
    'Dije que no podía hacer el encargo de casa antes del examen. Se enfadaron. Estuve toda la tarde esperando que alguien dijera que podía olvidarlo; no pasó. Aun así fui al examen. No te escribo para que me rescates de la comida de mañana. Quería poder contarlo sin retirar el no.',
    'Me apunté a un curso de dibujo y empecé a ahorrar para compartir piso más adelante. Todavía no puedo irme y no voy a fingir que quererlo paga una renta. Pero ya hay una fecha para revisar el dinero con una amiga. Iván sabe que este plan es mío y que no necesita venir a explicarlo por mí.',
  ],
  ivan:[
    'Mandé la hora correcta antes de que me la volvieran a preguntar. No me felicitaron; se enfadaron porque antes había dicho otra. Era esperable. Aguanté la conversación sin decir que por una vez que hago algo bien. Corregir no borra lo anterior.',
    'Hice un acuerdo de pago que sí puedo cumplir. Más pequeño de lo que quería prometer, bastante más real. También le dije a Martina que no respondiera a nadie por mí. No me toca pedirle que me haga parecer responsable mientras intento aprender a serlo.',
    'Llevo varios turnos anotados y los pagos que pude hacer tienen su fecha. Todavía debo. En el mercado me ofrecieron cambiar a un horario más estable; no lo acepté hasta comprobar que no dejaba otro compromiso tirado. El perro sigue durmiendo en la puerta. Por suerte, no necesita simbolizar mi crecimiento.',
  ],
};
export function personalMilestone(id:string,completed:number,trust:number) {
  const index=[6,12,18].indexOf(completed);if(index<0||!arcs[id])return null;
  const text=arcs[id][index];
  return trust<0?`${text} Quería dejar claro que esto sigue pasando en mi vida aunque ahora prefiera guardar distancia contigo. No te lo cuento para que arregles nuestra conversación anterior.`:text;
}
