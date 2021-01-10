import {
  hexToBN,
  assertInRange,
  ZERO_BN,
  pedersen,
  solidityKeccak,
  ONE_BN,
} from './crypto'
import { sanitizeHex } from 'enc-utils'
import BN from 'bn.js'

// 2^64.
export const TWO_POW_64_BN = hexToBN('10000000000000000')

// 2^32.
export const TWO_POW_32_BN = hexToBN('100000000')

// 2^128.
export const TWO_POW_128_BN = hexToBN('100000000000000000000000000000000')

// 2^250.
export const TWO_POW_250_BN = hexToBN(
  '400000000000000000000000000000000000000000000000000000000000000'
)

// 2^251.
export const TWO_POW_251_BN = hexToBN(
  '800000000000000000000000000000000000000000000000000000000000000'
)

const LIMIT_ORDER_WITH_FEES = 3
const TRANSFER = 4
const CONDITIONAL_TRANSFER = 5
const WITHDRAWAL = 6

export function getPerpetualLimitOrderMsgHash (
  assetIdSynthetic: string,
  assetIdCollateral: string,
  isBuyingSynthetic: boolean | number,
  assetIdFee: string,
  amountSynthetic: string,
  amountCollateral: string,
  amountFee: string,
  nonce: string,
  positionId: string,
  expirationTimestamp: string,
  hash: any = pedersen
): string {
  const assetIdSyntheticBn = hexToBN(assetIdSynthetic)
  const assetIdCollateralBn = hexToBN(assetIdCollateral)
  const assetIdFeeBn = hexToBN(assetIdFee)
  const amountFeeBn = hexToBN(amountFee)
  const nonceBn = hexToBN(nonce)
  const positionIdBn = hexToBN(positionId)
  const expirationTimestampBn = hexToBN(expirationTimestamp)

  let assetIdSell: BN
  let assetIdBuy: BN
  let amountSell: BN
  let amountBuy: BN
  if (isBuyingSynthetic) {
    assetIdSell = hexToBN(assetIdCollateral)
    assetIdBuy = hexToBN(assetIdSynthetic)
    amountSell = hexToBN(amountCollateral)
    amountBuy = hexToBN(amountSynthetic)
  } else {
    assetIdSell = hexToBN(assetIdSynthetic)
    assetIdBuy = hexToBN(assetIdCollateral)
    amountSell = hexToBN(amountSynthetic)
    amountBuy = hexToBN(amountCollateral)
  }
  // 0 <= assetIdSynthetic < 2^250
  assertInRange(assetIdSyntheticBn, ZERO_BN, TWO_POW_250_BN, 'assetIdSynthetic')
  // 0 <= assetIdCollateral < 2^250
  assertInRange(
    assetIdCollateralBn,
    ZERO_BN,
    TWO_POW_250_BN,
    'assetIdCollateral'
  )
  assertInRange(assetIdFeeBn, ZERO_BN, TWO_POW_250_BN, 'assetIdFee') // 0 <= assetIdFee < 2^250
  assertInRange(amountSell, ZERO_BN, TWO_POW_64_BN, 'amountSell') // 0 <= amountSell < 2^64
  assertInRange(amountBuy, ZERO_BN, TWO_POW_64_BN, 'amountBuy') // 0 <= amountBuy < 2^64
  assertInRange(amountFeeBn, ZERO_BN, TWO_POW_64_BN, 'amountFee') // 0 <= amountFee < 2^64
  assertInRange(nonceBn, ZERO_BN, TWO_POW_32_BN, 'nonce') // 0 <= nonce < 2^32
  assertInRange(positionIdBn, ZERO_BN, TWO_POW_64_BN, 'positionId') // 0 <= positionId < 2^64
  assertInRange(
    expirationTimestampBn,
    ZERO_BN,
    TWO_POW_32_BN,
    'expirationTimestamp'
  )

  let msg = hash([assetIdSell, assetIdBuy])
  msg = hash([msg, assetIdFeeBn])
  let packedMsg0 = hexToBN(amountSell)
  packedMsg0 = packedMsg0.ushln(64).add(amountBuy)
  packedMsg0 = packedMsg0.ushln(64).add(amountFeeBn)
  packedMsg0 = packedMsg0.ushln(32).add(nonceBn)
  msg = hash([msg, packedMsg0])
  let packedMsg1 = new BN(LIMIT_ORDER_WITH_FEES, 10)
  packedMsg1 = packedMsg1.ushln(64).add(positionIdBn)
  packedMsg1 = packedMsg1.ushln(64).add(positionIdBn)
  packedMsg1 = packedMsg1.ushln(64).add(positionIdBn)
  packedMsg1 = packedMsg1.ushln(32).add(expirationTimestampBn)
  packedMsg1 = packedMsg1.ushln(17)
  return sanitizeHex(hash([msg, packedMsg1]))
}

