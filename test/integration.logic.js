const { jsToEth, ethToJs } = require ('../utils');
const Storage = artifacts.require("Storage");
const Logic = artifacts.require("Logic");

const jsData = {
  someKey1: 'someValue1',
  someKey2: 'someValue2',
};

const ethData = Object.assign({ id: '0x0000000000000000000000000000000000000000000000000000000000000001'}, jsToEth(jsData));

contract('set', accounts => {
  it('set and get the same value', async() => {
    const logicInstance = await Logic.deployed(Storage.address);
    let {id, keys, values, offsets} = ethData;
    let logicAddress = Logic.address;

    await logicInstance.set(id, keys, values, offsets, { from: accounts[0] });
    let exists = await logicInstance.exists.call(id);
    assert(exists, 'The entry was not created');

    const returnedData = await logicInstance.get.call(id);
    const returnedJsData = ethToJs(returnedData.keys, returnedData.values, returnedData.offsets);
    assert.deepEqual(returnedJsData, jsData, 'Returned js data is not equal to saved one');
    assert.equal(returnedData.logic, logicAddress, 'Logic is not equal to Logic contract address');

    const count = await logicInstance.count.call();
    assert.equal(count.toNumber(), 1, 'Count is not 1');
    const ids = await logicInstance.getAllIds();
    assert.deepEqual(ids, [id], 'IDs array should contain entry id and only one id')
  });
});
