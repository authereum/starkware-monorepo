import BN from 'bn.js'
import hashJS from 'hash.js'
import assert from 'assert'
import * as RSV from 'rsv-signature'
import * as elliptic from 'elliptic'
import keccak256 from 'keccak256'
import { soliditySha3 } from 'web3-utils'
import {
  hexToBuffer,
  hexToArray,
  hexToBinary,
  removeHexPrefix,
  sanitizeBytes,
  sanitizeHex,
  numberToHex,
  binaryToNumber,
} from 'enc-utils'
import {
  Token,
  ERC20TokenData,
  ERC721TokenData,
  KeyPair,
  MessageParams,
  Signature,
  SignatureInput,
  NestedArray,
} from './types'
import { constantPointsHex } from './constants'

/* --------------------------- UTILS ---------------------------------- */

function solidityKeccak (types: string[], values: any[]) {
  const input = types.map((type: string, i: number) => {
    let value = values[i]
    if (Buffer.isBuffer(value)) {
      value = sanitizeHex(value.toString('hex'))
    }

    return {
      type,
      value,
    }
  })

  return hexToBuffer((soliditySha3(...input) as string).slice(2))
}

function intToBN (value: string): BN {
  return new BN(value, 10)
}

function hexToBN (value: string): BN {
  return new BN(removeHexPrefix(value), 16)
}

function isHexPrefixed (str: string): boolean {
  return str.substring(0, 2) === '0x'
}

function hasHexPrefix (str: string) {
  return str.substring(0, 2) === '0x'
}

/* --------------------------- ELLIPTIC ---------------------------------- */

// Equals 2**251 + 17 * 2**192 + 1.
export const PRIME = hexToBN(
  '800000000000011000000000000000000000000000000000000000000000001'
)

// Equals 2**251. This value limits msgHash and the signature parts.
export const maxEcdsaVal = hexToBN(
  '800000000000000000000000000000000000000000000000000000000000000'
)

export const order = hexToBN(
  '08000000 00000010 ffffffff ffffffff b781126d cae7b232 1e66a241 adc64d2f'
)

export const secpOrder = hexToBN(
  'FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE BAAEDCE6 AF48A03B BFD25E8C D0364141'
)

const starkEc = new elliptic.ec(
  new elliptic.curves.PresetCurve({
    type: 'short',
    prime: null,
    p: PRIME as any,
    a:
      '00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000001',
    b:
      '06f21413 efbe40de 150e596d 72f7a8c5 609ad26c 15c915c1 f4cdfcb9 9cee9e89',
    n: order as any,
    hash: hashJS.sha256,
    gRed: false,
    g: constantPointsHex[1],
  })
)
export const ec = starkEc

/* --------------------------- CONSTANTS ---------------------------------- */

export const constantPoints = constantPointsHex.map((coords: string[]) =>
  starkEc.curve.point(hexToBN(coords[0]), hexToBN(coords[1]))
)
export const shiftPoint = constantPoints[0]

const ZERO_BN = intToBN('0')
const ONE_BN = intToBN('1')
const TWO_BN = intToBN('2')
const TWO_POW_22_BN = hexToBN('400000')
const TWO_POW_31_BN = hexToBN('80000000')
const TWO_POW_63_BN = hexToBN('8000000000000000')

const MISSING_HEX_PREFIX = 'Hex strings expected to be prefixed with 0x.'

/* --------------------------- PRIVATE ---------------------------------- */

export function pedersen (input: any) {
  let point = shiftPoint
  for (let i = 0; i < input.length; i++) {
    let x = hexToBN(input[i])
    assert(x.gte(ZERO_BN) && x.lt(PRIME), 'Invalid input: ' + input[i])
    for (let j = 0; j < 252; j++) {
      const pt = constantPoints[2 + i * 252 + j]
      assert(!point.getX().eq(pt.getX()))
      if (x.and(ONE_BN).toNumber() !== 0) {
        point = point.add(pt)
      }
      x = x.shrn(1)
    }
  }
  return point.getX().toString(16)
}

function isCompressedPublicKey (hex: string) {
  hex = removeHexPrefix(hex)
  return hex.length === 66 && (hex.startsWith('03') || hex.startsWith('02'))
}

