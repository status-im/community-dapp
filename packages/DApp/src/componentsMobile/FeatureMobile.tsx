import React, { useState } from 'react'
import {
  CardCommunity,
  VoteHistoryTable,
  VoteHistoryTableCell,
  VoteHistoryTableColumnCell,
  VoteHistoryTableColumnCellDate,
} from '../components/card/CardCommunity'
import { VotePropose } from '../components/votes/VotePropose'
import styled from 'styled-components'
import { useCommunities } from '../hooks/useCommunities'
import { useHistory, useParams } from 'react-router'
import { ButtonSecondary, VoteSendingBtn } from '../components/Button'
import { CommunitySkeleton } from '../components/skeleton/CommunitySkeleton'
import { HeaderVotingMobile } from './VotingMobile'
import { ConnectMobile } from './ConnectMobile'
import { HistoryLink } from './CardVoteMobile'
import { useEthers } from '@usedapp/core'
import { useGetCurrentVoting } from '../hooks/useGetCurrentVoting'

export function FeatureMobile() {
  const { publicKey } = useParams<{ publicKey: string }>()
  const [community] = useCommunities([publicKey])
  const [proposingAmount, setProposingAmount] = useState(0)
  const { account } = useEthers()
  const disabled = proposingAmount === 0 || !account

  const [showHistory, setShowHistory] = useState(false)
  const isDisabled = community ? community.votingHistory.length === 0 : false

  const { currentVoting } = useGetCurrentVoting(community?.publicKey)
  const history = useHistory()

  if (!community) {
    return <CommunitySkeleton />
  } else {
    return (
      <FeatureWrap>
        <HeaderVotingMobile>
          <ConnectMobile />
          <FeatureTop>
            <CardCommunity community={community} />
          </FeatureTop>
        </HeaderVotingMobile>

        <VoteProposeWrap>
          <FeatureHeading>{`Feature ${community.name}?`}</FeatureHeading>
          <VotePropose
            availableAmount={60000000}
            setProposingAmount={setProposingAmount}
            proposingAmount={proposingAmount}
          />
          <FeatureBtn disabled={disabled}>
            Feature this community! <span style={{ fontSize: '20px' }}>⭐️</span>
          </FeatureBtn>
          {currentVoting && (
            <div>
              <VoteSendingBtn onClick={() => history.push(`/votingRoom/${currentVoting.ID}`)}>
                Removal vote in progress
              </VoteSendingBtn>
            </div>
          )}
          {!isDisabled && (
            <HistoryLink
              className={showHistory ? 'opened' : ''}
              onClick={() => setShowHistory(!showHistory)}
              disabled={isDisabled}
            >
              Voting history
            </HistoryLink>
          )}
          {showHistory && (
            <VoteHistoryTable>
              <tbody>
                <tr>
                  <VoteHistoryTableColumnCellDate>Date</VoteHistoryTableColumnCellDate>
                  <VoteHistoryTableColumnCell>Type</VoteHistoryTableColumnCell>
                  <VoteHistoryTableColumnCell>Result</VoteHistoryTableColumnCell>
                </tr>
                {community.votingHistory.map((vote) => {
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
        </VoteProposeWrap>
      </FeatureWrap>
    )
  }
}

const FeatureWrap = styled.div`
  padding: 0 0 16px;
`

const FeatureTop = styled.div`
  padding: 0 16px;
`

const FeatureHeading = styled.h2`
  margin-bottom: 16px;
  font-weight: bold;
  font-size: 17px;
  line-height: 24px;
`

const FeatureBtn = styled(ButtonSecondary)`
  width: 100%;
  padding: 11px 0;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  margin-top: 32px;
`

const VoteProposeWrap = styled.div`
  padding: 16px;
  width: 100%;
`
