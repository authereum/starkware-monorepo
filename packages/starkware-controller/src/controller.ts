import * as ethers from 'ethers'
import * as encUtils from 'enc-utils'
import * as starkwareCrypto from '@authereum/starkware-crypto'
import starkExchangeAbi from './StarkExchangeABI'

// -- Types --------------------------------------------- //

export interface RegisterUserParams {
  starkKey: string
  ethKey: string
  operatorSignature: string
}

export interface DepositParams {
  starkKey: string
  assetType: string
  vaultId: string
  quantizedAmount?: string | null
}

export interface DepositCancelParams {
  starkKey: string
  assetId: string
  vaultId: string
}

export interface DepositReclaimParams {
  starkKey: string
  assetType: string
  vaultId: string
}

export interface WithdrawParams {
  starkKey: string
  assetType: string
}

export interface WithdrawToParams {
  starkKey: string
  assetType: string
  recipient: string
}

export interface FullWithdrawalRequestParams {
  starkKey: string
  vaultId: string
}

export interface FreezeRequestParams {
  starkKey: string
  vaultId: string
}

export interface EscapeParams {
  starkKey: string
  vaultId: string
  assetId: string
  quantizedAmount: string
}

export interface DepositNftParams {
  starkKey: string
  vaultId: string
  assetType: string
  tokenId: string
}

export interface DepositNftReclaimParams {
  starkKey: string
  assetType: string
  vaultId: string
  tokenId: string
}

export interface WithdrawAndMintParams {
  starkKey: string
  assetType: string
  mintingBlob: string
}

export interface WithdrawNftParams {
  starkKey: string
  assetType: string
  tokenId: string
}

export interface WithdrawNftToParams {
  starkKey: string
  assetType: string
  tokenId: string
  recipient: string
}

export interface TransferParams {
  quantizedAmount: string
  nonce: string
  senderVaultId: string
  assetId: string
  targetVaultId: string
  targetKey: string
  expirationTimestamp: string
  condition?: string
}

export interface OrderParams {
  sellVaultId: string
  buyVaultId: string
  sellQuantizedAmount: string
  buyQuantizedAmount: string
  sellAssetId: string
  buyAssetId: string
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

  public async registerUser (params: RegisterUserParams): Promise<string> {
    const { ethKey, starkKey, operatorSignature } = params
    return this._encodeFunctionCall('registerUser', [
      ethKey,
      starkKey,
      operatorSignature,
    ])
  }

  public async deposit (params: DepositParams): Promise<string> {
    const { starkKey, assetType, vaultId, quantizedAmount } = params
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

  public async depositCancel (params: DepositCancelParams): Promise<string> {
    const { starkKey, assetId, vaultId } = params
    return this._encodeFunctionCall('depositCancel', [
      starkKey,
      assetId,
      vaultId,
    ])
  }

  public async depositReclaim (params: DepositReclaimParams): Promise<string> {
    const { starkKey, assetType, vaultId } = params
    return this._encodeFunctionCall('depositReclaim', [
      starkKey,
      assetType,
      vaultId,
    ])
  }

  public async withdraw (params: WithdrawParams): Promise<string> {
    const { starkKey, assetType } = params
    return this._encodeFunctionCall('withdraw', [starkKey, assetType])
  }

  public async withdrawTo (params: WithdrawToParams): Promise<string> {
    const { starkKey, assetType, recipient } = params
    return this._encodeFunctionCall('withdrawTo', [
      starkKey,
      assetType,
      recipient,
    ])
  }

  public async fullWithdrawalRequest (
    params: FullWithdrawalRequestParams
  ): Promise<string> {
    const { starkKey, vaultId } = params
    return this._encodeFunctionCall('fullWithdrawalRequest', [
      starkKey,
      vaultId,
    ])
  }

  public async freezeRequest (params: FreezeRequestParams): Promise<string> {
    const { starkKey, vaultId } = params
    return this._encodeFunctionCall('freezeRequest', [starkKey, vaultId])
  }

  public async escape (params: EscapeParams): Promise<string> {
    const { starkKey, vaultId, assetId, quantizedAmount } = params
    return this._encodeFunctionCall('escape', [
      starkKey,
      vaultId,
      assetId,
      quantizedAmount,
    ])
  }

  public async depositNft (params: DepositNftParams): Promise<string> {
    const { starkKey, vaultId, assetType, tokenId } = params
    return this._encodeFunctionCall('depositNft', [
      starkKey,
      assetType,
      vaultId,
      tokenId,
    ])
  }

  public async depositNftReclaim (
    params: DepositNftReclaimParams
  ): Promise<string> {
    const { starkKey, assetType, vaultId, tokenId } = params
    return this._encodeFunctionCall('depositNftReclaim', [
      starkKey,
      assetType,
      vaultId,
      tokenId,
    ])
  }

  public async withdrawAndMint (
    params: WithdrawAndMintParams
  ): Promise<string> {
    const { starkKey, assetType, mintingBlob } = params
    return this._encodeFunctionCall('withdrawAndMint', [
      starkKey,
      assetType,
      mintingBlob,
    ])
  }

  public async withdrawNft (params: WithdrawNftParams): Promise<string> {
    const { starkKey, assetType, tokenId } = params
    return this._encodeFunctionCall('withdrawNft', [
      starkKey,
      assetType,
      tokenId,
    ])
  }

  public async withdrawNftTo (params: WithdrawNftToParams): Promise<string> {
    const { starkKey, assetType, tokenId, recipient } = params
    return this._encodeFunctionCall('withdrawNftTo', [
      starkKey,
      assetType,
      tokenId,
      recipient,
    ])
  }

  public async transfer (params: TransferParams): Promise<string> {
    const {
      quantizedAmount,
      nonce,
      senderVaultId,
      assetId,
      targetVaultId,
      targetKey,
      expirationTimestamp,
      condition,
    } = params
    return starkwareCrypto.getTransferMsgHash(
      quantizedAmount,
      nonce,
      senderVaultId,
      assetId,
      targetVaultId,
      targetKey,
      expirationTimestamp,
      condition
    )
  }

  public async createOrder (params: OrderParams): Promise<string> {
    const {
      sellVaultId,
      buyVaultId,
      sellQuantizedAmount,
      buyQuantizedAmount,
      sellAssetId,
      buyAssetId,
      nonce,
      expirationTimestamp,
    } = params
    return starkwareCrypto.getLimitOrderMsgHash(
      sellVaultId,
      buyVaultId,
      sellQuantizedAmount,
      buyQuantizedAmount,
      sellAssetId,
      buyAssetId,
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
