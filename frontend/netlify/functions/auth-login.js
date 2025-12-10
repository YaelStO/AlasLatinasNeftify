import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readData } from './store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export default async (req, context) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    const { email, password } = await req.json()
    if (!email || !password) return new Response(JSON.stringify({ message: 'Email y password son requeridos' }), { status: 400 })

    const data = await readData()
    const user = (data.users || []).find(u => u.email === email)
    if (!user) return new Response(JSON.stringify({ message: 'Email o password incorrecto' }), { status: 401 })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return new Response(JSON.stringify({ message: 'Email o password incorrecto' }), { status: 401 })

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    return new Response(JSON.stringify({ message: 'Login exitoso', token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, birthDate: user.birthDate, gender: user.gender } }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('login error', err)
    return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500 })
  }
}
