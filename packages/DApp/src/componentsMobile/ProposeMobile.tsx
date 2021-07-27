import { useContractFunction } from '@usedapp/core'
import React, { useState } from 'react'
import styled from 'styled-components'
import {
  CardCommunity,
  VoteHistoryTable,
  VoteHistoryTableCell,
  VoteHistoryTableColumnCell,
  VoteHistoryTableColumnCellDate,
} from '../components/card/CardCommunity'
import { PublicKeyInput } from '../components/PublicKeyInput'
import { CommunitySkeleton } from '../components/skeleton/CommunitySkeleton'
import { VotePropose } from '../components/votes/VotePropose'
import { Warning } from '../components/votes/VoteWarning'
import { ColumnFlexDiv, MobileBlock, MobileHeading, MobileTop, WrapperTopSmall } from '../constants/styles'
import { useCommunityDetails } from '../hooks/useCommunityDetails'
import { useContracts } from '../hooks/useContracts'
import { useProposeWarning } from '../hooks/useProposeWarning'
import { CommunityDetail } from '../models/community'
import { BigNumber } from 'ethers'
import { ButtonPrimary } from '../components/Button'
import { HeaderVotingMobile } from './VotingMobile'
import { ConnectMobile } from './ConnectMobile'
import { InfoText, ProposingInfo, VoteProposeWrap, WarningWrap } from '../components/card/ProposeModal'
import { HistoryLink } from './CardVoteMobile'

export function ProposeMobile() {
  const availableAmount = 60000000
  const [proposingAmount, setProposingAmount] = useState(0)
  const [communityFound, setCommunityFound] = useState<CommunityDetail | undefined>(undefined)
  const [publicKey, setPublicKey] = useState('')
  const loading = useCommunityDetails(publicKey, setCommunityFound)
  const { votingContract } = useContracts()
  const { send } = useContractFunction(votingContract, 'initializeVotingRoom')

  const warning = useProposeWarning(communityFound, availableAmount)

  const [showHistory, setShowHistory] = useState(false)
  const isDisabled = communityFound ? communityFound.votingHistory.length === 0 : false

  return (
    <ColumnFlexDiv>
      <HeaderVotingMobile>
        <ConnectMobile />
        <MobileTop>
          <ProposingHeading>Add community to directory</ProposingHeading>
          <PublicKeyInput publicKey={publicKey} setPublicKey={setPublicKey} />
          {communityFound ? (
            <WrapperTopSmall>
              <CardCommunity community={communityFound} />
            </WrapperTopSmall>
          ) : (
            loading &&
            publicKey && (
              <WrapperTopSmall>
                <CommunitySkeleton />
              </WrapperTopSmall>
            )
          )}
        </MobileTop>
      </HeaderVotingMobile>

      <MobileBlock>
        <WarningWrap>{warning.text && <Warning icon={warning.icon} text={warning.text} />}</WarningWrap>
        {communityFound && communityFound.validForAddition && publicKey && (
          <VoteProposeWrap>
            <ProposingHeadingMobile>{` Add ${communityFound.name}?`}</ProposingHeadingMobile>
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
      </MobileBlock>
      {communityFound && communityFound.validForAddition && (
        <ProposingBtn
          disabled={!communityFound || !proposingAmount || !!warning.text}
          onClick={() => send(1, publicKey, BigNumber.from(proposingAmount))}
        >
          Confirm vote to add community
        </ProposingBtn>
      )}
      <HistoryWrap>
        {!isDisabled && communityFound && (
          <HistoryLink
            className={showHistory ? 'opened' : ''}
            onClick={() => setShowHistory(!showHistory)}
            disabled={isDisabled}
          >
            Voting history
          </HistoryLink>
        )}
        {showHistory && communityFound && (
          <VoteHistoryTable>
            <tbody>
              <tr>
                <VoteHistoryTableColumnCellDate>Date</VoteHistoryTableColumnCellDate>
                <VoteHistoryTableColumnCell>Type</VoteHistoryTableColumnCell>
                <VoteHistoryTableColumnCell>Result</VoteHistoryTableColumnCell>
              </tr>
              {communityFound.votingHistory.map((vote) => {
                return (
                  <tr key={vote.ID}>
                    <VoteHistoryTableCell>{vote.date.toLocaleDateString()}</VoteHistoryTableCell>
                    <VoteHistoryTableCell>{vote.type}</VoteHistoryTableCell>
                    <VoteHistoryTableCell>{vote.result}</VoteHistoryTableCell>
                  </tr>
                )
              })}
            </tbody>
          </VoteHistoryTable>
        )}
      </HistoryWrap>
    </ColumnFlexDiv>
  )
}

const ProposingHeading = styled(MobileHeading)`
  margin-bottom: 8px;
`

const ProposingHeadingMobile = styled(ProposingHeading)`
  margin-bottom: 16px;
`

const ProposingBtn = styled(ButtonPrimary)`
  width: calc(100% - 32px);
  padding: 10px 0;
`
const HistoryWrap = styled.div`
  width: 100%;
  padding: 0 16px;
  align-self: flex-start;
`
