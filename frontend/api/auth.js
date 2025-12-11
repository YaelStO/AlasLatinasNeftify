import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcryptjs from 'bcryptjs'
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

  // Initialize with default data
  return {
    users: [{
      id: '1',
      name: 'User Demo',
      email: 'demo@example.com',
      password: bcryptjs.hashSync('password123', 10),
      phone: '+1234567890',
      birthDate: '1990-01-01',
      gender: 'other',
      wallet_address: null,
      createdAt: new Date().toISOString()
    }],
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
  const { method, body, query } = req

  try {
    const pathArray = req.url.split('/')
    const action = pathArray[pathArray.length - 1]

    if (action === 'register' && method === 'POST') {
      const { name, email, password, phone, birthDate, gender } = body

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' })
      }

      // Check if user exists
      if (db.users.some(u => u.email === email)) {
        return res.status(400).json({ message: 'El email ya está registrado' })
      }

      const newUser = {
        id: 'user-' + Date.now(),
        name,
        email,
        password: bcryptjs.hashSync(password, 10),
        phone: phone || null,
        birthDate: birthDate || null,
        gender: gender || null,
        wallet_address: null,
        createdAt: new Date().toISOString()
      }

      db.users.push(newUser)
      saveDB(db)

      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      return res.status(201).json({
        message: 'Usuario registrado',
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
      })
    }

    if (action === 'login' && method === 'POST') {
      const { email, password } = body

      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' })
      }

      const user = db.users.find(u => u.email === email)

      if (!user || !bcryptjs.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Email o contraseña incorrectos' })
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      return res.status(200).json({
        message: 'Login exitoso',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      })
    }

    if (action === 'me' && method === 'GET') {
      const token = req.headers.authorization?.split(' ')[1]

      if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' })
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        const user = db.users.find(u => u.id === decoded.userId)

        if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        return res.status(200).json({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          birthDate: user.birthDate,
          gender: user.gender,
          wallet_address: user.wallet_address
        })
      } catch (error) {
        return res.status(401).json({ message: 'Token inválido' })
      }
    }

    return res.status(405).json({ message: 'Método no permitido' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}
