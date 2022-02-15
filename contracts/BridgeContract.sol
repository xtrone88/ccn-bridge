// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import './Upgradeable.sol';

contract BridgeContract is Initializable, OwnableUpgradeable {
    using SafeMath for uint256;

    address operationAccount;
    mapping(address => bool) authorizedAccount;
    mapping(address => uint256) balanceAdjustmentQuota;
    // mapping(address => mapping(address => uint256)) availableBalances;
    // mapping(address => uint256) totalAvailableBalances;

    function initialize(address _operationAccount, address _authorizedAccount) public initializer {
        __Ownable_init();
        operationAccount = _operationAccount;
        authorizedAccount[_authorizedAccount] = true;
        // for (uint256 i = 0; i < _authorizedAccount.length; i++) {
        //     authorizedAccount[_authorizedAccount[i]] = true;
        // }
    }

    modifier authorizedOnly() {
        require(authorizedAccount[msg.sender], "Not authroized account");
        _;
    }

    modifier operationOnly() {
        require(msg.sender == operationAccount, "Not operation account");
        _;
    }

    event Deposit(address erc20, uint256 amount, string target);
    event ResetQuta(address erc20, uint256 remain);
    event Inject(address erc20, uint256 amount);

    function deposit(address erc20, uint256 amount, string memory target) public {
        IERC20(erc20).transferFrom(msg.sender, address(this), amount);
        emit Deposit(erc20, amount, target);
    }

    // function withraw(address erc20, uint256 amount) public {
    //     require(availableBalances[msg.sender][erc20] > amount, "Insufficient available balance");
    //     availableBalances[msg.sender][erc20] = availableBalances[msg.sender][erc20].sub(amount);
    //     totalAvailableBalances[erc20] = totalAvailableBalances[erc20].sub(amount);
    //     IERC20(erc20).transfer(msg.sender, amount);
    // }

    // function withrawAll(address erc20) public onlyOwner {
    //     uint256 realBalance = IERC20(erc20).balanceOf(address(this));
    //     if (realBalance > totalAvailableBalances[erc20]) {
    //         IERC20(erc20).transfer(msg.sender, realBalance.sub(totalAvailableBalances[erc20]));
    //     }
    // }

    // function addAvailableBalance(address erc20, uint256 amount, address target) public operationOnly {
    //     availableBalances[target][erc20] = availableBalances[target][erc20].add(amount);
    //     totalAvailableBalances[erc20] = totalAvailableBalances[erc20].add(amount);
    //     uint256 realBalance = IERC20(erc20).balanceOf(address(this));
    //     if (totalAvailableBalances[erc20] > realBalance) {
    //         emit Inject(erc20, totalAvailableBalances[erc20].sub(realBalance));
    //     }
    // }

    function addAvailableBalanceWithAdjustmentQuota(address erc20, uint256 amount, address target) public operationOnly {
        require(balanceAdjustmentQuota[erc20] > amount, "Insufficient available quata");
        // availableBalances[target][erc20] = availableBalances[target][erc20].add(amount);
        // totalAvailableBalances[erc20] = totalAvailableBalances[erc20].add(amount);
        balanceAdjustmentQuota[erc20] = balanceAdjustmentQuota[erc20].sub(amount);
        if (balanceAdjustmentQuota[erc20] < 1 ether) { // this is sample threshold, it must be picked by exact value
            emit ResetQuta(erc20, balanceAdjustmentQuota[erc20]);
        }
        IERC20(erc20).transfer(target, amount);
        uint256 realBalance = IERC20(erc20).balanceOf(address(this));
        if (realBalance < 1 ether) { // this is sample threshold, it must be picked by exact value
            emit Inject(erc20, realBalance);
        }
    }

    function resetBalanceAdjustmentQuota(address erc20, uint256 amount) public authorizedOnly {
        balanceAdjustmentQuota[erc20] = amount;
    }

    function inject(address erc20, uint256 amount) public authorizedOnly {
        IERC20(erc20).transferFrom(msg.sender, address(this), amount);
    }

    function balanceAdjustmentQuotaOf(address erc20) public view returns (uint256) {
        return balanceAdjustmentQuota[erc20];
    }

    function totalAvailableBalanceOf(address erc20) public view returns (uint256) {
        // return totalAvailableBalances[erc20];
        return IERC20(erc20).balanceOf(address(this));
    }

    function availableBalanceOf(address owner, address erc20) public view returns (uint256) {
        // return availableBalances[owner][erc20];
        return IERC20(erc20).balanceOf(owner);
    }
}