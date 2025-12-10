import bcrypt from 'bcryptjs'
import { readData, writeData } from './store.js'
import { verifyJWT, unauthorized } from './jwt-verify.js'

export default async (req, context) => {
  try {
    const user = verifyJWT(req)
    if (!user) return unauthorized()

    const data = await readData()
    const currentUser = (data.users || []).find(u => u.id === user.userId)
    if (!currentUser) return new Response(JSON.stringify({ message: 'Usuario no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

    if (req.method === 'GET') {
      // Get profile
      return new Response(JSON.stringify({ id: currentUser.id, name: currentUser.name, email: currentUser.email, phone: currentUser.phone, birthDate: currentUser.birthDate, gender: currentUser.gender, wallet_address: currentUser.wallet_address }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PUT') {
      // Update profile
      const { name, email, phone, password } = await req.json()
      if (name) currentUser.name = name
      if (email) currentUser.email = email
      if (phone) currentUser.phone = phone
      if (password) currentUser.password = await bcrypt.hash(password, 10)
      await writeData(data)
      return new Response(JSON.stringify({ message: 'Perfil actualizado', user: { id: currentUser.id, name: currentUser.name, email: currentUser.email, phone: currentUser.phone, birthDate: currentUser.birthDate, gender: currentUser.gender, wallet_address: currentUser.wallet_address } }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    if (req.method === 'DELETE') {
      // Delete user
      data.users = (data.users || []).filter(u => u.id !== user.userId)
      await writeData(data)
      return new Response(JSON.stringify({ message: 'Usuario eliminado' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    if (req.method === 'POST') {
      // Link wallet
      const { walletAddress } = await req.json()
      if (!walletAddress) return new Response(JSON.stringify({ message: 'Wallet address requerido' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      currentUser.wallet_address = walletAddress
      await writeData(data)
      return new Response(JSON.stringify({ message: 'Wallet vinculada', user: { id: currentUser.id, name: currentUser.name, email: currentUser.email, wallet_address: currentUser.wallet_address } }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response('Method not allowed', { status: 405 })
  } catch (err) {
    console.error('profile error', err)
    return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
