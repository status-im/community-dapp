import { CommunityDetail, DirectorySortingEnum, VotingSortingEnum } from '../models/community'
import { DetailedVotingRoom } from '../models/smartContract'

export function isTextInDetails(filterKeyword: string, details: any) {
  return (
    details.name.toLowerCase().includes(filterKeyword.toLowerCase()) ||
    details.description.toLowerCase().includes(filterKeyword.toLowerCase()) ||
    details.tags.findIndex((item: any) => filterKeyword.toLowerCase() === item.toLowerCase()) > -1
  )
}

export function isTypeInRoom(voteType: string, room: any) {
  if (!voteType) {
    return true
  }
  if (voteType === 'Add') {
    return room.voteType === 1
  }
  if (voteType === 'Remove') {
    return room.voteType === 0
  }
  return false
}

export function sortVotingFunction(sortedBy: VotingSortingEnum) {
  switch (sortedBy) {
    case VotingSortingEnum.AtoZ:
      return (a: DetailedVotingRoom, b: DetailedVotingRoom) => (a.details.name < b.details.name ? -1 : 1)
    case VotingSortingEnum.ZtoA:
      return (a: DetailedVotingRoom, b: DetailedVotingRoom) => (a.details.name < b.details.name ? 1 : -1)
    case VotingSortingEnum.EndingLatest:
      return (a: DetailedVotingRoom, b: DetailedVotingRoom) => {
        return a.endAt < b.endAt ? -1 : 1
      }
    case VotingSortingEnum.EndingSoonest:
      return (a: DetailedVotingRoom, b: DetailedVotingRoom) => {
        return a.endAt < b.endAt ? 1 : -1
      }
    case VotingSortingEnum.MostVotes:
      return (a: DetailedVotingRoom, b: DetailedVotingRoom) => {
        const aSum = a.totalVotesAgainst.add(a.totalVotesFor)
        const bSum = b.totalVotesAgainst.add(b.totalVotesFor)
        return aSum < bSum ? 1 : -1
      }
    case VotingSortingEnum.LeastVotes:
      return (a: DetailedVotingRoom, b: DetailedVotingRoom) => {
        const aSum = a.totalVotesAgainst.add(a.totalVotesFor)
        const bSum = b.totalVotesAgainst.add(b.totalVotesFor)
        return aSum < bSum ? -1 : 1
      }
  }
}

export function sortDirectoryFunction(sortedBy: DirectorySortingEnum) {
  switch (sortedBy) {
    case DirectorySortingEnum.AtoZ:
      return (a: CommunityDetail, b: CommunityDetail) => (a.name < b.name ? -1 : 1)
    case DirectorySortingEnum.ZtoA:
      return (a: CommunityDetail, b: CommunityDetail) => (a.name < b.name ? 1 : -1)
    case DirectorySortingEnum.IncludedLongAgo:
      return (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.directoryInfo) return 1
        if (!b.directoryInfo) return -1
        return a?.directoryInfo?.additionDate < b?.directoryInfo?.additionDate ? -1 : 1
      }
    case DirectorySortingEnum.IncludedRecently:
      return (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.directoryInfo) return -1
        if (!b.directoryInfo) return 1
        return a?.directoryInfo?.additionDate < b?.directoryInfo?.additionDate ? 1 : -1
      }
    case DirectorySortingEnum.MostVotes:
      return (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.directoryInfo?.featureVotes) return 1
        if (!b.directoryInfo?.featureVotes) return -1
        return a?.directoryInfo?.featureVotes < b?.directoryInfo?.featureVotes ? 1 : -1
      }
    case DirectorySortingEnum.LeastVotes:
      return (a: CommunityDetail, b: CommunityDetail) => {
        if (!a.directoryInfo?.featureVotes) return 1
        if (!b.directoryInfo?.featureVotes) return -1
        return a?.directoryInfo?.featureVotes < b?.directoryInfo?.featureVotes ? -1 : 1
      }
  }
}
