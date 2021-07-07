import { DetailedVotingRoom } from '../models/smartContract'
import { useVotesAggregate } from './useVotesAggregate'

export function useRoomAggregateVotes(room: DetailedVotingRoom, showConfirmModal: boolean) {
  const { votes } = useVotesAggregate(room.roomNumber)
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
    room = { ...room, totalVotesAgainst: reducedVotes.against, totalVotesFor: reducedVotes.for }
  }
  return room
}
