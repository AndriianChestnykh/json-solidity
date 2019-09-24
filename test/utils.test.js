const { jsonToEth, ethToJson } = require('../utils');
const assert = require('assert');

describe('Data conversion', () => {
  it('Should convert to eth data and back with js data with no data corruption', () => {
    const jsonData = JSON.stringify({
      someKey1: '111',
      someKey2: '2222',
      someKey3: '33'
    });

    const ethData = jsonToEth(jsonData);
    const ethDataBack = {keys: ethData[0], values: ethData[1], offsets: ethData[2]};
    const jsonDataBack = ethToJson(ethDataBack);
    assert.equal(jsonDataBack, jsonData);
  });

  it('Should throw if JS data is not valid', () => {
    const jsData = JSON.stringify({key: '', key2: 'someValue'});
    assert.throws(() => jsonToEth(jsData), /Error: JS data is not valid: JS data key values are not strings or at least one of key values has zero length/);
  });

  it('Should throw if ETH data is not valid', () => {
    const keys = ['0x01', '0x02'];
    const values = '0x0102';
    const offsets = [0, 1];

    const wrongKeysNotArray = 'wrong keys';
    const wrongValuesZero = 0;
    const wrongValuesEmptyString = '';
    const wrongValuesNotHexPrefixed = '1212';
    const wrongOffsetsNotArray = 'wrong offsets';
    const wrongOffsetsBadLength = [0];

    assert.throws(() => ethToJson({ keys: wrongKeysNotArray, values, offsets}), /Error: Ethereum data is not valid: keys is not instanceof Array/);
    assert.throws(() => ethToJson({ keys, values: wrongValuesZero, offsets }), /Error: Ethereum data is not valid: values is not null and is not topeof string/);
    assert.throws(() => ethToJson({ keys, values: wrongValuesEmptyString, offsets }), /Error: Ethereum data is not valid: Values is not hex prefixed/);
    assert.throws(() => ethToJson({ keys, values: wrongValuesNotHexPrefixed, offsets }), /Error: Ethereum data is not valid: Values is not hex prefixed/);
    assert.throws(() => ethToJson({ keys, values, offsets: wrongOffsetsNotArray }), /Error: Ethereum data is not valid: offsets is not instanceof Array/);
    assert.throws(() => ethToJson({ keys, values, offsets: wrongOffsetsBadLength }), /Error: Ethereum data is not valid: keys and offsets lengths are not equal/);
  });
});

