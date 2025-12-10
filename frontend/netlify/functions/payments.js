import { Server, Networks, TransactionBuilder, Operation, Keypair, Asset } from 'stellar-sdk'
import { verifyJWT, unauthorized } from './jwt-verify.js'
import { readData, writeData } from './store.js'

const HORIZON_URL = 'https://horizon-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET

export default async (req, context) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

    const user = verifyJWT(req)
    if (!user) return unauthorized()

    const { destination, amountStroops } = await req.json()
    if (!destination || !amountStroops) {
      return new Response(JSON.stringify({ message: 'destination y amountStroops requeridos' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Try to get secret from environment (for server-side signing)
    const secret = process.env.STELLAR_SEED
    if (!secret) {
      // If no server-side secret, return instructions for client-side signing with Freighter
      return new Response(JSON.stringify({
        message: 'Use client-side signing with Freighter',
        instructions: 'Sign and submit the transaction using Freighter wallet on client side',
        destination,
        amountStroops
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // Server-side signing (if STELLAR_SEED is set)
    try {
      const sourceKeypair = Keypair.fromSecret(secret)
      const server = new Server(HORIZON_URL)
      const account = await server.loadAccount(sourceKeypair.publicKey())

      const tx = new TransactionBuilder(account, {
        fee: 100,
        networkPassphrase: NETWORK_PASSPHRASE
      })
        .addOperation(Operation.payment({
          destination,
          asset: Asset.native(),
          amount: (amountStroops / 10000000).toString()
        }))
        .setTimeout(30)
        .build()

      tx.sign(sourceKeypair)

      const submitted = await server.submitTransaction(tx)
      console.log('Transaction submitted:', submitted.hash)

      // Update reservation payment status if associated
      const data = await readData()
      const reservation = (data.reservations || []).find(r => r.userId === user.userId && r.paymentStatus === 'pending')
      if (reservation) {
        reservation.paymentStatus = 'completed'
        reservation.txHash = submitted.hash
        await writeData(data)
      }

      return new Response(JSON.stringify({
        message: 'Transaction submitted successfully',
        hash: submitted.hash,
        ledger: submitted.ledger
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
      console.error('Stellar signing error:', err)
      return new Response(JSON.stringify({
        message: 'Error submitting transaction',
        details: err.message
      }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
  } catch (err) {
    console.error('payments error', err)
    return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
