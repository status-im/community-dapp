import { v4 as uuidv4 } from 'uuid'
import { ChainId, MULTICALL_ADDRESSES } from '@usedapp/core/src/constants'
import { Fleet } from 'js-waku/lib/predefined_bootstrap_nodes'

const version = '0.0.5'
const rapid = true // VOTING_LENGTH = 2min, TIME_BETWEEN_VOTING = 30s

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
  OptimismGoerli = 420
}

export const contracts = {
  [ChainId.Ropsten]: {
    votingContract: '0x120aEb4726F8B188DFBd7733E6A0Af85a445c8Bf',
    directoryContract: '0x950071851cB75F56BA90Fe718C3dDb723Bf852e2',
    tokenContract: '0x80ee48b5ba5c3EA556b7fF6D850d2fB2c4bc7412',
    multicallContract: MULTICALL_ADDRESSES[ChainId.Ropsten]
  },
  [CustomChainId.OptimismGoerli]: {
    votingContract: rapid ? '0x86037004278B7e6BC5f2a34ce5DFAd7c06555e7c' : '0x6F4F83bF868585f25090b111Fe762d9Dba3B839D',
    directoryContract: rapid ? '0x5C6CCc458020977dFE324FA8924F71A4d38c6742' : '0xaEA4F79e020B041C92316303D6889E32C2285D0b',
    tokenContract: '0xf8E655fd30696Beab513ACce4c75430a992301A7',
    multicallContract: '0x805e246abef0D2C76E619E122c79b1EF2EfBd8b7'
  },
  [ChainId.Localhost]: {
    votingContract: process.env.GANACHE_VOTING_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    directoryContract: process.env.GANACHE_DIRECTORY_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    tokenContract: process.env.GANACHE_TOKEN_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    multicallContract: process.env.GANACHE_MULTICALL_CONTRACT ?? '0x0000000000000000000000000000000000000000',
  },
}

export const config: DAppConfigs = {
  localhost: {
    fleet: Fleet.Test,
    wakuTopic: `/communitiesCuration/localhost/${uuidv4()}/${version}/directory/proto/`,
    wakuFeatureTopic: `/communitiesCuration/localhost/${uuidv4()}/${version}/featured/proto/`,
    defaultChainId: ChainId.Localhost,
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
