import React, { useState } from 'react'
import { FilterList } from '../components/Filter'
import { Search } from '../components/Input'
import { SearchEmpty } from '../components/SearchEmpty'
import { VoteFilter } from '../components/votes/VoteFilter'
import { VotingCard } from '../components/votes/VotingCard'
import { VotingEmpty } from '../components/votes/VotingEmpty'
import { TopBarMobile } from '../componentsMobile/TopBarMobile'
import { useVotingCommunities } from '../hooks/useVotingCommunities'
import { VotingSortingEnum } from '../models/community'
import styled from 'styled-components'
import { VotingCardSkeleton } from '../components/votes/VotingCardSkeleton'
import { VotingSortingOptions } from '../constants/SortingOptions'

export function VotesMobile() {
  const [sortedBy, setSortedBy] = useState(VotingSortingEnum.EndingSoonest)
  const [voteType, setVoteType] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')
  const { roomsToShow, empty } = useVotingCommunities(filterKeyword, voteType, sortedBy)

  return (
    <div>
      <TopBarMobile
        heading="Ongoing Votes"
        text="Help curate the Status Communities directory by voting which communities should be included"
      >
        <VoteBar>
          <PageDesktopBar>
            <Search
              type="text"
              placeholder="Search communities..."
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.currentTarget.value)}
            />
            <FilterList value={sortedBy} setValue={setSortedBy} options={VotingSortingOptions} />
          </PageDesktopBar>
          <VoteFilter voteType={voteType} setVoteType={setVoteType} />
        </VoteBar>
      </TopBarMobile>
      <VotingCardsWrapper>
        {roomsToShow.map((room: any, idx) => {
          if (room?.details) {
            return <VotingCard key={idx} room={room} />
          } else {
            return <VotingCardSkeleton key={idx} />
          }
        })}
        {roomsToShow.length === 0 && empty && <VotingEmpty />}
        {roomsToShow.length === 0 && !empty && <SearchEmpty />}
      </VotingCardsWrapper>
    </div>
  )
}

const VotingCardsWrapper = styled.div`
  padding-top: 310px;
`
const PageDesktopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  width: 100%;
`

const VoteBar = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px 0 16px;
  background: #fff;
  padding: 16px;
  box-shadow: 0px 6px 6px -6px rgba(0, 0, 0, 0.15);
`
