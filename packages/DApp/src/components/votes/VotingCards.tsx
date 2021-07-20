import React, { useState } from 'react'
import { VotingSortingEnum } from '../../models/community'
import styled from 'styled-components'
import { FilterList } from '../Filter'
import { PageBar } from '../PageBar'
import { ButtonPrimary } from '../Button'
import { Colors } from '../../constants/styles'
import { VotingCard } from './VotingCard'
import { Search } from '../Input'
import { VotingSortingOptions } from '../../constants/SortingOptions'
import { VotingCardSkeleton } from './VotingCardSkeleton'
import { useVotingCommunities } from '../../hooks/useVotingCommunities'
import { VotingEmpty } from './VotingEmpty'
import { SearchEmpty } from '../SearchEmpty'

export function VotingCards() {
  const [sortedBy, setSortedBy] = useState(VotingSortingEnum.EndingSoonest)
  const [voteType, setVoteType] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')
  const { roomsToShow, empty } = useVotingCommunities(filterKeyword, voteType, sortedBy)

  return (
    <div>
      <PageBar>
        <VoteSearch
          type="text"
          placeholder="Search communities..."
          value={filterKeyword}
          onChange={(e) => setFilterKeyword(e.currentTarget.value)}
        />
        <VoteFilter>
          <span>Vote types:</span>
          <VoteTypeWrapper>
            <VoteType className={voteType == '' ? 'selected' : 'notSelected'} onClick={() => setVoteType('')}>
              All
            </VoteType>
            <VoteType className={voteType == 'Add' ? 'selected' : 'notSelected'} onClick={() => setVoteType('Add')}>
              Add
            </VoteType>
            <VoteType
              className={voteType == 'Remove' ? 'selected' : 'notSelected'}
              onClick={() => setVoteType('Remove')}
            >
              Remove
            </VoteType>
          </VoteTypeWrapper>
        </VoteFilter>
        <FilterList value={sortedBy} setValue={setSortedBy} options={VotingSortingOptions} />
      </PageBar>
      {roomsToShow.map((room: any, idx) => {
        if (room?.details) {
          return <VotingCard key={idx} room={room} />
        } else {
          return <VotingCardSkeleton key={idx} />
        }
      })}
      {roomsToShow.length === 0 && empty && <VotingEmpty />}
      {roomsToShow.length === 0 && !empty && <SearchEmpty />}
    </div>
  )
}

const VoteSearch = styled(Search)`
  @media (max-width: 900px) {
    display: none;
  }
`

const VoteFilter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 310px;
  color: ${Colors.VioletDark};
`

const VoteTypeWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 220px;
  background-color: ${Colors.VioletSecondaryLight};
  padding: 4px;
  border-radius: 8px;
`

const VoteType = styled(ButtonPrimary)`
  display: flex;
  justify-content: space-between;
  background-color: ${Colors.Violet};
  color: ${Colors.White};
  line-height: 22px;
  font-weight: 500;
  padding: 5px 12px;

  &:not(:disabled):active,
  &:not(:disabled):focus {
    background: ${Colors.Violet};
  }

  &:not(:disabled):hover {
    background: ${Colors.VioletDark};
    color: ${Colors.White};
  }

  &.notSelected {
    background: none;
    color: ${Colors.VioletDark};
  }
`
