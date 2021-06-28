import React, { useState } from 'react'
import { VotingSortingEnum } from '../../models/community'
import styled from 'styled-components'
import { FilterList } from '../Filter'
import { PageBar } from '../PageBar'
import { ButtonSecondary } from '../Button'
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
