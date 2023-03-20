// todo: request QtWebEngine (browser) to updated instead
import 'core-js/proposals/promise-any'
import React from 'react'
import { render } from 'react-dom'
import { App } from './App'
import { DAppProvider, ChainId } from '@usedapp/core'
import { DEFAULT_CONFIG } from '@usedapp/core/dist/cjs/src/model/config/default'
import { ConfigProvider } from './providers/config/provider'
import { WakuProvider } from './providers/waku/provider'
import { CommunitiesProvider } from './providers/communities/provider'
import { WakuFeatureProvider } from './providers/wakuFeature/provider'
import { contracts, CustomChainId, getDAppConfig } from './providers/config/config'

const config = {
  readOnlyChainId: getDAppConfig(process.env.ENV).defaultChainId,
  readonlyUrls: {
    [ChainId.Ropsten]: 'https://ropsten.infura.io/v3/b4451d780cc64a078ccf2181e872cfcf',
    [CustomChainId.OptimismGoerli]: 'https://optimism-goerli.infura.io/v3/4c90c025caca4de2b1419633554e6bca',
  },
  multicallAddresses: {
    ...DEFAULT_CONFIG.multicallAddresses,
    [ChainId.Ropsten]: contracts[ChainId.Ropsten].multicallContract,
    [CustomChainId.OptimismGoerli]: contracts[CustomChainId.OptimismGoerli].multicallContract,
    [ChainId.Hardhat]: contracts[ChainId.Hardhat].multicallContract,
  },
  supportedChains: [...DEFAULT_CONFIG.supportedChains, CustomChainId.OptimismGoerli],
  notifications: {
    checkInterval: 500,
    expirationPeriod: 50000,
  },
}

render(
  <React.StrictMode>
    <ConfigProvider>
      <WakuProvider>
        <DAppProvider config={config}>
          <CommunitiesProvider>
            <WakuFeatureProvider>
              <App />
            </WakuFeatureProvider>
          </CommunitiesProvider>
        </DAppProvider>
      </WakuProvider>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
