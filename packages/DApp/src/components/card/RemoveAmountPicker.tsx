import React, { useState } from 'react'
import styled from 'styled-components'
import { timespan } from '../../helpers/timespan'
import { CommunityDetail } from '../../models/community'
import { ButtonPrimary } from '../Button'
import { VotePropose } from '../votes/VotePropose'
import { Warning } from '../votes/VoteWarning'
import { ConfirmBtn } from './VoteConfirmModal'

interface RemoveAmountPickerProps {
  community: CommunityDetail
  availableAmount: number
  setShowConfirmModal: (val: boolean) => void
}

export function RemoveAmountPicker({ community, availableAmount, setShowConfirmModal }: RemoveAmountPickerProps) {
  const [proposingAmount, setProposingAmount] = useState(availableAmount)
  const lastVote = community.votingHistory[community.votingHistory.length - 1]
  const lastVoteDate = lastVote.date

  if (community.votingHistory && timespan(lastVoteDate) < 30) {
    return (
      <WarningWrapRemoval>
        <Warning
          icon="⏳"
          text={`${community.name} had a vote for removal ${timespan(
            lastVoteDate
          )} days ago. A new vote can be submitted after 30 days passes since the last vote.`}
        />
        <ConfirmBtn
          onClick={() => {
            setShowConfirmModal(false)
          }}
        >
          OK, let’s move on! <span>🤙</span>
        </ConfirmBtn>
      </WarningWrapRemoval>
    )
  }
  if (availableAmount < 10000) {
    return (
      <WarningWrapRemoval>
        <Warning
          icon="💰"
          text={`Not enough SNT to start a vote for this community. A new vote for ${community.name} requires at least 10,000 SNT available.`}
        />
        <ConfirmBtn
          onClick={() => {
            setShowConfirmModal(false)
          }}
        >
          OK, let’s move on! <span>🤙</span>
        </ConfirmBtn>
      </WarningWrapRemoval>
    )
  }
  return (
    <VoteProposeWrap>
      <VotePropose
        availableAmount={availableAmount}
        setProposingAmount={setProposingAmount}
        proposingAmount={proposingAmount}
      />
      <VoteConfirmBtn onClick={() => setShowConfirmModal(true)}>Confirm vote to remove community</VoteConfirmBtn>
    </VoteProposeWrap>
  )
}

const VoteProposeWrap = styled.div`
  margin-top: 32px;
  width: 100%;
`

const WarningWrapRemoval = styled.div`
  margin-top: 32px;
`

const VoteConfirmBtn = styled(ButtonPrimary)`
  width: 100%;
  padding: 11px 0;
`
