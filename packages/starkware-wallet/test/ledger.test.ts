import { providers } from 'ethers'
import StarkwareWallet from '../src'

const provider = new providers.JsonRpcProvider(
  'https://ropsten-rpc.linkpool.io/'
)

const layer = 'starkex'
const application = 'starkexdvf'
const index = '0'
const starkKey =
  '0x03511b04b5d85b788d231abd7c888cceab6e5c02146252a9a6a451acffd54a7d'

describe.skip('StarkwareLedgerWallet', () => {
  const path = `m/44'/60'/0'/0`
  let starkWallet: StarkwareWallet = StarkwareWallet.fromLedger(path, provider)
  it('address', async () => {
    const address = await starkWallet.getEthereumAddress()
    expect(address).toEqual('0x1072cdd7c3d9963ba69506ECf50e16E963B35bb1')
  })
  it('account', async () => {
    const account = await starkWallet.account(layer, application, index)
    expect(account).toEqual(starkKey)
  })
  it('sign', async () => {
    const signature = await starkWallet.sign(
      '0x02eb156da69980db458ab9a1950073d51edc5b2393a49a9de550375076d9c104'
    )
    expect(JSON.stringify(signature)).toEqual(
      JSON.stringify({
        r: '05f765943fa19c93422eed3e93c0d545f92515d9b4afda0a8541c7b2540601ff',
        s: '01e4bf3ee0d791b928f649c8bf27967ff1c8841deac697d129485aca411e3e1f',
      })
    )
  }, 60e3)
})
