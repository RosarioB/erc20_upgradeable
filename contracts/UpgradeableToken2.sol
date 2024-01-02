// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BlackList is OwnableUpgradeable {
    mapping (address => bool) internal blackList;

    function isBlackListed(address maker) public view returns (bool) {
        return blackList[maker];
    }
    
    function addBlackList (address evilUser) public onlyOwner {
        blackList[evilUser] = true;
        emit AddedBlackList(evilUser);
    }

    function removeBlackList (address clearedUser) public onlyOwner {
        blackList[clearedUser] = false;
        emit RemovedBlackList(clearedUser);
    }

    event AddedBlackList(address user);

    event RemovedBlackList(address user);
}

contract UpgradeableToken2 is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, ERC20PausableUpgradeable, OwnableUpgradeable, BlackList {
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable)
    {
        require(!isBlackListed(from), "The sender address is blacklisted");
        require(!isBlackListed(to), "The recipient address is blacklisted");
        super._update(from, to, value);
    }
}

