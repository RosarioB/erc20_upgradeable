import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { UpgradeableToken1, UpgradeableToken1__factory } from "../typechain-types";

describe("Contract version 1", () => {
  let UpgradeableToken1: UpgradeableToken1__factory;
  let token: UpgradeableToken1;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  const DECIMALS: bigint = 10n ** 18n;
  const INITIAL_SUPPLY: bigint = 10_000n;

  beforeEach(async () => {
    UpgradeableToken1 = await ethers.getContractFactory("UpgradeableToken1");
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await upgrades.deployProxy(UpgradeableToken1, [owner.address], { initializer: 'initialize', kind: 'transparent'});
    await token.waitForDeployment();
  });

  describe("Deployment", () => {
    it("Should set the right name", async () => {
      expect(await token.name()).to.equal("UpgradeableToken");
    });

    it("Should set the right symbol", async () => {
      expect(await token.symbol()).to.equal("UTK");
    });

    it("Should set the right owner", async () => {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the initial supply of tokens to the owner", async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY * DECIMALS);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", () => {
    it("Should transfer tokens between accounts", async () => {
      // Transfer 50 tokens from owner to addr1
      await token.transfer(addr1.address, 50);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await token.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async () => {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError;

      // Owner balance shouldn't have changed.
      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async () => {
      const initialOwnerBalance: bigint = await token.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await token.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await token.transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await token.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150n);

      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });

  describe("Minting", () => {
    it("It should mint tokens to the owner's address", async () => {
      await token.mint(owner.address, 10n * DECIMALS);
      const ownerBalance: bigint = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal((INITIAL_SUPPLY +10n) * DECIMALS);
    });
  });

  describe("Burning", () => {
    it("Should burn tokens from the owner's address", async () => {
      await token.burn(10n * DECIMALS);
      const ownerBalance: bigint = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal((INITIAL_SUPPLY -10n) * DECIMALS);
    });
  });

  describe("Pauseable features", () => {
    it("Should pause the contract", async () => {
      await token.pause();
      expect(await token.paused()).to.be.true
      expect( token.transfer(addr1.address, 50)).to.be.revertedWithCustomError;
    });

    it("Should unpause the contract", async () => {
      await token.pause();
      await token.unpause();
      expect(await token.paused()).to.be.false
      expect(await token.transfer(addr1.address, 50)).not.throw;
    });
  });
});