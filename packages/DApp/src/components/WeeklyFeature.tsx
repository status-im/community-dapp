import React from 'react'
import styled from 'styled-components'
import backgroundImage from '../assets/images/curve-shape.svg'
import { Colors } from '../constants/styles'
import { useContracts } from '../hooks/useContracts'
import { VoteBtn } from './Button'
import { BigNumber } from 'ethers'
import { useContractCall, useContractFunction } from '@usedapp/core'

export const WeeklyFeature = ({ endDate }: { endDate: Date }) => {
  const { featuredVotingContract } = useContracts()
  const { send } = useContractFunction(featuredVotingContract, 'initializeVoting')
  const castVotes = useContractFunction(featuredVotingContract, 'castVotes')
  const finalizeVoting = useContractFunction(featuredVotingContract, 'finalizeVoting')

  const weeklyVoting = useContractCall({
    abi: featuredVotingContract.interface,
    address: featuredVotingContract.address,
    method: 'votings',
    args: [],
  }) ?? [[]]

  const votes: string[] = []

  console.log(weeklyVoting)

  const today = new Date()
  const differenceInTime = endDate.getTime() - today.getTime()
  const daysLeft = Math.ceil(differenceInTime / (1000 * 3600 * 24))

  return (
    <>
      <VotingControlTemp>
        <VoteBtn
          onClick={() =>
            send(
              '0x0486c7c2e3e389b617e75aede6a90e823bc49548a6ca937c0691851831a8690072fa4f160122d1b0aa86ba07806a0b0073b2bff0fee3c8c53dc4289e880a819e4f',
              BigNumber.from(10000)
            )
          }
        >
          Start weekly
        </VoteBtn>
        <VoteBtn onClick={() => castVotes.send(votes)}>Verify weekly</VoteBtn>
        <VoteBtn onClick={() => finalizeVoting.send()}>Finalize weekly</VoteBtn>
      </VotingControlTemp>

      {daysLeft <= 0 && (
        <ViewEnded>
          ⭐ <span>Weekly Feature vote </span>has ended
        </ViewEnded>
      )}
      {daysLeft > 0 && (
        <View>
          ⭐ <span>Weekly Feature vote {window.innerWidth < 600 ? 'ends' : ''}:</span>
          {daysLeft}&nbsp;
          {daysLeft.toString().endsWith('1') ? 'day ' : ' days'} {window.innerWidth < 600 ? '' : 'left'}
        </View>
      )}
    </>
  )
}

const VotingControlTemp = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
`

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
