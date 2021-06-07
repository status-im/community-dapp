import React from 'react'
import { ConnectButton, InfoWrap, PageInfo } from '../components/PageInfo'
import { useEthers } from '@usedapp/core'

export function Directory() {
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
