import { readData } from './store.js'

export default async (req, context) => {
  try {
    if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })
    const data = await readData()
    const dests = data.destinations || []
    return new Response(JSON.stringify(dests), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('destinations error', err)
    return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500 })
  }
}
