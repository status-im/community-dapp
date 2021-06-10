import React, { useState } from 'react'
import { Card, CardCommunity, CardFeature } from '../Card'
import styled from 'styled-components'
import { CommunityDetail, DirectorySortingEnum } from '../../models/community'
import { useCommunities } from '../hooks/useCommunities'
import { getCommunitiesInDirectory } from '../../helpers/apiMock'
import { Filter } from '../Filter'
import { Search } from '../Input'
import { PageBar } from '../PageBar'

interface DirectoryCardProps {
  community: CommunityDetail
}

function DirectoryCard({ community }: DirectoryCardProps) {
  if (!community.directoryInfo) {
    return <div />
  }
  let timeLeft: string | undefined = undefined
  if (community.directoryInfo.untilNextFeature) {
    timeLeft = `${community.directoryInfo.untilNextFeature / (3600 * 24 * 7)} weeks left`
  }
  return (
    <Card>
      <CardCommunity community={community} />
      <CardFeature
        heading="Feature this community?"
        text={timeLeft ? 'This community has to wait until it can be featured again' : 'Weekly Feature vote'}
        icon={timeLeft ? '⏳' : '⭐'}
        sum={community.directoryInfo.featureVotes?.toNumber()}
        voting={Boolean(community.currentVoting)}
        timeLeft={timeLeft}
      />
    </Card>
  )
}

export function DirectoryCards() {
  const [searchField, setSearchField] = useState('')
  const [sortingType, setSortingType] = useState(DirectorySortingEnum.IncludedRecently)
  const communities = useCommunities(getCommunitiesInDirectory, searchField, sortingType)
  console.log(communities)
  return (
    <div>
      <PageBar>
        <Search
          type="text"
          placeholder="Search communities..."
          value={searchField}
          onChange={(e) => setSearchField(e.currentTarget.value)}
        />
        <Filter value={sortingType} onChange={(e) => setSortingType(parseInt(e.currentTarget.value))}>
          <option value={DirectorySortingEnum.IncludedRecently}>Included Recently</option>
          <option value={DirectorySortingEnum.IncludedLongAgo}>Included Long Ago</option>
          <option value={DirectorySortingEnum.AtoZ}>A to Z</option>
          <option value={DirectorySortingEnum.ZtoA}>Z to A</option>
          <option value={DirectorySortingEnum.LeastVotes}>Least Votes</option>
          <option value={DirectorySortingEnum.MostVotes}>Most Votes</option>
        </Filter>
      </PageBar>
      <Voting>
        {communities.map((community) => (
          <DirectoryCard key={community.publicKey} community={community} />
        ))}
      </Voting>
    </div>
  )
}

const Voting = styled.div`
  display: flex;
  flex-direction: column;
`
