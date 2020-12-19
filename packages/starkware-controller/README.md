# starkware-controller [![npm version](https://badge.fury.io/js/starkware-controller.svg)](https://badge.fury.io/js/starkware-controller)

> Starkware Controller Library

## Getting started

```js
import StarkwareController from '@authereum/starkware-controller'

const controller = new StarkwareController()

const encodedData = await controller.registerUser({
  ethKey,
  starkKey,
  operatorSignature,
})
```

## Examples

Deposit calldata:

```js
const encodedData = await controller.deposit({
  starkKey,
  assetType,
  vaultId,
})
```

Deposit NFT calldata:

```js
const encodedData = await controller.depositNft({
  starkKey,
  assetType,
  vaultId,
  tokenId,
})
```

Deposit cancel calldata:

```js
const encodedData = await controller.depositCancel({
  starkKey,
  assetType,
  vaultId,
})
```

Withdraw calldata:

```js
const encodedData = await controller.withdrawTo({
  starkKey,
  assetType,
  recipient,
})
```

Transfer message hash:

```js
const messageHash = await controller.transfer({
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
const messageHash = await controller.createOrder({
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
