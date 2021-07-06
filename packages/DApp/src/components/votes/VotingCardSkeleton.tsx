import React from 'react'
import styled from 'styled-components'
import { Card, CardCommunityWrap, CardVoteBlock, CardVoteWrap } from '../Card'
import { CommunitySkeleton } from '../skeleton/CommunitySkeleton'
import { Skeleton } from '../skeleton/Skeleton'

export const VotingCardSkeleton = () => {
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
      </CardVoteWrap>
    </Card>
  )
}

const CardHeader = styled.div`
  display: flex;
  justify-content: center;
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
