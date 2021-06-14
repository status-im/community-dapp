import React from 'react'
import styled from 'styled-components'
import { Colors } from '../../constants/styles'
import { addCommas } from '../../helpers/addCommas'
import { LinkInternal } from '../Link'
import rightIcon from '../../assets/images/arrowRight.svg'
import { CardHeading, CardVoteBlock, VoteBtn } from '../Card'

interface CardFeatureProps {
  heading: string
  text: string
  icon: string
  sum?: number
  timeLeft?: string
  voting?: boolean
}

export const CardFeature = ({ heading, text, icon, sum, timeLeft, voting }: CardFeatureProps) => (
  <CardVoteBlock style={{ backgroundColor: `${Colors.GrayLight}` }}>
    <FeatureTop>
      <CardHeading>{heading}</CardHeading>
      {voting && <CardLinkFeature>Ongoing vote for removal</CardLinkFeature>}
    </FeatureTop>

    <FeatureVote>
      <p>{text}</p>
      <p style={{ fontSize: '24px' }}>{icon}</p>

      {timeLeft && <span>{timeLeft}</span>}

      {sum && <span style={{ fontWeight: 'normal' }}>{addCommas(sum)} SNT</span>}
    </FeatureVote>
    <FeatureBtn disabled={Boolean(timeLeft)}>
      Feature this community! <span style={{ fontSize: '20px' }}>⭐️</span>
    </FeatureBtn>
  </CardVoteBlock>
)

const CardLinkFeature = styled(LinkInternal)`
  padding-right: 28px;
  font-size: 12px;
  line-height: 20px;
  position: relative;

  &::after {
    content: '';
    width: 24px;
    height: 24px;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-image: url(${rightIcon});
    background-size: cover;
  }
`
const FeatureTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const FeatureBtn = styled(VoteBtn)`
  width: 100%;
`
const FeatureVote = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 45px auto 32px;
  max-width: 290px;
  text-align: center;

  & > p {
    font-size: 17px;
    line-height: 18px;
    margin-bottom: 8px;
  }

  & > span {
    font-weight: bold;
    font-size: 15px;
    line-height: 22px;
  }
`
