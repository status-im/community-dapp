import React from 'react'
import styled from 'styled-components'
import { Colors } from '../../constants/styles'
import indicatorIcon from '../../assets/images/indicator.svg'
import { VoteType } from '../../constants/voteTypes'

export interface VoteGraphBarProps {
  votesAgainst: number
  votesFor: number
  voteWinner?: number
  proposingAmount?: number
  selectedVote?: VoteType
}

export function VoteGraphBar({ votesFor, votesAgainst, voteWinner, proposingAmount, selectedVote }: VoteGraphBarProps) {
  const voteSum = votesFor + votesAgainst
  const graphWidth = (100 * votesAgainst) / voteSum

  let balanceWidth = graphWidth

  if (proposingAmount && selectedVote) {
    balanceWidth =
      selectedVote.type === 0
        ? (100 * (votesAgainst + proposingAmount)) / (voteSum + proposingAmount)
        : (100 * votesAgainst) / (voteSum + proposingAmount)
  }

  return (
    <VoteGraph
      style={{
        backgroundColor: voteWinner && voteWinner === 1 ? `${Colors.GrayDisabledLight}` : `${Colors.BlueBar}`,
      }}
    >
      <VoteGraphAgainst
        style={{
          width: graphWidth + '%',
          backgroundColor: voteWinner && voteWinner === 2 ? `${Colors.GrayDisabledLight}` : `${Colors.Orange}`,
        }}
      />
      <VoteBalance
        style={{
          width: balanceWidth + '%',
        }}
      ></VoteBalance>
    </VoteGraph>
  )
}

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
    left: calc(50% - 1px);
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
  border-radius: 10px 0 0 10px;
  z-index: 2;
`

const VoteBalance = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 13px;
  height: 16px;
  background-color: transparent;
  border-right: 2px solid ${Colors.VioletLight};
  border-radius: 10px 0 0 10px;
  z-index: 2;
`
