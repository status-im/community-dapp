import React, { useEffect, useState } from 'react'
import { InfoWrap, PageInfo } from '../PageInfo'
import { useContractFunction, useEthers } from '@usedapp/core'
import { ConnectButton } from '../ConnectButton'
import { ProposeButton } from '../Button'
import { useFeaturedVotes } from '../../hooks/useFeaturedVotes'
import { useFeaturedVotingState } from '../../helpers/featuredVoting'
import { useContracts } from '../../hooks/useContracts'
import { useWaku } from '../../providers/waku/provider'
import { mapFeaturesVotes, receiveWakuFeature } from '../../helpers/receiveWakuFeature'
import { config } from '../../config'
import { useTypedFeatureVote } from '../../hooks/useTypedFeatureVote'

export function DirectoryInfo() {
  const { account } = useEthers()
  const { featuredVotingContract } = useContracts()
  const { getTypedFeatureVote } = useTypedFeatureVote()
  const { waku } = useWaku()
  const { activeVoting, votes, votesToSend } = useFeaturedVotes()
  const featuredVotingState = useFeaturedVotingState(activeVoting)
  const castVotes = useContractFunction(featuredVotingContract, 'castVotes')
  const finalizeVoting = useContractFunction(featuredVotingContract, 'finalizeVoting')
  const [loading, setLoading] = useState(false)

  const evaluated = activeVoting?.evaluated ?? false
  const finalized = activeVoting?.finalized ?? false
  const allVotes = votes ?? {}
  const votesCount: number = Object.values(allVotes).reduce(
    (acc: number, curr: any) => acc + Object.keys(curr?.votes).length,
    0
  )

  const beingFinalized = !evaluated && finalized
  const beingEvaluated = evaluated && !finalized
  const currentPosition = activeVoting?.evaluatingPos ?? 0
  const firstFinalization = beingEvaluated && currentPosition === votesCount + 1

  const votesLeftCount = votesCount - currentPosition + 1
  const finalizeVotingLimit = firstFinalization
    ? Math.min(votesCount, config.votesLimit)
    : Math.min(votesLeftCount, config.votesLimit)
  const batchCount = Math.ceil((beingFinalized ? votesCount + 1 : votesCount) / config.votesLimit)
  const batchLeftCount = Math.ceil(votesLeftCount / config.votesLimit)

  const batchDoneCount = batchCount - batchLeftCount
  const batchedVotes = votesToSend?.slice(
    batchDoneCount * config.votesLimit,
    batchDoneCount * config.votesLimit + finalizeVotingLimit
  )

  useEffect(() => {
    if (finalizeVoting.state.status === 'Success' || castVotes.state.status === 'Success') {
      history.go(0)
    }
  }, [finalizeVoting.state.status, castVotes.state.status])

  return (
    <InfoWrap>
      <PageInfo
        heading="Current directory"
        text="Vote on your favourite communities being included in
      Weekly Featured Communities"
      />

      {!account && <ConnectButton />}
      {account && featuredVotingState === 'verification' && (
        <ProposeButton
          onClick={async () => {
            setLoading(true)
            const { votesToSend } = await receiveWakuFeature(waku, config.wakuConfig.wakuFeatureTopic, activeVoting!)
            const votes = mapFeaturesVotes(votesToSend, getTypedFeatureVote)

            const batchedVotes = votes.slice(
              batchDoneCount * config.votesLimit,
              batchDoneCount * config.votesLimit + finalizeVotingLimit
            )

            await castVotes.send(batchedVotes)
            setLoading(false)
          }}
        >
          {loading ? (
            'Waiting...'
          ) : (
            <>
              Verify Weekly featured{' '}
              {batchCount > 1 && (
                <>
                  ({beingEvaluated ? batchDoneCount : 0}/{batchCount} verified)
                </>
              )}
            </>
          )}
        </ProposeButton>
      )}
      {account && featuredVotingState === 'ended' && (
        <ProposeButton
          onClick={() => {
            finalizeVoting.send(finalizeVotingLimit < 1 ? 1 : finalizeVotingLimit)
          }}
        >
          Finalize Weekly featured{' '}
          {batchCount > 1 && (
            <>
              ({beingFinalized ? batchDoneCount : 0}/{batchCount} finalized)
            </>
          )}
        </ProposeButton>
      )}
    </InfoWrap>
  )
}
