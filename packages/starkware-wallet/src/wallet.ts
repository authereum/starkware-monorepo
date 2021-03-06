import {
  KeyPair,
  privateKeyFromSignature,
  getStarkPublicKey,
  getKeyPair,
  getKeyPairFromPath,
  getAccountPath,
  getXCoordinate,
  sign,
  ec,
  Signature,
} from '@authereum/starkware-crypto'
import { sanitizeHex, isHexString } from 'enc-utils'
import BN from 'bn.js'
import { Wallet, Signer, providers } from 'ethers'
import { LedgerSigner } from '@authereum/ethersproject-hardware-wallets'
import EthApp from '@ledgerhq/hw-app-eth'

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
  private signer: LedgerSigner | undefined
  private accountMapping: StarkwareAccountMapping | undefined
  private activeKeyPair: KeyPair | undefined
  private mnemonic: string = ''
  private privateKey: string = ''
  provider: providers.Provider
  private store: Store
  private accountMappingKey: string
  private _layer: string = ''
  private _application: string = ''
  private _index: string = '0'
  public walletIndex: number = 0
  private _debug: boolean = false

  constructor (
    mnemonicOrPrivateKeyOrSigner: string | Signer | LedgerSigner,
    provider: string | providers.Provider,
    store: Store = new MemoryStore(),
    accountMappingKey: string = DEFAULT_ACCOUNT_MAPPING_KEY
  ) {
    if (mnemonicOrPrivateKeyOrSigner instanceof LedgerSigner) {
      this.signer = mnemonicOrPrivateKeyOrSigner
    } else if ((mnemonicOrPrivateKeyOrSigner as string).length > 66) {
      this.mnemonic = mnemonicOrPrivateKeyOrSigner as string
    } else {
      this.privateKey = sanitizeHex(mnemonicOrPrivateKeyOrSigner as string)
    }

    this.provider = getJsonRpcProvider(provider)
    this.store = store
    this.accountMappingKey = accountMappingKey
  }

  private _debugLog = (...args: any) => {
    if (!this._debug) {
      return
    }

    console.debug('[stark-wallet]', ...args)
  }

  setDebug (debug: boolean) {
    this._debug = debug
  }

  static fromLedger (
    path: string = ETH_STANDARD_PATH,
    provider: string | providers.Provider,
    ethApp?: EthApp
  ) {
    const type = 'hid'
    provider = getJsonRpcProvider(provider)
    if (!path) {
      path = ETH_STANDARD_PATH
    }
    const index = 0
    const hdPath = `${path}/${index}`
    const signer = new LedgerSigner(provider, type, hdPath, ethApp)
    return new StarkwareWallet(signer, provider)
  }

  static fromSigner (
    signer: Signer,
    provider: string | providers.Provider,
    store: Store,
    accountMappingKey: string = DEFAULT_ACCOUNT_MAPPING_KEY
  ) {
    return new StarkwareWallet(signer, provider, store, accountMappingKey)
  }

  static fromPrivateKey (
    privateKey: string,
    provider: string | providers.Provider,
    store: Store = new MemoryStore(),
    accountMappingKey: string = DEFAULT_ACCOUNT_MAPPING_KEY
  ) {
    return new StarkwareWallet(privateKey, provider, store, accountMappingKey)
  }

  static fromSignature (
    signature: string,
    provider: string | providers.Provider,
    store: Store = new MemoryStore(),
    accountMappingKey: string = DEFAULT_ACCOUNT_MAPPING_KEY
  ) {
    const privateKey = privateKeyFromSignature(signature)
    return StarkwareWallet.fromPrivateKey(
      privateKey,
      provider,
      store,
      accountMappingKey
    )
  }

  // -- Get / Set ----------------------------------------------------- //

  public setProvider (provider: string | providers.Provider): void {
    this._debugLog('setProvider', provider)
    this.provider = getJsonRpcProvider(provider)
  }

  public setPath (path: string): void {
    this._debugLog('setPath', path)
    if (this.signer) {
      this.signer.setPath(path)
    }
  }

  public setWalletIndex (walletIndex: number): void {
    this._debugLog('setWalletIndex', walletIndex)
    this.walletIndex = walletIndex
  }

  public async getStarkPublicKey (path: string): Promise<string> {
    this._debugLog('getStarkPublicKey', path)
    if (this.signer) {
      return this.signer.getStarkPublicKey(path)
    }

    const keyPair = await this.getKeyPairFromPath(path)
    const starkPublicKey = getStarkPublicKey(keyPair)
    return starkPublicKey
  }

  public async getActiveKeyPair (): Promise<KeyPair> {
    this._debugLog('getActiveKeyPair')
    await this.getAccountMapping()
    if (this.activeKeyPair) {
      return this.activeKeyPair
    } else {
      throw new Error('No Active Starkware KeyPair - please provide a path')
    }
  }

  public getEthereumAddress (): Promise<string> {
    this._debugLog('getEthereumAddress')
    return this.getAddress()
  }

  public async account (
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    this._debugLog('account', layer, application, index)
    this._layer = layer
    this._application = application
    this._index = index
    if (!application) {
      console.warn('application is undefined')
    }
    let path = await this.getAccountPath(layer, application, index)
    return this.getStarkKey(path)
  }

  public async getAccountPath (
    layer: string = this._layer,
    application: string = this._application,
    index: string = this._index
  ): Promise<string> {
    this._debugLog('getAccountPath')
    const ethAddress = await this.getEthereumAddress()
    this._debugLog('getAccountPath', layer, application, index, ethAddress)
    const path = getAccountPath(layer, application, ethAddress, index)

    return path
  }

  public async getStarkKey (path: string): Promise<string> {
    this._debugLog('getStarkKey', path)
    const starkPublicKey = await this.getStarkPublicKey(path)
    return sanitizeHex(getXCoordinate(starkPublicKey))
  }

  public async sign (message: string): Promise<Signature> {
    this._debugLog('sign', message)
    const path = await this.getAccountPath()
    if (this.signer) {
      return this.signer.starkSign(path, message)
    }

    const keyPair = await this.getKeyPairFromPath(path)
    return sign(keyPair, message)
  }

  public async signWithEthereumKey (message: string): Promise<string> {
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
    this._debugLog('sendTransaction', unsignedTx)
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

  public async getAddress (): Promise<string> {
    this._debugLog('getAddress')
    const wallet = this.getWallet()
    this._debugLog('getAddress wallet', wallet)
    return wallet.getAddress()
  }

  // -- Private ------------------------------------------------------- //

  private async getKeyPairFromPath (path: string): Promise<KeyPair> {
    this._debugLog('getKeyPairFromPath', path)
    const accountMapping = await this.getAccountMapping()
    if (this.privateKey) {
      const activeKeyPair = getKeyPair(this.privateKey)
      await this.setActiveKeyPair(path, activeKeyPair)
      return activeKeyPair
    }

    if (!path) {
      return this.getActiveKeyPair()
    }

    const match = accountMapping[path]
    if (match) {
      return ec.keyFromPrivate(match)
    }

    const activeKeyPair = getKeyPairFromPath(this.mnemonic, path)

    await this.setActiveKeyPair(path, activeKeyPair)
    return activeKeyPair
  }

  private async setActiveKeyPair (path: string, activeKeyPair: KeyPair) {
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
      this.activeKeyPair = ec.keyFromPrivate(accountMapping[paths[0]])
    }
    return accountMapping
  }

  private getWallet () {
    if (this.signer) {
      this._debugLog('getWallet this.signer')
      return this.signer
    }

    if (this.privateKey) {
      this._debugLog('getWallet this.privateKey')
      this._debugLog('getWallet provider', this.provider)
      try {
        return new Wallet(this.privateKey).connect(this.provider)
      } catch (err) {
        return new Wallet(this.privateKey)
      }
    }

    this._debugLog('getWallet fromMnemonic')
    return Wallet.fromMnemonic(
      this.mnemonic,
      getPath(this.walletIndex)
    ).connect(this.provider)
  }
}

export default StarkwareWallet
