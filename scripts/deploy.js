const hre = require("hardhat");

async function main() {
  const NeutronToken = await hre.ethers.getContractFactory("NeutronToken");
  const neutronToken = await NeutronToken.deploy(100000000, 50);

  await neutronToken.deployed();
  console.log(`Contract successfully deployed to ${neutronToken.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
