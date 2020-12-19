import { EventEmitter } from 'events'
import * as ethers from 'ethers'
import { sanitizeHex, numberToHex, isHexString } from 'enc-utils'
import WalletConnectClient from '@walletconnect/client'
import WalletConnect from 'walletconnect'
import StarkwareWallet from '@authereum/starkware-wallet'
import StarkwareController from '@authereum/starkware-controller'
import {
  getAssetType,
  quantizeAmount,
  Asset,
  getAssetId,
} from '@authereum/starkware-crypto'
import BasicProvider from 'basic-provider'
import { toWei } from 'web3-utils'

export interface AccountParams {
  layer: string
  application: string
  index: string
}

export interface RegisterUserParams {
  ethKey: string
  operatorSignature: string
}

export interface DepositParams {
  amount?: string
  asset: Asset
  vaultId: string
}

export interface DepositEthParams {
  amount: string
  quantum: string
  vaultId: string
}

export interface DepositErc20Params {
  amount: string
  quantum: string
  vaultId: string
  tokenAddress: string
}

export interface DepositErc721Params {
  tokenId: string
  vaultId: string
  tokenAddress: string
}

export interface DepositCancelParams {
  asset: Asset
  vaultId: string
}

export interface DepositParamsReclaimParams {
  vaultId: string
  asset: Asset
}

export interface WithdrawParams {
  asset: Asset
  recipient?: string
}

export interface WithdrawEthParams {
  quantum: string
  recipient?: string
}

export interface WithdrawErc20Params {
  quantum: string
  tokenAddress: string
  recipient?: string
}

export interface WithdrawErc721Params {
  tokenId: string
  tokenAddress: string
  recipient?: string
}

export interface WithdrawAndMintParams {
  asset: Asset
  mintingBlob: string
}

export interface EscapeParams {
  amount: string
  asset: Asset
  vaultId: string
}

export interface TransferPartyParams {
  starkKey: string
  vaultId: string
}

export interface TransferParams {
  from: TransferPartyParams
  to: TransferPartyParams
  asset: Asset
  amount?: string
  nonce: string
  expirationTimestamp: string
  condition?: string
}

export interface TransferEthParams {
  vaultId: string
  to: TransferPartyParams
  quantum: string
  amount: string
  nonce: string
  expirationTimestamp: string
  condition?: string
}

export interface TransferErc20Params {
  vaultId: string
  to: TransferPartyParams
  tokenAddress: string
  quantum: string
  amount: string
  nonce: string
  expirationTimestamp: string
  condition?: string
}

export interface TransferErc721Params {
  vaultId: string
  to: TransferPartyParams
  tokenAddress: string
  tokenId: string
  nonce: string
  expirationTimestamp: string
  condition?: string
}

export interface OrderAsset extends Asset {
  vaultId: string
  amount?: string
}

export interface OrderParams {
  sell: OrderAsset
  buy: OrderAsset
  nonce: string
  expirationTimestamp: string
}

interface IRpcConnection extends NodeJS.EventEmitter {
  connected: boolean

  send(payload: any): Promise<any>
  open(): Promise<void>
  close(): Promise<void>
}

class Connection extends EventEmitter implements IRpcConnection {
  connected: boolean = true
  _provider: any
  async send (payload: any): Promise<any> {
    return this._provider.resolve(payload)
  }
  async open (): Promise<void> {
    this.connected = true
  }
  async close (): Promise<void> {
    this.connected = false
  }
  setProvider (provider: any) {
    this._provider = provider
  }
}

function matches (a: any, b: any): boolean {
  if (typeof a !== typeof b) return false
  let match = true
  Object.keys(a).forEach(key => {
    if (a[key] !== b[key]) match = false
  })
  return match
}

class WalletConnectClientWrapper extends EventEmitter {
  _wc: WalletConnectClient | null = null

  constructor () {
    super()
    const session = this.getSession()
    if (session) {
      const walletConnector = new WalletConnectClient({ session })
      this._wc = walletConnector
      this._setupEvenEmitter()
    }
  }

  private _setupEvenEmitter () {
    // walletconnect doesn't have a way to unsubscribe from event emitter,
    // so we use a custom event emitter as a workaround.
    const events = [
      'connect',
      'disconnect',
      'session_request',
      'session_update',
      'call_request',
      'wc_sessionRequest',
      'wc_sessionUpdate',
      'error',
      'transport_open',
      'transport_close',
    ]
    for (const name of events) {
      this._wc?.on(name, (...args: any[]) => this.emit(name, ...args))
    }
  }

