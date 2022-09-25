import { expect } from "chai";
import { constants } from "ethers";
import { ethers } from "hardhat";
import { UselessBank__factory } from "../../typechain-types/factories/contracts/UselessBank__factory";
import { Errors } from "../shared/utils/errors";
import { shouldDeposit } from "./deposit.spec";
import { shouldWithdraw } from "./withdraw.spec";

export function testUselessBank() {
  describe("UselessBank", async () => {
    describe("#constructor", async () => {
      it("should set the correct owner", async function () {
        const { bank } = this.contracts;
        const { deployer } = this.namedSigners;

        expect(await bank.getOwner()).to.equal(deployer.address);
      });
      it("should authorize the submitted token", async function () {
        const { bank, token } = this.contracts;

        expect(await bank.isAuthorized(token.address));
      });
      context("Failure", async function () {
        it("should not allow a zero address token", async function () {
          const address = constants.AddressZero;
          const tx = (
            (await ethers.getContractFactory(
              "UselessBank"
            )) as UselessBank__factory
          ).deploy(address);

          await expect(tx).to.be.revertedWith(Errors.Base.ZeroAddress);
        });
      });
    });

    describe("#deposit", async () => {
      shouldDeposit();
    });

    describe("#withdraw", async () => {
      shouldWithdraw();
    });

    // Remaining tests ...
  });
}
