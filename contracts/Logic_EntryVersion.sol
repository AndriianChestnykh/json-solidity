pragma solidity ^0.5.0;

import './Storage.sol';

contract Logic_EntryVersion {
    Storage dataStorage;

    constructor(address storAddr) public {
        dataStorage = Storage(storAddr);
    }

    function set(bytes32 id, bytes32[] memory keys, bytes memory values, uint[] memory offsets) public {
        uint version;
        if (dataStorage.exists(id)) {
            version = bytesToUint(dataStorage.getByDataKey(id, bytes32('_version')));
            version++;
        } else {
            version = 1;
        }
        dataStorage.set(id, keys, values, offsets, address(this));
        dataStorage.setByDataKey(id, bytes32('_version'), uintToBytes(version));
    }

    function remove(bytes32 id) public {
        dataStorage.remove(id);
    }

    function setByDataKey(bytes32 id, bytes32 key, bytes memory value) public {
        dataStorage.setByDataKey(id, key, value);
        uint version = bytesToUint(dataStorage.getByDataKey(id, bytes32('_version')));
        version++;
        dataStorage.setByDataKey(id, bytes32('_version'), uintToBytes(version));
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

    function bytesToUint(bytes memory b) internal pure returns (uint256){
        require(b.length <= 32, 'Bytes is longer than 32 and can\'t be converted to uint!' );
        uint l = b.length;
        bytes32 b32;
        assembly {
            b32 := div(mload(add(b, 0x20)), exp(2, mul(sub(32, l), 8)))
        }
        return uint(b32);
    }

    function uintToBytes(uint256 x) internal pure returns (bytes memory b) {
        b = new bytes(32);
        assembly { mstore(add(b, 32), x) }
    }
}
