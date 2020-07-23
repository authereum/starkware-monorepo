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
      this.wallet.provider,
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
    this.controller.setProvider(this.wallet.provider);
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
        case 'stark_account':
          const accountParams = payload.params as MethodParams.StarkAccountParams;
          const accountResult: MethodResults.StarkAccountResult = {
            starkPublicKey: await this.controller.account(
              accountParams.layer,
              accountParams.application,
              accountParams.index
            ),
          };
          response = {
            id,
            result: accountResult,
          };
          break;
        case 'stark_register':
          const registerParams = payload.params as MethodParams.StarkRegisterParams;
          const registerUnsignedTx = await this.controller.register(
            registerParams.contractAddress,
            registerParams.starkPublicKey,
            registerParams.operatorSignature
          );
          const registerTx = await this.wallet.sendTransaction(
            registerUnsignedTx
          );
          const registerResult: MethodResults.StarkRegisterResult = {
            txhash: registerTx.hash,
          };
          response = {
            id,
            result: registerResult,
          };
          break;
        case 'stark_deposit':
          const depositParams = payload.params as MethodParams.StarkDepositParams;
          const depositUnsignedTx = await this.controller.deposit(
            depositParams.contractAddress,
            depositParams.starkPublicKey,
            depositParams.quantizedAmount,
            depositParams.token,
            depositParams.vaultId
          );
          const depositTx = await this.wallet.sendTransaction(
            depositUnsignedTx
          );
          const depositResult: MethodResults.StarkDepositResult = {
            txhash: depositTx.hash,
          };
          response = {
            id,
            result: depositResult,
          };
          break;
        case 'stark_depositCancel':
          const depositCancelParams = payload.params as MethodParams.StarkDepositCancelParams;
          const depositCancelUnsignedTx = await this.controller.depositCancel(
            depositCancelParams.contractAddress,
            depositCancelParams.starkPublicKey,
            depositCancelParams.token,
            depositCancelParams.vaultId
          );
          const depositCancelTx = await this.wallet.sendTransaction(
            depositCancelUnsignedTx
          );
          const depositCancelResult: MethodResults.StarkDepositCancelResult = {
            txhash: depositCancelTx.hash,
          };
          response = {
            id,
            result: depositCancelResult,
          };
          break;
        case 'stark_depositReclaim':
          const depositReclaimParams = payload.params as MethodParams.StarkDepositReclaimParams;
          const depositReclaimUnsignedTx = await this.controller.depositReclaim(
            depositReclaimParams.contractAddress,
            depositReclaimParams.starkPublicKey,
            depositReclaimParams.token,
            depositReclaimParams.vaultId
          );
          const depositReclaimTx = await this.wallet.sendTransaction(
            depositReclaimUnsignedTx
          );
          const depositReclaimResult: MethodResults.StarkDepositReclaimResult = {
            txhash: depositReclaimTx.hash,
          };
          response = {
            id,
            result: depositReclaimResult,
          };
          break;
        case 'stark_transfer':
          const transferParams = payload.params as MethodParams.StarkTransferParams;
          const transferResult: MethodResults.StarkTransferResult = {
            starkSignature: await this.controller.transfer(
              transferParams.from,
              transferParams.to,
              transferParams.token,
              transferParams.quantizedAmount,
              transferParams.nonce,
              transferParams.expirationTimestamp
            ),
          };
          response = {
            id,
            result: transferResult,
          };
          break;
        case 'stark_createOrder':
          const createOrderParams = payload.params as MethodParams.StarkCreateOrderParams;
          const createOrderResult: MethodResults.StarkCreateOrderResult = {
            starkSignature: await this.controller.createOrder(
              createOrderParams.starkPublicKey,
              createOrderParams.sell,
              createOrderParams.buy,
              createOrderParams.nonce,
              createOrderParams.expirationTimestamp
            ),
          };
          response = {
            id,
            result: createOrderResult,
          };
          break;
        case 'stark_withdrawal':
          const withdrawalParams = payload.params as MethodParams.StarkWithdrawalParams;
          const withdrawalUnsignedTx = await this.controller.withdrawal(
            withdrawalParams.contractAddress,
            withdrawalParams.starkPublicKey,
            withdrawalParams.token
          );
          const withdrawalTx = await this.wallet.sendTransaction(
            withdrawalUnsignedTx
          );
          const withdrawalResult: MethodResults.StarkWithdrawalResult = {
            txhash: withdrawalTx.hash,
          };
          response = {
            id,
            result: withdrawalResult,
          };
          break;
        case 'stark_fullWithdrawal':
          const fullWithdrawalParams = payload.params as MethodParams.StarkFullWithdrawalParams;
          const fullWithdrawalUnsignedTx = await this.controller.fullWithdrawal(
            fullWithdrawalParams.contractAddress,
            fullWithdrawalParams.starkPublicKey,
            fullWithdrawalParams.vaultId
          );
          const fullWithdrawalTx = await this.wallet.sendTransaction(
            fullWithdrawalUnsignedTx
          );
          const fullWithdrawalResult: MethodResults.StarkFullWithdrawalResult = {
            txhash: fullWithdrawalTx.hash,
          };
          response = {
            id,
            result: fullWithdrawalResult,
          };
          break;
        case 'stark_freeze':
          const freezeParams = payload.params as MethodParams.StarkFreezeParams;
          const freezeUnsignedTx = await this.controller.freeze(
            freezeParams.contractAddress,
            freezeParams.starkPublicKey,
            freezeParams.vaultId
          );
          const freezeTx = await this.wallet.sendTransaction(freezeUnsignedTx);
          const freezeResult: MethodResults.StarkFreezeResult = {
            txhash: freezeTx.hash,
          };
          response = {
            id,
            result: freezeResult,
          };
          break;
        case 'stark_verifyEscape':
          const verifyEscapeParams = payload.params as MethodParams.StarkVerifyEscapeParams;
          const verifyEscapeUnsignedTx = await this.controller.verifyEscape(
            verifyEscapeParams.contractAddress,
            verifyEscapeParams.starkPublicKey,
            verifyEscapeParams.proof
          );
          const verifyEscapeTx = await this.wallet.sendTransaction(
            verifyEscapeUnsignedTx
          );
          const verifyEscapeResult: MethodResults.StarkVerifyEscapeResult = {
            txhash: verifyEscapeTx.hash,
          };
          response = {
            id,
            result: verifyEscapeResult,
          };
          break;
        case 'stark_escape':
          const escapeParams = payload.params as MethodParams.StarkEscapeParams;
          const escapeUnsignedTx = await this.controller.escape(
            escapeParams.contractAddress,
            escapeParams.starkPublicKey,
            escapeParams.vaultId,
            escapeParams.token,
            escapeParams.quantizedAmount
          );
          const escapeTx = await this.wallet.sendTransaction(escapeUnsignedTx);
          const escapeResult: MethodResults.StarkEscapeResult = {
            txhash: escapeTx.hash,
          };
          response = {
            id,
            result: escapeResult,
          };
          break;
        default:
          throw new Error(`Unknown Starkware RPC Method: ${method}`);
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
