import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'server', 'data', 'db.json')
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here'

// Ensure db directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Load or initialize database
function loadDB() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Error loading DB:', err)
  }

  return {
    users: [],
    destinations: [],
    reservations: []
  }
}

// Save DB
function saveDB(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
  } catch (err) {
    console.error('Error saving DB:', err)
  }
}

// Verify token
function verifyToken(req) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null

  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const db = loadDB()
  const { method, body } = req
  const { reservationId, action } = req.query
  const user = verifyToken(req)

  try {
    if (action === 'status' && method === 'GET') {
      if (!user) {
        return res.status(401).json({ message: 'No autorizado' })
      }

      const reservation = db.reservations.find(r => r.id === reservationId && r.userId === user.userId)
      if (!reservation) {
        return res.status(404).json({ message: 'Reservación no encontrada' })
      }

      return res.status(200).json({
        paymentStatus: reservation.paymentStatus,
        reservationStatus: reservation.status
      })
    }

    if (method === 'POST') {
      if (!user) {
        return res.status(401).json({ message: 'No autorizado' })
      }

      const { reservationId: resId, amount, paymentMethod } = body

      if (!resId || !amount) {
        return res.status(400).json({ message: 'Faltan campos requeridos' })
      }

      const reservation = db.reservations.find(r => r.id === resId && r.userId === user.userId)
      if (!reservation) {
        return res.status(404).json({ message: 'Reservación no encontrada' })
      }

      // Simulate payment processing
      reservation.paymentStatus = 'completed'
      reservation.status = 'confirmed'
      saveDB(db)

      return res.status(200).json({
        message: 'Pago procesado exitosamente',
        paymentId: 'pay-' + Date.now(),
        status: 'completed',
        amount,
        reservation
      })
    }

    return res.status(405).json({ message: 'Método no permitido' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}
