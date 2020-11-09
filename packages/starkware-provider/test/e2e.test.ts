require('dotenv').config()
import assert from 'assert'
import { providers, Wallet } from 'ethers'
import StarkwareWallet from '@authereum/starkware-wallet'
import {
  createUserRegistrationSig,
  getEthAssetType,
  getErc20AssetType,
  getErc721AssetType,
  quantizeAmount,
  getErc20AssetId,
} from '@authereum/starkware-crypto'
import StarkwareProvider from '../src'
import Store from './shared/Store'
import { randomBytes } from 'crypto'

const generatePrivateKey = () => {
  return randomBytes(32).toString('hex')
}

// TODO: fix
describe('e2e', () => {
  const rpcProvider = new providers.JsonRpcProvider(
    //'https://ropsten-rpc.linkpool.io/'
    'https://ropsten.rpc.authereum.com'
  )

  const store = new Store()
  const mnemonic =
    'puzzle number lab sense puzzle escape glove faith strike poem acoustic picture grit struggle know tuna soul indoor thumb dune fit job timber motor'
  const layer = 'starkex'
  const application = 'starkexdemo'
  const index = '1'
  const starkWallet = new StarkwareWallet(mnemonic, rpcProvider as any, store)
  const privateKey =
    '0x20a31d76b88c34a077fbf0a6721ca1aa9cfa05332c4ef87648eb0a7c48a6cf48'
  const ethKey = '0xb8D1c647219Ce2A746151fF27a8ec5888Ef16D17'
  const signerWallet = new Wallet(privateKey, rpcProvider)
  const ropstenContractAddress = '0x5FedCE831BD3Bdb71F938EC26f984c84f40dB477'
  const provider = new StarkwareProvider(
    starkWallet,
    signerWallet,
    ropstenContractAddress
  )
  const ropstenTokenAddress = '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c' // ropsten USDC from Compound
  const ropstenNftAddress = '0x6B5E013ba22F08ED46d33Fa6d483Fd60e001262e' // https://zinc.cidaro.com/
  const ethQuantum = '10'
  const tokenQuantum = '1000'
  const vaultId = '10'
  const tokenId = '398' // https://ropsten.etherscan.io/tx/0x6ee93201efff1e9e4aaadeabd04c2d61504be7421e6af062a568017f5fef31c7
  const getStarkKey = () => {
    return provider.account(layer, application, index)
  }

  it('should register user successfully', async () => {
    const adminKey = process.env.ADMIN_KEY as string
    assert(adminKey, 'Admin key not found')
    const starkKey = await getStarkKey()
    const operatorSignature = createUserRegistrationSig(
      ethKey,
      starkKey,
      adminKey
    )
    const response = await provider.send('stark_register', {
      ethKey,
      operatorSignature,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should deposit ETH successfully', async () => {
    await provider.enable(layer, application, index)
    const response = await provider.send('stark_deposit', {
      asset: {
        type: 'ETH',
        data: {
          quantum: ethQuantum,
        },
      },
      amount: '100000000000000000', // 0.01
      vaultId,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should deposit ERC20 successfully', async () => {
    const starkKey = await getStarkKey()
    const amount = '10000' // 0.01

    // note: make sure starkEx contract is approved first by token contract
    const response = await provider.send('stark_deposit', {
      asset: {
        type: 'ERC20',
        data: {
          tokenAddress: ropstenTokenAddress,
          quantum: tokenQuantum,
        },
      },
      amount,
      vaultId,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should deposit NFT successfully', async () => {
    const starkKey = await getStarkKey()

    // note: make sure starkEx contract is approved first by nft contract
    const response = await provider.send('stark_deposit', {
      asset: {
        type: 'ERC721',
        data: {
          tokenAddress: ropstenNftAddress,
          tokenId,
        },
      },
      vaultId,
      tokenId,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should withdraw ETH successfully', async () => {
    const starkKey = await getStarkKey()

    // note: sender needs to be ethKey for withdrawal
    const response = await provider.send('stark_withdraw', {
      asset: {
        type: 'ETH',
        data: {
          quantum: ethQuantum,
        },
      },
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it.only('should withdraw ERC20 successfully', async () => {
    const starkKey = await getStarkKey()

    // note: sender needs to be ethKey for withdrawal
    const response = await provider.send('stark_withdraw', {
      asset: {
        type: 'ERC20',
        data: {
          tokenAddress: ropstenTokenAddress,
          quantum: tokenQuantum,
        },
      },
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should withdraw ERC721 successfully', async () => {
    const starkKey = await getStarkKey()

    // note: sender needs to be ethKey for withdrawal
    const response = await provider.send('stark_withdraw', {
      starkKey,
      asset: {
        type: 'ERC721',
        data: {
          tokenAddress: ropstenNftAddress,
          tokenId,
        },
      },
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should do a full withdrawal request', async () => {
    const starkKey = await getStarkKey()

    // note: sender needs to be ethKey for withdrawal
    const response = await provider.send('stark_fullWithdrawalRequest', {
      starkKey,
      vaultId,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should do a withdrawal and mint request', async () => {
    const starkKey = await getStarkKey()
    // note: must be a mintable asset type
    const assetType = getErc20AssetType(ropstenTokenAddress, tokenQuantum)
    const mintingBlob = '0x00' // TODO

    // note: sender needs to be ethKey for withdrawal
    const response = await provider.send('stark_withdrawAndMint', {
      starkKey,
      assetType,
      mintingBlob,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should do a freeze request', async () => {
    const starkKey = await getStarkKey()

    const response = await provider.send('stark_freezeRequest', {
      starkKey,
      vaultId,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should do an escape request ', async () => {
    const starkKey = await getStarkKey()
    const amount = '1'

    const response = await provider.send('stark_escape', {
      starkKey,
      vaultId,
      asset: {
        type: 'ERC20',
        data: {
          tokenAddress: ropstenTokenAddress,
          quantum: tokenQuantum,
        },
      },
      amount,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should generate transfer stark signature successfully', async () => {
    const assetType = getEthAssetType(ethQuantum)
    const condition =
      '0x318ff6d26cf3175c77668cd6434ab34d31e59f806a6a7c06d08215bccb7eaf8'
    const receiverStarkKey =
      '0x0664f48f7a7e2800d402839f63945021623385f85b687abbcbaef31845abe111'
    const response = await provider.send('stark_transfer', {
      quantizedAmount: '10',
      nonce: '1597237097',
      senderVaultId: '20',
      assetType,
      receiverVaultId: '21',
      receiverKey: receiverStarkKey,
      expirationTimestamp: '444396',
      condition,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.starkSignature).toBeTruthy()
  })
  it('should generate createOrder stark signature successfully', async () => {
    const assetType = getEthAssetType(ethQuantum)
    const response = await provider.send('stark_createOrder', {
      vaultSell: '20',
      vaultBuy: '25',
      amountSell: '10',
      amountBuy: '10',
      tokenSellAssetType: assetType,
      tokenBuyAssetType: assetType,
      nonce: '1597237097',
      expirationTimestamp: '444396',
    })

    expect(response.error).toBeUndefined()
    expect(response.result.starkSignature).toBeTruthy()
  })
})
