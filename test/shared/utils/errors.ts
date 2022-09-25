// This is what will hopefully be automated by Typechain if https://github.com/dethcrypto/TypeChain/issues/667 is resolved

enum Base {
  ZeroAddress = "ZeroAddress",
  ZeroValue = "ZeroValue",
  ZeroOrNegativeValue = "ZeroOrNegativeValue",
  UnexpectedCaller = "UnexpectedCaller",
  UnauthorizedCaller = "UnauthorizedCaller",
}

enum Initializable {
  AlreadyInitialized = "Initializable: contract is already initialized",
}

enum ERC20 {
  InsufficientAllowance = "ERC20: insufficient allowance",
  InsufficientBalance = "ERC20: transfer amount exceeds balance",
}

enum Ownable {
  NotOwner = "Ownable: caller is not the owner",
}

export const Errors = {
  Base,
  Initializable,
  ERC20,
  Ownable,
};
