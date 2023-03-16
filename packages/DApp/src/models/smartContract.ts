import { BigNumber } from 'ethers'
import { CommunityDetail } from './community'

export type VotingRoom = {
  startBlock: BigNumber
  endAt: BigNumber
  voteType: 0 | 1
  finalized: boolean
  community: string
  totalVotesFor: BigNumber
  totalVotesAgainst: BigNumber
  roomNumber: number
}

export type DetailedVotingRoom = VotingRoom & { details: CommunityDetail }
