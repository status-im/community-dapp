import React from 'react'

import { useEthers } from '@usedapp/core'

export function App() {
  const { account, activateBrowserWallet } = useEthers()

  return (
    <div>
      <button onClick={() => activateBrowserWallet()}>Activate browser wallet</button>
      {account}
    </div>
  )
}
