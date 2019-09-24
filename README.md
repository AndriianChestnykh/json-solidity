# Solidity JSON data storage

## Abstract 
This repository contains Solidity and JavaScript libraries which enables storage and processing of JSON-like data structures on chain. It can be used as universal data storage for many use cases.

## Features
- [x] **Support JSON parsing and storage**  
Smart contracts can parse simple JSON data. Arbitrary quantity of key:value pairs. Dynamic values length. At the moment, values can be only strings but not binary (hex) or nested data structure.

- [x] **On chain access to data structure**  
Logic smart contracts build on top of Storage contract can operate key and values of JSON data in it.

- [x] **Security and versioning with per-entry granularity**  
Each JSON entry in Storage contract is bound to its specific Logic Smart Sontract or account address with exclusive permissions to modify the entry or switch ot other Logic address

## Usage
**Save JSON to Storage contract**
```js
...
const { jsonToEth, ethToJson } = require ('./utils');

const jsonData = JSON.stringify({
  someKey1: 'someValue1',
  someKey2: 'someValue2',
  someKey3: 'someValue3',
});

// smart contract or account address, which is responsible for business logic
const address = '0x120f5E67e56dECfc3C635BAAbd99446167320152'; 

await storage.methods.set(id, ...jsonToEth(jsonData), address).send({ from: address });
...
```

**Get JSON from Storage contract**
```js
const { jsonToEth, ethToJson } = require ('./utils');

const ethDataFromContract = await storage.methods.get(id).call();
const jsonDataFromContract = ethToJson(ethDataFromContract);
``` 

**Add/update/delete key value inside Storage contract**
```js
const { jsonToEth, ethToJson } = require ('./utils');

// smart contract or account address, which is responsible for business logic
const address = '0x120f5E67e56dECfc3C635BAAbd99446167320152'; 

await storage.methods.setByDataKey(id, Web3.utils.stringToHex('newKey'), Web3.utils.toHex('I am a new key !')).send({ from: address });
await storage.methods.setByDataKey(id, Web3.utils.stringToHex('keyToChange'), Web3.utils.toHex('changed !')).send({ from: address });
await storage.methods.removeByDataKey(id, Web3.utils.stringToHex('keyToDelete')).send({ from: address });

``` 

Check [example.js](example.js) for more details

## Roadmap
- [ ] Convenient wrappers of Contract abstractions and methods.
- [ ] Hex data types for values
- [ ] Data structure nesting
