# starkware-wallet [![npm version](https://badge.fury.io/js/starkware-wallet.svg)](https://badge.fury.io/js/starkware-wallet)

> Starkware Wallet Library

## Getting started

```js
import StarkwareWallet from '@authereum/starkware-wallet'
import * as ethers from 'ethers'

const storage = {}
const store = {
  set: async (key: string, data: any) => {
    storage[key] = data
  },
  get: async (key: string) => {
    storage[key]
  },
  remove: async (key: string) => {
    delete storage[key]
  },
}

const provider = new ethers.providers.JsonRpcProvider('https://ropsten.rpc.authereum.com')
const mnemonic =
  'owner hover awake board copper fiber organ sudden nominee trick decline inflict'
const starkWallet = new StarkwareWallet(mnemonic, provider, store)

const layer = 'starkex'
const application = 'starkexdvf'
const index = '0'
const starkKey = await starkWallet.account(layer, application, index)
console.log(starkKey) // 0x03a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a
```

## Examples

Wallet from signature:

```js
const starkWallet = StarkwareWallet.fromSignature(signature, provider, store)
```

Set provider:

```js
starkWallet.setProvider(provider)
```

Get stark key:

```js
const starkKey = await starkWallet.account(layer, application, index)
console.log(starkKey) // '0x03a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a'
```
