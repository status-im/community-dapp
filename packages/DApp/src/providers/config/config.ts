import { v4 as uuidv4 } from 'uuid'

export interface Config {
  numberPerPage: number
  wakuTopic: string
  wakuFeatureTopic: string
  contracts: {
    [chainID: number]: {
      [name: string]: string
    }
  }
}

interface EnvConfigs {
  [env: string]: Config
}

const contracts = {
  3: {
    subgraph: '',
    votingContract: '0xa5D103c5cB98BDa145ee9816B1E890816c91B4B4',
    directoryContract: '0x85a11916755e623f3e089D0A6ebb39cddf58C5Eb',
    tokenContract: '0x80ee48b5ba5c3EA556b7fF6D850d2fB2c4bc7412',
  },
  1337: {
    subgraph: 'http://localhost:8000/subgraphs/name/HistorySubgraph',
    votingContract: process.env.GANACHE_VOTING_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    directoryContract: process.env.GANACHE_DIRECTORY_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    tokenContract: process.env.GANACHE_TOKEN_CONTRACT ?? '0x0000000000000000000000000000000000000000',
  },
}

const version = '0.0.5'

export const config: EnvConfigs = {
  localhost: {
    wakuTopic: `/myApp/localhost/${uuidv4()}/${version}/votingRoom/proto/`,
    wakuFeatureTopic: `/myApp/localhost/${uuidv4()}/${version}/feature/proto/`,
    numberPerPage: 2,
    contracts,
  },
  development: {
    wakuTopic: `/myApp/development/${version}/votingRoom/proto/`,
    wakuFeatureTopic: `/myApp/development/${version}/feature/proto/`,
    numberPerPage: 3,
    contracts,
  },
  production: {
    wakuTopic: `/myApp/production/${version}/votingRoom/proto/`,
    wakuFeatureTopic: `/myApp/production/${version}/feature/proto/`,
    numberPerPage: 4,
    contracts,
  },
}

export const getEnvConfig = (env: string | undefined) => {
  if (env) {
    return config[env]
  } else {
    return config['development']
  }
}
