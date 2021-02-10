import assert from 'assert'
import BN from 'bn.js'
import {
  removeHexPrefix,
  hexToBuffer,
  sanitizeHex,
  utf8ToBuffer,
} from 'enc-utils'
import sha3 from 'js-sha3'

export interface AssetData {
  quantum?: string // eth and erc20
  tokenAddress?: string // erc20 and erc721
  tokenId?: string // erc721
  symbol?: string // synthetic
  resolution?: string // synthetic
  blob?: string // mintable erc20 and erc721
}

export interface Asset {
  type: string
  data: AssetData
}

// Generate BN of 1.
const oneBn = new BN('1', 16)

// This number is used to shift the packed encoded asset information by 256 bits.
const shiftBN = new BN(
  '10000000000000000000000000000000000000000000000000000000000000000',
  16
)

// Used to mask the 251 least signifcant bits given by Keccack256 to produce the final asset ID.
const mask = new BN(
  '3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  16
)

// Used to mask the 240 least signifcant bits given by Keccack256 to produce the final asset ID
// (for mintable assets).
const mask240 = new BN(
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  16
)

const maskMintabilityBit = new BN(
  '400000000000000000000000000000000000000000000000000000000000000',
  16
)

/*
 Computes the hash representing the asset ID for a given asset.
 asset is a dictionary containing the type and data of the asset to parse. the asset type is
 represented by a string describing the associated asset while the data is a dictionary
 containing further infomartion to distinguish between assets of a given type (such as the
 address of the smart contract of an ERC20 asset).
 The function returns the computed asset ID as a hex-string.

 For example:

    assetDict = {
        type: 'ERC20',
        data: { quantum: '10000', tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }
    }

 Will produce an the following asset ID:

    '0x352386d5b7c781d47ecd404765307d74edc4d43b0490b8e03c71ac7a7429653'.
*/
export function getAssetType (assetDict: Asset) {
  const assetSelector = getAssetSelector(assetDict.type)

  // Expected length is maintained to fix the length of the resulting asset info string in case of
  // leading zeroes (which might be omitted by the BN object).
  let expectedLen = removeHexPrefix(assetSelector).length

  // The asset info hex string is a packed message containing the hexadecimal representation of
  // the asset data.
  let assetInfo = new BN(removeHexPrefix(assetSelector), 16)

  if (assetDict.data.tokenAddress !== undefined) {
    // In the case there is a valid tokenAddress in the data, we append that to the asset info
    // (before the quantum).
    const tokenAddress = new BN(
      removeHexPrefix(assetDict.data.tokenAddress),
      16
    )
    assetInfo = assetInfo.mul(shiftBN)
    expectedLen += 64
    assetInfo = assetInfo.add(tokenAddress)
  }

  // Default quantum is 1 (for assets which don't specify quantum explicitly).
  const quantInfo = assetDict.data.quantum
  const quantum = quantInfo === undefined ? oneBn : new BN(quantInfo, 10)
  assetInfo = assetInfo.mul(shiftBN)
  expectedLen += 64
  assetInfo = assetInfo.add(quantum)

  let assetType = sha3.keccak_256(
    hexToBuffer(addLeadingZeroes(assetInfo.toJSON(), expectedLen))
  )

  let assetTypeBN = new BN(assetType, 16)
  assetTypeBN = assetTypeBN.and(mask)

  return '0x' + assetTypeBN.toJSON()
}

