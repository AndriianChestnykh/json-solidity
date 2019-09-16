import Web3 from 'web3';
import BigNumber from 'bignumber.js';

const HEX_PREFIX = '0x';

function jsToEth(data) {
  if (!validateJS(data)) {
    throw new Error('Invalid input data');
  }

  return Object.keys(data).reduce((ethData, key) => {
    ethData.keys.push(Web3.utils.rightPad(Web3.utils.stringToHex(key), 64));
    ethData.offsets.push((ethData.values.length - HEX_PREFIX.length) / 2);
    ethData.values += Web3.utils.stringToHex(data[key]).slice(2);
    return ethData;
  }, {
    keys: [],
    values: HEX_PREFIX,
    offsets:[]
  });
}

function ethToJs(keys, values, offsets) {
  const keysCopy = keys.map(key => Web3.utils.hexToString(key));
  const valuesCopy = values.slice(HEX_PREFIX.length);
  const offsetsCopy = offsets.map(offset => offset instanceof BigNumber ? offset.toNumber(): offset);

  try {
    validateEth(keys, values, offsets);
  } catch (e) {
    throw new Error('Ethereum data is not valid: ', e.message);
  }

  return keysCopy.reduce((resultJS, key, index) => {
    const startValue = offsetsCopy[index] * 2;
    const endValue = index !== offsetsCopy.length - 1 ? offsetsCopy[index + 1] * 2: values.length -1;
    const value = valuesCopy.slice(startValue, endValue);
    resultJS[key] = Web3.utils.hexToString(HEX_PREFIX + value);
    return resultJS;
  }, {});
}

function validateJS(data) {
  return isPureObject(data)
    && Object.keys(data)
      .every(key => typeof data[key] === 'string'
        && data[key].trim() !== '' && key.length);
}

function isPureObject(value) {
  return value !== null && value !== undefined && value.constructor && value.constructor === Object;
}

function validateEth(keys, values, offsets) {
  if (!keys instanceof Array) throw new Error('keys is not instanceof Array');
  if (typeof values !== 'string') throw new Error('values is not topeof string');
  if (!offsets instanceof Array) throw new Error('offsets is not instanceof Array');
  if (offsets.length !== keys.length) throw new Error('keys and offsets lengths are not equal');
}

export { jsToEth, ethToJs };