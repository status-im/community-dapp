import { useContractCall, useContractCalls } from '@usedapp/core'
import { useEffect, useState } from 'react'
import { getCommunityDetails } from '../helpers/apiMock'
import { VotingSortingEnum } from '../models/community'
import { DetailedVotingRoom } from '../models/smartContract'
import { useContracts } from './useContracts'
import { isTextInDetails, isTypeInRoom, sortVotingFunction } from '../helpers/communityFiltering'

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
        return isTextInDetails(filterKeyword, room.details) && isTypeInRoom(voteType, room)
      }
      return false
    })
    setFilteredRooms(filteredRooms.sort(sortVotingFunction(sortedBy)))
  }, [roomsWithCommunity, filterKeyword, voteType, sortedBy])

  return filteredRooms
}
