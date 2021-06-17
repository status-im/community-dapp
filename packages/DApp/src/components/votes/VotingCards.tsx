import React, { useState } from 'react'
import { Card, CardCommunity, CardCommunityWrap, CardVote } from '../Card'
import { getCommunitiesUnderVote } from '../../helpers/apiMock'
import { CommunityDetail, VotingSortingEnum } from '../../models/community'
import styled from 'styled-components'
import { FilterList } from '../Filter'
import { PageBar } from '../PageBar'
import { useCommunities } from '../hooks/useCommunities'
import { VotingSortingOptions } from '../../constants/SortingOptions'
import { ButtonSecondary } from '../Button'
import { Colors } from '../../constants/styles'
import { SpinnerIcon } from '../../assets/animatedIcons/spinnerIcon'
import { useConfig } from '../../providers/config'
import { toggleField } from './../../helpers/objectOperations'

interface VotingCardProps {
  community: CommunityDetail
}

function VotingCard({ community }: VotingCardProps) {
  return (
    <Card>
      <CardCommunityWrap>
        {' '}
        <CardCommunity community={community} />
      </CardCommunityWrap>

      <CardVote community={community} />
    </Card>
  )
}

export function VotingCards() {
  const { config } = useConfig()
  const [sortedBy, setSortedBy] = useState(VotingSortingEnum.EndingSoonest)
  const [types, setTypes] = useState({
    Add: true,
    Remove: true,
  })
  const { communities, loading } = useCommunities(getCommunitiesUnderVote, {
    numberPerPage: config.numberPerPage,
    sortedBy,
    types,
  })

  return (
    <div>
      <PageBar>
        <VoteFilter>
          <span>Vote types:</span>
          <VoteType
            className={types['Add'] ? 'selected' : 'notSelected'}
            onClick={() => setTypes((prev) => toggleField(prev, 'Add'))}
          >
            Add
          </VoteType>
          <VoteType
            className={types['Remove'] ? 'selected' : 'notSelected'}
            onClick={() => setTypes((prev) => toggleField(prev, 'Remove'))}
          >
            Remove
          </VoteType>
        </VoteFilter>
        <FilterList value={sortedBy} setValue={setSortedBy} options={VotingSortingOptions} />
      </PageBar>
      <Voting>
        {communities.map((community) => (
          <VotingCard key={community.publicKey} community={community} />
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

const VoteFilter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 257px;
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
