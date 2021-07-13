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
    votingContract: '0xDAd243C1D47f25b129001181F09c53F93B66c721',
    directoryContract: '0x78055B8E0fD4a130f4D3536EfdcF0A5617077D24',
  },
  1337: {
    votingContract: '0x7623410b03A75B75133488032886c1E6Fb58222f',
    directoryContract: '0xD17456480B991979a2882395a5Def44F8C48282C',
  },
}

export const config: EnvConfigs = {
  localhost: {
    wakuTopic: `/myApp/localhost/${uuidv4()}/0.0.3/votingRoom/`,
    numberPerPage: 2,
    contracts,
  },
  development: {
    wakuTopic: '/myApp/development/0.0.3/votingRoom/',
    numberPerPage: 3,
    contracts,
  },
  production: {
    wakuTopic: '/myApp/production/0.0.3/votingRoom/',
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
