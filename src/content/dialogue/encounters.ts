/** Eighteen personal arcs × six decision points × four branches = 432 choices per voice.
 * These are optional relationship stories; they never invent evidence for the main case. */
export type EncounterProgress = { episode: number; stage: number; approach: number; completed: number; turns: number; last?: string; chapters?: Record<number,{stage:number;approach:number}>; completedIds?:number[] };
export type EncounterChoice = { id: string; text: string; reply: string; trust: number; close: number; tension: number; next: EncounterProgress; memory: string; followup?:string };
type Situation = { title: string; opening: string; need: string; action: string };
type Voice = { accept: string; clarify: string; resist: string; repair: string; boundary: string };
const voices: Record<string, Voice> = {
  mateo: { accept: 'Gracias. Casi te mando otro mensaje para explicarme mejor y habría sido peor.', clarify: 'Dame un segundo. A veces cuento todo lo de alrededor para no llegar a lo que me cuesta.', resist: 'Puedo contestarte, pero no quiero que cuidarme se convierta en otro examen.', repair: 'Me salió pedir perdón antes de saber si había hecho algo. Voy a intentar otra cosa.', boundary: 'Si no respondo enseguida, no vengas a buscar una catástrofe en cada silencio.' },
  diego: { accept: 'Eso sí me sirve. Sin discurso.', clarify: 'Te lo digo directo porque ya gasté el día entendiendo a otros.', resist: 'No. Que esté cansado no significa que hayas acertado.', repair: 'Me pasé de seco. El límite sigue; la manera de decirlo la cambio.', boundary: 'No prometo contestar rápido. Prometo decirte cuando pueda.' },
  angela: { accept: 'Qué raro que alguien pregunte qué necesito antes de encargarme algo.', clarify: 'Voy a separar lo que sé de lo que estoy tratando de sostener.', resist: 'Ahí me estás poniendo otra vez a administrar cómo se siente todo el mundo.', repair: 'Puedo bajar el tono sin volver a hacerme cargo de todo.', boundary: 'Puedo acompañar. No voy a organizar la vida de nueve personas.' },
  sofia: { accept: 'Sí. Esta vez me gustaría quedarme dentro del momento.', clarify: 'Eso lo vi. Lo que significa todavía no lo sé.', resist: 'No llenemos el hueco con una versión más bonita. Sigue siendo un hueco.', repair: 'Estaba hablando como si una descripción exacta me quitara la parte que siento.', boundary: 'Lo que te cuento aquí no va al grupo ni se convierte en una captura.' },
  lucia: { accept: 'Gracias por preguntármelo a mí. Parece básico y a veces no pasa.', clarify: 'Voy por partes. La versión que puedo darte es la mía.', resist: 'No necesito que me defiendas decidiendo por mí.', repair: 'Estoy mezclando cansancio con enfado. Déjame separar las dos cosas.', boundary: 'Si me voy a dormir, la conversación puede esperar. No es una indirecta.' },
  antonio: { accept: 'Iba a empezar por justificarme. Mejor me quedo con lo que acabas de decir.', clarify: 'El hecho primero. Después te digo lo que me da vergüenza admitir.', resist: 'Entiendo la pregunta. La conclusión que ya trae dentro, no.', repair: 'Me adelanté a una acusación que todavía no habías hecho. Eso es mío.', boundary: 'Una parte me pertenece. Otra pertenece a alguien que no está en este chat.' },
  valeria: { accept: 'Lo anoto como acuerdo, no como una deuda contigo.', clarify: 'Puedo ordenar los hechos. La intención no la voy a fechar como si fuera un dato.', resist: 'Que una explicación encaje no significa que esté comprobada.', repair: 'Usé la precisión para no reconocer que esto también me importa.', boundary: 'Si algo cambia, lo corregimos. No voy a defender una lista por orgullo.' },
  martina: { accept: 'Vale. Esta frase sí la puedo dejar aquí sin repasarla diez veces.', clarify: 'Tardo porque quiero decir lo que pienso, no lo que conviene en casa.', resist: 'Si después de esto vas a pedirme hablar con mi primo, prefiero parar ahora.', repair: 'No estaba enfadada contigo desde el principio. Me preparé para una petición que conozco demasiado.', boundary: 'Puedo contarte lo mío. No voy a abrirte la puerta de otra persona.' },
  ivan: { accept: 'Te iba a contestar con un chiste. Me lo guardo, por una vez.', clarify: 'La parte fea va sin adorno. No me pidas que parezca buena persona mientras la cuento.', resist: 'Una cosa es hacerme responsable. Otra es dejar que rellenes lo que no sabes.', repair: 'Me escondí detrás de la broma. Sigue siendo mi responsabilidad aunque la diga en serio ahora.', boundary: 'A Martina déjala fuera. Si hay algo que preguntarme, estoy aquí.' },
};

