import React from 'react'
import styled from 'styled-components'
import { Card, CardCommunityWrap, CardLinks, CardVoteBlock } from '../Card'
import { LinkExternal, LinkInternal } from '../Link'
import { Skeleton } from '../skeleton/Skeleton'
import { TagsSkeletonList } from '../skeleton/TagSkeleton'
import { TextBlock } from '../skeleton/TextSkeleton'

export const VotingCardSkeleton = () => {
  return (
    <Card>
      <CardCommunityWrap>
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
      </CardCommunityWrap>
      <CardVoteBlock>
        <CardHeader>
          <Skeleton width="50%" />
        </CardHeader>
        <Row>
          <div>
            <span>❓</span>
            <Skeleton width="90px" height="16px" />
          </div>
          <div>
            <Skeleton width="43px" height="8px" />
          </div>
          <div>
            <span>❓</span>
            <Skeleton width="90px" height="16px" />
          </div>
        </Row>
        <ProgressSkeleton />
        <ButtonsRow>
          <SkeletonButton />
          <SkeletonButton />
        </ButtonsRow>
      </CardVoteBlock>
    </Card>
  )
}

const CardRow = styled.div`
  display: flex;
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

const CardHeader = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 54px;
`

const ProgressSkeleton = styled(Skeleton)`
  height: 16px;
  margin: 12px 0 32px;
`

const ButtonsRow = styled.div`
  display: flex;
`

const SkeletonButton = styled(Skeleton)`
  height: 44px;

  & + & {
    margin-left: 46px;
  }
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;

  & > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    span {
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 8px;
      mix-blend-mode: luminosity;
    }
  }
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
