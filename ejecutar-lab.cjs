// Ejecución acotada: dos notas fijas, sin reintentos ni secretos en disco.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { createHash } = require('node:crypto');
const root = __dirname;
const nak = process.env.LAB_NAK || path.join(process.env.USERPROFILE, 'go', 'bin', 'nak.exe');
const localURL = 'ws://127.0.0.1:10547';
const relays = [
  ['damus', 'wss://relay.damus.io'], ['noslol', 'wss://nos.lol'],
  ['wine', 'wss://nostr.wine'], ['local', localURL]
];
const fixed = 'CS031 Lab 19 · nota de prueba';
const onlyPublic = process.argv.includes('--publicos');
const evidence = path.join(root, 'evidencia', ...(onlyPublic ? ['publicos-terminal'] : []));
const save = (name, value) => fs.writeFileSync(path.join(evidence, name), value, 'utf8');
const cleanEnv = { ...process.env, NO_COLOR: '1' };
delete cleanEnv.NOSTR_SECRET_KEY;
const results = { started_at: new Date().toISOString(), relay_type: 'Khatru local; no es strfry ni relay del instructor', relays: {} };
function run(args, input = '', env = cleanEnv, timeout = 22000) {
  return new Promise(resolve => {
    const p = spawn(nak, args, { cwd: root, env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false;
    const timer = setTimeout(() => { timedOut = true; p.kill(); }, timeout);
    p.stdout.setEncoding('utf8'); p.stderr.setEncoding('utf8');
    p.stdout.on('data', data => { stdout += data; });
    p.stderr.on('data', data => { stderr += data; });
    p.stdin.on('error', () => {});
    p.once('error', () => { clearTimeout(timer); resolve({ code: null, stdout, stderr: 'No se pudo ejecutar nak.', timedOut }); });
    p.once('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr, timedOut }); });
    p.stdin.end(input);
  });
}
function record(name, r) {
  save(`${name}-stdout.txt`, r.stdout);
  save(`${name}-stderr.txt`, r.stderr);
  save(`${name}-estado.json`, JSON.stringify({ code: r.code, timedOut: r.timedOut, time: new Date().toISOString() }, null, 2));
}
function validate(raw, pubkey, content) {
  const e = JSON.parse(raw);
  if (Object.keys(e).sort().join(',') !== 'content,created_at,id,kind,pubkey,sig,tags' ||
      e.pubkey !== pubkey || e.kind !== 1 || e.content !== content ||
      JSON.stringify(e.tags) !== '[["t","cs031lab19"]]') throw Error('Evento fuera de los límites del lab.');
  const id = createHash('sha256').update(JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content])).digest('hex');
  if (id !== e.id) throw Error('Hash canónico inesperado.');
  return e;
}
async function verify(name, raw, expected = 0) {
  const r = await run(['verify'], raw);
  record(name, r);
  if (r.code !== expected) throw Error(`Verificación inesperada: ${name}.`);
  return r;
}
async function publish(number, raw, targets) {
  await Promise.all(targets.map(async ([name, url]) => {
    const r = await run(['event', url], raw);
    record(`publicacion-${number}-${name}`, r);
    results.relays[name] ??= { url };
    results.relays[name][`publish${number}`] = { code: r.code, timedOut: r.timedOut, response: r.stderr.trim(), accepted: /success\./.test(r.stderr) };
    console.log(`Nota ${number}, ${name}: ${r.stderr.trim() || '(sin mensaje)'}${r.timedOut ? ' [timeout local]' : ''}`);
  }));
}
async function query(number, event, targets, suffix = '') {
  await Promise.all(targets.map(async ([name, url]) => {
    const r = await run(['req', '-i', event.id, url], '{}\n');
    const label = `consulta-${number}-${name}${suffix}`;
    record(label, r);
    const events = r.stdout.trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
    for (const e of events) {
      // Compare every signed field, then verify cryptographically again.
      for (const field of Object.keys(event)) if (JSON.stringify(e[field]) !== JSON.stringify(event[field])) throw Error('El relay devolvió otro evento.');
      await verify(`${label}-firma`, JSON.stringify(e));
    }
    results.relays[name][`query${number}${suffix}`] = { code: r.code, timedOut: r.timedOut, returned: events.length === 1, response: r.stderr.trim() };
    console.log(`Consulta ${number}${suffix}, ${name}: ${events.length === 1 ? 'evento correcto recuperado y verificado' : 'sin evento recuperado'}`);
  }));
}
async function waitReady(server) {
  for (let i = 0; i < 40; i++) {
    if (server.exitCode !== null) throw Error('El relay local terminó antes de iniciar.');
    try {
      const r = await fetch('http://127.0.0.1:10547', { headers: { Accept: 'application/nostr+json' }, signal: AbortSignal.timeout(500) });
      if (r.ok && (await r.json()).name === 'CS031 Lab 19 - relay local') return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw Error('El relay local no inició.');
}
(async () => {
  if (onlyPublic) {
    if (fs.existsSync(path.join(evidence, 'intento-iniciado.txt'))) throw Error('Ya se intentó la continuación pública. Revisa sus respuestas antes de repetir.');
    const prior = JSON.parse(fs.readFileSync(path.join(root, 'evidencia', 'resultados.json'), 'utf8'));
    const event1 = validate(fs.readFileSync(path.join(root, 'nota1.json'), 'utf8'), prior.pubkey, fixed);
    const event2 = validate(fs.readFileSync(path.join(root, 'nota2.json'), 'utf8'), prior.pubkey, `${fixed} #2`);
    if (!prior.ban || event1.id !== prior.id1 || event2.id !== prior.id2) throw Error('Falta la evidencia previa del ban o cambiaron los eventos.');
    fs.mkdirSync(evidence, { recursive: true });
    save('intento-iniciado.txt', new Date().toISOString() + '\n');
    await verify('firma-nota1', JSON.stringify(event1));
    await verify('firma-nota2', JSON.stringify(event2));
    const targets = relays.filter(([name]) => name !== 'local');
    await publish(1, JSON.stringify(event1), targets);
    await query(1, event1, targets);
    await publish(2, JSON.stringify(event2), targets.filter(([name]) => name !== 'wine'));
    await query(2, event2, targets.filter(([name]) => name !== 'wine'));
    await query(1, event1, targets.filter(([name]) => name !== 'wine'), '-tras-ban');
    results.id1 = event1.id; results.id2 = event2.id; results.npub = prior.npub;
    results.ended_at = new Date().toISOString();
    save('resultados.json', JSON.stringify(results, null, 2) + '\n');
    console.log('Respuestas guardadas en evidencia/publicos-terminal. Actualiza el carnet con estas respuestas reales.');
    return;
  }
  if (fs.existsSync(path.join(root, 'nota1.json')) || fs.existsSync(path.join(root, 'nota2.json'))) throw Error('Ya existen notas: no se generan más ni se reinicia el lab.');
  if (process.env.NOSTR_SECRET_KEY) throw Error('Hay una llave preexistente; no se usará para este lab.');
  if (fs.existsSync(path.join(root, 'relay-local', 'banned-pubkey.txt'))) throw Error('Hay una política anterior; revisar antes de ejecutar.');
  fs.mkdirSync(evidence, { recursive: true });
  const relayLog = fs.openSync(path.join(evidence, 'relay-local.log'), 'w');
  const server = spawn(path.join(root, '.tools', 'lab-relay.exe'), [], { cwd: root, env: cleanEnv, windowsHide: true, stdio: ['ignore', relayLog, relayLog] });
  server.on('error', () => {});
  let secret = '', signerEnv;
  try {
    await waitReady(server);
    const version = await run(['--version']); record('version', version);
    if (version.code !== 0) throw Error('nak --version falló.');
    const generated = await run(['key', 'generate']);
    secret = generated.stdout.trim(); generated.stdout = '';
    if (generated.code !== 0 || !/^[0-9a-f]{64}$/.test(secret)) throw Error('No se pudo generar la llave de test.');
    const pk = await run(['key', 'public'], `${secret}\n`);
    if (pk.code !== 0 || !/^[0-9a-f]{64}$/.test(pk.stdout.trim())) throw Error('No se pudo derivar la llave pública.');
    const pubkey = pk.stdout.trim();
    const npub = await run(['encode', 'npub', pubkey]);
    if (npub.code !== 0 || !/^npub1/.test(npub.stdout.trim())) throw Error('No se pudo codificar npub.');
    results.pubkey = pubkey; results.npub = npub.stdout.trim();
    save('npub.txt', results.npub + '\n');
    console.log(`npub de test: ${results.npub}`);
    signerEnv = { ...cleanEnv, NOSTR_SECRET_KEY: secret };
    const signed = await run(['event', '-k', '1', '-c', fixed, '-t', 't=cs031lab19'], '{}\n', signerEnv);
    if (signed.code !== 0) throw Error('Falló la firma de nota 1.');
    const raw1 = signed.stdout.trim(); const event1 = validate(raw1, pubkey, fixed);
    fs.writeFileSync(path.join(root, 'nota1.json'), raw1 + '\n', 'utf8');
    results.id1 = event1.id; save('id1.txt', event1.id + '\n');
    await verify('firma-original', raw1);
    const altered = raw1.replace('nota de prueba', 'nota de pruebb');
    fs.writeFileSync(path.join(root, 'nota1-alterada.json'), altered + '\n', 'utf8');
    const bad = await run(['verify'], altered); record('firma-alterada', bad);
    if (bad.code === 0 || !bad.stderr.includes('invalid .id')) throw Error('La copia alterada no falló por invalid .id.');
    results.signature = { original: 'valida; exit 0', altered: bad.stderr.trim(), alteredExit: bad.code };
    console.log('Firma original válida; copia alterada inválida (invalid .id).');
    await publish(1, raw1, relays);
    await query(1, event1, relays);
    // Ban real aplicado únicamente al relay local administrado para esta práctica.
    fs.writeFileSync(path.join(root, 'relay-local', 'banned-pubkey.txt'), pubkey + '\n', 'utf8');
    results.ban = { time: new Date().toISOString(), pubkey, applied_by: 'operador local, por instrucción del usuario; no por el instructor', message: 'blocked: test pubkey banned on local lab relay' };
    save('ban.json', JSON.stringify(results.ban, null, 2));
    console.log('Ban de escritura aplicado al npub en el relay local.');
    const second = await run(['event', '-k', '1', '-c', `${fixed} #2`, '-t', 't=cs031lab19'], '{}\n', signerEnv);
    if (second.code !== 0) throw Error('Falló la firma de nota 2.');
    const raw2 = second.stdout.trim(); const event2 = validate(raw2, pubkey, `${fixed} #2`);
    fs.writeFileSync(path.join(root, 'nota2.json'), raw2 + '\n', 'utf8');
    results.id2 = event2.id; save('id2.txt', event2.id + '\n');
    await verify('firma-nota2', raw2);
    delete signerEnv.NOSTR_SECRET_KEY; secret = '';
    await publish(2, raw2, relays.filter(([name]) => name !== 'wine'));
    await query(2, event2, relays.filter(([name]) => name !== 'wine'));
    await query(1, event1, relays.filter(([name]) => name !== 'wine'), '-tras-ban');
    if (!results.relays.local.publish1.accepted || !results.relays.local.query1.returned || results.relays.local.publish2.accepted || !results.relays.local.publish2.response.includes('blocked: test pubkey banned') || results.relays.local.query2.returned) throw Error('La secuencia local de aceptación y ban no coincide con lo observado.');
    results.local_experiment_complete = true;
  } finally {
    secret = ''; if (signerEnv) delete signerEnv.NOSTR_SECRET_KEY;
    results.ended_at = new Date().toISOString(); results.secret_persisted = false;
    server.kill();
    await new Promise(resolve => { if (server.exitCode !== null) resolve(); else server.once('close', resolve); });
    fs.closeSync(relayLog);
    results.local_relay_stopped = true;
    save('resultados.json', JSON.stringify(results, null, 2) + '\n');
    console.log('Llave retirada de memoria de trabajo; relay local detenido; resultados guardados.');
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
