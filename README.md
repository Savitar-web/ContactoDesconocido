# Contacto Desconocido

Winteres es la red social ficticia del juego. React + TypeScript + Vite. Sin servidor y sin cuenta.

## Jugar

```
npm install
npm run dev
```

## Qué hay

- Alta por secciones, tres partidas, foto de perfil.
- Historia de la noche: primer mensaje, pijamada cancelada, chat, Rafael, el ruido, el silencio, la investigación y el cuarto de encargos.
- Cuatro respuestas, sin repetir, después de tocar Responder.
- Elenco, pruebas y relleno del diálogo fuera de la interfaz: `src/content`, `src/engine`, `src/persistence`.
- Retratos, sonidos y logo locales. Lectura en voz alta con la voz del sistema, si el dispositivo la tiene.

`capacitor.config.ts` y `electron/` preparan Android y Windows. Este zip no incluye los instaladores.

## Winteres Evolution

La historia principal y los encuentros personales conviven. Puedes cambiar de conversación sin perder el hilo. Cada tres intercambios privados avanza un momento de La Colmena: los personajes siguen hablando, pero el juego nunca elige una respuesta por ti ni inventa que participaste en una búsqueda. Los mensajes y las ausencias quedan registrados. Durante la desaparición se aplazan las citas y las conversaciones personales largas; los privados ofrecen respuestas acordes con la preocupación del grupo.

Cada uno de los nueve adultos tiene **18 encuentros, seis etapas por encuentro y cuatro alternativas por etapa: 432 opciones de diálogo por personaje, 3.888 en total**. Son ramas de una biblioteca narrativa local, sin generación mediante IA ni mensajes de personas reales. Las situaciones y las voces están escritas por personaje; el motor combina contexto, etapa y respuesta anterior. No son 3.888 episodios independientes. Los temas profundos se abren tras compartir historia. Puedes cambiar de tema y retomar su etapa pendiente. Los encuentros completos no pueden repetirse para acumular confianza. A los seis, doce y dieciocho encuentros llegan cambios propios de su vida, aunque no haya romance.

### Relaciones y tiempo

- Cualquiera de los nueve personajes puede desarrollar un vínculo afectivo. Primero hay que conocer su historia; la atracción expresada no equivale a una relación automática. Lucía y Antonio deben aclarar su vínculo previo antes de avanzar.
- Las citas se proponen para otro día, se confirman o se cancelan. No asistir sin avisar tiene una consecuencia posterior. La pareja, la exclusividad y los acuerdos abiertos se hablan por separado.
- Al terminar la historia principal, o en Frecuencia libre, cada seis intercambios transcurre un día. También puedes dejar pasar días desde el cuaderno. El calendario es ficticio; no necesita que dejes abierta la aplicación ni avanza según el reloj real.
- En **Cuaderno → Límites de historia** se activan los temas adultos. La intimidad usa fundido a negro. Embarazo y ocultación de vínculos requieren además su propia activación. Las ramas reproductivas se abren expresamente; el género no decide quién puede gestar. Una confirmación llega semanas narrativas después. La persona que gesta conserva su decisión; la presión puede romper permanentemente la posibilidad romántica. La atención profesional y los procedimientos se narran fuera de escena; no es un simulador médico.
- Ocultar otra relación mientras hay exclusividad puede conocerse días después y romper ambos vínculos. Un acuerdo abierto hablado antes no se trata como una infidelidad. Las decisiones anteriores permanecen aunque se desactive un tema.

### PWA y partidas

`npm run build` genera un service worker a partir de **todos** los archivos de producción. El primer acceso con conexión descarga la historia, retratos, iconos y sonidos. Espera la indicación **Mundo completo disponible sin conexión** y después instala desde el navegador. El desarrollo con `npm run dev` no activa el service worker; usa `npm run build && npm run preview` para probarlo. La lectura en voz alta depende de las voces disponibles en el dispositivo y no se garantiza offline.

El guardado conserva la clave original `cd-slots-v2`. Una elección y su continuación se guardan juntas para evitar ramas incompletas. Al continuar una partida antigua se recuperan respuestas interrumpidas y se deduplican las entradas ya recibidas. Las fotos se reducen localmente. Los historiales largos muestran cien mensajes y permiten cargar los anteriores. Hay exportación e importación de copias JSON, validación de formato y recuperación de datos ilegibles antes de restablecerlos. Borrar los datos del navegador elimina el guardado local: exporta una copia para conservarlo o cambiar de dispositivo.

Las actualizaciones se aplican desde un aviso y no borran partidas. El almacenamiento persistente puede solicitarse con **Descargar todo**; su concesión depende del navegador. La descarga actual pesa aproximadamente 3,5 MB, sin dependencias de fuentes, servicios de chat ni recursos de terceros.

### Comprobaciones

```sh
npm run lint
npm test
npm run build
npm run preview
```

Las pruebas verifican las 3.888 ramas, la continuidad de encuentros, las nueve rutas de pareja, los límites de consentimiento, las citas incumplidas, las consecuencias diferidas, las decisiones reproductivas, la recuperación de partidas antiguas y que una copia corrupta no se sobrescriba. GitHub Actions ejecuta lint, pruebas y compilación en Node 22. Vercel publica `dist` con HTTPS y cabeceras de actualización para el service worker.
