import React, { useEffect, useState } from 'react'
import { Card, CardCommunity, CardVote } from '../Card'
import { getCommunitiesUnderVote } from '../../helpers/apiMock'
import { CommunityDetail, VotingSortingEnum } from '../../models/community'
import styled from 'styled-components'
import { Filter } from '../Filter'
import { Search } from '../Input'
import { PageBar } from '../PageBar'

export function VotingCards() {
  const [searchField, setSearchField] = useState('')
  const [sortingType, setSortingType] = useState(VotingSortingEnum.EndingSoonest)
  const [communities, setCommunities] = useState<CommunityDetail[]>([])
  const [page, setPage] = useState(0)
  const [increment, setIncrement] = useState(true)

  const handleScroll = (e: Event) => {
    if (e.target) {
      const scrollingElement = (e.target as HTMLDocument).scrollingElement
      if (!scrollingElement?.scrollHeight || !scrollingElement?.scrollHeight || !scrollingElement?.scrollHeight) {
        return
      }
      if (scrollingElement.scrollHeight - scrollingElement.scrollTop <= scrollingElement.clientHeight + 10) {
        if (increment) {
          setPage((prevPage) => prevPage + 1)
        }
      }
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [page])

  useEffect(() => {
    setPage(0)
    setIncrement(true)
    setCommunities(getCommunitiesUnderVote(2, 0, sortingType, searchField).communities)
  }, [searchField, sortingType])

  useEffect(() => {
    if (page === 0) return
    const newCommunities = getCommunitiesUnderVote(2, page, sortingType, searchField).communities
    if (newCommunities.length === 0) {
      setIncrement(false)
    }
    setCommunities((oldCommunities) => [...oldCommunities, ...newCommunities])
  }, [page])

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
          <option value={VotingSortingEnum.EndingSoonest}>Ending Soonest</option>
          <option value={VotingSortingEnum.EndingLatest}>Ending Latest</option>
          <option value={VotingSortingEnum.AtoZ}>A to Z</option>
          <option value={VotingSortingEnum.ZtoA}>Z to A</option>
          <option value={VotingSortingEnum.LeastVotes}>Least Votes</option>
          <option value={VotingSortingEnum.MostVotes}>Most Votes</option>
        </Filter>
      </PageBar>

      <Voting>
        {communities.map((community) => {
          let heading =
            community.currentVoting?.type === 'Add'
              ? 'Add to Communities directory?'
              : 'Remove from Communities directory?'
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
            <Card key={community.publicKey}>
              <CardCommunity
                img={community.icon}
                heading={community.name}
                text={community.description}
                tags={community.tags}
              />
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
              />
            </Card>
          )
        })}
      </Voting>
    </div>
  )
}

const Voting = styled.div`
  display: flex;
  flex-direction: column;
`
