import { ethers, upgrades } from 'hardhat';

const main = async () : Promise<void> => {
    const UpgradeableToken2 = await ethers.getContractFactory('UpgradeableToken2');
    console.log('Upgrading contract to UpgradeableToken2...');
    await upgrades.upgradeProxy('0xD65FAdf246AE4D00062971f84cc84B7f83BbF255', UpgradeableToken2, { kind: 'transparent' });
    console.log('UpgradeableToken2 deployed');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});