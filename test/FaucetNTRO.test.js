//Import the required dependencies
// FaucetNTRO test suite
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FaucetNTRO", function () {
  let owner, user1, user2, faucet, erc20Mock;

  before(async function () {
    //Test cases won't use our deploy scripts here for testing it will deploy itself on hardhat n/w for testing here. But in Patrick course projects we use deploy scripts to deploy for test cases also because we configured deploy scripts there to run when deploying here on hardhat n/w for testing but not here.we did't write erc20 mock na deploying address like we did in staking app..check there deploy scripts of Staking App uou will know the difference
    [owner, user1, user2] = await ethers.getSigners();
    const ERC20Mock = await ethers.getContractFactory("NeutronToken");
    erc20Mock = await ERC20Mock.deploy("10000000", "50");
    const FaucetNTRO = await ethers.getContractFactory("FaucetNTRO");
    faucetNTRO = await FaucetNTRO.deploy(1000, erc20Mock.address);

    faucet = await FaucetNTRO.deploy(1000, erc20Mock.address);
    await faucet.deployed();
    await token.transfer(faucet.address, 1000);
  });

  it("should distribute tokens to a user", async function () {
    await faucet.requestTokens({ from: user1.address });

    const balance = await faucet.token().balanceOf(user1.address);
    expect(balance).to.equal(1000);
  });

  it("should prevent requests from the zero address", async function () {
    await expect(faucet.requestTokens({ from: ethers.constants.AddressZero })).to.be.revertedWith("Req. must not originate from zero acc.");
  });

  it("should prevent requests before the locktime has expired", async function () {
    await faucet.requestTokens({ from: user2.address });
    await expect(faucet.requestTokens({ from: user2.address })).to.be.revertedWith("Your timestamp expired for now");
  });

  it("should prevent requests when the faucet does not have sufficient tokens", async function () {
    await faucet.changeAllowedAmount(100);
    await expect(faucet.requestTokens({ from: user1.address })).to.be.revertedWith("Check faucet contract have sufficient tokens");
  });

  it("should update the next access time after a successful request", async function () {
    await faucet.requestTokens({ from: user1.address });

    const nextAccessTime = await faucet.nextAccessTime(user1.address);
    const currentTime = Math.floor(Date.now() / 1000);
    expect(nextAccessTime.toNumber()).to.be.greaterThan(currentTime);
  });

  it("should prevent non-owners from adding tokens", async function () {
    await expect(faucet.addTokens({ from: user1.address })).to.be.revertedWith("Only Owner is allowed to call this function");
  });

  it("should allow owners to add tokens", async function () {
    await faucet.addTokens();

    const balance = await faucet.token().balanceOf(faucet.address);
    expect(balance).to.be.greaterThan(1000);
  });

  it("should prevent non-owners from changing the allowed amount of tokens", async function () {
    await expect(faucet.changeAllowedAmount(500, { from: user1.address })).to.be.revertedWith("Only Owner is allowed to call this function");
  });

  it("should allow owners to change the allowed amount of tokens", async function () {
    await faucet.changeAllowedAmount(500);

    const amountAllowed = await faucet.amountAllowed();
    expect(amountAllowed).to.equal(500);
  });

  it("should prevent non-owners from changing the locktime period", async function () {
    await expect(faucet.setLocktime(2, { from: user1.address })).to.be.revertedWith("Only Owner is allowed to call this function");
  });

  it("should allow owners to change the locktime period", async function () {
    await faucet.setLocktime(2);

    const locktime = await faucet.locktime();
    expect(locktime).to.equal(2);
  });
  describe("getBalance", function () {
    it("returns the balance of the faucet contract", async function () {
      const balance = await faucet.getBalance();
      expect(balance).to.equal(1000);
    });
  });

  describe("withdrawAllTokens", function () {
    it("reverts if the caller is not the owner", async function () {
      await expect(faucet.connect(user1).withdrawAllTokens()).to.be.revertedWith("Only Owner is allowed to call this function");
    });

    it("reverts if the faucet is empty", async function () {
      const emptyFaucet = await ethers.getContractFactory("FaucetNTRO");
      const emptyFaucetInstance = await emptyFaucet.deploy(1000, token.address);
      await expect(emptyFaucetInstance.withdrawAllTokens()).to.be.revertedWith("Faucet is empty");
    });

    it("transfers all the tokens to the owner", async function () {
      const balance = await faucet.getBalance();
      await faucet.withdrawAllTokens();
      const newBalance = await faucet.getBalance();
      expect(newBalance).to.equal(0);
      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(balance);
    });
  });

  describe("addTokens", function () {
    it("reverts if the caller is not the owner", async function () {
      await expect(faucet.connect(user1).addTokens()).to.be.revertedWith("Only Owner is allowed to call this function");
    });

    it("emits a TokensAdded event", async function () {
      const tx = await faucet.addTokens();
      const receipt = await tx.wait();
      const event = receipt.events.find((e) => e.event === "TokensAdded");
      expect(event).to.exist;
      expect(event.args.amount).to.equal(1000);
    });
  });
});
