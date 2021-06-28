import { useContractCall } from '@usedapp/core'
import { useEffect, useState } from 'react'
import { getCommunityDetails } from '../helpers/apiMock'
import { CommunityDetail } from '../models/community'
import { useContracts } from './useContracts'
import voting from '../helpers/voting'

export function useCommunity(room: number) {
  const { votingContract } = useContracts()

  const votingRoom = useContractCall({
    abi: votingContract.interface,
    address: votingContract.address,
    method: 'votingRoomMap',
    args: [room],
  }) as any

  const [community, setCommunity] = useState<CommunityDetail | undefined>(undefined)

  useEffect(() => {
    const getCurrentVoting = async () => {
      const communityDetails = await getCommunityDetails(votingRoom['community'])
      if (communityDetails) {
        communityDetails.currentVoting = voting.fromRoom(votingRoom)
        setCommunity(communityDetails)
      }
    }
    if (votingRoom) {
      getCurrentVoting()
    }
  }, [votingRoom])
  return { community }
}
