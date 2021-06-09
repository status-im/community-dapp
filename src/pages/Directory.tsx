import React from 'react'
import { ConnectButton, InfoWrap, PageInfo } from '../components/PageInfo'
import { useEthers } from '@usedapp/core'
import { Card, CardCommunity, CardFeature } from '../components/Card'
import styled from 'styled-components'

export function Directory() {
  const { account } = useEthers()
  return (
    <div>
      <InfoWrap>
        <PageInfo
          heading="Current directory"
          text="Vote on your favourite communities being included in 
      Weekly Featured Communities"
        />
        {!account && <ConnectButton />}
      </InfoWrap>
      <Voting>
        <Card>
          <CardCommunity
            img="https://www.cryptokitties.co/icons/logo.svg"
            heading="CryptoKitties"
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat."
            tags={['nffts']}
          />
          <CardFeature
            heading="Feature this community?"
            text="Weekly Feature vote"
            // text="This community has to wait until it can be featured again"
            icon="⭐"
            // icon="⏳"
            sum={16740235}
            voting={true}
            // timeLeft='2 weeks left'
          />
        </Card>
      </Voting>
    </div>
  )
}

const Voting = styled.div`
  display: flex;
  flex-direction: column;
`
