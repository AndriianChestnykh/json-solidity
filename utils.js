const Web3 = require('web3');
const BigNumber = require ('bignumber.js');

const HEX_PREFIX = '0x';

function jsonToEthObject(data) {
    let parsedData;
    try {
        parsedData = parseJson(data);
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

function ethToObject(data) {
    let keys, values, offsets;
    try {
        ({keys, values, offsets} = parseEth(data));
    } catch (e) {
        throw new Error('Ethereum data is not valid: ' + e.message);
    }

    return keys.reduce((resultJS, key, index) => {
        const startValue = offsets[index] * 2;
        const endValue = index !== offsets.length - 1 ? offsets[index + 1] * 2: values.length;
        const value = values.slice(startValue, endValue);
        resultJS[key] = Web3.utils.hexToString(HEX_PREFIX + value);
        return resultJS;
    }, {});
}

function ethToJson(data){
    return JSON.stringify(ethToObject(data));
}

function parseJson(data) {
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

function parseEth({keys, values, offsets}) {
    if (!(keys instanceof Array)) throw new Error('keys is not instanceof Array');
    if (values !== null && typeof values !== 'string') throw new Error('values is not null and is not topeof string');
    if (typeof values === 'string' && values.indexOf(HEX_PREFIX) === -1) throw new Error('Values is not hex prefixed');
    if (!(offsets instanceof Array)) throw new Error('offsets is not instanceof Array');
    if (offsets.length !== keys.length) throw new Error('keys and offsets lengths are not equal');

    return {
        keys: keys.map(key => Web3.utils.hexToString(key)),
        values: values === null ? '': values.slice(HEX_PREFIX.length),
        offsets: offsets.map(offset => offset instanceof BigNumber ? offset.toNumber(): offset)
    }
}

module.exports = { jsonToEth, jsonToEthObject, ethToJson, ethToObject, parseJson, parseEth };