// Each line is an authored, character-specific situation, need and concrete next step.
const dossiers: Record<string, string> = {
  mateo: `Café para dos|Compré dos cafés por costumbre y ahora el segundo se está enfriando.|no convertir una ausencia en una tarea para ti|guardar la otra taza sin inventar una excusa
El pasillo|La bombilla del pasillo volvió a parpadear. Ya escribí tres mensajes y borré dos.|distinguir un ruido de lo que me hace imaginar|pedir que revisen la bombilla de día
La caja cerrada|Encontré una caja de mi hermano detrás de los manteles. No la he abierto.|elegir cuándo mirar sin que alguien me empuje|dejar la caja donde pueda decidir mañana
Demasiados avisos|Te pregunté tres veces si habías llegado. Al releerlo, suena a vigilancia.|cuidar sin convertir tu noche en un informe|preguntar una sola vez y aceptar el silencio
Una silla vacía|En la papelería dejaron una silla libre y no supe dónde sentarme.|estar incómodo sin pedirle a nadie que lo arregle|sentarme donde alcance la luz
La receta|Intenté hacer el arroz como en casa. Me salió una masa para pegar carteles.|reírme de algo sin usarlo para esconder lo demás|cenar lo que hay y probar con menos agua otro día
El audio borrado|Grabé un audio de dos minutos. Todo era disculparme por mandarlo.|poder hablar sin pedir permiso en cada frase|escribir la primera frase y dejar el resto para después
La llave prestada|Me ofrecieron guardar otra llave. Dije que sí antes de pensarlo.|poder ayudar sin quedarme de guardia|devolver la llave con un horario claro
Cumpleaños pequeño|Se acerca mi cumpleaños y no quiero una sorpresa con todo el grupo.|celebrar sin tener que demostrar que estoy bien|proponer una merienda con dos personas
El mapa|Dibujé el camino corto hasta tu calle. Me preocupa haber decidido que lo necesitas.|ofrecer algo sin imponerlo|preguntar si quieres el mapa antes de enviarlo
Una llamada pendiente|Mi madre llamó mientras trabajaba. Ahora siento que llevo horas fallándole.|contestar por ganas y no solamente por culpa|acordar una llamada después de cenar
La foto vieja|Salí sonriendo en una foto de un día que recuerdo fatal.|aceptar que una imagen no cuenta un día entero|conservar la foto sin obligarme a explicarla
Fuera del grupo|Me enteré de un plan por una foto. Lo primero que pensé fue que sobraba.|preguntar sin convertir el miedo en reproche|escribir a quien hizo el plan cuando esté tranquilo
El favor de siempre|Otra vez dije que podía cubrir el cierre. Mañana tengo una cita importante.|mantener un compromiso conmigo|avisar hoy que esta vez no puedo cubrir
El sofá|Dejé el sofá preparado para una visita que nunca confirmé.|dejar de preparar mi casa para posibilidades|recoger las mantas y preguntar antes la próxima vez
Sin buenas noches|Ayer no mandé el mensaje de buenas noches. Me desperté pensando que alguien lo notaría.|soltar un ritual sin sentir que abandono a nadie|dormir con el teléfono lejos una noche
Un trayecto solo|Quiero caminar hasta el mercado sin pedir a nadie que esté pendiente.|recuperar una rutina sin hacer una prueba de valentía|salir de día y volver cuando me apetezca
La mesa nueva|Moví la mesa y por primera vez el cuarto parece mío. Me dio alegría y culpa juntas.|dejar sitio a algo nuevo sin borrar lo anterior|invitarte a ver el cambio sin pedir aprobación`,
  diego: `Sala de espera|Otra vez la máquina del hospital se quedó con mis monedas. Me enfadé más de lo razonable.|estar harto sin que me den una lección|salir cinco minutos antes de volver a la sala
Estable|El médico dijo estable. Todos respiraron y yo quise preguntar durante cuánto.|poder preguntar sin arruinarle el alivio a nadie|apuntar la pregunta para la siguiente visita
El plan cancelado|Cancelé con una frase de mierda. El motivo era real; la frase también fue mía.|reparar sin usar a mi padre como escudo|pedir disculpas por la forma y mantener la cancelación
Turnos de visita|Me apuntaron en otro turno sin preguntarme. Tengo trabajo ese día.|que la familia pregunte antes de repartir mi tiempo|decir qué dos tardes sí puedo cubrir
Comida fría|Tengo una bolsa de comida en la mochila desde mediodía. Ni hambre me queda.|hacer una cosa básica sin que parezca una intervención|calentar algo antes de volver a contestar
La broma inoportuna|Hice una broma en el peor segundo. Nadie se rio, con razón.|asumir una metida de pata sin dar otro espectáculo|decir que estuvo fuera de lugar y parar
Un domingo libre|Hoy no tengo visita ni turno. Estoy sentado esperando una obligación nueva.|descansar sin justificarlo|dejar el domingo sin llenar
El mensaje de Mateo|Mateo pregunta si necesito algo. No sé contestar sin sonar como un portazo.|aceptar una ayuda concreta|pedirle que me guarde pan y no pregunte más hoy
La camiseta|Mi padre quiere su camiseta vieja para una foto. Está en una caja imposible.|hacer algo útil sin volverlo solemne|buscar la camiseta durante media hora y luego parar
El partido|Vi diez minutos del partido y me sentí culpable cuando marcaron.|disfrutar algo que no cambia lo del hospital|terminar de ver el resumen sin castigarlo
La factura|La factura del móvil venció entre tantas cosas. Nadie tiene culpa y estoy furioso.|resolver lo pequeño sin descargarlo en alguien|poner un recordatorio y pagarla mañana
El consejo|Un conocido me dijo que todo pasa por algo. Le contesté bastante mal.|poner un límite sin discutir toda la tarde|decir que esa frase no me ayuda y salir
Pedir relevo|Llevo tres días haciendo el trayecto. Mi hermana podría ir, pero no se lo pedí.|pedir un relevo sin convertirlo en una prueba de cariño|llamar y preguntar qué día puede ir
Volver a clase|Tengo apuntes de dos semanas. Abrirlos se siente como admitir que la vida sigue.|recuperar una parte de mi rutina|leer una página sin prometer una tarde entera
El cumpleaños de otro|Me invitaron a un cumpleaños. Quiero ir y no quiero explicar mi cara.|estar con gente sin dar un parte médico|avisar que iré un rato y quizá me vaya pronto
La discusión|Discutí con Ángela porque me preguntó dos veces. Ella no había causado mi día.|separar el límite del daño que hice|escribirle sin añadir una excusa al final
El banco|Encontré un banco al sol detrás del hospital. No tiene nada especial.|tener un sitio que no sea una sala de espera|sentarme allí sin mirar el reloj diez minutos
Sin respuesta rápida|Vi tu mensaje y lo dejé para luego. No estaba enfadado.|no tener que demostrar amistad con velocidad|decirte que contestaré mañana y cumplirlo`,
  angela: `La lista invisible|Abrí el chat y había cinco preguntas para mí. Nadie preguntó si tenía tiempo.|dejar de ser el centro de reparto|devolver dos encargos a quienes los propusieron
Un café sin acta|Quedé a tomar café y acabé organizando el fin de semana de todos.|tener una conversación sin coordinar nada|proponer una hora sin hacer una encuesta
La mediadora|Me pidieron traducir lo que Diego quiso decir. Diego está en el mismo chat.|no hablar en nombre de otro adulto|pedir que se lo pregunten directamente
Mi versión|Estoy cansada de explicar las dos partes antes de decir la mía.|poder ser parcial cuando algo me duele|decir qué me molestó sin preparar una defensa ajena
La agenda cerrada|Apagué el móvil una hora y volví a tres personas preocupadas.|tener una hora sin justificar mi ausencia|avisar de un horario y después sostenerlo
El cumpleaños ajeno|Se acerca otro cumpleaños y todos dan por hecho que compro el regalo.|compartir el trabajo que nadie ve|pedir una persona para cada tarea
Una nota de voz|Grabé una nota y sonaba como una jefa. Era un favor entre amigos.|pedir algo sin administrar a la gente|volver a escribirlo como una pregunta
La silla del medio|Nos sentamos y me dejaron entre dos que no se hablan.|no ser una frontera humana|cambiarme de silla sin explicar toda la historia
El favor urgente|Me piden corregir un trabajo para esta noche. Yo también entrego mañana.|poner mi entrega en la misma categoría que la suya|ofrecer diez minutos o decir que no
La comida del grupo|Elegí sitio para comer y ahora todos se quejan del precio.|dejar que una decisión sea compartida|mandar el menú y pedir que decidan quienes faltan
El silencio de Sofía|Sofía no respondió y ya estaban pidiéndome que averiguara por qué.|respetar un silencio sin organizar una búsqueda|dejarle un mensaje sin pedir respuesta
Una tarde propia|Compré una entrada para ir sola y casi inventé que tenía una cita.|disfrutar algo sin convertirlo en un secreto|decir que tengo un plan para mí
El comentario amable|Me dijeron que soy la madre del grupo. No sonó a cumplido hoy.|que me quieran sin asignarme un puesto|decir que prefiero ser su amiga
Una equivocación|Me equivoqué de fecha y todos parecían sorprendidos de que pudiera pasarme.|tener margen para fallar|corregir la fecha sin arreglar cada inconveniente
La llamada larga|Una llamada de cinco minutos duró dos horas. No dije que necesitaba irme.|marcar el final antes de agotarme|avisar al principio cuánto tiempo tengo
El cajón|Guardé entradas de planes que organicé y apenas recuerdo haber disfrutado.|estar presente en algo que no controlo|dejar que otro elija la próxima salida
No sé qué decir|Alguien está mal y por primera vez no tengo una frase útil.|acompañar sin producir una solución|preguntar si quiere compañía o espacio
Un acuerdo pequeño|Hoy repartimos las tareas y nadie discutió. Me cuesta no revisarlas después.|confiar en otros aunque lo hagan distinto|terminar mi parte y no supervisar las demás`,
  sofia: `La foto movida|La única foto de la tarde salió movida. Es la que más me gusta.|quedarme con algo imperfecto|imprimirla sin arreglarla
Fuera de cuadro|Sé describir la mesa, la luz y las manos. No recuerdo qué estaba sintiendo yo.|volver a estar en una escena|dejar la cámara en la mochila durante el café
La cadena|Me preguntaron otra vez por la foto del portón. Ya dije todo lo que vi.|poner un límite a una imagen que circula demasiado|guardar el original y no reenviarlo al grupo
La hora exacta|El reloj de mi cámara iba siete minutos tarde. La foto sigue siendo la misma.|corregir un dato sin inventar lo que falta|anotar el desfase junto al archivo
Un retrato prestado|Una amiga puso de perfil una foto que le hice sin preguntarme.|hablar de permiso sin apropiarme de su cara|pedir que acordemos antes qué se publica
La luz del mercado|La luz del mercado estaba preciosa. Me dio vergüenza contarlo con todo lo demás.|notar algo bonito sin sentir que traiciono el día|volver al mercado sin buscar una foto importante
Borrar una toma|Me pidieron borrar una foto que a mí me parecía buena. Ya no me parece suficiente motivo.|respetar un no aunque pierda una imagen|borrarla también de la papelera
El carrete vacío|Salí a caminar y volví sin una sola foto. Antes habría dicho que desperdicié la tarde.|tener recuerdos sin pruebas|contarte una cosa que vi sin mostrarla
Una exposición|Me aceptaron tres fotos. No sé si quiero a todo el grupo en la inauguración.|celebrar sin volverme una atracción|invitar a quien pueda mirar sin hacerme actuar
El pie de foto|Escribí un pie de foto precioso y luego vi que no era verdad.|elegir una descripción menos cómoda|poner el lugar y dejar abierta la interpretación
Mirar de frente|Alguien lloraba y lo primero que hice fue buscar dónde apoyar la cámara.|reconocer un reflejo sin defenderlo|guardar la cámara y preguntar si me quedo
El archivo familiar|Estoy ordenando fotos familiares. Hay personas que nadie quiere nombrar.|no resolver una familia con un álbum|separar las fotos y preguntar otro día
Una imagen privada|Tengo una foto que explica un malentendido, pero expone a otra persona.|no elegir por alguien que no está aquí|pedirle permiso antes de usarla
El encargo|Me ofrecieron fotografiar un evento gratis por visibilidad. Necesito el dinero.|poner precio sin pedir perdón|enviar una tarifa sencilla por escrito
La misma esquina|Fotografié la misma esquina durante una semana. Cambia menos el sitio que mi paciencia.|sostener un proyecto pequeño|volver mañana sin exigirme una revelación
El elogio|Dijeron que mi foto da tristeza. Yo recordaba estar contenta al tomarla.|aceptar otra mirada sin sustituir la mía|contar cómo fue el día sin corregir al espectador
La cámara rota|La cámara no enciende y me quedé sin una manera habitual de estar con gente.|no desaparecer por no tener algo que hacer|ir al encuentro con las manos vacías
Una copia en papel|Imprimí una foto para regalar. Ahora me preocupa que parezca demasiado.|ofrecer algo sin exigir que signifique lo mismo|entregarla diciendo que puede guardarla donde quiera`,
  lucia: `Después del simulacro|Salí del simulacro con los cordones mal atados. Llevaba horas funcionando en automático.|descansar antes de contar lo que pasó|comer algo y acostarme sin abrir otro chat
Mi propia respuesta|Antonio contestó por mí algo que sí sabía. No quiero que vuelva a pasar.|hablar por mí aunque tarde más|decírselo en privado con un ejemplo concreto
El examen|Saqué menos nota de la que esperaba. Ya estoy redactando una defensa que nadie pidió.|poder estar decepcionada un rato|mirar la revisión mañana con la cabeza despejada
Una tarde sin uniforme|Hoy no quiero que me pregunten por prácticas ni por hospitales.|ser alguien fuera de lo que estudio|proponer una película mala y hablar de ella
La guardia cambiada|Me cambiaron la guardia y todos dicen que debo adaptarme. Yo también tenía un plan.|que mi tiempo cuente|preguntar si alguien puede intercambiar conmigo
La respuesta corta|Mandé un vale y lo leyeron como enfado. Estaba subiendo al autobús.|no explicar cada signo del teléfono|aclarar una vez sin disculparme por tener prisa
El secreto compartido|Una cosa que contamos entre dos ya parece un asunto del grupo.|decidir qué parte de mi vida se comparte|acordar con Antonio qué no vamos a publicar
Pedir compañía|Quiero que alguien me acompañe a comprar comida. Me cuesta pedir algo tan pequeño.|recibir compañía sin tener que estar mal|preguntar si te apetece caminar hasta la tienda
El consejo clínico|Un conocido me mandó síntomas por mensaje. Todavía no soy su médica.|ayudar sin fingir una autoridad que no tengo|decirle que consulte a un profesional y no diagnosticar
La llamada de casa|En casa dicen que nunca tengo tiempo. Cuando llamo, hacemos una lista de reproches.|tener contacto sin salir más agotada|proponer una llamada corta para hablar de una sola cosa
Un error pequeño|Confundí un material en prácticas y sigo repasándolo aunque lo corregimos.|aprender sin convertir un error en mi identidad|anotar cómo evitarlo y dejar de reconstruir la escena
El viaje pendiente|Había ahorrado para una escapada. Ahora todos tienen un motivo para que la aplace.|elegir algo que también deseo|revisar las fechas antes de responder a los demás
El rumor|Me dijeron que parezco distante. Quisiera que alguien contara las horas que duermo.|no tener que parecer disponible para ser querida|explicar mi horario sin prometer presencia constante
Una cena simple|Antonio quiere preparar algo especial y yo solo quiero cenar temprano.|que un gesto de cariño escuche lo que pido|decirle que hoy lo especial sería no complicarlo
El mensaje sin enviar|Escribí que no puedo más. Lo borré porque sabía que todos querrían preguntar.|pedir un descanso sin abrir un interrogatorio|mandar que hoy necesito silencio y mañana hablamos
Aprender a parar|Seguí estudiando cuando ya no entendía las frases. Lo llamé disciplina.|reconocer el cansancio antes de romperme|cerrar el libro y poner una hora realista mañana
Mi cumpleaños|No quiero una fiesta sorpresa. Quiero elegir quién viene y cuándo termina.|tener control sobre mi celebración|mandar una invitación con hora de inicio y de salida
Una buena noticia|Hoy hice algo bien y no quiero empezar contándolo como si hubiera tenido suerte.|reconocer mi trabajo sin rebajarlo|decir qué salió bien y dejar la frase ahí`,
  antonio: `Antes de explicar|Me preguntaron dónde estaba y empecé por tres cosas que nadie había preguntado.|dar una respuesta sin ensayar una defensa|decir el hecho en una frase y esperar
Una puerta ajena|Tengo una explicación que afecta a otra persona. No puedo usarla para quedar bien.|cuidar un límite que no me pertenece|decir qué puedo contar y qué no
El mensaje corregido|Reescribí un mensaje seis veces. Cada versión parecía más sospechosa.|hablar sin intentar controlar cómo me leen|enviar una frase cierta aunque no sea perfecta
La comida familiar|En casa una pregunta nunca viene sola. Llegué al chat preparado para discutir.|no cobrarle a otra gente una conversación de casa|avisar que estoy a la defensiva y volver luego
Lucía sabe|Dije que Lucía estaba bien sin preguntárselo. Me pidió que no lo hiciera.|aceptar la corrección sin hacerla consolarme|decir que tiene razón y dejarla responder
El favor enorme|Prometí arreglar algo que no sé arreglar. Me daba vergüenza decirlo.|ser útil sin fingir capacidad|avisar antes de empeorar el problema
Un silencio raro|Dejé de escribir y alguien dijo que ocultaba algo. Me entraron ganas de contar demasiado.|no comprar tranquilidad entregando mi intimidad|responder a lo concreto y no al rumor
El regalo|Compré un regalo caro después de una discusión. Ahora parece que quiero cerrarla con una bolsa.|separar una disculpa de una compra|guardar el regalo y hablar primero
La frase torcida|Dije no es por nada y a continuación solté justo lo que me molestaba.|pedir algo sin esconderlo en un rodeo|nombrar la molestia con un ejemplo
Un día puntual|Llegué antes por una vez y bromeé tanto que nadie pudo simplemente alegrarse.|recibir algo bueno sin desarmarlo|decir gracias y sentarme
La deuda pequeña|Debo dinero de una cena. Lo estoy evitando por vergüenza, no por falta de dinero.|cerrar una deuda sin fabricar una novela|hacer la transferencia con un mensaje breve
La foto compartida|Subí una foto de los dos sin preguntar. La bajé, pero sigo explicando mi intención.|reparar el efecto en vez de defender la intención|preguntar qué permiso necesitamos la próxima vez
El trabajo en grupo|Hice una parte que no me tocaba y luego me enfadé porque nadie lo notó.|pedir reparto antes de acumular resentimiento|decir qué parte haré y cuál queda sin asignar
Mi padre pregunta|Mi padre pregunta por mis planes como si hubiera una respuesta correcta escondida.|elegir una respuesta que sea mía|decir qué estoy considerando sin pedir veredicto
Sin prólogo|Quiero decirte que me alegró verte. Ya llevo un párrafo explicando por qué lo digo.|poder ser claro cuando algo me importa|borrar el prólogo y dejar el afecto
El comentario de Iván|Iván hizo una broma y salté antes de saber si hablaba de mí.|comprobar antes de defenderme|preguntar qué quiso decir sin preparar un juicio
Una tarde lenta|No tengo nada urgente y me he inventado tres cosas para no estar quieto.|descansar sin demostrar utilidad|dejar una hora sin encargos
Cambiar de idea|Dije que sí al plan y ahora prefiero otro. Me parece que cambiar es quedar mal.|cambiar una decisión sin reescribir el pasado|avisar pronto y aceptar que no todos cambien conmigo`,
  valeria: `La hora tachada|Taché una hora y alguien me preguntó cuál de las dos era la mentira.|corregir sin parecer obligada a ser infalible|dejar visible la corrección y su motivo
Archivo nocturno|El archivo de la universidad a las diez está casi vacío. Ahí puedo pensar.|tener un lugar sin convertirlo en pista|volver para leer algo que no tenga relación con nadie
Una columna de más|Hice una lista de lo que cada persona hizo mal. Ni siquiera sé para qué.|dejar de medir a mis amigos como un expediente|cerrar la lista y hablar de un hecho concreto
Fuentes distintas|Dos personas recuerdan distinto la misma tarde. Ninguna está fingiendo necesariamente.|sostener una duda sin elegir bando|anotar ambas versiones con su origen
El mensaje citado|Alguien citó media frase mía y ahora parece que afirmé lo contrario.|recuperar el contexto sin perseguir a todo el grupo|mandar el párrafo completo una sola vez
Lo que no sé|Tengo todos los horarios y no sé cómo está la persona que los dio.|recordar que un dato viene de alguien|preguntar cómo le fue sin añadir otra pregunta al final
El cuaderno mojado|Se mojó el cuaderno. Mi primer pensamiento fue que había perdido el control.|perder una anotación sin perderme con ella|rescatar lo legible y aceptar los huecos
Una fecha personal|Me acuerdo de fechas de entregas y olvidé el cumpleaños de una amiga.|pedir disculpas sin explicar mi sistema|llamar y escuchar cómo le fue
La prueba insuficiente|Una captura encaja demasiado bien. No tiene fecha ni procedencia.|no premiar una historia solo porque ordena todo|buscar la fuente antes de sacar una conclusión
Un elogio raro|Me dijeron que nunca me altero. No saben cuánto esfuerzo gasto para parecerlo.|no confundir calma visible con ausencia de emoción|decir que sí me afectó sin presentar una prueba
El plan sin hoja|Quieren salir sin decidir recorrido. Me cuesta más de lo que quiero admitir.|dejar espacio a algo que no controle|acordar solo la hora de vuelta
La discusión antigua|Guardé una conversación vieja y la releo para recordar por qué tenía razón.|soltar un archivo que ya no me está ayudando|quitarlo de favoritos y decidir luego si lo borro
La corrección pública|Corregí a Martina delante de todos por un detalle que podía esperar.|elegir cuándo la precisión hace daño|pedir disculpas en privado sin repetir el error
Un margen blanco|Dejé una página en blanco porque no sabía qué había sentido ese día.|no llenar un hueco con una explicación inventada|poner solo la fecha y volver cuando quiera
El favor de investigar|Me pidieron comprobar dónde estuvo alguien. No me dieron permiso de esa persona.|no convertir curiosidad en vigilancia|rechazar el encargo sin recopilar nada
La nota alegre|Anoté algo bonito y luego le añadí tres reservas. Me cuesta dejarlo bonito.|dar el mismo espacio a lo que salió bien|guardar la primera versión de la nota
Otra versión de mí|Encontré un plan de hace un año. Ahora no quiero casi nada de aquello.|cambiar sin acusar a mi yo anterior|escribir qué quiero hoy sin tachar el pasado
El cierre pendiente|Una conversación quedó sin conclusión. Estoy buscando una frase que la cierre.|aceptar que algunas cosas quedan abiertas|dejar una pregunta para otro día sin perseguir respuesta`,
  martina: `El desayuno|En casa desayunaron sin hablarme. Nadie dijo nada que yo pueda señalar.|poder contar un ambiente sin tener que probarlo|salir a caminar antes de decidir si lo hablo
La puerta de Iván|Alguien empezó preguntando por mí y terminó pidiendo el número de Iván.|ser persona antes que intermediaria|decir que se lo pida a él directamente
La frase ensayada|Ensayé una frase todo el camino y al llegar dije que todo bien.|tener tiempo para hablar sin que terminen por mí|escribir lo que no pude decir en persona
El favor familiar|Me encargaron algo porque tú eres la que puede. Yo tenía un examen.|que mi tiempo no sea el sobrante de la casa|decir a qué hora sí puedo y qué no haré
Una salida sola|Fui a una librería sola y no avisé a nadie. Ahora siento que escondí algo.|tener una parte del día que no sea informe|contarlo si quiero sin presentarlo como confesión
El mensaje prestado|Me pidieron mandar un mensaje escrito por otro. No quiero ponerle mi nombre.|usar mi voz para cosas que elijo|devolver el texto y explicar que no lo enviaré
La mesa larga|En una comida me preguntaron por mi primo delante de todos.|no responder por las decisiones de Iván|decir que hablen con él y cambiar de tema
Un vestido|Me probé algo que me gusta y pensé antes en los comentarios de casa.|elegir una cosa pequeña por gusto propio|comprarlo si me alcanza y sin pedir una votación
La visita|Vino una amiga y acabé preocupándome por si molestaba en mi propia sala.|sentirme anfitriona sin pedir perdón por existir|ofrecer té y dejar de disculparme por la casa
El dibujo|Llevo un dibujo en la mochila y no se lo enseño a nadie. Me da más miedo que no importe.|compartir algo sin exigir una reacción enorme|enseñárselo a una sola persona
El sí automático|Dije sí a una salida porque todos miraban. No quiero ir.|retirar un sí que di por presión|avisar hoy que prefiero quedarme
Una broma familiar|Hicieron una broma sobre mí y me reí para que terminara. No terminó.|no usar mi risa como permiso|decir que esa broma ya no me hace gracia
El teléfono boca abajo|Puse el teléfono boca abajo durante la cena y preguntaron qué escondía.|tener intimidad sin que parezca una acusación|decir que solo quiero cenar sin mensajes
La amiga ausente|Una amiga dejó de escribirme. No sé si hice algo o si tiene otra vida.|preguntar sin suplicar una explicación|mandar un saludo y dejarle espacio para contestar
El turno de hablar|Cuando iba a contar algo, entró otra persona. Después ya no quise.|recuperar mi lugar sin competir a gritos|pedir que me dejen terminar una frase
La llave|Me dieron una llave nueva y una lista de responsabilidades que no acordamos.|separar confianza de disponibilidad total|preguntar qué esperan y elegir qué acepto
Una tarde buena|Hoy en casa estuvimos bien. Me da miedo decirlo y que deje de ser cierto.|disfrutar una tregua sin prometer que todo cambió|guardar la tarde como fue y no como garantía
Mi nombre primero|Me presentaron como la prima de Iván. Después dijeron mi nombre, como un detalle.|ser presentada por algo que me pertenece|decir mi nombre y contar qué estoy estudiando`,
  ivan: `El perro del mercado|El perro del mercado volvió a dormirse en la entrada. Tiene mejor horario que yo.|hablar de algo que no necesite una defensa|pasar por el mercado sin convertirlo en una moraleja
El turno cambiado|Dije un horario de memoria y luego vi que no era ese. Me dio vergüenza corregirlo.|corregir un hecho antes de que crezca la mentira|mandar el horario real sin inventar una coartada
La deuda|Debo dinero y he estado haciendo chistes cada vez que sale el tema.|hacerme responsable sin montar una escena|proponer una cantidad y una fecha que sí pueda cumplir
Martina fuera|Le volvieron a preguntar a Martina algo que debían preguntarme a mí.|dejar de usar su paciencia como escudo|decir en el grupo que las preguntas vengan a mí
El recibo|Encontré un recibo y pensé primero en si me hacía quedar bien. Mala señal.|usar un dato por lo que dice|guardar el recibo completo aunque complique mi versión
La broma que sobra|Me reí para quitar tensión y terminé dejándole la vergüenza a otro.|reparar sin rematar con otro chiste|pedir disculpas y escuchar la respuesta entera
El jefe|Mi jefe cambió el turno y yo dije que no pasaba nada. Sí pasaba.|pedir una condición sin hacerlo a gritos|preguntar con cuánto aviso harán los próximos cambios
Una comida pagada|Me ofrecieron pagarme la comida y lo convertí en una competencia de bromas.|aceptar ayuda sin fingir que no la necesito|dar las gracias y hablar de otra cosa
El rumor fácil|Alguien contó una versión que me deja fatal. Una parte es cierta y otra no.|responder sin negar también lo que sí hice|separar en dos frases lo cierto de lo inventado
El teléfono roto|La pantalla está rota desde hace semanas. Digo que me gusta así para no hablar de dinero.|no disfrazar cada dificultad de elección|preguntar cuánto cuesta repararla antes de decidir
La promesa rápida|Prometí ir a una cita y a la vez acepté un turno. Las dos cosas no caben.|avisar antes de que otro pague mi desorden|llamar y proponer una alternativa real
El silencio de casa|En casa preguntaron poco y eso me preocupó más que un interrogatorio.|tolerar un silencio sin rellenarlo con sospechas|preguntar si necesitan hablar y aceptar la respuesta
El favor mal cobrado|Ayudé a alguien y después usé ese favor en una discusión.|dejar de tratar un gesto como crédito|retirar el reproche sin pedir otro favor a cambio
La calle de vuelta|Cambié la ruta para no encontrarme con alguien a quien debo una conversación.|elegir hablar sin hacerlo por emboscada|mandar un mensaje para quedar en un sitio tranquilo
El cumpleaños olvidado|Olvidé el cumpleaños de Martina y le mandé una broma al día siguiente.|mostrar que importa sin hacerla cuidarme la culpa|pedir disculpas y preguntarle qué le apetece hacer
El plan barato|Todos eligieron un sitio caro. Me reí del menú en vez de decir que no podía.|hablar de dinero sin dar una explicación completa|proponer un lugar que sí puedo pagar
Un turno limpio|Hoy llegué a tiempo y anoté las horas. Me siento ridículo por estar orgulloso.|reconocer un cambio pequeño sin pedir una medalla|repetir mañana el mismo cuidado
Sin chiste final|Te iba a decir que me alegró que escribieras y añadí una tontería al final.|dejar una frase honesta sin esconderla|borrar el chiste y enviar lo que quería decir`,
};

