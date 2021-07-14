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
    votingContract: '0xD330F512Ed6DC3F088a8Ebe342e9f817E09938A9',
    directoryContract: '0x6a5dc0B148eAa891224D6c0d1679D5954CA1D295',
  },
  1337: {
    votingContract: '0x2ee36F4A0BBf35C8b7bE185D1c5447Fd485f9c12',
    directoryContract: '0x689C9049BD7197687959d0b8Dc2344f42e8e4500',
  },
}

export const config: EnvConfigs = {
  localhost: {
    wakuTopic: `/myApp/localhost/${uuidv4()}/0.0.4/votingRoom/`,
    numberPerPage: 2,
    contracts,
  },
  development: {
    wakuTopic: '/myApp/development/0.0.4/votingRoom/',
    numberPerPage: 3,
    contracts,
  },
  production: {
    wakuTopic: '/myApp/production/0.0.4/votingRoom/',
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