function checkHexValue (hex: string) {
  assert(isHexPrefixed(hex), MISSING_HEX_PREFIX)
  const hexBn = hexToBN(hex)
  assert(hexBn.gte(ZERO_BN))
  assert(hexBn.lt(PRIME))
}

function parseTokenInput (input: Token | string) {
  if (typeof input === 'string') {
    if (isCompressedPublicKey(input)) {
      return getXCoordinate(input)
    }
    checkHexValue(input)
    return input
  }
  return hashAssetId(input)
}

/*
 The function _truncateToN in lib/elliptic/ec/index.js does a shift-right of 4 bits
 in some cases. This function does the opposite operation so that
   _truncateToN(fixMessage(msg)) == msg.
*/
function fixMessage (msg: string) {
  // remove hex prefix
  msg = removeHexPrefix(msg)

  // Convert to BN to remove leading zeros.
  msg = hexToBN(msg).toString(16)

  if (msg.length <= 62) {
    // In this case, msg should not be transformed, as the byteLength() is at most 31,
    // so delta < 0 (see _truncateToN).
    return msg
  }
  assert(msg.length === 63)
  // In this case delta will be 4 so we perform a shift-left of 4 bits by adding a ZERO_BN.
  return msg + '0'
}

function hashSelector (selector: string): string {
  return sanitizeHex(
    keccak256(selector)
      .toString('hex')
      .slice(0, 8)
  )
}

/*
 Asserts input is equal to or greater then lowerBound and lower then upperBound.
 Assert message specifies inputName.
 input, lowerBound, and upperBound should be of type BN.
 inputName should be a string.
*/
function assertInRange (
  input: BN,
  lowerBound: BN,
  upperBound: BN,
  inputName = ''
) {
  const messageSuffix =
    inputName === '' ? 'invalid length' : `invalid ${inputName} length`
  assert(
    input.gte(lowerBound) && input.lt(upperBound),
    `Message not signable, ${messageSuffix}.`
  )
}

/* --------------------------- PUBLIC ---------------------------------- */

export function getKeyPair (privateKey: string): KeyPair {
  return starkEc.keyFromPrivate(privateKey, 'hex')
}

export function getKeyPairFromPublicKey (publicKey: string): KeyPair {
  return starkEc.keyFromPublic(hexToArray(publicKey))
}

export function getKeyPairFromStarkPublicKey (starkPublicKey: string): KeyPair {
  return starkEc.keyFromPublic(hexToArray(starkPublicKey))
}

export function getPrivate (keyPair: KeyPair): string {
  return keyPair.getPrivate('hex')
}

export function getPublic (keyPair: KeyPair, compressed = false): string {
  return keyPair.getPublic(compressed, 'hex')
}

export function getStarkPublicKey (keyPair: KeyPair): string {
  return getPublic(keyPair, true)
}

export function getStarkKey (keyPair: KeyPair): string {
  return sanitizeBytes((keyPair as any).pub.getX().toString(16), 2)
}

export function getXCoordinate (publicKey: string): string {
  const keyPair = getKeyPairFromPublicKey(publicKey)
  return sanitizeBytes((keyPair as any).pub.getX().toString(16), 2)
}

export function getYCoordinate (publicKey: string): string {
  const keyPair = getKeyPairFromPublicKey(publicKey)
  return sanitizeBytes((keyPair as any).pub.getY().toString(16), 2)
}

// Asset ID calculation --------------------------------------------------

export const ETH_SELECTOR = hashSelector('ETH()')
export const ERC20_SELECTOR = hashSelector('ERC20Token(address)')
export const ERC721_SELECTOR = hashSelector('ERC721Token(address,uint256)')
export const MINTABLE_ERC20_SELECTOR = hashSelector(
  'MintableERC20Token(address)'
)
export const MINTABLE_ERC721_SELECTOR = hashSelector(
  'MintableERC721Token(address,uint256)'
)
export const NFT_ASSET_ID_PREFIX = 'NFT:'
export const MINTABLE_ASSET_ID_PREFIX = 'MINTABLE:'
export const MASK_250_BITS_BN = hexToBN(
  '03FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
)
export const MASK_240_BITS_BN = hexToBN(
  'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
)
export const MINTABLE_ASSET_ID_FLAG = hexToBN(
  '400000000000000000000000000000000000000000000000000000000000000'
) // 1 << 250

