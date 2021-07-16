import { useContractCall, useContractCalls } from '@usedapp/core'
import { useEffect, useState } from 'react'
import { VotingSortingEnum } from '../models/community'
import { DetailedVotingRoom } from '../models/smartContract'
import { useContracts } from './useContracts'
import { isTextInDetails, isTypeInRoom, sortVotingFunction } from '../helpers/communityFiltering'
import { useCommunities } from './useCommunities'

export function useVotingCommunities(
  filterKeyword: string,
  voteType: string,
  sortedBy: VotingSortingEnum
): { roomsToShow: DetailedVotingRoom[]; empty: boolean } {
  const [roomsWithCommunity, setRoomsWithCommunity] = useState<any[]>([])
  const [filteredRooms, setFilteredRooms] = useState<any[]>([])
  const [empty, setEmpty] = useState(false)
  const { votingContract } = useContracts()
  const [roomList] = useContractCall({
    abi: votingContract.interface,
    address: votingContract.address,
    method: 'getActiveVotingRooms',
    args: [],
  }) ?? [[]]

  useEffect(() => {
    if (roomList.length === 0 && empty == false) {
      setEmpty(true)
    }
    if (roomList.length > 0 && empty == true) {
      setEmpty(false)
    }
  }, [JSON.stringify(roomList)])

  const contractCalls = roomList.map((el: any) => {
    return {
      abi: votingContract.interface,
      address: votingContract.address,
      method: 'votingRoomMap',
      args: [el],
    }
  })

  const votingRooms = useContractCalls(contractCalls)
  const publicKeys = votingRooms.map((votingRoom: any) => votingRoom?.community)
  const communitiesDetails = useCommunities(publicKeys)

  useEffect(() => {
    if (votingRooms.length > 0) {
      const rooms = votingRooms.map((el: any) => {
        if (el) {
          return { ...el, details: communitiesDetails.find((comm) => comm?.publicKey === el.community) }
        }
        return undefined
      })
      setRoomsWithCommunity(rooms)
    }
  }, [JSON.stringify(votingRooms), JSON.stringify(communitiesDetails)])

  useEffect(() => {
    const filteredRooms = roomsWithCommunity.filter((room: any) => {
      if (room && room.details) {
        return isTextInDetails(filterKeyword, room.details) && isTypeInRoom(voteType, room)
      }
      return true
    }) as (any | undefined)[]
    setFilteredRooms(filteredRooms.sort(sortVotingFunction(sortedBy)))
  }, [roomsWithCommunity, filterKeyword, voteType, sortedBy])

  return { roomsToShow: filteredRooms, empty }
}
