import Web3 from 'web3'
import { providers, Wallet } from 'ethers'
import StarkwareWallet from '@authereum/starkware-wallet'
import StarkwareProvider from '../src'

describe('web3 test', () => {
  const rpcProvider = new providers.JsonRpcProvider(
    //'https://ropsten-rpc.linkpool.io/'
    'https://ropsten.rpc.authereum.com'
  )
  const mnemonic =
    'puzzle number lab sense puzzle escape glove faith strike poem acoustic picture grit struggle know tuna soul indoor thumb dune fit job timber motor'
  const starkWallet = new StarkwareWallet(mnemonic, rpcProvider as any)
  const privateKey =
    '0x20a31d76b88c34a077fbf0a6721ca1aa9cfa05332c4ef87648eb0a7c48a6cf48'
  const signerWallet = new Wallet(privateKey, rpcProvider)
  const ropstenContractAddress = '0x5FedCE831BD3Bdb71F938EC26f984c84f40dB477'
  const provider = new StarkwareProvider(
    starkWallet,
    signerWallet,
    ropstenContractAddress
  )
  const web3 = new Web3(provider as any)

  it('getAccounts', async () => {
    const accounts = await web3.eth.getAccounts()
    expect(accounts.length).toBe(1)
    expect(accounts[0]).toBeTruthy()
  })

  it('extend', async () => {
    web3.eth.extend({
      methods: [
        {
          name: 'chainId',
          call: 'eth_chainId',
          outputFormatter: web3.utils.hexToNumber as any,
        },
      ],
    })

    const chainId = await (web3.eth as any).chainId()
    expect(chainId).toBe(3)
  })
})
