import { useContractCall, useContractCalls } from '@usedapp/core'
import { useEffect, useState } from 'react'
import { getCommunityDetails } from '../helpers/apiMock'
import { DetailedVotingRoom } from '../models/smartContract'
import { useContracts } from './useContracts'

export function useVotingCommunities(filterKeyword: string): DetailedVotingRoom[] {
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
    setFilteredRooms(
      roomsWithCommunity.filter((room: any) => {
        if (room) {
          return (
            room.details.name.toLowerCase().includes(filterKeyword.toLowerCase()) ||
            room.details.description.toLowerCase().includes(filterKeyword.toLowerCase()) ||
            room.details.tags.findIndex((item: any) => filterKeyword.toLowerCase() === item.toLowerCase()) > -1
          )
        }
        return false
      })
    )
  }, [roomsWithCommunity, filterKeyword])

  return filteredRooms
}