  public get connected (): boolean {
    return !!this._wc?.connected
  }

  public async connect (connectUri: string) {
    this._wc = new WalletConnectClient({
      uri: connectUri,
    })

    if (!this._wc?.connected) {
      await this.createSession()
    }

    this._setupEvenEmitter()
  }

  public createSession () {
    return this._wc?.createSession()
  }

  public killSession () {
    return this._wc?.killSession()
  }

  public approveSession (params: any) {
    return this._wc?.approveSession(params)
  }

  public rejectSession (params: any) {
    return this._wc?.approveSession(params)
  }

  public approveRequest (params: any) {
    return this._wc?.approveRequest(params)
  }

  public rejectRequest (params: any) {
    return this._wc?.rejectRequest(params)
  }

  public getSession () {
    try {
      // localStorage 'walletconnect' value is set by walletconnect library
      const session = localStorage.getItem('walletconnect')
      if (!session) {
        return null
      }

      return JSON.parse(session)
    } catch (err) {
      return null
    }
  }
}

export class WalletConnectProvider {
  _wc: WalletConnect | null = null

  constructor (wc: WalletConnect) {
    this._wc = wc
  }

  public async sendRequest (method: string, params: any = {}) {
    const customRequest: any = {
      id: Date.now(),
      jsonrpc: '2.0',
      method,
      params,
    }

    return this._wc?.connector?.sendCustomRequest(customRequest)
  }

  public async account (params: any) {
    const { starkKey } = await this.sendRequest('stark_account', params)
    return starkKey
  }

  public async requestAccounts () {
    const accounts = await this.sendRequest('eth_requestAccounts')
    return accounts
  }

  public async personalSign (msg: string) {
    const address = this._wc?.connector?.accounts[0]
    const signature = await this.sendRequest('personal_sign', [msg, address])
    return signature
  }

  public async registerUser (params: any) {
    const { txhash } = await this.sendRequest('stark_register', params)
    return txhash
  }

  public async deposit (params: any) {
    const { txhash } = await this.sendRequest('stark_deposit', params)
    return txhash
  }

  public async withdraw (params: any) {
    const { txhash } = await this.sendRequest('stark_withdraw', params)
    return txhash
  }

  public async transfer (params: any) {
    const { starkSignature } = await this.sendRequest('stark_transfer', params)
    return starkSignature
  }

  public async createOrder (params: any) {
    const { starkSignature } = await this.sendRequest(
      'stark_createOrder',
      params
    )
    return starkSignature
  }
}

// -- StarkwareProvider ---------------------------------------------------- //

class StarkwareProvider extends BasicProvider {
  private _accountParams: AccountParams | undefined
  private _starkWallet: StarkwareWallet
  private _signerWallet: ethers.Wallet
  private _controller: StarkwareController

  public wc: WalletConnectClientWrapper
  public contractAddress: string
  public starkKey: string | undefined

  constructor (
    starkWallet: StarkwareWallet,
    signerWallet: ethers.Wallet,
    contractAddress: string
  ) {
    const conn = new Connection()
    super(conn)
    conn.setProvider(this)

    this._starkWallet = starkWallet
    this._signerWallet = signerWallet
    this.contractAddress = contractAddress
    this._controller = new StarkwareController()
    this.wc = new WalletConnectClientWrapper()
  }

  static fromWalletConnect (wc: WalletConnect) {
    return new WalletConnectProvider(wc)
  }

  setContractAddress (contractAddress: string) {
    this.contractAddress = contractAddress
  }

