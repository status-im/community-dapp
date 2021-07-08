import React from 'react'
import styled from 'styled-components'
import { CardCommunityBlock, CardLinks } from '../card/CardCommunity'
import { LinkExternal, LinkInternal } from '../Link'
import { Skeleton } from '../skeleton/Skeleton'
import { TagsSkeletonList } from '../skeleton/TagSkeleton'
import { TextBlock } from '../skeleton/TextSkeleton'

export const CommunitySkeleton = () => {
  return (
    <CardCommunityBlock>
      {' '}
      <CardRow>
        <AvatarSkeleton />
        <CardContent>
          <TitleSkeleton />
          <TextBlock />
          <TagsSkeleton />
        </CardContent>
      </CardRow>
      <CardLinks>
        <StyledExternalLink>Visit community</StyledExternalLink>
        <StyledExternalLink>Etherscan</StyledExternalLink>
        <StyledInternalink>Voting history </StyledInternalink>
      </CardLinks>
    </CardCommunityBlock>
  )
}

const CardRow = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 48px;
`

const CardContent = styled.div`
  width: 100%;
`

const AvatarSkeleton = styled(Skeleton)`
  min-width: 64px;
  min-height: 64px;
  max-width: 64px;
  max-height: 64px;
  border-radius: 50%;
  margin-right: 16px;
`

const TitleSkeleton = styled(Skeleton)`
  height: 12px;
  max-width: 50%;
  margin-bottom: 16px;
`

const TagsSkeleton = styled(TagsSkeletonList)`
  margin-top: 16px;
`

const StyledExternalLink = styled(LinkExternal)`
  color: #656565;

  &::after {
    mix-blend-mode: luminosity;
  }
`

const StyledInternalink = styled(LinkInternal)`
  color: #525252;
`
