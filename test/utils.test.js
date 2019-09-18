const { jsToEth, ethToJs } = require('../utils');

const data = {
  someKey1: '111',
  someKey2: '2222',
  someKey3: '33'
};

describe('Data conversion', () => {
  it('convert to composeEth and back with ethToJs should result the same data', () => {
    const ethData = jsToEth(data);
    const { keys, values, offsets } = ethData;
    const jsData = ethToJs(keys, values, offsets);
    expect(jsData).to.deep.equal(data);
  });
});

