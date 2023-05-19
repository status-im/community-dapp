import React from 'react'
import styled from 'styled-components'
import backgroundImage from '../assets/images/curve-shape.svg'
import { Colors } from '../constants/styles'
import { getFeaturedVotingState } from '../helpers/featuredVoting'
import { useFeaturedVotes } from '../hooks/useFeaturedVotes'
import { formatTimeLeft } from '../helpers/fomatTimeLeft'

export const WeeklyFeature = () => {
  const { activeVoting } = useFeaturedVotes()
  if (!activeVoting) {
    return null
  }

  const featuredVotingState = getFeaturedVotingState(activeVoting)

  if (featuredVotingState === 'ended') {
    return (
      <div>
        <ViewEnded>
          ⭐ <span>Weekly Feature vote </span>has ended. Somebody needs to finalize the voting.
        </ViewEnded>
      </div>
    )
  }

  if (featuredVotingState === 'verification') {
    return (
      <div>
        <ViewEnded>
          ⭐ <span>Weekly Feature vote </span>has ended. Somebody needs to verify the votes.
        </ViewEnded>
      </div>
    )
  }

  const currentTimestamp = Date.now()
  const differenceInTime = activeVoting.verificationStartAt.toNumber() * 1000 - currentTimestamp

  return (
    <View>
      ⭐ <span>Weekly Feature vote:</span>
      {formatTimeLeft(differenceInTime)}
    </View>
  )
}

const View = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 80px;
  background: #4b67e0 url(${backgroundImage}) center no-repeat;
  background-size: cover;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  color: ${Colors.White};

  @media (max-width: 600px) {
    padding: 16px 30px;
    font-size: 15px;
    line-height: 22px;
  }

  @media (max-width: 365px) {
    padding: 9px;
  }

  span {
    font-weight: 400;
    margin: 0 6px 0 8px;
    color: rgba(255, 255, 255, 0.5);

    @media (max-width: 365px) {
      margin: 0 5px;
    }
  }
`

const ViewEnded = styled(View)`
  background-color: green;
`
