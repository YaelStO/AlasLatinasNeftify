const express = require('express')
const bcrypt = require('bcryptjs')
const { generateToken, authMiddleware } = require('../middleware/auth.js')
const { db } = require('../utils/database.js')

const router = express.Router()

// Registro
router.post('/register', async (req, res) => {
  const { name, email, password, phone, birthDate, gender } = req.body
  
  // Validaciones
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password y name son requeridos' })
  }
  
  // Verificar si el usuario ya existe
  if (db.findUserByEmail(email)) {
    return res.status(409).json({ message: 'Email ya registrado' })
  }
  
  // Hashear contraseña
  const hashed = await bcrypt.hash(password, 10)
  
  // Crear usuario
  const user = db.createUser({
    name,
    email,
    password: hashed,
    phone,
    birthDate,
    gender
  })
  
  // Generar token
  const token = generateToken(user)
  
  res.status(201).json({
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
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y password son requeridos' })
  }
  
  const user = db.findUserByEmail(email)
  
  if (!user) {
    return res.status(401).json({ message: 'Email o password incorrecto' })
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ message: 'Email o password incorrecto' })
  
  const token = generateToken(user)
  
  res.json({
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
})

// Obtener perfil (protegido)
router.get('/profile', authMiddleware, (req, res) => {
  const user = db.findUserById(req.user.userId)
  
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }
  
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    birthDate: user.birthDate,
    gender: user.gender
  })
})

// Actualizar perfil (protegido)
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, email, phone, password } = req.body
  
  const updates = {}
  if (name) updates.name = name
  if (email) updates.email = email
  if (phone) updates.phone = phone
  if (password) updates.password = await bcrypt.hash(password, 10)
  
  const user = db.updateUser(req.user.userId, updates)
  
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }
  
  res.json({
    message: 'Perfil actualizado',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender
    }
  })
})

// Eliminar usuario (protegido)
router.delete('/profile', authMiddleware, (req, res) => {
  db.deleteUser(req.user.userId)
  res.json({ message: 'Usuario eliminado' })
})

// Vincular wallet (protegido)
router.post('/link-wallet', authMiddleware, (req, res) => {
  const { walletAddress, network } = req.body

  if (!walletAddress) {
    return res.status(400).json({ message: 'Wallet address es requerido' })
  }

  const user = db.updateUser(req.user.userId, {
    wallet_address: walletAddress
  })

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }

  res.json({
    message: 'Wallet vinculada exitosamente',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      gender: user.gender,
      wallet_address: user.wallet_address
    }
  })
})

module.exports = router

