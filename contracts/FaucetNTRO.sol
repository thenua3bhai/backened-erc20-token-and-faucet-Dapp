//Contract for Faucet of NeutronToken
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title FaucetNTRO
 * @dev A contract that distributes a specified amount of tokens to an address
 * every specified locktime period. The tokens can be requested by anyone except
 * the zero address.
 */
contract FaucetNTRO {
    address payable public owner;

    // Token contract instance
    IERC20 private _token;

    // Maximum amount of tokens allowed to be distributed
    uint public amountAllowed;

    // Mapping of the next allowed access time for each address
    mapping(address => uint) public nextAccessTime;

    // Time period for which each address has to wait before requesting tokens again
    uint public locktime;

    /**
     * @dev Emitted when tokens are requested from the faucet
     * @param requester Address of the requester
     * @param amount Amount of tokens requested
     * @param timestamp Timestamp of the request
     */
    event TokensRequested(
        address indexed requester,
        uint amount,
        uint timestamp
    );

    /**
     * @dev Emitted when tokens are added to the faucet
     * @param amount Amount of tokens added
     */
    event TokensAdded(uint amount);

    /**
     * @dev Emitted when the allowed amount of tokens is changed
     * @param amount New amount of tokens allowed
     */
    event AllowedAmountChanged(uint amount);

    /**
     * @dev Emitted when the locktime period is changed
     * @param locktime New locktime period
     */
    event LocktimeChanged(uint locktime);

    /**
     * @dev Constructor function
     * @param amount Initial amount of tokens to be allowed
     * @param tokenContract Address of the token contract
     */
    constructor(uint amount, address tokenContract) payable {
        owner = payable(msg.sender);

        _token = IERC20(tokenContract);
        amountAllowed = amount * (10 ** 18);

        locktime = 1 days;
    }

    /**
     * @dev Modifier to allow only the contract owner to call a function
     */
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only Owner is allowed to call this function"
        );
        _;
    }

    /**
     * @dev Adds tokens to the faucet contract
     */
    function addTokens() public onlyOwner {
        emit TokensAdded(_token.balanceOf(address(this)));
    }

    /**
     * @dev Changes the maximum amount of tokens allowed
     * @param newValue New value of maximum tokens allowed
     */
    function changeAllowedAmount(uint newValue) public onlyOwner {
        amountAllowed = newValue * (10 ** 18);
        emit AllowedAmountChanged(amountAllowed);
    }

    /**
     * @dev Changes the locktime period
     * @param newLocktime New value of locktime period
     */
    function setLocktime(uint newLocktime) public onlyOwner {
        locktime = newLocktime;
        emit LocktimeChanged(locktime);
    }

    /**

@dev Allows a user to request tokens from the faucet.
@notice Users must not originate from the zero address.
@notice Users must wait for locktime after each request to prevent abuse.
@notice The faucet must have sufficient tokens to fulfill the request.
@notice Emits a TokensRequested event upon success.
*/
    function requestTokens() public {
        require(
            msg.sender != address(0),
            "Req. must not originate from zero acc."
        );
        require(
            nextAccessTime[msg.sender] <= block.timestamp,
            "Your timestamp expired for now"
        );

        require(
            amountAllowed <= _token.balanceOf(address(this)),
            "//Check faucet contract have sufficient tokens"
        );

        _token.transfer(msg.sender, amountAllowed);
        nextAccessTime[msg.sender] = block.timestamp + locktime;
        emit TokensRequested(msg.sender, amountAllowed);
    }

    /**
     * @dev Returns the balance of the faucet contract.
     * @return The balance of the faucet contract.
     */
    function getBalance() public view returns (uint) {
        return _token.balanceOf(address(this));
    }

    /**
     * @dev Transfers all the tokens from the faucet contract to the contract owner's account.
     * @dev Only the contract owner is allowed to call this function.
     * @dev Emits a {TokensWithdrawn} event indicating the amount of tokens withdrawn and the address of the recipient.
     * @dev Emits a {FundsWithdrawn} event indicating the total amount of tokens withdrawn from the contract.
     * @dev Throws an error if the transfer fails.
     */
    function withdrawAllTokens() public onlyOwner {
        uint balance = _token.balanceOf(address(this));
        require(balance > 0, "Faucet is empty");
        require(_token.transfer(msg.sender, balance), "Transfer failed");

        emit TokensWithdrawn(msg.sender, balance);
        emit FundsWithdrawn(balance);
    }
}
