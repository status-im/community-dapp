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
import binIcon from '../assets/images/bin.svg'
import { RemoveModal } from './card/RemoveModal'

interface CardCommunityProps {
  community: CommunityDetail
  showRemoveButton?: boolean
}

export const CardCommunity = ({ community, showRemoveButton }: CardCommunityProps) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const setNewModal = (val: boolean) => {
    setShowConfirmModal(val)
    setShowRemoveModal(false)
  }

  return (
    <CardInfoBlock>
      {showHistoryModal && (
        <Modal heading={`${community.name} voting history`} setShowModal={setShowHistoryModal}>
          <VoteHistoryTable>
            <tbody>
              <tr>
                <VoteHistoryTableColumnCell>Date</VoteHistoryTableColumnCell>
                <VoteHistoryTableColumnCell>Type</VoteHistoryTableColumnCell>
                <VoteHistoryTableColumnCell>Result</VoteHistoryTableColumnCell>
              </tr>
              {community.votingHistory.map((vote) => {
                return (
                  <tr key={vote.ID}>
                    <VoteHistoryTableCell>{vote.date.toLocaleDateString()}</VoteHistoryTableCell>
                    <VoteHistoryTableCell>{vote.type}</VoteHistoryTableCell>
                    <VoteHistoryTableCell>{vote.result}</VoteHistoryTableCell>
                  </tr>
                )
              })}
            </tbody>
          </VoteHistoryTable>
        </Modal>
      )}
      {showRemoveModal && (
        <Modal
          heading="Remove from Communities directory?"
          setShowModal={(val: boolean) => {
            setShowRemoveModal(val)
          }}
        >
          <RemoveModal community={community} availableAmount={549739700} setShowConfirmModal={setNewModal} />{' '}
        </Modal>
      )}
      {showConfirmModal && (
        <Modal setShowModal={setNewModal}>
          <VoteConfirmModal community={community} selectedVote={{ verb: 'to remove' }} setShowModal={setNewModal} />
        </Modal>
      )}
      <Community>
        <CardLogoWrap>
          {' '}
          <CardLogo src={community.icon} alt={`${community.name} logo`} />
        </CardLogoWrap>

        <CommunityInfo>
          <CardTop>
            <CardHeading>{community.name}</CardHeading>
            {community.directoryInfo && showRemoveButton && <RemoveBtn onClick={() => setShowRemoveModal(true)} />}
          </CardTop>
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
        <LinkExternal>Etherscan</LinkExternal>
        <LinkInternal onClick={() => setShowHistoryModal(true)}>Voting history</LinkInternal>
      </CardLinks>
    </CardInfoBlock>
  )
}

interface CardVoteProps {
  community: CommunityDetail
}

export const CardVote = ({ community }: CardVoteProps) => {
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedVoted, setSelectedVoted] = useState(voteTypes['Add'].for)

  const setNext = (val: boolean) => {
    setShowConfirmModal(val)
    setShowVoteModal(false)
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
      <div>
        <VoteChart vote={vote} voteWinner={winner} />

        {winner ? (
          <VoteBtnFinal>
            Finalize the vote <span>✍️</span>
          </VoteBtnFinal>
        ) : (
          <VotesBtns>
            {showVoteModal && (
              <Modal heading={`${vote?.type} ${community.name} ?`} setShowModal={setShowVoteModal}>
                <VoteModal
                  vote={vote}
                  selectedVote={selectedVoted}
                  availableAmount={65245346}
                  setShowConfirmModal={setNext}
                />{' '}
              </Modal>
            )}
            {showConfirmModal && (
              <Modal setShowModal={setShowConfirmModal}>
                <VoteConfirmModal community={community} selectedVote={selectedVoted} setShowModal={setNext} />
              </Modal>
            )}
            <VoteBtn
              onClick={() => {
                setSelectedVoted(voteConstants.against)
                setShowVoteModal(true)
              }}
            >
              {voteConstants.against.text} <span>{voteConstants.against.icon}</span>
            </VoteBtn>
            <VoteBtn
              onClick={() => {
                setSelectedVoted(voteConstants.for)
                setShowVoteModal(true)
              }}
            >
              {voteConstants.for.text} <span>{voteConstants.for.icon}</span>
            </VoteBtn>
          </VotesBtns>
        )}
      </div>
    </CardVoteBlock>
  )
}

export const Card = styled.div`
  margin: 20px;
  display: flex;
  align-items: stretch;
`
export const CardCommunityWrap = styled.div`
  width: 50%;
  margin: 13px 0;
  padding: 24px 24px 16px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 6px 0px 0px 6px;
`
const CardInfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Community = styled.div`
  display: flex;
  margin-bottom: 16px;
`

const CommunityInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const CardLogoWrap = styled.div`
  width: 64px !important;
  height: 64px !important;
  object-fit: cover;
  margin-right: 16px;
`
const CardLogo = styled.img`
  width: 64px !important;
  height: 64px !important;
  border-radius: 50%;
`

export const CardHeading = styled.h2`
  font-weight: bold;
  font-size: 17px;
`

const CardTop = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  line-height: 24px;
`

const RemoveBtn = styled.button`
  width: 16px;
  height: 16px;
  margin-left: 16px;
  background-image: url(${binIcon});
  background-size: cover;
`

const CardHeadingEndedVote = styled.p`
  fint-weight: normal;
  font-size: 17px;
  line-height: 24px;
  margin-bottom: 18px;
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
  margin: 0 8px 8px 0;
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
  width: 187px;
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

const VoteHistoryTable = styled.table`
  width: 100%;
`

const VoteHistoryTableColumnCell = styled.td`
  font-weight: bold;
  padding-bottom: 24px;
  padding-right: 112px;
  width: 65px;
`

const VoteHistoryTableCell = styled.td`
  width: 65px;
  padding-bottom: 18px;
  padding-right: 112px;
`
