import { getCommunityDetails } from '../helpers/apiMock'
import { useCommunitiesProvider } from '../providers/communities/provider'
import { useWakuFeature } from '../providers/wakuFeature/provider'
import { BigNumber } from 'ethers'
export function useCommunities(publicKeys: string[]) {
  const { communitiesDetails, dispatch } = useCommunitiesProvider()
  const { featureVotes } = useWakuFeature()

  return publicKeys.map((publicKey) => {
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
          let communityDetail = await getCommunityDetails(publicKey)
          if (featureVotes[publicKey]) {
            communityDetail = { ...communityDetail, featureVotes: featureVotes[publicKey].sum }
          } else {
            communityDetail = { ...communityDetail, featureVotes: BigNumber.from(0) }
          }
          if (communityDetail) {
            dispatch(communityDetail)
          }
        }
        setCommunity()
      }
      return undefined
    }
  })
}
