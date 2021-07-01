import React from 'react'
import { Card, CardCommunity, CardCommunityWrap, CardVote, CardVoteWrap } from '../Card'
import { useCommunity } from '../../hooks/useCommunity'
import { VotingCardSkeleton } from './VotingCardSkeleton'

interface VotingCardProps {
  room: number
}

export function VotingCard({ room }: VotingCardProps) {
  const { community } = useCommunity(room)

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
      </Card>
    )
  }

  return <VotingCardSkeleton />
}
