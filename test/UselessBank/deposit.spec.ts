import { expect } from "chai";
import { constants } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { getUnnamedAccounts } from "hardhat";
import { Errors } from "../shared/utils/errors";
import { approveERC20, faucetTestERC20 } from "../shared/utils/utils";

export function shouldDeposit() {
  const toDeposit = parseEther("1");

  beforeEach("", async function () {
    const { bank, token } = this.contracts;
    const { alice } = this.namedSigners;

    await faucetTestERC20(token, [alice]);
    await approveERC20(token, [alice], bank.address);
  });

  it("should deposit successfully", async function () {
    const { bank, token } = this.contracts;
    const { alice } = this.namedSigners;
    const aliceBalance = await token.balanceOf(alice.address);

    await bank.connect(alice).deposit(token.address, toDeposit);

    expect(await bank.getBalanceOf(token.address, alice.address)).to.equal(
      toDeposit
    );

    expect(await token.balanceOf(alice.address)).to.equal(
      aliceBalance.sub(toDeposit)
    );

    expect(await token.balanceOf(bank.address)).to.equal(toDeposit);
  });

  it("should emit a Deposited event", async function () {
    const { bank, token } = this.contracts;
    const { alice } = this.namedSigners;

    const tx = bank.connect(alice).deposit(token.address, toDeposit);

    await expect(tx)
      .to.emit(
        bank,
        bank.interface.events["Deposited(address,address,uint256)"].name
      )
      .withArgs(alice.address, token.address, toDeposit);
  });

  context("Failure", async function () {
    it("should not allow zero value deposits", async function () {
      const { bank, token } = this.contracts;
      const { alice } = this.namedSigners;

      const tx = bank.connect(alice).deposit(token.address, 0);

      await expect(tx).to.be.revertedWith(Errors.Base.ZeroValue);
    });

    it("should not allow a zero address as token", async function () {
      const { bank, token } = this.contracts;
      const { alice } = this.namedSigners;

      const tx = bank.connect(alice).deposit(constants.AddressZero, toDeposit);

      await expect(tx).to.be.revertedWith(Errors.Base.ZeroAddress);
    });

    it("should not allow depositing an unauthorized token", async function () {
      const { bank, token } = this.contracts;
      const { alice } = this.namedSigners;

      const unauthorizedToken = (await getUnnamedAccounts())[0];

      const tx = bank.connect(alice).deposit(unauthorizedToken, toDeposit);

      expect(!bank.isAuthorized(unauthorizedToken));

      // Should specify custom error here
      await expect(tx).to.be.reverted;
    });
  });
}
