import { useContractCall, useContractCalls } from '@usedapp/core'
import { useEffect, useState } from 'react'
import { getCommunityDetails } from '../helpers/apiMock'
import { VotingSortingEnum } from '../models/community'
import { DetailedVotingRoom } from '../models/smartContract'
import { useContracts } from './useContracts'

function isTextInRoom(filterKeyword: string, room: any) {
  return (
    room.details.name.toLowerCase().includes(filterKeyword.toLowerCase()) ||
    room.details.description.toLowerCase().includes(filterKeyword.toLowerCase()) ||
    room.details.tags.findIndex((item: any) => filterKeyword.toLowerCase() === item.toLowerCase()) > -1
  )
}

function isTypeInRoom(voteType: string, room: any) {
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

function sortFunction(sortedBy: VotingSortingEnum) {
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

export function useVotingCommunities(
  filterKeyword: string,
  voteType: string,
  sortedBy: VotingSortingEnum
): DetailedVotingRoom[] {
  const [roomsWithCommunity, setRoomsWithCommunity] = useState<any[]>([])
  const [filteredRooms, setFilteredRooms] = useState<any[]>([])

  const { votingContract } = useContracts()
  const [roomList] = useContractCall({
    abi: votingContract.interface,
    address: votingContract.address,
    method: 'getActiveVotingRooms',
    args: [],
  }) ?? [[]]

  const contractCalls = roomList.map((el: any) => {
    return {
      abi: votingContract.interface,
      address: votingContract.address,
      method: 'votingRoomMap',
      args: [el],
    }
  })

  const votingRooms = useContractCalls(contractCalls)

  useEffect(() => {
    if (votingRooms.length > 0) {
      const getPromises = async () => {
        const rooms = await Promise.all(
          votingRooms.map(async (el: any) => {
            if (el) {
              return { ...el, details: await getCommunityDetails(el.community) }
            }
            return undefined
          })
        )
        setRoomsWithCommunity(rooms)
      }
      getPromises()
    }
  }, [JSON.stringify(votingRooms)])

  useEffect(() => {
    const filteredRooms = roomsWithCommunity.filter((room: any) => {
      if (room) {
        return isTextInRoom(filterKeyword, room) && isTypeInRoom(voteType, room)
      }
      return false
    })
    setFilteredRooms(filteredRooms.sort(sortFunction(sortedBy)))
  }, [roomsWithCommunity, filterKeyword, voteType, sortedBy])

  return filteredRooms
}
