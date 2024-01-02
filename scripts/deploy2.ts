import { ethers, upgrades } from 'hardhat';

const main = async () : Promise<void> => {
    const UpgradeableToken2 = await ethers.getContractFactory('UpgradeableToken2');
    console.log('Upgrading contract to UpgradeableToken2...');
    await upgrades.upgradeProxy('0x6D604882F14198f20b6660643b810372f3d9Be2F', UpgradeableToken2, { kind: 'transparent' });
    console.log('UpgradeableToken2 deployed');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});