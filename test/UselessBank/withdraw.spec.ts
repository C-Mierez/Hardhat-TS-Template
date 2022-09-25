import { expect } from "chai";
import { constants } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { getUnnamedAccounts } from "hardhat";
import { Errors } from "../shared/utils/errors";
import { approveERC20, faucetTestERC20 } from "../shared/utils/utils";

export function shouldWithdraw() {
  const toDeposit = parseEther("1");
  let toWithdraw = toDeposit;

  beforeEach("Depositing", async function () {
    const { bank, token } = this.contracts;
    const { alice } = this.namedSigners;

    await faucetTestERC20(token, [alice]);
    await approveERC20(token, [alice], bank.address);
    await bank.connect(alice).deposit(token.address, toDeposit);
  });
  it("should withdraw successfully", async function () {
    const { bank, token } = this.contracts;
    const { alice } = this.namedSigners;
    const aliceBalance = await token.balanceOf(alice.address);

    await bank.connect(alice).withdraw(token.address, toWithdraw);

    expect(await bank.getBalanceOf(token.address, alice.address)).to.equal(0);

    expect(await token.balanceOf(alice.address)).to.equal(
      aliceBalance.add(toDeposit)
    );

    expect(await token.balanceOf(bank.address)).to.equal(0);
  });

  it("should emit a Withdrawn event", async function () {
    const { bank, token } = this.contracts;
    const { alice } = this.namedSigners;

    const tx = bank.connect(alice).withdraw(token.address, toWithdraw);

    await expect(tx)
      .to.emit(
        bank,
        bank.interface.events["Withdrawn(address,address,uint256)"].name
      )
      .withArgs(alice.address, token.address, toWithdraw);
  });

  context("Failure", async function () {
    it("should not allow zero value withdrawals", async function () {
      const { bank, token } = this.contracts;
      const { alice } = this.namedSigners;

      const tx = bank.connect(alice).withdraw(token.address, 0);

      await expect(tx).to.be.revertedWith(Errors.Base.ZeroValue);
    });

    it("should revert if balance is lower than requested withdrawal", async function () {
      const { bank, token } = this.contracts;
      const { alice } = this.namedSigners;
      toWithdraw = toWithdraw.add(1);

      const tx = bank.connect(alice).withdraw(token.address, toWithdraw);

      // Should specify custom error here
      await expect(tx).to.be.reverted;

      expect(await bank.getBalanceOf(token.address, alice.address)).to.be.lt(
        toWithdraw
      );
    });

    it("should not allow a zero address as token", async function () {
      const { bank, token } = this.contracts;
      const { alice } = this.namedSigners;

      const tx = bank
        .connect(alice)
        .withdraw(constants.AddressZero, toWithdraw);

      await expect(tx).to.be.revertedWith(Errors.Base.ZeroAddress);
    });

    it("should not allow withdrawing an unauthorized token", async function () {
      const { bank, token } = this.contracts;
      const { alice } = this.namedSigners;

      const unauthorizedToken = (await getUnnamedAccounts())[0];

      const tx = bank.connect(alice).withdraw(unauthorizedToken, toWithdraw);

      expect(!bank.isAuthorized(unauthorizedToken));

      // Should specify custom error here
      await expect(tx).to.be.reverted;
    });
  });
}
