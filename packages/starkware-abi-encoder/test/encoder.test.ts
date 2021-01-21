import StarkwareAbiEncoder from '../src'

describe('StarkwareAbiEncoder', () => {
  const contractAddress = '0x5FedCE831BD3Bdb71F938EC26f984c84f40dB477'
  const ethKey = '0xA7fB70d89B11E312300d543FA87EB265fC2195bF'
  const starkKey =
    '0x0664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe111'
  const operatorSignature =
    '0xaf2d0a5f2668a587f6767bc03eec53acd790b10c8a90e27ec55cd10d2f5636ac0ce6da4583994e02b05918ae683b349a5fbab38569e5d5cbff0baab80eaa828d1b'
  const ethAssetType =
    '0x3c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f21'
  const tokenAssetType =
    '0x4b744eda38322858d42ba43046badd5bd91e94844c0b7c47a4975d8b5b77b5'
  const nftAssetType =
    '0x1f6d8eecef9a4b7f7bf5c92dfdfcc9892f114ae611b4783ba67dc1b2adce36a'
  const vaultId = '15'
  const quantizedAmount = '10'
  const tokenId = '1234'
  const recipient = '0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e'
  const ethAssetId =
    '0x01142460171646987f20c714eda4b92812b22b811f56f27130937c267e29bd9e'

  let encoder: StarkwareAbiEncoder = new StarkwareAbiEncoder()
  it('should initiate successfully', async () => {
    expect(encoder).toBeTruthy()
  })
  it('should return encoded call data for registerUser', async () => {
    const encodedData = await encoder.registerUser({
      ethKey,
      starkKey,
      operatorSignature,
    })

    expect(encodedData).toBe(
      '0xdd2414d4000000000000000000000000a7fb70d89b11e312300d543fa87eb265fc2195bf0664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000041af2d0a5f2668a587f6767bc03eec53acd790b10c8a90e27ec55cd10d2f5636ac0ce6da4583994e02b05918ae683b349a5fbab38569e5d5cbff0baab80eaa828d1b00000000000000000000000000000000000000000000000000000000000000'
    )
  })
  it('should return encoded call data for deposit', async () => {
    const encodedData = await encoder.deposit({
      starkKey,
      assetType: ethAssetType,
      vaultId,
    })

    expect(encodedData).toBe(
      '0x00aeef8a0664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11103c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f21000000000000000000000000000000000000000000000000000000000000000f'
    )
  })
  it('should return encoded call data for depositCancel', async () => {
    const encodedData = await encoder.depositCancel({
      starkKey,
      assetId: ethAssetId,
      vaultId,
    })

    expect(encodedData).toBe(
      '0x7df7dc040664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11101142460171646987f20c714eda4b92812b22b811f56f27130937c267e29bd9e000000000000000000000000000000000000000000000000000000000000000f'
    )
  })
  it('should return encoded call data for depositReclaim', async () => {
    const encodedData = await encoder.depositReclaim({
      starkKey,
      assetType: ethAssetType,
      vaultId,
    })

    expect(encodedData).toBe(
      '0xae8738160664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11103c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f21000000000000000000000000000000000000000000000000000000000000000f'
    )
  })
  it('should return encoded call data for withdraw', async () => {
    const encodedData = await encoder.withdraw({
      starkKey,
      assetType: ethAssetType,
    })

    expect(encodedData).toBe(
      '0x441a3e700664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11103c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f21'
    )
  })
  it('should return encoded call data for withdrawTo', async () => {
    const encodedData = await encoder.withdrawTo({
      starkKey,
      assetType: ethAssetType,
      recipient,
    })

    expect(encodedData).toBe(
      '0x14cd70e40664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11103c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f210000000000000000000000001df62f291b2e969fb0849d99d9ce41e2f137006e'
    )
  })
  /*
  it('should return encoded call data for fullWithdrawalRequest', async () => {
    const encodedData = await encoder.fullWithdrawalRequest({
      starkKey,
      vaultId,
    })

    expect(encodedData).toBe(
      '0xa93310c40664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe111000000000000000000000000000000000000000000000000000000000000000f'
    )
  })
  */
  /*
  it('should return encoded call data for freezeRequest', async () => {
    const encodedData = await encoder.freezeRequest({
      starkKey,
      vaultId,
    })

    expect(encodedData).toBe(
      '0x93c1e4660664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe111000000000000000000000000000000000000000000000000000000000000000f'
    )
  })
  */
  it('should return encoded call data for escape', async () => {
    const encodedData = await encoder.escape({
      starkKey,
      vaultId,
      assetId: ethAssetId,
      quantizedAmount,
    })

    expect(encodedData).toBe(
      '0x9e3adac40664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe111000000000000000000000000000000000000000000000000000000000000000f01142460171646987f20c714eda4b92812b22b811f56f27130937c267e29bd9e000000000000000000000000000000000000000000000000000000000000000a'
    )
  })
  it('should return encoded call data for depositNft', async () => {
    const encodedData = await encoder.depositNft({
      starkKey,
      vaultId,
      assetType: nftAssetType,
      tokenId,
    })

    expect(encodedData).toBe(
      '0xae1cdde60664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11101f6d8eecef9a4b7f7bf5c92dfdfcc9892f114ae611b4783ba67dc1b2adce36a000000000000000000000000000000000000000000000000000000000000000f00000000000000000000000000000000000000000000000000000000000004d2'
    )
  })
  it('should return encoded call data for depositNftReclaim', async () => {
    const encodedData = await encoder.depositNftReclaim({
      starkKey,
      vaultId,
      assetType: nftAssetType,
      tokenId,
    })

    expect(encodedData).toBe(
      '0xfcb058220664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11101f6d8eecef9a4b7f7bf5c92dfdfcc9892f114ae611b4783ba67dc1b2adce36a000000000000000000000000000000000000000000000000000000000000000f00000000000000000000000000000000000000000000000000000000000004d2'
    )
  })
  it('should return encoded call data for withdrawAndMint', async () => {
    const encodedData = await encoder.withdrawAndMint({
      starkKey,
      assetType: ethAssetType,
      mintingBlob: '0x00',
    })

    expect(encodedData).toBe(
      '0xd91443b70664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11103c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f21000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000'
    )
  })
  it('should return encoded call data for withdrawNft', async () => {
    const encodedData = await encoder.withdrawNft({
      starkKey,
      assetType: nftAssetType,
      tokenId,
    })

    expect(encodedData).toBe(
      '0x019b417a0664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11101f6d8eecef9a4b7f7bf5c92dfdfcc9892f114ae611b4783ba67dc1b2adce36a00000000000000000000000000000000000000000000000000000000000004d2'
    )
  })
  it('should return encoded call data for withdrawNftTo', async () => {
    const encodedData = await encoder.withdrawNftTo({
      starkKey,
      assetType: nftAssetType,
      tokenId,
      recipient,
    })

    expect(encodedData).toBe(
      '0xebef0fd00664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11101f6d8eecef9a4b7f7bf5c92dfdfcc9892f114ae611b4783ba67dc1b2adce36a00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000001df62f291b2e969fb0849d99d9ce41e2f137006e'
    )
  })
  it('should return message hash for transfer', async () => {
    const nonce = '1597237097'
    const expirationTimestamp = '444396'

    const messageHash = await encoder.transfer({
      quantizedAmount,
      nonce,
      senderVaultId: vaultId,
      assetId: ethAssetId,
      targetVaultId: vaultId,
      targetKey: starkKey,
      expirationTimestamp,
    })

    expect(messageHash).toBe(
      '0x073d816fff4ccf199217cd66c04da9b5b13ab37994a01ad71d24af361c8281fc'
    )
  })
  it('should return message hash for transfer with condition', async () => {
    const nonce = '1597237097'
    const expirationTimestamp = '444396'
    const condition =
      '0x318ff6d26cf3175c77668cd6434ab34d31e59f806a6a7c06d08215bccb7eaf8'

    const messageHash = await encoder.transfer({
      quantizedAmount,
      nonce,
      senderVaultId: vaultId,
      assetId: ethAssetId,
      targetVaultId: vaultId,
      targetKey: starkKey,
      expirationTimestamp,
      condition,
    })

    expect(messageHash).toBe(
      '0x016afa3d0ff3d517a8c5709fcf21bbf1f0e96d3d0431f2563269b5dbcaf71890'
    )
  })
  it('should return message hash for createOrder', async () => {
    const nonce = '1597237097'
    const expirationTimestamp = '444396'

    const messageHash = await encoder.createOrder({
      sellVaultId: vaultId,
      buyVaultId: vaultId,
      sellQuantizedAmount: '10',
      buyQuantizedAmount: '10',
      sellAssetId: ethAssetId,
      buyAssetId: ethAssetId,
      nonce,
      expirationTimestamp,
    })

    expect(messageHash).toBe(
      '0x01baf2d545b4285a209aaef5fe57a810a12c41d8ab28db1c64cc916df9e5c092'
    )
  })
  it('getEthKey', async () => {
    const encodedData = await encoder.getEthKey(starkKey)
    expect(encodedData).toBe(
      '0x1dbd1da70664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe111'
    )
  })
  it('configurationHash', async () => {
    const encodedData = await encoder.configurationHash('1')
    expect(encodedData).toBeTruthy()
  })
  it('globalConfigurationHash', async () => {
    const encodedData = await encoder.globalConfigurationHash()
    expect(encodedData).toBeTruthy()
  })
  it('globalConfigurationHash', async () => {
    const encodedData = await encoder.depositCancelDelay()
    expect(encodedData).toBeTruthy()
  })
  it('freezeGracePeriod', async () => {
    const encodedData = await encoder.freezeGracePeriod()
    expect(encodedData).toBeTruthy()
  })
  it('mainGovernanceInfoTag', async () => {
    const encodedData = await encoder.mainGovernanceInfoTag()
    expect(encodedData).toBeTruthy()
  })
  it('maxVerifierCount', async () => {
    const encodedData = await encoder.maxVerifierCount()
    expect(encodedData).toBeTruthy()
  })
  it('unfreezeDelay', async () => {
    const encodedData = await encoder.unfreezeDelay()
    expect(encodedData).toBeTruthy()
  })
  it('verifierRemovalDelay', async () => {
    const encodedData = await encoder.verifierRemovalDelay()
    expect(encodedData).toBeTruthy()
  })
  it('announceAvailabilityVerifierRemovalIntent', async () => {
    const verifier = ethKey
    const encodedData = await encoder.announceAvailabilityVerifierRemovalIntent(
      verifier
    )
    expect(encodedData).toBeTruthy()
  })
  it('announceVerifierRemovalIntent', async () => {
    const verifier = ethKey
    const encodedData = await encoder.announceVerifierRemovalIntent(verifier)
    expect(encodedData).toBeTruthy()
  })
  it('getRegisteredAvailabilityVerifiers', async () => {
    const encodedData = await encoder.getRegisteredAvailabilityVerifiers()
    expect(encodedData).toBeTruthy()
  })
  it('getRegisteredVerifiers', async () => {
    const encodedData = await encoder.getRegisteredVerifiers()
    expect(encodedData).toBeTruthy()
  })
  it('isAvailabilityVerifier', async () => {
    const verifierAddress = ethKey
    const encodedData = await encoder.isAvailabilityVerifier(verifierAddress)
    expect(encodedData).toBeTruthy()
  })
  it('isFrozen', async () => {
    const encodedData = await encoder.isFrozen()
    expect(encodedData).toBeTruthy()
  })
  it('isVerifier', async () => {
    const verifierAddress = ethKey
    const encodedData = await encoder.isVerifier(verifierAddress)
    expect(encodedData).toBeTruthy()
  })
  it('mainAcceptGovernance', async () => {
    const encodedData = await encoder.mainAcceptGovernance()
    expect(encodedData).toBeTruthy()
  })
  it('mainCancelNomination', async () => {
    const encodedData = await encoder.mainCancelNomination()
    expect(encodedData).toBeTruthy()
  })
  it('mainIsGovernor', async () => {
    const testGovernor = ethKey
    const encodedData = await encoder.mainIsGovernor(testGovernor)
    expect(encodedData).toBeTruthy()
  })
  it('mainNominateNewGovernor', async () => {
    const newGovernor = ethKey
    const encodedData = await encoder.mainNominateNewGovernor(newGovernor)
    expect(encodedData).toBeTruthy()
  })
  it('mainRemoveGovernor', async () => {
    const governorForRemoval = ethKey
    const encodedData = await encoder.mainRemoveGovernor(governorForRemoval)
    expect(encodedData).toBeTruthy()
  })
  it('registerAvailabilityVerifier', async () => {
    const verifier = ethKey
    const identifier = 'abc'
    const encodedData = await encoder.registerAvailabilityVerifier(
      verifier,
      identifier
    )
    expect(encodedData).toBeTruthy()
  })
  it('registerVerifier', async () => {
    const verifier = ethKey
    const identifier = 'abc'
    const encodedData = await encoder.registerVerifier(verifier, identifier)
    expect(encodedData).toBeTruthy()
  })
  it('removeAvailabilityVerifier', async () => {
    const verifier = ethKey
    const encodedData = await encoder.removeAvailabilityVerifier(verifier)
    expect(encodedData).toBeTruthy()
  })
  it('removeVerifier', async () => {
    const verifier = ethKey
    const encodedData = await encoder.removeVerifier(verifier)
    expect(encodedData).toBeTruthy()
  })
  it('unFreeze', async () => {
    const encodedData = await encoder.unFreeze()
    expect(encodedData).toBeTruthy()
  })
  it('getAssetInfo', async () => {
    const assetType = '0x00'
    const encodedData = await encoder.getAssetInfo(assetType)
    expect(encodedData).toBeTruthy()
  })
  it('getCancellationRequest', async () => {
    const assetId = '0x01'
    const vaultId = '0x02'
    const encodedData = await encoder.getCancellationRequest(
      starkKey,
      assetId,
      vaultId
    )
    expect(encodedData).toBeTruthy()
  })
  it('getDepositBalance', async () => {
    const assetId = '0x01'
    const vaultId = '0x02'
    const encodedData = await encoder.getDepositBalance(
      starkKey,
      assetId,
      vaultId
    )
    expect(encodedData).toBeTruthy()
  })
  it('getFullWithdrawalRequest', async () => {
    const vaultId = '0x02'
    const encodedData = await encoder.getFullWithdrawalRequest(
      starkKey,
      vaultId
    )
    expect(encodedData).toBeTruthy()
  })
  it('getQuantizedDepositBalance', async () => {
    const assetId = '0x01'
    const vaultId = '0x02'
    const encodedData = await encoder.getQuantizedDepositBalance(
      starkKey,
      assetId,
      vaultId
    )
    expect(encodedData).toBeTruthy()
  })
  it('getQuantum', async () => {
    const presumedAssetType = '0x01'
    const encodedData = await encoder.getQuantum(presumedAssetType)
    expect(encodedData).toBeTruthy()
  })
  it('getSystemAssetType', async () => {
    const encodedData = await encoder.getSystemAssetType()
    expect(encodedData).toBeTruthy()
  })
  it('getWithdrawalBalance', async () => {
    const assetId = '0x02'
    const encodedData = await encoder.getWithdrawalBalance(starkKey, assetId)
    expect(encodedData).toBeTruthy()
  })
  it('isTokenAdmin', async () => {
    const testedAdmin = ethKey
    const encodedData = await encoder.isTokenAdmin(testedAdmin)
    expect(encodedData).toBeTruthy()
  })
  it('isUserAdmin', async () => {
    const testedAdmin = ethKey
    const encodedData = await encoder.isUserAdmin(testedAdmin)
    expect(encodedData).toBeTruthy()
  })
  it('registerSystemAssetType', async () => {
    const assetType = '0x01'
    const assetInfo = '0x02'
    const encodedData = await encoder.registerSystemAssetType(
      assetType,
      assetInfo
    )
    expect(encodedData).toBeTruthy()
  })
  it('registerToken', async () => {
    const a = '0x01'
    const b = '0x02'
    const encodedData = await encoder.registerToken(a, b)
    expect(encodedData).toBeTruthy()
  })
  it('registerTokenAdmin', async () => {
    const newAdmin = ethKey
    const encodedData = await encoder.registerTokenAdmin(newAdmin)
    expect(encodedData).toBeTruthy()
  })
  it('registerUserAdmin', async () => {
    const newAdmin = ethKey
    const encodedData = await encoder.registerUserAdmin(newAdmin)
    expect(encodedData).toBeTruthy()
  })
  it('unregisterTokenAdmin', async () => {
    const oldAdmin = ethKey
    const encodedData = await encoder.unregisterTokenAdmin(oldAdmin)
    expect(encodedData).toBeTruthy()
  })
  it('unregisterUserAdmin', async () => {
    const oldAdmin = ethKey
    const encodedData = await encoder.unregisterUserAdmin(oldAdmin)
    expect(encodedData).toBeTruthy()
  })
  it('getLastBatchId', async () => {
    const encodedData = await encoder.getLastBatchId()
    expect(encodedData).toBeTruthy()
  })
  it('getOrderRoot', async () => {
    const encodedData = await encoder.getOrderRoot()
    expect(encodedData).toBeTruthy()
  })
  it('getOrderTreeHeight', async () => {
    const encodedData = await encoder.getOrderTreeHeight()
    expect(encodedData).toBeTruthy()
  })
  it('getSequenceNumber', async () => {
    const encodedData = await encoder.getSequenceNumber()
    expect(encodedData).toBeTruthy()
  })
  it('getVaultRoot', async () => {
    const encodedData = await encoder.getVaultRoot()
    expect(encodedData).toBeTruthy()
  })
  it('getVaultTreeHeight', async () => {
    const encodedData = await encoder.getVaultTreeHeight()
    expect(encodedData).toBeTruthy()
  })
  it('isOperator', async () => {
    const testedOperator = ethKey
    const encodedData = await encoder.isOperator(testedOperator)
    expect(encodedData).toBeTruthy()
  })
  it('registerOperator', async () => {
    const newOperator = ethKey
    const encodedData = await encoder.registerOperator(newOperator)
    expect(encodedData).toBeTruthy()
  })
  it('setAssetConfiguration', async () => {
    const assetId = '0x01'
    const configHash = '0x' + Buffer.alloc(32).toString('hex')
    const encodedData = await encoder.setAssetConfiguration(assetId, configHash)
    expect(encodedData).toBeTruthy()
  })
  it('setGlobalConfiguration', async () => {
    const configHash = '0x' + Buffer.alloc(32).toString('hex')
    const encodedData = await encoder.setGlobalConfiguration(configHash)
    expect(encodedData).toBeTruthy()
  })
  it('unregisterOperator', async () => {
    const removedOperator = ethKey
    const encodedData = await encoder.unregisterOperator(removedOperator)
    expect(encodedData).toBeTruthy()
  })
  it('updateState', async () => {
    const publicInput = []
    const applicationData = []
    const encodedData = await encoder.updateState(publicInput, applicationData)
    expect(encodedData).toBeTruthy()
  })
  it('forcedTradeRequest', async () => {
    const starkKeyA = '0x01'
    const starkKeyB = '0x01'
    const vaultIdA = '0x01'
    const vaultIdB = '0x01'
    const collateralAssetId = '0x01'
    const syntheticAssetId = '0x01'
    const amountCollateral = '0x01'
    const amountSynthetic = '0x01'
    const aIsBuyingSynthetic = false
    const nonce = '0x01'
    const signature = '0x01'
    const encodedData = await encoder.forcedTradeRequest(
      starkKeyA,
      starkKeyB,
      vaultIdA,
      vaultIdB,
      collateralAssetId,
      syntheticAssetId,
      amountCollateral,
      amountSynthetic,
      aIsBuyingSynthetic,
      nonce,
      signature
    )
    expect(encodedData).toBeTruthy()
  })
  it('forcedWithdrawalRequest', async () => {
    const vaultId = '0x1'
    const quantizedAmount = '0x2'
    const encodedData = await encoder.forcedWithdrawalRequest(
      starkKey,
      vaultId,
      quantizedAmount
    )
    expect(encodedData).toBeTruthy()
  })
  it('getForcedTradeRequest', async () => {
    const starkKeyA = '0x01'
    const starkKeyB = '0x01'
    const vaultIdA = '0x01'
    const vaultIdB = '0x01'
    const collateralAssetId = '0x01'
    const syntheticAssetId = '0x01'
    const amountCollateral = '0x01'
    const amountSynthetic = '0x01'
    const aIsBuyingSynthetic = false
    const nonce = '0x01'
    const encodedData = await encoder.getForcedTradeRequest(
      starkKeyA,
      starkKeyB,
      vaultIdA,
      vaultIdB,
      collateralAssetId,
      syntheticAssetId,
      amountCollateral,
      amountSynthetic,
      aIsBuyingSynthetic,
      nonce
    )
    expect(encodedData).toBeTruthy()
  })
  it('getForcedWithdrawalRequest', async () => {
    const vaultId = '0x1'
    const quantizedAmount = '0x2'
    const encodedData = await encoder.getForcedWithdrawalRequest(
      starkKey,
      vaultId,
      quantizedAmount
    )
    expect(encodedData).toBeTruthy()
  })
  it('perpetualTransfer', async () => {
    const encodedData = await encoder.perpetualTransfer({
      assetId: '1',
      assetIdFee: '0',
      receiverPublicKey: '1',
      senderPositionId: '1',
      receiverPositionId: '1',
      feePositionId: '1',
      nonce: '0',
      amount: '1000',
      maxAmountFee: '10',
      expirationTimestamp: '100',
    })
    expect(encodedData).toBeTruthy()
  })
  it('perpetualLimitOrder', async () => {
    const encodedData = await encoder.perpetualLimitOrder({
      assetIdSynthetic: '1',
      assetIdCollateral: '1',
      isBuyingSynthetic: true,
      assetIdFee: '1',
      amountSynthetic: '1',
      amountCollateral: '1',
      amountFee: '1',
      nonce: '1',
      positionId: '1',
      expirationTimestamp: '1',
    })
    expect(encodedData).toBeTruthy()
  })
  it('perpetualWithdrawal', async () => {
    const encodedData = await encoder.perpetualWithdrawal({
      assetIdCollateral: '1',
      positionId: '10',
      nonce: '0',
      expirationTimestamp: '100',
      amount: '1000',
    })
    expect(encodedData).toBeTruthy()
  })
})
