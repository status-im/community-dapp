import React from 'react'
import styled from 'styled-components'
import { Colors } from '../constants/styles'
import { ButtonSecondary } from '../components/Button'
import externalIcon from '../assets/images/ext.svg'
import indicatorIcon from '../assets/images/indicator.svg'

interface CardCommunityProps {
  img: string
  heading: string
  text: string
  tags: string[]
}

export const CardCommunity = ({ img, heading, text, tags }: CardCommunityProps) => (
  <CardInfoBlock>
    <Community>
      <CardLogo src={img} alt={`${heading} logo`} />
      <CommunityInfo>
        <CardHeading>{heading}</CardHeading>
        <CardText>{text}</CardText>
        <CardTags>
          {tags.map((tag) => (
            <Tag>
              <p>{tag}</p>
            </Tag>
          ))}
        </CardTags>
      </CommunityInfo>
    </Community>

    <CardLinks>
      <CardLinkExternal>Visit community</CardLinkExternal>
      <CardLinkExternal>View on Etherscan</CardLinkExternal>
      <CardLinkInternal>Voting history</CardLinkInternal>
    </CardLinks>
  </CardInfoBlock>
)

function addCommas(votes: number) {
  return votes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

interface CardVoteProps {
  voteHeading: string
  votesAgainst: number
  votesFor: number
  votesAgainstIcon: string
  votesForIcon: string
  votesAgainstText: string
  votesForText: string
  timeLeft: string
  voteWinner?: number
}

export const CardVote = ({
  voteHeading,
  votesAgainst,
  votesFor,
  votesAgainstIcon,
  votesForIcon,
  votesAgainstText,
  votesForText,
  timeLeft,
  voteWinner,
}: CardVoteProps) => (
  <CardVoteBlock>
    <CardHeading>{voteHeading}</CardHeading>
    <Votes>
      <VotesChart>
        <VoteBox style={{ filter: voteWinner && voteWinner === 2 ? 'grayscale(1)' : 'none' }}>
          <p style={{ fontSize: voteWinner === 1 ? '42px' : '24px' }}>{votesAgainstIcon}</p>
          <span>
            {' '}
            {addCommas(votesAgainst)} <span style={{ fontWeight: 'normal' }}>SNT</span>
          </span>
        </VoteBox>
        <TimeLeft>{timeLeft}</TimeLeft>
        <VoteBox style={{ filter: voteWinner && voteWinner === 1 ? 'grayscale(1)' : 'none' }}>
          <p style={{ fontSize: voteWinner === 2 ? '42px' : '24px' }}>{votesForIcon}</p>
          <span>
            {' '}
            {addCommas(votesFor)} <span style={{ fontWeight: 'normal' }}>SNT</span>
          </span>
        </VoteBox>
      </VotesChart>

      <VoteGraphBar votesFor={votesFor} votesAgainst={votesAgainst} voteWinner={voteWinner} />
    </Votes>

    {voteWinner ? (
      <VoteBtnFinal>
        Finalize the vote <span>✍️</span>
      </VoteBtnFinal>
    ) : (
      <VotesBtns>
        <VoteBtn>
          {votesAgainstText} <span>{votesAgainstIcon}</span>
        </VoteBtn>
        <VoteBtn>
          {votesForText} <span>{votesForIcon}</span>
        </VoteBtn>
      </VotesBtns>
    )}
  </CardVoteBlock>
)

interface VoteGraphBarProps {
  votesAgainst: number
  votesFor: number
  voteWinner?: number
}

export function VoteGraphBar({ votesFor, votesAgainst, voteWinner }: VoteGraphBarProps) {
  return (
    <VoteGraph
      style={{
        backgroundColor: voteWinner && voteWinner === 1 ? `${Colors.GrayDisabledLight}` : `${Colors.BlueBar}`,
      }}
    >
      <VoteGraphAgainst
        style={{
          width: calculateWidth(votesFor, votesAgainst) + '%',
          backgroundColor: voteWinner && voteWinner === 2 ? `${Colors.GrayDisabledLight}` : `${Colors.Orange}`,
        }}
      />
    </VoteGraph>
  )
}

function calculateWidth(votesFor: number, votesAgainst: number) {
  return (100 * votesAgainst) / (votesFor + votesAgainst)
}

export const Card = styled.div`
  display: flex;
  align-items: center;
`

const CardInfoBlock = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 16px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 6px 0px 0px 6px;
`

const Community = styled.div`
  display: flex;
  margin-bottom: 16px;
`

const CommunityInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const CardLogo = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: 16px;
`
const CardHeading = styled.h2`
  font-weight: bold;
  font-size: 17px;
  line-height: 24px;
`
const CardText = styled.p`
  line-height: 22px;
  margin: 8px 0;
`

const CardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const Tag = styled.div`
  padding: 0 10px;
  border: 1px solid ${Colors.VioletDark};
  box-sizing: border-box;
  border-radius: 10px;
  color: ${Colors.VioletDark};
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
`
const CardLinks = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 15px;
  line-height: 22px;
`
const CardLinkExternal = styled.a`
  color: ${Colors.BlueLink};
  position: relative;
  padding-right: 20px;

  &:hover {
    text-decoration: underline;
  }

  &:active {
    text-decoration: none;
  }

  &::after {
    content: '';
    width: 11px;
    height: 11px;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-image: url(${externalIcon});
  }
`
const CardLinkInternal = styled.a`
  color: ${Colors.VioletDark};
  font-weight: 500;

  &:hover {
    color: ${Colors.Violet};
  }

  &:active {
    color: ${Colors.VioletDark};
  }
`
const CardVoteBlock = styled.div`
  width: 50%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: 24px 24px 32px;
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
`

const Votes = styled.div`
  display: flex;
  flex-direction: column;
  margin: 48px 0 32px;
`
const VotesChart = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 13px;
`

const VoteBox = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  max-width: 100px;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  font-weight: normal;

  & > p {
    font-size: 24px;
    line-height: 24px;
    margin-bottom: 8px;
  }

  & > span {
    font-weight: bold;
  }
`

const TimeLeft = styled.p`
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1px;
  color: ${Colors.GreyText};
`

const VoteGraph = styled.div`
  position: relative;
  width: 100%;
  height: 16px;
  background-color: ${Colors.BlueBar};
  border-radius: 10px;
  padding-top: 5px;

  &::before {
    content: '';
    width: 16px;
    height: 5px;
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    background-image: url(${indicatorIcon});
    background-size: cover;
  }
`

const VoteGraphAgainst = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 13px;
  height: 16px;
  background-color: ${Colors.Orange};
  border-right: 2px solid ${Colors.VioletLight};
  border-radius: 10px 0 0 10px;
  z-index: 2;
`

const VotesBtns = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
const VoteBtn = styled(ButtonSecondary)`
  padding: 11px 46px;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  color: ${Colors.VioletDark};

  & > span {
    font-size: 20px;
  }
`
const VoteBtnFinal = styled(VoteBtn)`
  width: 100%;
`
