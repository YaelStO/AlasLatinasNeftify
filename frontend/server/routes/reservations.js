import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../utils/database.js'

const router = express.Router()

// Listar reservas del usuario autenticado
router.get('/', authMiddleware, (req, res) => {
  const reservations = db.listReservationsByUser(req.user.userId)
  res.json(reservations)
})

// Obtener una reserva específica
router.get('/:id', authMiddleware, (req, res) => {
  const reservation = db.findReservationById(req.params.id)
  
  if (!reservation) {
    return res.status(404).json({ message: 'Reserva no encontrada' })
  }
  
  // Verificar que la reserva pertenece al usuario
  if (reservation.userId !== req.user.userId) {
    return res.status(403).json({ message: 'No autorizado' })
  }
  
  res.json(reservation)
})

// Crear reserva
router.post('/', authMiddleware, (req, res) => {
  const { destinationId, checkInDate, checkOutDate, totalPrice } = req.body
  
  if (!destinationId || !checkInDate || !checkOutDate || !totalPrice) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' })
  }
  
  const destination = db.findDestinationById(destinationId)
  if (!destination) {
    return res.status(404).json({ message: 'Destino no encontrado' })
  }
  
  const reservation = db.createReservation({
    userId: req.user.userId,
    destinationId,
    destinationName: destination.name,
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
    totalPrice
  })
  
  res.status(201).json({
    message: 'Reserva creada',
    reservation
  })
})

// Obtener estado de reserva
router.get('/:id/status', authMiddleware, (req, res) => {
  const reservation = db.findReservationById(req.params.id)
  
  if (!reservation) {
    return res.status(404).json({ message: 'Reserva no encontrada' })
  }
  
  if (reservation.userId !== req.user.userId) {
    return res.status(403).json({ message: 'No autorizado' })
  }
  
  res.json({
    id: reservation.id,
    status: reservation.status,
    paymentStatus: reservation.paymentStatus,
    destinationName: reservation.destinationName,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
    totalPrice: reservation.totalPrice
  })
})

// Procesar pago
router.post('/:id/pay', authMiddleware, (req, res) => {
  const { cardNumber, expiryDate, cvv } = req.body
  
  if (!cardNumber || !expiryDate || !cvv) {
    return res.status(400).json({ message: 'Datos de tarjeta incompletos' })
  }
  
  // Validar tarjeta (simulado)
  if (cardNumber.length !== 16 || cvv.length !== 3) {
    return res.status(400).json({ message: 'Datos de tarjeta inválidos' })
  }
  
  const reservation = db.findReservationById(req.params.id)
  
  if (!reservation) {
    return res.status(404).json({ message: 'Reserva no encontrada' })
  }
  
  if (reservation.userId !== req.user.userId) {
    return res.status(403).json({ message: 'No autorizado' })
  }
  
  if (reservation.paymentStatus === 'completed') {
    return res.status(400).json({ message: 'La reserva ya está pagada' })
  }
  
  // Simular procesamiento de pago
  db.updatePaymentStatus(req.params.id, 'completed')
  
  res.json({
    message: 'Pago procesado exitosamente',
    paymentStatus: 'completed',
    amount: reservation.totalPrice,
    reservation: db.findReservationById(req.params.id)
  })
})

// Cancelar reserva
router.post('/:id/cancel', authMiddleware, (req, res) => {
  const reservation = db.findReservationById(req.params.id)
  
  if (!reservation) {
    return res.status(404).json({ message: 'Reserva no encontrada' })
  }
  
  if (reservation.userId !== req.user.userId) {
    return res.status(403).json({ message: 'No autorizado' })
  }
  
  if (reservation.status === 'cancelled') {
    return res.status(400).json({ message: 'La reserva ya está cancelada' })
  }
  
  db.updateReservationStatus(req.params.id, 'cancelled')
  
  res.json({
    message: 'Reserva cancelada',
    reservation: db.findReservationById(req.params.id)
  })
})

export default router
