const crypto = require('crypto');
const { jsonToEth, ethToJson } = require ('../../utils');
const Storage = artifacts.require('Storage');

const jsonData = JSON.stringify({
  someKey1: 'someValue1',
  someKey2: 'someValue2',
});

const jsonData2 = JSON.stringify({
  someOtherKey1: 'someOtherValue1',
  someOtherKey2: 'someOtherValue2',
  someKey3: 'someValue2',
});

const id = '0x' + crypto.randomBytes(32).toString('hex');

contract('set', accounts => {
  it('set: Should create entry and return the same data after saving and increase count', async () => {
    const storageInstance = await Storage.deployed();
    let logicAddress = accounts[0];

    console.log(...Object.values(jsonToEth(jsonData)));
    await storageInstance.set(id, ...Object.values(jsonToEth(jsonData)), logicAddress, { from: accounts[0] });
    let exists = await storageInstance.exists.call(id);
    assert(exists, 'The entry was not created');

    const returnedData = await storageInstance.get.call(id);
    assert.equal(ethToJson(returnedData), jsonData, 'Returned JSON data is not equal to saved one');
    assert.equal(returnedData.logic, logicAddress, 'Logic is not equal to Logic contract address');
    const count = await storageInstance.count.call();
    assert.equal(count.toNumber(), 1, 'Count is not 1');
    const ids = await storageInstance.getAllIds();
    assert.deepEqual(ids, [id], 'IDs array should contain entry id and only one id')
  });

  it('set: Should update an entry as expected', async () => {
    const storageInstance = await Storage.deployed();
    const logicAddress = accounts[0];

    await storageInstance.set(id, ...jsonToEth(jsonData2), logicAddress, { from: accounts[0] });
    const returnedData = await storageInstance.get.call(id);

    assert.equal(ethToJson(returnedData), jsonData2, 'Returned JSON data is not equal to saved one');
    assert.equal(returnedData.logic, logicAddress, 'Returned logic is not equal to Logic address');
  });

  it('set: Should throw exception if logic address is not correct', async () => {
    const storageInstance = await Storage.deployed();
    const logicAddress = accounts[0];

    let error;
    await storageInstance.set(id, ...jsonToEth(jsonData), logicAddress, {from: accounts[1]}).catch(e => error = e);
    assert.isDefined(error, 'No exception if logic address is not correct');
    console.log(error.message);
  });

  //todo add exception check if data is invalid
});

contract('remove', accounts => {
  it('remove: Should remove an entry', async() => {
    const storageInstance = await Storage.deployed();
    const logicAddress = accounts[0];

    await storageInstance.set(id, ...jsonToEth(jsonData), logicAddress, { from: accounts[0] });
    await storageInstance.remove(id, {from: accounts[0]});
    exists = await storageInstance.exists.call(id);
    assert(!exists, 'The entry still exists')
  });

  it('remove: Should throw exception if is called not from logic address', async() => {
    const storageInstance = await Storage.deployed();
    const logicAddress = accounts[0];
    await storageInstance.set(id, ...jsonToEth(jsonData), logicAddress, { from: accounts[0] });

    let error;
    await storageInstance.remove(id, {from: accounts[1]}).catch(e => error = e);
    assert.isDefined(error, 'No exception is called not from logic contract');
    console.log(error.message);
  });
});

contract('remove (multiply entities)', accounts => {
  const id2 = '0x' + crypto.randomBytes(32).toString('hex');
  const id3 = '0x' + crypto.randomBytes(32).toString('hex');

  it('remove: Should remove one-by-one if three entries exist', async() => {
    const storageInstance = await Storage.deployed();
    const logicAddress = accounts[0];

    await storageInstance.set(id, ...jsonToEth(jsonData), logicAddress, { from: accounts[0] });
    await storageInstance.set(id2, ...jsonToEth(jsonData), logicAddress, { from: accounts[0] });
    await storageInstance.set(id3, ...jsonToEth(jsonData), logicAddress, { from: accounts[0] });

    await storageInstance.remove(id, {from: accounts[0]});
    let exists = await storageInstance.exists.call(id);
    assert(!exists, 'The entry 1 still exists');
    let count = await storageInstance.count.call();
    assert(count.toNumber() === 2, 'Count is not 2');

    await storageInstance.remove(id2, {from: accounts[0]});
    exists = await storageInstance.exists.call(id2);
    assert(!exists, 'The entry 2 still exists');
    count = await storageInstance.count.call();
    assert(count.toNumber() === 1, 'Count is not 1');

    await storageInstance.remove(id3, {from: accounts[0]});
    exists = await storageInstance.exists.call(id3);
    assert(!exists, 'The entry 3 still exists');
    count = await storageInstance.count.call();
    assert(count.toNumber() === 0, 'Count is not 0');
  });
});

contract('setByDataKey', accounts => {

  it('setByDataKey: Should change data value as expected', async () => {
    let storageInstance = await Storage.deployed();
    const logicAddress = accounts[0];
    
    await storageInstance.set(id, ...jsonToEth(jsonData), logicAddress, {from: accounts[0]});

    const parsedJsonData = JSON.parse(jsonData);
    const keyIndex = 0;
    const newValue = 'someNewKeyValue';
    const updatedJsonData = JSON.stringify(Object.assign(
      {},
      parsedJsonData,
      { [Object.keys(parsedJsonData)[keyIndex]]: newValue }
    ));

    await storageInstance.setByDataKey(id, jsonToEth(jsonData)[0][keyIndex], `0x${Buffer.from(newValue).toString('hex')}`, {from: accounts[0]});
    const returnedData = await storageInstance.get.call(id);
    assert.equal(ethToJson(returnedData), updatedJsonData, 'Returned JSON data is not equal to saved one');
  });

  it('setByDataKey: Should throw exception if is called not from logic contract', async () => {
    const storageInstance = await Storage.deployed();
    const newKey = jsonToEth(jsonData)[0][0];
    const newValue = '0x03030303';
    let error;

    await storageInstance.setByDataKey(id, newKey, newValue, {from: accounts[1]}).catch(e => error = e);
    assert.isDefined(error, 'No exception when is called not from logic contract');
    console.log(error.message);
  });

  it('setByDataKey: Should throw exception if an entry does not exist', async () => {
    const storageInstance = await Storage.deployed();
    const id = `0x${crypto.randomBytes(32).toString('hex')}`;
    const key = `0x${crypto.randomBytes(32).toString('hex')}`;
    let error;

    await storageInstance.setByDataKey(id, key, '0x00', {from: accounts[0]}).catch(e => error = e);
    assert.isDefined(error, 'No exception if the entry does not exist');
    console.log(error.message);
  });
});

contract('setLogic', accounts => {
  it('setLogic: Should update logic address as expected', async () => {
    let storageInstance = await Storage.deployed();
    const logicAddress = accounts[0];

    await storageInstance.set(id, ...jsonToEth(jsonData), logicAddress, {from: accounts[0]});
    const newLogic = accounts[1];
    await storageInstance.setLogic(id, newLogic, { from: accounts[0] });
    const newLogicCheck = await storageInstance.getLogic.call(id);
    assert.equal(newLogic, newLogicCheck, 'New Logic address has not been set properly')
  });
});