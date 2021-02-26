import assert from 'assert'
import BN from 'bn.js'
import * as encUtils from 'enc-utils'
import * as starkwareCrypto from '../src'

describe('starkware-crypto', () => {
  // ---------------------- TEST DATA POINTS ---------------------- //

  const mnemonic =
    'puzzle number lab sense puzzle escape glove faith strike poem acoustic picture grit struggle know tuna soul indoor thumb dune fit job timber motor'
  const layer = 'starkex'
  const application = 'starkexdvf'
  const zeroAddress = '0x0000000000000000000000000000000000000000'
  const index = '0'

  // ---------------------- EXPECTED DATA POINTS ---------------------- //

  const STARK_DERIVATION_PATH = `m/2645'/579218131'/1393043894'/0'/0'/0`
  const X_COORDINATE =
    '042582cfcb098a503562acd1325922799c9cebdf9249c26a41bd04007997f2eb'
  const Y_COORDINATE =
    '03b73cdb07f399130ea38ee860c3b708c92165df37b1690d7e0af1678ecdaff8'
  const PUBLIC_KEY = '04' + X_COORDINATE + Y_COORDINATE
  const PUBLIC_KEY_COMPRESSED = '02' + X_COORDINATE
  const STARK_SIGNATURE_ETH =
    '0x0728d1fe4b098c776f39ddfac46aea876203fc0473ba2a525b8f0790431a012c05320e7b57a27138a74e4b791ee5053afc92a40fa9145dbc08faaa8b4f0d49c21c'
  const STARK_SIGNATURE_ERC20 =
    '0x01a189aa493cb7303c81db5d753be155fdc4a8269ed038ec576d09f39aa4872904402979bbac3bfec125a2ba6bb22a19293458e60ec4f877c0f5eebe3ca1012a1c'

  let path: string
  let keyPair: starkwareCrypto.KeyPair
  beforeEach(() => {
    path = starkwareCrypto.getAccountPath(
      layer,
      application,
      zeroAddress,
      index
    )
    keyPair = starkwareCrypto.getKeyPairFromPath(mnemonic, path)
  })

  it('match expected derivation path', () => {
    expect(path).toEqual(STARK_DERIVATION_PATH)
  })

  it('match expected public key', () => {
    const publicKey = starkwareCrypto.getPublic(keyPair)
    expect(publicKey).toEqual(PUBLIC_KEY)
  })

  it('match expected public key compressed', () => {
    const compressed = starkwareCrypto.getPublic(keyPair, true)
    expect(compressed).toEqual(PUBLIC_KEY_COMPRESSED)
  })

  it('match starkPublicKey to public key compressed', () => {
    const starkPublicKey = starkwareCrypto.getStarkPublicKey(keyPair)
    expect(starkPublicKey).toEqual(PUBLIC_KEY_COMPRESSED)
  })

  it('match getStarkKey to x coordinate', () => {
    const starkKey = starkwareCrypto.getStarkKey(keyPair)
    expect(starkKey).toEqual(X_COORDINATE)
  })

  it('match x coordinate', () => {
    const x = starkwareCrypto.getXCoordinate(PUBLIC_KEY_COMPRESSED)
    expect(x).toEqual(X_COORDINATE)
  })

  it('match y coordinate', () => {
    const y = starkwareCrypto.getYCoordinate(PUBLIC_KEY_COMPRESSED)
    expect(y).toEqual(Y_COORDINATE)
  })

  it('compress', () => {
    const compressed = starkwareCrypto.compress(PUBLIC_KEY)
    expect(compressed).toEqual(PUBLIC_KEY_COMPRESSED)
  })

  it('decompress', () => {
    const publicKey = starkwareCrypto.decompress(PUBLIC_KEY_COMPRESSED)
    expect(publicKey).toEqual(PUBLIC_KEY)
  })

  it('sign eth transfer message', () => {
    const params = {
      from: {
        starkKey:
          '0x03a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a',
        vaultId: '1',
      },
      to: {
        starkKey:
          '0x03a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a',
        vaultId: '606138218',
      },
      token: { type: 'ETH' as 'ETH', data: { quantum: '10000000000' } },
      quantizedAmount: '100000000',
      nonce: '1597237097',
      expirationTimestamp: '444396',
    }

    const message = starkwareCrypto.getTransferMsgHash(
      params.quantizedAmount,
      params.nonce,
      params.from.vaultId,
      params.token,
      params.to.vaultId,
      params.to.starkKey,
      params.expirationTimestamp
    )

    const signature = starkwareCrypto.sign(keyPair, message)
    const serialized = starkwareCrypto.serializeSignature(signature)
    expect(serialized).toEqual(STARK_SIGNATURE_ETH)

    const verified = starkwareCrypto.verify(keyPair, message, signature)

    expect(verified).toBeTruthy()

    const starkPublicKey = starkwareCrypto.getStarkPublicKey(keyPair)

    expect(
      starkwareCrypto.verifyStarkPublicKey(starkPublicKey, message, signature)
    ).toBeTruthy()
  })
  it('sign erc20 transfer message', () => {
    const params = {
      from: {
        vaultId: '34',
        starkKey:
          '0x03a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a',
      },
      to: {
        vaultId: '21',
        starkKey:
          '0x03a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a',
      },
      token: {
        type: 'ERC20' as 'ERC20',
        data: {
          quantum: '1',
          tokenAddress: '0x89b94e8C299235c00F97E6B0D7368E82d640E848',
        },
      },
      quantizedAmount: '2154549703648910716',
      nonce: '1',
      expirationTimestamp: '438953',
    }

    const message = starkwareCrypto.getTransferMsgHash(
      params.quantizedAmount,
      params.nonce,
      params.from.vaultId,
      params.token,
      params.to.vaultId,
      params.to.starkKey,
      params.expirationTimestamp
    )

    const signature = starkwareCrypto.sign(keyPair, message)
    const serialized = starkwareCrypto.serializeSignature(signature)
    expect(serialized).toEqual(STARK_SIGNATURE_ERC20)

    const verified = starkwareCrypto.verify(keyPair, message, signature)

    expect(verified).toBeTruthy()

    const starkPublicKey = starkwareCrypto.getStarkPublicKey(keyPair)

    expect(
      starkwareCrypto.verifyStarkPublicKey(starkPublicKey, message, signature)
    ).toBeTruthy()
  })
})

