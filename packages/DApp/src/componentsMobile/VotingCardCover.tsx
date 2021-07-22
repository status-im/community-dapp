import React from 'react'
import { DetailedVotingRoom } from '../models/smartContract'
import { Card, CardCommunityWrap } from '../components/Card'
import { CardCommunity } from '../components/card/CardCommunity'
import voting from '../helpers/voting'
import { getVotingWinner } from '../helpers/voting'
import { VoteChart } from '../components/votes/VoteChart'
import { useHistory } from 'react-router'

interface VotingCardCoverProps {
  room: DetailedVotingRoom
}

export function VotingCardCover({ room }: VotingCardCoverProps) {
  const vote = voting.fromRoom(room)
  const winner = getVotingWinner(vote)
  const history = useHistory()

  return (
    <Card onClick={() => history.push(`/votingRoom/${room.roomNumber.toString()}`)}>
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
