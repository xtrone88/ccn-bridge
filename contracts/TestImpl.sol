// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

contract TestImpl {

    string public content;

    string public symbol = "TEST_IMPL";

    function setContent(string memory _content) external {
        content = _content;
    }
}