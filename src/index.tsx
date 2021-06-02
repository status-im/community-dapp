import React from 'react'
import { render } from 'react-dom'
import { App } from './App'
import { DAppProvider } from '@usedapp/core'

render(
  <React.StrictMode>
    <DAppProvider config={{}}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
