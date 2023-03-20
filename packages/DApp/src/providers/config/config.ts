import { v4 as uuidv4 } from 'uuid'
import { ChainId, MULTICALL_ADDRESSES } from '@usedapp/core'
import { Fleet } from 'js-waku/lib/predefined_bootstrap_nodes'

const version = '0.0.5'

export interface Config {
  fleet: Fleet
  wakuTopic: string
  wakuFeatureTopic: string
  defaultChainId: number
  contracts: {
    [chainID: number]: {
      [name: string]: string
    }
  }
  statusWalletRequired: boolean
}

interface DAppConfigs {
  [env: string]: Config
}

export enum CustomChainId {
  OptimismGoerli = 420,
}

export const contracts = {
  [ChainId.Ropsten]: {
    // TO BE PROVIDED
    votingContract: '0x0000000000000000000000000000000000000000',
    directoryContract: '0x0000000000000000000000000000000000000000',
    tokenContract: '0x0000000000000000000000000000000000000000',
    multicallContract: MULTICALL_ADDRESSES[ChainId.Ropsten],
  },
  [CustomChainId.OptimismGoerli]: {
    // TO BE PROVIDED
    votingContract: '0x0000000000000000000000000000000000000000',
    directoryContract: '0x0000000000000000000000000000000000000000',
    tokenContract: '0x0000000000000000000000000000000000000000',
    multicallContract: '0x805e246abef0D2C76E619E122c79b1EF2EfBd8b7',
  },
  [ChainId.Hardhat]: {
    votingContract: process.env.VOTING_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    directoryContract: process.env.DIRECTORY_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    tokenContract: process.env.TOKEN_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    multicallContract: process.env.MULTICALL_CONTRACT ?? '0x0000000000000000000000000000000000000000',
  },
}

export const config: DAppConfigs = {
  localhost: {
    fleet: Fleet.Test,
    wakuTopic: `/communitiesCuration/localhost/${uuidv4()}/${version}/directory/proto/`,
    wakuFeatureTopic: `/communitiesCuration/localhost/${uuidv4()}/${version}/featured/proto/`,
    defaultChainId: ChainId.Hardhat,
    contracts,
    statusWalletRequired: false,
  },
  development: {
    fleet: Fleet.Test,
    wakuTopic: `/communitiesCuration/development/${version}/directory/proto/`,
    wakuFeatureTopic: `/communitiesCuration/development/${version}/featured/proto/`,
    defaultChainId: CustomChainId.OptimismGoerli,
    contracts,
    statusWalletRequired: false,
  },
  production: {
    fleet: Fleet.Prod,
    wakuTopic: `/communitiesCuration/${version}/directory/proto/`,
    wakuFeatureTopic: `/communitiesCuration/${version}/featured/proto/`,
    defaultChainId: ChainId.Ropsten,
    contracts,
    statusWalletRequired: true,
  },
}

export const getDAppConfig = (env: string | undefined) => {
  if (env) {
    return config[env]
  } else {
    return config['development']
  }
}
