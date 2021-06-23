import React, { useState } from 'react'
import { getCommunitiesUnderVote } from '../../helpers/apiMock'
import { VotingSortingEnum } from '../../models/community'
import styled from 'styled-components'
import { FilterList } from '../Filter'
import { PageBar } from '../PageBar'
import { useCommunities } from '../hooks/useCommunities'
import { VotingSortingOptions } from '../../constants/SortingOptions'
import { ButtonSecondary } from '../Button'
import { Colors } from '../../constants/styles'
import { useConfig } from '../../providers/config'
import { VotingCardSkeleton } from './VotingCardSkeleton'
import { VotingCard } from './VotingCard'

export function VotingCards() {
  const { config } = useConfig()
  const [sortedBy, setSortedBy] = useState(VotingSortingEnum.EndingSoonest)
  const [voteType, setVoteType] = useState('')
  const { communities, loading } = useCommunities(getCommunitiesUnderVote, {
    numberPerPage: config.numberPerPage,
    sortedBy,
    voteType,
  })

  return (
    <div>
      <PageBar>
        <VoteFilter>
          <span>Vote types:</span>
          <VoteType className={voteType == '' ? 'selected' : 'notSelected'} onClick={() => setVoteType('')}>
            All
          </VoteType>
          <VoteType className={voteType == 'Add' ? 'selected' : 'notSelected'} onClick={() => setVoteType('Add')}>
            Add
          </VoteType>
          <VoteType className={voteType == 'Remove' ? 'selected' : 'notSelected'} onClick={() => setVoteType('Remove')}>
            Remove
          </VoteType>
        </VoteFilter>
        <FilterList value={sortedBy} setValue={setSortedBy} options={VotingSortingOptions} />
      </PageBar>
      {communities.map((community) => (
        <VotingCard key={community.publicKey} community={community} />
      ))}
      {loading && (
        <>
          <VotingCardSkeleton />
          <VotingCardSkeleton />
          <VotingCardSkeleton />
        </>
      )}
    </div>
  )
}

const VoteFilter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 315px;
  color: ${Colors.VioletDark};
`

const VoteType = styled(ButtonSecondary)`
  display: flex;
  justify-content: space-between;
  color: ${Colors.VioletDark};
  line-height: 22px;
  padding: 5px 12px;

  &.notSelected {
    background: none;
  }
`