export function getAssetInfo (
  contractAddress: string,
  tokenSelector: string
): string {
  return getAssetInfoFromAddress(contractAddress, tokenSelector)
}

export function getAssetInfoFromAddress (
  tokenAddress: string,
  selector: string
): string {
  const buf = Buffer.alloc(32)
  const addrBuf = hexToBuffer(tokenAddress)
  addrBuf.copy(buf, buf.length - addrBuf.length)
  const assetInfo = selector + buf.toString('hex')
  return assetInfo
}

export function calculateAssetType (
  assetInfo: string,
  quantum: string = '1'
): string {
  const h = solidityKeccak(['bytes', 'uint256'], [assetInfo, quantum])
  const bn = hexToBN(h.toString('hex'))
  return sanitizeHex(bn.and(MASK_250_BITS_BN).toString(16))
}

export function calculateMintableAssetId (
  mintableContractAddress: string,
  selector: string,
  mintingBlob: string | Buffer,
  quantum: string = '1'
): string {
  const assetInfo = getAssetInfo(mintableContractAddress, selector)
  const assetType = calculateAssetType(assetInfo, quantum)
  const blobHash = solidityKeccak(['bytes'], [mintingBlob])
  const interimHash = solidityKeccak(
    ['string', 'uint256', 'uint256'],
    [MINTABLE_ASSET_ID_PREFIX, assetType, blobHash]
  )
  const bn = hexToBN(interimHash.toString('hex'))
  return sanitizeHex(
    bn
      .and(MASK_240_BITS_BN)
      .or(MINTABLE_ASSET_ID_FLAG)
      .toString(16)
  )
}

export function getAddressFromAssetInfo (
  assetInfo: string,
  selector = ERC20_SELECTOR
): string {
  const assetInfoBuf = hexToBuffer(assetInfo)
  const selectorBuf = hexToBuffer(selector)
  assert(selectorBuf.byteLength === 4)
  const addressLength = 20
  const paddingLength = 32 - addressLength
  assert(
    Buffer.compare(
      assetInfoBuf.slice(0, 4 + paddingLength),
      Buffer.concat([selectorBuf, Buffer.alloc(paddingLength)])
    ) === 0
  )
  return sanitizeHex(assetInfoBuf.slice(4 + paddingLength).toString('hex'))
}

// AssetType definition for each tokenType

export function getEthAssetType (quantum: string) {
  const assetInfo = ETH_SELECTOR
  return calculateAssetType(assetInfo, quantum)
}

export function getErc20AssetType (
  erc20ContractAddress: string,
  quantum: string
) {
  const assetInfo = getAssetInfo(erc20ContractAddress, ERC20_SELECTOR)
  return calculateAssetType(assetInfo, quantum)
}

export function getErc721AssetType (erc721ContractAddress: string) {
  const assetInfo = getAssetInfo(erc721ContractAddress, ERC721_SELECTOR)
  return calculateAssetType(assetInfo, '1')
}

export function getMintableErc20AssetType (
  mintableErc20ContractAddress: string,
  quantum: string
) {
  const assetInfo = getAssetInfo(
    mintableErc20ContractAddress,
    MINTABLE_ERC20_SELECTOR
  )
  return calculateAssetType(assetInfo, quantum)
}

export function getMintableErc721AssetType (
  mintableErc721ContractAddress: string
) {
  const assetInfo = getAssetInfo(
    mintableErc721ContractAddress,
    MINTABLE_ERC721_SELECTOR
  )
  return calculateAssetType(assetInfo, '1')
}

export function hashAssetId (token: Token) {
  let id: string
  let tokenAddress: string
  switch (token.type.toUpperCase()) {
    case 'ETH':
      id = 'ETH()'
      break
    case 'ERC20':
      tokenAddress = (token.data as ERC20TokenData).tokenAddress
      checkHexValue(tokenAddress)
      id = `ERC20Token(${tokenAddress})`
      break
    case 'ERC721':
      tokenAddress = (token.data as ERC721TokenData).tokenAddress
      checkHexValue(tokenAddress)
      id = `ERC721Token(${tokenAddress})`
      break
    default:
      throw new Error(`Unknown token type: ${token.type}`)
  }
  return sanitizeHex(
    keccak256(id)
      .toString('hex')
      .slice(0, 8)
  )
}

