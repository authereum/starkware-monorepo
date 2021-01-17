import { Asset, Signature } from '@authereum/starkware-crypto'

export interface AccountParams {
  layer: string
  application: string
  index: string
}

export interface RegisterUserParams {
  ethKey: string
  operatorSignature: string
}

export interface DepositParams {
  amount?: string
  asset: Asset
  vaultId: string
}

export interface DepositEthParams {
  amount: string
  quantum: string
  vaultId: string
}

export interface DepositErc20Params {
  amount: string
  quantum: string
  vaultId: string
  tokenAddress: string
}

export interface DepositErc721Params {
  tokenId: string
  vaultId: string
  tokenAddress: string
}

export interface DepositCancelParams {
  asset: Asset
  vaultId: string
}

export interface DepositParamsReclaimParams {
  vaultId: string
  asset: Asset
}

export interface WithdrawParams {
  asset: Asset
  recipient?: string
}

export interface WithdrawEthParams {
  quantum: string
  recipient?: string
}

export interface WithdrawErc20Params {
  quantum: string
  tokenAddress: string
  recipient?: string
}

export interface WithdrawErc721Params {
  tokenId: string
  tokenAddress: string
  recipient?: string
}

export interface WithdrawAndMintParams {
  asset: Asset
  mintingBlob: string
}

export interface EscapeParams {
  amount: string
  asset: Asset
  vaultId: string
}

export interface TransferPartyParams {
  starkKey: string
  vaultId: string
}

export interface TransferParams {
  from: TransferPartyParams
  to: TransferPartyParams
  asset: Asset
  amount?: string
  nonce: string
  expirationTimestamp: string
  condition?: string
}

export interface TransferEthParams {
  vaultId: string
  to: TransferPartyParams
  quantum: string
  amount: string
  nonce: string
  expirationTimestamp: string
  condition?: string
}

export interface TransferErc20Params {
  vaultId: string
  to: TransferPartyParams
  tokenAddress: string
  quantum: string
  amount: string
  nonce: string
  expirationTimestamp: string
  condition?: string
}

export interface TransferErc721Params {
  vaultId: string
  to: TransferPartyParams
  tokenAddress: string
  tokenId: string
  nonce: string
  expirationTimestamp: string
  condition?: string
}

export interface OrderAsset extends Asset {
  vaultId: string
  amount?: string
}

export interface OrderParams {
  sell: OrderAsset
  buy: OrderAsset
  nonce: string
  expirationTimestamp: string
}

export interface PerpetualAsset extends Asset {
  amount?: string
}

export interface PerpetualTransferMessenger {
  starkKey?: string
  positionId: string
}

export interface PerpetualTransferFee extends Asset {
  positionId: string
  maxAmount?: string
}

export interface PerpetualTransferParams {
  asset: PerpetualAsset
  fee: PerpetualTransferFee
  sender: PerpetualTransferMessenger
  receiver: PerpetualTransferMessenger
  nonce: string
  expirationTimestamp: string
  condition?: string
}

export interface PerpetualLimitOrderParams {
  syntheticAsset: PerpetualAsset
  collateralAsset: PerpetualAsset
  isBuyingSynthetic: boolean
  fee: PerpetualAsset
  nonce: string
  positionId: string
  expirationTimestamp: string
}

export interface PerpetualWithdrawalParams {
  collateralAsset: PerpetualAsset
  positionId: string
  nonce: string
  expirationTimestamp: string
}
