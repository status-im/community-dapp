# status-community-dapp

Community directory curator dApp for Status

# API

Proposed api is available [here](API.md)

# Running the project

Note: 
- Use node `v18.18.0`
- Use yarn `1.22.19`
- Use Foundry ([getfoundry.sh](https://getfoundry.sh))

1. Install dependencies: Run `yarn` to install the necessary packages and dependencies.
2. Run local anvil node: Run `anvil`
3. Deploy contracts: Navigate to the `packages/contracts` directory and run:
```
$ MNEMONIC=$YOUR_MNEMONIC forge script script/DeployContracts.s.sol --fork-url $YOUR_RPC_URL --broadcast
```

Where
- `$YOUR_MNEMONIC` is the mnemonic that contains the account from which you want to deploy. The deploy script will use the first account derived from the mnemonic by default.
- `$YOUR_RPC_URL` is the RPC endpoint of the node you're connecting to.

You can omit the `--broadcast` option to simulate the deployment before actually performing it.

4. Start the app: Run `VOTING_CONTRACT=hex_addr DIRECTORY_CONTRACT=hex_addr MULTICALL_CONTRACT=hex_addr TOKEN_CONTRACT=hex_addr FEATURED_VOTING_CONTRACT=hex_addr yarn dev` to start the application. Make sure to replace `hex_addr` with the actual addresses of the contracts you deployed in step 3.

Once the app is run, connect to the wallet. NOTE: in 'production' mode it has to be Status wallet.
