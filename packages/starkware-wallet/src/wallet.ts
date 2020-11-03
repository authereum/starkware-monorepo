import * as starkwareCrypto from '@authereum/starkware-crypto'
import { sanitizeHex, isHexString } from 'enc-utils'
import BN from 'bn.js'
import { Wallet, providers } from 'ethers'

// -- TYPES --------------------------------------------- //

export interface Store {
  set(key: string, data: any): Promise<void>
  get(key: string): Promise<any>
  remove(key: string): Promise<void>
}

export interface StarkwareAccountMapping {
  [path: string]: string
}

// -- UTILS --------------------------------------------- //

const DEFAULT_ACCOUNT_MAPPING_KEY = 'STARKWARE_ACCOUNT_MAPPING'

function getJsonRpcProvider (
  provider: string | providers.Provider
): providers.Provider {
  return typeof provider === 'string'
    ? new providers.JsonRpcProvider(provider)
    : provider
}

const ETH_STANDARD_PATH = "m/44'/60'/0'/0"

function getPath (index = 0) {
  return `${ETH_STANDARD_PATH}/${index}`
}

class MemoryStore {
  storage = {}
  set = async (key: string, data: any) => {
    this.storage[key] = data
  }
  get = async (key: string) => {
    return this.storage[key]
  }
  remove = async (key: string) => {
    delete this.storage[key]
  }
}

// -- StarkwareWallet --------------------------------------------- //

export class StarkwareWallet {
  private accountMapping: StarkwareAccountMapping | undefined
  private activeKeyPair: starkwareCrypto.KeyPair | undefined
  private mnemonic: string = ''
  private privateKey: string = ''
  provider: providers.Provider
  private store: Store
  private accountMappingKey: string
  public walletIndex: number = 0

  constructor (
    mnemonicOrPrivateKey: string,
    provider: string | providers.Provider,
    store: Store = new MemoryStore(),
    accountMappingKey: string = DEFAULT_ACCOUNT_MAPPING_KEY
  ) {
    if (mnemonicOrPrivateKey.length > 66) {
      this.mnemonic = mnemonicOrPrivateKey
    } else {
      this.privateKey = sanitizeHex(mnemonicOrPrivateKey)
    }

    this.provider = getJsonRpcProvider(provider)
    this.store = store
    this.accountMappingKey = accountMappingKey
  }

  static fromPrivateKey (
    privateKey: string,
    provider: string | providers.Provider,
    store: Store,
    accountMappingKey: string = DEFAULT_ACCOUNT_MAPPING_KEY
  ) {
    return new StarkwareWallet(privateKey, provider, store, accountMappingKey)
  }

  static fromSignature (
    signature: string,
    provider: string | providers.Provider,
    store: Store,
    accountMappingKey: string = DEFAULT_ACCOUNT_MAPPING_KEY
  ) {
    const sig = starkwareCrypto.deserializeSignature(signature)
    const privateKey = starkwareCrypto.grindKey(
      sig.r.toString('hex'),
      starkwareCrypto.StarkExEc
    )
    return StarkwareWallet.fromPrivateKey(
      privateKey,
      provider,
      store,
      accountMappingKey
    )
  }

  // -- Get / Set ----------------------------------------------------- //

  public setProvider (provider: string | providers.Provider): void {
    this.provider = getJsonRpcProvider(provider)
  }

  public setWalletIndex (walletIndex: number): void {
    this.walletIndex = walletIndex
  }

  public async getStarkPublicKey (path: string): Promise<string> {
    const keyPair = await this.getKeyPairFromPath(path)
    const starkPublicKey = starkwareCrypto.getStarkPublicKey(keyPair)
    return starkPublicKey
  }

  public async getActiveKeyPair (): Promise<starkwareCrypto.KeyPair> {
    await this.getAccountMapping()
    if (this.activeKeyPair) {
      return this.activeKeyPair
    } else {
      throw new Error('No Active Starkware KeyPair - please provide a path')
    }
  }

  public getEthereumAddress (): string {
    const wallet = this.getWallet()
    return wallet.address
  }

  public async account (
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    const path = starkwareCrypto.getAccountPath(
      layer,
      application,
      this.getEthereumAddress(),
      index
    )

    return this.getStarkKey(path)
  }

  public async getStarkKey (path: string): Promise<string> {
    const starkPublicKey = await this.getStarkPublicKey(path)
    return sanitizeHex(starkwareCrypto.getXCoordinate(starkPublicKey))
  }

  public async sign (message: string): Promise<string> {
    const wallet = this.getWallet()
    const sig = await wallet.signMessage(message)
    return sig
  }

  public async signTransaction (unsignedTx: any): Promise<string> {
    const wallet = this.getWallet()
    const signedTx = await wallet.signTransaction(unsignedTx)
    return signedTx
  }

  public async sendTransaction (
    unsignedTx: any
  ): Promise<providers.TransactionResponse> {
    const wallet = this.getWallet()
    unsignedTx = Object.assign({}, unsignedTx)
    if (unsignedTx.value) {
      if (!isHexString(unsignedTx.value)) {
        unsignedTx.value = sanitizeHex(
          new BN(unsignedTx.value, 10).toString('hex')
        )
      }
    }

    const populatedTx = await wallet.populateTransaction(unsignedTx)
    const tx = await wallet.sendTransaction(populatedTx)
    return tx
  }

  // -- Private ------------------------------------------------------- //

  private async getKeyPairFromPath (
    path: string
  ): Promise<starkwareCrypto.KeyPair> {
    const accountMapping = await this.getAccountMapping()
    if (this.privateKey) {
      const activeKeyPair = starkwareCrypto.getKeyPair(this.privateKey)
      await this.setActiveKeyPair(path, activeKeyPair)
      return activeKeyPair
    }

    if (!path) {
      return this.getActiveKeyPair()
    }

    const match = accountMapping[path]
    if (match) {
      return starkwareCrypto.ec.keyFromPrivate(match)
    }

    const activeKeyPair = starkwareCrypto.getKeyPairFromPath(
      this.mnemonic,
      path
    )

    await this.setActiveKeyPair(path, activeKeyPair)
    return activeKeyPair
  }

  private async setActiveKeyPair (
    path: string,
    activeKeyPair: starkwareCrypto.KeyPair
  ) {
    const accountMapping = await this.getAccountMapping()
    accountMapping[path] = activeKeyPair.getPrivate('hex')
    this.accountMapping = accountMapping
    this.activeKeyPair = activeKeyPair
    await this.store.set(this.accountMappingKey, accountMapping)
  }

  private async getAccountMapping (): Promise<StarkwareAccountMapping> {
    if (typeof this.accountMapping !== 'undefined') {
      return this.accountMapping
    }

    const accountMapping: StarkwareAccountMapping =
      (await this.store.get(this.accountMappingKey)) || {}
    this.accountMapping = accountMapping

    const paths = Object.keys(accountMapping)
    if (paths.length && !this.activeKeyPair) {
      this.activeKeyPair = starkwareCrypto.ec.keyFromPrivate(
        accountMapping[paths[0]]
      )
    }
    return accountMapping
  }

  private getWallet () {
    if (this.privateKey) {
      return new Wallet(this.privateKey).connect(this.provider)
    }

    return Wallet.fromMnemonic(
      this.mnemonic,
      getPath(this.walletIndex)
    ).connect(this.provider)
  }
}

export default StarkwareWallet
