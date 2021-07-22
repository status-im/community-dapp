import { useContractFunction } from '@usedapp/core'
import React, { useState } from 'react'
import styled from 'styled-components'
import { CardCommunity } from '../components/card/CardCommunity'
import { PublicKeyInput } from '../components/PublicKeyInput'
import { CommunitySkeleton } from '../components/skeleton/CommunitySkeleton'
import { VotePropose } from '../components/votes/VotePropose'
import { Warning } from '../components/votes/VoteWarning'
import { ColumnFlexDiv } from '../constants/styles'
import { useCommunityDetails } from '../hooks/useCommunityDetails'
import { useContracts } from '../hooks/useContracts'
import { useProposeWarning } from '../hooks/useProposeWarning'
import { CommunityDetail } from '../models/community'
import { BigNumber } from 'ethers'
import { ButtonPrimary } from '../components/Button'

export function ProposeMobile() {
  const availableAmount = 60000000
  const [proposingAmount, setProposingAmount] = useState(0)
  const [communityFound, setCommunityFound] = useState<CommunityDetail | undefined>(undefined)
  const [publicKey, setPublicKey] = useState('')
  const loading = useCommunityDetails(publicKey, setCommunityFound)
  const { votingContract } = useContracts()
  const { send } = useContractFunction(votingContract, 'initializeVotingRoom')

  const warning = useProposeWarning(communityFound, availableAmount)

  return (
    <ColumnFlexDiv>
      <PublicKeyInput publicKey={publicKey} setPublicKey={setPublicKey} />
      <ProposingData>
        {communityFound ? <CardCommunity community={communityFound} /> : loading && publicKey && <CommunitySkeleton />}
        <WarningWrap>{warning.text && <Warning icon={warning.icon} text={warning.text} />}</WarningWrap>
        {communityFound && communityFound.validForAddition && publicKey && (
          <VoteProposeWrap>
            <VotePropose
              availableAmount={availableAmount}
              setProposingAmount={setProposingAmount}
              proposingAmount={proposingAmount}
              disabled={!communityFound}
            />
          </VoteProposeWrap>
        )}
        {!publicKey && (
          <ProposingInfo>
            <span>ℹ️</span>
            <InfoText>To propose a community, it must have at least 42 members and have a ENS domain.</InfoText>
          </ProposingInfo>
        )}
      </ProposingData>
      <ProposingBtn
        disabled={!communityFound || !proposingAmount || !!warning.text}
        onClick={() => send(1, publicKey, BigNumber.from(proposingAmount))}
      >
        Confirm vote to add community
      </ProposingBtn>
    </ColumnFlexDiv>
  )
}

const VoteProposeWrap = styled.div`
  margin-top: 32px;
`

const ProposingData = styled.div`
  width: 100%;
`

const ProposingInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > span {
    font-size: 24px;
    line-height: 32px;
    margin-right: 16px;
  }
`

const InfoText = styled.div`
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1px;
`

const ProposingBtn = styled(ButtonPrimary)`
  width: 100%;
  padding: 11px 0;
  margin-top: 32px;
`
const WarningWrap = styled.div`
  margin: 24px 0;
`
