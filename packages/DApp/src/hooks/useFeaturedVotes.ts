import { useState, useEffect } from 'react'
import { useWaku } from '../providers/waku/provider'
import { useContractCall, useEthers } from '@usedapp/core'
import { config } from '../config'
import { useContracts } from '../hooks/useContracts'

import { filterVerifiedFeaturesVotes, receiveWakuFeature } from '../helpers/receiveWakuFeature'
import { FeaturedVoting } from '../models/smartContract'
import { useTypedFeatureVote } from './useTypedFeatureVote'

export function useFeaturedVotes() {
  const { featuredVotingContract } = useContracts()
  const [votes, setVotes] = useState<any | null>(null)
  const [votesToSend, setVotesToSend] = useState<any | null>(null)
  const [activeVoting, setActiveVoting] = useState<FeaturedVoting | null>(null)
  const { waku } = useWaku()
  const { chainId } = useEthers()
  const { getTypedFeatureVote } = useTypedFeatureVote()

  const [featuredVotings] =
    useContractCall({
      abi: featuredVotingContract.interface,
      address: featuredVotingContract.address,
      method: 'getVotings',
      args: [],
    }) ?? []

  useEffect(() => {
    if (featuredVotings) {
      const lastVoting: FeaturedVoting = featuredVotings[featuredVotings.length - 1]

      if (lastVoting && !lastVoting.finalized) {
        setActiveVoting(lastVoting)
      }
    }
  }, [featuredVotings])

  useEffect(() => {
    const loadFeatureVotes = async () => {
      if (chainId && waku && activeVoting) {
        const { votes, votesToSend } = await receiveWakuFeature(waku, config.wakuConfig.wakuFeatureTopic, activeVoting)
        const verifiedVotes = await filterVerifiedFeaturesVotes(votesToSend, [], getTypedFeatureVote)

        setVotesToSend(verifiedVotes)
        setVotes(votes)
      }
    }

    loadFeatureVotes()

    const task = setInterval(loadFeatureVotes, 10000)
    return () => clearInterval(task)
  }, [waku, chainId, activeVoting])

  return { votes, votesToSend, activeVoting }
}
