import { expect, use } from 'chai'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import MockContract from '../build/MockContract.json'
import { Contract, utils, BigNumber, providers } from 'ethers'

use(solidity)

describe('Contract', () => {
  const provider = new MockProvider()
  const [alice, firstAddress, secondAddress] = provider.getWallets()
  let contract: Contract

  beforeEach(async () => {
    contract = await deployContract(alice, MockContract)
    await provider.send('evm_mine', [Math.floor(Date.now() / 1000)])
  })

  describe('Voting Room', () => {
    it('initializes', async () => {
      expect(await contract.initializeVotingRoom(1, firstAddress.address))
        .to.emit(contract, 'VotingRoomStarted')
        .withArgs(1)
      expect(await contract.initializeVotingRoom(1, secondAddress.address))
        .to.emit(contract, 'VotingRoomStarted')
        .withArgs(2)
      await expect(contract.initializeVotingRoom(1, secondAddress.address)).to.be.revertedWith('vote already ongoing')
    })

    it('gets', async () => {
      await contract.initializeVotingRoom(1, firstAddress.address)
      expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        false,
        firstAddress.address,
        BigNumber.from(0),
        BigNumber.from(0),
      ])

      await contract.initializeVotingRoom(1, secondAddress.address)
      expect((await contract.votingRoomMap(2)).slice(2)).to.deep.eq([
        1,
        false,
        secondAddress.address,
        BigNumber.from(0),
        BigNumber.from(0),
      ])
      expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        false,
        firstAddress.address,
        BigNumber.from(0),
        BigNumber.from(0),
      ])
    })

    it('finalizes', async () => {
      await contract.initializeVotingRoom(1, firstAddress.address)
      expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        false,
        firstAddress.address,
        BigNumber.from(0),
        BigNumber.from(0),
      ])
      await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 2000)])
      expect(await contract.finalizeVotingRoom(1))
        .to.emit(contract, 'VotingRoomFinalized')
        .withArgs(1)
      expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        true,
        firstAddress.address,
        BigNumber.from(0),
        BigNumber.from(0),
      ])
    })
  })

  describe('helpers', () => {
    it('get active votes', async () => {
      await contract.initializeVotingRoom(1, firstAddress.address)
      expect(await contract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(1)])

      await contract.initializeVotingRoom(1, secondAddress.address)
      expect(await contract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(1), BigNumber.from(2)])
      await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 2000)])
      await contract.finalizeVotingRoom(1)
      expect(await contract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(2)])
      await contract.finalizeVotingRoom(2)
      expect(await contract.getActiveVotingRooms()).to.deep.eq([])
      await contract.initializeVotingRoom(1, secondAddress.address)
      expect(await contract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(3)])
    })
  })

  describe('voting', () => {
    const votes = [
      {
        voter: alice,
        vote: 1,
        sntAmount: BigNumber.from(100),
        sessionID: 1,
      },
      {
        voter: firstAddress,
        vote: 0,
        sntAmount: BigNumber.from(100),
        nonce: 1,
        sessionID: 1,
      },
      {
        voter: secondAddress,
        vote: 1,
        sntAmount: BigNumber.from(100),
        sessionID: 1,
      },
    ]
    const types = ['address', 'uint256', 'uint256']
    const messages = votes.map((vote) => [
      vote.voter.address,
      BigNumber.from(vote.sessionID).mul(2).add(vote.vote),
      vote.sntAmount,
    ])

    let signedMessages: any[] = []

    beforeEach(async () => {
      signedMessages = await Promise.all(
        messages.map(async (message, idx) => {
          const returnArray = [...message]
          const signature = utils.splitSignature(
            await votes[idx].voter.signMessage(utils.arrayify(utils.solidityPack(types, message)))
          )
          returnArray.push(signature.r)
          returnArray.push(signature._vs)
          return returnArray
        })
      )
    })

    it('check voters', async () => {
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24')

      expect(await contract.listRoomVoters(1)).to.deep.eq([])
      await contract.castVotes(signedMessages.slice(2))
      expect(await contract.listRoomVoters(1)).to.deep.eq([secondAddress.address])
      await contract.castVotes(signedMessages.slice(0, 1))
      expect(await contract.listRoomVoters(1)).to.deep.eq([secondAddress.address, alice.address])
    })

    it('success', async () => {
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24')
      await contract.castVotes(signedMessages)
      expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        false,
        '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24',
        BigNumber.from(200),
        BigNumber.from(100),
      ])
    })

    it('double vote', async () => {
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24')
      await contract.castVotes(signedMessages)
      await contract.castVotes(signedMessages)
      expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        false,
        '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24',
        BigNumber.from(200),
        BigNumber.from(100),
      ])
    })

    it('random bytes', async () => {
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24')
      await expect(contract.castVotes([new Uint8Array([12, 12, 12])])).to.be.reverted
    })

    it('none existent room', async () => {
      await expect(contract.castVotes(signedMessages)).to.be.reverted
    })

    it('old room', async () => {
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24')
      await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 2000)])
      await expect(contract.castVotes(signedMessages)).to.be.reverted
    })

    it('wrong signature', async () => {
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24')
      await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 2000)])

      signedMessages = await Promise.all(
        messages.map(async (message) => {
          const returnArray = [...message]
          const signature = utils.splitSignature(
            await alice.signMessage(utils.arrayify(utils.solidityPack(types, message)))
          )
          returnArray.push(signature.r)
          returnArray.push(signature._vs)
          return returnArray
        })
      )

      await expect(contract.castVotes(signedMessages)).to.be.reverted
    })
  })
})
