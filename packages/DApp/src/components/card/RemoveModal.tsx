import React from 'react'
import styled from 'styled-components'
import { CommunityDetail } from '../../models/community'
import { CardCommunity } from '../Card'
import { RemoveAmountPicker } from '../card/RemoveAmountPicker'

interface RemoveModalProps {
  community: CommunityDetail
  availableAmount: number
  setShowConfirmModal: (val: boolean) => void
}

export function RemoveModal({ community, availableAmount, setShowConfirmModal }: RemoveModalProps) {
  return (
    <CommunityProposing>
      <CardCommunity community={community} />
      <RemoveAmountPicker
        community={community}
        availableAmount={availableAmount}
        setShowConfirmModal={setShowConfirmModal}
      />
    </CommunityProposing>
  )
}

const CommunityProposing = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`
