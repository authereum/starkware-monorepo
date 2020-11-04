import * as ethers from 'ethers'
import * as encUtils from 'enc-utils'
import * as starkwareCrypto from '@authereum/starkware-crypto'
import starkExchangeAbi from './StarkExchangeABI'

// -- Types --------------------------------------------- //

export interface IRegisterUserInput {
  starkKey: string
  ethKey: string
  operatorSignature: string
}

export interface IDepositInput {
  starkKey: string
  assetType: string
  vaultId: string
  quantizedAmount?: string | null
}

export interface IDepositCancelInput {
  starkKey: string
  assetId: string
  vaultId: string
}

export interface IDepositReclaimInput {
  starkKey: string
  assetType: string
  vaultId: string
}

export interface IWithdrawInput {
  starkKey: string
  assetType: string
}

export interface IWithdrawToInput {
  starkKey: string
  assetType: string
  recipient: string
}

export interface IFullWithdrawalRequestInput {
  starkKey: string
  vaultId: string
}

export interface IFreezeRequestInput {
  starkKey: string
  vaultId: string
}

export interface IEscapeInput {
  starkKey: string
  vaultId: string
  assetId: string
  quantizedAmount: string
}

export interface IDepositNftInput {
  starkKey: string
  vaultId: string
  assetType: string
  tokenId: string
}

export interface IDepositNftReclaimInput {
  starkKey: string
  assetType: string
  vaultId: string
  tokenId: string
}

export interface IWithdrawAndMintInput {
  starkKey: string
  assetType: string
  mintingBlob: string
}

export interface IWithdrawNftInput {
  starkKey: string
  assetType: string
  tokenId: string
}

export interface IWithdrawNftToInput {
  starkKey: string
  assetType: string
  tokenId: string
  recipient: string
}

export interface ITransferInput {
  quantizedAmount: string
  nonce: string
  senderVaultId: string
  assetType: string
  receiverVaultId: string
  receiverKey: string
  expirationTimestamp: string
  condition?: string
}

export interface ICreateOrderInput {
  vaultSell: string
  vaultBuy: string
  amountSell: string
  amountBuy: string
  tokenSellAssetType: string
  tokenBuyAssetType: string
  nonce: string
  expirationTimestamp: string
}

// -- StarkwareController --------------------------------------------- //

export class StarkwareController {
  private _encoder: ethers.utils.Interface

  constructor () {
    this._encoder = new ethers.utils.Interface(starkExchangeAbi)
  }

  // -- Public --------------------------------------------- //

  public async registerUser (input: IRegisterUserInput): Promise<string> {
    const { ethKey, starkKey, operatorSignature } = input
    return this._encodeFunctionCall('registerUser', [
      ethKey,
      starkKey,
      operatorSignature,
    ])
  }

  public async deposit (input: IDepositInput): Promise<string> {
    const { starkKey, assetType, vaultId, quantizedAmount } = input
    const args = [starkKey, assetType, vaultId]

    if (typeof quantizedAmount === 'string') {
      args.push(quantizedAmount)

      // The reason for fragments is to avoid the ethers
      // error "multiple matching functions"
      // because of overloaded functions.
      const fragment = {
        constant: false,
        inputs: [
          {
            internalType: 'uint256',
            name: 'starkKey',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'assetType',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'vaultId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'quantizedAmount',
            type: 'uint256',
          },
        ],
        name: 'deposit',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      }

      return this._encodeFunctionCall(fragment, args)
    }

    const fragment = {
      constant: false,
      inputs: [
        {
          internalType: 'uint256',
          name: 'starkKey',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'assetType',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'vaultId',
          type: 'uint256',
        },
      ],
      name: 'deposit',
      outputs: [],
      payable: true,
      stateMutability: 'payable',
      type: 'function',
    }

    return this._encodeFunctionCall(fragment, args)
  }

  public async depositCancel (input: IDepositCancelInput): Promise<string> {
    const { starkKey, assetId, vaultId } = input
    return this._encodeFunctionCall('depositCancel', [
      starkKey,
      assetId,
      vaultId,
    ])
  }

