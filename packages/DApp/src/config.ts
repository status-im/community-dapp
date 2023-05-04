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
  contractConfig: {
    votingLengthInSeconds: number
    votingVerificationLengthInSeconds: number
    timeBetweenVotingInSeconds: number
    featuredVotingLengthInSeconds: number
    featuredVotingVerificationLengthInSeconds: number
  }
}

const env = process.env.ENV ?? 'localhost'

console.log('env', env)

if (!['localhost', 'development', 'production'].includes(env)) {
  throw new Error('Unsupported environment')
}

const configs: Record<typeof process.env.ENV, Config> = {
  localhost: {
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
    contractConfig: {
      votingLengthInSeconds: 4 * 60, // 4 minutes
      votingVerificationLengthInSeconds: 2 * 60, // 2 minutes
      timeBetweenVotingInSeconds: 60, // 1 minute
      featuredVotingLengthInSeconds: 4 * 60, // 4 minutes
      featuredVotingVerificationLengthInSeconds: 2 * 60, // 2 minutes
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
    contractConfig: {
      votingLengthInSeconds: 14 * 24 * 3600, // 14 days
      votingVerificationLengthInSeconds: 7 * 24 * 3600, // 7 days
      timeBetweenVotingInSeconds: 7 * 24 * 3600, // 7 days
      featuredVotingLengthInSeconds: 5 * 24 * 3600, // 5 days
      featuredVotingVerificationLengthInSeconds: 2 * 24 * 3600, // 2 days
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
    contractConfig: {
      votingLengthInSeconds: 14 * 24 * 3600, // 14 days
      votingVerificationLengthInSeconds: 7 * 24 * 3600, // 7 days
      timeBetweenVotingInSeconds: 7 * 24 * 3600, // 7 days
      featuredVotingLengthInSeconds: 5 * 24 * 3600, // 5 days
      featuredVotingVerificationLengthInSeconds: 2 * 24 * 3600, // 2 days
    },
  },
}

export const config = configs[env]