  public async resolveResult (
    method: any,
    params: any,
    txOpts: any = {}
  ): Promise<any> {
    switch (method) {
      case 'stark_account': {
        const { layer, application, index } = params
        const starkKey = await this.account(layer, application, index)
        return {
          starkKey,
        }
      }
      case 'stark_register': {
        const txhash = await this.registerUser(params, txOpts)
        return { txhash }
      }
      case 'stark_deposit': {
        const txhash = await this.deposit(params, txOpts)
        return { txhash }
      }
      case 'stark_depositCancel': {
        const txhash = await this.cancelDeposit(params, txOpts)
        return { txhash }
      }
      case 'stark_depositReclaim': {
        const txhash = await this.reclaimDeposit(params, txOpts)
        return { txhash }
      }
      case 'stark_depositNft': {
        const txhash = await this.deposit(params, txOpts)
        return { txhash }
      }
      case 'stark_depositNftReclaim': {
        const txhash = await this.reclaimDeposit(params, txOpts)
        return { txhash }
      }
      case 'stark_withdraw': {
        const txhash = await this.withdraw(params, txOpts)
        return { txhash }
      }
      case 'stark_withdrawTo': {
        const txhash = await this.withdraw(params, txOpts)
        return { txhash }
      }
      case 'stark_fullWithdrawal': {
        const txhash = await this.fullWithdrawalRequest(params, txOpts)
        return { txhash }
      }
      case 'stark_withdrawAndMint': {
        const txhash = await this.withdrawAndMint(params, txOpts)
        return { txhash }
      }
      case 'stark_withdrawNft': {
        const txhash = await this.withdraw(params, txOpts)
        return { txhash }
      }
      case 'stark_withdrawNftTo': {
        const txhash = await this.withdraw(params, txOpts)
        return { txhash }
      }
      case 'stark_freeze': {
        const txhash = await this.freeze(params, txOpts)
        return { txhash }
      }
      case 'stark_escape': {
        const txhash = await this.escape(params, txOpts)
        return { txhash }
      }
      case 'stark_transfer': {
        const starkSignature = await this.transfer(params)
        return { starkSignature }
      }
      case 'stark_createOrder': {
        const starkSignature = await this.createOrder(params)
        return { starkSignature }
      }
      case 'personal_sign': {
        const message = params[0]
        return this.signMessage(message)
      }
      case 'eth_sign': {
        const message = params[1]
        return this.signMessage(message)
      }
      case 'eth_signTransaction': {
        const tx = params[1]
        return this.signTransaction(tx)
      }
      case 'eth_sendTransaction': {
        const tx = params[1]
        return this.sendTransaction(tx)
      }
      case 'eth_accounts': {
        const address = await this.getAddress()
        return [address]
      }
      case 'eth_requestAccounts': {
        const address = await this.getAddress()
        return [address]
      }
      default: {
        throw new Error(`Unknown Starkware RPC Method: ${method}`)
      }
    }
  }

  public async resolve (payload: any, txOpts: any = {}): Promise<any> {
    const { id, method, params } = payload

    try {
      const result = await this.resolveResult(method, params, txOpts)
      return { id, result }
    } catch (err) {
      return {
        id,
        error: {
          message: err.message,
        },
      }
    }
  }

  // -- public ---------------------------------------------------------------- //

  public async enable (
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    try {
      await this.open()
      const starkKey = await this.updateAccount(layer, application, index)
      this.emit('enable')
      return starkKey
    } catch (err) {
      await this.close()
      throw err
    }
  }

  public async updateAccount (
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    const accountParams: AccountParams = { layer, application, index }
    if (this.starkKey && matches(this._accountParams, accountParams)) {
      return this.starkKey
    }

    return this.account(layer, application, index)
  }

  public async getActiveAccount (): Promise<string> {
    if (!this._accountParams) {
      throw new Error('No StarkKey available - please call provider.enable()')
    }
    if (this.starkKey) {
      return this.starkKey
    }

    const { layer, application, index } = this._accountParams
    return this.account(layer, application, index)
  }

  public async account (
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    this._accountParams = { layer, application, index }
    const starkKey = await this._starkWallet.account(layer, application, index)
    this.starkKey = starkKey
    return starkKey
  }

