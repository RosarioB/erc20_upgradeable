import { ethers, upgrades } from 'hardhat';
import { UpgradeableToken__factory } from '../typechain-types';

const main = async () : Promise<void> => {
  const initialOwner = '0x1F0c72E13718D9136FfE51b89289b239A1BcfE28'
  const UpgradeableToken: UpgradeableToken__factory = await ethers.getContractFactory('UpgradeableToken');
  console.log('Deploying UpgradeableToken...');
  const contract = await upgrades.deployProxy(UpgradeableToken, [initialOwner], { initializer: 'initialize', kind: 'transparent' });
  await contract.waitForDeployment();
  console.log('UpgradeableToken deployed to:', await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
