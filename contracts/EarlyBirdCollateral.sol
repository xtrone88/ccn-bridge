// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract TetherToken is IERC20 {
    function decimals() external returns (uint256);
}

contract EarlyBirdCollateral is Ownable {
    using SafeMath for uint256;

    TetherToken USDT;
    mapping(address => bool) authorizedAccount;
    mapping(address => bool) public userRefunded;
    mapping(address => uint256) public balances;
    mapping(address => uint256) public quota;

    modifier onlyAuthorized() {
        require(authorizedAccount[msg.sender], "Not authroized account");
        _;
    }

    constructor(address _USDT) public {
        USDT = TetherToken(_USDT);
    }

    function setAuthorized(address account, bool result) public onlyOwner
    {
        authorizedAccount[account] = result;
    }

    function totalBalance() public view returns (uint256) {
        return USDT.balanceOf(address(this));
    }

    function setQuota(address depositor, uint256 amount) public onlyAuthorized
    {
        uint256 decimals = 10 ** USDT.decimals();
        require(amount >= uint256(150000).mul(decimals), "The minimum deposit amount is 150000");
        quota[depositor] = amount;
    }

    function deposit(uint256 amount) public {
        uint256 decimals = 10 ** USDT.decimals();
        require(amount > 0, "Deposit amount is zero");
        require(amount == quota[msg.sender], "Deposit amount doesn't match quota");
        require(totalBalance().add(amount) <= uint256(15000000).mul(decimals), "Can't deposit anymore");
        balances[msg.sender] = balances[msg.sender].add(amount);
        quota[msg.sender] = 0;
        USDT.transferFrom(msg.sender, address(this), amount);
    }

    function refund(address receiver, uint256 price) public onlyOwner {
        uint256 decimals = 10 ** USDT.decimals();
        require(userRefunded[receiver] == false, "Already refunded");
        require(price <= uint256(3).mul(decimals), "Incorrect price");
        uint256 amount = balances[receiver].mul(decimals.sub(price.div(3))).div(decimals);
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