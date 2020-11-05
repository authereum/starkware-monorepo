import { EventEmitter } from 'events'
import StarkwareWallet from '@authereum/starkware-wallet'
import StarkwareController from '@authereum/starkware-controller'
import {
  AccountParams,
  getAssetType,
  quantizeAmount,
  Asset,
  getAssetId,
} from '@authereum/starkware-crypto'
import BasicProvider from 'basic-provider'
import { toWei } from 'web3-utils'

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

// -- StarkwareProvider ---------------------------------------------------- //

class StarkwareProvider extends BasicProvider {
  private _accountParams: AccountParams | undefined
  private _wallet: StarkwareWallet
  private _controller: StarkwareController

  public readonly contractAddress: string
  public starkKey: string | undefined

  constructor (wallet: StarkwareWallet, contractAddress: string) {
    const conn = new Connection()
    super(conn)
    conn.setProvider(this)

    this._wallet = wallet
    this.contractAddress = contractAddress
    this._controller = new StarkwareController()
  }

  public async resolveResult (method: any, params: any): Promise<any> {
    switch (method) {
      case 'stark_account': {
        const { layer, application, index } = params
        const starkKey = await this.account(layer, application, index)
        return {
          starkKey,
        }
      }
      case 'stark_register': {
        const txhash = await this.registerUser(params)
        return { txhash }
      }
      case 'stark_deposit': {
        const txhash = await this.deposit(params)
        return { txhash }
      }
      case 'stark_depositCancel': {
        const txhash = await this.cancelDeposit(params)
        return { txhash }
      }
      case 'stark_depositReclaim': {
        const txhash = await this.reclaimDeposit(params)
        return { txhash }
      }
      case 'stark_depositNft': {
        const txhash = await this.reclaimDeposit(params)
        return { txhash }
      }
      case 'stark_depositNftReclaim': {
        const txhash = await this.reclaimDeposit(params)
        return { txhash }
      }
      case 'stark_withdraw': {
        const txhash = await this.withdraw(params)
        return { txhash }
      }
      case 'stark_withdrawTo': {
        const txhash = await this.withdraw(params)
        return { txhash }
      }
      case 'stark_fullWithdrawal': {
        const txhash = await this.fullWithdrawalRequest(params)
        return { txhash }
      }
      case 'stark_withdrawAndMint': {
        const txhash = await this.withdrawAndMint(params)
        return { txhash }
      }
      case 'stark_withdrawNft': {
        const txhash = await this.withdraw(params)
        return { txhash }
      }
      case 'stark_withdrawNftTo': {
        const txhash = await this.withdraw(params)
        return { txhash }
      }
      case 'stark_freeze': {
        const txhash = await this.freeze(params)
        return { txhash }
      }
      case 'stark_escape': {
        const txhash = await this.escape(params)
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
      default: {
        throw new Error(`Unknown Starkware RPC Method: ${method}`)
      }
    }
  }

  public async resolve (payload: any): Promise<any> {
    const { id, method, params } = payload

    try {
      const result = await this.resolveResult(method, params)
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
    const starkKey = await this._wallet.account(layer, application, index)
    this.starkKey = starkKey
    return starkKey
  }

  public async registerUser (input: RegisterUserParams): Promise<string> {
    let { ethKey, operatorSignature } = input
    const starkKey = await this.getActiveAccount()
    const data = await this._controller.registerUser({
      ethKey,
      starkKey,
      operatorSignature,
    })
    const txhash = await this._sendContractTransaction(data)
    return txhash
  }

  public async deposit (input: DepositParams): Promise<string> {
    let { vaultId, amount, asset } = input
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

      const txhash = await this._sendContractTransaction(data)
      return txhash
    }

    let quantizedAmount = ''
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

    let wei = ''
    if (ethValue) {
      wei = toWei(ethValue)
    }

    const txhash = await this._sendContractTransaction(data, wei)
    return txhash
  }

  public async depositEth (input: DepositEthParams): Promise<string> {
    const { amount, quantum, vaultId } = input
    return this.deposit({
      vaultId,
      amount,
      asset: {
        type: 'ETH',
        data: {
          quantum,
        },
      },
    })
  }

  public async depositErc20 (input: DepositErc20Params): Promise<string> {
    const { amount, quantum, tokenAddress, vaultId } = input
    return this.deposit({
      vaultId,
      amount,
      asset: {
        type: 'ERC20',
        data: {
          tokenAddress,
          quantum,
        },
      },
    })
  }

  public async depositErc721 (input: DepositErc721Params): Promise<string> {
    const { tokenId, tokenAddress, vaultId } = input
    return this.deposit({
      vaultId,
      asset: {
        type: 'ERC721',
        data: {
          tokenAddress,
          tokenId,
        },
      },
    })
  }

  public async cancelDeposit (input: DepositCancelParams): Promise<string> {
    let { vaultId, asset } = input
    const starkKey = await this.getActiveAccount()
    const assetId = getAssetId(asset)
    const data = await this._controller.depositCancel({
      starkKey,
      assetId,
      vaultId,
    })
    const txhash = await this._sendContractTransaction(data)
    return txhash
  }

  public async reclaimDeposit (
    input: DepositParamsReclaimParams
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

      const txhash = await this._sendContractTransaction(data)
      return txhash
    }

    const data = await this._controller.depositReclaim({
      starkKey,
      assetType,
      vaultId,
    })

    const txhash = await this._sendContractTransaction(data)
    return txhash
  }

