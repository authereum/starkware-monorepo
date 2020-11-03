require('dotenv').config()
import assert from 'assert'
import { providers } from 'ethers'
import StarkwareWallet from '@authereum/starkware-wallet'
import {
  createUserRegistrationSig,
  getEthAssetType,
  getErc20AssetType,
  getErc721AssetType,
  quantizeAmount,
} from '@authereum/starkware-crypto'
import StarkwareProvider from '../src'
import Store from './shared/Store'
import { randomBytes } from 'crypto'

const generatePrivateKey = () => {
  return randomBytes(32).toString('hex')
}

// TODO: automate
describe('e2e', () => {
  const rpcProvider = new providers.JsonRpcProvider(
    //'https://ropsten-rpc.linkpool.io/'
    'https://ropsten.rpc.authereum.com'
  )

  //const privateKey = generatePrivateKey()
  const privateKey =
    '5bbed7f26b73fca3bd7b0817d483248e0818a924547077036682d97de2899664' // 0x2768fB72A8c7000a0a2C966F6E7E83C38e3ceF63
  const store = new Store()
  const wallet = StarkwareWallet.fromPrivateKey(
    privateKey,
    rpcProvider as any,
    store
  )
  const ropstenContractAddress = '0x5FedCE831BD3Bdb71F938EC26f984c84f40dB477'
  const provider = new StarkwareProvider(wallet, ropstenContractAddress)
  const ethKey = '0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e'
  const ethKeyPriv =
    '0x4925b029480132c09876d306bd14f97645358e4e9144aa4bdcbd6ab1e804064b'
  const ropstenTokenAddress = '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c' // ropsten USDC from Compound
  const ropstenNftAddress = '0x6B5E013ba22F08ED46d33Fa6d483Fd60e001262e' // https://zinc.cidaro.com/
  const ethQuantum = '10'
  const tokenQuantum = '1000'
  const vaultId = '10'
  const tokenId = '377' // https://ropsten.etherscan.io/tx/0x00976db10036ba008b037c6feaac0be2cadb874c72861adad0f0d4747cf8c485
	const getStarkKey = () => {
		const layer = 'starkex'
		const application = 'starkexdvf'
		const index = '0'

		return wallet.account(layer, application, index)
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
    const response = await provider.send('stark_registerUser', {
      ethKey,
      starkKey,
      operatorSignature,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it.only('should deposit ETH successfully', async () => {
    const starkKey = await getStarkKey()
    const assetType = getEthAssetType(ethQuantum)
    const response = await provider.send('stark_deposit', {
      starkKey,
      assetType,
      vaultId,
      ethValue: '0.01',
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should deposit ERC20 successfully', async () => {
    const starkKey = await getStarkKey()
    const assetType = getErc20AssetType(ropstenTokenAddress, tokenQuantum)
    const tokenAmount = '1'
    const quantizedAmount = quantizeAmount(tokenAmount, tokenQuantum) // 0.001 token

    // note: make sure starkEx contract is approved first by token contract
    const response = await provider.send('stark_deposit', {
      starkKey,
      assetType,
      vaultId,
      quantizedAmount,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should deposit NFT successfully', async () => {
    const starkKey = await getStarkKey()
    const assetType = getErc721AssetType(ropstenNftAddress)

    // note: make sure starkEx contract is approved first by nft contract
    const response = await provider.send('stark_depositNft', {
      starkKey,
      assetType,
      vaultId,
      tokenId,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should withdraw ETH successfully', async () => {
    const starkKey = await getStarkKey()
    const assetType = getEthAssetType(ethQuantum)

    // note: sender needs to be ethKey for withdrawal
    const response = await provider.send('stark_withdraw', {
      starkKey,
      assetType,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should withdraw ERC20 successfully', async () => {
    const starkKey = await getStarkKey()
    const assetType = getErc20AssetType(ropstenTokenAddress, tokenQuantum)

    // note: sender needs to be ethKey for withdrawal
    const response = await provider.send('stark_withdraw', {
      starkKey,
      assetType,
    })

    expect(response.error).toBeUndefined()
    expect(response.result.txhash).toBeTruthy()
    console.log(response.result.txhash)
  }, 10e3)
  it('should withdraw ERC721 successfully', async () => {
    const starkKey = await getStarkKey()
    const assetType = getErc721AssetType(ropstenNftAddress)

    // note: sender needs to be ethKey for withdrawal
    const response = await provider.send('stark_withdrawNft', {
      starkKey,
      assetType,
      tokenId,
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
    const assetType = getErc20AssetType(ropstenTokenAddress, tokenQuantum)
    const tokenAmount = '1'
    const quantizedAmount = quantizeAmount(tokenAmount, tokenQuantum) // 0.001 token

    const response = await provider.send('stark_escape', {
      starkKey,
      vaultId,
      assetType,
      quantizedAmount,
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
