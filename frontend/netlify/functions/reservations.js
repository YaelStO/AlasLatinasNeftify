import { readData, writeData } from './store.js'
import { verifyJWT, unauthorized } from './jwt-verify.js'
import { nanoid } from 'nanoid'

export default async (req, context) => {
  try {
    const user = verifyJWT(req)
    if (!user) return unauthorized()

    const data = await readData()

    if (req.method === 'GET') {
      // List user's reservations
      const reservations = (data.reservations || []).filter(r => r.userId === user.userId)
      return new Response(JSON.stringify(reservations), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    if (req.method === 'POST') {
      // Create reservation
      const { destinationId, destinationName, checkInDate, checkOutDate, totalPrice } = await req.json()
      if (!destinationId || !destinationName) return new Response(JSON.stringify({ message: 'destinationId y destinationName requeridos' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

      const reservation = {
        id: 'res-' + nanoid(),
        userId: user.userId,
        destinationId,
        destinationName,
        checkInDate: checkInDate || null,
        checkOutDate: checkOutDate || null,
        totalPrice: totalPrice || 0,
        status: 'confirmed',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      }
      data.reservations = data.reservations || []
      data.reservations.push(reservation)
      await writeData(data)
      return new Response(JSON.stringify({ message: 'Reserva creada', reservation }), { status: 201, headers: { 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PUT') {
      // Update reservation status
      const { reservationId, status, paymentStatus } = await req.json()
      if (!reservationId) return new Response(JSON.stringify({ message: 'reservationId requerido' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

      const reservation = (data.reservations || []).find(r => r.id === reservationId && r.userId === user.userId)
      if (!reservation) return new Response(JSON.stringify({ message: 'Reserva no encontrada' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

      if (status) reservation.status = status
      if (paymentStatus) reservation.paymentStatus = paymentStatus
      await writeData(data)
      return new Response(JSON.stringify({ message: 'Reserva actualizada', reservation }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    if (req.method === 'DELETE') {
      // Delete reservation
      const { reservationId } = await req.json()
      if (!reservationId) return new Response(JSON.stringify({ message: 'reservationId requerido' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

      const idx = (data.reservations || []).findIndex(r => r.id === reservationId && r.userId === user.userId)
      if (idx === -1) return new Response(JSON.stringify({ message: 'Reserva no encontrada' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

      data.reservations.splice(idx, 1)
      await writeData(data)
      return new Response(JSON.stringify({ message: 'Reserva eliminada' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response('Method not allowed', { status: 405 })
  } catch (err) {
    console.error('reservations error', err)
    return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
