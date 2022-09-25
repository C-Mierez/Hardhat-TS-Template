// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

/// @title Errors
/// @notice A Custom Error library for global use in the contracts.
library Errors {
    /* --------------------------- Base Global Errors --------------------------- */
    /// @notice Emitted when the submitted address is the zero address
    error ZeroAddress();

    /// @notice Emitted when the submitted value is zero.
    error ZeroValue();

    /// @notice Emitted when the submitted value is zero or less
    /// @dev Technically uint can't be negative, so it wouldn't make
    /// sense for this error to happen when [value] is an uint.
    /// Hence I'm defining it as an int256 instead.
    error ZeroOrNegativeValue(int256 value);

    /// @notice Emitted when the caller is not the expected address
    error UnexpectedCaller(address caller, address expected);

    /// @notice Emitted when the caller does not have the required permissions
    error UnauthorizedCaller(address caller);
}
