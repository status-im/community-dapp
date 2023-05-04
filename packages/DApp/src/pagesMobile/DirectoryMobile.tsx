import React, { useState } from 'react'
import { DirectoryCard } from '../components/directory/DirectoryCard'
import { TopBarMobile } from '../componentsMobile/TopBarMobile'
import { useDirectoryCommunities } from '../hooks/useDirectoryCommunities'
import { DirectorySortingEnum } from '../models/community'
import styled from 'styled-components'
import { Search } from '../components/Input'
import { DirectorySortingOptions } from '../constants/SortingOptions'
import { SearchEmpty } from '../components/SearchEmpty'
// import { WeeklyFeature } from '../components/WeeklyFeature'
import { FilterList } from '../components/Filter'
import { useHistory } from 'react-router'
import { DirectorySkeletonMobile } from '../componentsMobile/DirectorySkeletonMobile'

export function DirectoryMobile() {
  const [filterKeyword, setFilterKeyword] = useState('')
  const [sortedBy, setSortedBy] = useState(DirectorySortingEnum.IncludedRecently)
  const [communities, publicKeys] = useDirectoryCommunities(filterKeyword, sortedBy)
  const history = useHistory()

  const renderCommunities = () => {
    if (!publicKeys) {
      return null
    }

    if (publicKeys.length === 0) {
      return <SearchEmpty />
    }

    if (communities.length === 0) {
      return publicKeys.map((publicKey: string) => {
        return <DirectorySkeletonMobile key={publicKey} />
      })
    }

    return communities.map((community) => (
      <div key={community!.publicKey} onClick={() => history.push(`/feature/${community!.publicKey}`)}>
        <DirectoryCard community={community!} />
      </div>
    ))
  }

  return (
    <div>
      <TopBarMobile
        heading="Current directory"
        text="Vote on your favourite communities being included in
       Weekly Featured Communities"
        type={1}
      >
        <PageBar>
          <Search
            type="text"
            placeholder="Search communities..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.currentTarget.value)}
          />
          <FilterList value={sortedBy} setValue={setSortedBy} options={DirectorySortingOptions} />
        </PageBar>
      </TopBarMobile>
      <Voting>
        {/* <WeeklyFeature endDate={new Date('07/26/2021')} /> */}
        {renderCommunities()}
      </Voting>
    </div>
  )
}

const Voting = styled.div`
  padding: 256px 16px 16px;

  @media (max-width: 556px) {
    padding-top: 266px;
  }

  display: flex;
  flex-direction: column;
`

const PageBar = styled.div`
  justify-content: space-between;
  align-items: center;
  display: flex;
  width: 100%;
  padding: 24px 0 16px;
  background: #fff;
  padding: 16px;
  box-shadow: 0px 6px 6px -6px rgba(0, 0, 0, 0.15);
`
