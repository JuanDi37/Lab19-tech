# Estado de ejecución — Lab 19

Carnet del estudiante: **20230285**

Fecha: 2026-10-19. Firma y ban local: 15:30 Guatemala. Continuación pública desde la terminal del estudiante: 15:34:39–15:34:44 Guatemala.

Se completaron las observaciones públicas con exactamente los dos eventos firmados durante la prueba local. Nota 1 se recuperó de damus, nos.lol y del local temporal a lo largo de ambas pruebas; nostr.wine la rechazó explícitamente. Nota #2 fue rechazada por el ban local y aceptada y recuperada en ambos abiertos.

| Comprobación | Resultado observado |
| --- | --- |
| nak | Ruta go/bin/nak.exe del usuario; CLI nak version debug; metadatos oficiales github.com/fiatjaf/nak v0.21.2, Go 1.27.0 |
| Firma original / #2 | Válidas, exit 0; siete campos, tipo 1, contenido y tag exactos, hash canónico comprobado |
| Copia alterada | Solo local, prueba → pruebb; invalid .id, exit 123 |
| Nota 1 en damus y nos.lol | Aceptada (success., exit 0), recuperada por ID y verificada |
| Nota 1 en nostr.wine | Rechazada: restricted: sign up at https://nostr.wine to write events to this relay (exit 123); consulta completada sin eventos (exit 0) |
| Nota 1 en local | Aceptada y recuperada antes y después del ban; firmas válidas |
| Ban local | Aplicado a la misma llave pública a las 21:30:04.032 UTC, antes de firmar #2 |
| Nota #2 en local | Rechazada: blocked: test pubkey banned on local lab relay (exit 123); consulta completada sin eventos (exit 0) |
| Nota #2 en damus y nos.lol | Aceptada (success., exit 0), recuperada por ID y verificada después del ban local |
| Nota 1 tras el ban, abiertos | Recuperada y verificada en damus y nos.lol; no hay lectura pública previa al ban en esta evidencia |
| Captura | Screenshot 2026-10-19 153506.png revisada visualmente: coincide con respuestas guardadas; sin llave privada visible |
| Llave y límites | Solo en memoria durante firma; proceso terminado; dos eventos, sin pagos, scraping ni evasión de bans públicos |
| Relay propio | Khatru en ws://127.0.0.1:10547, almacenamiento temporal en memoria; detenido antes de continuar en públicos |
| Adaptación | Solicitada por estudiante; no es strfry ni relay del instructor. Docker sin motor y WSL denegado en la sesión original |
| Intentos iniciales | Bloqueados por permisos de socket del entorno; se conservaron en evidencia/resultados.json como historial |
| Documento de sesión | Google Doc no accesible durante la preparación; se siguió el enunciado compartido |
| Entrega | Carnet e informe actualizados; pendiente enviar al link de carnet no proporcionado y aceptación docente de la adaptación |

[Resultados consolidados](evidencia/resultados-consolidados.json) · [Respuestas públicas originales](evidencia/publicos-terminal/resultados.json) · [Captura](<evidencia/Screenshot 2026-10-19 153506.png>) · [Verificación pública](evidencia/verificacion-publicos.txt).

La auditoría comparó cada respuesta de publicación con stderr y códigos originales, comprobó la igualdad de los seis eventos recuperados de abiertos con los JSON firmados y ejecutó nuevamente nak verify sobre esos seis eventos y las dos originales: exit 0. No se hicieron publicaciones ni consultas nuevas durante esta revisión. Los logs originales del primer intento se conservan sin modificar.

El conteo 3/4 describe recuperaciones observadas a lo largo de dos ejecuciones; no afirma almacenamiento simultáneo ni permanente. El mensaje de wine exige registro y no menciona expresamente pago. No hay pasos públicos pendientes ni se debe volver a ejecutar --publicos.

Informe final: index.html identifica el carnet 20230285 e incorpora la captura PNG original, los dos eventos firmados y los registros esenciales dentro del archivo. La guía manual se conserva en README. Se verificaron la estructura, los enlaces, la igualdad de la captura incorporada con el PNG original y los controles de hash e impresión mediante DOM simulado. No se comprobó visualmente el renderizado en un navegador.
