import { getCommunityDetails } from '../helpers/apiMock'
import { useCommunitiesProvider } from '../providers/communities/provider'
import { useWakuFeature } from '../providers/wakuFeature/provider'
import { BigNumber } from 'ethers'
import { CommunityDetail } from '../models/community'
import { useEffect, useState } from 'react'

export function useCommunities(publicKeys: string[]) {
  const { communitiesDetails, dispatch } = useCommunitiesProvider()
  const { featureVotes } = useWakuFeature()

  const [returnCommunities, setReturnCommunities] = useState<(CommunityDetail | undefined)[]>([])

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
          if (publicKey) {
            const setCommunity = async () => {
              const communityDetail = await getCommunityDetails(publicKey)
              if (communityDetail) {
                dispatch(communityDetail)
              }
            }
            setCommunity()
          }
          return undefined
        }
      })
    )
  }, [communitiesDetails, featureVotes, JSON.stringify(publicKeys)])

  return returnCommunities
}
