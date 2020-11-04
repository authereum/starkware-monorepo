import StarkwareController from '../src'

describe('StarkwareController', () => {
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

  let controller: StarkwareController = new StarkwareController()
  it('should initiate successfully', async () => {
    expect(controller).toBeTruthy()
  })
  it('should return encoded call data for registerUser', async () => {
    const encodedData = await controller.registerUser({
      ethKey,
      starkKey,
      operatorSignature,
    })

    expect(encodedData).toBe(
      '0xdd2414d4000000000000000000000000a7fb70d89b11e312300d543fa87eb265fc2195bf0664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11100000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000041af2d0a5f2668a587f6767bc03eec53acd790b10c8a90e27ec55cd10d2f5636ac0ce6da4583994e02b05918ae683b349a5fbab38569e5d5cbff0baab80eaa828d1b00000000000000000000000000000000000000000000000000000000000000'
    )
  })
  it('should return encoded call data for deposit', async () => {
    const encodedData = await controller.deposit({
      starkKey,
      assetType: ethAssetType,
      vaultId,
    })

    expect(encodedData).toBe(
      '0x00aeef8a0664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11103c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f21000000000000000000000000000000000000000000000000000000000000000f'
    )
  })
  it('should return encoded call data for depositCancel', async () => {
    const encodedData = await controller.depositCancel({
      starkKey,
      assetId: ethAssetId,
      vaultId,
    })

    expect(encodedData).toBe(
      '0x7df7dc040664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11101142460171646987f20c714eda4b92812b22b811f56f27130937c267e29bd9e000000000000000000000000000000000000000000000000000000000000000f'
    )
  })
  it('should return encoded call data for depositReclaim', async () => {
    const encodedData = await controller.depositReclaim({
      starkKey,
      assetType: ethAssetType,
      vaultId,
    })

    expect(encodedData).toBe(
      '0xae8738160664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11103c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f21000000000000000000000000000000000000000000000000000000000000000f'
    )
  })
  it('should return encoded call data for withdraw', async () => {
    const encodedData = await controller.withdraw({
      starkKey,
      assetType: ethAssetType,
    })

    expect(encodedData).toBe(
      '0x441a3e700664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11103c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f21'
    )
  })
  it('should return encoded call data for withdrawTo', async () => {
    const encodedData = await controller.withdrawTo({
      starkKey,
      assetType: ethAssetType,
      recipient,
    })

    expect(encodedData).toBe(
      '0x14cd70e40664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11103c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f210000000000000000000000001df62f291b2e969fb0849d99d9ce41e2f137006e'
    )
  })
  it('should return encoded call data for fullWithdrawalRequest', async () => {
    const encodedData = await controller.fullWithdrawalRequest({
      starkKey,
      vaultId,
    })

    expect(encodedData).toBe(
      '0xa93310c40664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe111000000000000000000000000000000000000000000000000000000000000000f'
    )
  })
  it('should return encoded call data for freezeRequest', async () => {
    const encodedData = await controller.freezeRequest({
      starkKey,
      vaultId,
    })

    expect(encodedData).toBe(
      '0x93c1e4660664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe111000000000000000000000000000000000000000000000000000000000000000f'
    )
  })
  it('should return encoded call data for escape', async () => {
    const encodedData = await controller.escape({
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
    const encodedData = await controller.depositNft({
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
    const encodedData = await controller.depositNftReclaim({
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
    const encodedData = await controller.withdrawAndMint({
      starkKey,
      assetType: ethAssetType,
      mintingBlob: '0x00',
    })

    expect(encodedData).toBe(
      '0xd91443b70664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11103c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f21000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000'
    )
  })
  it('should return encoded call data for withdrawNft', async () => {
    const encodedData = await controller.withdrawNft({
      starkKey,
      assetType: nftAssetType,
      tokenId,
    })

    expect(encodedData).toBe(
      '0x019b417a0664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe11101f6d8eecef9a4b7f7bf5c92dfdfcc9892f114ae611b4783ba67dc1b2adce36a00000000000000000000000000000000000000000000000000000000000004d2'
    )
  })
  it('should return encoded call data for withdrawNftTo', async () => {
    const encodedData = await controller.withdrawNftTo({
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

    const messageHash = await controller.transfer({
      quantizedAmount,
      nonce,
      senderVaultId: vaultId,
      assetType: ethAssetType,
      receiverVaultId: vaultId,
      receiverKey: starkKey,
      expirationTimestamp,
    })

    expect(messageHash).toBe(
      '0x07c20c821d79bd01b4fa95be89144dd8a3df8e0adc99be40b018e3da25724b58'
    )
  })
  it('should return message hash for transfer with condition', async () => {
    const nonce = '1597237097'
    const expirationTimestamp = '444396'
    const condition =
      '0x318ff6d26cf3175c77668cd6434ab34d31e59f806a6a7c06d08215bccb7eaf8'

    const messageHash = await controller.transfer({
      quantizedAmount,
      nonce,
      senderVaultId: vaultId,
      assetType: ethAssetType,
      receiverVaultId: vaultId,
      receiverKey: starkKey,
      expirationTimestamp,
      condition,
    })

    expect(messageHash).toBe(
      '0x06d3fb4dc5b0199a19bad2a2fbf962a7c69592e89fe2574428f9f0adaf190a3a'
    )
  })
  it('should return message hash for createOrder', async () => {
    const nonce = '1597237097'
    const expirationTimestamp = '444396'

    const messageHash = await controller.createOrder({
      vaultSell: vaultId,
      vaultBuy: vaultId,
      amountSell: '10',
      amountBuy: '10',
      tokenSellAssetType: ethAssetType,
      tokenBuyAssetType: ethAssetType,
      nonce,
      expirationTimestamp,
    })

    expect(messageHash).toBe(
      '0x0196ab03c8487ea0feff4343eaa345e4768a1690673f86c45481538ed5854482'
    )
  })
})