// Message hashing --------------------------------------------------

export function hashMessage (
  wordsOrW1: NestedArray<string> | string[] | string,
  w2?: string,
  w3?: string
) {
  // method backward compatibility
  if (typeof wordsOrW1 === 'string' && w2 && w3) {
    return pedersen([pedersen([wordsOrW1, w2]), w3])
  }

  let a: NestedArray<string> | string = wordsOrW1[0]
  let b: NestedArray<string> | string = wordsOrW1[1]

  if (Array.isArray(a)) {
    a = hashMessage(a)
  }

  if (Array.isArray(b)) {
    b = hashMessage(b)
  }

  return pedersen([a, b])
}

export function deserializeMessage (serialized: string): MessageParams {
  serialized = removeHexPrefix(serialized)
  const slice0 = 0
  const slice1 = slice0 + 1
  const slice2 = slice1 + 31
  const slice3 = slice2 + 31
  const slice4 = slice3 + 63
  const slice5 = slice4 + 63
  const slice6 = slice5 + 31
  const slice7 = slice6 + 22

  return {
    instructionTypeBn: hexToBN(serialized.substring(slice0, slice1)),
    vault0Bn: hexToBN(serialized.substring(slice1, slice2)),
    vault1Bn: hexToBN(serialized.substring(slice2, slice3)),
    amount0Bn: hexToBN(serialized.substring(slice3, slice4)),
    amount1Bn: hexToBN(serialized.substring(slice4, slice5)),
    nonceBn: hexToBN(serialized.substring(slice5, slice6)),
    expirationTimestampBn: intToBN(serialized.substring(slice6, slice7)),
  }
}

export function serializeMessage (
  instructionTypeBn: BN,
  vault0Bn: BN,
  vault1Bn: BN,
  amount0Bn: BN,
  amount1Bn: BN,
  nonceBn: BN,
  expirationTimestampBn: BN
): string {
  let serialized = instructionTypeBn
  serialized = serialized.ushln(31).add(vault0Bn)
  serialized = serialized.ushln(31).add(vault1Bn)
  serialized = serialized.ushln(63).add(amount0Bn)
  serialized = serialized.ushln(63).add(amount1Bn)
  serialized = serialized.ushln(31).add(nonceBn)
  serialized = serialized.ushln(22).add(expirationTimestampBn)
  return sanitizeHex(serialized.toString(16))
}

export function formatMessage (
  instruction: 'transfer' | 'conditionalTransfer' | 'order',
  vault0: string,
  vault1: string,
  amount0: string,
  amount1: string,
  nonce: string,
  expirationTimestamp: string
): string {
  const instructionTypeBNs = {
    order: ZERO_BN,
    transfer: ONE_BN,
    conditionalTransfer: TWO_BN,
  }

  const isTransfer =
    instruction === 'transfer' || instruction === 'conditionalTransfer'

  const vault0Bn = intToBN(vault0)
  const vault1Bn = intToBN(vault1)
  const amount0Bn = intToBN(amount0)
  const amount1Bn = intToBN(amount1)
  const nonceBn = intToBN(nonce)
  const expirationTimestampBn = intToBN(expirationTimestamp)

  assert(vault0Bn.gte(ZERO_BN))
  assert(vault1Bn.gte(ZERO_BN))
  assert(amount0Bn.gte(ZERO_BN))
  if (!isTransfer) {
    assert(amount1Bn.gte(ZERO_BN))
  }
  assert(nonceBn.gte(ZERO_BN))
  assert(expirationTimestampBn.gte(ZERO_BN))

  assert(vault0Bn.lt(TWO_POW_31_BN))
  assert(vault1Bn.lt(TWO_POW_31_BN))
  assert(amount0Bn.lt(TWO_POW_63_BN))
  assert(amount1Bn.lt(TWO_POW_63_BN))
  assert(nonceBn.lt(TWO_POW_31_BN))
  assert(expirationTimestampBn.lt(TWO_POW_22_BN))

  const instructionTypeBn = instructionTypeBNs[instruction]

  return serializeMessage(
    instructionTypeBn,
    vault0Bn,
    vault1Bn,
    amount0Bn,
    amount1Bn,
    nonceBn,
    expirationTimestampBn
  )
}

