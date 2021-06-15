import React, { useState } from 'react'
import { Card, CardCommunity, CardVote } from '../Card'
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

interface VotingCardProps {
  community: CommunityDetail
}

function VotingCard({ community }: VotingCardProps) {
  let heading =
    community.currentVoting?.type === 'Add' ? 'Add to Communities directory?' : 'Remove from Communities directory?'
  let winner: number | undefined = undefined
  if (community.currentVoting?.timeLeft === 0) {
    winner = community.currentVoting.voteAgainst > community.currentVoting.voteFor ? 2 : 1
    if (community.currentVoting?.type === 'Add') {
      heading = winner === 1 ? 'not to add' : 'to add'
    } else {
      heading = winner === 1 ? 'to keep' : 'to remove'
    }
  }
  return (
    <Card>
      <CardCommunity community={community} />
      <CardVote
        voteWinner={winner}
        voteHeading={heading}
        votesAgainst={community?.currentVoting?.voteAgainst.toNumber() || 0}
        votesFor={community?.currentVoting?.voteFor.toNumber() || 0}
        votesAgainstIcon={community.currentVoting?.type === 'Add' ? '👎' : '📌'}
        votesForIcon={community.currentVoting?.type === 'Add' ? '👍' : '🗑'}
        votesAgainstText={community.currentVoting?.type === 'Add' ? "Don't add" : 'Keep'}
        votesForText={community.currentVoting?.type === 'Add' ? 'Add' : 'Remove'}
        timeLeft={(community.currentVoting?.timeLeft || 0) / 3600 + ' hours left'}
        availableAmount={65245346}
      />
    </Card>
  )
}

export function VotingCards() {
  const [sortedBy, setSortedBy] = useState(VotingSortingEnum.EndingSoonest)
  const { communities, loading } = useCommunities(getCommunitiesUnderVote, { numberPerPage: 2, sortedBy })

  return (
    <div>
      <PageBar>
        <VoteFilter>
          <span>Vote types:</span>
          <VoteType>Add</VoteType>
          <VoteType>Remove</VoteType>
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
`
