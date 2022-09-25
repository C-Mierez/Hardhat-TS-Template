// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "../libraries/Errors.sol";

/// @title Base
/// @author @C-Mierez
/// @notice Base contract that defines commonly used modifiers for other contracts
/// to inherit.
abstract contract Base {
    /* -------------------------------- Modifiers ------------------------------- */
    modifier checkNonZeroAddress(address addr) {
        if (addr == address(0)) revert Errors.ZeroAddress();
        _;
    }

    modifier checkNonZeroValue(uint256 value) {
        if (value == 0) revert Errors.ZeroValue();
        _;
    }

    modifier checkExpectedCaller(address caller, address expected) {
        if (caller != expected)
            revert Errors.UnexpectedCaller(caller, expected);
        _;
    }
}
