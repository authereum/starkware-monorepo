import { EventEmitter } from 'events'
import * as ethers from 'ethers'
import { sanitizeHex, numberToHex, isHexString } from 'enc-utils'
import WalletConnect from 'walletconnect'
import StarkwareWallet from '@authereum/starkware-wallet'
import StarkwareAbiEncoder from '@authereum/starkware-abi-encoder'
import {
  getAssetType,
  quantizeAmount,
  Asset,
  getAssetId,
  Signature,
} from '@authereum/starkware-crypto'
import BasicProvider, { IRpcConnection } from './BasicProvider'
import {
  StarkwareWalletConnectProvider,
  WalletConnectClientWrapper,
} from './connectors/StarkwareWalletConnectProvider'
import AuthereumProvider from './connectors/AuthereumProvider'
import {
  AccountParams,
  RegisterUserParams,
  DepositParams,
  DepositEthParams,
  DepositErc20Params,
  DepositErc721Params,
  DepositCancelParams,
  DepositParamsReclaimParams,
  WithdrawParams,
  WithdrawEthParams,
  WithdrawErc20Params,
  WithdrawErc721Params,
  WithdrawAndMintParams,
  EscapeParams,
  TransferPartyParams,
  TransferParams,
  TransferEthParams,
  TransferErc20Params,
  TransferErc721Params,
  OrderAsset,
  OrderParams,
  PerpetualAsset,
  PerpetualTransferMessenger,
  PerpetualTransferFee,
  PerpetualTransferParams,
  PerpetualLimitOrderParams,
  PerpetualWithdrawalParams,
} from './types'

