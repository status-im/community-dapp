import React from 'react'
import { render } from 'react-dom'
import { App } from './App'
import { DAppProvider, ChainId } from '@usedapp/core'
import { DEFAULT_CONFIG } from '@usedapp/core/dist/cjs/src/model/config/default'
import { ConfigProvider } from './providers/config/provider'
import { WakuProvider } from './providers/waku/provider'
import { CommunitiesProvider } from './providers/communities/provider'

const config = {
  readOnlyChainId: ChainId.Ropsten,
  readOnlyUrls: {
    [ChainId.Ropsten]: 'https://ropsten.infura.io/v3/b4451d780cc64a078ccf2181e872cfcf',
  },
  multicallAddresses: {
    ...DEFAULT_CONFIG.multicallAddresses,
    1337: '0x049e017b504F85d3c07AFE712fC79501aa1DB712',
  },
  supportedChains: [...DEFAULT_CONFIG.supportedChains, 1337],
  notifications: {
    checkInterval: 500,
    expirationPeriod: 50000,
  },
}

render(
  <React.StrictMode>
    <WakuProvider>
      <DAppProvider config={config}>
        <ConfigProvider>
          <CommunitiesProvider>
            <App />
          </CommunitiesProvider>
        </ConfigProvider>
      </DAppProvider>
    </WakuProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