describe('library examples', () => {
  const testData = require('./data/signature_test_data.json')

  test('Signing a StarkEx Order', () => {
    const privateKey = testData.meta_data.party_a_order.private_key.substring(2)
    const keyPair = starkwareCrypto.ec.keyFromPrivate(privateKey, 'hex')
    const publicKey = starkwareCrypto.ec.keyFromPublic(
      keyPair.getPublic(true, 'hex'),
      'hex'
    )
    const publicKeyX = (publicKey as any).pub.getX()

    assert(
      publicKeyX.toString(16) ===
        testData.settlement.party_a_order.public_key.substring(2),
      `Got: ${publicKeyX.toString(16)}.
        Expected: ${testData.settlement.party_a_order.public_key.substring(2)}`
    )

    const { party_a_order: partyAOrder } = testData.settlement
    const msgHash = starkwareCrypto.getLimitOrderMsgHash(
      partyAOrder.vault_id_sell, // - vault_sell (uint31)
      partyAOrder.vault_id_buy, // - vault_buy (uint31)
      partyAOrder.amount_sell, // - amount_sell (uint63 decimal str)
      partyAOrder.amount_buy, // - amount_buy (uint63 decimal str)
      partyAOrder.token_sell, // - token_sell (hex str with 0x prefix < prime)
      partyAOrder.token_buy, // - token_buy (hex str with 0x prefix < prime)
      partyAOrder.nonce, // - nonce (uint31)
      partyAOrder.expiration_timestamp // - expiration_timestamp (uint22)
    )

    assert(
      msgHash ===
        encUtils.sanitizeHex(testData.meta_data.party_a_order.message_hash),
      `Got: ${msgHash}. Expected: ` +
        testData.meta_data.party_a_order.message_hash
    )

    const msgSignature = starkwareCrypto.sign(keyPair, msgHash)
    const { r, s } = msgSignature

    assert(starkwareCrypto.verify(publicKey, msgHash, msgSignature))
    assert(
      r.toString(16) === partyAOrder.signature.r.substring(2),
      `Got: ${r.toString(16)}. Expected: ${partyAOrder.signature.r.substring(
        2
      )}`
    )
    assert(
      s.toString(16) === partyAOrder.signature.s.substring(2),
      `Got: ${s.toString(16)}. Expected: ${partyAOrder.signature.s.substring(
        2
      )}`
    )

    // The following is the JSON representation of an order:
    console.log('Order JSON representation: ')
    console.log(partyAOrder)

    // Example: StarkEx key serialization:
    const pubXStr = (publicKey as any).pub.getX().toString('hex')
    const pubYStr = (publicKey as any).pub.getY().toString('hex')

    // Verify Deserialization.
    const pubKeyDeserialized = starkwareCrypto.ec.keyFromPublic(
      { x: pubXStr, y: pubYStr },
      'hex'
    )
    assert(starkwareCrypto.verify(pubKeyDeserialized, msgHash, msgSignature))
  })

  test('StarkEx Transfer', () => {
    const privateKey = testData.meta_data.transfer_order.private_key.substring(
      2
    )
    const keyPair = starkwareCrypto.ec.keyFromPrivate(privateKey, 'hex')
    const publicKey = starkwareCrypto.ec.keyFromPublic(
      keyPair.getPublic(true, 'hex'),
      'hex'
    )
    const publicKeyX = (publicKey as any).pub.getX()

    assert(
      publicKeyX.toString(16) ===
        testData.transfer_order.public_key.substring(2),
      `Got: ${publicKeyX.toString(16)}.
        Expected: ${testData.transfer_order.public_key.substring(2)}`
    )

    const transfer = testData.transfer_order
    const msgHash = starkwareCrypto.getTransferMsgHash(
      transfer.amount, // - amount (uint63 decimal str)
      transfer.nonce, // - nonce (uint31)
      transfer.sender_vault_id, // - sender_vault_id (uint31)
      transfer.token, // - token (hex str with 0x prefix < prime)
      transfer.target_vault_id, // - target_vault_id (uint31)
      transfer.target_public_key, // - target_public_key (hex str with 0x prefix < prime)
      transfer.expiration_timestamp // - expiration_timestamp (uint22)
    )

    assert(
      msgHash ===
        encUtils.sanitizeHex(testData.meta_data.transfer_order.message_hash),
      `Got: ${msgHash}. Expected: ` +
        testData.meta_data.transfer_order.message_hash
    )

    // The following is the JSON representation of a transfer:
    console.log('Transfer JSON representation: ')
    console.log(transfer)
  })

  test('StarkEx Conditional Transfer', () => {
    const privateKey = testData.meta_data.conditional_transfer_order.private_key.substring(
      2
    )
    const keyPair = starkwareCrypto.ec.keyFromPrivate(privateKey, 'hex')
    const publicKey = starkwareCrypto.ec.keyFromPublic(
      keyPair.getPublic(true, 'hex'),
      'hex'
    )
    const publicKeyX = (publicKey as any).pub.getX()

    assert(
      publicKeyX.toString(16) ===
        testData.conditional_transfer_order.public_key.substring(2),
      `Got: ${publicKeyX.toString(16)}.
        Expected: ${testData.conditional_transfer_order.public_key.substring(
          2
        )}`
    )

    const transfer = testData.conditional_transfer_order
    const msgHash = starkwareCrypto.getTransferMsgHash(
      transfer.amount, // - amount (uint63 decimal str)
      transfer.nonce, // - nonce (uint31)
      transfer.sender_vault_id, // - sender_vault_id (uint31)
      transfer.token, // - token (hex str with 0x prefix < prime)
      transfer.target_vault_id, // - target_vault_id (uint31)
      transfer.target_public_key, // - target_public_key (hex str with 0x prefix < prime)
      transfer.expiration_timestamp, // - expiration_timestamp (uint22)
      transfer.condition // - condition (hex str with 0x prefix < prime)
    )

    assert(
      msgHash === testData.meta_data.conditional_transfer_order.message_hash,
      `Got: ${msgHash}. Expected: ` +
        testData.meta_data.conditional_transfer_order.message_hash
    )

    // The following is the JSON representation of a transfer:
    console.log('Transfer JSON representation: ')
    console.log(transfer)
  })

  test('Adding a matching order to create a settlement', () => {
    const privateKey = testData.meta_data.party_b_order.private_key.substring(2)
    const keyPair = starkwareCrypto.ec.keyFromPrivate(privateKey, 'hex')
    const publicKey = starkwareCrypto.ec.keyFromPublic(
      keyPair.getPublic(true, 'hex'),
      'hex'
    )
    const publicKeyX = (publicKey as any).pub.getX()

    assert(
      publicKeyX.toString(16) ===
        testData.settlement.party_b_order.public_key.substring(2),
      `Got: ${publicKeyX.toString(16)}.
        Expected: ${testData.settlement.party_b_order.public_key.substring(2)}`
    )

    const { party_b_order: partyBOrder } = testData.settlement
    const msgHash = starkwareCrypto.getLimitOrderMsgHash(
      partyBOrder.vault_id_sell, // - vault_sell (uint31)
      partyBOrder.vault_id_buy, // - vault_buy (uint31)
      partyBOrder.amount_sell, // - amount_sell (uint63 decimal str)
      partyBOrder.amount_buy, // - amount_buy (uint63 decimal str)
      partyBOrder.token_sell, // - token_sell (hex str with 0x prefix < prime)
      partyBOrder.token_buy, // - token_buy (hex str with 0x prefix < prime)
      partyBOrder.nonce, // - nonce (uint31)
      partyBOrder.expiration_timestamp // - expiration_timestamp (uint22)
    )

    assert(
      msgHash === testData.meta_data.party_b_order.message_hash,
      `Got: ${msgHash}. Expected: ` +
        testData.meta_data.party_b_order.message_hash
    )

    const msgSignature = starkwareCrypto.sign(keyPair, msgHash)
    const { r, s } = msgSignature

    assert(starkwareCrypto.verify(publicKey, msgHash, msgSignature))
    assert(
      r.toString(16) === partyBOrder.signature.r.substring(2),
      `Got: ${r.toString(16)}. Expected: ${partyBOrder.signature.r.substring(
        2
      )}`
    )
    assert(
      s.toString(16) === partyBOrder.signature.s.substring(2),
      `Got: ${s.toString(16)}. Expected: ${partyBOrder.signature.s.substring(
        2
      )}`
    )

    // The following is the JSON representation of a settlement:
    console.log('Settlement JSON representation: ')
    console.log(testData.settlement)
  })
})

