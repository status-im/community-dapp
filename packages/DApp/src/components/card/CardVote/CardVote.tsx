import React, { useState } from 'react'
import { VoteModal } from './../VoteModal'
import { VoteChart } from './../../votes/VoteChart'
import { voteTypes } from './../../../constants/voteTypes'
import { useEthers } from '@usedapp/core'
import { useContractFunction } from '@usedapp/core'
import { useContracts } from '../../../hooks/useContracts'
import { getVotingWinner } from '../../../helpers/voting'
import { VoteAnimatedModal } from './../VoteAnimatedModal'
import voting from '../../../helpers/voting'
import { DetailedVotingRoom } from '../../../models/smartContract'
import { VoteSubmitButton } from './../VoteSubmitButton'
import { useRoomAggregateVotes } from '../../../hooks/useRoomAggregateVotes'
import styled from 'styled-components'
import { Modal } from './../../Modal'
import { VoteBtn, VotesBtns } from '../../Button'
import { CardHeading, CardVoteBlock } from '../../Card'

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
        <VoteChart vote={vote} voteWinner={winner} tabletMode={hideModalFunction} />

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

const CardHeadingEndedVote = styled.p`
  max-width: 290px;
  align-self: center;
  font-weight: normal;
  font-size: 15px;
  line-height: 22px;
  margin-bottom: 18px;
  text-align: center;

  @media (max-width: 768px) {
    max-width: 100%;
    margin-bottom: 26px;
    margin-top: -30px;
  }
`

const VoteBtnFinal = styled(VoteBtn)`
  width: 100%;
`

const CardVoteBottom = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`
