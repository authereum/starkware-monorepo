import * as ethers from 'ethers'
import * as starkwareCrypto from '@authereum/starkware-crypto'
import starkExchangeAbi from './abi/PerpetualABI'
import { quantizeAmount } from '@authereum/starkware-crypto'

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
  quantizedAmount: string
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

export interface PerpetualTransferParams {
  assetId: string
  assetIdFee: string
  receiverPublicKey: string
  senderPositionId: string
  receiverPositionId: string
  feePositionId: string
  nonce: string
  amount: string
  maxAmountFee: string
  expirationTimestamp: string
  condition?: string
}

export interface PerpetualLimitOrderParams {
  assetIdSynthetic: string
  assetIdCollateral: string
  isBuyingSynthetic: boolean
  assetIdFee: string
  amountSynthetic: string
  amountCollateral: string
  amountFee: string
  nonce: string
  positionId: string
  expirationTimestamp: string
}

export interface PerpetualWithdrawalParams {
  assetIdCollateral: string
  positionId: string
  nonce: string
  expirationTimestamp: string
  amount: string
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
    throw new Error('not implemented')
  }

  public async freezeRequest (params: FreezeRequestParams): Promise<string> {
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
          name: 'vaultId',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'quantizedAmount',
          type: 'uint256',
        },
      ],
      name: 'freezeRequest',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    }

    return this._encodeFunctionCall(fragment, [
      params.starkKey,
      params.vaultId,
      params.quantizedAmount,
    ])
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
    nonce: string
  ): Promise<string> {
    const fragment = {
      constant: false,
      inputs: [
        {
          internalType: 'uint256',
          name: 'starkKeyA',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'starkKeyB',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'vaultIdA',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'vaultIdB',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'collateralAssetId',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'syntheticAssetId',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'amountCollateral',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'amountSynthetic',
          type: 'uint256',
        },
        {
          internalType: 'bool',
          name: 'aIsBuyingSynthetic',
          type: 'bool',
        },
        {
          internalType: 'uint256',
          name: 'nonce',
          type: 'uint256',
        },
      ],
      name: 'freezeRequest',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    }

    return this._encodeFunctionCall(fragment, [
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
    ])
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

  // stark 3.0 changes

  public async configurationHash (input: string): Promise<string> {
    return this._encodeFunctionCall('configurationHash', [input])
  }

  public async globalConfigurationHash (): Promise<string> {
    return this._encodeFunctionCall('globalConfigurationHash', [])
  }

  public async depositCancelDelay (): Promise<string> {
    return this._encodeFunctionCall('DEPOSIT_CANCEL_DELAY', [])
  }

  public async freezeGracePeriod (): Promise<string> {
    return this._encodeFunctionCall('FREEZE_GRACE_PERIOD', [])
  }

  public async mainGovernanceInfoTag (): Promise<string> {
    return this._encodeFunctionCall('MAIN_GOVERNANCE_INFO_TAG', [])
  }

  public async maxVerifierCount (): Promise<string> {
    return this._encodeFunctionCall('MAX_VERIFIER_COUNT', [])
  }

  public async unfreezeDelay (): Promise<string> {
    return this._encodeFunctionCall('UNFREEZE_DELAY', [])
  }

  public async verifierRemovalDelay (): Promise<string> {
    return this._encodeFunctionCall('VERIFIER_REMOVAL_DELAY', [])
  }

  public async announceAvailabilityVerifierRemovalIntent (
    verifier: string
  ): Promise<string> {
    return this._encodeFunctionCall(
      'announceAvailabilityVerifierRemovalIntent',
      [verifier]
    )
  }

  public async announceVerifierRemovalIntent (
    verifier: string
  ): Promise<string> {
    return this._encodeFunctionCall('announceVerifierRemovalIntent', [verifier])
  }

  public async getRegisteredAvailabilityVerifiers (): Promise<string> {
    return this._encodeFunctionCall('getRegisteredAvailabilityVerifiers', [])
  }

  public async getRegisteredVerifiers (): Promise<string> {
    return this._encodeFunctionCall('getRegisteredVerifiers', [])
  }

  public async isAvailabilityVerifier (
    verifierAddress: string
  ): Promise<string> {
    return this._encodeFunctionCall('isAvailabilityVerifier', [verifierAddress])
  }

  public async isFrozen (): Promise<string> {
    return this._encodeFunctionCall('isFrozen', [])
  }

  public async isVerifier (verifierAddress: string): Promise<string> {
    return this._encodeFunctionCall('isVerifier', [verifierAddress])
  }

  public async mainAcceptGovernance (): Promise<string> {
    return this._encodeFunctionCall('mainAcceptGovernance', [])
  }

  public async mainCancelNomination (): Promise<string> {
    return this._encodeFunctionCall('mainCancelNomination', [])
  }

  public async mainIsGovernor (testGovernor: string): Promise<string> {
    return this._encodeFunctionCall('mainIsGovernor', [testGovernor])
  }

  public async mainNominateNewGovernor (newGovernor: string): Promise<string> {
    return this._encodeFunctionCall('mainNominateNewGovernor', [newGovernor])
  }

  public async mainRemoveGovernor (
    governorForRemoval: string
  ): Promise<string> {
    return this._encodeFunctionCall('mainRemoveGovernor', [governorForRemoval])
  }

  public async registerAvailabilityVerifier (
    verifier: string,
    identifier: string
  ): Promise<string> {
    return this._encodeFunctionCall('registerAvailabilityVerifier', [
      verifier,
      identifier,
    ])
  }

  public async registerVerifier (
    verifier: string,
    identifier: string
  ): Promise<string> {
    return this._encodeFunctionCall('registerVerifier', [verifier, identifier])
  }

  public async removeAvailabilityVerifier (verifier: string): Promise<string> {
    return this._encodeFunctionCall('removeAvailabilityVerifier', [verifier])
  }

  public async removeVerifier (verifier: string): Promise<string> {
    return this._encodeFunctionCall('removeVerifier', [verifier])
  }

  public async unFreeze (): Promise<string> {
    return this._encodeFunctionCall('unFreeze', [])
  }

  public async getAssetInfo (assetType: string): Promise<string> {
    return this._encodeFunctionCall('getAssetInfo', [assetType])
  }

  public async getCancellationRequest (
    starkKey: string,
    assetId: string,
    vaultId: string
  ): Promise<string> {
    return this._encodeFunctionCall('getCancellationRequest', [
      starkKey,
      assetId,
      vaultId,
    ])
  }

  public async getDepositBalance (
    starkKey: string,
    assetId: string,
    vaultId: string
  ): Promise<string> {
    return this._encodeFunctionCall('getDepositBalance', [
      starkKey,
      assetId,
      vaultId,
    ])
  }

  public async getEthKey (starkKey: string): Promise<string> {
    return this._encodeFunctionCall('getEthKey', [starkKey])
  }

  public async getFullWithdrawalRequest (
    starkKey: string,
    vaultId: string
  ): Promise<string> {
    return this._encodeFunctionCall('getFullWithdrawalRequest', [
      starkKey,
      vaultId,
    ])
  }

  public async getQuantizedDepositBalance (
    starkKey: string,
    assetId: string,
    vaultId: string
  ): Promise<string> {
    return this._encodeFunctionCall('getQuantizedDepositBalance', [
      starkKey,
      assetId,
      vaultId,
    ])
  }

  public async getQuantum (presumedAssetType: string): Promise<string> {
    return this._encodeFunctionCall('getQuantum', [presumedAssetType])
  }

  public async getSystemAssetType (): Promise<string> {
    return this._encodeFunctionCall('getSystemAssetType', [])
  }

  public async getWithdrawalBalance (
    starkKey: string,
    assetId: string
  ): Promise<string> {
    return this._encodeFunctionCall('getWithdrawalBalance', [starkKey, assetId])
  }

  public async isTokenAdmin (testedAdmin: string): Promise<string> {
    return this._encodeFunctionCall('isTokenAdmin', [testedAdmin])
  }

  public async isUserAdmin (testedAdmin: string): Promise<string> {
    return this._encodeFunctionCall('isUserAdmin', [testedAdmin])
  }

  public async registerSystemAssetType (
    assetType: string,
    assetInfo: string
  ): Promise<string> {
    return this._encodeFunctionCall('registerSystemAssetType', [
      assetType,
      assetInfo,
    ])
  }

  public async registerToken (
    a: string,
    b: string,
    c?: string
  ): Promise<string> {
    if (c) {
      const fragment = {
        constant: false,
        inputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: '',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        name: 'registerToken',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      }
      return this._encodeFunctionCall(fragment, [a, b, c])
    } else {
      const fragment = {
        constant: false,
        inputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: '',
            type: 'bytes',
          },
        ],
        name: 'registerToken',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      }
      return this._encodeFunctionCall(fragment, [a, b])
    }
  }

  public async registerTokenAdmin (newAdmin: string): Promise<string> {
    return this._encodeFunctionCall('registerTokenAdmin', [newAdmin])
  }

  public async registerUserAdmin (newAdmin: string): Promise<string> {
    return this._encodeFunctionCall('registerUserAdmin', [newAdmin])
  }

  public async unregisterTokenAdmin (oldAdmin: string): Promise<string> {
    return this._encodeFunctionCall('unregisterTokenAdmin', [oldAdmin])
  }

  public async unregisterUserAdmin (oldAdmin: string): Promise<string> {
    return this._encodeFunctionCall('unregisterUserAdmin', [oldAdmin])
  }

  public async getLastBatchId (): Promise<string> {
    return this._encodeFunctionCall('getLastBatchId', [])
  }

  public async getOrderRoot (): Promise<string> {
    return this._encodeFunctionCall('getOrderRoot', [])
  }

  public async getOrderTreeHeight (): Promise<string> {
    return this._encodeFunctionCall('getOrderTreeHeight', [])
  }

  public async getSequenceNumber (): Promise<string> {
    return this._encodeFunctionCall('getSequenceNumber', [])
  }

  public async getVaultRoot (): Promise<string> {
    return this._encodeFunctionCall('getVaultRoot', [])
  }

  public async getVaultTreeHeight (): Promise<string> {
    return this._encodeFunctionCall('getVaultTreeHeight', [])
  }

  public async isOperator (testedOperator: string): Promise<string> {
    return this._encodeFunctionCall('isOperator', [testedOperator])
  }

  public async registerOperator (newOperator: string): Promise<string> {
    return this._encodeFunctionCall('registerOperator', [newOperator])
  }

  public async setAssetConfiguration (
    assetId: string,
    configHash: string
  ): Promise<string> {
    return this._encodeFunctionCall('setAssetConfiguration', [
      assetId,
      configHash,
    ])
  }

  public async setGlobalConfiguration (configHash: string): Promise<string> {
    return this._encodeFunctionCall('setGlobalConfiguration', [configHash])
  }

  public async unregisterOperator (removedOperator: string): Promise<string> {
    return this._encodeFunctionCall('unregisterOperator', [removedOperator])
  }

  public async updateState (
    publicInput: string[],
    applicationData: string[]
  ): Promise<string> {
    return this._encodeFunctionCall('updateState', [
      publicInput,
      applicationData,
    ])
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
    signature: string
  ): Promise<string> {
    return this._encodeFunctionCall('forcedTradeRequest', [
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
      signature,
    ])
  }

  public async forcedWithdrawalRequest (
    starkKey: string,
    vaultId: string,
    quantizedAmount: string
  ): Promise<string> {
    return this._encodeFunctionCall('forcedWithdrawalRequest', [
      starkKey,
      vaultId,
      quantizedAmount,
    ])
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
  ): Promise<string> {
    return this._encodeFunctionCall('getForcedTradeRequest', [
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
    ])
  }

  public async getForcedWithdrawalRequest (
    starkKey: string,
    vaultId: string,
    quantizedAmount: string
  ): Promise<string> {
    return this._encodeFunctionCall('getForcedWithdrawalRequest', [
      starkKey,
      vaultId,
      quantizedAmount,
    ])
  }

  public async perpetualTransfer (
    params: PerpetualTransferParams
  ): Promise<string> {
    if (params.condition) {
      return starkwareCrypto.getPerpetualConditionalTransferMsgHash(
        params.assetId,
        params.assetIdFee,
        params.receiverPublicKey,
        params.condition,
        params.senderPositionId,
        params.receiverPositionId,
        params.feePositionId,
        params.nonce,
        params.amount,
        params.maxAmountFee,
        params.expirationTimestamp
      )
    } else {
      return starkwareCrypto.getPerpetualTransferMsgHash(
        params.assetId,
        params.assetIdFee,
        params.receiverPublicKey,
        params.senderPositionId,
        params.receiverPositionId,
        params.feePositionId,
        params.nonce,
        params.amount,
        params.maxAmountFee,
        params.expirationTimestamp
      )
    }
  }

  public async perpetualLimitOrder (
    params: PerpetualLimitOrderParams
  ): Promise<string> {
    return starkwareCrypto.getPerpetualLimitOrderMsgHash(
      params.assetIdSynthetic,
      params.assetIdCollateral,
      params.isBuyingSynthetic,
      params.assetIdFee,
      params.amountSynthetic,
      params.amountCollateral,
      params.amountFee,
      params.nonce,
      params.positionId,
      params.expirationTimestamp
    )
  }

  public async perpetualWithdrawal (
    params: PerpetualWithdrawalParams
  ): Promise<string> {
    return starkwareCrypto.getPerpetualWithdrawalMsgHash(
      params.assetIdCollateral,
      params.positionId,
      params.nonce,
      params.expirationTimestamp,
      params.amount
    )
  }

  public parseReturnData (fn: string | any, data: string) {
    let fnName: string = ''
    if (typeof fn === 'string') {
      fnName = fn
    } else if (fn.name) {
      fnName = fn.name
    }

    if (this[fnName]) {
      return this._decodeFunctionResult(fnName, data)
    }

    throw new Error('not implemented')
  }

  // -- Private --------------------------------------------- //

  private _encodeFunctionCall (method: string | any, args: any[]) {
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

  private _decodeFunctionResult (method: string, data: string) {
    const decoded = this._encoder.decodeFunctionResult(method, data)
    if (Array.isArray(decoded) && decoded.length === 1) {
      return decoded[0]
    }

    return decoded
  }
}

export default StarkwareController
