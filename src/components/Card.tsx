import React, { useState } from 'react'
import styled from 'styled-components'
import { Colors } from '../constants/styles'
import { ButtonSecondary } from '../components/Button'
import { CommunityDetail } from '../models/community'
import { LinkExternal, LinkInternal } from './Link'
import { Modal } from './Modal'
import { VoteModal } from './card/VoteModal'
import { VoteChart } from './votes/VoteChart'
import { voteTypes } from './../constants/voteTypes'
import { VoteConfirmModal } from './card/VoteConfirmModal'

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
  community: CommunityDetail
}

export const CardVote = ({ community }: CardVoteProps) => {
  const [showModal, setShowModal] = useState(false)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [selectedVoted, setSelectedVoted] = useState(voteTypes['Add'].for)

  const setNext = (val: boolean) => {
    setShowVoteModal(val)
    setShowModal(false)
  }

  const vote = community.currentVoting

  if (!vote) {
    return <CardVoteBlock />
  }

  const voteConstants = voteTypes[vote.type]
  let winner: number | undefined = undefined
  if (vote?.timeLeft === 0) {
    winner = vote.voteAgainst > vote.voteFor ? 2 : 1
  }

  return (
    <CardVoteBlock>
      {winner ? (
        <CardHeadingEndedVote>
          SNT holders have decided{' '}
          <b>
            <u>{winner == 1 ? voteConstants.against.verb : voteConstants.for.verb}</u>
          </b>{' '}
          this community to the directory!
        </CardHeadingEndedVote>
      ) : (
        <CardHeading>{voteConstants.question}</CardHeading>
      )}
      <VoteChart vote={vote} voteWinner={winner} />

      {winner ? (
        <VoteBtnFinal>
          Finalize the vote <span>✍️</span>
        </VoteBtnFinal>
      ) : (
        <VotesBtns>
          {showModal && (
            <Modal heading={`${vote?.type} ${community.name} ?`} setShowModal={setShowModal}>
              <VoteModal
                vote={vote}
                selectedVote={selectedVoted}
                availableAmount={65245346}
                setShowVoteModal={setNext}
              />{' '}
            </Modal>
          )}
          {showVoteModal && (
            <Modal setShowModal={setShowVoteModal}>
              <VoteConfirmModal community={community} selectedVote={selectedVoted} setShowModal={setNext} />
            </Modal>
          )}
          <VoteBtn
            onClick={() => {
              setSelectedVoted(voteConstants.against)
              setShowModal(true)
            }}
          >
            {voteConstants.against.text} <span>{voteConstants.against.icon}</span>
          </VoteBtn>
          <VoteBtn
            onClick={() => {
              setSelectedVoted(voteConstants.for)
              setShowModal(true)
            }}
          >
            {voteConstants.for.text} <span>{voteConstants.for.icon}</span>
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
