import { providers } from 'ethers'
import StarkwareWallet from '../src'

describe('StarkwareWallet', () => {
  const storage = {}
  const store = {
    set: async (key: string, data: any) => {
      storage[key] = data
    },
    get: async (key: string) => {
      return storage[key]
    },
    remove: async (key: string) => {
      delete storage[key]
    },
  }
  const mnemonic =
    'owner hover awake board copper fiber organ sudden nominee trick decline inflict'
  const layer = 'starkex'
  const application = 'starkexdvf'
  const index = '0'
  const provider = new providers.JsonRpcProvider(
    'https://ropsten-rpc.linkpool.io/'
  )
  const starkKey =
    '0x03a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a'
  let starkWallet: StarkwareWallet
  beforeEach(() => {
    starkWallet = new StarkwareWallet(mnemonic, provider, store)
  })
  it('init', async () => {
    expect(starkWallet).toBeTruthy()
  })
  it('account', async () => {
    const account = await starkWallet.account(layer, application, index)
    expect(account).toEqual(starkKey)
  })
  it('getStarkKey', async () => {
    const sKey = await starkWallet.getStarkKey()
    expect(sKey).toEqual(starkKey)
  })
  it('sign', async () => {
    const signature = await starkWallet.sign('example')
    expect(signature).toEqual(
      '0xfb7ae61d6b2c34de46d17830eff6bc73888f560fa4f8ab0e0de50a6f0f8a131f43b69300b96b8e2bcd42efd172a6d531ba2b39a765596fe7e1b39cc37114c1ad1b'
    )
  })
  it('signTransaction', async () => {
    const signedTx = await starkWallet.signTransaction({
      to: '0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e',
    })
    expect(signedTx).toEqual(
      '0xf85d808080941df62f291b2e969fb0849d99d9ce41e2f137006e80801ca068dedbc4891b20132c1539aa0303452c76c76ac6ca52eebeab475e5c56e07a8ca05f7d92335c7e5ad96d330765da8cb2679803a6ceac19218f800fd54425bf3d4d'
    )
  })
})
