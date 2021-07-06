import React from 'react'
import { DetailedVotingRoom } from '../../models/smartContract'
import { Card, CardCommunity, CardCommunityWrap, CardVote, CardVoteWrap } from '../Card'

interface VotingCardProps {
  room: DetailedVotingRoom
}

export function VotingCard({ room }: VotingCardProps) {
  return (
    <Card>
      <CardCommunityWrap>
        {' '}
        <CardCommunity community={room.details} />
      </CardCommunityWrap>
      <CardVoteWrap>
        {' '}
        <CardVote room={room} />
      </CardVoteWrap>
    </Card>
  )
}
