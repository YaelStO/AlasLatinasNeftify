import express from 'express'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { Server, Networks, TransactionBuilder, Operation, Keypair, Asset } from 'stellar-sdk'
import { db } from '../utils/database'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// Helper: get the secret seed using soroban CLI
function getSecretFromIdentity() {
  try {
    const sorobanPath = process.env.SOROBAN_PATH || path.join(process.env.HOME || '.', '.cargo', 'bin', 'soroban')
    // soroban keys secret <identity> returns the secret seed (S...)
    const output = execSync(`"${sorobanPath}" keys secret testsrc`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
    }).trim()
    
    if (output && output.startsWith('S')) {
      console.log('Successfully retrieved secret from soroban identity')
      return output
    }
  } catch (e) {
    console.warn('Could not retrieve secret from soroban identity:', e.message)
  }
  
  // Fallback: check environment variable
  if (process.env.STELLAR_SEED && process.env.STELLAR_SEED.length > 0) {
    return process.env.STELLAR_SEED
  }
  
  return null
}

// POST /api/payments
// body: { destination: <G...>, amountStroops: <number> }  (amount in stroops)
router.post('/', authMiddleware, async (req, res) => {
  const { destination, amountStroops } = req.body
  if (!destination || !amountStroops) return res.status(400).json({ message: 'destination and amountStroops required' })

  const secret = getSecretFromIdentity()
  if (!secret) return res.status(500).json({ message: 'No source seed found. Make sure soroban identity testsrc exists or set STELLAR_SEED environment variable' })

  try {
    console.log('Using stellar-sdk with secret key from soroban identity')
    const sourceKeypair = Keypair.fromSecret(secret)
    console.log('Source account public key:', sourceKeypair.publicKey())
    
    const server = new Server('https://horizon-testnet.stellar.org')
    const account = await server.loadAccount(sourceKeypair.publicKey())
    console.log('Loaded account, sequence:', account.sequence)

    const tx = new TransactionBuilder(account, {
      fee: 100,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(Operation.payment({
        destination,
        asset: Asset.native(),
        amount: (amountStroops / 10000000).toString()
      }))
      .setTimeout(30)
      .build()

    console.log('Transaction built, signing...')
    tx.sign(sourceKeypair)

    console.log('Submitting transaction...')
    const submitted = await server.submitTransaction(tx)
    console.log('Transaction submitted successfully:', submitted.hash)
    
    return res.json({ 
      message: 'Transaction submitted successfully', 
      hash: submitted.hash,
      ledger: submitted.ledger,
      envelope_xdr: submitted.envelope_xdr
    })
  } catch (err) {
    console.error('Error submitting payment:', err.message)
    console.error('Full error:', err)
    
    let errorMsg = err.message
    let errorDetails = null
    
    // Extract meaningful error from Horizon response
    if (err.response && err.response.data) {
      errorDetails = err.response.data
      if (err.response.data.extras && err.response.data.extras.result_codes) {
        errorMsg = JSON.stringify(err.response.data.extras.result_codes)
      }
    }
    
    res.status(500).json({ 
      message: 'Error submitting transaction', 
      details: errorMsg,
      error_details: errorDetails
    })
  }
})

export default router
