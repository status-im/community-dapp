import React from 'react'
import { DirectoryCard } from '../components/directory/DirectoryCard'
import { TopBarMobile } from '../componentsMobile/TopBarMobile'
import styled from 'styled-components'
import { SearchEmpty } from '../components/SearchEmpty'
import { useHistory } from 'react-router'
import { DirectorySkeletonMobile } from '../componentsMobile/DirectorySkeletonMobile'
import { useFeaturedCommunities } from '../hooks/useFeaturedCommunities'

export function FeaturedMobile() {
  const [communities, publicKeys] = useFeaturedCommunities()
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
      <TopBarMobile heading="Featured communities" text="Weekly Featured Communities" type={1}></TopBarMobile>
      <Voting>{renderCommunities()}</Voting>
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
