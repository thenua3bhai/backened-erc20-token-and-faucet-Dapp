const hre = require("hardhat");

async function main() {
  const FaucetNTRO = await hre.ethers.getContractFactory("FaucetNTRO");
  const faucetNTRO = await FaucetNTRO.deploy(25, "0x02D3d30bdEf23F087dE497645176C2C9171951Db");

  //address of erc20

  await faucetNTRO.deployed();
  console.log(` FaucetNTRO Contract successfully deployed to ${faucetNTRO.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
