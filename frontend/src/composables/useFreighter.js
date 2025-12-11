import { ref } from 'vue'
import { Keypair, TransactionBuilder, Operation, Asset, Networks, Server } from '@stellar/stellar-sdk'

export function useFreighter() {
  const isConnected = ref(false)
  const publicKey = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isFreighterInstalled = () => {
    return !!window.freighter
  }

  const connectFreighter = async () => {
    try {
      loading.value = true
      error.value = null

      if (!isFreighterInstalled()) {
        throw new Error('Freighter no está instalado. Descárgalo desde https://www.freighter.app/')
      }

      const key = await window.freighter.getPublicKey()
      publicKey.value = key
      isConnected.value = true
      return key
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signPayment = async (options) => {
    const {
      destination,
      amount, // en XLM
      assetCode = 'native', // 'native' o código del asset (p.ej. 'USDC')
      issuer = null // solo si no es native
    } = options

    try {
      loading.value = true
      error.value = null

      if (!isConnected.value || !publicKey.value) {
        throw new Error('Necesitas conectar Freighter primero')
      }

      // Use horizon endpoint from env or default to testnet
      const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org'
      // Create transaction
      const server = new Server(HORIZON_URL)
      const sourceAccount = await server.loadAccount(publicKey.value)

      const asset = assetCode === 'native' 
        ? Asset.native() 
        : new Asset(assetCode, issuer)

      const txBuilder = new TransactionBuilder(sourceAccount, {
        fee: 100,
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(Operation.payment({
          destination,
          asset,
          amount: String(amount)
        }))
        .setTimeout(30)

      const tx = txBuilder.build()

      // Sign with Freighter
      const { signedXDR } = await window.freighter.signTransaction(
        tx.toXDR(),
        {
          network: Networks.TESTNET,
          accountToSign: publicKey.value
        }
      )

      // Submit to Horizon
      const txObj = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)
      const submitResponse = await server.submitTransaction(txObj)

      return {
        success: true,
        hash: submitResponse.hash,
        xdr: signedXDR
      }
    } catch (err) {
      error.value = err.message || 'Error al firmar la transacción'
      throw err
    } finally {
      loading.value = false
    }
  }

  const signCustomTransaction = async (xdr) => {
    try {
      loading.value = true
      error.value = null

      if (!isConnected.value || !publicKey.value) {
        throw new Error('Necesitas conectar Freighter primero')
      }

      const { signedXDR } = await window.freighter.signTransaction(
        xdr,
        {
          network: Networks.TESTNET,
          accountToSign: publicKey.value
        }
      )

      return signedXDR
    } catch (err) {
      error.value = err.message || 'Error al firmar la transacción'
      throw err
    } finally {
      loading.value = false
    }
  }

  const disconnect = () => {
    isConnected.value = false
    publicKey.value = null
    error.value = null
  }

  return {
    isConnected,
    publicKey,
    loading,
    error,
    isFreighterInstalled,
    connectFreighter,
    signPayment,
    signCustomTransaction,
    disconnect
  }
}
