import React, { useEffect, useState } from 'react'
import { VotingSortingEnum } from '../../models/community'
import styled from 'styled-components'
import { FilterList } from '../Filter'
import { PageBar } from '../PageBar'
import { VotingCard } from './VotingCard'
import { Search } from '../Input'
import { VotingSortingOptions } from '../../constants/SortingOptions'
import { VotingCardSkeleton } from './VotingCardSkeleton'
import { useVotingCommunities } from '../../hooks/useVotingCommunities'
import { VotingEmpty } from './VotingEmpty'
import { SearchEmpty } from '../SearchEmpty'
import { VoteFilter } from './VoteFilter'
import { VoteFilterMobile } from '../../componentsMobile/VoteFilterMobile'
import { VotingCardMobile } from '../../componentsMobile/VotingCardMobile'

export function VotingCards() {
  const [sortedBy, setSortedBy] = useState(VotingSortingEnum.EndingSoonest)
  const [voteType, setVoteType] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')
  const { roomsToShow, empty } = useVotingCommunities(filterKeyword, voteType, sortedBy)

  const [mobileVersion, setMobileVersion] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setMobileVersion(true)
      } else {
        setMobileVersion(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div>
      <PageBar>
        <VoteBar>
          <PageDesktopBar>
            <Search
              type="text"
              placeholder="Search communities..."
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.currentTarget.value)}
            />
            <VoteFilter voteType={voteType} setVoteType={setVoteType} />
            <FilterList value={sortedBy} setValue={setSortedBy} options={VotingSortingOptions} />
          </PageDesktopBar>
          <VoteFilterMobile voteType={voteType} setVoteType={setVoteType} />
        </VoteBar>
      </PageBar>
      {roomsToShow.map((room: any, idx) => {
        if (room?.details) {
          return mobileVersion ? <VotingCardMobile key={idx} room={room} /> : <VotingCard key={idx} room={room} />
        } else {
          return <VotingCardSkeleton key={idx} />
        }
      })}
      {roomsToShow.length === 0 && empty && <VotingEmpty />}
      {roomsToShow.length === 0 && !empty && <SearchEmpty />}
    </div>
  )
}
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
`
