# Lab 19 — ejecución y guía para Windows / PowerShell

Carnet del estudiante: **20230285** · CS031 · Sesión 22

**Resultado actual:** nota 1 aceptada y recuperada de damus, nos.lol y el relay local temporal a lo largo de las pruebas; nostr.wine la rechazó con `restricted: sign up at https://nostr.wine to write events to this relay`. Original válida y copia alterada inválida. #2 rechazada por el ban local y aceptada y recuperada en los dos abiertos. El [carnet](CARNET.md) contiene la tabla y la reflexión final; el [registro](ESTADO.md) explica el alcance.

La continuación pública ya se ejecutó desde tu terminal a las 15:34 del 19 de octubre de 2026. **No vuelvas a publicar ni a generar notas o llaves para este lab.** Se reutilizaron exactamente `nota1.json` y `nota2.json`; los [resultados consolidados](evidencia/resultados-consolidados.json) enlazan las dos fases. Las respuestas originales están en `evidencia/publicos-terminal/` y la [captura de terminal](<evidencia/Screenshot 2026-10-19 153506.png>) fue revisada sin observar una llave privada.

`nak` está instalado en `C:\Users\juanl\go\bin\nak.exe`. La CLI imprime `nak version debug`; los metadatos de Go identifican el módulo oficial `github.com/fiatjaf/nak v0.21.2`. El relay propio usa Khatru por solicitud del estudiante: no es strfry ni el relay del instructor. Docker no tenía motor activo y WSL devolvió acceso denegado. El instructor debe aceptar esta adaptación; después entrega el bloque del carnet en el enlace que indique.

La llave de test fue descartada al terminar la prueba local; la publicación posterior no necesitó el secreto porque los JSON ya estaban firmados. El servidor local se detuvo y almacenaba en memoria. El conteo 3/4 reúne recuperaciones durante ambas fases, no presencia simultánea ni conservación permanente. El mensaje observado de wine pide registro y no menciona expresamente un pago.

Lo siguiente conserva la guía manual para una sesión nueva. Los pasos de generación no deben repetirse sobre la ejecución ya documentada.

Abre [el informe HTML final](index.html): incluye el carnet 20230285, la tabla de relays, los eventos firmados, los registros de verificación y ban, la captura incorporada y una opción de impresión / PDF. La guía manual para una sesión nueva permanece en este README.

Sigue los bloques en orden, en la misma ventana de PowerShell. La llave la generas tú en clase y permanece en la memoria de esa ventana. Los archivos de evidencia contienen eventos públicos y respuestas, nunca la llave privada. Tiempo orientativo tras instalar `nak`: 3 + 7 + 8 + 7 + 5 minutos.

El [estado real de la ejecución](ESTADO.md) y el [carnet con resultados](CARNET.md) documentan los resultados locales y públicos, incluida la adaptación del relay.

## 0. Localizar nak; instalación solo si falta

