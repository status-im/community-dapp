# status-community-dapp
Community directory curator dApp for Status

# API

Proposed api is available [here](API.md)

# build & run
`yarn && yarn build && yarn run`

To run the app in different configurations use `ENV` environment variable. Possible values are: 'localhost', 'development', 'production'. If no `ENV` is provided, the app will default to 'development'.

Once the app is run, connect to the wallet. NOTE: in 'production' mode it has to be Status wallet.

Currently contracts are only deployed to optimism goerli.
