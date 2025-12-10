import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readData } from './store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production'
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

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son requeridos' })
    }

    const data = await readData()
    const user = (data.users || []).find(u => u.email === email)

    if (!user) {
      return res.status(401).json({ message: 'Email o password incorrecto' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Email o password incorrecto' })
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    return res.status(200).json({
      message: 'Login exitoso',
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
    console.error('login error', err)
    return res.status(500).json({ message: 'Error interno: ' + err.message })
  }
}
