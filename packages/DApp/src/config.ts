import { v4 as uuidv4 } from 'uuid'
import { ChainId, OptimismGoerli, Optimism, Config as DAppConfig, Localhost, Hardhat } from '@usedapp/core'

const version = '0.0.5'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: 'localhost' | 'development' | 'production'
    }
  }
}

export interface Config {
  wakuConfig: {
    environment: 'test' | 'production'
    wakuTopic: string
    wakuFeatureTopic: string
  }
  daapConfig: DAppConfig
  statusWalletRequired: boolean
}

const configs: Record<typeof process.env.ENV, Config> = {
  localhost: {
    statusWalletRequired: false,
    wakuConfig: {
      environment: 'production',
      wakuTopic: `/communitiesCuration/localhost/${uuidv4()}/${version}/directory/proto/`,
      wakuFeatureTopic: `/communitiesCuration/localhost/${uuidv4()}/${version}/featured/proto/`,
    },
    daapConfig: {
      readOnlyChainId: ChainId.Hardhat,
      readOnlyUrls: {
        [ChainId.Hardhat]: 'http://127.0.0.1:8545',
        [ChainId.Localhost]: 'http://127.0.0.1:8545',
      },
      networks: [Localhost, Hardhat],
      multicallAddresses: {
        [ChainId.Hardhat]: process.env.MULTICALL_CONTRACT!,
        [ChainId.Localhost]: process.env.MULTICALL_CONTRACT!,
      },
      notifications: {
        checkInterval: 500,
        expirationPeriod: 50000,
      },
    },
  },
  development: {
    statusWalletRequired: false,
    wakuConfig: {
      environment: 'production',
      wakuTopic: `/communitiesCuration/development/${version}/directory/proto/`,
      wakuFeatureTopic: `/communitiesCuration/development/${version}/featured/proto/`,
    },
    daapConfig: {
      readOnlyChainId: ChainId.OptimismGoerli,
      networks: [OptimismGoerli],
      notifications: {
        checkInterval: 500,
        expirationPeriod: 50000,
      },
    },
  },
  production: {
    statusWalletRequired: true,
    wakuConfig: {
      environment: 'production',
      wakuTopic: `/communitiesCuration/${version}/directory/proto/`,
      wakuFeatureTopic: `/communitiesCuration/${version}/featured/proto/`,
    },
    daapConfig: {
      readOnlyChainId: ChainId.Optimism,
      networks: [Optimism],
      notifications: {
        checkInterval: 500,
        expirationPeriod: 50000,
      },
    },
  },
}

export const config = configs[process.env.ENV]
