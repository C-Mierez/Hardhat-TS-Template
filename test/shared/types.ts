import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TestToken, UselessBank } from "../../typechain-types";

declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    namedSigners: Signers;
    unnamedSigners: SignerWithAddress[];
  }
}

export interface Signers {
  // Semantic Users
  deployer: SignerWithAddress;

  // Other Users
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  charlie: SignerWithAddress;
  dave: SignerWithAddress;
}

// Expand this interface with all the contracts needed
export interface Contracts {
  bank: UselessBank;
  token: TestToken;
}
