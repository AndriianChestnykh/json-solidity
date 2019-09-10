const crypto = require('crypto');

const Storage = artifacts.require("Storage");
const Logic = artifacts.require("Logic");

const dataObj = {
  id: '0x0000000000000000000000000000000000000000000000000000000000000001',
  keys: ['0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000000000000000000002'],
  values: '0x' + ['0101', '020202'].join(''),
  offsets: [0, 2]
};

const dataObjModified = {
  id: '0x0000000000000000000000000000000000000000000000000000000000000001',
  keys: ['0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000000000000000000002', '0x0000000000000000000000000000000000000000000000000000000000000003'],
  values: '0x' + ['1111', '2222', '33333333'].join(''),
  offsets: [0, 2, 4]
};

const dataObj2 = {
  id: '0x0000000000000000000000000000000000000000000000000000000000000002',
  keys: ['0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000000000000000000002'],
  values: '0x' + ['0101', '020202'].join(''),
  offsets: [0, 2]
};

const dataObj3 = {
  id: '0x0000000000000000000000000000000000000000000000000000000000000003',
  keys: ['0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000000000000000000002'],
  values: '0x' + ['0101', '020202'].join(''),
  offsets: [0, 2]
};

contract('set', accounts => {
  it("set: Should create entry and return the same data after saving and increase count", async () => {
    const storageInstance = await Storage.deployed();
    const logicInstance = await Logic.deployed(storageInstance.address);
    let {id, keys, values, offsets} = dataObj;

    await logicInstance.set(id, keys, values, offsets, { from: accounts[0] });
    let exists = await storageInstance.exists.call(id);
    assert(exists, 'The entry was not created');

    const returnedData = await storageInstance.get.call(id);
    assert.deepEqual(returnedData.keys, keys, "Returned keys is not equal to saved one");
    assert.equal(returnedData.values, values, "Returned values is not equal to saved one");
    assert.deepEqual(
      returnedData.offsets.map(offset => offset.toNumber()),
      offsets,
      'Returned offsets is not equal to saved one'
    );
    assert.equal(returnedData.logic, logicInstance.address, "Logic is not equal to Logic contract address");
    const count = await storageInstance.count.call();
    assert.equal(count.toNumber(), 1, 'Count is not 1');
    const ids = await storageInstance.getAllIds();
    assert.deepEqual(ids, [id], 'IDs array should contain entry id and only one id')
  });

  it("set: Should update an entry as expected", async () => {
    const storageInstance = await Storage.deployed();
    const logicInstance = await Logic.deployed(storageInstance.address);
    const {id, keys, values, offsets} = dataObjModified;

    await logicInstance.set(id, keys, values, offsets, { from: accounts[0] });
    const returnedData = await storageInstance.get.call(id);

    assert.deepEqual(returnedData.keys, keys, "Returned keys is not equal to saved one");
    assert.equal(returnedData.values, values, "Returned values is not equal to saved one");
    assert.deepEqual(
      returnedData.offsets.map(offset => offset.toNumber()),
      offsets,
      'Returned offsets is not equal to saved one'
    );
    assert.equal(returnedData.logic, logicInstance.address, "Returned logic is not equal to Logic contract address");
  });

  it("set: Should throw exception if logic address is not correct", async () => {
    const storageInstance = await Storage.deployed();
    let {id, keys, values, offsets} = dataObj;

    let error;
    await storageInstance.set(id, keys, values, offsets, {from: accounts[1]}).catch(e => error = e);
    assert.isDefined(error, 'No exception if logic address is not correct');
    console.log(error.message);
  });

  //todo add exception check if data is invalid
});

contract('remove', accounts => {
  it('remove: Should remove an entry', async() => {
    const storageInstance = await Storage.deployed();
    const logicInstance = await Logic.deployed(storageInstance.address);
    const { id, keys, values, offsets } = dataObj;
    await logicInstance.set(id, keys, values, offsets, { from: accounts[0] });

    await logicInstance.remove(id, {from: accounts[0]});
    exists = await storageInstance.exists.call(id);
    assert(!exists, 'The entry still exists')
  });

  it('remove: Should throw exception if is called not from logic contract', async() => {
    const storageInstance = await Storage.deployed();
    const logicInstance = await Logic.deployed(storageInstance.address);
    const { id, keys, values, offsets } = dataObj;
    let error;
    await logicInstance.set(id, keys, values, offsets, { from: accounts[0] });

    await storageInstance.remove(id, {from: accounts[1]}).catch(e => error = e);
    assert.isDefined(error, 'No exception is called not from logic contract');
    console.log(error.message);
  });
});

