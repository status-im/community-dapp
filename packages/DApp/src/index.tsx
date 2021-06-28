import React from 'react'
import { render } from 'react-dom'
import { App } from './App'
import { DAppProvider, ChainId } from '@usedapp/core'
import { ConfigProvider } from './providers/config/provider'
import { WakuProvider } from './providers/waku/provider'

const config = {
  readOnlyChainId: ChainId.Ropsten,
  readOnlyUrls: {
    [ChainId.Ropsten]: 'https://Ropsten.infura.io/v3/62687d1a985d4508b2b7a24827551934',
  },
}

render(
  <React.StrictMode>
    <WakuProvider>
      <DAppProvider config={config}>
        <ConfigProvider>
          <App />
        </ConfigProvider>
      </DAppProvider>
    </WakuProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
