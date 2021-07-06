import React from 'react'
import { render } from 'react-dom'
import { App } from './App'
import { DAppProvider, ChainId } from '@usedapp/core'
import { ConfigProvider } from './providers/config/provider'
import { WakuProvider } from './providers/waku/provider'

const config = {
  readOnlyChainId: ChainId.Ropsten,
  readOnlyUrls: {
    [ChainId.Ropsten]: 'https://ropsten.infura.io/v3/b4451d780cc64a078ccf2181e872cfcf',
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