export function getPerpetualWithdrawalMsgHash (
  assetIdCollateral: string,
  positionId: string,
  nonce: string,
  expirationTimestamp: string,
  amount: string,
  hash: any = pedersen
): string {
  const assetIdCollateralBn = hexToBN(assetIdCollateral)
  const positionIdBn = hexToBN(positionId)
  const nonceBn = hexToBN(nonce)
  const amountBn = hexToBN(amount)
  const expirationTimestampBn = hexToBN(expirationTimestamp)

  // 0 <= assetIdCollateral < 2^250
  assertInRange(
    assetIdCollateralBn,
    ZERO_BN,
    TWO_POW_250_BN,
    'assetIdCollateral'
  )
  // 0 <= nonce < 2^32
  assertInRange(nonceBn, ZERO_BN, TWO_POW_32_BN, 'nonce')
  // 0 <= positionId < 2^64
  assertInRange(positionIdBn, ZERO_BN, TWO_POW_64_BN, 'positionId')
  // 0 <= expirationTimestamp < 2^32
  assertInRange(
    expirationTimestampBn,
    ZERO_BN,
    TWO_POW_32_BN,
    'expirationTimestamp'
  )
  // 0 <= amount < 2^64
  assertInRange(amountBn, ZERO_BN, TWO_POW_64_BN, 'amount')

  let packedMsg = new BN(WITHDRAWAL, 10)
  packedMsg = packedMsg.ushln(64).add(positionIdBn)
  packedMsg = packedMsg.ushln(32).add(nonceBn)
  packedMsg = packedMsg.ushln(64).add(amountBn)
  packedMsg = packedMsg.ushln(32).add(expirationTimestampBn)
  packedMsg = packedMsg.ushln(49)

  return sanitizeHex(hash([assetIdCollateral, packedMsg]))
}

export function getPerpetualTransferMsgHash (
  assetId: string,
  assetIdFee: string,
  receiverPublicKey: string,
  senderPositionId: string,
  receiverPositionId: string,
  srcFeePositionId: string,
  nonce: string,
  amount: string,
  maxAmountFee: string,
  expirationTimestamp: string,
  hash: any = pedersen
): string {
  const assetIdBn = hexToBN(assetId)
  const assetIdFeeBn = hexToBN(assetIdFee)
  const receiverPublicKeyBn = hexToBN(receiverPublicKey)
  const senderPositionIdBn = hexToBN(senderPositionId)
  const receiverPositionIdBn = hexToBN(receiverPositionId)
  const srcFeePositionIdBn = hexToBN(srcFeePositionId)
  const nonceBn = hexToBN(nonce)
  const amountBn = hexToBN(amount)
  const maxAmountFeeBn = hexToBN(maxAmountFee)
  const expirationTimestampBn = hexToBN(expirationTimestamp)

  // assert 0 <= amount < 2**64
  assertInRange(amountBn, ZERO_BN, TWO_POW_64_BN, 'amount')
  // assert 0 <= asset_id < 2**250
  assertInRange(assetIdBn, ZERO_BN, TWO_POW_250_BN, 'assetId')
  // assert 0 <= asset_id_fee < 2**250
  assertInRange(assetIdFeeBn, ZERO_BN, TWO_POW_250_BN, 'assetIdFee')
  // assert 0 <= expiration_timestamp < 2**32
  assertInRange(
    expirationTimestampBn,
    ZERO_BN,
    TWO_POW_32_BN,
    'expirationTimestamp'
  )
  // assert 0 <= max_amount_fee < 2**64
  assertInRange(maxAmountFeeBn, ZERO_BN, TWO_POW_64_BN, 'maxAmountFee')
  // assert 0 <= nonce < 2**32
  assertInRange(nonceBn, ZERO_BN, TWO_POW_32_BN, 'nonce')
  // assert 0 <= receiver_position_id < 2**64
  assertInRange(
    receiverPositionIdBn,
    ZERO_BN,
    TWO_POW_64_BN,
    'receiverPositionId'
  )
  // assert 0 <= receiver_public_key < 2**251
  assertInRange(
    receiverPublicKeyBn,
    ZERO_BN,
    TWO_POW_251_BN,
    'receiverPublicKey'
  )
  // assert 0 <= sender_position_id < 2**64
  assertInRange(
    senderPositionIdBn,
    ZERO_BN,
    TWO_POW_64_BN,
    'senderPositionIdBn'
  )

  let msg = hash([assetIdBn, assetIdFeeBn])
  msg = hash([msg, receiverPublicKeyBn])

  let packedMsg0 = senderPositionIdBn
  packedMsg0 = packedMsg0.ushln(64).add(receiverPositionIdBn)
  packedMsg0 = packedMsg0.ushln(64).add(srcFeePositionIdBn)
  packedMsg0 = packedMsg0.ushln(32).add(nonceBn)
  msg = hash([msg, packedMsg0])
  let packedMsg1 = new BN(TRANSFER, 10)
  packedMsg1 = packedMsg1.ushln(64).add(amountBn)
  packedMsg1 = packedMsg1.ushln(64).add(maxAmountFeeBn)
  packedMsg1 = packedMsg1.ushln(32).add(expirationTimestampBn)
  packedMsg1 = packedMsg1.ushln(81) // Padding

  return sanitizeHex(hash([msg, packedMsg1]))
}