La instalación ya está disponible en la carpeta `go/bin` del usuario. El bloque siguiente la localiza aunque el PATH de esta terminal no esté actualizado. Si en otro equipo falta, usa únicamente [Releases de fiatjaf/nak](https://github.com/fiatjaf/nak/releases/latest), descarga el ejecutable **Windows amd64/x86_64** y colócalo en `.tools/nak.exe`. No necesitas Go si usas el binario oficial.

Abre PowerShell en esta carpeta y comprueba:

```powershell
Set-Location -LiteralPath 'C:\Users\juanl\Documents\GitHub\Laboratorio 19'
$nakPath = Join-Path $env:USERPROFILE 'go\bin\nak.exe'
if (-not (Test-Path -LiteralPath $nakPath)) { $nakPath = Join-Path $PWD.Path '.tools\nak.exe' }
if (-not (Test-Path -LiteralPath $nakPath)) { throw 'Falta nak: instala desde el repositorio oficial.' }
Set-Alias -Name nak -Value $nakPath
nak --version
if ($LASTEXITCODE -ne 0) { throw 'nak no funciona. Detente antes de generar la llave.' }
New-Item -ItemType Directory -Path '.\evidencia' -Force | Out-Null
nak --version | Set-Content -LiteralPath '.\evidencia\version.txt' -Encoding UTF8
```

Si no instala, el enunciado permite trabajar en pareja; cada persona entrega sus propios resultados. No sigas suponiendo que `nak` funciona.

## 1. Preparar UTF-8 y generar tú la llave (3 min)

PowerShell 5.1 usa otras codificaciones por defecto. Configura UTF-8 antes de enviar JSON a un ejecutable; conserva el punto medio y los acentos del texto fijo.

```powershell
$utf8 = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding = $utf8
[Console]::InputEncoding = $utf8
[Console]::OutputEncoding = $utf8
$ErrorActionPreference = 'Continue'

if ($env:NOSTR_SECRET_KEY) { throw 'Ya hay una llave en esta terminal. Abre una terminal nueva para el lab; no la muestres.' }
$env:NOSTR_SECRET_KEY = (nak key generate | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $env:NOSTR_SECRET_KEY -notmatch '^[0-9a-fA-F]{64}$') {
    Remove-Item Env:NOSTR_SECRET_KEY -ErrorAction SilentlyContinue
    throw 'No se genero una llave de test valida.'
}
$pubkey = ($env:NOSTR_SECRET_KEY | nak key public | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $pubkey -notmatch '^[0-9a-f]{64}$') { throw 'Fallo al obtener la llave publica.' }
$npub = (nak encode npub $pubkey | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $npub -notmatch '^npub1') { throw 'Fallo al obtener npub.' }
$npub
$npub | Set-Content -LiteralPath '.\evidencia\npub.txt' -Encoding UTF8
```

Anota solo el `npub`. El primer comando captura la llave generada sin imprimirla. El formato hexadecimal de la llave privada es igual de secreto que una `nsec`. No escribas su valor, no ejecutes la generación sin asignarla, no listes variables de entorno, no uses transcripciones y no la envíes al chat. No uses `setx`: persistiría la llave.

## 2. Firmar y comprobar localmente (7 min)

Estos comandos no reciben URLs de relays: la firma y la verificación no necesitan conexión. Si te desconectas para demostrarlo, reconecta antes del paso 3. Ejecuta la creación una sola vez. Si ya tienes `nota1.json`, reutilízala.

```powershell
if (Test-Path -LiteralPath '.\nota1.json') { throw 'nota1.json ya existe: reutilizala, no generes otra nota.' }
if (-not $env:NOSTR_SECRET_KEY) { throw 'Falta la llave de esta sesion.' }
$notaJson = (nak event -k 1 -c 'CS031 Lab 19 · nota de prueba' -t t=cs031lab19 | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or -not $notaJson) { throw 'Fallo al crear la nota.' }
$nota = $notaJson | ConvertFrom-Json
if ($nota.pubkey -ne $pubkey -or $nota.content -cne 'CS031 Lab 19 · nota de prueba' -or $nota.kind -ne 1) {
    throw 'Autor o contenido inesperado: no publiques.'
}
if ($nota.tags.Count -ne 1 -or $nota.tags[0].Count -ne 2 -or $nota.tags[0][0] -cne 't' -or $nota.tags[0][1] -cne 'cs031lab19') {
    throw 'La etiqueta no coincide con el lab: no publiques.'
}
[System.IO.File]::WriteAllText((Join-Path $PWD.Path 'nota1.json'), $notaJson, $utf8)
$id1 = $nota.id
$id1 | Set-Content -LiteralPath '.\evidencia\id1.txt' -Encoding UTF8
$nota | Format-List id,pubkey,created_at,kind,tags,content,sig
```

Identifica los siete campos:

| Campo | Qué representa |
| --- | --- |
| `id` | SHA-256 de la serialización canónica del evento |
| `pubkey` | Llave pública del autor en hexadecimal |
| `created_at` | Fecha Unix en segundos |
| `kind` | Tipo de evento; aquí `1` (nota de texto) |
| `tags` | Aquí `[["t","cs031lab19"]]` |
| `content` | Texto fijo del lab |
| `sig` | Firma Schnorr del hash con la llave de test |

Verifica la original y guarda el resultado. `nak verify` puede no imprimir nada cuando es válida; comprueba el código de salida.

```powershell
Get-Content -LiteralPath '.\nota1.json' -Raw -Encoding UTF8 | nak verify 2>&1 | Tee-Object -FilePath '.\evidencia\firma-original.txt'
$codigoOriginal = $LASTEXITCODE
"exit_code=$codigoOriginal" | Add-Content -LiteralPath '.\evidencia\firma-original.txt'
if ($codigoOriginal -ne 0) { throw 'La original no paso la verificacion. No publiques.' }
'Original valida (exit_code=0)'
```

Cambia una sola letra, `prueba` → `pruebb`, conservando `id` y `sig`. Esta copia es únicamente local; no se publica ni se vuelve a firmar.

```powershell
$alteradaJson = (Get-Content -LiteralPath '.\nota1.json' -Raw -Encoding UTF8).Replace('nota de prueba', 'nota de pruebb')
$alterada = $alteradaJson | ConvertFrom-Json
if ($alterada.content -ceq $nota.content -or $alterada.id -ne $nota.id -or $alterada.sig -ne $nota.sig) { throw 'La alteracion no es la esperada.' }
[System.IO.File]::WriteAllText((Join-Path $PWD.Path 'nota1-alterada.json'), $alteradaJson, $utf8)
Get-Content -LiteralPath '.\nota1-alterada.json' -Raw -Encoding UTF8 | nak verify 2>&1 | Tee-Object -FilePath '.\evidencia\firma-alterada.txt'
$codigoAlterada = $LASTEXITCODE
"exit_code=$codigoAlterada" | Add-Content -LiteralPath '.\evidencia\firma-alterada.txt'
if ($codigoAlterada -eq 0) { throw 'La copia alterada no deberia ser valida.' }
if (-not (Select-String -LiteralPath '.\evidencia\firma-alterada.txt' -Pattern 'invalid \.id' -Quiet)) {
    throw 'Fallo por otra causa; revisa el mensaje antes de registrar el resultado.'
}
```

Explicación: al alterar el contenido cambia el hash calculado y deja de coincidir con el `id` original. `nak` se detiene con `invalid .id` antes de verificar la firma; la firma original tampoco autentica el hash del contenido alterado. No afirmes que viste `invalid signature` si lo observado fue `invalid .id`.

## 3. Publicar exactamente la misma nota y pedirla por ID (8 min)

Se permite un máximo de dos notas distintas en relays públicos. Publicar el mismo JSON en varios relays conserva el mismo evento y el mismo ID. No regeneres la nota para cada relay. No publiques la copia alterada.

El instructor debe proporcionar el endpoint del relay de clase. Sin él puedes completar los tres relays públicos, pero la cuarta fila y la prueba del ban quedan sin ejecutar. Informa al instructor; no inventes una URL ni sustituyas el relay.

Publica una vez el JSON firmado en los tres relays públicos y guarda stdout y stderr por separado para conservar los mensajes reales:

```powershell
Get-Content -LiteralPath '.\nota1.json' -Raw -Encoding UTF8 | nak event wss://relay.damus.io wss://nos.lol wss://nostr.wine 1> '.\evidencia\publicacion-1-evento.txt' 2> '.\evidencia\publicacion-1-respuestas.txt'
$LASTEXITCODE | Set-Content -LiteralPath '.\evidencia\publicacion-1-exit.txt'
Get-Content -LiteralPath '.\evidencia\publicacion-1-respuestas.txt'
```

Transcribe el mensaje de cada relay en `CARNET.md`. No uses solo el código de salida global: puede haber aceptaciones y rechazos en la misma ejecución. `success.` es la salida de `nak` para aceptación; no inventes un frame `OK` que no hayas capturado. Si ves un mensaje `OK`, copia sus valores y texto exactos. Se espera que nostr.wine rechace la escritura por pago; registra el mensaje recibido, aunque sea distinto al esperado. Un timeout o error DNS no acredita un rechazo explícito. No pagues ni reintentes con otra llave para saltarte restricciones.

Recupera exclusivamente tu evento por ID, relay por relay, y conserva eventos y diagnósticos separados:

```powershell
nak req -i $id1 wss://relay.damus.io 1> '.\evidencia\nota1-damus.jsonl' 2> '.\evidencia\req1-damus.txt'
nak req -i $id1 wss://nos.lol 1> '.\evidencia\nota1-noslol.jsonl' 2> '.\evidencia\req1-noslol.txt'
nak req -i $id1 wss://nostr.wine 1> '.\evidencia\nota1-wine.jsonl' 2> '.\evidencia\req1-wine.txt'
Get-Content -LiteralPath '.\evidencia\nota1-damus.jsonl'
Get-Content -LiteralPath '.\evidencia\nota1-noslol.jsonl'
Get-Content -LiteralPath '.\evidencia\nota1-wine.jsonl'
Get-Content -LiteralPath '.\evidencia\req1-damus.txt','.\evidencia\req1-noslol.txt','.\evidencia\req1-wine.txt'
```

Para cada JSON recibido comprueba `id`, `pubkey`, `content`, `tags` y `sig` contra `nota1.json`, y pásalo a `nak verify` como la original. Solo marca «Sí, la devolvió» cuando recibes el evento correcto. Un archivo vacío acompañado de error de conexión significa «no comprobado»; una consulta completada sin eventos significa «no la devolvió en esta consulta», no una prueba de inexistencia permanente.

Cuando tengas el endpoint, ejecuta este bloque una sola vez. Si sigue faltando, omite el bloque y documenta el impedimento.

```powershell
$relayClase = Read-Host 'URL exacta del relay de clase dada por el instructor'
if ($relayClase -notmatch '^wss?://\S+$') { throw 'Falta una URL ws:// o wss:// valida del instructor.' }
Get-Content -LiteralPath '.\nota1.json' -Raw -Encoding UTF8 | nak event $relayClase 1> '.\evidencia\publicacion-1-clase-evento.txt' 2> '.\evidencia\publicacion-1-clase-respuestas.txt'
Get-Content -LiteralPath '.\evidencia\publicacion-1-clase-respuestas.txt'
nak req -i $id1 $relayClase 1> '.\evidencia\nota1-clase.jsonl' 2> '.\evidencia\req1-clase.txt'
Get-Content -LiteralPath '.\evidencia\nota1-clase.jsonl','.\evidencia\req1-clase.txt'
```

## 4. Ban del instructor y nota #2 (7 min)

Entrega al instructor únicamente el `npub` o la llave pública hexadecimal. Mantén abierta la terminal. Espera a que confirme que baneo esa misma llave en el relay de clase. Sin endpoint y sin ese ban real, este paso sigue pendiente. Un error de red no es evidencia de ban.

Solo después de esa confirmación genera la segunda y última nota con la misma llave:

```powershell
if (-not $relayClase) { throw 'Falta el relay de clase. No ejecutes la fase del ban.' }
if (Test-Path -LiteralPath '.\nota2.json') { throw 'nota2.json ya existe: reutilizala, no generes otra.' }
if (-not $env:NOSTR_SECRET_KEY) { throw 'Falta la llave original: no generes otra para evadir el ban.' }
$nota2Json = (nak event -k 1 -c 'CS031 Lab 19 · nota de prueba #2' -t t=cs031lab19 | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or -not $nota2Json) { throw 'Fallo al crear nota #2.' }
$nota2 = $nota2Json | ConvertFrom-Json
if ($nota2.pubkey -ne $pubkey -or $nota2.content -cne 'CS031 Lab 19 · nota de prueba #2' -or $nota2.kind -ne 1) { throw 'Autor o contenido inesperado: no publiques.' }
if ($nota2.tags.Count -ne 1 -or $nota2.tags[0].Count -ne 2 -or $nota2.tags[0][0] -cne 't' -or $nota2.tags[0][1] -cne 'cs031lab19') { throw 'Etiqueta inesperada: no publiques.' }
[System.IO.File]::WriteAllText((Join-Path $PWD.Path 'nota2.json'), $nota2Json, $utf8)
$id2 = $nota2.id
$id2 | Set-Content -LiteralPath '.\evidencia\id2.txt' -Encoding UTF8
Get-Content -LiteralPath '.\nota2.json' -Raw -Encoding UTF8 | nak verify
if ($LASTEXITCODE -ne 0) { throw 'La nota #2 no paso la verificacion.' }
Get-Content -LiteralPath '.\nota2.json' -Raw -Encoding UTF8 | nak event wss://relay.damus.io wss://nos.lol $relayClase 1> '.\evidencia\publicacion-2-evento.txt' 2> '.\evidencia\publicacion-2-respuestas.txt'
$LASTEXITCODE | Set-Content -LiteralPath '.\evidencia\publicacion-2-exit.txt'
Get-Content -LiteralPath '.\evidencia\publicacion-2-respuestas.txt'
```

No envíes #2 a nostr.wine. Registra la respuesta exacta de clase, incluso si acepta inesperadamente; en ese caso el instructor debe revisar el ban y no corresponde afirmar que funcionó.

Comprueba #2 en los abiertos y clase, y vuelve a pedir nota 1 a los abiertos después del ban para demostrar que sigue disponible:

```powershell
nak req -i $id2 wss://relay.damus.io 1> '.\evidencia\nota2-damus.jsonl' 2> '.\evidencia\req2-damus.txt'
nak req -i $id2 wss://nos.lol 1> '.\evidencia\nota2-noslol.jsonl' 2> '.\evidencia\req2-noslol.txt'
nak req -i $id2 $relayClase 1> '.\evidencia\nota2-clase.jsonl' 2> '.\evidencia\req2-clase.txt'
nak req -i $id1 wss://relay.damus.io 1> '.\evidencia\nota1-damus-tras-ban.jsonl' 2> '.\evidencia\req1-damus-tras-ban.txt'
nak req -i $id1 wss://nos.lol 1> '.\evidencia\nota1-noslol-tras-ban.jsonl' 2> '.\evidencia\req1-noslol-tras-ban.txt'
Get-Content -LiteralPath '.\evidencia\nota2-damus.jsonl','.\evidencia\nota2-noslol.jsonl','.\evidencia\nota2-clase.jsonl'
Get-Content -LiteralPath '.\evidencia\nota1-damus-tras-ban.jsonl','.\evidencia\nota1-noslol-tras-ban.jsonl'
Get-Content -LiteralPath '.\evidencia\req2-damus.txt','.\evidencia\req2-noslol.txt','.\evidencia\req2-clase.txt','.\evidencia\req1-damus-tras-ban.txt','.\evidencia\req1-noslol-tras-ban.txt'
```

Verifica los eventos recuperados y sus IDs. La evidencia evaluada necesita el rechazo de clase a #2 y #2 recuperada en al menos un relay abierto. La supervivencia en otros relays se demuestra con las lecturas realizadas, no se supone por diseño del protocolo.

## 5. Cerrar y entregar (5 min)

Completa [CARNET.md](CARNET.md) con las respuestas reales, las cuatro filas, la comprobación de firma y tres líneas de reflexión. En nostr.wine la columna #2 es «No aplica». Cuenta únicamente los relays donde recuperaste nota 1, explica cualquier consulta no comprobada y no conviertas pasos pendientes en resultados.

Para la reflexión de custodia puedes proponer un firmador bajo responsabilidad de una persona concreta o una llave cifrada con acceso restringido. Describe lo que harías en tu venture; no guardes esta llave de test para ese fin.

Retira la llave del entorno y cierra **la ventana de PowerShell que la generó**, después de completar las dos notas y antes de entregar:

```powershell
Remove-Item Env:NOSTR_SECRET_KEY -ErrorAction SilentlyContinue
exit
```

No abras procesos secundarios que hereden la llave. Cerrar la terminal elimina su variable de proceso; no equivale a garantizar un borrado forense de memoria. Entrega solo el bloque `## LAB # 19` completo en el link de carnet indicado por el instructor; no necesitas subir el ejecutable ni todos los logs. Nunca incluyas la llave privada en chat, capturas, archivos o commits. `.gitignore` no detecta automáticamente una llave pegada dentro de otro archivo.

## Fuentes consultadas

- [Repositorio oficial e instalación](https://github.com/fiatjaf/nak).
- [Releases oficiales](https://github.com/fiatjaf/nak/releases/latest).
- [Uso de NOSTR_SECRET_KEY en nak](https://github.com/fiatjaf/nak/blob/master/main.go).
- [Verificación de hash y firma, incluida salida silenciosa en éxito](https://github.com/fiatjaf/nak/blob/master/verify.go).
- [Publicación de eventos ya firmados](https://github.com/fiatjaf/nak/blob/master/event.go).
- [NIP-01: campos, hash, firma y mensajes](https://github.com/nostr-protocol/nips/blob/master/01.md).
- [Documento de sesión proporcionado](https://docs.google.com/document/d/177jOpZfM7YUrB78Hr8Hy0YhYB1fYpgCKhbTrkYZKKYc/edit): no fue accesible durante la preparación; esta guía sigue el enunciado compartido en el chat.
