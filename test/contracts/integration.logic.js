const { jsonToEth, ethToJson } = require ('../../utils');
const Storage = artifacts.require('Storage');
const Logic = artifacts.require('Logic');
const crypto = require('crypto');

const jsonData = JSON.stringify({
  someKey1: 'someValue1',
  someKey2: 'someValue2',
});

contract('set', accounts => {
  it('set and get the same value', async() => {
    const logicInstance = await Logic.deployed(Storage.address);
    let logicAddress = Logic.address;
    const id = '0x' + crypto.randomBytes(32).toString('hex');

    await logicInstance.set(id, ...jsonToEth(jsonData), { from: accounts[0] });
    let exists = await logicInstance.exists.call(id);
    assert(exists, 'The entry was not created');

    const returnedEthData = await logicInstance.get.call(id);
    assert.deepEqual(ethToJson(returnedEthData), jsonData, 'Returned js data is not equal to saved one');
    assert.equal(returnedEthData.logic, logicAddress, 'Logic is not equal to Logic contract address');

    const count = await logicInstance.count.call();
    assert.equal(count.toNumber(), 1, 'Count is not 1');
    const ids = await logicInstance.getAllIds();
    assert.deepEqual(ids, [id], 'IDs array should contain entry id and only one id')
  });
});
