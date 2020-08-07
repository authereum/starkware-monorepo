import { Wallet, providers } from 'ethers';

import StarkwareWallet from '../src';

import * as DVF from './dvf';

const ROPSTEN_TEST_MNEMONIC = '<INSERT_MNEMONIC>';
const INFURA_PROJECT_ID = '<INSER_INFURA_PROJECT_ID>';

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

const mnemonic = ROPSTEN_TEST_MNEMONIC;
const layer = 'starkex';
const application = 'starkexdvf';
const index = '0';

const provider = new providers.JsonRpcProvider(
  `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`
);

const wallet = Wallet.fromMnemonic(mnemonic).connect(provider);

const starkPublicKey =
  '0x06ad1f685084cb89104c2df0351a2fff44faab58b2cd09b8a1bfb50c79bd0709';

// const starkSignature =
//   '0x7130036cfee14ee468f84538da0b2c71f11908f3dcc4c0b7fb28c2e0c8504d1e4e3191d2adb180a2ec31eff2366381e2ec807426f232a6cae2387d6d7886e1c';

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
  it('should initiate successfully', async () => {
    expect(starkWallet).toBeTruthy();
  });
  it('should resolve successfully', async () => {
    const result = await request(starkWallet, {
      id: 1,
      jsonrpc: '2.0',
      method: 'stark_account',
      params: { layer, application, index },
    });
    expect(result).toBeTruthy();
    expect(result.starkPublicKey).toEqual(starkPublicKey);
  });

  it('stark_account -> personal_sign -> stark_register -> stark_transfer', async () => {
    const { starkPublicKey } = await request(starkWallet, {
      id: 1,
      jsonrpc: '2.0',
      method: 'stark_account',
      params: { layer, application, index },
    });
    console.log('starkPublicKey', starkPublicKey);

    expect(starkPublicKey).toBeTruthy();

    const contractAddress = DVF.config.exchange.starkExContractAddress;
    console.log('contractAddress', contractAddress);
    const nonce = String(Date.now() / 1000);
    console.log('nonce', nonce);
    const userSignature = await wallet.signMessage(nonce);
    console.log('userSignature', userSignature);
    expect(userSignature).toBeTruthy();

    const { deFiSignature: operatorSignature } = await DVF.registerUser(
      starkPublicKey,
      nonce,
      userSignature
    );
    console.log('operatorSignature', operatorSignature);

    const registerTxHash = await request(starkWallet, {
      id: 1,
      jsonrpc: '2.0',
      method: 'stark_register',
      params: {
        contractAddress,
        starkPublicKey,
        operatorSignature,
      },
    });
    console.log('registerTxHash', registerTxHash);

    await provider.waitForTransaction(registerTxHash);
    expect(registerTxHash).toBeTruthy();

    const tokenType = 'ETH';
    const quantum = String(DVF.config.tokenRegistry[tokenType].quantization);
    const tempVaultId = String(DVF.config.exchange.tempStarkVaultId);
    const starkVaultId = String(
      await DVF.getVaultId(tokenType, nonce, userSignature)
    );
    const transferSig = await request(starkWallet, {
      id: 1,
      jsonrpc: '2.0',
      method: 'stark_transfer',
      params: {
        from: { starkPublicKey, vaultId: tempVaultId },
        to: { starkPublicKey: starkPublicKey, vaultId: starkVaultId },
        token: {
          type: tokenType,
          data: { quantum },
        },
        quantizedAmount: '100000000',
        nonce,
        expirationTimestamp: Math.floor(Date.now() / (1000 * 3600)) + 720,
      },
    });
    expect(transferSig);
  });
});
