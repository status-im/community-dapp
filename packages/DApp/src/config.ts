import { v4 as uuidv4 } from 'uuid'
import { ChainId, OptimismGoerli, Optimism, Config as DAppConfig, Localhost, Hardhat } from '@usedapp/core'

const version = '0.0.5'

export interface Config {
  wakuConfig: {
    environment: 'test' | 'production'
    wakuTopic: string
    wakuFeatureTopic: string
  }
  daapConfig: DAppConfig
  statusWalletRequired: boolean
}

/**
 * @see https://vercel.com/docs/concepts/projects/environment-variables#environments for environment descriptions
 */
const configs: Record<typeof process.env.ENV, Config> = {
  /**
   * Localhost/Development.
   */
  development: {
    statusWalletRequired: false,
    wakuConfig: {
      environment: 'test',
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
  /**
   * Preview/Stage.
   *
   * All preview deployments (from pull requests) will share voting history.
   */
  preview: {
    statusWalletRequired: false,
    wakuConfig: {
      environment: 'test',
      wakuTopic: `/communitiesCuration/preview/${version}/directory/proto/`,
      wakuFeatureTopic: `/communitiesCuration/preview/${version}/featured/proto/`,
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
  /**
   * Production.
   */
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
