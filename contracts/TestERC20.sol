// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TestERC20 is ERC20 {

    constructor() ERC20("test", "ts") {
        _mint(msg.sender, 10000);
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }
}