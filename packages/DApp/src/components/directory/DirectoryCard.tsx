import React, { useEffect, useState } from 'react'
import { Card, CardCommunityWrap, CardVoteWrap } from '../Card'
import { CardCommunity } from '../card/CardCommunity'
import { CardFeature } from '../card/CardFeature'
import { CommunityDetail } from '../../models/community'
import { useGetCurrentVoting } from '../../hooks/useGetCurrentVoting'

export interface DirectoryCardProps {
  community: CommunityDetail
}

export function DirectoryCard({ community }: DirectoryCardProps) {
  const [customStyle, setCustomStyle] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 769) {
        setCustomStyle(true)
      } else {
        setCustomStyle(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [window.innerWidth])

  let timeLeft: string | undefined = undefined
  if (community?.directoryInfo?.untilNextFeature) {
    timeLeft = `${community.directoryInfo.untilNextFeature / (3600 * 24 * 7)} weeks left`
  } else {
    timeLeft = `1 weeks left`
  }

  const { currentVoting, votingRoom } = useGetCurrentVoting(community?.publicKey)

  return (
    <Card>
      <CardCommunityWrap>
        &nbsp;
        <CardCommunity
          community={community}
          showRemoveButton={true}
          currentVoting={currentVoting}
          customStyle={customStyle}
        />
      </CardCommunityWrap>
      <CardVoteWrap>
        <CardFeature
          community={community}
          heading={timeLeft ? 'This community has to wait until it can be featured again' : 'Weekly Feature vote'}
          icon={community?.directoryInfo?.featureVotes ? '⭐' : '⏳'}
          sum={community?.directoryInfo?.featureVotes?.toNumber()}
          timeLeft={timeLeft}
          currentVoting={currentVoting}
          room={votingRoom}
        />
      </CardVoteWrap>
    </Card>
  )
}
