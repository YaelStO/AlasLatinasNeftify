const express = require('express')
const fs = require('fs')
const path = require('path')
const { Server, Networks, TransactionBuilder, Operation, Keypair, Asset } = require('stellar-sdk')
const { db } = require('../utils/database')

const router = express.Router()

// Helper: read seed from identity file (test/dev only). If environment variable STELLAR_SEED is set, use it instead.
function getSeed() {
  if (process.env.STELLAR_SEED && process.env.STELLAR_SEED.length > 0) return process.env.STELLAR_SEED
  try {
    const idPath = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.config', 'stellar', 'identity', 'testsrc.toml')
    if (fs.existsSync(idPath)) {
      const raw = fs.readFileSync(idPath, 'utf8')
      const m = raw.match(/seed_phrase\s*=\s*"([^"]+)"/)
      if (m) return m[1]
    }
  } catch (e) {
    console.warn('Could not read local identity file', e && e.message)
  }
  return null
}

// POST /api/payments
// body: { destination: <G...>, amountStroops: <number> }  (amount in stroops)
router.post('/', async (req, res) => {
  const { destination, amountStroops } = req.body
  if (!destination || !amountStroops) return res.status(400).json({ message: 'destination and amountStroops required' })

  const seed = getSeed()
  if (!seed) return res.status(500).json({ message: 'No source seed configured on server. Set STELLAR_SEED or put identity in ~/.config/stellar/identity/testsrc.toml' })

  try {
    // If the seed is an S... secret seed, use stellar-sdk to sign and submit
    if (seed.startsWith('S')) {
      const sourceKeypair = Keypair.fromSecret(seed)
      const server = new Server('https://horizon-testnet.stellar.org')
      const account = await server.loadAccount(sourceKeypair.publicKey())

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

      tx.sign(sourceKeypair)
      const submitted = await server.submitTransaction(tx)
      return res.json({ message: 'Transaction submitted', hash: submitted.hash, submitted })
    }

    // Otherwise, try to use soroban CLI (identity alias saved) to build/sign/send the tx.
    // This requires soroban CLI to be installed and the identity alias (testsrc) configured.
    const { execFile } = require('child_process')
    const sorobanPath = process.env.SOROBAN_PATH || path.join(process.env.HOME || '.', '.cargo', 'bin', 'soroban')
    // amount in stroops: pass as number
    const args = [
      'tx', 'new', 'payment',
      '--source-account', 'testsrc',
      '--destination', destination,
      '--amount', String(amountStroops),
      '--rpc-url', 'https://soroban-testnet.stellar.org',
      '--network-passphrase', 'Test SDF Network ; September 2015'
    ]

    execFile(sorobanPath, args, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('soroban CLI error', error, stderr)
        return res.status(500).json({ message: 'Error invoking soroban CLI', details: stderr || error.message })
      }

      // Try to extract a tx hash from stdout or stderr. soroban prints the tx hash in returned Horizon records
      const out = stdout + '\n' + stderr
      const m = out.match(/hash\":?\s*\"([0-9a-f]{64})\"/i) || out.match(/Transactions?\s+submitted.*\n.*hash[:\s]+([0-9a-f]{64})/i) || out.match(/hash\s*:\s*([0-9a-f]{64})/i)
      if (m) {
        return res.json({ message: 'Transaction submitted via soroban CLI', hash: m[1], raw: out })
      }

      // Fallback: return the raw output and let client inspect
      return res.json({ message: 'soroban CLI executed (check logs)', raw: out })
    })
  } catch (err) {
    console.error('Error submitting payment', err)
    const msg = err.response && err.response.data ? err.response.data : (err.message || String(err))
    res.status(500).json({ message: 'Error submitting transaction', details: msg })
  }
})

module.exports = router