export function getLimitOrderMsgHash (
  vaultSell: string,
  vaultBuy: string,
  amountSell: string,
  amountBuy: string,
  tokenSell: Token | string,
  tokenBuy: Token | string,
  nonce: string,
  expirationTimestamp: string
): string {
  const w1 = parseTokenInput(tokenSell)
  const w2 = parseTokenInput(tokenBuy)
  const w3 = formatMessage(
    'order',
    vaultSell,
    vaultBuy,
    amountSell,
    amountBuy,
    nonce,
    expirationTimestamp
  )

  const vaultSellBn = intToBN(vaultSell)
  const vaultBuyBn = intToBN(vaultBuy)
  const amountSellBn = intToBN(amountSell)
  const amountBuyBn = intToBN(amountBuy)
  const tokenSellBn = hexToBN(w1.substring(2))
  const tokenBuyBn = hexToBN(w2.substring(2))
  const nonceBn = intToBN(nonce)
  const expirationTimestampBn = intToBN(expirationTimestamp)
  assertInRange(vaultSellBn, ZERO_BN, TWO_POW_31_BN, 'vaultSell')
  assertInRange(vaultBuyBn, ZERO_BN, TWO_POW_31_BN, 'vaultBuy')
  assertInRange(amountSellBn, ZERO_BN, TWO_POW_63_BN, 'amountSell')
  assertInRange(amountBuyBn, ZERO_BN, TWO_POW_63_BN, 'amountBuy')
  assertInRange(tokenSellBn, ZERO_BN, PRIME, 'tokenSell')
  assertInRange(tokenBuyBn, ZERO_BN, PRIME, 'tokenBuy')
  assertInRange(nonceBn, ZERO_BN, TWO_POW_31_BN, 'nonce')
  assertInRange(
    expirationTimestampBn,
    ZERO_BN,
    TWO_POW_22_BN,
    'expirationTimestamp'
  )

  const msgHash = hashMessage([[w1, w2], w3])
  const msgHashBN = hexToBN(msgHash)
  assertInRange(msgHashBN, ZERO_BN, maxEcdsaVal, 'msgHash')
  return sanitizeHex(msgHash)
}

// transfer: H(H(w1,w2),w3)
// conditional transfer: H(H(H(w1,w2),w4),w3)
export function getTransferMsgHash (
  amount: string,
  nonce: string,
  senderVaultId: string,
  token: Token | string,
  receiverVaultId: string,
  receiverPublicKey: string,
  expirationTimestamp: string,
  condition: string | null = null
): string {
  assert(
    hasHexPrefix(receiverPublicKey) &&
      (condition === null || hasHexPrefix(condition)),
    'Hex strings expected to be prefixed with 0x.'
  )

  const w1 = parseTokenInput(token)
  const w2 = parseTokenInput(receiverPublicKey)
  const w3 = formatMessage(
    condition ? 'conditionalTransfer' : 'transfer',
    senderVaultId,
    receiverVaultId,
    amount,
    ZERO_BN.toString(),
    nonce,
    expirationTimestamp
  )

  const amountBn = intToBN(amount)
  const nonceBn = intToBN(nonce)
  const senderVaultIdBn = intToBN(senderVaultId)
  const tokenBn = hexToBN(w1.substring(2))
  const receiverVaultIdBn = intToBN(receiverVaultId)
  const receiverPublicKeyBn = hexToBN(receiverPublicKey.substring(2))
  const expirationTimestampBn = intToBN(expirationTimestamp)

  assertInRange(amountBn, ZERO_BN, TWO_POW_63_BN, 'amount')
  assertInRange(nonceBn, ZERO_BN, TWO_POW_31_BN, 'nonce')
  assertInRange(senderVaultIdBn, ZERO_BN, TWO_POW_31_BN, 'senderVault')
  assertInRange(tokenBn, ZERO_BN, PRIME, 'token')
  assertInRange(receiverVaultIdBn, ZERO_BN, TWO_POW_31_BN, 'receiverVaultId')
  assertInRange(receiverPublicKeyBn, ZERO_BN, PRIME, 'receiverPublicKey')
  assertInRange(
    expirationTimestampBn,
    ZERO_BN,
    TWO_POW_22_BN,
    'expirationTimestamp'
  )

  if (condition) {
    const w4 = condition
    const msgHash = hashMessage([[[w1, w2], w4], w3])
    const msgHashBN = hexToBN(msgHash)
    assertInRange(msgHashBN, ZERO_BN, maxEcdsaVal, 'msgHash')
    return sanitizeHex(msgHash)
  }

  const msgHash = hashMessage([[w1, w2], w3])
  const msgHashBN = hexToBN(msgHash)
  assertInRange(msgHashBN, ZERO_BN, maxEcdsaVal, 'msgHash')
  return sanitizeHex(msgHash)
}

