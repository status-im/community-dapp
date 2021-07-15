import React from 'react'
import { InfoWrap, PageInfo } from '../PageInfo'
import { useEthers } from '@usedapp/core'
import { ConnectButton } from '../ConnectButton'

export function DirectoryInfo() {
  const { account } = useEthers()
  return (
    <InfoWrap>
      <PageInfo
        heading="Current directory"
        text="Vote on your favourite communities being included in 
      Weekly Featured Communities"
      />
      {!account && <ConnectButton />}
    </InfoWrap>
  )
}
