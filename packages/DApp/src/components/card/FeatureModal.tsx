import React, { useState } from 'react'
import styled from 'styled-components'
import { CommunityDetail } from '../../models/community'
import { CardCommunity } from './CardCommunity'
import { ButtonPrimary } from '../Button'
import { VotePropose } from '../votes/VotePropose'
import { ColumnFlexDiv } from '../../constants/styles'

interface FeatureModalProps {
  community: CommunityDetail
  availableAmount: number
  setShowConfirmModal: (val: boolean) => void
}

export function FeatureModal({ community, availableAmount, setShowConfirmModal }: FeatureModalProps) {
  const [proposingAmount, setProposingAmount] = useState(0)
  const disabled = proposingAmount === 0

  return (
    <ColumnFlexDiv>
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
    </ColumnFlexDiv>
  )
}

const VoteProposeWrap = styled.div`
  margin-top: 32px;
  width: 100%;
`

const VoteConfirmBtn = styled(ButtonPrimary)`
  width: 100%;
  padding: 11px 0;
  margin-top: 32px;
`
