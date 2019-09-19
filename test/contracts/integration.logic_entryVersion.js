const { jsToEth, ethToJs } = require ('../../utils');
const Web3 = require('web3');
const Storage = artifacts.require("Storage");
const Logic_EntryVersion = artifacts.require("Logic_EntryVersion");

const jsData = {
  someKey1: 'someValue1',
  someKey2: 'someValue2',
};

const jsDataV2 = {
  someKey1V2: 'someValue1V2',
  someKey2V2: 'someValue2V2',
};

const jsDataV3 = {
  someKey1V3: 'someValue1V3',
  someKey2V3: 'someValue2V3',
};

const jsDataCheck = Object.assign({}, jsData, { _version: '\u0001' });
const jsDataCheckV2 = Object.assign({}, jsDataV2, { _version: '\u0002' });
const jsDataCheckV3 = Object.assign({}, jsDataV3, { _version: '\u0003' });

const ethData = Object.assign({ id: '0x0000000000000000000000000000000000000000000000000000000000000001'}, jsToEth(jsData));
const ethDataV2 = Object.assign({ id: '0x0000000000000000000000000000000000000000000000000000000000000001'}, jsToEth(jsDataV2));
const ethDataV3 = Object.assign({ id: '0x0000000000000000000000000000000000000000000000000000000000000001'}, jsToEth(jsDataV3));

contract('set', accounts => {
  it('set and get the same value plus version', async() => {
    const logicInstance = await Logic_EntryVersion.deployed(Storage.address);
    const  {id, keys, values, offsets} = ethData;
    let logicAddress = Logic_EntryVersion.address;

    await logicInstance.set(id, keys, values, offsets, { from: accounts[0] });
    const returnedData = await logicInstance.get.call(id);
    const returnedJsData = ethToJs(returnedData.keys, returnedData.values, returnedData.offsets);

    assert.deepEqual(returnedJsData, jsDataCheck, 'Returned js data is not equal to saved one with correct version');
    assert.equal(returnedData.logic, logicAddress, 'Logic_EntryVersion is not equal to Logic_EntryVersion contract address');
  });

  it('version should be 2 after update via set', async() => {
    const logicInstance = await Logic_EntryVersion.deployed(Storage.address);
    let  {id, keys, values, offsets} = ethDataV2;

    await logicInstance.set(id, keys, values, offsets, { from: accounts[0] });
    let returnedData = await logicInstance.get.call(id);
    let returnedJsData = ethToJs(returnedData.keys, returnedData.values, returnedData.offsets);

    assert.deepEqual(returnedJsData, jsDataCheckV2, 'Returned js data is not equal to saved one with correct version');
  })

  it('version should be 3 after update via set', async() => {
    const logicInstance = await Logic_EntryVersion.deployed(Storage.address);
    let  {id, keys, values, offsets} = ethDataV3;

    await logicInstance.set(id, keys, values, offsets, { from: accounts[0] });
    let returnedData = await logicInstance.get.call(id);
    let returnedJsData = ethToJs(returnedData.keys, returnedData.values, returnedData.offsets);

    assert.deepEqual(returnedJsData, jsDataCheckV3, 'Returned js data is not equal to saved one with correct version');
  })

  it("version should be 4 after update via setByDataKey of existing data key", async () => {
    const logicInstance = await Logic_EntryVersion.deployed(Storage.address);

    const id = ethData.id;
    const initialEthData = await logicInstance.get.call(id);
    const initialJSData = ethToJs(initialEthData.keys, initialEthData.values, initialEthData.offsets);

    const key = Object.keys(initialJSData)[0];
    const newValue = 'someNewKeyValue';
    const updatedJsData = Object.assign(
      {},
      initialJSData,
      { [key]: newValue },
      { _version: '\u0004' }
    );
    const keyHex = Web3.utils.rightPad(Web3.utils.stringToHex(key), 64)

    await logicInstance.setByDataKey(id, keyHex, `0x${Buffer.from(newValue).toString('hex')}`, {from: accounts[0]});
    const returnedData = await logicInstance.get.call(id);
    const returnedJsData = ethToJs(returnedData.keys, returnedData.values, returnedData.offsets);

    assert.deepEqual(returnedJsData, updatedJsData, 'Returned js data is not equal to saved one with correct version');
  });

  it("version should be 5 after set via setByDataKey new data key", async () => {
    const logicInstance = await Logic_EntryVersion.deployed(Storage.address);

    const id = ethData.id;
    const initialEthData = await logicInstance.get.call(id);
    const initialJSData = ethToJs(initialEthData.keys, initialEthData.values, initialEthData.offsets);

    const newKey = 'someNewKey';
    const newValue = 'someValueOfNewKey';
    const updatedJsData = Object.assign(
      {},
      initialJSData,
      { [newKey]: newValue },
      { _version: '\u0005' }
    );
    const newKeyHex = Web3.utils.rightPad(Web3.utils.stringToHex(newKey), 64)

    await logicInstance.setByDataKey(id, newKeyHex, `0x${Buffer.from(newValue).toString('hex')}`, {from: accounts[0]});
    const returnedData = await logicInstance.get.call(id);
    const returnedJsData = ethToJs(returnedData.keys, returnedData.values, returnedData.offsets);

    assert.deepEqual(returnedJsData, updatedJsData, 'Returned js data is not equal to saved one with correct version');
  });
});
