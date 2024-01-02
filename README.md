# erc20_upgradeable
An example of ERC-20 upgradeable token.

1. Clone the repository
2. In the project root create a file .env and add:
    
    `PRIVATE_KEY="your_private_key"`
    
    `INFURA_SEPOLIA_ENDPOINT="your_infura_sepolia_api_key"`
4.  Install the project dependencies: `npm install` or `yarn install`
5.  Compile the contracts: `npx hardhat compile`
7.  Deploy the UpgradeableToken1 contract: `npx hardhat run scripts/deploy1.ts --network sepolia`
8.  Deploy the UpgradeableToken2 contract: `npx hardhat run scripts/deploy2.ts --network sepolia`
9. To interact with the deployed contract you can either use Remix or the hardhat console  `npx hardhat console --network sepolia`