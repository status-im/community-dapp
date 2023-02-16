import React, { ReactNode, useReducer, createContext, useContext } from 'react'
import merge from 'lodash/merge'
import { getDAppConfig, Config } from './config'

const ConfigContext = createContext<{ config: Config; updateConfig: (config: Partial<Config>) => void }>({
  config: getDAppConfig(process.env.ENV),
  updateConfig: () => undefined,
})

export function useConfig() {
  return useContext(ConfigContext)
}

interface ConfigProviderProps {
  children: ReactNode
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [reducedConfig, dispatch] = useReducer(configReducer, { ...getDAppConfig(process.env.ENV) })
  return <ConfigContext.Provider value={{ config: reducedConfig, updateConfig: dispatch }} children={children} />
}

function configReducer(state: Config, action: Partial<Config>): Config {
  return merge({}, state, action)
}
