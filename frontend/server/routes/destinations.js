const express = require('express')
const { authMiddleware } = require('../middleware/auth.js')
const { db } = require('../utils/database.js')

const router = express.Router()

// Listar todos los destinos
router.get('/', (req, res) => {
  const { search } = req.query
  
  let dests = db.listDestinations()
  
  // Filtro de búsqueda
  if (search) {
    const query = search.toLowerCase()
    dests = dests.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.location.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query)
    )
  }
  
  res.json(dests)
})

// Obtener destino por ID
router.get('/:id', (req, res) => {
  const destination = db.findDestinationById(req.params.id)
  
  if (!destination) {
    return res.status(404).json({ message: 'Destino no encontrado' })
  }
  
  res.json(destination)
})

// Crear destino (protegido)
router.post('/', authMiddleware, (req, res) => {
  const { name, location, address, description, rating } = req.body
  
  if (!name || !location || !address || !description) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' })
  }
  
  const destination = db.createDestination({
    name,
    location,
    address,
    description,
    rating: rating || 5
  })
  
  res.status(201).json(destination)
})

// Actualizar destino (protegido)
router.put('/:id', authMiddleware, (req, res) => {
  const { name, location, address, description, rating } = req.body
  
  const destination = db.updateDestination(req.params.id, {
    name,
    location,
    address,
    description,
    rating
  })
  
  if (!destination) {
    return res.status(404).json({ message: 'Destino no encontrado' })
  }
  
  res.json({
    message: 'Destino actualizado',
    destination
  })
})

// Eliminar destino (protegido)
router.delete('/:id', authMiddleware, (req, res) => {
  db.deleteDestination(req.params.id)
  res.json({ message: 'Destino eliminado' })
})

// Agregar comentario (protegido)
router.post('/:id/comments', authMiddleware, (req, res) => {
  const { text, rating } = req.body
  const destination = db.findDestinationById(req.params.id)
  
  if (!destination) {
    return res.status(404).json({ message: 'Destino no encontrado' })
  }
  
  const comment = {
    id: 'comment-' + Date.now(),
    userId: req.user.userId,
    text,
    rating,
    createdAt: new Date()
  }
  
  if (!destination.reviews) destination.reviews = []
  destination.reviews.push(comment)
  
  // Recalcular rating promedio
  if (destination.reviews.length > 0) {
    const avgRating = destination.reviews.reduce((sum, r) => sum + r.rating, 0) / destination.reviews.length
    destination.rating = Math.round(avgRating * 10) / 10
  }
  
  res.status(201).json({
    message: 'Comentario agregado',
    comment
  })
})

module.exports = router
