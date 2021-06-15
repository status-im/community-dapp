import React from 'react'
import styled from 'styled-components'
import { Colors } from '../../constants/styles'
import indicatorIcon from '../../assets/images/indicator.svg'
import { addCommas } from '../../helpers/addCommas'
import { voteTypes } from './../../constants/voteTypes'
import { CurrentVoting } from '../../models/community'

export interface VoteChartProps {
  vote: CurrentVoting
  voteWinner?: number
}

export function VoteChart({ vote, voteWinner }: VoteChartProps) {
  const voteConstants = voteTypes[vote.type]

  return (
    <Votes>
      <VotesChart>
        <VoteBox style={{ filter: voteWinner && voteWinner === 2 ? 'grayscale(1)' : 'none' }}>
          <p style={{ fontSize: voteWinner === 1 ? '42px' : '24px' }}>{voteConstants.against.icon}</p>
          <span>
            {' '}
            {addCommas(vote.voteAgainst.toNumber())} <span style={{ fontWeight: 'normal' }}>SNT</span>
          </span>
        </VoteBox>
        <TimeLeft>{vote.timeLeft / 3600} Hours</TimeLeft>
        <VoteBox style={{ filter: voteWinner && voteWinner === 1 ? 'grayscale(1)' : 'none' }}>
          <p style={{ fontSize: voteWinner === 2 ? '42px' : '24px' }}>{voteConstants.for.icon}</p>
          <span>
            {' '}
            {addCommas(vote.voteFor.toNumber())} <span style={{ fontWeight: 'normal' }}>SNT</span>
          </span>
        </VoteBox>
      </VotesChart>

      <VoteGraphBar
        votesFor={vote.voteFor.toNumber()}
        votesAgainst={vote.voteAgainst.toNumber()}
        voteWinner={voteWinner}
      />
    </Votes>
  )
}

export interface VoteGraphBarProps {
  votesAgainst: number
  votesFor: number
  voteWinner?: number
}

export function VoteGraphBar({ votesFor, votesAgainst, voteWinner }: VoteGraphBarProps) {
  return (
    <VoteGraph
      style={{
        backgroundColor: voteWinner && voteWinner === 1 ? `${Colors.GrayDisabledLight}` : `${Colors.BlueBar}`,
      }}
    >
      <VoteGraphAgainst
        style={{
          width: calculateWidth(votesFor, votesAgainst) + '%',
          backgroundColor: voteWinner && voteWinner === 2 ? `${Colors.GrayDisabledLight}` : `${Colors.Orange}`,
        }}
      />
    </VoteGraph>
  )
}

function calculateWidth(votesFor: number, votesAgainst: number) {
  return (100 * votesAgainst) / (votesFor + votesAgainst)
}

const Votes = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
  width: 100%;
`
const VotesChart = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 13px;
`

const VoteBox = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  max-width: 100px;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  font-weight: normal;

  & > p {
    font-size: 24px;
    line-height: 24px;
    margin-bottom: 8px;
  }

  & > span {
    font-weight: bold;
  }
`

const TimeLeft = styled.p`
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1px;
  color: ${Colors.GreyText};
`

const VoteGraph = styled.div`
  position: relative;
  width: 100%;
  height: 16px;
  background-color: ${Colors.BlueBar};
  border-radius: 10px;
  padding-top: 5px;

  &::before {
    content: '';
    width: 16px;
    height: 5px;
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    background-image: url(${indicatorIcon});
    background-size: cover;
  }
`

const VoteGraphAgainst = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 13px;
  height: 16px;
  background-color: ${Colors.Orange};
  border-right: 2px solid ${Colors.VioletLight};
  border-radius: 10px 0 0 10px;
  z-index: 2;
`