  public async registerUser (
    input: RegisterUserParams,
    txOpts: any = {}
  ): Promise<string> {
    let { ethKey, operatorSignature } = input
    const starkKey = await this.getActiveAccount()

    let registeredEthKey = false
    try {
      // TODO
      /*
      registeredEthKey = !!(await this._controller.getEthKeyCall(
        starkKey,
        this.contractAddress,
        this._signerWallet.provider as any
      ))
			*/
    } catch (err) {
      // noop
    }

    if (registeredEthKey) {
      throw new Error('StarkKey is already registered')
    }

    const data = await this._controller.registerUser({
      ethKey,
      starkKey,
      operatorSignature,
    })
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async deposit (
    input: DepositParams,
    txOpts: any = {}
  ): Promise<string> {
    let { vaultId, amount, asset } = input
    const starkKey = await this.getActiveAccount()
    const assetType = getAssetType(asset)
    if (asset.type === 'ERC721') {
      const tokenId = asset.data.tokenId as string
      const data = await this._controller.depositNft({
        starkKey,
        assetType,
        vaultId,
        tokenId,
      })

      const txhash = await this._sendContractTransaction(data, txOpts)
      return txhash
    }

    let quantizedAmount: string | null = null
    let ethValue = ''
    if (asset.type === 'ETH') {
      ethValue = quantizeAmount(amount as string, asset.data.quantum as string)
    }
    if (asset.type == 'ERC20') {
      quantizedAmount = quantizeAmount(
        amount as string,
        asset.data.quantum as string
      )
    }

    const data = await this._controller.deposit({
      starkKey,
      assetType,
      vaultId,
      quantizedAmount,
    })

    txOpts.value = txOpts.value || ethValue
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async depositEth (
    input: DepositEthParams,
    txOpts: any = {}
  ): Promise<string> {
    const { amount, quantum, vaultId } = input
    return this.deposit(
      {
        vaultId,
        amount,
        asset: {
          type: 'ETH',
          data: {
            quantum,
          },
        },
      },
      txOpts
    )
  }

  public async depositErc20 (
    input: DepositErc20Params,
    txOpts: any = {}
  ): Promise<string> {
    const { amount, quantum, tokenAddress, vaultId } = input
    return this.deposit(
      {
        vaultId,
        amount,
        asset: {
          type: 'ERC20',
          data: {
            tokenAddress,
            quantum,
          },
        },
      },
      txOpts
    )
  }

  public async depositErc721 (
    input: DepositErc721Params,
    txOpts: any = {}
  ): Promise<string> {
    const { tokenId, tokenAddress, vaultId } = input
    return this.deposit(
      {
        vaultId,
        asset: {
          type: 'ERC721',
          data: {
            tokenAddress,
            tokenId,
          },
        },
      },
      txOpts
    )
  }

  public async cancelDeposit (
    input: DepositCancelParams,
    txOpts: any = {}
  ): Promise<string> {
    let { vaultId, asset } = input
    const starkKey = await this.getActiveAccount()
    const assetId = getAssetId(asset)
    const data = await this._controller.depositCancel({
      starkKey,
      assetId,
      vaultId,
    })
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async reclaimDeposit (
    input: DepositParamsReclaimParams,
    txOpts: any = {}
  ): Promise<string> {
    let { vaultId, asset } = input
    const starkKey = await this.getActiveAccount()
    const assetType = getAssetType(asset)

    if (asset.type === 'ERC721') {
      const tokenId = asset.data.tokenId as string
      const data = await this._controller.depositNftReclaim({
        starkKey,
        assetType,
        vaultId,
        tokenId,
      })

      const txhash = await this._sendContractTransaction(data, txOpts)
      return txhash
    }

    const data = await this._controller.depositReclaim({
      starkKey,
      assetType,
      vaultId,
    })

    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async withdraw (
    input: WithdrawParams,
    txOpts: any = {}
  ): Promise<string> {
    let { asset, recipient } = input
    const starkKey = await this.getActiveAccount()
    const assetType = getAssetType(asset)
    if (asset.type === 'ERC721') {
      const tokenId = asset.data.tokenId as string
      if (recipient) {
        const data = await this._controller.withdrawNftTo({
          starkKey,
          assetType,
          tokenId,
          recipient,
        })

        const txhash = await this._sendContractTransaction(data, txOpts)
        return txhash
      } else {
        const data = await this._controller.withdrawNft({
          starkKey,
          assetType,
          tokenId,
        })

        const txhash = await this._sendContractTransaction(data, txOpts)
        return txhash
      }
    }

    if (recipient) {
      const data = await this._controller.withdrawTo({
        starkKey,
        assetType,
        recipient,
      })

      const txhash = await this._sendContractTransaction(data, txOpts)
      return txhash
    } else {
      const data = await this._controller.withdraw({
        starkKey,
        assetType,
      })

      const txhash = await this._sendContractTransaction(data, txOpts)
      return txhash
    }
  }

  public async withdrawEth (
    input: WithdrawEthParams,
    txOpts: any = {}
  ): Promise<string> {
    const { quantum, recipient } = input

    return this.withdraw(
      {
        asset: {
          type: 'ETH',
          data: {
            quantum,
          },
        },
        recipient,
      },
      txOpts
    )
  }

  public async withdrawErc20 (
    input: WithdrawErc20Params,
    txOpts: any = {}
  ): Promise<string> {
    const { tokenAddress, quantum, recipient } = input

    return this.withdraw(
      {
        asset: {
          type: 'ERC20',
          data: {
            tokenAddress,
            quantum,
          },
        },
        recipient,
      },
      txOpts
    )
  }

  public async withdrawErc721 (
    input: WithdrawErc721Params,
    txOpts: any = {}
  ): Promise<string> {
    const { tokenAddress, tokenId, recipient } = input

    return this.withdraw(
      {
        asset: {
          type: 'ERC721',
          data: {
            tokenAddress,
            tokenId,
          },
        },
        recipient,
      },
      txOpts
    )
  }

  public async withdrawAndMint (
    input: WithdrawAndMintParams,
    txOpts: any = {}
  ): Promise<string> {
    const { asset, mintingBlob } = input
    const starkKey = await this.getActiveAccount()
    const assetType = getAssetType(asset)
    const data = await this._controller.withdrawAndMint({
      starkKey,
      assetType,
      mintingBlob,
    })

    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async fullWithdrawalRequest (
    vaultId: string,
    txOpts: any = {}
  ): Promise<string> {
    throw new Error('no implemented')
    /*
    const starkKey = await this.getActiveAccount()
    const data = await this._controller.fullWithdrawalRequest({
      starkKey,
      vaultId,
    })

    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
		*/
  }

  public async freeze (vaultId: string, txOpts: any = {}): Promise<string> {
    throw new Error('no implemented')
    /*
    const starkKey = await this.getActiveAccount()
    const data = await this._controller.freezeRequest({
      starkKey,
      vaultId,
    })

    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
		*/
  }

  public async escape (input: EscapeParams, txOpts: any = {}): Promise<string> {
    const { amount, asset, vaultId } = input
    const starkKey = await this.getActiveAccount()
    const assetId = getAssetId(asset)
    const quantizedAmount = quantizeAmount(
      amount as string,
      asset.data.quantum as string
    )
    const data = await this._controller.escape({
      starkKey,
      vaultId,
      assetId,
      quantizedAmount,
    })

    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async transfer (input: TransferParams): Promise<string> {
    const {
      from,
      to,
      asset,
      amount,
      nonce,
      expirationTimestamp,
      condition,
    } = input
    const assetId = getAssetId(asset)
    const quantizedAmount = quantizeAmount(
      amount as string,
      asset.data.quantum as string
    )
    const senderVaultId = from.vaultId
    const targetVaultId = to.vaultId
    const targetKey = input.to.starkKey

    const msgHash = await this._controller.transfer({
      quantizedAmount,
      nonce,
      senderVaultId,
      assetId,
      targetVaultId,
      targetKey,
      expirationTimestamp,
      condition,
    })

    const starkSignature = await this._starkWallet.sign(msgHash)
    return starkSignature
  }

  public async transferEth (input: TransferEthParams): Promise<string> {
    const starkKey = await this.getActiveAccount()
    const {
      vaultId,
      to,
      quantum,
      amount,
      nonce,
      expirationTimestamp,
      condition,
    } = input
    return this.transfer({
      from: {
        starkKey,
        vaultId,
      },
      to,
      asset: {
        type: 'ETH',
        data: {
          quantum,
        },
      },
      amount,
      nonce,
      expirationTimestamp,
      condition,
    })
  }

  public async transferErc20 (input: TransferErc20Params): Promise<string> {
    const starkKey = await this.getActiveAccount()
    const {
      vaultId,
      to,
      tokenAddress,
      quantum,
      amount,
      nonce,
      expirationTimestamp,
      condition,
    } = input
    return this.transfer({
      from: {
        starkKey,
        vaultId,
      },
      to,
      asset: {
        type: 'ERC20',
        data: {
          tokenAddress,
          quantum,
        },
      },
      amount,
      nonce,
      expirationTimestamp,
      condition,
    })
  }

  public async transferErc721 (input: TransferErc721Params): Promise<string> {
    const starkKey = await this.getActiveAccount()
    const {
      vaultId,
      to,
      tokenAddress,
      tokenId,
      nonce,
      expirationTimestamp,
      condition,
    } = input
    return this.transfer({
      from: {
        starkKey,
        vaultId,
      },
      to,
      asset: {
        type: 'ERC20',
        data: {
          tokenAddress,
          tokenId,
        },
      },
      nonce,
      expirationTimestamp,
      condition,
    })
  }

  public async createOrder (input: OrderParams): Promise<string> {
    const { sell, buy, nonce, expirationTimestamp } = input
    const sellVaultId = sell.vaultId
    const buyVaultId = buy.vaultId
    const sellAssetId = getAssetId(sell)
    const buyAssetId = getAssetId(buy)
    const sellQuantizedAmount = quantizeAmount(
      sell.amount as string,
      sell.data.quantum as string
    )
    const buyQuantizedAmount = quantizeAmount(
      buy.amount as string,
      buy.data.quantum as string
    )

    const msgHash = await this._controller.createOrder({
      sellVaultId,
      buyVaultId,
      sellQuantizedAmount,
      buyQuantizedAmount,
      sellAssetId,
      buyAssetId,
      nonce,
      expirationTimestamp,
    })

    const starkSignature = await this._starkWallet.sign(msgHash)
    return starkSignature
  }

  // stark 3.0 changes

  public async configurationHash (input: number) {
    throw new Error('not implemented')
  }

  public async globalConfigurationHash () {
    throw new Error('not implemented')
  }

  public async depositCancelDelay () {
    throw new Error('not implemented')
  }

  public async freezeGracePeriod () {
    throw new Error('not implemented')
  }

  public async mainGovernanceInfoTag () {
    throw new Error('not implemented')
  }

  public async maxVerifierCount () {
    throw new Error('not implemented')
  }

  public async unfreezeDelay () {
    throw new Error('not implemented')
  }

  public async verifierRemovalDelay () {
    throw new Error('not implemented')
  }

  public async announceAvailabilityVerifierRemovalIntent (verifier: string) {
    throw new Error('not implemented')
  }

  public async announceVerifierRemovalIntent (verifier: string) {
    throw new Error('not implemented')
  }

  public async getRegisteredAvailabilityVerifiers () {
    throw new Error('not implemented')
  }

  public async getRegisteredVerifiers () {
    throw new Error('not implemented')
  }

  public async isAvailabilityVerifier (verifierAddress: string) {
    throw new Error('not implemented')
  }

  public async isFrozen () {
    throw new Error('not implemented')
  }

  public async isVerifier (verifierAddress: string) {
    throw new Error('not implemented')
  }

  public async mainAcceptGovernance () {
    throw new Error('not implemented')
  }

  public async mainCancelNomination () {
    throw new Error('not implemented')
  }

  public async mainIsGovernor (testGovernor: string) {
    throw new Error('not implemented')
  }

  public async mainNominateNewGovernor (newGovernor: string) {
    throw new Error('not implemented')
  }

  public async mainRemoveGovernor (governorForRemoval: string) {
    throw new Error('not implemented')
  }

  public async registerAvailabilityVerifier (
    verifier: string,
    identifier: string
  ) {
    throw new Error('not implemented')
  }

  public async registerVerifier (verifier: string, identifier: string) {
    throw new Error('not implemented')
  }

  public async removeAvailabilityVerifier (verifier: string) {
    throw new Error('not implemented')
  }

  public async removeVerifier (verifier: string) {
    throw new Error('not implemented')
  }

  public async unFreeze () {
    throw new Error('not implemented')
  }

  public async getAssetInfo (assetType: string) {
    throw new Error('not implemented')
  }

  public async getCancellationRequest (
    starkKey: string,
    assetId: string,
    vaultId: string
  ) {
    throw new Error('not implemented')
  }

  public async getDepositBalance (
    starkKey: string,
    assetId: string,
    vaultId: string
  ) {
    throw new Error('not implemented')
  }

  public async getEthKey (starkKey: string) {
    throw new Error('not implemented')
  }

  public async getFullWithdrawalRequest (starkKey: string, vaultId: string) {
    throw new Error('not implemented')
  }

  public async getQuantizedDepositBalance (
    starkKey: string,
    assetId: string,
    vaultId: string
  ) {
    throw new Error('not implemented')
  }

  public async getQuantum (presumedAssetType: string) {
    throw new Error('not implemented')
  }

  public async getSystemAssetType () {
    throw new Error('not implemented')
  }

  public async getWithdrawalBalance (starkKey: string, assetId: string) {
    throw new Error('not implemented')
  }

  public async isTokenAdmin (testedAdmin: string) {
    throw new Error('not implemented')
  }

  public async isUserAdmin (testedAdmin: string) {
    throw new Error('not implemented')
  }

  public async registerSystemAssetType (assetType: string, assetInfo: string) {
    throw new Error('not implemented')
  }

  public async registerToken (a: string, b: string, c?: string) {
    throw new Error('not implemented')
  }

  public async registerTokenAdmin (newAdmin: string) {
    throw new Error('not implemented')
  }

  public async registerUserAdmin (newAdmin: string) {
    throw new Error('not implemented')
  }

  public async unregisterTokenAdmin (oldAdmin: string) {
    throw new Error('not implemented')
  }

  public async unregisterUserAdmin (oldAdmin: string) {
    throw new Error('not implemented')
  }

  public async getLastBatchId () {
    throw new Error('not implemented')
  }

  public async getOrderRoot () {
    throw new Error('not implemented')
  }

  public async getOrderTreeHeight () {
    throw new Error('not implemented')
  }

  public async getSequenceNumber () {
    throw new Error('not implemented')
  }

  public async getVaultRoot () {
    throw new Error('not implemented')
  }

  public async getVaultTreeHeight () {
    throw new Error('not implemented')
  }

  public async isOperator (testedOperator: string) {
    throw new Error('not implemented')
  }

  public async registerOperator (newOperator: string) {
    throw new Error('not implemented')
  }

  public async setAssetConfiguration (assetId: string, configHash: string) {
    throw new Error('not implemented')
  }

  public async setGlobalConfiguration (configHash: string) {
    throw new Error('not implemented')
  }

  public async unregisterOperator (removedOperator: string) {
    throw new Error('not implemented')
  }

  public async updateState (publicInput: string[], applicationData: string[]) {
    throw new Error('not implemented')
  }

  public async forcedTradeRequest (
    starkKeyA: string,
    starkKeyB: string,
    vaultIdA: string,
    vaultIdB: string,
    collateralAssetId: string,
    syntheticAssetId: string,
    amountCollateral: string,
    amountSynthetic: string,
    aIsBuyingSynthetic: string,
    nonce: string,
    signature: string
  ) {
    throw new Error('not implemented')
  }

  public async forcedWithdrawalRequest (
    starkKey: string,
    vaultId: string,
    quantizedAmount: string
  ) {
    throw new Error('not implemented')
  }

  public async getForcedTradeRequest (
    starkKeyA: string,
    starkKeyB: string,
    vaultIdA: string,
    vaultIdB: string,
    collateralAssetId: string,
    syntheticAssetId: string,
    amountCollateral: string,
    amountSynthetic: string,
    aIsBuyingSynthetic: boolean,
    nonce: string
  ) {
    throw new Error('not implemented')
  }

  public async getForcedWithdrawalRequest (
    starkKey: string,
    vaultId: string,
    quantizedAmount: string
  ) {
    throw new Error('not implemented')
  }

  // transaction and message signing

  public async starkSignMessage (message: any) {
    return this._starkWallet.sign(message)
  }

  public async signMessage (message: any) {
    return this._signerWallet.signMessage(message)
  }

  public async starkSignTransaction (tx: any) {
    return this._starkWallet.signTransaction(tx)
  }

  public async signTransaction (tx: any) {
    return this._signerWallet.signTransaction(tx)
  }

  public async starkSendTransaction (tx: any): Promise<any> {
    return this._starkWallet.sendTransaction(tx)
  }

  public async sendTransaction (unsignedTx: any): Promise<any> {
    if (unsignedTx.value) {
      if (!isHexString(unsignedTx.value)) {
        unsignedTx.value = sanitizeHex(numberToHex(unsignedTx.value))
      }
    }
    const populatedTx = await this._signerWallet.populateTransaction(unsignedTx)
    return this._signerWallet.sendTransaction(populatedTx)
  }

  public getAddress (): string {
    return this._signerWallet.address
  }

  private async _sendContractTransaction (data: string, txOpts: any = {}) {
    const unsignedTx = {
      to: this.contractAddress,
      data,
      ...txOpts,
      //gasLimit: '0x7a120', // 100k
      //gasLimit: '0x7a120', // 500k
      //gasLimit: '0xf4240' // 1M
    }

    const tx = await this.sendTransaction(unsignedTx)
    return tx.hash
  }
}

export default StarkwareProvider