describe('signature tests', () => {
  // Tools for testing.
  function generateRandomStarkPrivateKey () {
    return randomHexString(63)
  }

  function randomHexString (length, leading0x = false) {
    const result = randomString('0123456789ABCDEF', length)
    return leading0x ? '0x' + result : result
  }

  function randomString (characters, length) {
    let result = ''
    for (let i = 0; i < length; ++i) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  describe('Key computation', () => {
    it('should derive public key correctly', () => {
      const precomputedKeys = require('./data/keys_precomputed.json')
      for (const privKey in precomputedKeys) {
        if ({}.hasOwnProperty.call(precomputedKeys, privKey)) {
          // Drop the '0x' prefix.
          const fixedPrivKey = privKey.substring(2)
          const keyPair = starkwareCrypto.ec.keyFromPrivate(fixedPrivKey, 'hex')
          const pubKey =
            '0x' +
            keyPair
              .getPublic()
              .getX()
              .toString('hex')
          const expectedPubKey = precomputedKeys[privKey]
          expect(expectedPubKey).toEqual(pubKey)
        }
      }
    })
  })
  describe('Verify', () => {
    // Generate BN of 1.
    const oneBn = new BN('1', 16)

    it('should verify valid signatures', () => {
      const privKey = generateRandomStarkPrivateKey()
      const keyPair = starkwareCrypto.ec.keyFromPrivate(privKey, 'hex')
      const keyPairPub = starkwareCrypto.ec.keyFromPublic(
        keyPair.getPublic() as any,
        'BN'
      )
      const msgHash = new BN(randomHexString(61), 'hex')
      const msgSignature = starkwareCrypto.sign(keyPair, msgHash.toString(16))

      expect(
        starkwareCrypto.verify(keyPair, msgHash.toString(16), msgSignature)
      ).toBe(true)
      expect(
        starkwareCrypto.verify(keyPairPub, msgHash.toString(16), msgSignature)
      ).toBe(true)
    })

    it('should not verify invalid signature inputs lengths', () => {
      const ecOrder = starkwareCrypto.ec.n as any
      const { maxEcdsaVal } = starkwareCrypto
      const maxMsgHash = maxEcdsaVal.sub(oneBn)
      const maxR = maxEcdsaVal.sub(oneBn)
      const maxS = ecOrder.sub(oneBn).sub(oneBn)
      const maxStarkKey = starkwareCrypto.getKeyPair(
        maxEcdsaVal.sub(oneBn).toString(16)
      )

      // Test invalid message length.
      expect(() =>
        starkwareCrypto.verify(
          maxStarkKey,
          maxMsgHash.add(oneBn).toString(16),
          { r: maxR, s: maxS }
        )
      ).toThrow('Message not signable, invalid msgHash length.')
      // Test invalid r length.
      expect(() =>
        starkwareCrypto.verify(maxStarkKey, maxMsgHash.toString(16), {
          r: maxR.add(oneBn),
          s: maxS,
        })
      ).toThrow('Message not signable, invalid r length.')
      // Test invalid w length.
      expect(() =>
        starkwareCrypto.verify(maxStarkKey, maxMsgHash.toString(16), {
          r: maxR,
          s: maxS.add(oneBn),
        })
      ).toThrow('Message not signable, invalid w length.')
      // Test invalid s length.
      expect(() =>
        starkwareCrypto.verify(maxStarkKey, maxMsgHash.toString(16), {
          r: maxR,
          s: maxS.add(oneBn).add(oneBn),
        })
      ).toThrow('Message not signable, invalid s length.')
    })

    it('should not verify invalid signatures', () => {
      const privKey = generateRandomStarkPrivateKey()
      const keyPair = starkwareCrypto.ec.keyFromPrivate(privKey, 'hex')
      const keyPairPub = starkwareCrypto.ec.keyFromPublic(
        (keyPair as any).getPublic(),
        'BN'
      )
      const msgHash = new BN(randomHexString(61), 16)
      const msgSignature = starkwareCrypto.sign(keyPair, msgHash.toString(16))

      // Test invalid public key.
      const invalidKeyPairPub = starkwareCrypto.ec.keyFromPublic(
        {
          x: (keyPairPub as any).pub.getX().add(oneBn),
          y: (keyPairPub as any).pub.getY(),
        },
        'BN'
      )
      expect(
        starkwareCrypto.verify(
          invalidKeyPairPub,
          msgHash.toString(16),
          msgSignature
        )
      ).toBe(false)
      // Test invalid message.
      expect(
        starkwareCrypto.verify(
          keyPair,
          msgHash.add(oneBn).toString(16),
          msgSignature
        )
      ).toBe(false)
      expect(
        starkwareCrypto.verify(
          keyPairPub,
          msgHash.add(oneBn).toString(16),
          msgSignature
        )
      ).toBe(false)
      // Test invalid r.
      msgSignature.r.iadd(oneBn)
      expect(
        starkwareCrypto.verify(keyPair, msgHash.toString(16), msgSignature)
      ).toBe(false)
      expect(
        starkwareCrypto.verify(keyPairPub, msgHash.toString(16), msgSignature)
      ).toBe(false)
      // Test invalid s.
      msgSignature.r.isub(oneBn)
      msgSignature.s.iadd(oneBn)
      expect(
        starkwareCrypto.verify(keyPair, msgHash.toString(16), msgSignature)
      ).toBe(false)
      expect(
        starkwareCrypto.verify(keyPairPub, msgHash.toString(16), msgSignature)
      ).toBe(false)
    })
  })
  describe('Signature', () => {
    it('should sign all message hash lengths', () => {
      const privateKey =
        '2dccce1da22003777062ee0870e9881b460a8b7eca276870f57c601f182136c'
      const keyPair = starkwareCrypto.ec.keyFromPrivate(privateKey, 'hex')
      const publicKey = starkwareCrypto.ec.keyFromPublic(
        keyPair.getPublic(true, 'hex'),
        'hex'
      )

      const testSignature = (msgHash, expectedR, expectedS) => {
        const msgSignature = starkwareCrypto.sign(keyPair, msgHash)
        expect(starkwareCrypto.verify(publicKey, msgHash, msgSignature)).toBe(
          true
        )
        const { r, s } = msgSignature
        expect(r.toString(16)).toEqual(expectedR)
        expect(s.toString(16)).toEqual(expectedS)
      }
      // Message hash of length 61.
      testSignature(
        'c465dd6b1bbffdb05442eb17f5ca38ad1aa78a6f56bf4415bdee219114a47',
        '5f496f6f210b5810b2711c74c15c05244dad43d18ecbbdbe6ed55584bc3b0a2',
        '4e8657b153787f741a67c0666bad6426c3741b478c8eaa3155196fc571416f3'
      )

      // Message hash of length 61, with leading zeros.
      testSignature(
        '00c465dd6b1bbffdb05442eb17f5ca38ad1aa78a6f56bf4415bdee219114a47',
        '5f496f6f210b5810b2711c74c15c05244dad43d18ecbbdbe6ed55584bc3b0a2',
        '4e8657b153787f741a67c0666bad6426c3741b478c8eaa3155196fc571416f3'
      )

      // Message hash of length 62.
      testSignature(
        'c465dd6b1bbffdb05442eb17f5ca38ad1aa78a6f56bf4415bdee219114a47a',
        '233b88c4578f0807b4a7480c8076eca5cfefa29980dd8e2af3c46a253490e9c',
        '28b055e825bc507349edfb944740a35c6f22d377443c34742c04e0d82278cf1'
      )

      // Message hash of length 63.
      testSignature(
        '7465dd6b1bbffdb05442eb17f5ca38ad1aa78a6f56bf4415bdee219114a47a1',
        'b6bee8010f96a723f6de06b5fa06e820418712439c93850dd4e9bde43ddf',
        '1a3d2bc954ed77e22986f507d68d18115fa543d1901f5b4620db98e2f6efd80'
      )
    })
  })
  describe('Pedersen Hash', () => {
    it('should hash correctly', () => {
      const testData = require('./data/signature_test_data.json')
      for (const hashTestData of [
        testData.hash_test.pedersen_hash_data_1,
        testData.hash_test.pedersen_hash_data_2,
      ]) {
        expect(
          starkwareCrypto.pedersen([
            hashTestData.input_1.substring(2),
            hashTestData.input_2.substring(2),
          ])
        ).toEqual(hashTestData.output.substring(2))
      }
    })
  })

  describe('Signature Tests', () => {
    it('should create ecdsa deterministic signatures', () => {
      const rfc6979TestData = require('./data/rfc6979_signature_test_vector.json')
      const privateKey = rfc6979TestData.private_key.substring(2)
      const keyPair = starkwareCrypto.ec.keyFromPrivate(privateKey, 'hex')
      let i = 0
      for (; i < rfc6979TestData.messages.length; i++) {
        const msgHash = rfc6979TestData.messages[i].hash.substring(2)
        const msgSignature = starkwareCrypto.sign(keyPair, msgHash)
        const { r, s } = msgSignature
        expect(r.toString(10)).toEqual(rfc6979TestData.messages[i].r)
        expect(s.toString(10)).toEqual(rfc6979TestData.messages[i].s)
      }
    })
  })
})

describe('Asset ID calculation', () => {
  it('selectors', () => {
    expect(starkwareCrypto.ETH_SELECTOR).toBe('0x8322fff2')
    expect(starkwareCrypto.ERC20_SELECTOR).toBe('0xf47261b0')
    expect(starkwareCrypto.ERC721_SELECTOR).toBe('0x02571792')
    expect(starkwareCrypto.MINTABLE_ERC20_SELECTOR).toBe('0x68646e2d')
    expect(starkwareCrypto.MINTABLE_ERC721_SELECTOR).toBe('0xb8b86672')
  })
  it('asset info', () => {
    const tokenAddress = '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c'
    const selector = starkwareCrypto.ERC20_SELECTOR
    expect(
      starkwareCrypto.getAssetInfoFromAddress(tokenAddress, selector)
    ).toBe(
      '0xf47261b00000000000000000000000000d9c8723b343a8368bebe0b5e89273ff8d712e3c'
    )
  })
  it('asset type', () => {
    const tokenAddress = '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c' // Ropsten USDC from Compound
    const selector = starkwareCrypto.ERC20_SELECTOR
    const assetInfo = starkwareCrypto.getAssetInfoFromAddress(
      tokenAddress,
      selector
    )
    const quantum = '1000'
    expect(starkwareCrypto.calculateAssetType(assetInfo, quantum)).toBe(
      '0x4b744eda38322858d42ba43046badd5bd91e94844c0b7c47a4975d8b5b77b5'
    )
  })
  it('mintable asset id', () => {
    const mintableContractAddress = '0x6B5E013ba22F08ED46d33Fa6d483Fd60e001262e' // Ropsten ERC721
    const selector = starkwareCrypto.MINTABLE_ERC721_SELECTOR
    const mintingBlob = '0x00'
    expect(
      starkwareCrypto.calculateMintableAssetId(
        mintableContractAddress,
        selector,
        mintingBlob
      )
    ).toBe('0x0400082c617b3f734bbf7bd4b2affd6edba18065bfa203ca1cebf74d5c4e6c75')
  })
  it('address from asset info', () => {
    const tokenAddress = '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c' // Ropsten USDC from Compound
    const selector = starkwareCrypto.ERC20_SELECTOR
    const assetInfo = starkwareCrypto.getAssetInfoFromAddress(
      tokenAddress,
      selector
    )
    expect(starkwareCrypto.getAddressFromAssetInfo(assetInfo, selector)).toBe(
      '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c'
    )
  })
  it('eth asset type', () => {
    expect(starkwareCrypto.getEthAssetType('10')).toBe(
      '0x03c06b40679089fc2f488b867577bceadd20ab3205a25c02a546cc3d18cd6f21'
    )
  })
  it('erc20 asset type', () => {
    const tokenAddress = '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c' // Ropsten USDC from Compound
    const quantum = '1000'
    expect(starkwareCrypto.getErc20AssetType(tokenAddress, quantum)).toBe(
      '0x4b744eda38322858d42ba43046badd5bd91e94844c0b7c47a4975d8b5b77b5'
    )
  })
  it('erc721 asset type', () => {
    const erc721ContractAddress = '0x6B5E013ba22F08ED46d33Fa6d483Fd60e001262e' // Ropsten ERC721
    expect(starkwareCrypto.getErc721AssetType(erc721ContractAddress)).toBe(
      '0x01f6d8eecef9a4b7f7bf5c92dfdfcc9892f114ae611b4783ba67dc1b2adce36a'
    )
  })
  it('mintable erc20 asset type', () => {
    const tokenAddress = '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c' // Ropsten USDC from Compound
    const quantum = '1000'
    expect(
      starkwareCrypto.getMintableErc20AssetType(tokenAddress, quantum)
    ).toBe('0x471cdc2c5357c3a06385c69e3fb7f8b8412368d7641f81890bc62e4f14ea64')
  })
  it('mintable erc721 asset type', () => {
    const erc721ContractAddress = '0x6B5E013ba22F08ED46d33Fa6d483Fd60e001262e' // Ropsten ERC721
    expect(
      starkwareCrypto.getMintableErc721AssetType(erc721ContractAddress)
    ).toBe('0x012388a6c5c9703afc0d1bc876dd3d29f373950ad4f02a0ac0ab10ab7d9c48e5')
  })
})
describe('utils', () => {
  it('should quantize the amount given quantum', () => {
    const quantizedAmount = starkwareCrypto.quantizeAmount('420000', '1000')
    expect(quantizedAmount).toBe('420')
  })
  it('should generate condition hash', () => {
    const conditionalTransferAddress =
      '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
    const conditionalTransferFact =
      '0xe1629b9dda060bb30c7908346f6af189c16773fa148d3366701fbaa35d54f3c8'
    const conditionHash = starkwareCrypto.getConditionHash(
      conditionalTransferAddress,
      conditionalTransferFact
    )
    expect(conditionHash).toBe(
      encUtils.sanitizeHex(
        new BN(
          '972492899975411437369422452795878108749026817450782709657050700663161134107'
        ).toString(16)
      )
    )
  })
})