  public async withdraw (input: WithdrawParams): Promise<string> {
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

        const txhash = await this._sendContractTransaction(data)
        return txhash
      } else {
        const data = await this._controller.withdrawNft({
          starkKey,
          assetType,
          tokenId,
        })

        const txhash = await this._sendContractTransaction(data)
        return txhash
      }
    }

    if (recipient) {
      const data = await this._controller.withdrawTo({
        starkKey,
        assetType,
        recipient,
      })

      const txhash = await this._sendContractTransaction(data)
      return txhash
    } else {
      const data = await this._controller.withdraw({
        starkKey,
        assetType,
      })

      const txhash = await this._sendContractTransaction(data)
      return txhash
    }
  }

  public async withdrawEth (input: WithdrawEthParams): Promise<string> {
    const { quantum, recipient } = input

    return this.withdraw({
      asset: {
        type: 'ETH',
        data: {
          quantum,
        },
      },
      recipient,
    })
  }

  public async withdrawErc20 (input: WithdrawErc20Params): Promise<string> {
    const { tokenAddress, quantum, recipient } = input

    return this.withdraw({
      asset: {
        type: 'ERC20',
        data: {
          tokenAddress,
          quantum,
        },
      },
      recipient,
    })
  }

  public async withdrawErc721 (input: WithdrawErc721Params): Promise<string> {
    const { tokenAddress, tokenId, recipient } = input

    return this.withdraw({
      asset: {
        type: 'ERC721',
        data: {
          tokenAddress,
          tokenId,
        },
      },
      recipient,
    })
  }

  public async withdrawAndMint (input: WithdrawAndMintParams): Promise<string> {
    const { asset, mintingBlob } = input
    const starkKey = await this.getActiveAccount()
    const assetType = getAssetType(asset)
    const data = await this._controller.withdrawAndMint({
      starkKey,
      assetType,
      mintingBlob,
    })

    const txhash = await this._sendContractTransaction(data)
    return txhash
  }

  public async fullWithdrawalRequest (vaultId: string): Promise<string> {
    const starkKey = await this.getActiveAccount()
    const data = await this._controller.fullWithdrawalRequest({
      starkKey,
      vaultId,
    })

    const txhash = await this._sendContractTransaction(data)
    return txhash
  }

  public async freeze (vaultId: string): Promise<string> {
    const starkKey = await this.getActiveAccount()
    const data = await this._controller.freezeRequest({
      starkKey,
      vaultId,
    })

    const txhash = await this._sendContractTransaction(data)
    return txhash
  }

  public async escape (input: EscapeParams): Promise<string> {
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

    const txhash = await this._sendContractTransaction(data)
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

    const starkSignature = await this._wallet.sign(msgHash)
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

    const starkSignature = await this._wallet.sign(msgHash)
    return starkSignature
  }

  public async signTransaction (tx: any) {
    return this._wallet.signTransaction(tx)
  }

  public async sendTransaction (tx: any): Promise<any> {
    return this._wallet.signTransaction(tx)
  }

  private async _sendContractTransaction (data: string, value: string = '0x') {
    const unsignedTx = {
      to: this.contractAddress,
      data,
      value,
      //gasLimit: '0x7a120', // 100k
      //gasLimit: '0x7a120', // 500k
      //gasLimit: '0xf4240' // 1M
    }

    const tx = await this.sendTransaction(unsignedTx)
    return tx.hash
  }
}

export default StarkwareProvider
