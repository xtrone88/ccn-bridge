// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './TestImpl.sol';

contract TestAdmin {

    string public content;

    TestImpl public t;

    constructor() {
        t = new TestImpl();
    }

    function getSymbol() public view returns (string memory) {
        return t.symbol();
    }

    function setContent(string memory _content) public {
        bytes memory payload = abi.encodeWithSignature("setContent(string)", _content);
        (bool success, ) = address(t).delegatecall(payload);
        require(success);
    }
}