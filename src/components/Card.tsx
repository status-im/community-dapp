import React, { useState } from 'react'
import styled from 'styled-components'
import { Colors } from '../constants/styles'
import { ButtonSecondary } from '../components/Button'
import { CommunityDetail } from '../models/community'
import { LinkExternal, LinkInternal } from './Link'
import { Modal } from './Modal'
import { CardModal } from './card/CardModal'
import { VoteChart } from './votes/VoteChart'

interface CardCommunityProps {
  community: CommunityDetail
}

export const CardCommunity = ({ community }: CardCommunityProps) => (
  <CardInfoBlock>
    <Community>
      <CardLogo src={community.icon} alt={`${community.name} logo`} />
      <CommunityInfo>
        <CardHeading>{community.name}</CardHeading>
        <CardText>{community.description}</CardText>
        <CardTags>
          {community.tags.map((tag, key) => (
            <Tag key={key}>
              <p>{tag}</p>
            </Tag>
          ))}
        </CardTags>
      </CommunityInfo>
    </Community>

    <CardLinks>
      <LinkExternal>Visit community</LinkExternal>
      <LinkExternal>View on Etherscan</LinkExternal>
      <LinkInternal>Voting history</LinkInternal>
    </CardLinks>
  </CardInfoBlock>
)

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
  availableAmount: number
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
  availableAmount,
}: CardVoteProps) => {
  const [showModal, setShowModal] = useState(false)
  const [votesModalText, setVotesModalText] = useState('')
  const [voteTypeModal, setVoteTypeModal] = useState('')

  return (
    <CardVoteBlock>
      {voteWinner ? (
        <CardHeadingEndedVote>
          SNT holders have decided{' '}
          <b>
            <u>{voteHeading}</u>
          </b>{' '}
          this community to the directory!
        </CardHeadingEndedVote>
      ) : (
        <CardHeading>{voteHeading}</CardHeading>
      )}
      <VoteChart
        votesAgainst={votesAgainst}
        votesFor={votesFor}
        votesAgainstIcon={votesAgainstIcon}
        votesForIcon={votesForIcon}
        timeLeft={timeLeft}
        voteWinner={voteWinner}
      />

      {voteWinner ? (
        <VoteBtnFinal>
          Finalize the vote <span>✍️</span>
        </VoteBtnFinal>
      ) : (
        <VotesBtns>
          {showModal && (
            <Modal heading={voteTypeModal === 'for' ? 'Add ?' : 'Remove ?'} setShowModal={setShowModal}>
              <CardModal
                voteType={voteTypeModal}
                votesAgainst={votesAgainst}
                votesFor={votesFor}
                votesAgainstIcon={votesAgainstIcon}
                votesForIcon={votesForIcon}
                timeLeft={timeLeft}
                votesText={votesModalText}
                availableAmount={availableAmount}
              />{' '}
            </Modal>
          )}
          <VoteBtn
            onClick={() => {
              setVotesModalText('Vote not to add community')
              setVoteTypeModal('against')
              setShowModal(true)
            }}
          >
            {votesAgainstText} <span>{votesAgainstIcon}</span>
          </VoteBtn>
          <VoteBtn
            onClick={() => {
              setVotesModalText('Vote to add community')
              setVoteTypeModal('for')
              setShowModal(true)
            }}
          >
            {votesForText} <span>{votesForIcon}</span>
          </VoteBtn>
        </VotesBtns>
      )}
    </CardVoteBlock>
  )
}

export const Card = styled.div`
  margin: 20px;
  display: flex;
  align-items: stretch;
`

const CardInfoBlock = styled.div`
  width: 50%;
  margin: 13px 0;
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
  width: 64px !important;
  height: 64px !important;
  border-radius: 50%;
  margin-right: 16px;
`
export const CardHeading = styled.h2`
  font-weight: bold;
  font-size: 17px;
  line-height: 24px;
  margin-bottom: 8px;
`
const CardHeadingEndedVote = styled.p`
  fint-weight: normal;
  font-size: 17px;
  line-height: 24px;
`
const CardText = styled.p`
  line-height: 22px;
  margin-bottom: 8px;
`

const CardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const Tag = styled.div`
  margin: 5px;
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

export const CardVoteBlock = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 24px 32px;
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
`

const VotesBtns = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
export const VoteBtn = styled(ButtonSecondary)`
  padding: 11px 46px;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;

  & > span {
    font-size: 20px;
  }
`
const VoteBtnFinal = styled(VoteBtn)`
  width: 100%;
`
