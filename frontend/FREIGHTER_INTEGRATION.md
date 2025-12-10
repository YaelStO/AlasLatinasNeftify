# Freighter Wallet Integration for Payments

## Overview
This app uses **Freighter** (a Stellar wallet browser extension) to sign and submit payments directly from the client side. This is more secure than server-side signing and gives users full control over their transactions.

## How it works

1. **User connects Freighter wallet** via the frontend UI (e.g., Wallet page or payment dialog).
2. **User initiates a payment** on a destination (amount in stroops).
3. **Frontend builds the transaction** using `stellar-sdk` and asks Freighter to sign it.
4. **Freighter shows the transaction** to the user for approval.
5. **User signs** in Freighter (password prompt if needed).
6. **Frontend submits** the signed transaction to Horizon Testnet.
7. **Payment is recorded** in the app (optional: notify backend to update reservation status).

## Client-side signing example (Vue 3)

```javascript
import { Keypair, TransactionBuilder, Operation, Asset, Networks, Server } from 'stellar-sdk'

// Install Freighter extension first
// https://www.freighter.app/

export async function signPaymentWithFreighter(destinationAddress, amountStroops) {
  try {
    // Connect to Freighter (user must approve connection)
    const publicKey = await window.freighter.getPublicKey()
    console.log('Connected wallet:', publicKey)

    // Build transaction
    const server = new Server('https://horizon-testnet.stellar.org')
    const sourceAccount = await server.loadAccount(publicKey)

    const tx = new TransactionBuilder(sourceAccount, {
      fee: 100,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(Operation.payment({
        destination: destinationAddress,
        asset: Asset.native(),
        amount: (amountStroops / 10000000).toString()
      }))
      .setTimeout(30)
      .build()

    // Sign with Freighter
    const { signedXDR } = await window.freighter.signTransaction(tx.toXDR(), {
      network: Networks.TESTNET,
      accountToSign: publicKey
    })

    // Submit to Horizon
    const txObj = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)
    const submitResponse = await server.submitTransaction(txObj)

    console.log('Payment successful:', submitResponse.hash)
    return submitResponse.hash
  } catch (err) {
    console.error('Freighter payment error:', err)
    throw err
  }
}
```

## Testing with provided keys

If you want to test **server-side signing** (e.g., with a pre-funded test account), set:
- Environment variable: `STELLAR_SEED=S...` (your test account secret key)
- The payments function will use it to sign transactions server-side.

Otherwise, leave `STELLAR_SEED` unset and the app will prompt users to sign with Freighter.

## Notes

- **Security**: Freighter keeps private keys in the browser extension; the app never sees the secret key.
- **User experience**: Users must approve each transaction, but it's safer and more transparent.
- **Testing**: Use Testnet public keys + Friendbot for free test funds.
- **Production**: Use mainnet with caution; ensure proper key management and fund recovery procedures.
