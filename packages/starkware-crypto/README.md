# starkware-crypto [![npm version](https://badge.fury.io/js/starkware-crypto.svg)](https://badge.fury.io/js/starkware-crypto)

> Starkware Crypto Library

## Description

This library is a port from [starkex-resources/\*\*/signature.js](https://github.com/starkware-libs/starkex-resources/blob/master/crypto/starkware/crypto/signature/signature.js).

## Examples

Derive path:

```js
const mnemonic =
  'puzzle number lab sense puzzle escape glove faith strike poem acoustic picture grit struggle know tuna soul indoor thumb dune fit job timber motor'
const layer = 'starkex'
const application = 'starkexdvf'
const zeroAddress = '0x0000000000000000000000000000000000000000'
const index = '0'

const path = getAccountPath(
  layer,
  application,
  zeroAddress,
  index
)
```

Derive key pair:

```js
const keyPair = getKeyPairFromPath(mnemonic, path)
```

Public key:

```js
const compressed = true
const pubKey = getPublic(keyPair, compressed)
```

Public key X coordinate:

```js
const x = getXCoordinate(pubKey)
```

Public key Y coordinate:

```js
const y = getYCoordinate(pubKey)
```

Transfer message hash:

```js
const msgHash = getTransferMsgHash(
  amount, // (uint63 decimal str)
  nonce, // (uint31)
  senderVaultId, // (uint31)
  token, // (hex str with 0x prefix < prime)
  targetVaultId, // (uint31)
  targetPublicKey, // (hex str with 0x prefix < prime)
  expirationTimestamp, // (uint22)
  condition // (hex str with 0x prefix < prime)
)
```

Verify signature:

```js
const msgSignature = starkwareCrypto.sign(keyPair, msgHash)
assert(starkwareCrypto.verify(publicKey, msgHash, msgSignature))
```

ETH asset type:

```js
const asset = {
  type: 'ETH',
  data: {
    quantum: '1'
  }
}
console.log(getAssetType(asset)) // '0x01142460171646987f20c714eda4b92812b22b811f56f27130937c267e29bd9e'
```

ERC20 asset type:

```js
const asset = {
  type: 'ERC20',
  data: {
    quantum: '10000',
    tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
}
console.log(getAssetType(asset)) // '0x0352386d5b7c781d47ecd404765307d74edc4d43b0490b8e03c71ac7a7429653'
```

ERC721 asset type:

```js
const asset = {
  type: 'ERC721',
  data: {
    tokenId: '4100',
    tokenAddress: '0xB18ed4768F87b0fFAb83408014f1caF066b91380'
  }
}
console.log(getAssetType(asset)) // '0x020c0e279ea2e027258d3056f34eca6e47ad9aaa995b896cafcb68d5a65b115b'
```

ETH asset ID:

```js
const quantum = '1'
console.log(getEthAssetId(quantum)) // '0x01142460171646987f20c714eda4b92812b22b811f56f27130937c267e29bd9e'
```

ERC20 asset ID:

```js
const tokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const quantum = '10000'
console.log(getErc20AssetId(tokenAddress, quantum)) // '0x0352386d5b7c781d47ecd404765307d74edc4d43b0490b8e03c71ac7a7429653'
```

ERC721 asset ID:

```js
const tokenAddress = '0xB18ed4768F87b0fFAb83408014f1caF066b91380'
const tokenId = '4100'
console.log(getErc721AssetId(tokenAddress, tokenId)) // '0x02b0ff0c09505bc40f9d1659becf16855a7b2298b010f8a54f4b05325885b40c'
```

Quantize amount:

```
const amount = '420000'
const quantum = '1000'
const quantizedAmount = starkwareCrypto.quantizeAmount(amount, quantum)
console.log(quantizedAmount) // '420'
```

## License

[Apache License 2.0](LICENSE.md)
