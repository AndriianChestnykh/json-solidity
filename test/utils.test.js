const { jsToEth, ethToJs } = require('../utils');
const assert = require('assert');

const data = {
  someKey1: '111',
  someKey2: '2222',
  someKey3: '33'
};

describe('Data conversion', () => {
  it('Should convert to eth data and back with js data with no data corruption', () => {
    const ethData = jsToEth(data);
    const { keys, values, offsets } = ethData;
    const jsData = ethToJs(keys, values, offsets);
    assert.deepEqual(jsData, data);
  });

  it('Should throw if JS data is not valid', () => {
    const jsData = {key: '', key2: 'someValue'};
    assert.throws(() => jsToEth(jsData), /Error: JS data is not valid: JS data key values are not strings or at least one of key values has zero length/);
  });

  it('Should throw if ETH data is not valid', () => {
    const keys = ['0x01', '0x02'];
    const values = '0x0102';
    const offsets = [0, 1];

    const wrongKeysNotArray = 'wrong keys';
    const wrongValuesNotString = 0;
    const wrongOffsetsNotArray = 'wrong offsets';
    const wrongOffsetsBadLength = [0];

    assert.throws(() => ethToJs(wrongKeysNotArray, values, offsets), /Error: Ethereum data is not valid: keys is not instanceof Array/);
    assert.throws(() => ethToJs(keys, wrongValuesNotString, offsets), /Error: Ethereum data is not valid: values is not topeof string/);
    assert.throws(() => ethToJs(keys, values, wrongOffsetsNotArray), /Error: Ethereum data is not valid: offsets is not instanceof Array/);
    assert.throws(() => ethToJs(keys, values, wrongOffsetsBadLength), /Error: Ethereum data is not valid: keys and offsets lengths are not equal/);
  });
});

