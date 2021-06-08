import React from 'react'
import styled from 'styled-components'
import { InfoWrap, ConnectButton, ProposeButton, PageInfo } from '../components/PageInfo'
import { useEthers } from '@usedapp/core'
import { Card, CardCommunity, CardVote } from '../components/Card'

export function Votes() {
  const { account } = useEthers()
  return (
    <div>
      <InfoWrap>
        <PageInfo
          heading="Ongoing Votes"
          text="Help curate the Status Communities directory by voting which communities should be included"
        />
        {account ? <ProposeButton /> : <ConnectButton />}
      </InfoWrap>
      <Voting>
        <Card>
          <CardCommunity
            img="https://www.cryptokitties.co/icons/logo.svg"
            heading="CryptoKitties"
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat."
            tags={['nffts']}
          />
          <CardVote
            voteHeading="SNT holders have decided to add this community to the directory!"
            votesAgainst={6740235}
            votesFor={16740235}
            votesAgainstIcon="👎"
            votesForIcon="👍"
            votesAgainstText="Don't add"
            votesForText="Add"
            timeLeft="8 hours left"
            voteWinner={2}
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
