import { Wallet, providers } from 'ethers';

import StarkwareWallet from '../src';

const storage = {};

const store = {
  set: async (key: string, data: any) => {
    storage[key] = data;
  },
  get: async (key: string) => {
    return storage[key];
  },
  remove: async (key: string) => {
    delete storage[key];
  },
};

const mnemonic =
  'owner hover awake board copper fiber organ sudden nominee trick decline inflict';
const layer = 'starkex';
const application = 'starkexdvf';
const index = '0';

const provider = new providers.JsonRpcProvider(
  'https://ropsten-rpc.linkpool.io/'
);

const wallet = Wallet.fromMnemonic(mnemonic).connect(provider);

const starkPublicKey =
  '0303a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a';

const starkSignature =
  '0x03e243c5b004c89cd9c66fd1c8361c2d42226816214ac113f441027f165c6a7800c7724575abe95602caac714cbc1e650ca3f2355e76dbb5ffb6065c194a38471b';

async function request(starkWallet: StarkwareWallet, payload: any) {
  const res = await starkWallet.resolve(payload);
  if ('error' in res) {
    throw new Error(res.error.message);
  }
  return res.result;
}

describe('starkware-wallet', () => {
  let starkWallet: StarkwareWallet;
  beforeEach(() => {
    starkWallet = new StarkwareWallet(wallet, store);
  });
  it('init', async () => {
    expect(starkWallet).toBeTruthy();
  });
  it('stark_account', async () => {
    const result = await request(starkWallet, {
      id: 1,
      jsonrpc: '2.0',
      method: 'stark_account',
      params: { layer, application, index },
    });
    expect(result).toBeTruthy();
    expect(result.starkPublicKey).toEqual(starkPublicKey);
  });

  it('stark_transfer', async () => {
    const { starkPublicKey } = await request(starkWallet, {
      id: 1,
      jsonrpc: '2.0',
      method: 'stark_account',
      params: { layer, application, index },
    });

    expect(starkPublicKey).toBeTruthy();

    const transferSig = await request(starkWallet, {
      id: 1597237100918037,
      jsonrpc: '2.0',
      method: 'stark_transfer',
      params: {
        from: {
          starkPublicKey:
            '0303a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a',
          vaultId: '1',
        },
        to: {
          starkPublicKey:
            '0303a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a',
          vaultId: '606138218',
        },
        token: { type: 'ETH', data: { quantum: '10000000000' } },
        quantizedAmount: '100000000',
        nonce: '1597237097',
        expirationTimestamp: '444396',
      },
    });
    expect(transferSig);
    expect(transferSig.starkSignature).toEqual(starkSignature);
  });
});
