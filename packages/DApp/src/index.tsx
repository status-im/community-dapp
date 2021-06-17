import React from 'react'
import { render } from 'react-dom'
import { App } from './App'
import { DAppProvider } from '@usedapp/core'
import { ConfigProvider } from './providers/config/provider'

render(
  <React.StrictMode>
    <DAppProvider config={{}}>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
