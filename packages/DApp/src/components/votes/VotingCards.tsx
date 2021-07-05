import React, { useState } from 'react'
import { VotingSortingEnum } from '../../models/community'
import styled from 'styled-components'
import { FilterList } from '../Filter'
import { PageBar } from '../PageBar'
import { ButtonPrimary } from '../Button'
import { Colors } from '../../constants/styles'
import { VotingCard } from './VotingCard'
import { Search } from '../Input'
import { useContractCall } from '@usedapp/core'
import { VotingSortingOptions } from '../../constants/SortingOptions'
import { useContracts } from '../../hooks/useContracts'

export function VotingCards() {
  const { votingContract } = useContracts()
  const [sortedBy, setSortedBy] = useState(VotingSortingEnum.EndingSoonest)
  const [voteType, setVoteType] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')

  const [roomList] = useContractCall({
    abi: votingContract.interface,
    address: votingContract.address,
    method: 'getActiveVotingRooms',
    args: [],
  }) ?? [[]]
  return (
    <div>
      <PageBar>
        <Search
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
      {roomList.map((room: any) => (
        <VotingCard key={room.toString()} room={Number(room.toString())} />
      ))}
    </div>
  )
}

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
