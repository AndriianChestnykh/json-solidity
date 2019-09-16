const { jsToEth, ethToJs } = require('../utils');

const data = {
  someKey1: '111',
  someKey2: '2222',
  someKey3: '33'
};

describe('test', () => {
  it('convert to composeEth and back with ethToJs should result the same data', () => {
    const ethData = jsToEth(data);
    console.log('ethData: ', ethData);
    const { keys, values, offsets } = ethData;

    const jsData = ethToJs(keys, values, offsets);
    console.log('jsData: ', jsData);
    expect(jsData).to.deep.equal(data);
  });
});

