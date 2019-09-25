# Solidity JSON data storage

Note: React demo UI may not work at the moment !!!

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
  someKey1: 'some value 1',
  someKey2: 'some value 2',
  someKey3: 'some value 3',
});

// data entry id
const id = '0x' + crypto.randomBytes(32).toString('hex');
// smart contract or account address, which is responsible for business logic for this entry
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

// data entry id, which should exist in Storage contract
const id = '0x6af14e3c125e2528f0e0b6f554c408796a606f81b22f046ca7b8e6400156714b'
// smart contract or account address, which is responsible for business logic for this entry
const address = '0x120f5E67e56dECfc3C635BAAbd99446167320152'; 

let keyName = Web3.utils.stringToHex('keyName');
let keyValue = Web3.utils.stringToHex('key value');
await storage.methods.setByDataKey(id, keyName, keyValue).send({ from: address });

keyValue = Web3.utils.stringToHex('new key value');
await storage.methods.setByDataKey(id, keyName, keyValue).send({ from: address });

await storage.methods.removeByDataKey(id, keyName).send({ from: address });

``` 

Check [example.js](example.js) for more details

## Roadmap
- [ ] Convenient wrappers of Contract abstractions and methods.
- [ ] Hex data types for values
- [ ] Data structure nesting
