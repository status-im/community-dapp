import { useCommunitiesProvider } from '../providers/communities/provider'
// import { useWakuFeature } from '../providers/wakuFeature/provider'
import { CommunityDetail } from '../models/community'
import { useEffect } from 'react'
import { useContractCalls } from '@usedapp/core'
import { useContracts } from './useContracts'
import { useWaku } from '../providers/waku/provider'
import { deserializePublicKey } from '@status-im/js'

export function useCommunities(publicKeys: string[]): CommunityDetail[] {
  const { communitiesDetails, dispatch } = useCommunitiesProvider()

  const { client } = useWaku()
  // const { featureVotes } = useWakuFeature()

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

  // useEffect(() => {
  //   setReturnCommunities(
  //     publicKeys.map((publicKey) => {
  //       const detail = communitiesDetails[publicKey]
  //       if (detail) {
  //         if (featureVotes[publicKey]) {
  //           return { ...detail, featureVotes: featureVotes[publicKey].sum }
  //         } else {
  //           return { ...detail, featureVotes: BigNumber.from(0) }
  //         }
  //       } else {
  //         return undefined
  //       }
  //     })
  //   )
  // }, [communitiesDetails, featureVotes, JSON.stringify(publicKeys)])

  useEffect(() => {
    if (!client || publicKeys.length === 0) return

    const fetch = async () => {
      await Promise.all(
        publicKeys.map(async (publicKey) => {
          const deserializedPublicKey = deserializePublicKey(publicKey)

          if (communitiesDetails[deserializedPublicKey]) {
            return
          }

          const community = await client.fetchCommunityDescription(deserializedPublicKey)

          if (!community) {
            console.warn(`Community ${deserializedPublicKey} not found`)
            return
          }

          dispatch({
            publicKey: deserializedPublicKey,
            name: community!.identity!.displayName,
            description: community!.identity!.description,
            ens: community!.identity!.ensName,
            icon: URL.createObjectURL(
              new Blob([community!.identity!.images.large.payload], {
                type: 'image/jpeg',
              })
            ),
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
  }, [client, JSON.stringify(publicKeys)])

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
        // featureVotes: featureVotes[publicKey]?.sum ?? BigNumber.from(0),
      }
    })
    .filter(Boolean)

  // TypeScript doesn't know that the filter above removes undefined values
  return communities as CommunityDetail[]
}
