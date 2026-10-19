## LAB # 19

Carnet del estudiante: **20230285**

Ejecución local: 19 de octubre de 2026, 15:30 (Guatemala). Continuación pública: 15:34:39–15:34:44. **Resultados públicos y ban local documentados.** A petición del estudiante se creó un relay propio con Khatru; no es strfry ni el relay del instructor. Su aceptación como adaptación de la fila de clase queda a criterio del instructor.

npub de test: `npub1qmwmgh6n3e8f4ek74cag0s3ef3xljqlfpuvk6utt8mmmz5ssjtyqrrgn28`

ID de la nota 1: `7301a0eac00bcfa10a36dcb5ad3457150964b6539dc63ab3bcde297a2e669d3f`

ID de la nota #2: `5756634e0c6809bf8ce07b81cce56760881497b0d319841b327364f533fa12b8`

| Relay | ¿Aceptó nota 1? | Respuesta real de publicación / OK | ¿Devolvió nota 1 por ID? | ¿Aceptó #2 después del ban local? / respuesta real | ¿Devolvió #2 por ID? |
| --- | --- | --- | --- | --- | --- |
| wss://relay.damus.io | Sí (exit 0) | `publishing to relay.damus.io... success.` | Sí: mismo evento y firma válida (exit 0); también tras el ban local | Sí: `publishing to relay.damus.io... success.` (exit 0) | Sí: mismo evento y firma válida (exit 0) |
| wss://nos.lol | Sí (exit 0) | `publishing to nos.lol... success.` | Sí: mismo evento y firma válida (exit 0); también tras el ban local | Sí: `publishing to nos.lol... success.` (exit 0) | Sí: mismo evento y firma válida (exit 0) |
| wss://nostr.wine | No (exit 123) | `publishing to nostr.wine... failed: msg: restricted: sign up at https://nostr.wine to write events to this relay` | No la devolvió: consulta completada sin eventos (exit 0) | No aplica: #2 no enviada | No aplica |
| ws://127.0.0.1:10547 — propio, Khatru | Sí (exit 0) | `publishing to ws://127.0.0.1:10547... success.` | Sí: mismo evento y firma válida (exit 0); también tras el ban local | No: `publishing to ws://127.0.0.1:10547... failed: msg: blocked: test pubkey banned on local lab relay` (exit 123) | No la devolvió: consulta completada sin eventos (exit 0) |

`success.` es la respuesta mostrada por nak; no se capturó un frame OK crudo. En nostr.wine se observó una restricción de registro: el mensaje real no menciona un pago. No se pagó ni se intentó evadir la restricción.

Comprobación de firma: original válida (`nak verify`, exit 0, salida vacía); copia local con `prueba` → `pruebb` inválida (exit 123): `invalid .id, expected id::5ade8ba80ef61354ac082e398ef1b2360f07231b0594402ac2216bc9b8356653, got id::7301a0eac00bcfa10a36dcb5ad3457150964b6539dc63ab3bcde297a2e669d3f`. Cambiar una letra cambia el hash canónico; el ID original deja de coincidir y la firma original no autentica el nuevo contenido. nak se detuvo al comprobar el ID, antes de verificar la firma de esa copia. Los eventos recuperados de los abiertos se compararon con los originales y sus firmas también se verificaron.

Reflexión de 3 líneas:

Mi nota quedó comprobada en 3 de 4 relays a lo largo de las pruebas (damus, nos.lol y el local temporal); nostr.wine la rechazó con «restricted: sign up at https://nostr.wine to write events to this relay».

El ban local me quitó publicar #2 en ese relay, pero no publicar y recuperar esa misma nota en damus y nos.lol; también recuperé nota 1 después del ban y comprobé sus firmas.

Si mi venture tuviera una cuenta Nostr, la nsec la guardaría en un firmador dedicado bajo mi responsabilidad, con respaldo cifrado en una unidad desconectada, porque autoriza publicaciones y no debe compartirse ni quedar en Git.

Evidencia: [resultados consolidados](evidencia/resultados-consolidados.json), [respuestas públicas y consultas](evidencia/publicos-terminal/resultados.json), [ban local](evidencia/relay-local.log), [captura de la terminal](<evidencia/Screenshot 2026-10-19 153506.png>), [verificación de los eventos recuperados](evidencia/verificacion-publicos.txt), [nota 1](nota1.json) y [nota #2](nota2.json).

El conteo 3/4 reúne observaciones de ambas ejecuciones: el relay local ya estaba detenido al publicar en los públicos y su almacenamiento era temporal. Nota 1 se recuperó del local antes y después del ban; en los públicos, las lecturas registradas ocurrieron después del ban local. Solo se usaron dos notas firmadas; la llave de test fue descartada y no se necesitó para la continuación. La captura revisada no muestra una llave privada.

Pendiente administrativo: aceptación de la adaptación Khatru por el instructor y entrega de este bloque en el link de carnet, que no fue proporcionado.
