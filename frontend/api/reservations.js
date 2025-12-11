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
  const { id } = req.query
  const user = verifyToken(req)

  try {
    if (method === 'GET') {
      if (!user) {
        return res.status(401).json({ message: 'No autorizado' })
      }

      if (id) {
        // Get single reservation
        const reservation = db.reservations.find(r => r.id === id && r.userId === user.userId)
        if (!reservation) {
          return res.status(404).json({ message: 'Reservación no encontrada' })
        }
        return res.status(200).json(reservation)
      } else {
        // List user's reservations
        const reservations = db.reservations.filter(r => r.userId === user.userId)
        return res.status(200).json(reservations)
      }
    }

    if (method === 'POST') {
      if (!user) {
        return res.status(401).json({ message: 'No autorizado' })
      }

      const { destinationId, destinationName, checkInDate, checkOutDate, totalPrice, status } = body

      if (!destinationId || !checkInDate || !checkOutDate) {
        return res.status(400).json({ message: 'Faltan campos requeridos' })
      }

      const newReservation = {
        id: 'res-' + Date.now(),
        userId: user.userId,
        destinationId,
        destinationName: destinationName || '',
        checkInDate,
        checkOutDate,
        totalPrice: totalPrice || 0,
        status: status || 'confirmed',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      }

      db.reservations.push(newReservation)
      saveDB(db)
      return res.status(201).json(newReservation)
    }

    if (method === 'PUT' && id) {
      if (!user) {
        return res.status(401).json({ message: 'No autorizado' })
      }

      const reservation = db.reservations.find(r => r.id === id && r.userId === user.userId)
      if (!reservation) {
        return res.status(404).json({ message: 'Reservación no encontrada' })
      }

      Object.assign(reservation, body)
      saveDB(db)
      return res.status(200).json({ message: 'Reservación actualizada', reservation })
    }

    if (method === 'DELETE' && id) {
      if (!user) {
        return res.status(401).json({ message: 'No autorizado' })
      }

      const idx = db.reservations.findIndex(r => r.id === id && r.userId === user.userId)
      if (idx === -1) {
        return res.status(404).json({ message: 'Reservación no encontrada' })
      }

      db.reservations.splice(idx, 1)
      saveDB(db)
      return res.status(200).json({ message: 'Reservación eliminada' })
    }

    return res.status(405).json({ message: 'Método no permitido' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}
