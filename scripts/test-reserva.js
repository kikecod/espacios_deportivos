// Quick script to reproduce reserva creation and print server response/errors
// Usage: node scripts/test-reserva.js

const BASE = 'http://localhost:3000/api';

async function main() {
  try {
    // 1) Login with seeded dev client user
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'dev_cliente@local.test', contrasena: 'cliente123' }),
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) throw new Error('Login failed: ' + JSON.stringify(loginJson));
    const token = loginJson.accessToken;
    const id_cliente = loginJson.usuario?.id_persona;
    console.log('Login OK, id_cliente=', id_cliente);

    // 2) Pick first available cancha
    const canchaRes = await fetch(`${BASE}/cancha`);
    const canchas = await canchaRes.json();
    if (!Array.isArray(canchas) || canchas.length === 0) throw new Error('No canchas available');
    const cancha = canchas[0];
    const id_cancha = cancha.id_cancha;
    console.log('Using cancha', id_cancha, 'precio:', cancha.precio);

    // 3) Build a timeslot for tomorrow 10:00-11:00 local, then ISO
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const payload = {
      id_cliente: Number(id_cliente),
      id_cancha: Number(id_cancha),
      inicia_en: start.toISOString(),
      termina_en: end.toISOString(),
      cantidad_personas: 2,
      requiere_aprobacion: false,
      monto_base: 0,
      monto_extra: 0,
      monto_total: 0,
    };

    console.log('POST /reservas payload=', payload);

    const reservaRes = await fetch(`${BASE}/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const text = await reservaRes.text();
    try {
      const json = JSON.parse(text);
      console.log('Status:', reservaRes.status, json);
    } catch {
      console.log('Status:', reservaRes.status, text);
    }
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
}

main();
