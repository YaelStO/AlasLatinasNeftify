import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { readData, writeData } from './store.js'

// Get JWT_SECRET from environment or use a default for development
// For production: Set JWT_SECRET env var in Vercel Dashboard
const JWT_SECRET = process.env.JWT_SECRET || process.env.jwt_secret || 'your-super-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export default async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' })
    }

    const { name, email, password, phone, birthDate, gender } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password y name son requeridos' })
    }

    const data = await readData()
    const existing = (data.users || []).find(u => u.email === email)
    if (existing) {
      return res.status(409).json({ message: 'Email ya registrado' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const id = nanoid()
    const user = {
      id,
      name,
      email,
      password: hashed,
      phone: phone || null,
      birthDate: birthDate || null,
      gender: gender || null,
      wallet_address: null,
      createdAt: new Date().toISOString()
    }

    data.users = data.users || []
    data.users.push(user)
    await writeData(data)

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        gender: user.gender
      }
    })
  } catch (err) {
    console.error('register error', err)
    return res.status(500).json({ message: 'Error interno: ' + err.message })
  }
}
