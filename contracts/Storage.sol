pragma solidity ^0.5.0;

contract Storage {
    struct Entry {
        bytes32[] keys;
        mapping (bytes32 => bytes) data;
        uint size;
        address logic;
        uint index;
    }
    mapping(bytes32 => Entry) entries;
    bytes32[] ids;

    function set(bytes32 id, bytes32[] memory keys, bytes memory values, uint[] memory offsets, address logic) public onlyValid (keys, offsets){
        if(!exists(id)) {
            ids.push(id);
            entries[id].logic = logic;
            entries[id].index = ids.length - 1;
        } else {
            require(isLogic(id, msg.sender), 'The entry does not exist or attempts to modify not from entry logic address!');
            uint index = entries[id].index;
            delete entries[id];
            entries[id].logic = logic;
            entries[id].index = index;
        }
        uint currentOffset;
        //todo consider optimizing this for in terms of gas efficiency
        for (uint i = 0; i < offsets.length; i++) {
            //todo consider checking if current offset is greater than previous offset
            require(currentOffset < values.length, 'Data is invalid!');
            uint valueSize = (i < offsets.length - 1 ? offsets[i+1]: values.length) - currentOffset;
            bytes memory value = new bytes(valueSize);
            for (uint m = 0; m < valueSize; m++) {
                value[m] = values[currentOffset++];
            }
            entries[id].data[keys[i]] = value;
        }
        entries[id].keys = keys;
        entries[id].size = values.length;
    }

    function remove(bytes32 id) public onlyLogic(id){
        // move entry id from the end of the array if entries[id].index is not the last index for the array
        // entries order can change in ids
        if(entries[id].index < ids.length - 1) {
            ids[entries[id].index] = ids[ids.length - 1];
            entries[ids[ids.length - 1]].index = entries[id].index;
        }
        // the array length should not be zero as far as onlyLogic modifier requires exists(id) check
        // so at least one entry should exist and array overflow should be excluded
        ids.length--;
        delete entries[id];
    }
    
    function setByDataKey(bytes32 id, bytes32 key, bytes memory value) public onlyLogic(id){
        Entry storage e = entries[id];
        if (e.data[key].length == 0){
            e.size += value.length;
            e.keys.push(key);
            e.data[key] = value;
        } else {
            e.size -= e.data[key].length;
            e.size += value.length;
            e.data[key] = value;
        }
    }

    function updateLogic(bytes32 id, address newLogic) public onlyLogic(id){
        require(newLogic != address(0), 'Logic contract address can not be zero');
        entries[id].logic = newLogic;
    }

    function get(bytes32 id) public view returns(
            bytes32[] memory keys,
            bytes memory values,
            uint[] memory offsets,
            address logic
    ) {
        keys = entries[id].keys;
        mapping(bytes32 => bytes) storage data = entries[id].data;
        bytes32[] memory mk = new bytes32[](keys.length);
        bytes memory mv = new bytes(entries[id].size);
        uint[] memory mo = new uint[](keys.length);
        uint pointer;
        for (uint i = 0; i < keys.length; i++) {
            mo[i] = pointer;
            mk[i] = keys[i];
            //TODO Consider replacing this cycle with assembly (that may be if ever used in transactions but not simple calls)
            for (uint m = 0; m < data[keys[i]].length; m++) {
                mv[pointer++] = data[keys[i]][m];
            }
        }
        logic = entries[id].logic;
        return (
            mk,
            mv,
            mo,
            logic
        );
    }

    function getByDataKey(bytes32 id, bytes32 key) public view returns(bytes memory value) {
        return entries[id].data[key];
    }

    function getAllIds() public view returns(bytes32[] memory allIds) {
        return ids;
    }

    function getLogic(bytes32 id) public view returns(address logic) {
        return entries[id].logic;
    }

    function count() public view returns(uint entriesCount) {
        return ids.length;
    }

    function exists(bytes32 id) public view returns(bool) {
        return (entries[id].logic != address(0));
    }

    function isLogic(bytes32 id, address verifiedAddress) public view returns(bool) {
        return exists(id) && entries[id].logic == verifiedAddress;
    }

    modifier onlyLogic(bytes32 id) {
        require (isLogic(id, msg.sender), 'The entry does not exist or attempts to modify not from entry logic address!');
        _;
    }

    modifier onlyValid(bytes32[] memory keys, uint[] memory offsets) {
        require (keys.length == offsets.length && keys.length > 0, 'Data is invalid!');
        _;
    }
}