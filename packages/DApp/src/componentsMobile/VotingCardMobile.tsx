import React from 'react'
import { DetailedVotingRoom } from '../models/smartContract'
import { Card, CardCommunityWrap } from '../components/Card'
import { CardCommunity } from '../components/card/CardCommunity'
import voting from '../helpers/voting'
import { getVotingWinner } from '../helpers/voting'
import { VoteChart } from '../components/votes/VoteChart'

interface VotingCardMobileProps {
  room: DetailedVotingRoom
}

export function VotingCardMobile({ room }: VotingCardMobileProps) {
  const vote = voting.fromRoom(room)
  const winner = getVotingWinner(vote)
  return (
    <Card>
      <CardCommunityWrap>
        {' '}
        <CardCommunity
          community={room.details}
          customHeading={`${room.voteType == 1 ? 'Add' : 'Remove'} ${room.details.name}?`}
          customStyle={true}
        />
      </CardCommunityWrap>
      <VoteChart vote={vote} voteWinner={winner} />
    </Card>
  )
}
