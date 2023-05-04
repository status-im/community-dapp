import { CurrentVoting } from '../models/community'
import { VotingRoom } from '../models/smartContract'

export function getVotingWinner(vote: CurrentVoting) {
  if (vote?.timeLeft <= 0) {
    return vote.voteFor.gt(vote.voteAgainst) ? 2 : 1
  }
  return undefined
}

export function votingFromRoom(votingRoom: VotingRoom) {
  const currentVoting: CurrentVoting = {
    timeLeft: votingRoom.verificationStartAt.toNumber() * 1000 - Date.now(),
    timeLeftVerification: votingRoom.endAt.toNumber() * 1000 - Date.now(),
    type: votingRoom.voteType === 1 ? 'Add' : 'Remove',
    voteFor: votingRoom.totalVotesFor,
    voteAgainst: votingRoom.totalVotesAgainst,
    ID: votingRoom.roomNumber,
  }
  return currentVoting
}

export default { getWinner: getVotingWinner, fromRoom: votingFromRoom }
