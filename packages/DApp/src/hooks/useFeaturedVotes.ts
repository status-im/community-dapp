import { useState, useEffect } from 'react'
import { useWaku } from '../providers/waku/provider'
import { useContractCall, useEthers } from '@usedapp/core'
import { config } from '../config'
import { useContracts } from '../hooks/useContracts'

import { receiveWakuFeature } from '../helpers/receiveWakuFeature'
import { FeaturedVoting } from '../models/smartContract'

export function useFeaturedVotes() {
  const { featuredVotingContract } = useContracts()
  const [votes, setVotes] = useState<any | null>(null)
  const [activeVoting, setActiveVoting] = useState<FeaturedVoting | null>(null)
  const { waku } = useWaku()
  const { chainId } = useEthers()

  const [featuredVotings] =
    useContractCall({
      abi: featuredVotingContract.interface,
      address: featuredVotingContract.address,
      method: 'getVotings',
      args: [],
    }) ?? []

  console.log(featuredVotings)

  useEffect(() => {
    if (featuredVotings) {
      const lastVoting: FeaturedVoting = featuredVotings[featuredVotings.length - 1]
      const currentTimestamp = Date.now() / 1000

      if (lastVoting && lastVoting.verificationStartAt.toNumber() < currentTimestamp && !lastVoting.finalized) {
        setActiveVoting(lastVoting)
      }
    }
  }, [featuredVotings])

  useEffect(() => {
    const loadFeatureVotes = async () => {
      if (chainId && waku && activeVoting) {
        const { votes } = await receiveWakuFeature(waku, config.wakuConfig.wakuFeatureTopic, chainId, activeVoting)
        setVotes(votes)
      }
    }

    loadFeatureVotes()

    const task = setInterval(loadFeatureVotes, 10000)
    return () => clearInterval(task)
  }, [waku, chainId, activeVoting])

  return { votes, activeVoting }
}
