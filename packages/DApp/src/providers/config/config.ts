import { v4 as uuidv4 } from 'uuid'

export interface Config {
  numberPerPage: number
  wakuTopic: string
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
    votingContract: '0xb3bb261Ac080059A46879d3B3f8B5779b9AF26dF',
    directoryContract: '0xfEB894511bC1B92EFA4f7fa050fC0BF7697Df6a2',
  },
  1337: {
    votingContract: '0xd862f2550F37bE4DCb42Ec684b3D2528635d2Bc9',
    directoryContract: '0xbb8243e9f5b55C9e7E64e118c99EE78a7080fbf9',
  },
}

export const config: EnvConfigs = {
  localhost: {
    wakuTopic: `/myApp/localhost/${uuidv4()}/0.0.5/votingRoom/`,
    numberPerPage: 2,
    contracts,
  },
  development: {
    wakuTopic: '/myApp/development/0.0.5/votingRoom/',
    numberPerPage: 3,
    contracts,
  },
  production: {
    wakuTopic: '/myApp/production/0.0.5/votingRoom/',
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