/*
 Signs a message using the provided key.
 key should be an KeyPair with a valid private key.
 Returns an Signature.
*/
export function sign (keyPair: KeyPair, msgHash: string): Signature {
  const msgHashBN = hexToBN(msgHash)
  // Verify message hash has valid length.
  assertInRange(msgHashBN, ZERO_BN, maxEcdsaVal, 'msgHash')
  const msgSignature = keyPair.sign(fixMessage(msgHash))
  const { r, s } = msgSignature
  const w = s.invm((starkEc as any).n)
  // Verify signature has valid length.
  assertInRange(r, ONE_BN, maxEcdsaVal, 'r')
  assertInRange(s, ONE_BN, (starkEc as any).n, 's')
  assertInRange(w, ONE_BN, maxEcdsaVal, 'w')
  return msgSignature
}

/*
 Verifies a message using the provided key.
 key should be an KeyPair with a valid public key.
 msgSignature should be an Signature.
 Returns a boolean true if the verification succeeds.
*/
export function verify (
  keyPair: KeyPair,
  msgHash: string,
  sig: SignatureInput
): boolean {
  const msgHashBN = hexToBN(msgHash)
  assertInRange(msgHashBN, ZERO_BN, maxEcdsaVal, 'msgHash')
  const { r, s } = sig as any
  const w = s.invm(starkEc.n)
  // Verify signature has valid length.
  assertInRange(r, ONE_BN, maxEcdsaVal, 'r')
  assertInRange(s, ONE_BN, (starkEc as any).n, 's')
  assertInRange(w, ONE_BN, maxEcdsaVal, 'w')

  return keyPair.verify(fixMessage(msgHash), sig)
}

export function compress (publicKey: string): string {
  return getKeyPairFromPublicKey(publicKey).getPublic(true, 'hex')
}

export function decompress (publicKey: string): string {
  return getKeyPairFromPublicKey(publicKey).getPublic(false, 'hex')
}

export function verifyStarkPublicKey (
  starkPublicKey: string,
  msg: string,
  sig: SignatureInput
): boolean {
  const keyPair = getKeyPairFromStarkPublicKey(starkPublicKey)
  return verify(keyPair, msg, sig)
}

export const exportRecoveryParam = RSV.exportRecoveryParam

export const importRecoveryParam = RSV.importRecoveryParam

export const serializeSignature = RSV.serializeSignature

export const deserializeSignature = RSV.deserializeSignature

export const REGISTRATION_PREFIX = 'UserRegistration'

export function createUserRegistrationSig (
  address: string,
  starkKey: string,
  signerKey: string
): string {
  const msgHash = solidityKeccak(
    ['string', 'address', 'uint256'],
    [REGISTRATION_PREFIX, address, starkKey]
  ).toString('hex')

  const keyPair = getKeyPair(signerKey)
  const sig = keyPair.sign(msgHash)
  return serializeSignature(sig)
}

export const quantizeAmount = (amount: string, quantum: string): string => {
  const quantizedAmount = intToBN(amount).div(intToBN(quantum))
  return quantizedAmount.toString()
}
