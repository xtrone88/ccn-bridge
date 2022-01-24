### Install
Go to the source directory and open terminal, please run this command.<br>
> npm install
### Compile
> npx hardhat compile
### Config
Rename .env.example to .env and open it, then fill the mainnet/rinkeby url and account's private key.<br>
> PRIVATE_KEY=Your mainnet account's private key<br>
> PROVIDER_URL=Your mainnet infra url<br>

### Deploy on Mainnet
> npx hardhat run scripts/deploy.js --network mainnet<br>

### Deploy on Rinkeby
> npx hardhat run scripts/deploy_test.js --network rinkeby<br>

Once deployed, you can see the Bridge contract's address on terminal.<br>
**Save the Bridge contract's address and use it.**
