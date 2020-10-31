import StarkwareWallet from '@authereum/starkware-wallet'
import StarkwareController from '@authereum/starkware-controller'
import {
  AccountParams,
  Token,
  TransferParams,
  OrderParams,
} from '@authereum/starkware-crypto'
import BasicProvider from 'basic-provider'
import { toWei } from 'web3-utils'

import { MethodResults, MethodParams } from 'starkware-types'
import { EventEmitter } from 'events'

function matches (a: any, b: any): boolean {
  if (typeof a !== typeof b) return false
  let match = true
  Object.keys(a).forEach(key => {
    if (a[key] !== b[key]) match = false
  })
  return match
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
        return {
          starkKey: await this._wallet.account(layer, application, index),
        } as MethodResults.StarkAccountResult
      }
      case 'stark_registerUser': {
        const { ethKey, starkKey, operatorSignature } = params
        const data = await this._controller.registerUser({
          ethKey,
          starkKey,
          operatorSignature,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkRegisterUserResult
      }
      case 'stark_deposit': {
        const {
          starkKey,
          assetType,
          vaultId,
          quantizedAmount,
          ethValue,
        } = params
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

        const txhash = await this._sendTransaction(data, wei)
        return { txhash } as MethodResults.StarkDepositResult
      }
      case 'stark_depositCancel': {
        const { starkKey, assetType, vaultId } = params
        const data = await this._controller.depositCancel({
          starkKey,
          assetType,
          vaultId,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkDepositCancelResult
      }
      case 'stark_depositReclaim': {
        const { starkKey, assetType, vaultId } = params
        const data = await this._controller.depositReclaim({
          starkKey,
          assetType,
          vaultId,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkDepositReclaimResult
      }
      case 'stark_withdraw': {
        const { starkKey, assetType } = params
        const data = await this._controller.withdraw({
          starkKey,
          assetType,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkWithdrawResult
      }
      case 'stark_withdrawTo': {
        const { starkKey, assetType, recipient } = params
        const data = await this._controller.withdrawTo({
          starkKey,
          assetType,
          recipient,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkWithdrawToResult
      }
      case 'stark_fullWithdrawalRequest': {
        const { starkKey, vaultId } = params
        const data = await this._controller.fullWithdrawalRequest({
          starkKey,
          vaultId,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkFullWithdrawalRequestResult
      }
      case 'stark_freezeRequest': {
        const { starkKey, vaultId } = params
        const data = await this._controller.freezeRequest({
          starkKey,
          vaultId,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkFreezeRequestResult
      }
      case 'stark_escape': {
        const { starkKey, vaultId, assetType, quantizedAmount } = params
        const data = await this._controller.escape({
          starkKey,
          vaultId,
          assetType,
          quantizedAmount,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkEscapeResult
      }
      case 'stark_depositNft': {
        const { starkKey, vaultId, assetType, tokenId } = params
        const data = await this._controller.depositNft({
          starkKey,
          vaultId,
          assetType,
          tokenId,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkDepositNftResult
      }
      case 'stark_depositNftReclaim': {
        const { starkKey, assetType, vaultId, tokenId } = params
        const data = await this._controller.depositNftReclaim({
          starkKey,
          assetType,
          vaultId,
          tokenId,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkDepositNftReclaimResult
      }
      case 'stark_withdrawAndMint': {
        const { starkKey, assetType, mintableBlob } = params
        const data = await this._controller.withdrawAndMint({
          starkKey,
          assetType,
          mintableBlob,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkWithdrawAndMintResult
      }
      case 'stark_withdrawNft': {
        const { starkKey, assetType, tokenId } = params
        const data = await this._controller.withdrawNft({
          starkKey,
          assetType,
          tokenId,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkWithdrawNftResult
      }
      case 'stark_withdrawNftTo': {
        const { starkKey, assetType, tokenId, recipient } = params
        const data = await this._controller.withdrawNftTo({
          starkKey,
          assetType,
          tokenId,
          recipient,
        })

        const txhash = await this._sendTransaction(data)
        return { txhash } as MethodResults.StarkWithdrawNftToResult
      }
      case 'stark_transfer': {
        const {
          quantizedAmount,
          nonce,
          senderVaultId,
          assetType,
          receiverVaultId,
          receiverKey,
          expirationTimestamp,
          condition,
        } = params

        const msgHash = await this._controller.transfer({
          quantizedAmount,
          nonce,
          senderVaultId,
          assetType,
          receiverVaultId,
          receiverKey,
          expirationTimestamp,
          condition,
        })

        const starkSignature = await this._wallet.sign(msgHash)
        return { starkSignature } as MethodResults.StarkTransferResult
      }
      case 'stark_createOrder': {
        const {
          vaultSell,
          vaultBuy,
          amountSell,
          amountBuy,
          tokenSellAssetType,
          tokenBuyAssetType,
          nonce,
          expirationTimestamp,
        } = params

        const msgHash = await this._controller.createOrder({
          vaultSell,
          vaultBuy,
          amountSell,
          amountBuy,
          tokenSellAssetType,
          tokenBuyAssetType,
          nonce,
          expirationTimestamp,
        })

        const starkSignature = await this._wallet.sign(msgHash)
        return { starkSignature } as MethodResults.StarkCreateOrderResult
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

    return this.getAccount(layer, application, index)
  }

  public async getActiveAccount (): Promise<string> {
    if (!this._accountParams) {
      throw new Error('No StarkKey available - please call provider.enable()')
    }
    if (this.starkKey) {
      return this.starkKey
    }

    const { layer, application, index } = this._accountParams
    return this.getAccount(layer, application, index)
  }

  public async getAccount (
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    this._accountParams = { layer, application, index }
    const { starkKey } = await this.resolveResult('stark_account', {
      layer,
      application,
      index,
    })

    this.starkKey = starkKey
    return starkKey
  }

  public async registerUser (
    ethKey: string,
    operatorSignature: string
  ): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_registerUser', {
      contractAddress,
      ethKey,
      starkKey,
      operatorSignature,
    })
    return txhash
  }

  public async deposit (
    quantizedAmount: string,
    token: Token,
    vaultId: string
  ): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_deposit', {
      contractAddress,
      starkKey,
      quantizedAmount,
      token,
      vaultId,
    })
    return txhash
  }

  public async depositCancel (token: Token, vaultId: string): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_depositCancel', {
      contractAddress,
      starkKey,
      token,
      vaultId,
    })
    return txhash
  }

  public async depositReclaim (token: Token, vaultId: string): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_depositReclaim', {
      contractAddress,
      starkKey,
      token,
      vaultId,
    })
    return txhash
  }

  public async withdraw (token: Token): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_withdraw', {
      contractAddress,
      starkKey,
      token,
    })
    return txhash
  }

  public async withdrawTo (token: Token, recipient: string): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_withdrawTo', {
      contractAddress,
      starkKey,
      token,
      recipient,
    })
    return txhash
  }

  public async withdrawFull (vaultId: string): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_fullWithdrawal', {
      contractAddress,
      starkKey,
      vaultId,
    })
    return txhash
  }

  public async freezeVault (vaultId: string): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_freeze', {
      contractAddress,
      starkKey,
      vaultId,
    })
    return txhash
  }

  public async verifyEspace (proof: string[]): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_verifyEscape', {
      contractAddress,
      starkKey,
      proof,
    })
    return txhash
  }

  public async escape (
    vaultId: string,
    token: Token,
    quantizedAmount: string
  ): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_escape', {
      contractAddress,
      starkKey,
      vaultId,
      token,
      quantizedAmount,
    })
    return txhash
  }

  public async depositNft (
    assetType: string,
    vaultId: string,
    token: Token
  ): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_depositNft', {
      contractAddress,
      starkKey,
      assetType,
      vaultId,
      token,
    })

    return txhash
  }

  public async depositNftReclaim (
    assetType: string,
    vaultId: string,
    token: Token
  ): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_depositNftReclaim', {
      contractAddress,
      starkKey,
      assetType,
      vaultId,
      token,
    })

    return txhash
  }

  public async withdrawAndMint (
    assetType: string,
    mintingBlob: string | Buffer
  ): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_withdrawAndMint', {
      contractAddress,
      starkKey,
      assetType,
      mintingBlob,
    })

    return txhash
  }

  public async withdrawNft (assetType: string, token: Token): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_withdrawNft', {
      contractAddress,
      starkKey,
      assetType,
      token,
    })

    return txhash
  }

  public async withdrawNftTo (
    assetType: string,
    token: Token,
    recipient: string
  ): Promise<string> {
    const contractAddress = this.contractAddress
    const starkKey = await this.getActiveAccount()
    const { txhash } = await this.resolveResult('stark_withdrawNftTo', {
      contractAddress,
      starkKey,
      assetType,
      token,
      recipient,
    })

    return txhash
  }

  public async transfer (
    to: TransferParams,
    vaultId: string,
    token: Token,
    quantizedAmount: string,
    nonce: string,
    expirationTimestamp: string
  ): Promise<string> {
    const starkKey = await this.getActiveAccount()
    const from = { starkKey, vaultId }
    const { starkSignature } = await this.resolveResult('stark_transfer', {
      from,
      to,
      token,
      quantizedAmount,
      nonce,
      expirationTimestamp,
    })
    return starkSignature
  }

  public async createOrder (
    sell: OrderParams,
    buy: OrderParams,
    nonce: string,
    expirationTimestamp: string
  ): Promise<string> {
    const starkKey = await this.getActiveAccount()
    const { starkSignature } = await this.resolveResult('stark_createOrder', {
      starkKey,
      sell,
      buy,
      nonce,
      expirationTimestamp,
    })
    return starkSignature
  }

  private async _sendTransaction (data: string, value: string = '0x') {
    const unsignedTx = {
      to: this.contractAddress,
      data,
      value,
      //gasLimit: '0x7a120', // 100k
      //gasLimit: '0x7a120', // 500k
      //gasLimit: '0xf4240' // 1M
    }

    const tx = await this._wallet.sendTransaction(unsignedTx)
    return tx.hash
  }
}

export default StarkwareProvider
