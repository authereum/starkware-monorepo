import { EventEmitter } from 'events'
import WalletConnectClient from '@walletconnect/client'

export class StarkwareWalletConnectProvider {
  _wc: any = null
  private _debug: boolean = false

  constructor (wc: any, opts: any = {}) {
    this._wc = wc
    if (opts && opts.debug) {
      this._debug = true
    }
  }

  private _debugLog = (...args: any) => {
    if (!this._debug) {
      return
    }

    console.debug('[stark-provider-wc]', ...args)
  }

  setDebug (debug: boolean) {
    this._debug = debug
  }

  public async enable () {
    return this._wc.accounts
  }

  public async sendRequest (method: string, params: any = {}) {
    this._debugLog('sendRequest', method, params)
    const customRequest: any = {
      id: Date.now(),
      jsonrpc: '2.0',
      method,
      params,
    }

    if (this._wc?.connector) {
      // `walletconnect` module
      return this._wc?.connector?.sendCustomRequest(customRequest)
    } else if (this._wc?._wc) {
      // blocknative
      return this._wc?._wc?.sendCustomRequest(customRequest)
    } else if (this._wc?.sendCustomRequest) {
      return this._wc?.sendCustomRequest(customRequest)
    }
  }

  public async account (layer: string, application: string, index: string) {
    this._debugLog('account', layer, application, index)
    const { starkKey } = await this.sendRequest('stark_account', {
      layer,
      application,
      index,
    })
    return starkKey
  }

  public async updateAccount (
    layer: string,
    application: string,
    index: string
  ) {
    this._debugLog('updateAccount', layer, application, index)
    await this.sendRequest('stark_updateAccount', {
      layer,
      application,
      index,
    })
  }

  public async requestAccounts () {
    this._debugLog('requestAccounts')
    const accounts = await this.sendRequest('eth_requestAccounts')
    return accounts
  }

  public async personalSign (msg: string) {
    this._debugLog('personalSign', msg)
    let address: null | string = null
    if (this._wc?.connector) {
      // `walletconnect` module
      address = this._wc?.connector?.accounts[0]
    } else if (this._wc?._wc) {
      // blocknative
      address = this._wc?._wc?.accounts[0]
    } else if (this._wc?.accounts) {
      address = this._wc?.accounts[0]
    }

    const signature = await this.sendRequest('personal_sign', [msg, address])
    return signature
  }

  public async registerUser (params: any) {
    this._debugLog('registerUser', params)
    const { txhash } = await this.sendRequest('stark_register', params)
    return txhash
  }

  public async deposit (params: any) {
    this._debugLog('deposit', params)
    const { txhash } = await this.sendRequest('stark_deposit', params)
    return txhash
  }

  public async withdraw (params: any) {
    this._debugLog('withdraw', params)
    const { txhash } = await this.sendRequest('stark_withdraw', params)
    return txhash
  }

  public async transfer (params: any) {
    this._debugLog('transfer', params)
    const { starkSignature } = await this.sendRequest('stark_transfer', params)
    return starkSignature
  }

  public async createOrder (params: any) {
    this._debugLog('createOrder', params)
    const { starkSignature } = await this.sendRequest(
      'stark_createOrder',
      params
    )
    return starkSignature
  }

  public async transferWithFees (params: any) {
    this._debugLog('transferWithFees', params)
    const { starkSignature } = await this.sendRequest(
      'stark_transferWithFees',
      params
    )
    return starkSignature
  }

  public async limitOrderWithFees (params: any) {
    this._debugLog('limitOrderWithFees', params)
    const { starkSignature } = await this.sendRequest(
      'stark_limitOrderWithFees',
      params
    )
    return starkSignature
  }

  public async withdrawWithFees (params: any) {
    this._debugLog('withdrawWithFees', params)
    const { starkSignature } = await this.sendRequest(
      'stark_withdrawWithFees',
      params
    )
    return starkSignature
  }
}

export class WalletConnectClientWrapper extends EventEmitter {
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
