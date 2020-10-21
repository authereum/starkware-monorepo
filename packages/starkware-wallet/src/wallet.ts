import StarkwareController from 'starkware-controller';
import { Wallet, providers } from 'ethers';
import { MethodParams } from 'starkware-types';

import { Store, MethodResults } from './types';

const ETH_STANDARD_PATH = "m/44'/60'/0'/0";

function getPath(index = 0) {
  return `${ETH_STANDARD_PATH}/${index}`;
}

// -- StarkwareWallet --------------------------------------------- //

export class StarkwareWallet {
  public controller: StarkwareController;

  constructor(
    private wallet: Wallet,
    private store: Store,
    accountMappingKey?: string
  ) {
    this.controller = new StarkwareController(
      this.wallet.mnemonic.phrase,
      this.wallet.provider as any,
      this.store,
      accountMappingKey
    );
  }

  public setProvider(provider: string | providers.Provider): void {
    this.wallet = this.wallet.connect(
      typeof provider === 'string'
        ? new providers.JsonRpcProvider(provider)
        : provider
    );
    this.controller.setProvider(this.wallet.provider as any);
  }

  public setWalletIndex(walletIndex: number): void {
    this.wallet = Wallet.fromMnemonic(
      this.wallet.mnemonic.phrase,
      getPath(walletIndex)
    ).connect(this.wallet.provider);
    this.controller.setWalletIndex(walletIndex);
  }

  public async resolve(payload: any) {
    let response: { id: number; result: any };
    const { id, method } = payload;
    try {
      switch (method) {
        case 'stark_account': {
          const params = payload.params as MethodParams.StarkAccountParams;
          const result: MethodResults.StarkAccountResult = {
            starkPublicKey: await this.controller.account(
              params.layer,
              params.application,
              params.index
            ),
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_registerUser': {
          const params = payload.params as MethodParams.StarkRegisterUserParams;
          const unsignedTx = await this.controller.registerUser(
            params.contractAddress,
            params.ethKey,
            params.starkPublicKey,
            params.operatorSignature
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkRegisterUserResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_deposit': {
          const params = payload.params as MethodParams.StarkDepositParams;
          const unsignedTx = await this.controller.deposit(
            params.contractAddress,
            params.starkPublicKey,
            params.quantizedAmount,
            params.token,
            params.vaultId
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkDepositResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_depositCancel': {
          const params = payload.params as MethodParams.StarkDepositCancelParams;
          const unsignedTx = await this.controller.depositCancel(
            params.contractAddress,
            params.starkPublicKey,
            params.token,
            params.vaultId
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkDepositCancelResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_depositReclaim': {
          const params = payload.params as MethodParams.StarkDepositReclaimParams;
          const unsignedTx = await this.controller.depositReclaim(
            params.contractAddress,
            params.starkPublicKey,
            params.token,
            params.vaultId
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkDepositReclaimResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_transfer': {
          const params = payload.params as MethodParams.StarkTransferParams;
          const result: MethodResults.StarkTransferResult = {
            starkSignature: await this.controller.transfer(
              params.from,
              params.to,
              params.token,
              params.quantizedAmount,
              params.nonce,
              params.expirationTimestamp
            ),
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_createOrder': {
          const params = payload.params as MethodParams.StarkCreateOrderParams;
          const result: MethodResults.StarkCreateOrderResult = {
            starkSignature: await this.controller.createOrder(
              params.starkPublicKey,
              params.sell,
              params.buy,
              params.nonce,
              params.expirationTimestamp
            ),
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_withdraw': {
          const params = payload.params as MethodParams.StarkWithdrawParams;
          const unsignedTx = await this.controller.withdraw(
            params.contractAddress,
            params.starkPublicKey,
            params.token
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkWithdrawResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_withdrawTo': {
          const params = payload.params as MethodParams.StarkWithdrawToParams;
          const unsignedTx = await this.controller.withdrawTo(
            params.contractAddress,
            params.starkPublicKey,
            params.token,
            params.recipient
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkWithdrawToResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_fullWithdrawal': {
          const params = payload.params as MethodParams.StarkFullWithdrawalParams;
          const unsignedTx = await this.controller.fullWithdrawal(
            params.contractAddress,
            params.starkPublicKey,
            params.vaultId
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkFullWithdrawalResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_freeze': {
          const params = payload.params as MethodParams.StarkFreezeParams;
          const unsignedTx = await this.controller.freeze(
            params.contractAddress,
            params.starkPublicKey,
            params.vaultId
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkFreezeResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_verifyEscape': {
          const params = payload.params as MethodParams.StarkVerifyEscapeParams;
          const unsignedTx = await this.controller.verifyEscape(
            params.contractAddress,
            params.starkPublicKey,
            params.proof
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkVerifyEscapeResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_escape': {
          const params = payload.params as MethodParams.StarkEscapeParams;
          const unsignedTx = await this.controller.escape(
            params.contractAddress,
            params.starkPublicKey,
            params.vaultId,
            params.token,
            params.quantizedAmount
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkEscapeResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_depositNft': {
          const params = payload.params as MethodParams.StarkDepositNftParams;
          const unsignedTx = await this.controller.depositNft(
            params.contractAddress,
            params.starkPublicKey,
            params.assetType,
            params.vaultId,
            params.token
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkDepositNftResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_depositNftReclaim': {
          const params = payload.params as MethodParams.StarkDepositNftReclaimParams;
          const unsignedTx = await this.controller.depositNftReclaim(
            params.contractAddress,
            params.starkPublicKey,
            params.assetType,
            params.vaultId,
            params.token
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkDepositNftReclaimResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_withdrawAndMint': {
          const params = payload.params as MethodParams.StarkWithdrawAndMintParams;
          const unsignedTx = await this.controller.withdrawAndMint(
            params.contractAddress,
            params.starkPublicKey,
            params.assetType,
            params.mintingBlob
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkWithdrawAndMintResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_withdrawNft': {
          const params = payload.params as MethodParams.StarkWithdrawNftParams;
          const unsignedTx = await this.controller.withdrawNft(
            params.contractAddress,
            params.starkPublicKey,
            params.assetType,
            params.token
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkWithdrawNftResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        case 'stark_withdrawNftTo': {
          const params = payload.params as MethodParams.StarkWithdrawNftToParams;
          const unsignedTx = await this.controller.withdrawNftTo(
            params.contractAddress,
            params.starkPublicKey,
            params.assetType,
            params.token,
            params.recipient
          );
          const tx = await this.wallet.sendTransaction(unsignedTx);
          const result: MethodResults.StarkWithdrawNftToResult = {
            txhash: tx.hash,
          };
          response = {
            id,
            result,
          };
          break;
        }
        default: {
          throw new Error(`Unknown Starkware RPC Method: ${method}`);
        }
      }
      return response;
    } catch (error) {
      return {
        id: payload.id,
        error: {
          message: error.message,
        },
      };
    }
  }
}

export default StarkwareWallet;
