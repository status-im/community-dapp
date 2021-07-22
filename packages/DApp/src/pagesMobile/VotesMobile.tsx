import React, { useState } from 'react'
import { FilterList } from '../components/Filter'
import { Search } from '../components/Input'
import { SearchEmpty } from '../components/SearchEmpty'
import { VoteFilter } from '../components/votes/VoteFilter'
import { VotingEmpty } from '../components/votes/VotingEmpty'
import { TopBarMobile } from '../componentsMobile/TopBarMobile'
import { useVotingCommunities } from '../hooks/useVotingCommunities'
import { VotingSortingEnum } from '../models/community'
import styled from 'styled-components'
import { VotingCardSkeleton } from '../components/votes/VotingCardSkeleton'
import { VotingSortingOptions } from '../constants/SortingOptions'
import { VotingCardCover } from '../componentsMobile/VotingCardCover'
import { ButtonPrimary } from '../components/Button'
import { useHistory } from 'react-router'

export function VotesMobile() {
  const [sortedBy, setSortedBy] = useState(VotingSortingEnum.EndingSoonest)
  const [voteType, setVoteType] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')
  const { roomsToShow, empty } = useVotingCommunities(filterKeyword, voteType, sortedBy)
  const history = useHistory()
  return (
    <div>
      <TopBarMobile
        heading="Ongoing Votes"
        text="Help curate the Status Communities directory by voting which communities should be included"
        type={0}
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
            return <VotingCardCover key={idx} room={room} />
          } else {
            return <VotingCardSkeleton key={idx} />
          }
        })}
        {roomsToShow.length === 0 && empty && <VotingEmpty />}
        {roomsToShow.length === 0 && !empty && <SearchEmpty />}
      </VotingCardsWrapper>
      <ProposeButtonWrapper>
        <ProposeButton onClick={() => history.push('/propose')}>Propose community</ProposeButton>
      </ProposeButtonWrapper>
    </div>
  )
}

const ProposeButton = styled(ButtonPrimary)`
  margin: auto;
  width: 100%;
  padding: 10px 0;
  text-align: center;
`
const ProposeButtonWrapper = styled.div`
  display: flex;
  position: fixed;
  padding: 0 16px;
  bottom: 15px;
  width: 100%;
`

const VotingCardsWrapper = styled.div`
  padding: 307px 16px 16px;

  @media (max-width: 340px) {
    padding-top: 320px;
  }
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
