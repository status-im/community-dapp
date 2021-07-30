import { useEffect, useState } from 'react'
import { DetailedVotingRoom } from '../models/smartContract'
import { useVotesAggregate } from './useVotesAggregate'

export function useRoomAggregateVotes(room: DetailedVotingRoom, showConfirmModal: boolean) {
  const { votes } = useVotesAggregate(room.roomNumber)

  const [returnRoom, setReturnRoom] = useState(room)

  useEffect(() => {
    if (room.endAt.toNumber() * 1000 > Date.now() && showConfirmModal === false) {
      const reducedVotes = votes.reduce(
        (accumulator, vote) => {
          if (vote[1].mod(2).toNumber()) {
            return { for: accumulator.for.add(vote[2]), against: accumulator.against }
          }
          return { for: accumulator.for, against: accumulator.against.add(vote[2]) }
        },
        { for: room.totalVotesFor, against: room.totalVotesAgainst }
      )
      setReturnRoom({ ...room, totalVotesAgainst: reducedVotes.against, totalVotesFor: reducedVotes.for })
    }
  }, [JSON.stringify(votes), JSON.stringify(room), showConfirmModal])

  return returnRoom
}
