import StarkwareController from './controller';
//import * as StarkwareCrypto from './crypto';
import * as StarkwareCrypto from 'starkware-crypto';
import _abi from './abi';

export * from './types';
export const abi = _abi;
export const crypto = StarkwareCrypto;
export default StarkwareController;
