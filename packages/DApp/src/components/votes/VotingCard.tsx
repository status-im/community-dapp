import React from 'react'
import { CommunityDetail } from '../../models/community'
import { Card, CardCommunity, CardCommunityWrap, CardVote, CardVoteWrap } from '../Card'

interface VotingCardProps {
  community: CommunityDetail
}
export const VotingCard = ({ community }: VotingCardProps) => {
  return (
    <Card>
      <CardCommunityWrap>
        {' '}
        <CardCommunity community={community} />
      </CardCommunityWrap>
      <CardVoteWrap>
        {' '}
        <CardVote community={community} />
      </CardVoteWrap>
    </Card>
  )
}
