import React, { useState } from 'react'
import styled from 'styled-components'
import { CommunityDetail } from '../../models/community'
import { CardCommunity } from '../Card'
import { ButtonPrimary } from '../Button'
import { VotePropose } from '../votes/VotePropose'

interface FeatureModalProps {
  community: CommunityDetail
  availableAmount: number
  setShowConfirmModal: (val: boolean) => void
}

export function FeatureModal({ community, availableAmount, setShowConfirmModal }: FeatureModalProps) {
  const [proposingAmount, setProposingAmount] = useState(availableAmount)
  const disabled = proposingAmount === 0

  return (
    <CommunityProposing>
      <CardCommunity community={community} />
      <VoteProposeWrap>
        <VotePropose
          availableAmount={availableAmount}
          setProposingAmount={setProposingAmount}
          proposingAmount={proposingAmount}
          disabled={disabled}
        />
        <VoteConfirmBtn disabled={disabled} onClick={() => setShowConfirmModal(true)}>
          Confirm vote to feature community
        </VoteConfirmBtn>
      </VoteProposeWrap>
    </CommunityProposing>
  )
}

const CommunityProposing = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const VoteProposeWrap = styled.div`
  margin-top: 32px;
  width: 100%;
`

const VoteConfirmBtn = styled(ButtonPrimary)`
  width: 100%;
  padding: 11px 0;
`
