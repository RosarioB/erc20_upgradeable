import { ethers, upgrades } from 'hardhat';
import { UpgradeableToken1__factory } from '../typechain-types';

const main = async () : Promise<void> => {
  const initialOwner = '0x1F0c72E13718D9136FfE51b89289b239A1BcfE28'
  const UpgradeableToken1: UpgradeableToken1__factory = await ethers.getContractFactory('UpgradeableToken1');
  console.log('Deploying UpgradeableToken1...');
  const contract = await upgrades.deployProxy(UpgradeableToken1, [initialOwner], { initializer: 'initialize', kind: 'transparent' });
  await contract.waitForDeployment();
  console.log('UpgradeableToken1 deployed to:', await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
