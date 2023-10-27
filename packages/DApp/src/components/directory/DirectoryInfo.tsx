import React from 'react'
import { InfoWrap, PageInfo } from '../PageInfo'
import { useContractFunction, useEthers } from '@usedapp/core'
import { ConnectButton } from '../ConnectButton'
import { ProposeButton } from '../Button'
import { useFeaturedVotes } from '../../hooks/useFeaturedVotes'
import { getFeaturedVotingState } from '../../helpers/featuredVoting'
import { useContracts } from '../../hooks/useContracts'
import { useWaku } from '../../providers/waku/provider'
import { mapFeaturesVotes, receiveWakuFeature } from '../../helpers/receiveWakuFeature'
import { config } from '../../config'
import { useTypedFeatureVote } from '../../hooks/useTypedFeatureVote'

export function DirectoryInfo() {
  const { account } = useEthers()
  const { featuredVotingContract } = useContracts()
  const { getTypedFeatureVote } = useTypedFeatureVote()
  const { activeVoting } = useFeaturedVotes()
  const { waku } = useWaku()

  const featuredVotingState = getFeaturedVotingState(activeVoting)
  const castVotes = useContractFunction(featuredVotingContract, 'castVotes')
  const finalizeVoting = useContractFunction(featuredVotingContract, 'finalizeVoting')

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
            const { votesToSend } = await receiveWakuFeature(waku, config.wakuConfig.wakuFeatureTopic, activeVoting!)
            const votes = mapFeaturesVotes(votesToSend, getTypedFeatureVote)

            await castVotes.send(votes)
          }}
        >
          Verify Weekly featured
        </ProposeButton>
      )}
      {account && featuredVotingState === 'ended' && (
        <ProposeButton
          onClick={async () => {
            // note: @jkbktl PR
            await finalizeVoting.send(activeVoting?.evaluatingPos)
          }}
        >
          Finalize Weekly featured
        </ProposeButton>
      )}
    </InfoWrap>
  )
}
