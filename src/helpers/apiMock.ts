import { communities, communitiesInDirectory } from './apiMockData'
import { CommunityDetail, DirectorySortingEnum } from '../models/community'

export function getCommunityDetails(publicKey: string) {
  return communities.filter((community) => community.publicKey == publicKey)[0]
}

export function getCommunitiesInDirectory(
  numberPerPage: number,
  pageNumber: number,
  sortedBy?: DirectorySortingEnum,
  filterKeyword?: string
) {
  const resolvedCommunities = communitiesInDirectory.map(
    (communityAddress) => communities.filter((e) => e.publicKey === communityAddress)[0]
  )
  let filteredCommunities = undefined

  if (filterKeyword) {
    filteredCommunities = resolvedCommunities.filter(
      (community) =>
        community.name.toLowerCase().includes(filterKeyword.toLowerCase()) ||
        community.description.toLowerCase().includes(filterKeyword.toLowerCase()) ||
        community.tags.findIndex((item) => filterKeyword.toLowerCase() === item.toLowerCase()) > -1
    )
  } else {
    filteredCommunities = resolvedCommunities
  }

  let sortFunction = undefined
  switch (sortedBy) {
    case DirectorySortingEnum.AtoZ:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => (a.name < b.name ? -1 : 1)
      break
    case DirectorySortingEnum.ZtoA:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => (a.name < b.name ? 1 : -1)
      break
    case DirectorySortingEnum.IncludedLongAgo:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.directoryInfo) return 1
        if (!b.directoryInfo) return -1
        return a?.directoryInfo?.additionDate < b?.directoryInfo?.additionDate ? -1 : 1
      }
      break
    case DirectorySortingEnum.IncludedRecently:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.directoryInfo) return -1
        if (!b.directoryInfo) return 1
        return a?.directoryInfo?.additionDate < b?.directoryInfo?.additionDate ? 1 : -1
      }
      break
    case DirectorySortingEnum.MostVotes:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.directoryInfo?.featureVotes) return 1
        if (!b.directoryInfo?.featureVotes) return -1
        return a?.directoryInfo?.featureVotes < b?.directoryInfo?.featureVotes ? 1 : -1
      }
      break
    case DirectorySortingEnum.LeastVotes:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.directoryInfo?.featureVotes) return 1
        if (!b.directoryInfo?.featureVotes) return -1
        return a?.directoryInfo?.featureVotes < b?.directoryInfo?.featureVotes ? -1 : 1
      }
      break
  }

  const sortedCommunities = filteredCommunities.sort(sortFunction)

  const paginatedCommunities = sortedCommunities.slice(numberPerPage * pageNumber, numberPerPage * (pageNumber + 1))

  return {
    page: pageNumber,
    communities: paginatedCommunities,
  }
}
