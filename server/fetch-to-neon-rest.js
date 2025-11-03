require('dotenv').config();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const SOURCE_URL = 'https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php';
// Neon Data API base endpoint provided by user
const NEON_REST_BASE = process.env.NEON_REST_BASE || 'https://ep-ancient-sky-adb87hwt.apirest.c-2.us-east-1.aws.neon.tech/neondb/rest/v1';
// Optional Neon Auth access token (Stack token). If set, will be sent via header.
const NEON_ACCESS_TOKEN = process.env.NEON_ACCESS_TOKEN || process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || '';

function normalizeRates(raw) {
  return {
    vedhani: (raw['24K Gold'] ?? '').toString(),
    ornaments22k: (raw['22K Gold'] ?? '').toString(),
    ornaments18k: (raw['18K Gold'] ?? '').toString(),
    silver: (raw['Silver'] ?? '').toString(),
    // updated_at is defaulted by DB; include if you want to override:
    // updated_at: new Date().toISOString(),
  };
}

async function fetchRates() {
  const res = await fetch(SOURCE_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Failed to fetch source rates: ${res.status} ${res.statusText}`);
  return res.json();
}

async function postToNeonRest(payload) {
  const url = `${NEON_REST_BASE}/rates`;
  const headers = {
    'Content-Type': 'application/json',
    // Ask PostgREST to return the inserted row
    'Prefer': 'return=representation',
  };

  // Attach Neon Auth access token if available (recommended)
  if (NEON_ACCESS_TOKEN) {
    headers['X-Stack-Access-Token'] = NEON_ACCESS_TOKEN;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Neon REST insert failed: ${res.status} ${res.statusText} ${text}`);
  }

  const data = await res.json().catch(() => null);
  return data;
}

async function syncNeonRest() {
  const raw = await fetchRates();
  const payload = normalizeRates(raw);
  const inserted = await postToNeonRest(payload);
  return inserted && inserted[0] ? inserted[0] : inserted;
}

async function main() {
  try {
    console.log('Fetching live rates from Businessmantra...');
    const result = await syncNeonRest();
    console.log('Inserted row:', result);
  } catch (err) {
    console.error('Failed:', err.message || err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { syncNeonRest };
