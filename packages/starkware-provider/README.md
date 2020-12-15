# starkware-provider [![npm version](https://badge.fury.io/js/starkware-provider.svg)](https://badge.fury.io/js/starkware-provider)

> Starkware Provider Library

## Getting started

```js
import StarkwareWallet from '@authereum/starkware-wallet'
import StarkwareProvider from '@authereum/starkware-provider'
import * as ethers from 'ethers'

const rpcProvider = new ethers.providers.JsonRpcProvider(
  'https://ropsten.rpc.authereum.com'
)
const starkExAddress = '0x5FedCE831BD3Bdb71F938EC26f984c84f40dB477'
const mnemonic =
  'puzzle number lab sense puzzle escape glove faith strike poem acoustic picture grit struggle know tuna soul indoor thumb dune fit job timber motor'
const starkWallet = new StarkwareWallet(mnemonic, rpcProvider)

const privateKey =
  '0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773'
const signerWallet = new ethers.Wallet(privateKey, rpcProvider)
const starkProvider = new StarkwareProvider(
  starkWallet,
  signerWallet,
  starkExAddress
)

const layer = 'starkex'
const application = 'starkexdvf'
const index = '0'

const starkKey = await starkProvider.account(layer, application, index)
console.log(starkKey) // '0x017e159e246999ee9ce7d1103d5d0d52c468bcb385d202ef362de2f878162c48'
```

## Examples

Enable account:

```js
const accounts = await starkProvider.enable(layer, application, index)
```

Get stark key:

```js
const starkKey = await starkProvider.account(layer, application, index)
```

Deposit ETH:

```js
const txHash = await starkProvider.depositEth({
  amount,
  quantum,
  vaultId,
})
```

Deposit ERC20:

```js
const txHash = await starkProvider.depositErc20({
  amount,
  quantum,
  tokenAddress,
  vaultId,
})
```

Deposit ERC721:

```js
const txHash = await starkProvider.depositErc721({
  tokenId,
  tokenAddress,
  vaultId,
})
```

Withdraw ETH:

```js
const txHash = await starkProvider.withdrawEth({
  quantum,
  recipient,
})
```

Withdraw ERC20:

```js
const txHash = await starkProvider.withdrawErc20({
  tokenAddress,
  quantum,
  recipient,
})
```

Withdraw ERC721:

```js
const txHash = await starkProvider.withdrawErc721({
  tokenAddress,
  tokenId,
  recipient,
})
```

Transfer ETH:

```js
const starkSignature = await starkProvider.transferEth({
  vaultId,
  to,
  quantum,
  amount,
  nonce,
  expirationTimestamp,
  condition
}
```

Transfer ERC20:

```js
const starkSignature = await starkProvider.transferErc20({
  vaultId,
  to,
  tokenAddress,
  quantum,
  amount,
  nonce,
  expirationTimestamp,
  condition
}
```

Transfer ERC721:

```js
const starkSignature = await starkProvider.transferErc721({
  vaultId,
  to,
  tokenAddress,
  tokenId,
  nonce,
  expirationTimestamp,
  condition
}
```

Create limit order:

```js
const starkSignature = await starkProvider.createOrder({
  sell: {
    vaultId,
    amount,
    data: {
      quantum
    }
  },
  buy: {
    vaultId,
    amount,
    data: {
      quantum
    }
  },
  nonce,
  expirationTimestamp
}
```

Send transaction:

```js
const txHash = await starkProvider.sendTransaction(tx)
```

Making RPC calls:

```js
const response = await starkProvider.send('stark_deposit', {
  asset: {
    type: 'ETH',
    data: {
      quantum,
    },
  },
  amount,
  vaultId,
})
```

## WalletConnect

Using StarkWare provider on dapp side:

```js
import StarkwareProvider from '@authereum/starkware-provider'
import WalletConnect from 'walletconnect'

const wc = new WalletConnect()
const provider = StarkwareProvider.fromWalletConnect(wc)
await wc.connect()

const starkKey = await provider.account({ layer, application, index })
console.log(starkKey)

const txHash = await provider.registerUser({ ethKey, operatorSignature })
console.log(txHash)
```
