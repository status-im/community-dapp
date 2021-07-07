import React, { useState, useEffect } from 'react'
import { DetailedVotingRoom } from '../../models/smartContract'
import { Card, CardCommunity, CardCommunityWrap, CardVote, CardVoteWrap } from '../Card'

interface VotingCardProps {
  room: DetailedVotingRoom
}

export function VotingCard({ room }: VotingCardProps) {
  const [customHeading, setCustomHeading] = useState<string | undefined>(undefined)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 769) {
        setCustomHeading(`Add ${room.details.name}?`)
      } else {
        setCustomHeading(undefined)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [window.innerWidth])

  return (
    <Card>
      <CardCommunityWrap>
        {' '}
        <CardCommunity community={room.details} customHeading={customHeading} />
      </CardCommunityWrap>
      <CardVoteWrap>
        {' '}
        <CardVote room={room} />
      </CardVoteWrap>
    </Card>
  )
}
