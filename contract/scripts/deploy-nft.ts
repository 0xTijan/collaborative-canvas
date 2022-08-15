const { ethers, upgrades } = require("hardhat");

async function main() {
  const NFT = await ethers.getContractFactory("CanvasNFT");
  const nft = await upgrades.deployProxy(NFT, {
    kind: "uups"
  });

  await nft.deployed();
  console.log("CanvasNFT deployed to: ", nft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