contract('remove (multiply entities)', accounts => {
  it('remove: Should remove one-by-one if three entries exist', async() => {
    const storageInstance = await Storage.deployed();
    const logicInstance = await Logic.deployed(storageInstance.address);

    const { id, keys, values, offsets } = dataObj;
    await logicInstance.set(id, keys, values, offsets, { from: accounts[0] });

    const { id: id2, keys: keys2, values: values2, offsets: offsets2 } = dataObj2;
    await logicInstance.set(id2, keys2, values2, offsets2, { from: accounts[0] });

    const { id: id3, keys: keys3, values: values3, offsets: offsets3 } = dataObj3;
    await logicInstance.set(id3, keys3, values3, offsets3, { from: accounts[0] });

    await logicInstance.remove(id, {from: accounts[0]});
    let exists = await storageInstance.exists.call(id);
    assert(!exists, 'The entry 1 still exists');
    let count = await logicInstance.count.call();
    assert(count.toNumber() === 2, 'Count is not 2');

    await logicInstance.remove(id2, {from: accounts[0]});
    exists = await storageInstance.exists.call(id2);
    assert(!exists, 'The entry 2 still exists');
    count = await logicInstance.count.call();
    assert(count.toNumber() === 1, 'Count is not 1');

    await logicInstance.remove(id3, {from: accounts[0]});
    exists = await storageInstance.exists.call(id3);
    assert(!exists, 'The entry 3 still exists');
    count = await logicInstance.count.call();
    assert(count.toNumber() === 0, 'Count is not 0');
  })
})

contract("setByDataKey", accounts => {
  it("setByDataKey: Should change data value as expected", async () => {
    let storageInstance = await Storage.deployed();
    let logicInstance = await Logic.deployed(storageInstance.address);
    let {id, keys, values, offsets} = dataObj;
    await logicInstance.set(id, keys, values, offsets, {from: accounts[0]});

    const keyIndex = 0;
    const newValue = '0x9999';
    const newValues = `0x${newValue.slice(2)}020202`;
    await logicInstance.setByDataKey(id, keys[keyIndex], newValue, {from: accounts[0]});

    const returnedData = await storageInstance.get.call(id);
    assert.deepEqual(returnedData.keys, keys, "Returned keys is not equal to saved");
    assert.equal(returnedData.values, newValues, "Returned values is not equal to saved one");
    assert.deepEqual(
      returnedData.offsets.map(offset => offset.toNumber()),
      offsets,
      'Returned offsets is not equal to saved one'
    );
  });

  it("setByDataKey: Should throw exception if is called not from logic contract", async () => {
    const storageInstance = await Storage.deployed();
    const { id } = dataObj;
    const newKey = dataObj.keys[0];
    const newValue = '0x03030303';
    let error;
    await storageInstance.setByDataKey(id, newKey, newValue,  {from: accounts[0]}).catch(e => error = e);
    assert.isDefined(error, 'No exception when is called not from logic contract');
    console.log(error.message);
  });

  it("setByDataKey: Should throw exception if an entry does not exist", async () => {
    const storageInstance = await Storage.deployed();
    const logicInstance = await Logic.deployed(storageInstance.address);
    const id = `0x${crypto.randomBytes(32).toString('hex')}`;
    const key = `0x${crypto.randomBytes(32).toString('hex')}`;
    let error;

    await logicInstance.setByDataKey(id, key, '0x00', {from: accounts[0]}).catch(e => error = e);
    assert.isDefined(error, 'No exception if the entry does not exist');
    console.log(error.message);
  });
});

contract('updateLogic', accounts => {
  it('updateLogic: Should update logic address as expected', async () => {
    let storageInstance = await Storage.deployed();
    let logicInstance = await Logic.deployed(storageInstance.address);
    let {id, keys, values, offsets} = dataObj;
    await logicInstance.set(id, keys, values, offsets, {from: accounts[0]});
    const newLogic = accounts[0];
    await logicInstance.updateLogic(id, newLogic, { from: accounts[0] });
    const newLogicCheck = await storageInstance.getLogic.call(id);
    assert.equal(newLogic, newLogicCheck, 'New Logic address has not been set properly')
  });
});