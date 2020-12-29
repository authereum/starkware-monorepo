import EventEmitter from 'eventemitter3'

export interface IRpcConnection extends NodeJS.EventEmitter {
  connected: boolean

  send(payload: any): Promise<any>
  open(): Promise<void>
  close(): Promise<void>
}

export function payloadId (): number {
  const datePart: number = new Date().getTime() * Math.pow(10, 3)
  const extraPart: number = Math.floor(Math.random() * Math.pow(10, 3))
  const id: number = datePart + extraPart
  return id
}

export interface RequestParams<T = any> {
  id?: number
  jsonrpc?: string
  method: string
  params: T
}

abstract class BasicProvider extends EventEmitter<string> {
  private _connected = false
  public connection: IRpcConnection

  constructor (connection: IRpcConnection) {
    super()
    this.connection = connection
    if (this.connection.connected) {
      this.connected = true
    }
  }

  abstract async enable (...opts: any | undefined): Promise<any>

  set connected (value: boolean) {
    this._connected = value
    if (value === true) {
      this.emit('open')
      this.emit('connect')
    } else {
      this.emit('close')
      this.emit('disconnect')
    }
  }

  get connected (): boolean {
    return this._connected
  }

  public open (): Promise<void> {
    if (this.connected) {
      return Promise.resolve()
    }
    return new Promise((resolve, reject) => {
      this.connection.on('disconnect', () => {
        this.connected = false
        reject()
      })

      this.connection.on('connect', () => {
        this.connected = true
        resolve()
      })

      this.connection.open()
    })
  }

  public close (): Promise<void> {
    this.connected = false
    return this.connection.close()
  }

  public request = async <Result = any, Params = any>(
    params: RequestParams<Params>
  ): Promise<Result> => {
    const result = await this.connection.send({
      ...params,
      id: payloadId(),
      jsonrpc: '2.0',
    })
    return result
  }

  public async send<Result = any, Params = any> (
    method: string,
    params: Params
  ): Promise<Result> {
    const result = await this.connection.send({
      id: payloadId(),
      jsonrpc: '2.0',
      method,
      params: params || {},
    })
    return result
  }
}

export default BasicProvider
