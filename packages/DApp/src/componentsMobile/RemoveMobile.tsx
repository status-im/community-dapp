import React from 'react'
import { useParams } from 'react-router'
import { CardCommunity } from '../components/card/CardCommunity'
import { RemoveAmountPicker } from '../components/card/RemoveAmountPicker'
import { CommunitySkeleton } from '../components/skeleton/CommunitySkeleton'
import { ColumnFlexDiv } from '../constants/styles'
import { useCommunities } from '../hooks/useCommunities'

export function RemoveMobile() {
  const { publicKey } = useParams<{ publicKey: string }>()

  const [community] = useCommunities([publicKey])

  if (!community) {
    return <CommunitySkeleton />
  }

  return (
    <ColumnFlexDiv style={{ padding: '20px' }}>
      <CardCommunity community={community} />
      <RemoveAmountPicker
        community={community}
        availableAmount={60000000}
        setShowConfirmModal={(val: boolean) => {
          val
        }}
      />
    </ColumnFlexDiv>
  )
}
