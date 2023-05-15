import React, { useState } from 'react'
import styled from 'styled-components'
import { CommunityDetail } from '../../models/community'
import { CardCommunity } from './CardCommunity'
import { ButtonPrimary } from '../Button'
import { VotePropose } from '../votes/VotePropose'
import { ColumnFlexDiv } from '../../constants/styles'
import { useSendWakuFeature } from '../../hooks/useSendWakuFeature'
import { useContractFunction } from '@usedapp/core'
import { useContracts } from '../../hooks/useContracts'
import { useFeaturedVotes } from '../../hooks/useFeaturedVotes'

interface FeatureModalProps {
  community: CommunityDetail
  setShowConfirmModal: (val: boolean) => void
}

export function FeatureModal({ community, setShowConfirmModal }: FeatureModalProps) {
  const [proposingAmount, setProposingAmount] = useState(0)
  const sendWaku = useSendWakuFeature()
  const { featuredVotingContract } = useContracts()
  const { send } = useContractFunction(featuredVotingContract, 'initializeVoting')
  const { activeVoting } = useFeaturedVotes()
  const disabled = proposingAmount === 0

  console.log('active voting', activeVoting)

  return (
    <ColumnFlexDiv>
      <CardCommunity community={community} />
      <VoteProposeWrap>
        <VotePropose setProposingAmount={setProposingAmount} proposingAmount={proposingAmount} disabled={disabled} />
        <VoteConfirmBtn
          disabled={disabled}
          onClick={async () => {
            if (!activeVoting) {
              await send(community.publicKey, proposingAmount)
            } else {
              await sendWaku(proposingAmount, community.publicKey)
            }
            setShowConfirmModal(true)
          }}
        >
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
