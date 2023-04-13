// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title NeutronToken
 * @dev Implementation of the NeutronToken ERC20 token.
 */
contract NeutronToken is ERC20Capped, ERC20Burnable {
    address payable public owner;
    uint256 public blockReward;

    event RewardSet(uint256 reward);
    event Minted(address indexed miner, uint256 amount);

    /**
     * @dev Constructor that initializes the contract with a capped supply and an initial allocation to the contract owner.
     * @param cap The maximum supply of tokens that can be minted.
     * @param reward The reward amount given to miners when a new block is mined.
     */
    constructor(
        uint256 cap,
        uint256 reward
    ) ERC20("NeutronToken", "NTRO") ERC20Capped(cap * (10 ** decimals())) {
        owner = payable(msg.sender);
        _mint(owner, 500000 * (10 ** decimals()));
        blockReward = reward;
    }

    /**
     * @dev Internal function to mint tokens to a specific account, with a check to ensure the total supply does not exceed the cap.
     * @param account The address of the account to receive the tokens.
     * @param amount The amount of tokens to mint.
     */
    function _mint(
        address account,
        uint256 amount
    ) internal virtual override(ERC20Capped, ERC20) {
        require(
            ERC20.totalSupply() + amount <= cap(),
            "ERC20Capped: cap exceeded"
        );
        super._mint(account, amount);
    }

    /**
     * @dev Modifier to restrict access to functions only to the contract owner.
     */
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "only owner is allowed to call this function"
        );
        _;
    }

    /**
     * @dev Function to set the block reward amount, which can only be called by the contract owner.
     * @param newReward The new reward amount to set.
     */
    function setReward(uint256 newReward) public onlyOwner {
        blockReward = newReward * (10 ** decimals());
        emit RewardSet(newReward);
    }

    /**
     * @dev Internal function to mint tokens to the miner who mined the current block as a reward.
     */
    function _mintMinerReward() internal {
        _mint(block.coinbase, blockReward);
        emit Minted(block.coinbase, blockReward);
    }

    /**
     * @dev Hook function called before a transfer of tokens occurs, which mints tokens as a reward to the miner who mined the block if applicable.
     * @param from The address sending the tokens.
     * @param to The address receiving the tokens.
     * @param value The amount of tokens being transferred.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        if (
            from != address(0) &&
            to != block.coinbase &&
            block.coinbase != address(0)
        ) {
            _mintMinerReward();
        }
        super._beforeTokenTransfer(from, to, value);
    }
}
