// todo: request QtWebEngine (browser) to be updated instead, or configure target
import 'core-js/proposals/promise-any'

import React from 'react'
import { render } from 'react-dom'
import { App } from './App'
import { DAppProvider } from '@usedapp/core'
import { WakuProvider } from './providers/waku/provider'
import { CommunitiesProvider } from './providers/communities/provider'
// import { WakuFeatureProvider } from './providers/wakuFeature/provider'
import { config } from './config'

// export { config }

render(
  <React.StrictMode>
    <WakuProvider>
      <DAppProvider config={config.daapConfig}>
        <CommunitiesProvider>
          {/* <WakuFeatureProvider> */}
          <App />
          {/* </WakuFeatureProvider> */}
        </CommunitiesProvider>
      </DAppProvider>
    </WakuProvider>
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
)
