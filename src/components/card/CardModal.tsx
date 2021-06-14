import React, { useState } from 'react'
import styled from 'styled-components'
import { Colors } from '../../constants/styles'
import { VoteChart } from '../votes/VoteChart'
import { Input } from '../Input'
import { ButtonSecondary } from '../Button'

export interface CardModalProps {
  voteType: string
  votesAgainst: number
  votesFor: number
  votesAgainstIcon: string
  votesForIcon: string
  timeLeft: string
  votesText: string
}

export function CardModal({
  voteType,
  votesAgainst,
  votesFor,
  votesAgainstIcon,
  votesForIcon,
  timeLeft,
  votesText,
}: CardModalProps) {
  return (
    <CardProposing>
      <VoteChart
        votesAgainst={votesAgainst}
        votesFor={votesFor}
        votesAgainstIcon={votesAgainstIcon}
        votesForIcon={votesForIcon}
        timeLeft={timeLeft}
      />
      <VoteProposing>
        <VoteProposingInfo>
          <p>My vote</p>
          <span>Available 65,245,346 SNT</span>
        </VoteProposingInfo>
        <VoteProposingAmount defaultValue="1,500,000 SNT" />
      </VoteProposing>
      <VoteConfirmBtn>
        {votesText} <span>{voteType === 'for' ? votesForIcon : votesAgainstIcon}</span>
      </VoteConfirmBtn>
    </CardProposing>
  )
}

const CardProposing = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const VoteProposing = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`
const VoteProposingInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;

  & > span {
    font-size: 12px;
    line-height: 16px;
    color: ${Colors.GreyText};
  }
`

const VoteProposingAmount = styled(Input)`
  width: 100%;
  margin-bottom: 26px;
`
const VoteConfirmBtn = styled(ButtonSecondary)`
  width: 100%;
  padding: 11px 0;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;

  & > span {
    font-size: 20px;
  }
`
