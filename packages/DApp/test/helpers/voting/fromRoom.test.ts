import voting from '../../../src/helpers/voting'
import { VotingRoom } from '../../../src/models/smartContract'
import { BigNumber } from 'ethers'
import { expect } from 'chai'

describe('voting', () => {
  describe('fromRoom', () => {
    it('success', () => {
      const votingRoom: VotingRoom = {
        endAt: BigNumber.from(10000000),
        startBlock: BigNumber.from(10000000),
        voteType: 0,
        finalized: false,
        community: '0x000',
        totalVotesFor: BigNumber.from(100),
        totalVotesAgainst: BigNumber.from(100),
        voters: ['0x01', '0x02'],
        roomNumber: 1,
      }
      const room = voting.fromRoom(votingRoom)

      expect(room.type).to.eq('Remove')
      expect(room.voteFor).to.deep.eq(BigNumber.from(100))
      expect(room.voteAgainst).to.deep.eq(BigNumber.from(100))
    })
    it('different type', () => {
      const votingRoom: VotingRoom = {
        endAt: BigNumber.from(10000000),
        startBlock: BigNumber.from(10000000),
        voteType: 1,
        finalized: false,
        community: '0x000',
        totalVotesFor: BigNumber.from(1000),
        totalVotesAgainst: BigNumber.from(100),
        voters: ['0x01', '0x02'],
        roomNumber: 1,
      }
      const room = voting.fromRoom(votingRoom)

      expect(room.type).to.eq('Add')
      expect(room.voteFor).to.deep.eq(BigNumber.from(1000))
      expect(room.voteAgainst).to.deep.eq(BigNumber.from(100))
    })
  })
})
