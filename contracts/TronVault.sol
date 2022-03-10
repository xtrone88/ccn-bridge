// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract TronVault is Ownable {
    using SafeMath for uint256;

    IERC20 USDT;
    mapping(address => bool) public userRefunded;
    mapping(address => uint256) public balances;

    constructor(address _USDT) public {
        USDT = IERC20(_USDT);
    }

    function totalBalance() public view returns (uint256) {
        return USDT.balanceOf(address(this));
    }

    function deposit(uint256 amount) public {
        require(amount >= 150000, "Too small");
        require(totalBalance() + amount <= 15000000, "Can't deposit anymore");
        balances[msg.sender] = balances[msg.sender].add(amount);
        USDT.transferFrom(msg.sender, address(this), amount);
    }

    function refund(address receiver, uint256 price) public onlyOwner {
        require(userRefunded[receiver] == false, "Already refunded");
        require(price <= 3, "Incorrect price");
        uint256 amount = balances[receiver].mul(uint256(10000).sub(price.mul(10000).div(3))).div(10000);
        balances[receiver] = balances[receiver].sub(amount);
        userRefunded[receiver] = true;
        USDT.transfer(receiver, amount);
    }

    function withraw(uint256 amount) public onlyOwner {
        USDT.transfer(owner(), amount);
    }

    function withrawAll() public onlyOwner {
        USDT.transfer(owner(), USDT.balanceOf(address(this)));
    }
}