import { getAssetId, getAssetType } from '../src'

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
