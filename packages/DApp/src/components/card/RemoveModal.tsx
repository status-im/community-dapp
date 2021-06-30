import React from 'react'
import { ColumnFlexDiv } from '../../constants/styles'
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
    <ColumnFlexDiv>
      <CardCommunity community={community} />
      <RemoveAmountPicker
        community={community}
        availableAmount={availableAmount}
        setShowConfirmModal={setShowConfirmModal}
      />
    </ColumnFlexDiv>
  )
}
