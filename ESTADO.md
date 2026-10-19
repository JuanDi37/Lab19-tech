# Registro de preparación

Fecha: 2026-10-19.

| Comprobación | Resultado real |
| --- | --- |
| Sistema | Windows x64; PowerShell 5.1.26100.9711 |
| Repositorio al comenzar | Solo `.gitattributes`; árbol de trabajo limpio |
| `nak` disponible en PATH | No |
| Go disponible en PATH | No |
| Descarga mediante PowerShell desde API oficial de GitHub | Falló: `Unable to connect to the remote server` |
| Conexión con curl a Releases oficial | Falló: `curl: (7) Failed to connect to github.com:443` |
| Consulta del repositorio oficial mediante navegador de investigación | Accesible; instrucciones y código consultados |
| Documento de sesión de Google | No accesible con la herramienta; se trabajó con el enunciado pegado por el usuario |
| Usuario en clase | Sí, confirmado por el usuario |
| Generación de llave | La hará el usuario en su propia terminal, como solicitó |
| URL del relay de clase | El usuario indica que no se proporciona |
| Instalaciones realizadas | Ninguna |
| Llaves generadas por el asistente | Ninguna |
| Notas firmadas o publicadas por el asistente | Ninguna |
| Resultados de relays / ban | Sin ejecutar; no se simularon respuestas |
| Sintaxis de los 11 bloques PowerShell de README | Validada con el parser de PowerShell: 0 errores; sin ejecutar los bloques |
| UTF-8 en pipeline a ejecutable nativo | Ida y vuelta del texto fijo comprobada con Node instalado: correcta |
| Estructura JSON de la etiqueta en PowerShell 5.1 | Comprobada: un tag con dos elementos |
| Formato del árbol de trabajo | `git diff --check` sin errores; archivos nuevos sin commit |

La falta de endpoint impide ejecutar la cuarta fila y probar el ban de clase. Un fallo de conexión no demuestra un rechazo por política. Informar al instructor y pedirle el endpoint o una adaptación explícita del ejercicio; no reemplazarlo por otro relay ni afirmar que hubo un ban.

La guía está preparada para ejecutar manualmente los pasos en la misma terminal. La instalación y las verificaciones con `nak` aún requieren ejecución real; revisar sintaxis no demuestra conectividad, firmas ni aceptación por los relays.

## Informe HTML

Se creó `index.html` como informe local en español con estilos integrados, navegación, explicación del trabajo, fundamentos, aprendizajes, tabla de pendientes, criterios de evaluación y los 11 bloques exactos de README. Incluye una demostración didáctica del hash del texto y una opción de impresión / PDF; no genera llaves ni se conecta a relays.

Comprobaciones realizadas con Node ya instalado: estructura y cierre de etiquetas, IDs y enlaces internos, archivos enlazados, ausencia de dependencias externas, coincidencia de los 11 bloques, sintaxis JavaScript y comportamiento de los controles en un DOM simulado. Los hashes de ambos textos coincidieron con SHA-256 de Node; se verificaron el retorno al original, la alternativa sin Web Crypto y la apertura/restauración de los comandos al imprimir.

Se intentó obtener una captura con Chrome y Edge en modo headless. Ambos procesos terminaron con código `-2147483645`, sin generar la captura. No se comprobó visualmente el renderizado ni la salida PDF en este entorno.
