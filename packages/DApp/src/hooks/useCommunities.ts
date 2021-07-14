import { getCommunityDetails } from '../helpers/apiMock'
import { useCommunitiesProvider } from '../providers/communities/provider'

export function useCommunities(publicKeys: string[]) {
  const { communitiesDetails, dispatch } = useCommunitiesProvider()

  return publicKeys.map((publicKey) => {
    const detail = communitiesDetails[publicKey]
    if (detail) {
      return { ...detail }
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
}
