import { getCommunityDetails } from '../helpers/apiMock'
import { useCommunitiesProvider } from '../providers/communities/provider'
import { useWakuFeature } from '../providers/wakuFeature/provider'
import { BigNumber } from 'ethers'
import { CommunityDetail } from '../models/community'
import { useEffect, useState } from 'react'
import { useContractCalls } from '@usedapp/core'
import { useContracts } from './useContracts'

export function useCommunities(publicKeys: string[]) {
  const { communitiesDetails, dispatch } = useCommunitiesProvider()
  const { featureVotes } = useWakuFeature()
  const { votingContract } = useContracts()
  const communitiesHistories =
    useContractCalls(
      publicKeys.map((publicKey) => {
        return {
          abi: votingContract.interface,
          address: votingContract.address,
          method: 'getVotingHistory',
          args: [publicKey],
        }
      })
    ) ?? []

  const [returnCommunities, setReturnCommunities] = useState<(CommunityDetail | undefined)[]>([])

  useEffect(() => {
    publicKeys.forEach((publicKey, idx) => {
      if (publicKey && communitiesHistories[idx]) {
        const setCommunity = async () => {
          const communityDetail = await getCommunityDetails(publicKey)
          if (communityDetail) {
            const communityHistory = communitiesHistories[idx]?.[0]
            if (communityHistory && communityHistory.length > 0) {
              const votingHistory = communityHistory.map((room: any) => {
                const endAt = new Date(room.endAt.toNumber() * 1000)
                return {
                  ID: room.roomNumber.toNumber(),
                  type: room.voteType === 1 ? 'Add' : 'Remove',
                  result:
                    endAt > new Date()
                      ? 'Ongoing'
                      : room.totalVotesFor.gt(room.totalVotesAgainst)
                      ? 'Passed'
                      : 'Failed',
                  date: endAt,
                }
              })
              dispatch({ ...communityDetail, votingHistory })
            } else {
              dispatch({ ...communityDetail, votingHistory: [] })
            }
          }
        }
        setCommunity()
      }
    })
  }, [JSON.stringify(publicKeys), communitiesHistories])

  useEffect(() => {
    setReturnCommunities(
      publicKeys.map((publicKey) => {
        const detail = communitiesDetails[publicKey]
        if (detail) {
          if (featureVotes[publicKey]) {
            return { ...detail, featureVotes: featureVotes[publicKey].sum }
          } else {
            return { ...detail, featureVotes: BigNumber.from(0) }
          }
        } else {
          return undefined
        }
      })
    )
  }, [communitiesDetails, featureVotes, JSON.stringify(publicKeys)])

  return returnCommunities
}
