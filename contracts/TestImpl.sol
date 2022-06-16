// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TestImpl {

    string public content;

    string public symbol = "TEST_IMPL";

    function setContent(string memory _content) external {
        content = _content;
    }
}