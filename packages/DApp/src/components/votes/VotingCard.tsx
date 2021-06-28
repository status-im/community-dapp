import { useContractFunction } from '@usedapp/core'
import React from 'react'
import { Card, CardCommunity, CardCommunityWrap, CardVote, CardVoteWrap } from '../Card'
import { useCommunity } from '../hooks/useCommunity'
import { useContracts } from '../hooks/useContracts'
import { useVotesAggregate } from '../hooks/useVotesAggregate'
import { VotingCardSkeleton } from './VotingCardSkeleton'

interface VotingCardProps {
  room: number
}

export function VotingCard({ room }: VotingCardProps) {
  const { community } = useCommunity(room)
  const { votes } = useVotesAggregate(room)
  const { votingContract } = useContracts()
  const { send } = useContractFunction(votingContract, 'castVotes')

  if (community) {
    return (
      <Card>
        <CardCommunityWrap>
          {' '}
          <CardCommunity community={community} />
        </CardCommunityWrap>
        <CardVoteWrap>
          {' '}
          <CardVote community={community} room={room} />
        </CardVoteWrap>
        {votes.length > 0 && community.currentVoting && community?.currentVoting.timeLeft > 0 && (
          <button style={{ border: '1px solid black', height: '50px' }} onClick={() => send(votes)}>
            {' '}
            There are {votes.length} uncomitted votes
          </button>
        )}
      </Card>
    )
  }

  return <VotingCardSkeleton />
}