export const CHARACTER_IDS = Object.keys(dossiers);
export const EPISODES_PER_CHARACTER = 18;
export const STAGES_PER_EPISODE = 6;
export const CHOICES_PER_CHARACTER = EPISODES_PER_CHARACTER * STAGES_PER_EPISODE * 4;
export const STAGE_NAMES = ['Escuchar', 'Distinguir', 'Poner límites', 'Acordar', 'Reparar', 'Dar seguimiento'];
const stories: Record<string, Situation[]> = Object.fromEntries(Object.entries(dossiers).map(([id, data]) => [id, data.split('\n').map(line => {
  const [title, opening, need, action] = line.split('|');
  return { title, opening, need, action };
})]));
export function freshProgress(): EncounterProgress { return { episode: 0, stage: 0, approach: 0, completed: 0, turns: 0 }; }
export function personalChapters(id:string,saved?:EncounterProgress) {
  const p=saved||freshProgress();
  const completed=p.completedIds || Array.from({length:p.completed},(_,i)=>i);
  return (stories[id]||[]).map((s,index)=>({title:s.title,index,finished:completed.includes(index),locked:index>=12?p.completed<5:index>=6?p.completed<2:false}));
}
export function selectEncounter(id:string,index:number,saved?:EncounterProgress):EncounterProgress|null {
  const entry=personalChapters(id,saved)[index];
  if(!entry||entry.locked||entry.finished) return null;
  const p=saved||freshProgress(); const chapters={...p.chapters,[p.episode]:{stage:p.stage,approach:p.approach}};
  return {...p,chapters,episode:index,stage:chapters[index]?.stage||0,approach:chapters[index]?.approach||0};
}
export function getEncounter(id: string, saved?: EncounterProgress) {
  const progress = saved || freshProgress();
  const situation = stories[id]?.[progress.episode];
  if (!situation || !voices[id]) return null;
  return { ...situation, progress, phase: STAGE_NAMES[progress.stage] };
}
export function encounterChoices(id: string, saved?: EncounterProgress): EncounterChoice[] {
  const arc = getEncounter(id, saved);
  if (!arc) return [];
  const { title, opening, need, action, progress: p } = arc;
  const v = voices[id];
  const choiceTexts = [
    [`Sobre «${title}»: te escucho. ¿Qué parte te está pesando?`, `¿Qué ocurrió exactamente con «${title}» y qué estás suponiendo?`, `Podemos dejar «${title}» para otro momento si hoy no puedes.`, `Creo que con «${title}» le estás dando demasiadas vueltas.`],
    [`Cuando dices «${need}», ¿quieres compañía o una idea?`, `¿Qué detalle cambiaría tu manera de entender «${title}»?`, `No voy a pedirte nombres ni capturas para creerte lo de «${title}».`, `Si quieres ${need}, deberías hacer lo que yo haría.`],
    [`Con «${title}», puedo escuchar ahora, pero no decidir por ti.`, `¿Qué parte de «${title}» puedes contar sin hablar por otra persona?`, `Podemos ${action}, si esa sigue siendo tu decisión.`, `Para ${action}, tendrás que contarme también lo que no quieres.`],
    [`¿Te serviría empezar por ${action}, sin resolverlo todo?`, `Antes de ${action}, ¿hay algo que debamos comprobar?`, `Si prefieres no ${action}, podemos cambiar el plan.`, `Ya decidimos ${action}. No lo cambies ahora.`],
    [`Sobre «${title}»: quizá respondí demasiado rápido. ¿Qué entendí mal?`, `¿Lo que acordamos ayuda a ${need} o solo suena bien?`, `Si mi propuesta para «${title}» te aprieta, la retiramos.`, `Después de todo lo hablado sobre «${title}», ya deberías estar mejor.`],
    [`Me quedo con tu decisión sobre «${title}». ¿Quieres que pregunte otro día?`, `Para cerrar «${title}», ¿qué vas a probar y qué queda sin resolver?`, `No tienes que contarme cómo termina «${title}». Esto sigue siendo tuyo.`, `Voy a contar en el grupo lo de «${title}» para que todos ayuden.`],
  ][p.stage];
  const consequence = p.approach === 3 ? 'Lo de antes me hizo cerrarme. Puedo seguir si dejamos de tratarlo como una orden. ' : p.approach === 2 ? 'Que me dejes elegir cambia cómo te lo cuento. ' : '';
  const answers = [
    [`${opening} Lo que necesito es ${need}.`, `${opening} Eso pasó; la explicación que me estoy contando puede estar equivocada.`, `${opening} No quiero que lo resuelvas por mí; quería poder decirlo.`, `${opening} Que parezca pequeño desde fuera no lo hace más fácil aquí.`],
    [`Para mí, ${need} empieza por poder hablar sin tener preparada una solución.`, `El detalle comprobable es este: ${opening.charAt(0).toLowerCase() + opening.slice(1)} Lo demás todavía lo estoy entendiendo.`, `No voy a reenviar nada. Prefiero intentar ${action} antes de involucrar a alguien más.`, `Necesitar ${need} no significa querer hacer exactamente lo que tú harías.`],
    [`Entonces tu límite también cuenta. Puedo ${action} sin pedirte que te hagas cargo.`, `Puedo decirte esto: ${opening} Lo que otra persona piense tendrá que decirlo ella.`, `Sí, quiero ${action}. Que pueda cambiar de idea es parte del acuerdo.`, `No voy a entregar más intimidad como precio por ${need}.`],
    [`Voy a ${action}. Es un paso, no una promesa de que mañana todo esté arreglado.`, `Comprobaré lo que dependa de mí antes de ${action}. Lo que no sepa lo dejaré como duda.`, `Elijo ${action}, pero agradezco que no lo conviertas en una obligación contigo.`, `No lo habíamos decidido los dos. Quiero ${need}; eso incluye poder cambiar el plan.`],
    [`Te faltó esto: ${need} me cuesta incluso cuando sé qué hacer. No necesitaba que lo hicieras fácil a la fuerza.`, `Intentar ${action} ayuda en una parte. Todavía no resuelve todo lo que te conté.`, `La propuesta puede quedarse si el límite sigue. Voy a ${action} porque lo elijo yo.`, `Puedo haber entendido algo y seguir sintiéndome mal. No quiero fingir mejoría para cerrar «${title}».`],
    [`Pregúntame otro día, sin convertirlo en una revisión. Mi paso será ${action}.`, `Voy a ${action}. Queda pendiente aprender a ${need}; no cabe entero en esta conversación.`, `Me quedo con eso. Si vuelvo a hablar de «${title}», no significa que esta conversación no sirvió.`, `No lo cuentes. «${title}» salió aquí porque pensaba que podía elegir quién lo sabía.`],
  ][p.stage];
  return choiceTexts.map((text, branch) => {
    const final = p.stage === STAGES_PER_EPISODE - 1;
    const completedIds=p.completedIds||Array.from({length:p.completed},(_,i)=>i);
    const finished=final?Array.from(new Set([...completedIds,p.episode])):completedIds;
    const chapters={...p.chapters,[p.episode]:{stage:final?0:p.stage+1,approach:branch}};
    const nextEpisode=final?stories[id].findIndex((_,index)=>!finished.includes(index)):p.episode;
    const openingVoice = branch === 3 ? v.resist : p.stage === 4 ? v.repair : branch === 1 ? v.clarify : branch === 2 ? v.boundary : v.accept;
    return { id: `${id}:${p.episode}:${p.stage}:${branch}`, text, reply: `${consequence}${openingVoice} ${answers[branch]}`,
      trust: branch === 3 ? -2 : branch === 1 ? 1 : 2, close: branch === 0 ? 1 : 0, tension: branch === 3 ? 2 : -1,
      next: { episode: nextEpisode<0?EPISODES_PER_CHARACTER:nextEpisode, stage: final?(chapters[nextEpisode]?.stage||0):p.stage+1, approach: final?(chapters[nextEpisode]?.approach||0):branch, completed: finished.length, turns: p.turns + 1, last: title, chapters, completedIds:finished },
      followup:final?(branch===3?`Me quedé pensando en cómo cerramos «${title}». ${v.boundary} Me importa poder ${need} sin que esto se convierta en un informe para el grupo.`:`Quería volver a lo de «${title}». Probé ${action}. No lo arregló todo; poder ${need} sigue llevándome tiempo. ${v.accept}`):undefined,
      memory: `${title} · ${STAGE_NAMES[p.stage]}. ${branch === 3 ? 'Señaló un límite: no hablar en su nombre.' : `Decidió ${action}.`}` };
  });
}
export function encounterCatalog() {
  return CHARACTER_IDS.map(id => ({ id, episodes: stories[id].length, choices: stories[id].length * STAGES_PER_EPISODE * 4, titles: stories[id].map(s => s.title) }));
}
