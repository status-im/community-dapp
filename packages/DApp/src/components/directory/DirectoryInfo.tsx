import React from 'react'
import { ConnectButton, InfoWrap, PageInfo } from '../PageInfo'
import { useEthers } from '@usedapp/core'

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
