# starkware-wallet [![npm version](https://badge.fury.io/js/starkware-wallet.svg)](https://badge.fury.io/js/starkware-wallet)

Starkware Wallet Library

## Example

```typescript
import { Wallet } from 'ethers';
import StarkwareWallet from 'starkware-wallet';

const rpcUrl = 'https://ropsten.mycustomnode.com';

const mnemonic = `puzzle number lab sense puzzle escape glove faith strike poem acoustic picture grit struggle know tuna soul indoor thumb dune fit job timber motor`;

const wallet = Wallet.fromMnemonic(mnemonic).connect(rpcUrl);

const store = {
  set: async (key: string, data: any) => {
    window.localStorage.setItem(key, JSON.stringify(data));
  },
  get: async (key: string) => {
    return JSON.parse(window.localStorage.getItem(key));
  },
  remove: async (key: string) => {
    window.localStorage.removeItem(key);
  },
};

//  Create StarkwareWallet
const starkwareWallet = new StarkwareWallet(wallet, store);

// Example payload
const payload = {
  id: 1,
  jsonrpc: '2.0',
  method: 'stark_account',
  params: {
    layer: 'starkex',
    application: 'starkexdvf',
    index: '0',
  },
};

// Resolve payload
const result = await starkwareWallet.resolve(payload);
// {
//     "id": 1,
//     "jsonrpc": "2.0",
//     "result": {
//         "starkPublicKey":"0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4",
//     }
// }
```

## API

```typescript
interface StarkwareWallet {
  controller: StarkwareController;
  setProvider(provider: string | providers.Porivder): void;
  setWalletIndex(walletIndex: number): void;
  resolve(payload: JsonRpcRequest): Promise<JsonRpcSuccess | JsonRpcError>;
}
```
