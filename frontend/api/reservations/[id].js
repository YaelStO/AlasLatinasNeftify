import { readData } from '../store.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.jwt_secret || 'your-super-secret-key-change-in-production'

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return res.status(200).end()
    }

    const { id } = req.query || {}
    const auth = req.headers.authorization || ''
    const token = auth.replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ message: 'No autorizado' })

    let payload
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    const userId = payload.userId || payload.sub || null
    if (!userId) return res.status(401).json({ message: 'Token inválido' })

    const data = await readData()
    const reservation = (data.reservations || []).find(r => r.id === id)
    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' })
    if (reservation.userId !== userId) return res.status(403).json({ message: 'No autorizado' })

    return res.json(reservation)
  } catch (err) {
    console.error('reservations [id] handler error', err)
    return res.status(500).json({ message: 'Error interno', error: err.message })
  }
}