export function getAssetId (assetDict: Asset) {
  if (assetDict.type === 'SYNTH') {
    return getSyntheticAssetId(assetDict)
  }

  const assetType = new BN(removeHexPrefix(getAssetType(assetDict)), 16)
  // For ETH and ERC20, the asset ID is simply the asset type.
  let assetId = assetType
  if (assetDict.type === 'ERC721') {
    let tokenId: string = assetDict.data.tokenId as string
    // ERC721 assets require a slightly different construction for asset info.
    let assetInfo = new BN(utf8ToBuffer('NFT:'), 16)
    assetInfo = assetInfo.mul(shiftBN)
    assetInfo = assetInfo.add(assetType)
    assetInfo = assetInfo.mul(shiftBN)
    assetInfo = assetInfo.add(new BN(parseInt(tokenId), 16))
    const expectedLen = 136
    let assetIdHex = sha3.keccak_256(
      hexToBuffer(addLeadingZeroes(assetInfo.toJSON(), expectedLen))
    )
    let assetIdBN = new BN(assetIdHex, 16)
    assetIdBN = assetIdBN.and(mask)
    return '0x' + assetIdBN.toJSON()
  } else if (
    assetDict.type === 'MINTABLE_ERC721' ||
    assetDict.type === 'MINTABLE_ERC20'
  ) {
    let assetInfo = new BN(utf8ToBuffer('MINTABLE:'), 16)
    // ExpectedLen is equal to the length (in hex characters) of the appended strings:
    //   'MINTABLE:' (18 characters), 'assetType' (64 characters), 'blobHash' (64 characters).
    // Where assetType and blobHash are each padded with 0's to account for 64 hex characters
    // each.
    // We use this in order to pad the final assetInfo string with leading zeros in case the
    // calculation discarded them in the process.
    const expectedLen = 18 + 64 + 64
    assetInfo = assetInfo.ushln(256).add(assetType)
    const blobHash = blobToBlobHash(assetDict.data.blob as string)
    assetInfo = assetInfo.ushln(256).add(new BN(removeHexPrefix(blobHash), 16))
    let assetIdHex = sha3.keccak_256(
      hexToBuffer(addLeadingZeroes(assetInfo.toJSON(), expectedLen))
    )
    let assetIdBn = new BN(assetIdHex, 16)
    assetIdBn = assetIdBn.and(mask240)
    assetIdBn = assetIdBn.or(maskMintabilityBit)
    return '0x' + assetIdBn.toJSON()
  }

  return '0x' + assetId.toJSON()
}

export function getSyntheticAssetId (assetDict: Asset) {
  const assetIdString = assetDict.data.symbol + '-' + assetDict.data.resolution
  let assetIdBn = new BN(utf8ToBuffer(assetIdString), 15)
  let assetId = assetIdBn.toJSON() + '0'.repeat(32)
  return '0x' + assetId.slice(0, 30)
}

export function getEthAssetId (quantum: string): string {
  const asset = {
    type: 'ETH',
    data: {
      quantum,
    },
  }

  return getAssetId(asset)
}

export function getErc20AssetId (
  tokenAddress: string,
  quantum: string
): string {
  const asset = {
    type: 'ERC20',
    data: {
      tokenAddress,
      quantum,
    },
  }

  return getAssetId(asset)
}

export function getErc721AssetId (
  tokenAddress: string,
  tokenId: string
): string {
  const asset = {
    type: 'ERC721',
    data: {
      tokenAddress,
      tokenId,
    },
  }

  return getAssetId(asset)
}

/*
 Computes the given asset's unique selector based on its type.
*/
export function getAssetSelector (assetDictType: string) {
  let seed = ''
  switch (assetDictType.toUpperCase()) {
    case 'ETH':
      seed = 'ETH()'
      break
    case 'ERC20':
      seed = 'ERC20Token(address)'
      break
    case 'ERC721':
      seed = 'ERC721Token(address,uint256)'
      break
    case 'MINTABLE_ERC20':
      seed = 'MintableERC20Token(address)'
      break
    case 'MINTABLE_ERC721':
      seed = 'MintableERC721Token(address,uint256)'
      break
    case 'SYNTH':
      throw new Error('Synthetic assets do not have a selector')
    default:
      throw new Error(`Unknown token type: ${assetDictType}`)
  }
  return sanitizeHex(sha3.keccak_256(seed).slice(0, 8))
}

/*
 Adds leading zeroes to the input hex-string to complement the expected length.
*/
export function addLeadingZeroes (hexStr: string, expectedLen: number) {
  let res = hexStr
  assert(res.length <= expectedLen)
  while (res.length < expectedLen) {
    res = '0' + res
  }
  return res
}

export function blobToBlobHash (blob: Buffer | string): string {
  return '0x' + sha3.keccak_256(blob)
}
