// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
import { UniqueFungible, CrossAddress } from "@unique-nft/solidity-interfaces/contracts/UniqueFungible.sol";

/// @title Unique Airdrop Contract
/// @notice This contract allows the distribution of tokens (UNQ) to registered Ethereum and Substrate addresses.
/// @dev Utilizes interfaces from the @unique-nft package to manage cross-address functionality.
contract Airdrop {
    /// @dev Reference to the native ERC20-representation of UNQ token on the Unique chain.
    UniqueFungible private nativeErc20 = UniqueFungible(0x17C4e6453cC49aaAAEaCA894E6d9683e00000000);

    /// @dev Represents this contract's address as a `CrossAddress` type.
    CrossAddress private thisAsCross = CrossAddress(address(this), 0);

    /// @dev Address of the contract owner.
    address private owner;

    /// @notice Amount of UNQ tokens to be airdropped to each registered address.
    uint256 public dropAmount;

    /// @notice Maps Substrate account public keys to their eligibility status for the airdrop.
    mapping (uint256 => bool) public allowedSub;
    /// @notice Maps Substrate account public keys to their airdrop reception status.
    mapping (uint256 => bool) public receivedSub;

    /// @notice Maps Ethereum addresses to their eligibility status for the airdrop.
    mapping (address => bool) public allowedEth;
    /// @notice Maps Ethereum addresses to their airdrop reception status.
    mapping (address => bool) public receivedEth;

    event ApprovedEth(address approved);
    event ApprovedSub(uint256 approved);
    
    event AirdroppedEth(address to);
    event AirdroppedSub(uint256 to);

    modifier onlyOwner() {
        require(msg.sender == owner, "only the contract creator can perform this action");
        _ ;
    }

    /// @notice Initializes the contract with an initial airdrop amount.
    /// @param _dropAmount The amount of UNQ tokens each eligible address will receive.
    constructor(uint256 _dropAmount) payable {
        owner = msg.sender;
        dropAmount = _dropAmount;
    }

    receive() external payable {}

    /// @notice Changes the airdrop amount.
    /// @param _newAmount The new amount of UNQ tokens to be distributed per claim.
    /// @return success Boolean value indicating the success of the operation.
    function changeDropAmount(uint256 _newAmount) onlyOwner external returns(bool) {
        dropAmount = _newAmount;
        return true;
    }

    /// @notice Withdraws all UNQ from the contract to a specified address.
    /// @param transferTo The address to which the UNQ will be transferred.
    /// @return success Boolean value indicating whether the transfer was successful.
    function withdraw(address transferTo) onlyOwner external returns(bool)  {
        (bool success, ) = transferTo.call{value: address(this).balance}("");
        return success;
    }

    /// @notice Registers a list of Ethereum addresses as eligible for the airdrop.
    /// @param _accounts An array of Ethereum addresses to approve.
    function registerAllowedEth(address[] memory _accounts) external onlyOwner {
        _registerAllowedEth(_accounts);
    }

    /// @notice Registers a list of Substrate account identifiers as eligible for the airdrop.
    /// @param _accounts An array of Substrate account identifiers to approve.
    function registerAllowedSub(uint256[] memory _accounts) external onlyOwner {
        _registerAllowedSub(_accounts);
    }

    /// @notice Allows registered Ethereum addresses to claim their airdrop.
    /// @param _claimers An array of Ethereum addresses attempting to claim the airdrop.
    /// @dev Emits `AirdroppedEth` upon successful airdrop claim.
    /// @return success Boolean indicating if the airdrop was successful for all addresses.
    function claimEth(address[] memory _claimers) external returns(bool) {
        _dropEth(_claimers);
        return true;
    }

    /// @notice Allows registered Substrate accounts to claim their airdrop.
    /// @param _claimers An array of Substrate account identifiers attempting to claim the airdrop.
    /// @dev Emits `AirdroppedSub` upon successful airdrop claim.
    /// @return success Boolean indicating if the airdrop was successful for all accounts.
    function claimSub(uint256[] memory _claimers) external returns(bool) {
        _dropSub(_claimers);
        return true;
    }

    function forceDropEth(address[] memory _accounts) external onlyOwner returns(bool) {
        _registerAllowedEth(_accounts);
        _dropEth(_accounts);
        return true;
    }

    function forceDropSub(uint256[] memory _accounts) external onlyOwner returns(bool) {
        _registerAllowedSub(_accounts);
        _dropSub(_accounts);
        return true;
    }

    /// @dev Internal function to handle the logic of airdropping tokens.
    /// @param _claimer The cross-address entity either as an Ethereum address or a Substrate account ID.
    /// @param isEth Indicates if the claim is for an Ethereum address (true) or Substrate account (false).
    /// @notice This function checks eligibility and updates the reception status to prevent double claims.
    function _claim(CrossAddress memory _claimer, bool isEth) private {
        if (isEth) {
            require(allowedEth[_claimer.eth], "only approved addresses can receive");
            require(receivedEth[_claimer.eth] == false, "user already received airdrop");
            receivedEth[_claimer.eth] = true;
        } else {
            require(allowedSub[_claimer.sub], "only approved addresses can receive");
            require(receivedSub[_claimer.sub] == false, "user already received airdrop");
            receivedSub[_claimer.sub] = true;
        }

        (bool success) = nativeErc20.transferFromCross(thisAsCross, _claimer, dropAmount);
        require(success, "failed to send UNQ");
    }

    function _registerAllowedSub(uint256[] memory _accounts) private {
        for(uint i = 0; i < _accounts.length;) {
            allowedSub[_accounts[i]] = true;
            emit ApprovedSub(_accounts[i]);
            unchecked {
                i++;
            }
        }
    }

    function _registerAllowedEth(address[] memory _accounts) private {
        for(uint i = 0; i < _accounts.length;) {
            allowedEth[_accounts[i]] = true;
            emit ApprovedEth(_accounts[i]);
            unchecked {
                i++;
            }
        }
    }

    function _dropEth(address[] memory _accounts) private {
        for(uint i = 0; i < _accounts.length;) {
            CrossAddress memory claimer = CrossAddress(_accounts[i], 0);
            _claim(claimer, true);
            emit AirdroppedEth(_accounts[i]);

            unchecked {
                i++;
            }
        }
    }

    function _dropSub(uint256[] memory _accounts) private {
        for(uint i = 0; i < _accounts.length;) {
            CrossAddress memory claimer = CrossAddress(address(0), _accounts[i]);
            _claim(claimer, false);
            emit AirdroppedSub(_accounts[i]);

            unchecked {
                i++;
            }
        }
    }
}
