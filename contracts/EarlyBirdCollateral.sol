// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract EarlyBirdCollateral is Ownable {
    using SafeMath for uint256;
    uint256 public constant INT_UNIT = 10 ** uint256(18);

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
        require(amount >= 150000.mul(INT_UNIT), "Too small");
        require(totalBalance().add(amount) <= 15000000.mul(INT_UNIT), "Can't deposit anymore");
        balances[msg.sender] = balances[msg.sender].add(amount);
        USDT.transferFrom(msg.sender, address(this), amount);
    }

    function refund(address receiver, uint256 price) public onlyOwner {
        require(userRefunded[receiver] == false, "Already refunded");
        require(price <= 3.mul(INT_UNIT), "Incorrect price");
        uint256 amount = balances[receiver].mul(INT_UNIT.sub(price.div(3))).div(INT_UNIT);
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