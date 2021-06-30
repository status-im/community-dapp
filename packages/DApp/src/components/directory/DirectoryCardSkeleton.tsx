import React from 'react'
import styled from 'styled-components'
import { ColumnFlexDiv } from '../../constants/styles'
import { Card, CardCommunityWrap, CardVoteBlock, CardVoteWrap } from '../Card'
import { CommunitySkeleton } from '../skeleton/CommunitySkeleton'
import { Skeleton } from '../skeleton/Skeleton'

export const DirectoryCardSkeleton = () => {
  return (
    <Card>
      <CardCommunityWrap>
        <CommunitySkeleton />
      </CardCommunityWrap>
      <CardVoteWrap>
        <CardVoteBlock>
          <CardHeader>
            <Skeleton width="50%" />
          </CardHeader>
          <Column>
            <Skeleton width="160px" height="18px" />
            <span>⭐️</span>
            <Skeleton width="120px" height="22px" />
          </Column>
          <SkeletonButton />
        </CardVoteBlock>
      </CardVoteWrap>
    </Card>
  )
}

const CardHeader = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 54px;
`

const SkeletonButton = styled(Skeleton)`
  height: 44px;
`

const Column = styled(ColumnFlexDiv)`
  justify-content: space-between;
  height: 80px;
  margin-bottom: 32px;

  span {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;
    mix-blend-mode: luminosity;
  }
`
