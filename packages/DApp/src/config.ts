// import { v4 as uuidv4 } from 'uuid'
import { ChainId, OptimismGoerli, Optimism, Config as DAppConfig, Localhost, Hardhat } from '@usedapp/core'

const version = '0.0.6'

export interface Config {
  wakuConfig: {
    environment: 'test' | 'production'
    wakuTopic: string
    wakuFeatureTopic: string
  }
  daapConfig: DAppConfig
  votesLimit: number
}

/**
 * @see https://vercel.com/docs/concepts/projects/environment-variables#environments for environment descriptions
 */
const configs: Record<typeof process.env.ENV, Config> = {
  /**
   * Localhost/Development.
   */
  development: {
    wakuConfig: {
      environment: 'test',
      wakuTopic: `/communitiesCuration/jkbktl/${version}/directory/proto/`,
      wakuFeatureTopic: `/communitiesCuration/jkbktl/${version}/featured/proto/`,
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
    votesLimit: 2,
  },
  /**
   * Preview/Stage.
   *
   * All preview deployments (from pull requests) will share voting history.
   */
  preview: {
    wakuConfig: {
      environment: 'production',
      wakuTopic: `/communitiesCuration/preview/${version}/directory/proto/`,
      wakuFeatureTopic: `/communitiesCuration/preview/${version}/featured/proto/`,
    },
    daapConfig: {
      readOnlyChainId: ChainId.OptimismGoerli,
      readOnlyUrls: {
        [ChainId.OptimismGoerli]: `https://optimism-goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      },
      networks: [OptimismGoerli],
      notifications: {
        checkInterval: 500,
        expirationPeriod: 50000,
      },
    },
    votesLimit: 2,
  },
  /**
   * Production.
   */
  production: {
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
    votesLimit: 400,
  },
}

export const config = configs[process.env.ENV]
