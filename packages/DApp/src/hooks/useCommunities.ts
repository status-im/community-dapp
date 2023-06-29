import { useCommunitiesProvider } from '../providers/communities/provider'
import { CommunityDetail } from '../models/community'
import { useEffect } from 'react'
import { useContractCalls } from '@usedapp/core'
import { useContracts } from './useContracts'
import { useWaku } from '../providers/waku/provider'
import { deserializePublicKey, RequestClient } from '@status-im/js'
import { BigNumber } from 'ethers'
import { useFeaturedVotes } from './useFeaturedVotes'

export function useCommunities(publicKeys: string[]): CommunityDetail[] {
  const { communitiesDetails, dispatch } = useCommunitiesProvider()
  const { waku } = useWaku()
  const { votes } = useFeaturedVotes()

  const { votingContract } = useContracts()

  const votingHistories =
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

  useEffect(() => {
    if (!waku || publicKeys.length === 0) return

    const fetch = async () => {
      await Promise.all(
        publicKeys.map(async (publicKey) => {
          const deserializedPublicKey = deserializePublicKey(publicKey)

          if (communitiesDetails[deserializedPublicKey]) {
            return
          }

          const requestClient = new RequestClient(waku)
          const community = await requestClient.fetchCommunityDescription(deserializedPublicKey)

          if (!community) {
            console.warn(`Community ${deserializedPublicKey} not found`)
            return
          }

          dispatch({
            publicKey: deserializedPublicKey,
            name: community!.identity!.displayName,
            description: community!.identity!.description,
            ens: community!.identity!.ensName,
            icon: community!.identity!.images.large
              ? URL.createObjectURL(
                  new Blob([community!.identity!.images.large.payload], {
                    type: 'image/jpeg',
                  })
                )
              : null,
            link: `https://join.status.im/c/${deserializedPublicKey}}`,
            currentVoting: undefined,
            tags: community.tags,
            numberOfMembers: Object.keys(community.members).length,
            votingHistory: [],
            validForAddition: true,
          })
        })
      )
    }

    fetch()
  }, [waku, JSON.stringify(publicKeys)])

  const communities = publicKeys
    .map((publicKey, index) => {
      const deserializedPublicKey = deserializePublicKey(publicKey)
      if (!communitiesDetails[deserializedPublicKey]) {
        return
      }

      const votingRooms = votingHistories[index]?.[0]

      const votingHistory =
        votingRooms?.map((room: any) => {
          const endAt = new Date(room.endAt.toNumber() * 1000)
          return {
            ID: room.roomNumber.toNumber(),
            type: room.voteType === 1 ? 'Add' : 'Remove',
            result:
              endAt > new Date() ? 'Ongoing' : room.totalVotesFor.gt(room.totalVotesAgainst) ? 'Passed' : 'Failed',
            date: endAt,
          } as const
        }) ?? []

      return {
        ...communitiesDetails[deserializedPublicKey],
        votingHistory,
        featureVotes: votes?.[publicKey]?.sum ?? BigNumber.from(0),
      }
    })
    .filter(Boolean)

  // TypeScript doesn't know that the filter above removes undefined values
  return communities as CommunityDetail[]
}
