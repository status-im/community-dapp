export interface Config {
  numberPerPage: number
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
  1337: {
    votingContract: '0x121',
  },
}

export const config: EnvConfigs = {
  localhost: {
    numberPerPage: 2,
    contracts,
  },
  development: {
    numberPerPage: 3,
    contracts,
  },
  production: {
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
