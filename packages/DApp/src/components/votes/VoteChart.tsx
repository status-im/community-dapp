import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import styled from 'styled-components'
import { Colors } from '../../constants/styles'
import { addCommas } from '../../helpers/addCommas'
import { VoteType, voteTypes } from './../../constants/voteTypes'
import { CurrentVoting } from '../../models/community'
import { VoteGraphBar } from './VoteGraphBar'
import { formatTimeLeft, formatTimeLeftVerification } from '../../helpers/fomatTimeLeft'
import { useUnverifiedVotes } from '../../hooks/useUnverifiedVotes'
import { DetailedVotingRoom } from '../../models/smartContract'
export interface VoteChartProps {
  vote: CurrentVoting
  voteWinner?: number
  proposingAmount?: number
  selectedVote?: VoteType
  isAnimation?: boolean
  tabletMode?: (val: boolean) => void
  room: DetailedVotingRoom
}

export function VoteChart({
  vote,
  voteWinner,
  proposingAmount,
  selectedVote,
  isAnimation,
  tabletMode,
  room,
}: VoteChartProps) {
  const [mobileVersion, setMobileVersion] = useState(false)
  const { votesFor: votesForUnverified, votesAgainst: votesAgainstUnverified } = useUnverifiedVotes(
    vote.ID,
    room.verificationStartAt,
    room.startAt
  )

  const verificationPeriod =
    room.verificationStartAt.toNumber() * 1000 - Date.now() < 0 && room.endAt.toNumber() * 1000 - Date.now() > 0

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setMobileVersion(true)
      } else {
        setMobileVersion(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const voteConstants = voteTypes[vote.type]

  const includeUnverifiedVotes = voteWinner || verificationPeriod

  const votesFor = includeUnverifiedVotes ? vote.voteFor.toNumber() : vote.voteFor.toNumber() + votesForUnverified
  const votesAgainst = includeUnverifiedVotes
    ? vote.voteAgainst.toNumber()
    : vote.voteAgainst.toNumber() + votesAgainstUnverified
  const voteSum = votesFor + votesAgainst
  const graphWidth = (100 * votesAgainst) / voteSum

  let balanceWidth = graphWidth

  if (proposingAmount && selectedVote) {
    balanceWidth =
      selectedVote.type === 0
        ? (100 * (votesAgainst + proposingAmount)) / (voteSum + proposingAmount)
        : (100 * votesAgainst) / (voteSum + proposingAmount)
  }

  const iconWinnerFont = mobileVersion ? '36px' : '42px'

  return (
    <Votes>
      <VotesChart className={selectedVote || tabletMode ? '' : 'notModal'}>
        <VoteBox
          style={{
            filter: voteWinner && voteWinner === 2 ? 'grayscale(1)' : 'none',
            textAlign: mobileVersion ? 'start' : 'center',
          }}
        >
          <p
            style={{ fontSize: voteWinner === 1 ? iconWinnerFont : '24px', marginTop: voteWinner === 2 ? '18px' : '0' }}
          >
            {voteConstants.against.icon}
          </p>
          <span>
            {' '}
            {isAnimation && proposingAmount && selectedVote && selectedVote.type === 0 ? (
              <CountUp end={votesAgainst + proposingAmount} separator="," />
            ) : (
              addCommas(votesAgainst)
            )}{' '}
            <span style={{ fontWeight: 'normal' }}>SNT</span>
          </span>
        </VoteBox>
        <TimeLeft className={selectedVote ? '' : 'notModal'}>
          {vote.timeLeft > 0 ? formatTimeLeft(vote.timeLeft) : formatTimeLeftVerification(vote.timeLeftVerification)}
        </TimeLeft>
        <VoteBox
          style={{
            filter: voteWinner && voteWinner === 1 ? 'grayscale(1)' : 'none',
            textAlign: mobileVersion ? 'end' : 'center',
          }}
        >
          <p
            style={{ fontSize: voteWinner === 2 ? iconWinnerFont : '24px', marginTop: voteWinner === 1 ? '18px' : '0' }}
          >
            {voteConstants.for.icon}
          </p>
          <span>
            {' '}
            {isAnimation && proposingAmount && selectedVote && selectedVote.type === 1 ? (
              <CountUp end={votesFor + proposingAmount} separator="," />
            ) : (
              addCommas(votesFor)
            )}{' '}
            <span style={{ fontWeight: 'normal' }}>SNT</span>
          </span>
        </VoteBox>
      </VotesChart>
      <VoteGraphBarWrap className={selectedVote || tabletMode ? '' : 'notModal'}>
        <VoteGraphBar
          graphWidth={graphWidth}
          balanceWidth={balanceWidth}
          voteWinner={voteWinner}
          isAnimation={isAnimation}
        />
        <TimeLeftMobile className={selectedVote ? '' : 'notModal'}>{formatTimeLeft(vote.timeLeft)}</TimeLeftMobile>
      </VoteGraphBarWrap>
    </Votes>
  )
}

const Votes = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
  width: 100%;
  position: relative;

  @media (max-width: 600px) {
    margin-bottom: 0;
  }
`
const VotesChart = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 13px;

  &.notModal {
    @media (max-width: 768px) {
      margin-bottom: 0;
    }
  }
`

const VoteBox = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  font-size: 12px;
  text-align: center;
  font-weight: normal;

  & > p {
    font-size: 24px;
    line-height: 100%;
  }

  & > span {
    font-weight: bold;
    margin-top: 8px;
  }

  @media (max-width: 768px) {
    min-width: 70px;
  }

  @media (max-width: 600px) {
    min-width: unset;
  }
`

const TimeLeft = styled.div`
  position: absolute;
  top: 50%;
  left: calc(50%);
  transform: translateX(-50%);
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1px;
  color: ${Colors.GreyText};

  &.notModal {
    @media (max-width: 768px) {
      top: -16px;
    }

    @media (max-width: 600px) {
      top: unset;
    }
  }
`

const TimeLeftMobile = styled.div`
  position: absolute;
  bottom: -23px;
  left: calc(50%);
  transform: translateX(-50%);
  font-size: 0;
  line-height: 16px;
  letter-spacing: 0.1px;
  color: ${Colors.GreyText};

  @media (max-width: 600px) {
    font-size: 12px;
  }
`

const VoteGraphBarWrap = styled.div`
  position: static;
  display: flex;
  justify-content: center;

  &.notModal {
    @media (max-width: 768px) {
      position: absolute;
      width: 65%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    @media (max-width: 600px) {
      width: 70%;
    }
  }
`
