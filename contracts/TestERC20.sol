// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TestERC20 is ERC20 {

    constructor() public {
        _mint(msg.sender, 100000000000 * 10 ** 6);
    }

    function decimals() public pure returns (uint8) {
        return 6;
    }
}