class Connection extends EventEmitter implements IRpcConnection {
  connected: boolean = true
  _provider: any
  send = async (payload: any): Promise<any> => {
    let { method, params } = payload
    return this._provider.resolveResult(method, params)
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

// -- StarkwareProvider ---------------------------------------------------- //

class StarkwareProvider extends BasicProvider {
  private _accountParams: AccountParams | undefined
  private _starkWallet: StarkwareWallet
  private _signerWallet: ethers.Wallet
  private _abiEncoder: StarkwareAbiEncoder
  private _debug: boolean = false

  public wc: WalletConnectClientWrapper
  public contractAddress: string
  public starkKey: string | undefined

  constructor (
    starkWallet: StarkwareWallet,
    signerWallet: ethers.Wallet,
    contractAddress: string,
    connection: Connection = new Connection()
  ) {
    super(connection)
    connection.setProvider(this)

    this._starkWallet = starkWallet
    this._signerWallet = signerWallet
    this.contractAddress = contractAddress
    this._abiEncoder = new StarkwareAbiEndoer()
    this.wc = new WalletConnectClientWrapper()
  }

  private _debugLog = (...args: any) => {
    if (!this._debug) {
      return
    }

    console.debug('[stark-provider]', ...args)
  }

  static fromWalletConnect (wc: WalletConnect) {
    return new StarkwareWalletConnectProvider(wc)
  }

  static fromAuthereum (authereumInstance: any) {
    return new AuthereumProvider(authereumInstance)
  }

  setSigner (signerWallet: ethers.Wallet) {
    this._debugLog('setSigner', signerWallet)
    this._signerWallet = signerWallet
  }

  setContractAddress (contractAddress: string) {
    this._debugLog('setContractAddress', contractAddress)
    this.contractAddress = contractAddress
  }

  setDebug (debug: boolean) {
    this._debug = debug
    this._starkWallet.setDebug(debug)
  }

  public resolveResult = async (
    method: any,
    params: any,
    txOpts: any = {}
  ): Promise<any> => {
    this._debugLog('resolveResult', method, params)
    if (typeof method !== 'string') {
      // TODO: fix
      ;({ method, params } = method)
    }

    switch (method) {
      case 'stark_account': {
        const { layer, application, index } = params
        const starkKey = await this.account(layer, application, index)
        return {
          starkKey,
        }
      }
      case 'stark_updateAccount': {
        const { layer, application, index } = params
        return this.updateAccount(layer, application, index)
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
        const txhash = await this.freezeRequest(params, txOpts)
        return { txhash }
      }
      case 'stark_escape': {
        const txhash = await this.escape(params, txOpts)
        return { txhash }
      }
      case 'stark_transfer': {
        this._debugLog('stark_transfer', params)
        const starkSignature = await this.transfer(params)
        this._debugLog('stark_transfer', 'signature', starkSignature)
        return { starkSignature }
      }
      case 'stark_createOrder': {
        const starkSignature = await this.createOrder(params)
        return { starkSignature }
      }
      case 'stark_perpetualTransfer': {
        const starkSignature = await this.perpetualTransfer(params)
        return { starkSignature }
      }
      case 'stark_perpetualLimitOrder': {
        const starkSignature = await this.perpetualLimitOrder(params)
        return { starkSignature }
      }
      case 'stark_perpetualWithdrawal': {
        const starkSignature = await this.perpetualWithdrawal(params)
        return { starkSignature }
      }
      case 'personal_sign': {
        const message = params[0]
        return this.personalSign(message)
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
        const tx = params[1] || params[0]
        this._debugLog('eth_sendTransaction', tx)
        const txRes = await this.sendTransaction(tx)
        return txRes.hash
      }
      case 'eth_accounts': {
        const address = await this.getAddress()
        if (address) {
          return [address]
        }

        return []
      }
      case 'eth_requestAccounts': {
        return this.requestAccounts()
      }
      case 'net_version': {
        return this._signerWallet.getChainId()
      }
      case 'eth_chainId': {
        return this._signerWallet.getChainId()
      }
      case 'eth_coinbase': {
        const address = await this.getAddress()
        return address
      }
      case 'eth_blockNumber': {
        return this._signerWallet.provider.getBlockNumber()
      }
      case 'eth_getBalance': {
        return this._signerWallet.getBalance()
      }
      case 'eth_getTransactionCount': {
        return this._signerWallet.getTransactionCount()
      }
      case 'eth_getTransactionCount': {
        throw new Error('not implemented')
      }
      case 'eth_getCode': {
        throw new Error('not implemented')
      }
      case 'eth_getCode': {
        throw new Error('not implemented')
      }
      case 'eth_sendRawTransaction': {
        throw new Error('not implemented')
      }
      case 'eth_getTransactionByHash': {
        throw new Error('not implemented')
      }
      case 'eth_getTransactionReceipt': {
        throw new Error('not implemented')
      }
      case 'eth_getBlockByNumber': {
        throw new Error('not implemented')
      }
      case 'eth_getBlockByHash': {
        throw new Error('not implemented')
      }
      case 'eth_estimateGas': {
        return this._signerWallet.estimateGas(params)
      }
      case 'eth_gasPrice': {
        return this._signerWallet.getGasPrice()
      }
      case 'eth_call': {
        return this._signerWallet.call(params)
      }
      default: {
        console.debug('METHOD:', method, 'PARAMS:', params)
        throw new Error(`Unknown Starkware RPC Method: ${method}`)
      }
    }
  }

  public async resolve (payload: any, txOpts: any = {}): Promise<any> {
    this._debugLog('resolve', payload)
    let { id, method, params } = payload

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
  ): Promise<string[]> {
    this._debugLog('enable', layer, application, index)
    try {
      await this.open()
      const starkKey = await this.updateAccount(layer, application, index)
      this._debugLog('enable starkkey', starkKey)
      this.emit('enable')
      return this.requestAccounts()
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
    this._debugLog('updateAccount', layer, application, index)
    if (layer) {
      const accountParams: AccountParams = { layer, application, index }
      if (this.starkKey && matches(this._accountParams, accountParams)) {
        return this.starkKey
      }
    }

    return this.account(layer, application, index)
  }

  public async getActiveAccount (): Promise<string> {
    this._debugLog('getActiveAccount')
    if (!this._accountParams) {
      throw new Error('No StarkKey available - please call provider.enable()')
    }
    if (this.starkKey) {
      this._debugLog('getActiveAccount', 'this.starkKey')
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
    if (application) {
      this._accountParams = { layer, application, index }
    } else if (this._accountParams) {
      layer = this._accountParams.layer
      application = this._accountParams.application
      index = this._accountParams.index
    }

    this._debugLog('account', layer, application, index)
    const starkKey = await this._starkWallet.account(layer, application, index)
    this.starkKey = starkKey
    return starkKey
  }

  public async requestAccounts (): Promise<string[]> {
    this._debugLog('requestAccounts')
    const address = await this.getAddress()
    if (address) {
      return [address]
    }

    return []
  }

  public async personalSign (message: string): Promise<string> {
    this._debugLog('requestAccounts')
    return this.signMessage(message)
  }

  public async registerUser (
    input: RegisterUserParams,
    txOpts: any = {}
  ): Promise<string> {
    let { ethKey, operatorSignature } = input
    const starkKey = await this.getActiveAccount()

    let registeredEthKey = false
    try {
      registeredEthKey = !!(await this.getEthKey(starkKey, txOpts))
    } catch (err) {
      // noop
    }

    if (registeredEthKey) {
      throw new Error('StarkKey is already registered')
    }

    const data = await this._abiEncoder.registerUser({
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
      const data = await this._abiEncoder.depositNft({
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

    const data = await this._abiEncoder.deposit({
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
    const data = await this._abiEncoder.depositCancel({
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
      const data = await this._abiEncoder.depositNftReclaim({
        starkKey,
        assetType,
        vaultId,
        tokenId,
      })

      const txhash = await this._sendContractTransaction(data, txOpts)
      return txhash
    }

    const data = await this._abiEncoder.depositReclaim({
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
        const data = await this._abiEncoder.withdrawNftTo({
          starkKey,
          assetType,
          tokenId,
          recipient,
        })

        const txhash = await this._sendContractTransaction(data, txOpts)
        return txhash
      } else {
        const data = await this._abiEncoder.withdrawNft({
          starkKey,
          assetType,
          tokenId,
        })

        const txhash = await this._sendContractTransaction(data, txOpts)
        return txhash
      }
    }

    if (recipient) {
      const data = await this._abiEncoder.withdrawTo({
        starkKey,
        assetType,
        recipient,
      })

      const txhash = await this._sendContractTransaction(data, txOpts)
      return txhash
    } else {
      const data = await this._abiEncoder.withdraw({
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
    const data = await this._abiEncoder.withdrawAndMint({
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
    throw new Error('not implemented')
    /*
    const starkKey = await this.getActiveAccount()
    const data = await this._abiEncoder.fullWithdrawalRequest({
      starkKey,
      vaultId,
    })

    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
		*/
  }

  public async freezeRequest (
    vaultId: string,
    quantizedAmount: string,
    txOpts: any = {}
  ): Promise<string> {
    const starkKey = await this.getActiveAccount()
    const data = await this._abiEncoder.freezeRequest({
      starkKey,
      vaultId,
      quantizedAmount,
    })

    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async freezeRequestTrade (
    starkKeyA: string,
    starkKeyB: string,
    vaultIdA: string,
    vaultIdB: string,
    collateralAssetId: string,
    syntheticAssetId: string,
    amountCollateral: string,
    amountSynthetic: string,
    aIsBuyingSynthetic: boolean,
    nonce: string,
    txOpts: any = {}
  ): Promise<string> {
    const starkKey = await this.getActiveAccount()
    const data = await this._abiEncoder.freezeRequestTrade(
      starkKeyA,
      starkKeyB,
      vaultIdA,
      vaultIdB,
      collateralAssetId,
      syntheticAssetId,
      amountCollateral,
      amountSynthetic,
      aIsBuyingSynthetic,
      nonce
    )

    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async escape (input: EscapeParams, txOpts: any = {}): Promise<string> {
    const { amount, asset, vaultId } = input
    const starkKey = await this.getActiveAccount()
    const assetId = getAssetId(asset)
    const quantizedAmount = quantizeAmount(
      amount as string,
      asset.data.quantum as string
    )
    const data = await this._abiEncoder.escape({
      starkKey,
      vaultId,
      assetId,
      quantizedAmount,
    })

    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async transfer (input: TransferParams): Promise<Signature> {
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

    const msgHash = await this._abiEncoder.transfer({
      quantizedAmount,
      nonce,
      senderVaultId,
      assetId,
      targetVaultId,
      targetKey,
      expirationTimestamp,
      condition,
    })

    this._debugLog('transfer', 'msgHash', msgHash)
    const starkSignature = await this._starkWallet.sign(msgHash)
    return starkSignature
  }

  public async transferEth (input: TransferEthParams): Promise<Signature> {
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

  public async transferErc20 (input: TransferErc20Params): Promise<Signature> {
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

  public async transferErc721 (
    input: TransferErc721Params
  ): Promise<Signature> {
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

  public async createOrder (input: OrderParams): Promise<Signature> {
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

    const msgHash = await this._abiEncoder.createOrder({
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

  public async configurationHash (input: string, txOpts: any = {}) {
    const data = await this._abiEncoder.configurationHash(input)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.configurationHash,
      result
    )
  }

  public async globalConfigurationHash (txOpts: any = {}) {
    const data = await this._abiEncoder.globalConfigurationHash()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.globalConfigurationHash,
      result
    )
  }

  public async depositCancelDelay (txOpts: any = {}) {
    const data = await this._abiEncoder.depositCancelDelay()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.depositCancelDelay,
      result
    )
  }

  public async freezeGracePeriod (txOpts: any = {}) {
    const data = await this._abiEncoder.freezeGracePeriod()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.freezeGracePeriod,
      result
    )
  }

  public async mainGovernanceInfoTag (txOpts: any = {}) {
    const data = await this._abiEncoder.mainGovernanceInfoTag()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.mainGovernanceInfoTag,
      result
    )
  }

  public async maxVerifierCount (txOpts: any = {}) {
    const data = await this._abiEncoder.maxVerifierCount()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.maxVerifierCount,
      result
    )
  }

  public async unfreezeDelay (txOpts: any = {}) {
    const data = await this._abiEncoder.unfreezeDelay()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.unfreezeDelay,
      result
    )
  }

  public async verifierRemovalDelay (txOpts: any = {}) {
    const data = await this._abiEncoder.verifierRemovalDelay()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.verifierRemovalDelay,
      result
    )
  }

  public async announceAvailabilityVerifierRemovalIntent (
    verifier: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.announceAvailabilityVerifierRemovalIntent(
      verifier
    )
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.announceVerifierRemovalIntent,
      result
    )
  }

  public async announceVerifierRemovalIntent (
    verifier: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.announceVerifierRemovalIntent(verifier)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async getRegisteredAvailabilityVerifiers (txOpts: any = {}) {
    const data = await this._abiEncoder.getRegisteredAvailabilityVerifiers()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getRegisteredAvailabilityVerifiers,
      result
    )
  }

  public async getRegisteredVerifiers (txOpts: any = {}) {
    const data = await this._abiEncoder.getRegisteredVerifiers()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getRegisteredVerifiers,
      result
    )
  }

  public async isAvailabilityVerifier (
    verifierAddress: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.isAvailabilityVerifier(verifierAddress)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.isAvailabilityVerifier,
      result
    )
  }

  public async isFrozen (txOpts: any = {}) {
    const data = await this._abiEncoder.isFrozen()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(this._abiEncoder.isFrozen, result)
  }

  public async isVerifier (verifierAddress: string, txOpts: any = {}) {
    const data = await this._abiEncoder.isVerifier(verifierAddress)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(this._abiEncoder.isVerifier, result)
  }

  public async mainAcceptGovernance (txOpts: any = {}) {
    const data = await this._abiEncoder.mainAcceptGovernance()
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async mainCancelNomination (txOpts: any = {}) {
    const data = await this._abiEncoder.mainCancelNomination()
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async mainIsGovernor (testGovernor: string, txOpts: any = {}) {
    const data = await this._abiEncoder.mainIsGovernor(testGovernor)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.mainIsGovernor,
      result
    )
  }

  public async mainNominateNewGovernor (newGovernor: string, txOpts: any = {}) {
    const data = await this._abiEncoder.mainNominateNewGovernor(newGovernor)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.mainNominateNewGovernor,
      result
    )
  }

  public async mainRemoveGovernor (
    governorForRemoval: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.mainRemoveGovernor(governorForRemoval)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async registerAvailabilityVerifier (
    verifier: string,
    identifier: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.registerAvailabilityVerifier(
      verifier,
      identifier
    )
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async registerVerifier (
    verifier: string,
    identifier: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.registerVerifier(verifier, identifier)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async removeAvailabilityVerifier (verifier: string, txOpts: any = {}) {
    const data = await this._abiEncoder.removeAvailabilityVerifier(verifier)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async removeVerifier (verifier: string, txOpts: any = {}) {
    const data = await this._abiEncoder.removeVerifier(verifier)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async unFreeze (txOpts: any = {}) {
    const data = await this._abiEncoder.unFreeze()
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async getAssetInfo (assetType: string, txOpts: any = {}) {
    const data = await this._abiEncoder.getAssetInfo(assetType)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getAssetInfo,
      result
    )
  }

  public async getCancellationRequest (
    starkKey: string,
    assetId: string,
    vaultId: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.getCancellationRequest(
      starkKey,
      assetId,
      vaultId
    )
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getCancellationRequest,
      result
    )
  }

  public async getDepositBalance (
    starkKey: string,
    assetId: string,
    vaultId: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.getDepositBalance(
      starkKey,
      assetId,
      vaultId
    )
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getDepositBalance,
      result
    )
  }

  public async getEthKey (starkKey: string, txOpts: any = {}) {
    const data = await this._abiEncoder.getEthKey(starkKey)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(this._abiEncoder.getEthKey, result)
  }

  public async getFullWithdrawalRequest (
    starkKey: string,
    vaultId: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.getFullWithdrawalRequest(
      starkKey,
      vaultId
    )
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getFullWithdrawalRequest,
      result
    )
  }

  public async getQuantizedDepositBalance (
    starkKey: string,
    assetId: string,
    vaultId: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.getQuantizedDepositBalance(
      starkKey,
      assetId,
      vaultId
    )
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getQuantizedDepositBalance,
      result
    )
  }

  public async getQuantum (presumedAssetType: string, txOpts: any = {}) {
    const data = await this._abiEncoder.getQuantum(presumedAssetType)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(this._abiEncoder.getQuantum, result)
  }

  public async getSystemAssetType (txOpts: any = {}) {
    const data = await this._abiEncoder.getSystemAssetType()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getSystemAssetType,
      result
    )
  }

  public async getWithdrawalBalance (
    starkKey: string,
    assetId: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.getWithdrawalBalance(starkKey, assetId)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getWithdrawalBalance,
      result
    )
  }

  public async isTokenAdmin (testedAdmin: string, txOpts: any = {}) {
    const data = await this._abiEncoder.isTokenAdmin(testedAdmin)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.isTokenAdmin,
      result
    )
  }

  public async isUserAdmin (testedAdmin: string, txOpts: any = {}) {
    const data = await this._abiEncoder.isUserAdmin(testedAdmin)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.isUserAdmin,
      result
    )
  }

  public async registerSystemAssetType (
    assetType: string,
    assetInfo: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.registerSystemAssetType(
      assetType,
      assetInfo
    )
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async registerToken (
    a: string,
    b: string,
    c?: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.registerToken(a, b)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async registerTokenAdmin (newAdmin: string, txOpts: any = {}) {
    const data = await this._abiEncoder.registerTokenAdmin(newAdmin)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async registerUserAdmin (newAdmin: string, txOpts: any = {}) {
    const data = await this._abiEncoder.registerUserAdmin(newAdmin)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async unregisterTokenAdmin (oldAdmin: string, txOpts: any = {}) {
    const data = await this._abiEncoder.unregisterTokenAdmin(oldAdmin)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async unregisterUserAdmin (oldAdmin: string, txOpts: any = {}) {
    const data = await this._abiEncoder.unregisterUserAdmin(oldAdmin)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async getLastBatchId (txOpts: any = {}) {
    const data = await this._abiEncoder.getLastBatchId()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getLastBatchId,
      result
    )
  }

  public async getOrderRoot (txOpts: any = {}) {
    const data = await this._abiEncoder.getOrderRoot()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getOrderRoot,
      result
    )
  }

  public async getOrderTreeHeight (txOpts: any = {}) {
    const data = await this._abiEncoder.getOrderTreeHeight()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getOrderTreeHeight,
      result
    )
  }

  public async getSequenceNumber (txOpts: any = {}) {
    const data = await this._abiEncoder.getSequenceNumber()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getSequenceNumber,
      result
    )
  }

  public async getVaultRoot (txOpts: any = {}) {
    const data = await this._abiEncoder.getVaultRoot()
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getVaultRoot,
      result
    )
  }

  public async getVaultTreeHeight (txOpts: any = {}) {
    const data = await this._abiEncoder.getVaultTreeHeight()
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async isOperator (testedOperator: string, txOpts: any = {}) {
    const data = await this._abiEncoder.isOperator(testedOperator)
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(this._abiEncoder.isOperator, result)
  }

  public async registerOperator (newOperator: string, txOpts: any = {}) {
    const data = await this._abiEncoder.registerOperator(newOperator)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async setAssetConfiguration (
    assetId: string,
    configHash: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.setAssetConfiguration(
      assetId,
      configHash
    )
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async setGlobalConfiguration (configHash: string, txOpts: any = {}) {
    const data = await this._abiEncoder.setGlobalConfiguration(configHash)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async unregisterOperator (removedOperator: string, txOpts: any = {}) {
    const data = await this._abiEncoder.unregisterOperator(removedOperator)
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async updateState (
    publicInput: string[],
    applicationData: string[],
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.updateState(
      publicInput,
      applicationData
    )
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
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
    aIsBuyingSynthetic: boolean,
    nonce: string,
    signature: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.forcedTradeRequest(
      starkKeyA,
      starkKeyB,
      vaultIdA,
      vaultIdB,
      collateralAssetId,
      syntheticAssetId,
      amountCollateral,
      amountSynthetic,
      aIsBuyingSynthetic,
      nonce,
      signature
    )
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
  }

  public async forcedWithdrawalRequest (
    starkKey: string,
    vaultId: string,
    quantizedAmount: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.forcedWithdrawalRequest(
      starkKey,
      vaultId,
      quantizedAmount
    )
    const txhash = await this._sendContractTransaction(data, txOpts)
    return txhash
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
    nonce: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.getForcedTradeRequest(
      starkKeyA,
      starkKeyB,
      vaultIdA,
      vaultIdB,
      collateralAssetId,
      syntheticAssetId,
      amountCollateral,
      amountSynthetic,
      aIsBuyingSynthetic,
      nonce
    )
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getForcedTradeRequest,
      result
    )
  }

  public async getForcedWithdrawalRequest (
    starkKey: string,
    vaultId: string,
    quantizedAmount: string,
    txOpts: any = {}
  ) {
    const data = await this._abiEncoder.getForcedWithdrawalRequest(
      starkKey,
      vaultId,
      quantizedAmount
    )
    const result = await this._callContract(data, txOpts)
    return this._abiEncoder.parseReturnData(
      this._abiEncoder.getForcedWithdrawalRequest,
      result
    )
  }

  public async perpetualTransfer (
    params: PerpetualTransferParams
  ): Promise<Signature> {
    const {
      asset,
      fee,
      sender,
      receiver,
      nonce,
      expirationTimestamp,
      condition,
    } = params
    const assetId = getAssetId(asset)
    const assetIdFee = getAssetId(fee)
    const amount = asset.amount as string
    const receiverPublicKey = receiver.starkKey as string
    const senderPositionId = sender.positionId as string
    const receiverPositionId = receiver.positionId as string
    const feePositionId = fee.positionId as string
    const maxAmountFee = fee.maxAmount as string

    const msgHash = await this._abiEncoder.perpetualTransfer({
      assetId,
      assetIdFee,
      receiverPublicKey,
      senderPositionId,
      receiverPositionId,
      feePositionId,
      nonce,
      amount,
      maxAmountFee,
      expirationTimestamp,
      condition,
    })

    const starkSignature = await this._starkWallet.sign(msgHash)
    return starkSignature
  }

  public async perpetualLimitOrder (
    params: PerpetualLimitOrderParams
  ): Promise<Signature> {
    const {
      syntheticAsset,
      collateralAsset,
      isBuyingSynthetic,
      fee,
      nonce,
      positionId,
      expirationTimestamp,
    } = params
    const assetIdSynthetic = getAssetId(syntheticAsset)
    const assetIdCollateral = getAssetId(collateralAsset)
    const assetIdFee = getAssetId(fee)
    const amountSynthetic = syntheticAsset.amount as string
    const amountCollateral = collateralAsset.amount as string
    const amountFee = fee.amount as string

    const msgHash = await this._abiEncoder.perpetualLimitOrder({
      assetIdSynthetic,
      assetIdCollateral,
      isBuyingSynthetic,
      assetIdFee,
      amountSynthetic,
      amountCollateral,
      amountFee,
      nonce,
      positionId,
      expirationTimestamp,
    })

    const starkSignature = await this._starkWallet.sign(msgHash)
    return starkSignature
  }

  public async perpetualWithdrawal (
    params: PerpetualWithdrawalParams
  ): Promise<Signature> {
    const { collateralAsset, positionId, nonce, expirationTimestamp } = params
    const assetIdCollateral = getAssetId(collateralAsset)
    const amount = collateralAsset.amount as string
    const msgHash = await this._abiEncoder.perpetualWithdrawal({
      assetIdCollateral,
      positionId,
      nonce,
      expirationTimestamp,
      amount,
    })

    const starkSignature = await this._starkWallet.sign(msgHash)
    return starkSignature
  }

  // transaction and message signing

  public async starkSignMessage (message: any): Promise<Signature> {
    return this._starkWallet.sign(message)
  }

  public async signMessage (message: any): Promise<string> {
    this._debugLog('signMessage', message)
    return this._signerWallet.signMessage(message)
  }

  public async starkSignTransaction (tx: any): Promise<string> {
    return this._starkWallet.signTransaction(tx)
  }

  public async signTransaction (tx: any): Promise<string> {
    return this._signerWallet.signTransaction(tx)
  }

  public async starkSendTransaction (tx: any): Promise<any> {
    return this._starkWallet.sendTransaction(tx)
  }

  public async sendTransaction (unsignedTx: any): Promise<any> {
    this._debugLog('sendTransaction', unsignedTx)
    if (unsignedTx.value) {
      if (!isHexString(unsignedTx.value)) {
        unsignedTx.value = sanitizeHex(numberToHex(unsignedTx.value))
      }
    }
    if (unsignedTx.gas) {
      unsignedTx.gasLimit = unsignedTx.gas
      delete unsignedTx.gas
    }
    if (unsignedTx.from) {
      // checksum
      unsignedTx.from = ethers.utils.getAddress(unsignedTx.from)
    }
    const populatedTx = await this._signerWallet.populateTransaction(unsignedTx)
    this._debugLog(
      'sendTransaction signerAddress',
      await this._signerWallet.getAddress()
    )
    return this._signerWallet.sendTransaction(populatedTx)
  }

  public getAddress = (): Promise<string> => {
    this._debugLog('getAddress')
    return this._signerWallet.getAddress()
  }

  private async _callContract (data: string, txOpts: any = {}) {
    this._debugLog('_callContract', data, txOpts)
    const unsignedTx = {
      to: this.contractAddress,
      data,
      ...txOpts,
      gasLimit: '0x7a120', // 500k
    }

    const populatedTx = await this._signerWallet.populateTransaction(unsignedTx)
    return this._signerWallet.provider.call(populatedTx)
  }

  private async _sendContractTransaction (data: string, txOpts: any = {}) {
    this._debugLog('_sendContractTransaction', data, txOpts)
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
