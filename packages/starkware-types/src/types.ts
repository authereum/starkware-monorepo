export interface AccountParams {
  layer: string;
  application: string;
  index: string;
}

export interface ETHTokenData {
  quantum: string;
}

export interface ERC20TokenData {
  quantum: string;
  tokenAddress: string;
}

export interface ERC721TokenData {
  tokenId: string;
  tokenAddress: string;
}

export type TokenTypes = 'ETH' | 'ERC20' | 'ERC721';

export type TokenData = ETHTokenData | ERC20TokenData | ERC721TokenData;

export interface Token {
  type: TokenTypes;
  data: TokenData;
}

export interface TransferParams {
  starkPublicKey: string;
  vaultId: string;
}

export interface OrderParams {
  vaultId: string;
  token: Token;
  quantizedAmount: string;
}

export namespace MethodParams {
  export type StarkAccountParams = {
    layer: string;
    application: string;
    index: string;
  };
  export type StarkRegisterUserParams = {
    contractAddress: string;
    ethKey: string;
    starkPublicKey: string;
    operatorSignature: string;
  };
  export type StarkDepositParams = {
    contractAddress: string;
    starkPublicKey: string;
    quantizedAmount: string;
    token: Token;
    vaultId: string;
  };
  export type StarkDepositCancelParams = {
    contractAddress: string;
    starkPublicKey: string;
    token: Token;
    vaultId: string;
  };
  export type StarkDepositReclaimParams = {
    contractAddress: string;
    starkPublicKey: string;
    token: Token;
    vaultId: string;
  };
  export type StarkTransferParams = {
    from: TransferParams;
    to: TransferParams;
    token: Token;
    quantizedAmount: string;
    nonce: string;
    expirationTimestamp: string;
  };
  export type StarkCreateOrderParams = {
    starkPublicKey: string;
    sell: OrderParams;
    buy: OrderParams;
    nonce: string;
    expirationTimestamp: string;
  };
  export type StarkWithdrawParams = {
    contractAddress: string;
    starkPublicKey: string;
    token: Token;
  };
  export type StarkWithdrawToParams = {
    contractAddress: string;
    starkPublicKey: string;
    token: Token;
    recipient: string;
  };
  export type StarkFullWithdrawalParams = {
    contractAddress: string;
    starkPublicKey: string;
    vaultId: string;
  };
  export type StarkFreezeParams = {
    contractAddress: string;
    starkPublicKey: string;
    vaultId: string;
  };
  export type StarkVerifyEscapeParams = {
    contractAddress: string;
    starkPublicKey: string;
    proof: string[];
  };
  export type StarkEscapeParams = {
    contractAddress: string;
    starkPublicKey: string;
    vaultId: string;
    token: Token;
    quantizedAmount: string;
  };
  export type StarkDepositNftParams = {
    contractAddress: string;
    starkPublicKey: string;
    assetType: string;
    vaultId: string;
    token: Token;
  };
  export type StarkDepositNftReclaimParams = {
    contractAddress: string;
    starkPublicKey: string;
    assetType: string;
    vaultId: string;
    token: Token;
  };
  export type StarkWithdrawAndMintParams = {
    contractAddress: string;
    starkPublicKey: string;
    assetType: string;
    mintingBlob: string | Buffer;
  };
  export type StarkWithdrawNftParams = {
    contractAddress: string;
    starkPublicKey: string;
    assetType: string;
    token: Token;
  };
  export type StarkWithdrawNftToParams = {
    contractAddress: string;
    starkPublicKey: string;
    assetType: string;
    token: Token;
    recipient: string;
  };
}

export namespace MethodResults {
  export type StarkAccountResult = { starkPublicKey: string };
  export type StarkRegisterUserResult = { txhash: string };
  export type StarkDepositResult = { txhash: string };
  export type StarkDepositCancelResult = { txhash: string };
  export type StarkDepositReclaimResult = { txhash: string };
  export type StarkTransferResult = { starkSignature: string };
  export type StarkCreateOrderResult = { starkSignature: string };
  export type StarkWithdrawResult = { txhash: string };
  export type StarkWithdrawToResult = { txhash: string };
  export type StarkFullWithdrawalResult = { txhash: string };
  export type StarkFreezeResult = { txhash: string };
  export type StarkVerifyEscapeResult = { txhash: string };
  export type StarkEscapeResult = { txhash: string };
  export type StarkDepositNftResult = { txhash: string };
  export type StarkDepositNftReclaimResult = { txhash: string };
  export type StarkWithdrawAndMintResult = { txhash: string };
  export type StarkWithdrawNftResult = { txhash: string };
  export type StarkWithdrawNftToResult = { txhash: string };
}
