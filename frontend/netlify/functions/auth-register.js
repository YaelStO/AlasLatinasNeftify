import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { readData, writeData } from './store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export default async (req, context) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    const body = await req.json()
    const { name, email, password, phone, birthDate, gender } = body
    if (!email || !password || !name) return new Response(JSON.stringify({ message: 'Email, password y name son requeridos' }), { status: 400 })

    const data = await readData()
    const existing = (data.users || []).find(u => u.email === email)
    if (existing) return new Response(JSON.stringify({ message: 'Email ya registrado' }), { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const id = nanoid()
    const user = { id, name, email, password: hashed, phone: phone || null, birthDate: birthDate || null, gender: gender || null, wallet_address: null, createdAt: new Date().toISOString() }
    data.users = data.users || []
    data.users.push(user)
    await writeData(data)

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    return new Response(JSON.stringify({ message: 'Usuario registrado exitosamente', token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, birthDate: user.birthDate, gender: user.gender } }), { status: 201, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('register error', err)
    return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500 })
  }
}