  public async depositReclaim (input: IDepositReclaimInput): Promise<string> {
    const { starkKey, assetType, vaultId } = input
    return this._encodeFunctionCall('depositReclaim', [
      starkKey,
      assetType,
      vaultId,
    ])
  }

  public async withdraw (input: IWithdrawInput): Promise<string> {
    const { starkKey, assetType } = input
    return this._encodeFunctionCall('withdraw', [starkKey, assetType])
  }

  public async withdrawTo (input: IWithdrawToInput): Promise<string> {
    const { starkKey, assetType, recipient } = input
    return this._encodeFunctionCall('withdrawTo', [
      starkKey,
      assetType,
      recipient,
    ])
  }

  public async fullWithdrawalRequest (
    input: IFullWithdrawalRequestInput
  ): Promise<string> {
    const { starkKey, vaultId } = input
    return this._encodeFunctionCall('fullWithdrawalRequest', [
      starkKey,
      vaultId,
    ])
  }

  public async freezeRequest (input: IFreezeRequestInput): Promise<string> {
    const { starkKey, vaultId } = input
    return this._encodeFunctionCall('freezeRequest', [starkKey, vaultId])
  }

  public async escape (input: IEscapeInput): Promise<string> {
    const { starkKey, vaultId, assetId, quantizedAmount } = input
    return this._encodeFunctionCall('escape', [
      starkKey,
      vaultId,
      assetId,
      quantizedAmount,
    ])
  }

  public async depositNft (input: IDepositNftInput): Promise<string> {
    const { starkKey, vaultId, assetType, tokenId } = input
    return this._encodeFunctionCall('depositNft', [
      starkKey,
      assetType,
      vaultId,
      tokenId,
    ])
  }

  public async depositNftReclaim (
    input: IDepositNftReclaimInput
  ): Promise<string> {
    const { starkKey, assetType, vaultId, tokenId } = input
    return this._encodeFunctionCall('depositNftReclaim', [
      starkKey,
      assetType,
      vaultId,
      tokenId,
    ])
  }

  public async withdrawAndMint (input: IWithdrawAndMintInput): Promise<string> {
    const { starkKey, assetType, mintingBlob } = input
    return this._encodeFunctionCall('withdrawAndMint', [
      starkKey,
      assetType,
      mintingBlob,
    ])
  }

  public async withdrawNft (input: IWithdrawNftInput): Promise<string> {
    const { starkKey, assetType, tokenId } = input
    return this._encodeFunctionCall('withdrawNft', [
      starkKey,
      assetType,
      tokenId,
    ])
  }

  public async withdrawNftTo (input: IWithdrawNftToInput): Promise<string> {
    const { starkKey, assetType, tokenId, recipient } = input
    return this._encodeFunctionCall('withdrawNftTo', [
      starkKey,
      assetType,
      tokenId,
      recipient,
    ])
  }

  public async transfer (input: ITransferInput): Promise<string> {
    const {
      quantizedAmount,
      nonce,
      senderVaultId,
      assetType,
      receiverVaultId,
      receiverKey,
      expirationTimestamp,
      condition,
    } = input
    return starkwareCrypto.getTransferMsgHash(
      quantizedAmount,
      nonce,
      senderVaultId,
      assetType,
      receiverVaultId,
      receiverKey,
      expirationTimestamp,
      condition
    )
  }

  public async createOrder (input: ICreateOrderInput): Promise<string> {
    const {
      vaultSell,
      vaultBuy,
      amountSell,
      amountBuy,
      tokenSellAssetType,
      tokenBuyAssetType,
      nonce,
      expirationTimestamp,
    } = input
    return starkwareCrypto.getLimitOrderMsgHash(
      vaultSell,
      vaultBuy,
      amountSell,
      amountBuy,
      tokenSellAssetType,
      tokenBuyAssetType,
      nonce,
      expirationTimestamp
    )
  }

  // -- Private --------------------------------------------- //

  private _encodeFunctionCall = (method: string | any, args: any[]) => {
    let fragment: string | ethers.utils.FunctionFragment
    if (typeof method === 'string') {
      fragment = method
    } else {
      fragment = ethers.utils.FunctionFragment.from(
        method as ethers.utils.FunctionFragment
      )
    }

    return this._encoder.encodeFunctionData(fragment, args)
  }
}

export default StarkwareController
