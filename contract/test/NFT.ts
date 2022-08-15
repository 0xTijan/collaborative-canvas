import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("CanvasNFT", function () {
  async function deployUpgradeableProxy() {
    const CanvasNFT = await ethers.getContractFactory("CanvasNFT");
    const nft = await upgrades.deployProxy(CanvasNFT, {
      kind: "uups"
    });

    const [acc0, acc1, acc2, acc3, acc4, acc5] = await ethers.getSigners();
    const address = nft.address;
    return { CanvasNFT, nft, address, acc0, acc1, acc2, acc3, acc4, acc5 }
  }

  describe("Deployment", function () {
    it("Deploy correctly", async function () {
      const { nft } = await loadFixture(deployUpgradeableProxy);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT", async function () {
      const { nft, acc0 } = await loadFixture(deployUpgradeableProxy);
      await nft.mint("uri");
      let nftBalance = await nft.balanceOf(acc0.address)
      expect(nftBalance).to.equal(1);
      let tokenUri = await nft.tokenURI(1);
      console.log(tokenUri);
      expect(tokenUri).to.equal("uri")
    });
  });
});
