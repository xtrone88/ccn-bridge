// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import './Upgradeable.sol';

contract BridgeContract is Initializable, OwnableUpgradeable {
    using SafeMath for uint256;

    address operationAccount;
    address wrapAddress; // wrap token address for coin

    mapping(address => bool) authorizedAccount;
    mapping(address => uint256) balanceAdjustmentQuota;
    // mapping(address => mapping(address => uint256)) availableBalances;
    // mapping(address => uint256) totalAvailableBalances;

    function initialize(address _operationAccount, address _wrapAddress, address _authorizedAccount) public initializer {
        __Ownable_init();
        operationAccount = _operationAccount;
        wrapAddress = _wrapAddress;
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

    function depositWithCoin(string memory target) public payable {
        require(msg.value > 0, "No deposit amount");
        emit Deposit(wrapAddress, msg.value, target);
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

    /**
     * @dev This function is called from nodejs wallet when captured event from depositor
     * if erc20 is 0, this is for wrap -> coin
     * else if erc20 is wrapAddress, this is for coin -> wrap
     * else this is for erc20 -> erc20
     */
    function addAvailableBalanceWithAdjustmentQuota(address erc20, uint256 amount, address target) public operationOnly {
        require(balanceAdjustmentQuota[erc20] > amount, "Insufficient available quata");
        // availableBalances[target][erc20] = availableBalances[target][erc20].add(amount);
        // totalAvailableBalances[erc20] = totalAvailableBalances[erc20].add(amount);
        balanceAdjustmentQuota[erc20] = balanceAdjustmentQuota[erc20].sub(amount);
        if (balanceAdjustmentQuota[erc20] < 1 ether) { // this is sample threshold, it must be picked by exact value
            emit ResetQuta(erc20, balanceAdjustmentQuota[erc20]);
        }

        uint256 realBalance = 0;
        if (erc20 == address(0)) { 
            (bool success, ) = target.call.value(amount)("");
            require(success, "Failed to transfer value");
            realBalance = address(this).balance;
        } else {
            IERC20(erc20).transfer(target, amount);
            realBalance = IERC20(erc20).balanceOf(address(this));
        }
        if (realBalance < 1 ether) { // this is sample threshold, it must be picked by exact value
            emit Inject(erc20, realBalance);
        }
    }

    /**
     * @dev This function is called when you want to reset quota of token for nodejs wallet
     * if erc20 is 0, it means coin
     */
    function resetBalanceAdjustmentQuota(address erc20, uint256 amount) public authorizedOnly {
        balanceAdjustmentQuota[erc20] = amount;
    }

    /**
     * @dev This function is called when you want to inject certain amount of token for bridging
     * if erc20 is 0, it means coin
     */
    function inject(address erc20, uint256 amount) public payable authorizedOnly {
        if (erc20 == address(0)) {
            require(msg.value == amount, "Invalid parameter");
        } else {
            IERC20(erc20).transferFrom(msg.sender, address(this), amount);
        }
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