import { readData, writeData } from '../store.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.jwt_secret || 'your-super-secret-key-change-in-production'

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return res.status(200).end()
    }

    const { id } = req.query || {}
    const data = await readData()
    data.destinations = data.destinations || []
    const destination = data.destinations.find(d => d.id === id)

    if (req.method === 'GET') {
      if (!destination) return res.status(404).json({ message: 'Destino no encontrado' })
      return res.json(destination)
    }

    // Protected methods
    const auth = req.headers.authorization || ''
    const token = auth.replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ message: 'No autorizado' })

    try {
      jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    if (req.method === 'PUT') {
      if (!destination) return res.status(404).json({ message: 'Destino no encontrado' })
      const { name, location, address, description, image, rating } = req.body || {}
      Object.assign(destination, { name, location, address, description, image, rating })
      await writeData(data)
      return res.json(destination)
    }

    if (req.method === 'DELETE') {
      data.destinations = data.destinations.filter(d => d.id !== id)
      await writeData(data)
      return res.json({ message: 'Destino eliminado' })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (err) {
    console.error('destinations [id] handler error', err)
    return res.status(500).json({ message: 'Error interno', error: err.message })
  }
}
