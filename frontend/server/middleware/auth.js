const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const generateToken = (user) => {
  const payload = { userId: user.id, email: user.email }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ message: 'Token no proporcionado' })
  const token = header.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' })

  const decoded = verifyToken(token)
  if (!decoded) return res.status(401).json({ message: 'Token inválido' })

  req.user = decoded
  next()
}

module.exports = { generateToken, verifyToken, authMiddleware }
