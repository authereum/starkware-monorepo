export default [
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    constant: true,
    inputs: [],
    name: 'VERSION',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'configurationHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'globalConfigurationHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'initialize',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'LogFrozen',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'acceptedGovernor',
        type: 'address',
      },
    ],
    name: 'LogNewGovernorAccepted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'nominatedGovernor',
        type: 'address',
      },
    ],
    name: 'LogNominatedGovernor',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'LogNominationCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'entry',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'entryId',
        type: 'string',
      },
    ],
    name: 'LogRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'entry',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'entryId',
        type: 'string',
      },
    ],
    name: 'LogRemovalIntent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'entry',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'entryId',
        type: 'string',
      },
    ],
    name: 'LogRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'removedGovernor',
        type: 'address',
      },
    ],
    name: 'LogRemovedGovernor',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'LogUnFrozen',
    type: 'event',
  },
  {
    constant: true,
    inputs: [],
    name: 'DEPOSIT_CANCEL_DELAY',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'FREEZE_GRACE_PERIOD',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'MAIN_GOVERNANCE_INFO_TAG',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'MAX_VERIFIER_COUNT',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'UNFREEZE_DELAY',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'VERIFIER_REMOVAL_DELAY',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'verifier',
        type: 'address',
      },
    ],
    name: 'announceAvailabilityVerifierRemovalIntent',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'verifier',
        type: 'address',
      },
    ],
    name: 'announceVerifierRemovalIntent',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getRegisteredAvailabilityVerifiers',
    outputs: [
      {
        internalType: 'address[]',
        name: '_verifers',
        type: 'address[]',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getRegisteredVerifiers',
    outputs: [
      {
        internalType: 'address[]',
        name: '_verifers',
        type: 'address[]',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'verifierAddress',
        type: 'address',
      },
    ],
    name: 'isAvailabilityVerifier',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'isFrozen',
    outputs: [
      {
        internalType: 'bool',
        name: 'frozen',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'verifierAddress',
        type: 'address',
      },
    ],
    name: 'isVerifier',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'mainAcceptGovernance',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'mainCancelNomination',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'testGovernor',
        type: 'address',
      },
    ],
    name: 'mainIsGovernor',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'newGovernor',
        type: 'address',
      },
    ],
    name: 'mainNominateNewGovernor',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'governorForRemoval',
        type: 'address',
      },
    ],
    name: 'mainRemoveGovernor',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'verifier',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'identifier',
        type: 'string',
      },
    ],
    name: 'registerAvailabilityVerifier',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'verifier',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'identifier',
        type: 'string',
      },
    ],
    name: 'registerVerifier',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'verifier',
        type: 'address',
      },
    ],
    name: 'removeAvailabilityVerifier',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'verifier',
        type: 'address',
      },
    ],
    name: 'removeVerifier',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'unFreeze',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'depositorEthKey',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nonQuantizedAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
    ],
    name: 'LogDeposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
    ],
    name: 'LogDepositCancel',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nonQuantizedAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
    ],
    name: 'LogDepositCancelReclaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
    ],
    name: 'LogDepositNftCancelReclaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nonQuantizedAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
    ],
    name: 'LogMintWithdrawalPerformed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
    ],
    name: 'LogMintableWithdrawalAllowed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'depositorEthKey',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
    ],
    name: 'LogNftDeposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
    ],
    name: 'LogNftWithdrawalAllowed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'LogNftWithdrawalPerformed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
    ],
    name: 'LogSystemAssetType',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'tokenAdmin',
        type: 'address',
      },
    ],
    name: 'LogTokenAdminAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'tokenAdmin',
        type: 'address',
      },
    ],
    name: 'LogTokenAdminRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'assetInfo',
        type: 'bytes',
      },
    ],
    name: 'LogTokenRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'userAdmin',
        type: 'address',
      },
    ],
    name: 'LogUserAdminAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'userAdmin',
        type: 'address',
      },
    ],
    name: 'LogUserAdminRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'ethKey',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'LogUserRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nonQuantizedAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
    ],
    name: 'LogWithdrawalAllowed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nonQuantizedAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'LogWithdrawalPerformed',
    type: 'event',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
    ],
    name: 'deposit',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
    ],
    name: 'deposit',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
    ],
    name: 'depositCancel',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'depositNft',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'depositNftReclaim',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
    ],
    name: 'depositReclaim',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
    ],
    name: 'getAssetInfo',
    outputs: [
      {
        internalType: 'bytes',
        name: 'assetInfo',
        type: 'bytes',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
    ],
    name: 'getCancellationRequest',
    outputs: [
      {
        internalType: 'uint256',
        name: 'request',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
    ],
    name: 'getDepositBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
    ],
    name: 'getEthKey',
    outputs: [
      {
        internalType: 'address',
        name: 'ethKey',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
    ],
    name: 'getFullWithdrawalRequest',
    outputs: [
      {
        internalType: 'uint256',
        name: 'res',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
    ],
    name: 'getQuantizedDepositBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'presumedAssetType',
        type: 'uint256',
      },
    ],
    name: 'getQuantum',
    outputs: [
      {
        internalType: 'uint256',
        name: 'quantum',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getSystemAssetType',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
    ],
    name: 'getWithdrawalBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'testedAdmin',
        type: 'address',
      },
    ],
    name: 'isTokenAdmin',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'testedAdmin',
        type: 'address',
      },
    ],
    name: 'isUserAdmin',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'onERC721Received',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'assetInfo',
        type: 'bytes',
      },
    ],
    name: 'registerSystemAssetType',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    name: 'registerToken',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'registerToken',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'registerTokenAdmin',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'ethKey',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'registerUser',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'registerUserAdmin',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'oldAdmin',
        type: 'address',
      },
    ],
    name: 'unregisterTokenAdmin',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'oldAdmin',
        type: 'address',
      },
    ],
    name: 'unregisterUserAdmin',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'mintingBlob',
        type: 'bytes',
      },
    ],
    name: 'withdrawAndMint',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'withdrawNft',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'withdrawNftTo',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetType',
        type: 'uint256',
      },
      {
        internalType: 'address payable',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'withdrawTo',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'configHash',
        type: 'bytes32',
      },
    ],
    name: 'LogGlobalConfiguration',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'configItem',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'configHash',
        type: 'bytes32',
      },
    ],
    name: 'LogItemConfiguration',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'LogOperatorAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'LogOperatorRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'sequenceNumber',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'batchId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vaultRoot',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'orderRoot',
        type: 'uint256',
      },
    ],
    name: 'LogRootUpdate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'stateTransitionFact',
        type: 'bytes32',
      },
    ],
    name: 'LogStateTransitionFact',
    type: 'event',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
    ],
    name: 'escape',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getLastBatchId',
    outputs: [
      {
        internalType: 'uint256',
        name: 'batchId',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getOrderRoot',
    outputs: [
      {
        internalType: 'uint256',
        name: 'root',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getOrderTreeHeight',
    outputs: [
      {
        internalType: 'uint256',
        name: 'height',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getSequenceNumber',
    outputs: [
      {
        internalType: 'uint256',
        name: 'seq',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getVaultRoot',
    outputs: [
      {
        internalType: 'uint256',
        name: 'root',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getVaultTreeHeight',
    outputs: [
      {
        internalType: 'uint256',
        name: 'height',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'testedOperator',
        type: 'address',
      },
    ],
    name: 'isOperator',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'newOperator',
        type: 'address',
      },
    ],
    name: 'registerOperator',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'configHash',
        type: 'bytes32',
      },
    ],
    name: 'setAssetConfiguration',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'bytes32',
        name: 'configHash',
        type: 'bytes32',
      },
    ],
    name: 'setGlobalConfiguration',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'removedOperator',
        type: 'address',
      },
    ],
    name: 'unregisterOperator',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'publicInput',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'applicationData',
        type: 'uint256[]',
      },
    ],
    name: 'updateState',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKeyA',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKeyB',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vaultIdA',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vaultIdB',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'collateralAssetId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'syntheticAssetId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountCollateral',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountSynthetic',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'aIsBuyingSynthetic',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
    ],
    name: 'LogForcedTradeRequest',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
    ],
    name: 'LogForcedWithdrawalRequest',
    type: 'event',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKeyA',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'starkKeyB',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultIdA',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultIdB',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'collateralAssetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'syntheticAssetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountCollateral',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountSynthetic',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'aIsBuyingSynthetic',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'forcedTradeRequest',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
    ],
    name: 'forcedWithdrawalRequest',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKeyA',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'starkKeyB',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultIdA',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultIdB',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'collateralAssetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'syntheticAssetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountCollateral',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountSynthetic',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'aIsBuyingSynthetic',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
    ],
    name: 'freezeRequest',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
    ],
    name: 'freezeRequest',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKeyA',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'starkKeyB',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultIdA',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultIdB',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'collateralAssetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'syntheticAssetId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountCollateral',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountSynthetic',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'aIsBuyingSynthetic',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
    ],
    name: 'getForcedTradeRequest',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'uint256',
        name: 'starkKey',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vaultId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'quantizedAmount',
        type: 'uint256',
      },
    ],
    name: 'getForcedWithdrawalRequest',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]
