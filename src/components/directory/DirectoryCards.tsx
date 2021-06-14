import React, { useState } from 'react'
import { Card, CardCommunity } from '../Card'
import { CardFeature } from '../card/CardFeature'
import styled from 'styled-components'
import { CommunityDetail, DirectorySortingEnum } from '../../models/community'
import { useCommunities } from '../hooks/useCommunities'
import { getCommunitiesInDirectory } from '../../helpers/apiMock'
import { FilterList } from '../Filter'
import { Search } from '../Input'
import { PageBar } from '../PageBar'
import { DirectorySortingOptions } from '../../constants/SortingOptions'
import { SpinnerIcon } from '../../assets/animatedIcons/spinnerIcon'

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
  const [filterKeyword, setFilterKeyword] = useState('')
  const [sortedBy, setSortedBy] = useState(DirectorySortingEnum.IncludedRecently)
  const { communities, loading } = useCommunities(getCommunitiesInDirectory, {
    numberPerPage: 2,
    sortedBy,
    filterKeyword,
  })

  return (
    <div>
      <PageBar>
        <Search
          type="text"
          placeholder="Search communities..."
          value={filterKeyword}
          onChange={(e) => setFilterKeyword(e.currentTarget.value)}
        />
        <FilterList value={sortedBy} setValue={setSortedBy} options={DirectorySortingOptions} />
      </PageBar>
      <Voting>
        {communities.map((community) => (
          <DirectoryCard key={community.publicKey} community={community} />
        ))}
      </Voting>
      {loading && (
        <IconWrapper>
          <SpinnerIcon />
        </IconWrapper>
      )}
    </div>
  )
}

const IconWrapper = styled.div`
  height: 64px;
  width: 64px;
  margin: 100px;
  margin-left: calc(50% - 32px);
`

const Voting = styled.div`
  display: flex;
  flex-direction: column;
`
