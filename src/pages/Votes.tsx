import React from 'react'
import { InfoWrap, ConnectButton, ProposeButton, PageInfo } from '../components/PageInfo'
import { useEthers } from '@usedapp/core'

export function Votes() {
  const { account } = useEthers()
  return (
    <InfoWrap>
      <PageInfo
        heading="Ongoing Votes"
        text="Help curate the Status Communities directory by voting which communities should be included"
      />
      {account ? <ProposeButton /> : <ConnectButton />}
    </InfoWrap>
  )
}
