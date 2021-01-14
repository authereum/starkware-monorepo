import {
  getAssetType,
  getAssetId,
  getEthAssetId,
  getErc20AssetId,
  getErc721AssetId,
  getSyntheticAssetId,
} from '../src'

const precomputedAssets = require('./data/assets_precomputed.json')

describe('Asset Type computation', () => {
  it('should compute asset type correctly', () => {
    const precompytedAssetTypes = precomputedAssets.assetType
    for (const expectedAssetType in precompytedAssetTypes) {
      if ({}.hasOwnProperty.call(precompytedAssetTypes, expectedAssetType)) {
        const asset = precompytedAssetTypes[expectedAssetType]
        expect(getAssetType(asset)).toEqual(expectedAssetType)
      }
    }
  })
})

describe('Asset ID computation', () => {
  it('should compute asset ID correctly', () => {
    const precompytedAssetIds = precomputedAssets.assetId
    for (const expectedAssetId in precompytedAssetIds) {
      if ({}.hasOwnProperty.call(precompytedAssetIds, expectedAssetId)) {
        const asset = precompytedAssetIds[expectedAssetId]
        expect(getAssetId(asset)).toEqual(expectedAssetId)
      }
    }
  })
})

describe('Asset ID helper methods', () => {
  it('should compute ETH asset ID correctly', () => {
    const quantum = '1'
    expect(getEthAssetId(quantum)).toEqual(
      '0x01142460171646987f20c714eda4b92812b22b811f56f27130937c267e29bd9e'
    )
  })
  it('should compute ERC20 asset ID correctly', () => {
    const tokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const quantum = '10000'
    expect(getErc20AssetId(tokenAddress, quantum)).toEqual(
      '0x0352386d5b7c781d47ecd404765307d74edc4d43b0490b8e03c71ac7a7429653'
    )
  })
  it('should compute ERC721 asset ID correctly', () => {
    const tokenAddress = '0xB18ed4768F87b0fFAb83408014f1caF066b91380'
    const tokenId = '4100'
    expect(getErc721AssetId(tokenAddress, tokenId)).toEqual(
      '0x02b0ff0c09505bc40f9d1659becf16855a7b2298b010f8a54f4b05325885b40c'
    )
  })
})

describe.only('Compute Synthetic asset ID', () => {
  it('should compute SYNTHETIC asset ID correctly', () => {
    const asset = {
      type: 'SYNTHETIC',
      data: {
        symbol: 'BTC',
        resolution: '10',
      },
    }
    expect(getAssetId(asset)).toEqual('0x4254432d3130')
  })
  it('should compute getSyntheticAssetId asset ID correctly', () => {
    expect(getSyntheticAssetId('BTC', '10')).toEqual('0x4254432d3130')
  })
})
