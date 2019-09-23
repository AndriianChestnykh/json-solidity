const { jsToEth, ethToJs } = require ('./utils');
const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');

const jsData = {
  someKey1: 'someValue1',
  someKey2: 'someValue2',
};

const artifacts = JSON.parse(fs.readFileSync('./contracts/build/Storage.json'));
// Ganache network
const web3 = new Web3('http://127.0.0.1:7545');
const storage = new web3.eth.Contract(artifacts.abi, artifacts.networks['5777'].address);

(async function() {
  const address = (await web3.eth.getAccounts())[0];
  const id = '0x' + crypto.randomBytes(32).toString('hex');
  const { keys, values, offsets } = jsToEth(jsData);

  await storage.methods.set(id, keys, values, offsets, address)
    .send({ from: address, gas: 1000000 }).catch(error => console.log(error.message));

  await storage.methods.setByDataKey(id, Web3.utils.stringToHex('newKey'), Web3.utils.toHex('someValueOfNewKey'))
    .send({ from: address, gas: 1000000 }).catch(error => console.log(error.message));

  await storage.methods.setByDataKey(id, Web3.utils.stringToHex('someKey1'), Web3.utils.toHex('someNewKey1Value'))
    .send({ from: address, gas: 1000000 }).catch(error => console.log(error.message));

  const ethDataFromContract = await storage.methods.get(id).call();
  const jsDataFromContract = ethToJs(ethDataFromContract.keys, ethDataFromContract.values, ethDataFromContract.offsets)
  console.log(`Initial JSON value: ${JSON.stringify(jsData)}, JSON value after processing inside smart contract: ${JSON.stringify(jsDataFromContract)}`);
})();





