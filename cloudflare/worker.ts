type SupportedExchangeSymbol = 'JMD' | 'USD' | 'CAD' | 'GBP' | 'EUR'

type WorkerExchangeRates = {
  USD: number
} & Record<SupportedExchangeSymbol, number>

type WorkerExchangeRateSnapshot = {
  rates: WorkerExchangeRates
  fetchedAt: string
}

export interface Env {
  EXCHANGE_RATES_KV: {
    get(key: string, type: 'json'): Promise<WorkerExchangeRateSnapshot | null>
    put(key: string, value: string): Promise<void>
  }
  OPENEXCHANGE_APP_ID: string
  CORS_ORIGIN?: string
}

const EXCHANGE_RATE_KV_KEY = 'LATEST_EXCHANGE_RATE'
const OPEN_EXCHANGE_RATES_URL = 'https://openexchangerates.org/api/latest.json'
const SUPPORTED_SYMBOLS: SupportedExchangeSymbol[] = ['JMD', 'USD', 'CAD', 'GBP', 'EUR']

function jsonResponse(body: unknown, init: ResponseInit = {}, origin = '*') {
  const headers = new Headers(init.headers)
  headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Cache-Control', 'no-store')
  headers.set('Content-Type', 'application/json; charset=utf-8')

  return new Response(JSON.stringify(body), { ...init, headers })
}

function resolveCorsOrigin(request: Request, env: Env): string {
  if (env.CORS_ORIGIN) {
    return env.CORS_ORIGIN
  }

  return request.headers.get('Origin') ?? '*'
}

function assertRates(
  rates: Partial<Record<SupportedExchangeSymbol, number>> | undefined,
): asserts rates is Record<SupportedExchangeSymbol, number> {
  if (!rates?.JMD || !rates.USD || !rates.CAD || !rates.GBP || !rates.EUR) {
    throw new Error('Open Exchange Rates response is missing one or more supported currencies.')
  }
}

async function readSnapshot(env: Env): Promise<WorkerExchangeRateSnapshot | null> {
  return (await env.EXCHANGE_RATES_KV.get(
    EXCHANGE_RATE_KV_KEY,
    'json',
  )) as WorkerExchangeRateSnapshot | null
}

async function writeSnapshot(env: Env, snapshot: WorkerExchangeRateSnapshot) {
  await env.EXCHANGE_RATES_KV.put(EXCHANGE_RATE_KV_KEY, JSON.stringify(snapshot))
}

async function fetchLatestSnapshot(env: Env): Promise<WorkerExchangeRateSnapshot> {
  if (!env.OPENEXCHANGE_APP_ID) {
    throw new Error('OPENEXCHANGE_APP_ID is not configured.')
  }

  const url = new URL(OPEN_EXCHANGE_RATES_URL)
  url.searchParams.set('app_id', env.OPENEXCHANGE_APP_ID)
  url.searchParams.set('symbols', SUPPORTED_SYMBOLS.join(','))

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Open Exchange Rates request failed with status ${response.status}.`)
  }

  const data = (await response.json()) as {
    rates?: Partial<Record<SupportedExchangeSymbol, number>>
    timestamp?: number
  }

  assertRates(data.rates)

  const snapshot: WorkerExchangeRateSnapshot = {
    rates: {
      USD: 1,
      JMD: data.rates.JMD,
      CAD: data.rates.CAD,
      GBP: data.rates.GBP,
      EUR: data.rates.EUR,
    },
    fetchedAt: new Date((data.timestamp ?? Math.floor(Date.now() / 1000)) * 1000).toISOString(),
  }

  await writeSnapshot(env, snapshot)
  return snapshot
}

async function getOrRefreshSnapshot(env: Env) {
  const cached = await readSnapshot(env)
  if (cached) {
    return cached
  }

  return fetchLatestSnapshot(env)
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message
  }

  return String(error)
}

export default {
  async fetch(request: Request, env: Env) {
    const origin = resolveCorsOrigin(request, env)
    const { pathname } = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return jsonResponse({}, { status: 204 }, origin)
    }

    if (request.method === 'GET' && pathname === '/api/exchange-rates/refresh') {
      try {
        const snapshot = await fetchLatestSnapshot(env)
        return jsonResponse(snapshot, { status: 200 }, origin)
      } catch (error) {
        const message = getErrorMessage(error)
        console.error('Manual exchange rate refresh failed:', message)
        return jsonResponse({ error: message }, { status: 502 }, origin)
      }
    }

    if (request.method !== 'GET' || pathname !== '/api/exchange-rates') {
      return jsonResponse({ error: 'Not found.' }, { status: 404 }, origin)
    }

    try {
      const snapshot = await getOrRefreshSnapshot(env)
      return jsonResponse(snapshot, { status: 200 }, origin)
    } catch (error) {
      const cached = await readSnapshot(env)
      if (cached) {
        return jsonResponse(cached, { status: 200 }, origin)
      }

      const message = error instanceof Error ? error.message : 'Unable to load exchange rates.'
      return jsonResponse({ error: message }, { status: 502 }, origin)
    }
  },

  async scheduled(_event: unknown, env: Env, ctx: { waitUntil: (arg0: Promise<WorkerExchangeRateSnapshot>) => void }) {
    ctx.waitUntil(fetchLatestSnapshot(env))
  },
}