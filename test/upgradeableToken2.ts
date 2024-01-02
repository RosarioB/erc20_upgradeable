import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { UpgradeableToken2, UpgradeableToken2__factory } from "../typechain-types";

describe("Contract version 2", () => {
  let UpgradeableToken2: UpgradeableToken2__factory;
  let newToken: UpgradeableToken2;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  const DECIMALS: bigint = 10n ** 18n;
  const INITIAL_SUPPLY: bigint = 10_000n;

  beforeEach(async () => {
    const UpgradeableToken1 = await ethers.getContractFactory("UpgradeableToken1");
    UpgradeableToken2 = await ethers.getContractFactory('UpgradeableToken2');
    [owner, addr1, addr2] = await ethers.getSigners();
    const oldToken = await upgrades.deployProxy(UpgradeableToken1, [owner.address], { initializer: 'initialize', kind: 'transparent' });
    await oldToken.waitForDeployment();
    newToken = await upgrades.upgradeProxy(oldToken, UpgradeableToken2, { kind: 'transparent' });
  });

  describe("Deployment", () => {
    it("Should set the right name", async () => {
      expect(await newToken.name()).to.equal("UpgradeableToken");
    });

    it("Should set the right symbol", async () => {
      expect(await newToken.symbol()).to.equal("UTK");
    });

    it("Should set the right owner", async () => {
      expect(await newToken.owner()).to.equal(owner.address);
    });

    it("Should assign the initial supply of tokens to the owner", async () => {
      const ownerBalance = await newToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY * DECIMALS);
      expect(await newToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", () => {
    it("Should transfer tokens between accounts", async () => {
      // Transfer 50 tokens from owner to addr1
      await newToken.transfer(addr1.address, 50);
      const addr1Balance = await newToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await newToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await newToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async () => {
      const initialOwnerBalance = await newToken.balanceOf(owner.address);
      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      expect(
        newToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError;

      // Owner balance shouldn't have changed.
      expect(await newToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async () => {
      const initialOwnerBalance: bigint = await newToken.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await newToken.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await newToken.transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await newToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150n);

      const addr1Balance = await newToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await newToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });

  describe("Minting", () => {
    it("It should mint tokens to the owner's address", async () => {
      await newToken.mint(owner.address, 10n * DECIMALS);
      const ownerBalance: bigint = await newToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal((INITIAL_SUPPLY +10n) * DECIMALS);
    });
  });

  describe("Burning", () => {
    it("Should burn tokens from the owner's address", async () => {
      await newToken.burn(10n * DECIMALS);
      const ownerBalance: bigint = await newToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal((INITIAL_SUPPLY -10n) * DECIMALS);
    });
  });

  describe("Pauseable features", () => {
    it("Should pause the contract", async () => {
      await newToken.pause();
      expect(await newToken.paused()).to.be.true
      expect(newToken.transfer(addr1.address, 50)).to.be.revertedWithCustomError;
    });

    it("Should unpause the contract", async () => {
      await newToken.pause();
      await newToken.unpause();
      expect(await newToken.paused()).to.be.false
      await newToken.transfer(addr1.address, 50);
      const addr1Balance = await newToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
    });
  });

  describe("Blacklist features", () => {
    it("Should add the address to the blacklist", async () => {
        expect(await newToken.isBlackListed(addr1)).to.be.false;
        await newToken.addBlackList(addr1);
        expect(await newToken.isBlackListed(addr1)).to.be.true;
    });

    it("Should remove the address from the blacklist", async () => {    
        await newToken.addBlackList(addr1);
        await(newToken.removeBlackList(addr1));
        expect(await newToken.isBlackListed(addr1)).to.be.false;
    });

    it("Should prevent blacklisted address to transfer funds", async () => {
        await newToken.transfer(addr1.address, 10n * DECIMALS);    
        await newToken.addBlackList(addr1);
        expect(newToken.connect(addr1).transfer(addr2.address, 50))
        .to.be.revertedWith('The sender address is blacklisted');
    });

    it("Should allow unblacklisted address to transfer funds", async () => {
        await newToken.transfer(addr1.address, 10n * DECIMALS);    
        await newToken.addBlackList(addr1);
        await newToken.removeBlackList(addr1);
        await newToken.connect(addr1).transfer(addr2.address, 50);
        const addr2Balance = await newToken.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
    });
  });
});