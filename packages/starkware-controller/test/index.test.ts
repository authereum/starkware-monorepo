import * as starkwareCrypto from 'starkware-crypto';

import StarkwareController from '../src';

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

const provider = 'https://ropsten-rpc.linkpool.io/';

const starkPublicKey =
  '0303a535c13f12c6a2c7e7c0dade3a68225988698687e396a321c12f5d393bea4a';

const starkSignature =
  '0x03e243c5b004c89cd9c66fd1c8361c2d42226816214ac113f441027f165c6a7800c7724575abe95602caac714cbc1e650ca3f2355e76dbb5ffb6065c194a38471b';

describe('starkware-controller', () => {
  let controller: StarkwareController;
  beforeEach(() => {
    controller = new StarkwareController(mnemonic, provider, store);
  });
  it('should initiate successfully', async () => {
    expect(controller).toBeTruthy();
  });
  it('should resolve stark_account', async () => {
    const result = await controller.account(layer, application, index);
    expect(result).toBeTruthy();
    expect(result).toEqual(starkPublicKey);
  });
  it('should resolve stark_transfer', async () => {
    const from = { starkPublicKey, vaultId: '1' };
    const to = { starkPublicKey, vaultId: '606138218' };
    const token = { type: 'ETH' as 'ETH', data: { quantum: '10000000000' } };
    const quantizedAmount = '100000000';
    const nonce = '1597237097';
    const expirationTimestamp = '444396';
    const result = await controller.transfer(
      from,
      to,
      token,
      quantizedAmount,
      nonce,
      expirationTimestamp
    );
    expect(result).toBeTruthy();
    expect(result).toEqual(starkSignature);

    const senderVaultId = from.vaultId;
    const receiverVaultId = to.vaultId;
    const receiverPublicKey = to.starkPublicKey;
    const msg = starkwareCrypto.getTransferMsgHash(
      quantizedAmount,
      nonce,
      senderVaultId,
      token,
      receiverVaultId,
      receiverPublicKey,
      expirationTimestamp
    );
    const keyPair = await controller.getActiveKeyPair();
    const sig = starkwareCrypto.deserializeSignature(result);
    expect(starkwareCrypto.verify(keyPair, msg, sig as any)).toBeTruthy();
  });
  it('should resolve stark_transfer with condition', async () => {
    const from = { starkPublicKey, vaultId: '1' };
    const to = { starkPublicKey, vaultId: '606138218' };
    const token = { type: 'ETH' as 'ETH', data: { quantum: '10000000000' } };
    const quantizedAmount = '100000000';
    const nonce = '1597237097';
    const expirationTimestamp = '444396';
    const condition =
      '0x318ff6d26cf3175c77668cd6434ab34d31e59f806a6a7c06d08215bccb7eaf8';
    const result = await controller.transfer(
      from,
      to,
      token,
      quantizedAmount,
      nonce,
      expirationTimestamp,
      condition
    );
    expect(result).toBeTruthy();
    expect(result).toEqual(
      '0x0237f2ce312b9c30c9930b1b852f66cf69c19e08d60f664d2fcc41890e02b5600597bb50c7f44dcaa5193f7ead375b8efea280232590c5a95fb535a7dc33972a1c'
    );

    const senderVaultId = from.vaultId;
    const receiverVaultId = to.vaultId;
    const receiverPublicKey = to.starkPublicKey;
    const msg = starkwareCrypto.getTransferMsgHash(
      quantizedAmount,
      nonce,
      senderVaultId,
      token,
      receiverVaultId,
      receiverPublicKey,
      expirationTimestamp,
      condition
    );
    const keyPair = await controller.getActiveKeyPair();
    const sig = starkwareCrypto.deserializeSignature(result);
    expect(starkwareCrypto.verify(keyPair, msg, sig as any)).toBeTruthy();
  });
});
