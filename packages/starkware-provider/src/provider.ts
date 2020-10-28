import BasicProvider from 'basic-provider';

import { IRpcConnection, IStarkwareProvider } from './interfaces';
import { AccountParams, Token, TransferParams, OrderParams } from './types';
import { MethodResults, MethodParams } from 'starkware-types';

function matches(a: any, b: any): boolean {
  if (typeof a !== typeof b) return false;
  let match = true;
  Object.keys(a).forEach(key => {
    if (a[key] !== b[key]) match = false;
  });
  return match;
}

// -- StarkwareProvider ---------------------------------------------------- //

class StarkwareProvider extends BasicProvider implements IStarkwareProvider {
  private accountParams: AccountParams | undefined;

  public contractAddress: string;
  public starkKey: string | undefined;

  constructor(connection: IRpcConnection, contractAddress: string) {
    super(connection);
    this.contractAddress = contractAddress;
  }

  // -- public ---------------------------------------------------------------- //

  public async enable(
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    try {
      await this.open();
      const starkKey = await this.updateAccount(layer, application, index);
      this.emit('enable');
      return starkKey;
    } catch (err) {
      await this.close();
      throw err;
    }
  }

  public async updateAccount(
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    const accountParams: AccountParams = { layer, application, index };
    if (this.starkKey && matches(this.accountParams, accountParams)) {
      return this.starkKey;
    }

    return this.getAccount(layer, application, index);
  }

  public async getActiveAccount(): Promise<string> {
    if (!this.accountParams) {
      throw new Error('No StarkKey available - please call provider.enable()');
    }
    if (this.starkKey) {
      return this.starkKey;
    }

    const { layer, application, index } = this.accountParams;
    return this.getAccount(layer, application, index);
  }

  public async getAccount(
    layer: string,
    application: string,
    index: string
  ): Promise<string> {
    this.accountParams = { layer, application, index };
    const { starkKey } = await this.send<
      MethodResults.StarkAccountResult,
      MethodParams.StarkAccountParams
    >('stark_account', {
      layer,
      application,
      index,
    });

    this.starkKey = starkKey;
    return starkKey;
  }

  public async registerUser(
    ethKey: string,
    operatorSignature: string
  ): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkRegisterUserResult,
      MethodParams.StarkRegisterUserParams
    >('stark_registerUser', {
      contractAddress,
      ethKey,
      starkKey,
      operatorSignature,
    });
    return txhash;
  }

  public async deposit(
    quantizedAmount: string,
    token: Token,
    vaultId: string
  ): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkDepositResult,
      MethodParams.StarkDepositParams
    >('stark_deposit', {
      contractAddress,
      starkKey,
      quantizedAmount,
      token,
      vaultId,
    });
    return txhash;
  }

  public async depositCancel(token: Token, vaultId: string): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkDepositCancelResult,
      MethodParams.StarkDepositCancelParams
    >('stark_depositCancel', {
      contractAddress,
      starkKey,
      token,
      vaultId,
    });
    return txhash;
  }

  public async depositReclaim(token: Token, vaultId: string): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkDepositReclaimResult,
      MethodParams.StarkDepositReclaimParams
    >('stark_depositReclaim', {
      contractAddress,
      starkKey,
      token,
      vaultId,
    });
    return txhash;
  }

  public async transfer(
    to: TransferParams,
    vaultId: string,
    token: Token,
    quantizedAmount: string,
    nonce: string,
    expirationTimestamp: string
  ): Promise<string> {
    const starkKey = await this.getActiveAccount();
    const from = { starkKey, vaultId };
    const { starkSignature } = await this.send<
      MethodResults.StarkTransferResult,
      MethodParams.StarkTransferParams
    >('stark_transfer', {
      from,
      to,
      token,
      quantizedAmount,
      nonce,
      expirationTimestamp,
    });
    return starkSignature;
  }

  public async createOrder(
    sell: OrderParams,
    buy: OrderParams,
    nonce: string,
    expirationTimestamp: string
  ): Promise<string> {
    const starkKey = await this.getActiveAccount();
    const { starkSignature } = await this.send<
      MethodResults.StarkCreateOrderResult,
      MethodParams.StarkCreateOrderParams
    >('stark_createOrder', {
      starkKey,
      sell,
      buy,
      nonce,
      expirationTimestamp,
    });
    return starkSignature;
  }

  public async withdraw(token: Token): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkWithdrawResult,
      MethodParams.StarkWithdrawParams
    >('stark_withdraw', {
      contractAddress,
      starkKey,
      token,
    });
    return txhash;
  }

  public async withdrawTo(token: Token, recipient: string): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkWithdrawToResult,
      MethodParams.StarkWithdrawToParams
    >('stark_withdrawTo', {
      contractAddress,
      starkKey,
      token,
      recipient,
    });
    return txhash;
  }

  public async withdrawFull(vaultId: string): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkFullWithdrawalResult,
      MethodParams.StarkFullWithdrawalParams
    >('stark_fullWithdrawal', {
      contractAddress,
      starkKey,
      vaultId,
    });
    return txhash;
  }

  public async freezeVault(vaultId: string): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkFreezeResult,
      MethodParams.StarkFreezeParams
    >('stark_freeze', {
      contractAddress,
      starkKey,
      vaultId,
    });
    return txhash;
  }

  public async verifyEspace(proof: string[]): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkVerifyEscapeResult,
      MethodParams.StarkVerifyEscapeParams
    >('stark_verifyEscape', {
      contractAddress,
      starkKey,
      proof,
    });
    return txhash;
  }

  public async escape(
    vaultId: string,
    token: Token,
    quantizedAmount: string
  ): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkEscapeResult,
      MethodParams.StarkEscapeParams
    >('stark_escape', {
      contractAddress,
      starkKey,
      vaultId,
      token,
      quantizedAmount,
    });
    return txhash;
  }

  public async depositNft(
    assetType: string,
    vaultId: string,
    token: Token
  ): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkDepositNftResult,
      MethodParams.StarkDepositNftParams
    >('stark_depositNft', {
      contractAddress,
      starkKey,
      assetType,
      vaultId,
      token,
    });

    return txhash;
  }

  public async depositNftReclaim(
    assetType: string,
    vaultId: string,
    token: Token
  ): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkDepositNftReclaimResult,
      MethodParams.StarkDepositNftReclaimParams
    >('stark_depositNftReclaim', {
      contractAddress,
      starkKey,
      assetType,
      vaultId,
      token,
    });

    return txhash;
  }

  public async withdrawAndMint(
    assetType: string,
    mintingBlob: string | Buffer
  ): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkWithdrawAndMintResult,
      MethodParams.StarkWithdrawAndMintParams
    >('stark_withdrawAndMint', {
      contractAddress,
      starkKey,
      assetType,
      mintingBlob,
    });

    return txhash;
  }

  public async withdrawNft(assetType: string, token: Token): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkWithdrawNftResult,
      MethodParams.StarkWithdrawNftParams
    >('stark_withdrawNft', {
      contractAddress,
      starkKey,
      assetType,
      token,
    });

    return txhash;
  }

  public async withdrawNftTo(
    assetType: string,
    token: Token,
    recipient: string
  ): Promise<string> {
    const contractAddress = this.contractAddress;
    const starkKey = await this.getActiveAccount();
    const { txhash } = await this.send<
      MethodResults.StarkWithdrawNftToResult,
      MethodParams.StarkWithdrawNftToParams
    >('stark_withdrawNftTo', {
      contractAddress,
      starkKey,
      assetType,
      token,
      recipient,
    });

    return txhash;
  }
}

export default StarkwareProvider;
