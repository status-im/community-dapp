// import { v4 as uuidv4 } from 'uuid'
import { Chain, ChainId, Optimism, OptimismGoerli, Config as DAppConfig, Localhost, Hardhat } from '@usedapp/core'

const version = '0.0.6'

export const OptimismSepolia: Chain = {
  chainId: 11155420,
  chainName: 'OptimismSepolia',
  isTestChain: false,
  isLocalChain: false,
  multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
  rpcUrl: 'https://sepolia.optimism.io/',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrl: 'https://sepolia-optimistic.etherscan.io/',
  getExplorerAddressLink: (address: string) => `https://sepolia-optimistic.etherscan.io/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) =>
    `https://sepolia-optimistic.etherscan.io/tx/${transactionHash}`,
}

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
      wakuTopic: `/communitiesCuration/localhost/${version}/directory/proto/`,
      wakuFeatureTopic: `/communitiesCuration/localhost/${version}/featured/proto/`,
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
   * Preview.
   *
   * All preview deployments (from pull requests) will share voting history.
   */
  preview: {
    wakuConfig: {
      environment: 'test',
      wakuTopic: `/communitiesCuration/preview/${version}/directory/proto/`,
      wakuFeatureTopic: `/communitiesCuration/preview/${version}/featured/proto/`,
    },
    daapConfig: {
      readOnlyChainId: OptimismSepolia.chainId,
      readOnlyUrls: {
        [OptimismSepolia.chainId]: `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
        [ChainId.OptimismGoerli]: `https://optimism-goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      },
      networks: [OptimismSepolia, OptimismGoerli],
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
      readOnlyUrls: {
        [ChainId.Optimism]: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      },
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
