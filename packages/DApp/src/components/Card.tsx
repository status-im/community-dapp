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
import { useEthers } from '@usedapp/core'
import { useContractFunction } from '@usedapp/core'
import { useContracts } from '../hooks/useContracts'
import { getVotingWinner } from '../helpers/voting'
import { VoteAnimatedModal } from './card/VoteAnimatedModal'
import voting from '../helpers/voting'
import { DetailedVotingRoom } from '../models/smartContract'
import { VoteSubmitButton } from './card/VoteSubmitButton'
import { useRoomAggregateVotes } from '../hooks/useRoomAggregateVotes'

interface CardCommunityProps {
  community: CommunityDetail
  showRemoveButton?: boolean
  customHeading?: string
}

export const CardCommunity = ({ community, showRemoveButton, customHeading }: CardCommunityProps) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const isDisabled = community.votingHistory.length === 0

  const setNewModal = (val: boolean) => {
    setShowConfirmModal(val)
    setShowRemoveModal(false)
  }

  return (
    <CardCommunityBlock>
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
          heading="Remove from directory?"
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
            <CardHeading>{customHeading ? customHeading : community.name}</CardHeading>
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
        <LinkInternal onClick={() => setShowHistoryModal(true)} disabled={isDisabled}>
          Voting history
        </LinkInternal>
      </CardLinks>
    </CardCommunityBlock>
  )
}

interface CardVoteProps {
  room: DetailedVotingRoom
  hideModalFunction?: (val: boolean) => void
}

export const CardVote = ({ room, hideModalFunction }: CardVoteProps) => {
  const { account } = useEthers()
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [selectedVoted, setSelectedVoted] = useState(voteTypes['Add'].for)

  const { votingContract } = useContracts()

  room = useRoomAggregateVotes(room, showConfirmModal)

  const finalizeVoting = useContractFunction(votingContract, 'finalizeVotingRoom')

  const setNext = (val: boolean) => {
    setShowConfirmModal(val)
    setShowVoteModal(false)
  }

  const hideConfirm = (val: boolean) => {
    if (hideModalFunction) {
      hideModalFunction(false)
    }
    setShowConfirmModal(val)
  }

  const vote = voting.fromRoom(room)

  const voteConstants = voteTypes[vote.type]

  const winner = getVotingWinner(vote)
  const availableAmount = 65800076

  const initialProposing = vote?.type === 'Remove' && availableAmount > 2000000 ? 2000000 : 0
  const [proposingAmount, setProposingAmount] = useState(initialProposing)

  if (!vote) {
    return <CardVoteBlock />
  }
  return (
    <CardVoteBlock>
      {showVoteModal && (
        <Modal heading={`${vote?.type} ${room.details.name}?`} setShowModal={setShowVoteModal}>
          <VoteModal
            vote={vote}
            room={room.roomNumber}
            selectedVote={selectedVoted}
            availableAmount={availableAmount}
            proposingAmount={proposingAmount}
            setShowConfirmModal={setNext}
            setProposingAmount={setProposingAmount}
          />{' '}
        </Modal>
      )}
      {showConfirmModal && (
        <Modal setShowModal={hideConfirm}>
          <VoteAnimatedModal
            vote={vote}
            community={room.details}
            selectedVote={selectedVoted}
            setShowModal={hideConfirm}
            proposingAmount={proposingAmount}
          />
        </Modal>
      )}
      {winner ? (
        <CardHeadingEndedVote>
          SNT holders have decided <b>{winner == 1 ? voteConstants.against.verb : voteConstants.for.verb}</b> this
          community to the directory!
        </CardHeadingEndedVote>
      ) : hideModalFunction || window.innerWidth < 769 ? (
        <CardHeading />
      ) : (
        <CardHeading>{voteConstants.question}</CardHeading>
      )}
      <div>
        <VoteChart vote={vote} voteWinner={winner} />

        {winner ? (
          <VoteBtnFinal onClick={() => finalizeVoting.send(room.roomNumber)} disabled={!account}>
            Finalize the vote <span>✍️</span>
          </VoteBtnFinal>
        ) : (
          <VotesBtns>
            <VoteBtn
              disabled={!account}
              onClick={() => {
                setSelectedVoted(voteConstants.against)
                setShowVoteModal(true)
              }}
            >
              {voteConstants.against.text} <span>{voteConstants.against.icon}</span>
            </VoteBtn>
            <VoteBtn
              disabled={!account}
              onClick={() => {
                setSelectedVoted(voteConstants.for)
                setShowVoteModal(true)
              }}
            >
              {voteConstants.for.text} <span>{voteConstants.for.icon}</span>
            </VoteBtn>
          </VotesBtns>
        )}

        <CardVoteBottom>{vote && vote.timeLeft > 0 && <VoteSubmitButton vote={vote} />}</CardVoteBottom>
      </div>
    </CardVoteBlock>
  )
}

export const Card = styled.div`
  display: flex;
  align-items: stretch;
  margin-top: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: 0;
  }
`

export const CardCommunityBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
`

export const CardCommunityWrap = styled.div`
  display: flex;
  align-items: stretch;
  width: 50%;
  margin: 13px 0;
  padding: 24px 24px 16px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 6px 0px 0px 6px;

  @media (max-width: 768px) {
    width: 100%;
    margin: 0;
    border: none;
    box-shadow: none;
  }
`
export const CardVoteWrap = styled.div`
  display: flex;
  align-items: stretch;
  width: 50%;
  padding: 24px 24px 32px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 6px 0px 0px 6px;

  @media (max-width: 768px) {
    width: 100%;
    box-shadow: none;
    border-radius: unset;
    border-bottom: 1px solid #e0e0e0;
  }
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
const CardVoteBottom = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`

export const CardHeading = styled.h2`
  font-weight: bold;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
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
  max-width: 290px;
  align-self: center;
  font-weight: normal;
  font-size: 15px;
  line-height: 22px;
  margin-bottom: 18px;
  text-align: center;

  @media (max-width: 768px) {
    display: none;
  }
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
export const CardLinks = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 15px;
  line-height: 22px;

  @media (max-width: 768px) {
    width: auto;
    margin-left: 80px;
  }
`

export const CardVoteBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
`

export const VotesBtns = styled.div`
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

  @media (max-width: 768px) {
    width: 305px;
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
