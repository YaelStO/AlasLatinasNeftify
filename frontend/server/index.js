import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import destinationRoutes from './routes/destinations.js'
import reservationRoutes from './routes/reservations.js'
import paymentRoutes from './routes/payments.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/destinations', destinationRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/payments', paymentRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
})
