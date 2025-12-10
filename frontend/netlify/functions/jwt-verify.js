import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production'

export function verifyJWT(req) {
  const header = req.headers.authorization
  if (!header) return null
  
  const token = header.split(' ')[1]
  if (!token) return null
  
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

export function unauthorized() {
  return new Response(JSON.stringify({ message: 'Token inválido o no proporcionado' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  })
}
