# starkware-provider [![npm version](https://badge.fury.io/js/starkware-provider.svg)](https://badge.fury.io/js/starkware-provider)

Starkware Provider Library

## Example

```javascript
import StarkwareProvider from 'starkware-provider'

const contractAddress = '0xC5273AbFb36550090095B1EDec019216AD21BE6c'
const provider = new StarkwareProvider(wallet, contractAddress)
const starkPublicKey = await provider.enable()
```
