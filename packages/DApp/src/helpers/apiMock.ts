import { communities, communitiesInDirectory, communitiesUnderVote } from './apiMockData'
import { CommunityDetail, DirectorySortingEnum, VotingSortingEnum } from '../models/community'
import { APIOptions } from '../models/api'

export function getCommunityDetails(publicKey: string) {
  return communities.filter((community) => community.publicKey == publicKey)[0]
}

function filterCommunities(resolvedCommunities: CommunityDetail[], filterKeyword?: string) {
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

  return filteredCommunities
}

export function getCommunitiesInDirectorySync(
  numberPerPage: number,
  pageNumber: number,
  sortedBy?: DirectorySortingEnum,
  filterKeyword?: string
) {
  const resolvedCommunities = communitiesInDirectory.map(
    (communityAddress) => communities.filter((e) => e.publicKey === communityAddress)[0]
  )

  const filteredCommunities = filterCommunities(resolvedCommunities, filterKeyword)

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

export async function getCommunitiesInDirectory(
  pageNumber: number,
  { numberPerPage, sortedBy, filterKeyword }: APIOptions
) {
  await new Promise((r) => setTimeout(r, 3000))
  return getCommunitiesInDirectorySync(numberPerPage, pageNumber, sortedBy, filterKeyword)
}

export function getCommunitiesUnderVoteSync(
  numberPerPage: number,
  pageNumber: number,
  sortedBy?: VotingSortingEnum,
  filterKeyword?: string,
  types: any = {
    Add: true,
    Remove: true,
  }
) {
  const resolvedCommunities = communitiesUnderVote.map(
    (communityAddress) => communities.filter((e) => e.publicKey === communityAddress)[0]
  )

  const correctTypeCommunities = resolvedCommunities.filter((e) => {
    if (!e.currentVoting) {
      return false
    }
    return types[e.currentVoting.type]
  })

  const filteredCommunities = filterCommunities(correctTypeCommunities, filterKeyword)

  let sortFunction = undefined
  switch (sortedBy) {
    case VotingSortingEnum.AtoZ:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => (a.name < b.name ? -1 : 1)
      break
    case VotingSortingEnum.ZtoA:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => (a.name < b.name ? 1 : -1)
      break
    case VotingSortingEnum.EndingLatest:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.currentVoting) return 1
        if (!b.currentVoting) return -1
        return a.currentVoting?.timeLeft > b?.currentVoting?.timeLeft ? -1 : 1
      }
      break
    case VotingSortingEnum.EndingSoonest:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.currentVoting) return -1
        if (!b.currentVoting) return 1
        return a.currentVoting?.timeLeft > b?.currentVoting?.timeLeft ? 1 : -1
      }
      break
    case VotingSortingEnum.MostVotes:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.currentVoting?.voteAgainst) return 1
        if (!a.currentVoting?.voteFor) return 1
        if (!b.currentVoting?.voteAgainst) return -1
        if (!b.currentVoting.voteFor) return -1
        const aSum = a.currentVoting.voteAgainst.add(a.currentVoting.voteFor)
        const bSum = b.currentVoting.voteAgainst.add(b.currentVoting.voteFor)
        return aSum < bSum ? -1 : 1
      }
      break
    case VotingSortingEnum.LeastVotes:
      sortFunction = (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.currentVoting?.voteAgainst) return 1
        if (!a.currentVoting?.voteFor) return 1
        if (!b.currentVoting?.voteAgainst) return -1
        if (!b.currentVoting.voteFor) return -1
        const aSum = a.currentVoting.voteAgainst.add(a.currentVoting.voteFor)
        const bSum = b.currentVoting.voteAgainst.add(b.currentVoting.voteFor)
        return aSum < bSum ? 1 : -1
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
export async function getCommunitiesUnderVote(
  pageNumber: number,
  { numberPerPage, sortedBy, filterKeyword, types }: APIOptions
) {
  await new Promise((r) => setTimeout(r, 3000))
  return getCommunitiesUnderVoteSync(numberPerPage, pageNumber, sortedBy, filterKeyword, types)
}
