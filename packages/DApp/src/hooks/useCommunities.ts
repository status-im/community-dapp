import { getCommunityDetails } from '../helpers/apiMock'
import { useCommunitiesProvider } from '../providers/communities/provider'
import { useWakuFeature } from '../providers/wakuFeature/provider'
import { BigNumber } from 'ethers'
import { CommunityDetail } from '../models/community'
import { useEffect, useState } from 'react'
import { useConfig } from '../providers/config'
import { useEthers } from '@usedapp/core'

export function useCommunities(publicKeys: string[]) {
  const { communitiesDetails, dispatch } = useCommunitiesProvider()
  const { featureVotes } = useWakuFeature()
  const { config } = useConfig()
  const { chainId } = useEthers()
  const [returnCommunities, setReturnCommunities] = useState<(CommunityDetail | undefined)[]>([])

  useEffect(() => {
    publicKeys.forEach((publicKey) => {
      if (publicKey) {
        const setCommunity = async () => {
          const communityDetail = await getCommunityDetails(publicKey)
          if (communityDetail) {
            try {
              const response = await fetch(config.contracts?.[chainId ?? 3]?.subgraph, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                },
                body: JSON.stringify({
                  query: `{votingRooms(where:{community: "${publicKey}"}){id,result,type,community,timestamp}}`,
                }),
              })
              const votingRooms = (await response.json())?.data?.votingRooms.sort((a: any, b: any) =>
                a.timestamp > b.timestamp ? 1 : -1
              )
              if (votingRooms && votingRooms.length > 0) {
                const votingHistory = votingRooms.map((room: any) => {
                  return {
                    ID: parseInt(room.id),
                    type: room.type === 1 ? 'Add' : 'Remove',
                    result: room.result ? 'Passed' : 'Failed',
                    date: new Date(Number.parseInt(room.timestamp) * 1000),
                  }
                })
                dispatch({ ...communityDetail, votingHistory })
              } else {
                dispatch({ ...communityDetail, votingHistory: [] })
              }
            } catch {
              dispatch({ ...communityDetail, votingHistory: [] })
            }
          }
        }
        setCommunity()
      }
    })
  }, [JSON.stringify(publicKeys)])

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
