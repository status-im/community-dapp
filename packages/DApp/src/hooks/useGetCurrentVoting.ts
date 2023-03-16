import { useContractCall } from '@usedapp/core'
import { useEffect, useState } from 'react'
import { votingFromRoom } from '../helpers/voting'
import { CurrentVoting } from '../models/community'
import { VotingRoom } from '../models/smartContract'
import { useContracts } from './useContracts'

export function useGetCurrentVoting(publicKey: string | undefined) {
  const [currentVoting, setCurrentVoting] = useState<undefined | CurrentVoting>(undefined)
  const [votingRoomState, setVotingRoomState] = useState<undefined | VotingRoom>(undefined)
  const { votingContract } = useContracts()
  const votingRoom = useContractCall({
    abi: votingContract.interface,
    address: votingContract.address,
    method: 'getActiveVotingRoom',
    args: [publicKey],
  }) as any

  useEffect(() => {
    if (votingRoom) {
      if (votingRoom.roomNumber.toNumber() === 0 || votingRoom.finalized == true) {
        setCurrentVoting(undefined)
        setVotingRoomState(undefined)
      } else {
        setVotingRoomState(votingRoom)
        setCurrentVoting(votingFromRoom(votingRoom))
      }
    } else {
      setCurrentVoting(undefined)
      setVotingRoomState(undefined)
    }
  }, [votingRoom?.roomNumber?.toString(), votingRoom?.finalized])

  return { currentVoting, votingRoom: votingRoomState }
}
