import {
  getLimitOrderWithFeesMsgHash,
  getWithdrawWithFeesMsgHash,
  getTransferWithFeesMsgHash,
  getConditionalTransferWithFeesMsgHash,
} from '../src'
import precomputedMessages from './data/perpetual_messages_precomputed.json'

describe('perpetual messages', () => {
  test('getLimitOrderMsgHash', () => {
    const orders = precomputedMessages['limit_order']
    for (const expectedMessageHash in orders) {
      const messageData = orders[expectedMessageHash]
      const messageHash = getLimitOrderWithFeesMsgHash(
        messageData.assetIdSynthetic,
        messageData.assetIdCollateral,
        messageData.isBuyingSynthetic,
        messageData.assetIdFee,
        messageData.amountSynthetic,
        messageData.amountCollateral,
        messageData.amountFee,
        messageData.nonce,
        messageData.positionId,
        messageData.expirationTimestamp
      )

      expect(messageHash).toBe(expectedMessageHash)
    }
  })
  test('getWithdrawWithFeesMessage', () => {
    const withdrawals = precomputedMessages['withdrawal']
    for (const expectedMessageHash in withdrawals) {
      const messageData = withdrawals[expectedMessageHash]
      const messageHash = getWithdrawWithFeesMsgHash(
        messageData.assetIdCollateral,
        messageData.positionId,
        messageData.nonce,
        messageData.expirationTimestamp,
        messageData.amount
      )

      expect(messageHash).toBe(expectedMessageHash)
    }
  })
  test('getTransferWithFeesMsgHash', () => {
    const transfer = precomputedMessages['transfer']
    for (const expectedMessageHash in transfer) {
      const messageData = transfer[expectedMessageHash]
      const messageHash = getTransferWithFeesMsgHash(
        messageData.assetId,
        messageData.assetIdFee,
        messageData.receiverPublicKey,
        messageData.senderPositionId,
        messageData.receiverPositionId,
        messageData.feePositionId,
        messageData.nonce,
        messageData.amount,
        messageData.maxAmountFee,
        messageData.expirationTimestamp
      )

      expect(messageHash).toBe(expectedMessageHash)
    }
  })
  test('getConditionalTransferWithFeesMsgHash', () => {
    const transfer = precomputedMessages['conditional_transfer']
    for (const expectedMessageHash in transfer) {
      const messageData = transfer[expectedMessageHash]
      const messageHash = getConditionalTransferWithFeesMsgHash(
        messageData.assetId,
        messageData.assetIdFee,
        messageData.receiverPublicKey,
        messageData.condition,
        messageData.senderPositionId,
        messageData.receiverPositionId,
        messageData.srcFeePositionId,
        messageData.nonce,
        messageData.amount,
        messageData.maxAmountFee,
        messageData.expirationTimestamp
      )

      expect(messageHash).toBe(expectedMessageHash)
    }
  })
})
