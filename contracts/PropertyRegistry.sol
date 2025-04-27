// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PropertyRegistry {
    address public owner;
    string public propertyInfo;

    constructor(string memory _info) {
        owner = msg.sender;
        propertyInfo = _info;
    }

    function updateInfo(string memory _info) public {
        require(msg.sender == owner, "Only owner can update");
        propertyInfo = _info;
    }
}