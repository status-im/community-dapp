import React from 'react'
import styled from 'styled-components'
import { SearchEmpty } from '../SearchEmpty'
import { useFeaturedCommunities } from '../../hooks/useFeaturedCommunities'
import { DirectoryCard } from '../directory/DirectoryCard'
import { DirectoryCardSkeleton } from '../directory/DirectoryCardSkeleton'

export function FeaturedCards() {
  const [communities, publicKeys] = useFeaturedCommunities()

  const renderCommunities = () => {
    if (!publicKeys) {
      return null
    }

    if (publicKeys.length === 0) {
      return <SearchEmpty />
    }

    if (communities.length === 0) {
      return publicKeys.map((publicKey: string) => {
        return <DirectoryCardSkeleton key={publicKey} />
      })
    }

    return communities.map((community) => <DirectoryCard key={community!.publicKey} community={community!} />)
  }

  return (
    <>
      <Voting>{renderCommunities()}</Voting>
    </>
  )
}

const Voting = styled.div`
  display: flex;
  flex-direction: column;
`
