import { BigNumber } from 'ethers'

export type VotingRoom = {
  startBlock: BigNumber
  endAt: BigNumber
  voteType: 0 | 1
  finalized: boolean
  community: string
  totalVotesFor: BigNumber
  totalVotesAgainst: BigNumber
  voters: string[]
}
