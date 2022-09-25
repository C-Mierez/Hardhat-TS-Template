import {
  BigNumber,
  Contract,
  ContractReceipt,
  ContractTransaction,
  logger,
} from "ethers";
import { keccak256, parseEther, toUtf8Bytes } from "ethers/lib/utils";

import { expect } from "chai";
import hre from "hardhat";
import { BigNumberish } from "ethers";
import { Event } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

/* ------------------------------- Test Utils ------------------------------- */

export async function waitForTx(
  tx: Promise<ContractTransaction> | ContractTransaction,
  skipCheck = false
): Promise<ContractReceipt> {
  if (!skipCheck) await expect(tx).to.not.be.reverted;
  return await (await tx).wait();
}

export async function getTimestamp(): Promise<any> {
  const blockNumber = await hre.ethers.provider.send("eth_blockNumber", []);
  const block = await hre.ethers.provider.send("eth_getBlockByNumber", [
    blockNumber,
    false,
  ]);
  return block.timestamp;
}

export async function setNextBlockTimestamp(timestamp: number): Promise<void> {
  await hre.ethers.provider.send("evm_setNextBlockTimestamp", [timestamp]);
}

export async function mine(blocks: number): Promise<void> {
  for (let i = 0; i < blocks; i++) {
    await hre.ethers.provider.send("evm_mine", []);
  }
}

export const getEventFromTx = async (
  tx: ContractTransaction,
  expectedEvent: string
): Promise<Event | undefined> => {
  const r = await tx.wait();
  const event = r.events?.find((e) => e.event === expectedEvent);

  return event;
};

export function matchEvent(
  receipt: ContractReceipt,
  name: string,
  eventContract: Contract,
  expectedArgs?: any[],
  emitterAddress?: string
) {
  const events = receipt.logs;

  if (events != undefined) {
    // match name from list of events in eventContract, when found, compute the sigHash
    let sigHash: string | undefined;
    for (let contractEvent of Object.keys(eventContract.interface.events)) {
      if (
        contractEvent.startsWith(name) &&
        contractEvent.charAt(name.length) == "("
      ) {
        sigHash = keccak256(toUtf8Bytes(contractEvent));
        break;
      }
    }
    // Throw if the sigHash was not found
    if (!sigHash) {
      logger.throwError(
        `Event "${name}" not found in provided contract (default: Events libary). \nAre you sure you're using the right contract?`
      );
    }

    // Find the given event in the emitted logs
    let invalidParamsButExists = false;
    for (let emittedEvent of events) {
      // If we find one with the correct sighash, check if it is the one we're looking for
      if (emittedEvent.topics[0] == sigHash) {
        // If an emitter address is passed, validate that this is indeed the correct emitter, if not, continue
        if (emitterAddress) {
          if (emittedEvent.address != emitterAddress) continue;
        }
        const event = eventContract.interface.parseLog(emittedEvent);
        // If there are expected arguments, validate them, otherwise, return here
        if (expectedArgs) {
          if (expectedArgs.length != event.args.length) {
            logger.throwError(
              `Event "${name}" emitted with correct signature, but expected args are of invalid length`
            );
          }
          invalidParamsButExists = false;
          // Iterate through arguments and check them, if there is a mismatch, continue with the loop
          for (let i = 0; i < expectedArgs.length; i++) {
            // Parse empty arrays as empty bytes
            if (
              expectedArgs[i].constructor == Array &&
              expectedArgs[i].length == 0
            ) {
              expectedArgs[i] = "0x";
            }

            // Break out of the expected args loop if there is a mismatch, this will continue the emitted event loop
            if (BigNumber.isBigNumber(event.args[i])) {
              if (!event.args[i].eq(BigNumber.from(expectedArgs[i]))) {
                invalidParamsButExists = true;
                break;
              }
            } else if (event.args[i].constructor == Array) {
              let params = event.args[i];
              let expected = expectedArgs[i];
              if (expected != "0x" && params.length != expected.length) {
                invalidParamsButExists = true;
                break;
              }
              for (let j = 0; j < params.length; j++) {
                if (BigNumber.isBigNumber(params[j])) {
                  if (!params[j].eq(BigNumber.from(expected[j]))) {
                    invalidParamsButExists = true;
                    break;
                  }
                } else if (params[j] != expected[j]) {
                  invalidParamsButExists = true;
                  break;
                }
              }
              if (invalidParamsButExists) break;
            } else if (event.args[i] != expectedArgs[i]) {
              invalidParamsButExists = true;
              break;
            }
          }
          // Return if the for loop did not cause a break, so a match has been found, otherwise proceed with the event loop
          if (!invalidParamsButExists) {
            return;
          }
        } else {
          return;
        }
      }
    }
    // Throw if the event args were not expected or the event was not found in the logs
    if (invalidParamsButExists) {
      logger.throwError(
        `Event "${name}" found in logs but with unexpected args`
      );
    } else {
      logger.throwError(
        `Event "${name}" not found emitted by "${emitterAddress}" in given transaction log`
      );
    }
  } else {
    logger.throwError("No events were emitted");
  }
}

/* ------------------------------ Test Actions ------------------------------ */

const DEFAULT_FUNDING = parseEther("100");

export const faucetTestERC20 = async (
  erc20: Contract,
  signers: SignerWithAddress[],
  amount: BigNumberish = BigNumber.from(DEFAULT_FUNDING)
) => {
  for (const signer of signers) {
    await erc20.connect(signer).faucet(amount);
  }
};

export const faucetTestERC721 = async (
  erc721: Contract,
  signers: SignerWithAddress[],
  amountToMint?: number
) => {
  amountToMint = amountToMint ? amountToMint : 1;
  const mintedTokens: Map<SignerWithAddress, BigNumber[]> = new Map();

  for (const signer of signers) {
    let tokenIds = [];
    for (let i = 0; i < amountToMint; i++) {
      const receipt = await (await erc721.connect(signer).faucet()).wait();
      for (const event of receipt.events!) {
        if (event.event === "MintedTestToken") {
          tokenIds.push(event.args.tokenId);
        }
      }
    }
    mintedTokens.set(signer, tokenIds);
  }

  return mintedTokens;
};

export const approveERC20 = async (
  erc20: Contract,
  signers: SignerWithAddress[],
  spenderAddress: string,
  amount: BigNumberish = BigNumber.from(DEFAULT_FUNDING)
) => {
  for (const signer of signers) {
    await erc20.connect(signer).approve(spenderAddress, amount);
  }
};
