pragma solidity ^0.5.0;

import './Storage.sol';

contract Logic {
    Storage dataStorage;

    constructor(address storAddr) public {
        dataStorage = Storage(storAddr);
    }

    function set(bytes32 id, bytes32[] memory keys, bytes memory values, uint[] memory offsets) public {
        dataStorage.set(id, keys, values, offsets, address(this));
    }

    function remove(bytes32 id) public {
        dataStorage.remove(id);
    }

    function setByDataKey(bytes32 id, bytes32 key, bytes memory value) public {
        dataStorage.setByDataKey(id, key, value);
    }

    function setLogic(bytes32 id, address newLogic) public {
        dataStorage.setLogic(id, newLogic);
    }

    function get(bytes32 id) public view returns(
        bytes32[] memory keys,
        bytes memory values,
        uint[] memory offsets,
        address logic
    ) {
        return dataStorage.get(id);
    }

    function getByDataKey(bytes32 id, bytes32 key) public view returns(bytes memory value) {
        return dataStorage.getByDataKey(id, key);
    }

    function getAllIds() public view returns(bytes32[] memory keys) {
        return dataStorage.getAllIds();
    }

    function getLogic(bytes32 id) public view returns(address logic) {
        return dataStorage.getLogic(id);
    }

    function count() public view returns(uint entriesCount) {
        return dataStorage.count();
    }

    function exists(bytes32 id) public view returns(bool) {
        return dataStorage.exists(id);
    }
}
