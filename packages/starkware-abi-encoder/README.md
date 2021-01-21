# starkware-abi-encoder [![npm version](https://badge.fury.io/js/starkware-abiEncoder.svg)](https://badge.fury.io/js/starkware-abiEncoder)

> Starkware ABI Encoder Library

## Getting started

```js
import StarkwareAbiEncoder from '@authereum/starkware-abiEncoder'

const abiEncoder = new StarkwareAbiEncoder()

const encodedData = await abiEncoder.registerUser({
  ethKey,
  starkKey,
  operatorSignature,
})
```

## Examples

Deposit calldata:

```js
const encodedData = await abiEncoder.deposit({
  starkKey,
  assetType,
  vaultId,
})
```

Deposit NFT calldata:

```js
const encodedData = await abiEncoder.depositNft({
  starkKey,
  assetType,
  vaultId,
  tokenId,
})
```

Deposit cancel calldata:

```js
const encodedData = await abiEncoder.depositCancel({
  starkKey,
  assetType,
  vaultId,
})
```

Withdraw calldata:

```js
const encodedData = await abiEncoder.withdrawTo({
  starkKey,
  assetType,
  recipient,
})
```

Transfer message hash:

```js
const messageHash = await abiEncoder.transfer({
  quantizedAmount,
  nonce,
  senderVaultId,
  assetId,
  targetVaultId,
  targetKey,
  expirationTimestamp,
})
```

Limit order message hash:

```js
const messageHash = await abiEncoder.createOrder({
  sellVaultId,
  buyVaultId,
  sellQuantizedAmount,
  buyQuantizedAmount,
  sellAssetId,
  buyAssetId,
  nonce,
  expirationTimestamp,
})
```
