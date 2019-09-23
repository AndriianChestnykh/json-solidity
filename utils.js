const Web3 = require('web3');
const BigNumber = require ('bignumber.js');

const HEX_PREFIX = '0x';

function jsonToEthObject(data) {
    let parsedData;
    try {
        parsedData = parseJSON(data);
    } catch(e) {
        throw new Error('JS data is not valid: ' + e.message);
    }

    return Object.keys(parsedData).reduce((ethData, key) => {
        ethData.keys.push(Web3.utils.rightPad(Web3.utils.stringToHex(key), 64));
        ethData.offsets.push((ethData.values.length - HEX_PREFIX.length) / 2);
        ethData.values += Web3.utils.stringToHex(parsedData[key]).slice(2);
        return ethData;
    }, {
        keys: [],
        values: HEX_PREFIX,
        offsets:[]
    });
}

function jsonToEth(data){
  return Object.values(jsonToEthObject(data));
}

function ethArgsToJson(keys, values, offsets) {
    try {
        validateEth(keys, values, offsets);
    } catch (e) {
        throw new Error('Ethereum data is not valid: ' + e.message);
    }

    const keysCopy = keys.map(key => Web3.utils.hexToString(key));
    const valuesCopy = values.slice(HEX_PREFIX.length);
    const offsetsCopy = offsets.map(offset => offset instanceof BigNumber ? offset.toNumber(): offset);

    const result = keysCopy.reduce((resultJS, key, index) => {
        const startValue = offsetsCopy[index] * 2;
        const endValue = index !== offsetsCopy.length - 1 ? offsetsCopy[index + 1] * 2: values.length -1;
        const value = valuesCopy.slice(startValue, endValue);
        resultJS[key] = Web3.utils.hexToString(HEX_PREFIX + value);
        return resultJS;
    }, {});

    return JSON.stringify(result);
}

function ethToJson({keys, values, offsets}){
    return ethArgsToJson(keys, values, offsets);
}

function parseJSON(data) {
    let parsedData;
    try {
        parsedData = JSON.parse(data);
    } catch (e) {
        throw new Error(`JSON data parse error: ${e.message}`)
    }
    if (!Object.keys(parsedData)
      .every(key => typeof parsedData[key] === 'string'
        && parsedData[key].trim() !== '' && key.length)) throw new Error('JS data key values are not strings or at least one of key values has zero length after trim');
    return parsedData;
}

function validateEth(keys, values, offsets) {
    if (!(keys instanceof Array)) throw new Error('keys is not instanceof Array');
    if (typeof values !== 'string') throw new Error('values is not topeof string');
    if (!(offsets instanceof Array)) throw new Error('offsets is not instanceof Array');
    if (offsets.length !== keys.length) throw new Error('keys and offsets lengths are not equal');
}

module.exports = { jsonToEth, ethToJson, jsonToEthObject, parseJSON, validateEth };