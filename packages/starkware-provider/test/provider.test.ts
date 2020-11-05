import { providers } from 'ethers'
import StarkwareWallet from '@authereum/starkware-wallet'
import StarkwareProvider from '../src'
import Store from './shared/Store'

describe('StarkwareProvider', () => {
  const rpcProvider = new providers.JsonRpcProvider(
    'https://ropsten-rpc.linkpool.io/'
  )

  const mnemonic =
    'puzzle number lab sense puzzle escape glove faith strike poem acoustic picture grit struggle know tuna soul indoor thumb dune fit job timber motor'
  const layer = 'starkex'
  const application = 'starkexdvf'
  const index = '0'

  const starkKey =
    '0x017e159e246999ee9ce7d1103d5d0d52c468bcb385d202ef362de2f878162c48'
  const store = new Store()

  const wallet = new StarkwareWallet(mnemonic, rpcProvider as any, store)
  const ropstenContractAddress = '0x5FedCE831BD3Bdb71F938EC26f984c84f40dB477'
  const provider = new StarkwareProvider(wallet, ropstenContractAddress)
  const ethKey = '0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e'
  it('should instantiate sucessfully', async () => {
    expect(provider).toBeTruthy()
  })
  it('should enable successfully', async () => {
    const result = await provider.enable(layer, application, index)
    expect(result).toEqual(starkKey)
  })
  it('should get account successfully', async () => {
    const account = await provider.account(layer, application, index)
    expect(account).toEqual(starkKey)
  })
  it('should call send successfully', async () => {
    const response = await provider.send('stark_account', {
      layer,
      application,
      index,
    })
    expect(response.result.starkKey).toEqual(starkKey)
  })
  it('should resolve request successfully', async () => {
    const response = await provider.resolve({
      id: 1,
      jsonrpc: '2.0',
      method: 'stark_account',
      params: {
        layer,
        application,
        index,
      },
    })
    expect(response.result.starkKey).toEqual(starkKey)
  })
  it('should resolve transfer request successfully', async () => {
    const starkSignature = await provider.transfer({
      from: {
        starkKey,
        vaultId: '1',
      },
      to: {
        starkKey,
        vaultId: '606138218',
      },
      asset: { type: 'ETH', data: { quantum: '10000000000' } },
      amount: '1',
      nonce: '1597237097',
      expirationTimestamp: '444396',
    })
    console.log(starkSignature)
    expect(starkSignature).toBeTruthy()
  })
  it('should resolve order request successfully', async () => {
    const starkSignature = await provider.transfer({
      from: {
        starkKey,
        vaultId: '1',
      },
      to: {
        starkKey,
        vaultId: '606138218',
      },
      asset: { type: 'ETH', data: { quantum: '10000000000' } },
      amount: '1',
      nonce: '1597237097',
      expirationTimestamp: '444396',
    })
    console.log(starkSignature)
    expect(starkSignature).toBeTruthy()
  })
})
