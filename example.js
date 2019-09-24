const { jsonToEth, ethToJson } = require ('./utils');
const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');

const jsonData = JSON.stringify({
  keyToChange: 'change me !',
  keyNotToTouch: 'do not touch me !',
  keyToDelete: 'delete me !',
});

const artifacts = JSON.parse(fs.readFileSync('./contracts/build/Storage.json'));

// Ganache network
const web3 = new Web3('http://127.0.0.1:7545');
const storage = new web3.eth.Contract(artifacts.abi, artifacts.networks['5777'].address);

// Smart contracts should be deployed befohand with 'truffle migrate'
(async function() {
  const address = (await web3.eth.getAccounts())[0];
  const id = '0x' + crypto.randomBytes(32).toString('hex');

  await storage.methods.set(id, ...jsonToEth(jsonData), address)
    .send({ from: address, gas: 1000000 }).catch(error => console.log(error.message));

  await storage.methods.setByDataKey(id, Web3.utils.stringToHex('keyToChange'), Web3.utils.toHex('changed !'))
    .send({ from: address, gas: 1000000 }).catch(error => console.log(error.message));

  await storage.methods.removeByDataKey(id, Web3.utils.stringToHex('keyToDelete'))
    .send({ from: address, gas: 1000000 }).catch(error => console.log(error.message));

  await storage.methods.setByDataKey(id, Web3.utils.stringToHex('newKey'), Web3.utils.toHex('I am a new key !'))
    .send({ from: address, gas: 1000000 }).catch(error => console.log(error.message));

  const ethDataFromContract = await storage.methods.get(id).call();
  const jsDataFromContract = ethToJson(ethDataFromContract);

  console.log(`Initial JSON value: ${JSON.stringify(jsonData)}, JSON value after processing inside smart contract: ${JSON.stringify(jsDataFromContract)}`);
})();





