import React from 'react'
import { InfoWrap, PageInfo } from '../PageInfo'
import { useContractFunction, useEthers } from '@usedapp/core'
import { ConnectButton } from '../ConnectButton'
import { ProposeButton } from '../Button'
import { useFeaturedVotes } from '../../hooks/useFeaturedVotes'
import { getFeaturedVotingState } from '../../helpers/featuredVoting'
import { useContracts } from '../../hooks/useContracts'

export function DirectoryInfo() {
  const { account } = useEthers()
  const { featuredVotingContract } = useContracts()
  const { activeVoting } = useFeaturedVotes()
  const featuredVotingState = getFeaturedVotingState(activeVoting)
  const castVotes = useContractFunction(featuredVotingContract, 'castVotes')
  const finalizeVoting = useContractFunction(featuredVotingContract, 'finalizeVoting')

  const votes: string[] = []

  return (
    <InfoWrap>
      <PageInfo
        heading="Current directory"
        text="Vote on your favourite communities being included in 
      Weekly Featured Communities"
      />
      {!account && <ConnectButton />}
      {featuredVotingState === 'verification' && (
        <ProposeButton onClick={() => castVotes.send(votes)}>Verify Weekly featured</ProposeButton>
      )}
      {featuredVotingState === 'ended' && (
        <ProposeButton onClick={() => finalizeVoting.send()}>Finalize Weekly featured</ProposeButton>
      )}
    </InfoWrap>
  )
}
