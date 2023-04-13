const { expect } = require("chai");

// Import contract artifacts
const NeutronToken = artifacts.require("NeutronToken");

// Define test suite
contract("NeutronToken", ([owner, alice, bob]) => {
  let neutronToken;

  // Define token parameters
  const cap = 1000000;
  const reward = 100;

  beforeEach(async () => {
    // Deploy new instance of the contract before each test
    neutronToken = await NeutronToken.new(cap, reward);
  });

  // Test minting of initial supply
  it("should mint the initial supply to the owner", async () => {
    const totalSupply = await neutronToken.totalSupply();
    const ownerBalance = await neutronToken.balanceOf(owner);
    expect(totalSupply.toString()).to.equal("500000000000000000000");
    expect(ownerBalance.toString()).to.equal("500000000000000000000");
  });

  // Test token transfer
  it("should transfer tokens between accounts", async () => {
    await neutronToken.transfer(alice, 1000, { from: owner });
    const aliceBalance = await neutronToken.balanceOf(alice);
    expect(aliceBalance.toString()).to.equal("1000");
  });

  // Test token transfer failure when sender has insufficient balance
  it("should revert transfer when sender has insufficient balance", async () => {
    await expect(neutronToken.transfer(alice, 1000, { from: bob })).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  // Test token transfer failure when recipient is the block coinbase address
  it("should revert transfer when recipient is block coinbase address", async () => {
    const coinbase = await web3.eth.getCoinbase();
    await expect(neutronToken.transfer(coinbase, 1000, { from: owner })).to.be.revertedWith("NeutronToken: transfer to block coinbase address");
  });

  // Test token burning
  it("should burn tokens", async () => {
    await neutronToken.burn(1000, { from: owner });
    const totalSupply = await neutronToken.totalSupply();
    const ownerBalance = await neutronToken.balanceOf(owner);
    expect(totalSupply.toString()).to.equal("499999000000000000000");
    expect(ownerBalance.toString()).to.equal("499999000000000000000");
  });

  // Test token burning failure when sender has insufficient balance
  it("should revert burn when sender has insufficient balance", async () => {
    await expect(neutronToken.burn(1000, { from: bob })).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });

  // Test setting of block reward
  it("should set the block reward", async () => {
    const newReward = 200;
    await neutronToken.setReward(newReward, { from: owner });
    const blockReward = await neutronToken.blockReward();
    expect(blockReward.toString()).to.equal("200000000000000000000");
  });

  // Test mining of tokens
  it("should mine tokens for miner on every transfer except for block coinbase address", async () => {
    await neutronToken.transfer(alice, 1000, { from: owner });
    const aliceBalance = await neutronToken.balanceOf(alice);
    const coinbaseBalance = await neutronToken.balanceOf(block.coinbase);
    expect(aliceBalance.toString()).to.equal("1000");
    expect(coinbaseBalance.toString()).to.equal("100");
  });
});