export function getPerpetualConditionalTransferMsgHash (
  assetId: string,
  assetIdFee: string,
  receiverPublicKey: string,
  condition: string,
  senderPositionId: string,
  receiverPositionId: string,
  srcFeePositionId: string,
  nonce: string,
  amount: string,
  maxAmountFee: string,
  expirationTimestamp: string,
  hash: any = pedersen
) {
  const assetIdBn = hexToBN(assetId)
  const assetIdFeeBn = hexToBN(assetIdFee)
  const receiverPublicKeyBn = hexToBN(receiverPublicKey)
  const conditionBn = hexToBN(condition)
  const senderPositionIdBn = hexToBN(senderPositionId)
  const receiverPositionIdBn = hexToBN(receiverPositionId)
  const srcFeePositionIdBn = hexToBN(srcFeePositionId)
  const nonceBn = hexToBN(nonce)
  const amountBn = hexToBN(amount)
  const maxAmountFeeBn = hexToBN(maxAmountFee)
  const expirationTimestampBn = hexToBN(expirationTimestamp)

  // assert 0 <= amount < 2**64
  assertInRange(amountBn, ZERO_BN, TWO_POW_64_BN, 'amount')
  // assert 0 <= asset_id < 2**250
  assertInRange(assetIdBn, ZERO_BN, TWO_POW_250_BN, 'assetId')
  // assert 0 <= asset_id_fee < 2**250
  assertInRange(assetIdFeeBn, ZERO_BN, TWO_POW_250_BN, 'assetIdFee')
  // assert 0 <= condition < 2**251
  assertInRange(conditionBn, ZERO_BN, TWO_POW_251_BN, 'condition')
  // assert 0 <= expiration_timestamp < 2**32
  assertInRange(
    expirationTimestampBn,
    ZERO_BN,
    TWO_POW_32_BN,
    'expirationTimestamp'
  )
  // assert 0 <= src_fee_position_id < 2**64
  assertInRange(srcFeePositionIdBn, ZERO_BN, TWO_POW_64_BN, 'srcFeePositionId')
  // assert 0 <= max_amount_fee < 2**64
  assertInRange(maxAmountFeeBn, ZERO_BN, TWO_POW_64_BN, 'maxAmountFee')
  // assert 0 <= nonce < 2**32
  assertInRange(nonceBn, ZERO_BN, TWO_POW_32_BN, 'nonce')
  // assert 0 <= receiver_position_id < 2**64
  assertInRange(
    receiverPositionIdBn,
    ZERO_BN,
    TWO_POW_64_BN,
    'receiverPositionId'
  )
  // assert 0 <= receiver_public_key < 2**251
  assertInRange(
    receiverPublicKeyBn,
    ZERO_BN,
    TWO_POW_251_BN,
    'receiverPublicKeyBn'
  )
  // assert 0 <= sender_position_id < 2 ** 64
  assertInRange(senderPositionIdBn, ZERO_BN, TWO_POW_64_BN, 'senderPositionId')

  let msg = hash([assetIdBn, assetIdFeeBn])
  msg = hash([msg, receiverPublicKeyBn])
  msg = hash([msg, conditionBn])

  let packedMsg0 = senderPositionIdBn
  packedMsg0 = packedMsg0.ushln(64).add(receiverPositionIdBn)
  packedMsg0 = packedMsg0.ushln(64).add(srcFeePositionIdBn)
  packedMsg0 = packedMsg0.ushln(32).add(nonceBn)
  msg = hash([msg, packedMsg0])
  let packedMsg1 = new BN(CONDITIONAL_TRANSFER, 10)
  packedMsg1 = packedMsg1.ushln(64).add(amountBn)
  packedMsg1 = packedMsg1.ushln(64).add(maxAmountFeeBn)
  packedMsg1 = packedMsg1.ushln(32).add(expirationTimestampBn)
  packedMsg1 = packedMsg1.ushln(81) // Padding.
  return sanitizeHex(hash([msg, packedMsg1]))
}

export function buildCondition (
  factRegistryAddress: string,
  fact: string
): string {
  const conditionHash = solidityKeccak(
    ['address', 'bytes32'],
    [factRegistryAddress, fact]
  )

  // reduced to 250 LSB to be a field element
  const hash = new BN(conditionHash.toString('hex'), 16).and(
    TWO_POW_250_BN.sub(ONE_BN)
  )
  return sanitizeHex(hash.toString('hex'))
}
