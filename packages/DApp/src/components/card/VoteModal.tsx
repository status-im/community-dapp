import React from 'react'
import styled from 'styled-components'
import { VoteChart } from '../votes/VoteChart'
import { ButtonSecondary } from '../Button'
import { CurrentVoting } from '../../models/community'
import { VotePropose } from '../votes/VotePropose'
import { VoteType } from '../../constants/voteTypes'
import { useSendWakuVote } from '../../hooks/useSendWakuVote'
import { ColumnFlexDiv } from '../../constants/styles'

export interface VoteModalProps {
  vote: CurrentVoting
  selectedVote: VoteType
  proposingAmount: number
  room: number
  setShowConfirmModal: (show: boolean) => void
  setProposingAmount: (val: number) => void
}

export function VoteModal({
  vote,
  room,
  selectedVote,
  proposingAmount,
  setShowConfirmModal,
  setProposingAmount,
}: VoteModalProps) {
  const disabled = proposingAmount === 0
  const sendWakuVote = useSendWakuVote()

  return (
    <ColumnFlexDiv>
      <VoteChart vote={vote} proposingAmount={proposingAmount} selectedVote={selectedVote} />
      <VotePropose
        vote={vote}
        selectedVote={selectedVote}
        setProposingAmount={setProposingAmount}
        proposingAmount={proposingAmount}
      />

      <VoteConfirmBtn
        onClick={async () => {
          await sendWakuVote(proposingAmount, room, selectedVote.type)
          setShowConfirmModal(true)
        }}
        disabled={disabled}
      >{`Vote ${selectedVote.verb} community ${selectedVote.icon}`}</VoteConfirmBtn>
    </ColumnFlexDiv>
  )
}

const VoteConfirmBtn = styled(ButtonSecondary)`
  width: 100%;
  padding: 11px 0;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  margin-top: 32px;
`
