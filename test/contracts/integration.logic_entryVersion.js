const { jsonToEth, ethToJson } = require ('../../utils');
const Web3 = require('web3');
const crypto = require('crypto');
const Storage = artifacts.require('Storage');
const Logic_EntryVersion = artifacts.require('Logic_EntryVersion');

const id = '0x' + crypto.randomBytes(32).toString('hex');

contract('set', accounts => {
  it('set and get the same value plus version', async() => {
    const logicInstance = await Logic_EntryVersion.deployed(Storage.address);
    let logicAddress = Logic_EntryVersion.address;

    const jsonData = JSON.stringify({ someKey1: 'someValue1', someKey2: 'someValue2' });
    const jsonDataWithVersion = JSON.stringify(Object.assign(JSON.parse(jsonData), { _version: '\u0001' }));

    await logicInstance.set(id, ...jsonToEth(jsonData), { from: accounts[0] });
    const returnedData = await logicInstance.get.call(id);

    assert.equal(ethToJson(returnedData), jsonDataWithVersion, 'Returned js data is not equal to saved one with correct version');
    assert.equal(returnedData.logic, logicAddress, 'Logic_EntryVersion is not equal to Logic_EntryVersion contract address');
  });

  it('version should be 2 after update via set', async() => {
    const logicInstance = await Logic_EntryVersion.deployed(Storage.address);

    const jsonDataV2 = JSON.stringify({ someKey1V2: 'someValue1V2', someKey2V2: 'someValue2V2' });

    await logicInstance.set(id, ...jsonToEth(jsonDataV2), { from: accounts[0] });
    let returnedData = await logicInstance.get.call(id);
    const jsonDataCheckV2WithVersion = JSON.stringify(Object.assign(JSON.parse(jsonDataV2), { _version: '\u0002' }));

    assert.equal(ethToJson(returnedData), jsonDataCheckV2WithVersion, 'Returned js data is not equal to saved one with correct version');
  });

  it('version should be 3 after update via set', async() => {
    const logicInstance = await Logic_EntryVersion.deployed(Storage.address);

    const jsonDataV3 = JSON.stringify({ someKey1V3: 'someValue1V3', someKey2V3: 'someValue2V3' });
    await logicInstance.set(id, ...jsonToEth(jsonDataV3), { from: accounts[0] });

    let returnedData = await logicInstance.get.call(id);
    const jsonDataCheckV3WithVersion = JSON.stringify(Object.assign(JSON.parse(jsonDataV3), { _version: '\u0003' }));

    assert.equal(ethToJson(returnedData), jsonDataCheckV3WithVersion, 'Returned js data is not equal to saved one with correct version');
  });

  it('version should be 4 after update via setByDataKey of existing data key', async () => {
    const logicInstance = await Logic_EntryVersion.deployed(Storage.address);

    const initialEthData = await logicInstance.get.call(id);
    const initialJsonData = ethToJson(initialEthData);
    const initialJsonDataObj = JSON.parse(initialJsonData);

    const key = Object.keys(initialJsonDataObj)[0];
    const newValue = 'someNewKeyValue';
    const updatedJsData = JSON.stringify(Object.assign(
      initialJsonDataObj,
      { [key]: newValue },
      { _version: '\u0004' }
    ));
    const keyHex = Web3.utils.rightPad(Web3.utils.stringToHex(key), 64);

    await logicInstance.setByDataKey(id, keyHex, `0x${Buffer.from(newValue).toString('hex')}`, {from: accounts[0]});
    const returnedData = await logicInstance.get.call(id);

    assert.equal(ethToJson(returnedData), updatedJsData, 'Returned js data is not equal to saved one with correct version');
  });

  it('version should be 5 after set via setByDataKey new data key', async () => {
    const logicInstance = await Logic_EntryVersion.deployed(Storage.address);

    const initialEthData = await logicInstance.get.call(id);
    const initialJsonData = ethToJson(initialEthData);
    const initialJsonDataObj = JSON.parse(initialJsonData);

    const newKey = 'someNewKey';
    const newValue = 'someValueOfNewKey';
    const updatedJsData = JSON.stringify(Object.assign(
      initialJsonDataObj,
      { [newKey]: newValue },
      { _version: '\u0005' }
    ));
    const newKeyHex = Web3.utils.rightPad(Web3.utils.stringToHex(newKey), 64);

    await logicInstance.setByDataKey(id, newKeyHex, `0x${Buffer.from(newValue).toString('hex')}`, {from: accounts[0]});
    const returnedData = await logicInstance.get.call(id);

    assert.equal(ethToJson(returnedData), updatedJsData, 'Returned js data is not equal to saved one with correct version');
  });
});
