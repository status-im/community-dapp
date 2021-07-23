import React, { useState } from 'react'
import { CardCommunity } from '../components/card/CardCommunity'
import { VotePropose } from '../components/votes/VotePropose'
import styled from 'styled-components'
import { useCommunities } from '../hooks/useCommunities'
import { useParams } from 'react-router'
import { ButtonPrimary } from '../components/Button'
import { CommunitySkeleton } from '../components/skeleton/CommunitySkeleton'

export function FeatureMobile() {
  const { publicKey } = useParams<{ publicKey: string }>()
  const [community] = useCommunities([publicKey])
  const [proposingAmount, setProposingAmount] = useState(0)
  const disabled = proposingAmount === 0

  if (!community) {
    return <CommunitySkeleton />
  } else {
    return (
      <FeatureWrap>
        <CardCommunity community={community} />
        <VoteProposeWrap>
          <VotePropose
            availableAmount={60000000}
            setProposingAmount={setProposingAmount}
            proposingAmount={proposingAmount}
            disabled={disabled}
          />
          <VoteConfirmBtn disabled={disabled}>Confirm vote to feature community</VoteConfirmBtn>
        </VoteProposeWrap>
      </FeatureWrap>
    )
  }
}

const FeatureWrap = styled.div`
  padding: 20px;
`

const VoteProposeWrap = styled.div`
  margin-top: 32px;
  width: 100%;
`

const VoteConfirmBtn = styled(ButtonPrimary)`
  width: 100%;
  padding: 11px 0;
  margin-top: 32px;
`
