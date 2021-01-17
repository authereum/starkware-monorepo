import {
  RegisterUserParams,
  DepositParams,
  WithdrawParams,
  TransferParams,
  OrderParams,
  PerpetualTransferParams,
  PerpetualLimitOrderParams,
  PerpetualWithdrawalParams,
} from '../types'
import { Signature } from '@authereum/starkware-crypto'

export default class AuthereumProvider {
  _authereum: any
  _starkProvider: any

  constructor (instance: any) {
    this._authereum = instance
    this._starkProvider = instance.getStarkProvider()
  }

  setContractAddress (contractAddress: string) {
    this._starkProvider.setContractAddress(contractAddress)
  }

  public async resolve (payload: any, txOpts: any = {}): Promise<any> {
    let { id, method, params } = payload
    return this._starkProvider.send(method, params)
  }

  public async enable (layer: string, application: string, index: string) {
    return this.requestAccounts()
  }

  public async updateAccount (
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    return this._starkProvider.getStarkKey()
  }

  public async getActiveAccount (): Promise<string> {
    return this._starkProvider.getStarkKey()
  }

  public async account (
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    return this._starkProvider.getStarkKey()
  }

  public async requestAccounts (): Promise<string[]> {
    const account = await this._authereum.getAccountAddress()
    if (account) {
      return [account]
    }

    return []
  }

  public async personalSign (message: string): Promise<string> {
    return this._starkProvider.starkSignMessage(message)
  }

  public async registerUser (
    input: RegisterUserParams,
    txOpts: any = {}
  ): Promise<string> {
    const { ethKey, operatorSignature } = input
    return this._starkProvider.registerUser(ethKey, operatorSignature)
  }

  public async deposit (
    input: DepositParams,
    txOpts: any = {}
  ): Promise<string> {
    return this._starkProvider.deposit(input)
  }

  public async withdraw (
    input: WithdrawParams,
    txOpts: any = {}
  ): Promise<string> {
    const { asset, recipient } = input
    const assetStandard = asset.type
    const assetContractAddress = asset.data.tokenAddress
    const quantum = asset.data.quantum

    return this._starkProvider.withdraw(
      assetStandard,
      quantum,
      assetContractAddress,
      recipient
    )
  }

  public async transfer (input: TransferParams): Promise<Signature> {
    return this._starkProvider.transfer(input)
  }

  public async createOrder (input: OrderParams): Promise<Signature> {
    return this._starkProvider.createOrder(input)
  }

  public async perpetualTransfer (
    params: PerpetualTransferParams
  ): Promise<Signature> {
    throw new Error('authereum: not implemented')
  }

  public async perpetualLimitOrder (
    params: PerpetualLimitOrderParams
  ): Promise<Signature> {
    throw new Error('authereum: not implemented')
  }

  public async perpetualWithdrawal (
    params: PerpetualWithdrawalParams
  ): Promise<Signature> {
    throw new Error('authereum: not implemented')
  }
}
