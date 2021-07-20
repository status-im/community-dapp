import React from 'react'
import styled from 'styled-components'
import { VoteFilterBlock, VoteType, VoteTypeWrapper } from '../components/votes/VoteFilter'

export type VoteFilterProps = {
  voteType: string
  setVoteType: (value: string) => void
}

export const VoteFilterMobile = ({ voteType, setVoteType }: VoteFilterProps) => {
  return (
    <VoteFilterBlockMobile>
      <VoteFilterHeading>Vote types:</VoteFilterHeading>
      <VoteTypeWrapper>
        <VoteType className={voteType == '' ? 'selected' : 'notSelected'} onClick={() => setVoteType('')}>
          All
        </VoteType>
        <VoteType className={voteType == 'Add' ? 'selected' : 'notSelected'} onClick={() => setVoteType('Add')}>
          Add
        </VoteType>
        <VoteType className={voteType == 'Remove' ? 'selected' : 'notSelected'} onClick={() => setVoteType('Remove')}>
          Remove
        </VoteType>
      </VoteTypeWrapper>
    </VoteFilterBlockMobile>
  )
}

const VoteFilterBlockMobile = styled(VoteFilterBlock)`
  display: none;
  width: 450px;
  margin-top: 16px;

  @media (max-width: 900px) {
    display: flex;
  }

  @media (max-width: 500px) {
    justify-content: center;
    width: 100%;
  }
`

const VoteFilterHeading = styled.span`
  @media (max-width: 500px) {
    display: none;
  }
`
