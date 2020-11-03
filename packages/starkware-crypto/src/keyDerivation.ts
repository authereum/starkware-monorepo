import { hdkey } from 'ethereumjs-wallet'
import * as bip39 from 'bip39'
import * as encUtils from 'enc-utils'
import BN from 'bn.js'
import hash from 'hash.js'
import { ec, deserializeSignature } from './crypto'

/*
 Returns an integer from a given section of bits out of a hex string.
 hex is the target hex string to slice.
 start represents the index of the first bit to cut from the hex string (binary) in LSB order.
 end represents the index of the last bit to cut from the hex string.
*/
function getIntFromBits (hex: string, start: number, end?: number) {
  const bin = encUtils.hexToBinary(hex)
  const bits = bin.slice(start, end)
  const i = encUtils.binaryToNumber(bits)
  return i
}

/*
 Derives key-pair from given mnemonic string and path.
 mnemonic should be a sentence comprised of 12 words with single spaces between them.
 path is a formatted string describing the stark key path based on the layer, application and eth
 address.
*/
export function getKeyPairFromPath (mnemonic: string, path: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const keySeed = hdkey
    .fromMasterSeed(seed)
    .derivePath(path)
    .getWallet()
    .getPrivateKeyString()
  const starkEcOrder = ec.n
  return ec.keyFromPrivate(grindKey(keySeed, starkEcOrder), 'hex')
}

/*
 Calculates the stark path based on the layer, application, eth address and a given index.
 layer is a string representing the operating layer (usually 'starkex').
 application is a string representing the relevant application (For a list of valid applications,
 refer to https://starkware.co/starkex/docs/requirementsApplicationParameters.html).
 ethereumAddress is a string representing the ethereum public key from which we derive the stark
 key.
 index represents an index of the possible associated wallets derived from the seed.
*/
export function getAccountPath (
  layer: string,
  application: string,
  ethereumAddress: string,
  index: string | number
) {
  const layerHash = hash
    .sha256()
    .update(layer)
    .digest('hex')
  const applicationHash = hash
    .sha256()
    .update(application)
    .digest('hex')
  const layerInt = getIntFromBits(layerHash, -31)
  const applicationInt = getIntFromBits(applicationHash, -31)
  // Draws the 31 LSBs of the eth address.
  const ethAddressInt1 = getIntFromBits(ethereumAddress, -31)
  // Draws the following 31 LSBs of the eth address.
  const ethAddressInt2 = getIntFromBits(ethereumAddress, -62, -31)
  return `m/2645'/${layerInt}'/${applicationInt}'/${ethAddressInt1}'/${ethAddressInt2}'/${index}`
}

/*
 This function receives a key seed and produces an appropriate StarkEx key from a uniform
 distribution.
 Although it is possible to define a StarkEx key as a residue between the StarkEx EC order and a
 random 256bit digest value, the result would be a biased key. In order to prevent this bias, we
 deterministically search (by applying more hashes, AKA grinding) for a value lower than the largest
 256bit multiple of StarkEx EC order.
*/
export function grindKey (keySeed: string, keyValLimit: any) {
  const sha256EcMaxDigest = new BN(
    '1 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000',
    16
  )
  const maxAllowedVal = sha256EcMaxDigest.sub(
    sha256EcMaxDigest.mod(keyValLimit)
  )
  let i = 0
  let key = hashKeyWithIndex(keySeed, i)
  i++
  // Make sure the produced key is devided by the Stark EC order, and falls within the range
  // [0, maxAllowedVal).
  while (!key.lt(maxAllowedVal)) {
    key = hashKeyWithIndex(keySeed, i)
    i++
  }
  return key.umod(keyValLimit).toString('hex')
}

function hashKeyWithIndex (key: string, index: number) {
  return new BN(
    hash
      .sha256()
      .update(
        encUtils.hexToBuffer(
          encUtils.removeHexPrefix(key) +
            encUtils.sanitizeBytes(encUtils.numberToHex(index), 2)
        )
      )
      .digest('hex'),
    16
  )
}

export const StarkExEc = ec.n

export function privateKeyFromSignature (signature: string): string {
  const sig = deserializeSignature(signature)
  return grindKey(sig.r.toString('hex'), StarkExEc)
}
