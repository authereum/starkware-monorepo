import { providers } from 'ethers'
import StarkwareWallet from '@authereum/starkware-wallet'
import * as ethers from 'ethers'
import StarkwareProvider from '../src'
import Store from './shared/Store'

describe('StarkwareProvider', () => {
  const rpcProvider = new providers.JsonRpcProvider(
    // 'https://ropsten-rpc.linkpool.io/'
    'https://ropsten.rpc.authereum.com'
  )

  const mnemonic =
    'puzzle number lab sense puzzle escape glove faith strike poem acoustic picture grit struggle know tuna soul indoor thumb dune fit job timber motor'
  const layer = 'starkex'
  const application = 'starkexdvf'
  const index = '0'

  const starkKey =
    '0x017e159e246999ee9ce7d1103d5d0d52c468bcb385d202ef362de2f878162c48'
  const store = new Store()

  const starkWallet = new StarkwareWallet(mnemonic, rpcProvider as any, store)
  const privateKey =
    '0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773'
  const signerWallet = new ethers.Wallet(privateKey, rpcProvider)
  const ropstenContractAddress = '0x5FedCE831BD3Bdb71F938EC26f984c84f40dB477'
  const provider = new StarkwareProvider(
    starkWallet,
    signerWallet,
    ropstenContractAddress
  )
  const ethKey = '0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e'
  it('should instantiate sucessfully', async () => {
    expect(provider).toBeTruthy()
  })
  it('should enable successfully', async () => {
    const accounts = await provider.enable(layer, application, index)
    expect(accounts[0]).toEqual(ethKey)
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
  it('should resolve stark account request successfully', async () => {
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
  it('should resolve stark transfer request successfully', async () => {
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
    expect(starkSignature).toBeTruthy()
  })
  it('should resolve stark order request successfully', async () => {
    const starkSignature = await provider.createOrder({
      sell: {
        type: 'ETH',
        data: {
          quantum: '10',
        },
        amount: '1',
        vaultId: '1',
      },
      buy: {
        type: 'ETH',
        data: {
          quantum: '10',
        },
        amount: '1',
        vaultId: '5',
      },
      nonce: '1597237097',
      expirationTimestamp: '444396',
    })
    expect(starkSignature).toBeTruthy()
  })
  it('should resolve sign message request successfully', async () => {
    const msg = 'hello world'
    const address = await provider.getAddress()
    const { result } = await provider.resolve({
      id: 1,
      jsonrpc: '2.0',
      method: 'personal_sign',
      params: [msg, address],
    })
    expect(result).toBeTruthy()
  })
  it('should resolve eth account request successfully', async () => {
    const address = await provider.getAddress()
    const { result } = await provider.resolve({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_accounts',
      params: [],
    })
    expect(result[0]).toBe(ethKey)
  })
  it('getEthKey', async () => {
    const result = await provider.getEthKey(starkKey)
    expect(result).toBe(ethKey)
  })
  it('should resolve stark perpetual transfer request successfully', async () => {
    const starkSignature = await provider.perpetualTransfer({
      asset: {
        type: 'SYNTHETIC',
        data: {
          symbol: 'BTC',
          resolution: '10',
        },
        amount: '1',
      },
      fee: {
        type: 'ETH',
        data: {
          quantum: '10000000000',
        },
        maxAmount: '1',
        positionId: '1',
      },
      sender: {
        positionId: '1',
      },
      receiver: {
        positionId: '1',
        starkKey,
      },
      nonce: '1597237',
      expirationTimestamp: '444396',
    })
    expect(starkSignature).toBeTruthy()
  })
  it('should resolve stark perpetual limit order request successfully', async () => {
    const starkSignature = await provider.perpetualLimitOrder({
      syntheticAsset: {
        type: 'SYNTHETIC',
        data: {
          symbol: 'BTC',
          resolution: '10',
        },
        amount: '1',
      },
      collateralAsset: {
        type: 'ETH',
        data: {
          quantum: '10000000000',
        },
        amount: '1',
      },
      isBuyingSynthetic: false,
      fee: {
        type: 'ETH',
        data: {
          quantum: '10000000000',
        },
        amount: '1',
      },
      nonce: '159723',
      positionId: '1',
      expirationTimestamp: '444396',
    })
    expect(starkSignature).toBeTruthy()
  })
  it('should resolve stark perpetual withdrawal request successfully', async () => {
    const starkSignature = await provider.perpetualWithdrawal({
      collateralAsset: {
        type: 'ETH',
        data: {
          quantum: '10000000000',
        },
        amount: '1',
      },
      nonce: '1597237',
      positionId: '1',
      expirationTimestamp: '444396',
    })
    expect(starkSignature).toBeTruthy()
  })
})
