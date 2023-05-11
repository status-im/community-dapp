# status-community-dapp

Community directory curator dApp for Status

# API

Proposed api is available [here](API.md)

# Running the project

Note: Use node `v18.15.0`

1. Install dependencies: Run `yarn` to install the necessary packages and dependencies.
2. Run local hardhat node: Navigate to the `packages/contract` directory and run `yarn dev`.
3. Deploy contracts: Navigate to the `packages/contracts` directory and run `yarn dev:deploy` to deploy the contracts needed for the project.
4. Start the app: Run `VOTING_CONTRACT=hex_addr DIRECTORY_CONTRACT=hex_addr MULTICALL_CONTRACT=hex_addr TOKEN_CONTRACT=hex_addr yarn dev` to start the application. Make sure to replace `hex_addr` with the actual addresses of the contracts you deployed in step 3.

Once the app is run, connect to the wallet. NOTE: in 'production' mode it has to be Status wallet.
