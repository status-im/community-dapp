import { BigNumber } from '@ethersproject/bignumber'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { ERC20Mock } from '../abi'
import { VotingContract } from '../typechain-types'

const { utils } = ethers

const publicKeys = [
  '0x0d9cb350e1dc415303e2816a21b0a439530725b4b2b42d2948e967cb211eab89d5',
  '0xe84e64498172551d998a220e1d8e5893c818ee9aa90bdb855aec0c9e65e89014b8',
]

const votingLength = 1000
const votingVerificationLength = 200
const timeBetweenVoting = 3600
const votingWithVerificationLength = votingLength + votingVerificationLength

enum VoteType {
  AGAINST,
  FOR,
}

const typedData = {
  types: {
    Vote: [
      { name: 'roomIdAndType', type: 'uint256' },
      { name: 'sntAmount', type: 'uint256' },
      { name: 'voter', type: 'address' },
      { name: 'timestamp', type: 'uint256' },
    ],
  },
  domain: {
    name: 'Voting Contract',
    version: '1',
    chainId: 31337,
    verifyingContract: '',
  },
}

const createSignedVote = async (
  signer: SignerWithAddress,
  room: number,
  type: VoteType,
  sntAmount: number,
  timestamp = 0
): Promise<VotingContract.SignedVoteStruct> => {
  const vote = {
    voter: signer.address,
    roomIdAndType: BigNumber.from(room).mul(2).add(type),
    sntAmount: BigNumber.from(sntAmount),
    timestamp: timestamp ? BigNumber.from(timestamp) : BigNumber.from(await time.latest()),
  }

  const message = {
    roomIdAndType: vote.roomIdAndType.toHexString(),
    sntAmount: vote.sntAmount.toHexString(),
    voter: vote.voter,
    timestamp: vote.timestamp.toHexString(),
  }
  const signature = await signer._signTypedData(typedData.domain, typedData.types, message)
  const splitSignature = utils.splitSignature(signature)

  return { ...vote, r: splitSignature.r, vs: splitSignature._vs }
}

const getSignedVotes = async (
  firstSigner: SignerWithAddress,
  secondSigner: SignerWithAddress,
  thirdSigner: SignerWithAddress
): Promise<VotingContract.SignedVoteStruct[]> => {
  return [
    await createSignedVote(firstSigner, 1, VoteType.FOR, 100),
    await createSignedVote(secondSigner, 1, VoteType.AGAINST, 100),
    await createSignedVote(thirdSigner, 1, VoteType.FOR, 100),
  ]
}

const voteAndFinalize = async (room: number, type: VoteType, signer: SignerWithAddress, contract: VotingContract) => {
  await contract.castVotes([await createSignedVote(signer, room, type, 100)])
  await time.increase(votingWithVerificationLength + 1)
  await contract.finalizeVotingRoom(room)
}

async function fixture() {
  const [firstSigner, secondSigner, thirdSigner] = await ethers.getSigners()

  const Erc20ContractFactory = await ethers.getContractFactory(ERC20Mock.abi, ERC20Mock.bytecode)
  const erc20Contract = await Erc20ContractFactory.deploy('MSNT', 'Mock SNT', firstSigner.address, 100000)

  await erc20Contract.transfer(secondSigner.address, 10000)
  await erc20Contract.transfer(thirdSigner.address, 10000)

  const votingContractFactory = await ethers.getContractFactory('VotingContract')
  const votingContract = await votingContractFactory.deploy(
    erc20Contract.address,
    votingLength,
    votingVerificationLength,
    timeBetweenVoting
  )

  const directoryContractFactory = await ethers.getContractFactory('Directory')
  const directoryContract = await directoryContractFactory.deploy(votingContract.address, firstSigner.address)

  await votingContract.setDirectory(directoryContract.address)

  typedData.domain.verifyingContract = votingContract.address

  return { votingContract, directoryContract, erc20Contract, firstSigner, secondSigner, thirdSigner }
}

describe('VotingContract', () => {
  it('deploys properly', async () => {
    const { votingContract, directoryContract } = await loadFixture(fixture)
    await expect(await votingContract.directory()).to.eq(directoryContract.address)
  })

  it('only owner can change directory', async () => {
    const { votingContract, secondSigner } = await loadFixture(fixture)
    const differentSender = votingContract.connect(secondSigner)
    await expect(differentSender.setDirectory(secondSigner.address)).to.be.revertedWith('Not owner')
  })

  describe('Voting Room', () => {
    describe('initialization', () => {
      it('initializes', async () => {
        const { votingContract } = await loadFixture(fixture)
        await expect(await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100)))
          .to.emit(votingContract, 'VotingRoomStarted')
          .withArgs(1, publicKeys[0])
        await expect(await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[1], BigNumber.from(100)))
          .to.emit(votingContract, 'VotingRoomStarted')
          .withArgs(2, publicKeys[1])
        await expect(
          votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[1], BigNumber.from(100))
        ).to.be.revertedWith('vote already ongoing')
      })

      it('not enough token', async () => {
        const { votingContract } = await loadFixture(fixture)
        await expect(
          votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(10000000000000))
        ).to.be.revertedWith('not enough token')
      })

      describe('directory interaction', () => {
        it('remove missing', async () => {
          const { votingContract } = await loadFixture(fixture)
          await expect(
            votingContract.initializeVotingRoom(VoteType.AGAINST, publicKeys[0], BigNumber.from(100))
          ).to.be.revertedWith('Community not in directory')
        })

        it('add already in', async () => {
          const { votingContract, directoryContract, firstSigner } = await loadFixture(fixture)
          await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, VoteType.FOR, firstSigner, votingContract)

          expect(await directoryContract.getCommunities()).to.deep.eq([publicKeys[0]])
          await expect(
            votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
          ).to.be.revertedWith('Community already in directory')
        })
      })
    })

    it('gets', async () => {
      const { votingContract } = await loadFixture(fixture)

      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
      let votingRoom1 = await votingContract.votingRooms(0)
      expect(votingRoom1.voteType).to.eq(1)
      expect(votingRoom1.finalized).to.eq(false)
      expect(votingRoom1.community).to.eq(publicKeys[0])
      expect(votingRoom1.totalVotesFor).to.eq(100)
      expect(votingRoom1.totalVotesAgainst).to.eq(0)
      expect(votingRoom1.roomNumber).to.eq(1)

      const history = await votingContract.getVotingHistory(publicKeys[0])
      expect(history.length).to.eq(1)
      expect(history[0].voteType).to.eq(1)
      expect(history[0].community).to.eq(publicKeys[0])

      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[1], BigNumber.from(100))
      const votingRoom2 = await votingContract.votingRooms(1)
      expect(votingRoom2.voteType).to.eq(1)
      expect(votingRoom2.finalized).to.eq(false)
      expect(votingRoom2.community).to.eq(publicKeys[1])
      expect(votingRoom2.totalVotesFor).to.eq(100)
      expect(votingRoom2.totalVotesAgainst).to.eq(0)
      expect(votingRoom2.roomNumber).to.eq(2)

      votingRoom1 = await votingContract.votingRooms(0)
      expect(votingRoom1.voteType).to.eq(1)
      expect(votingRoom1.finalized).to.eq(false)
      expect(votingRoom1.community).to.eq(publicKeys[0])
      expect(votingRoom1.totalVotesFor).to.eq(100)
      expect(votingRoom1.totalVotesAgainst).to.eq(0)
      expect(votingRoom1.roomNumber).to.eq(1)
    })

    describe('history', () => {
      it('saves to history', async () => {
        const { votingContract, firstSigner } = await loadFixture(fixture)
        await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
        await voteAndFinalize(1, VoteType.FOR, firstSigner, votingContract)
        expect((await votingContract.getVotingHistory(publicKeys[0])).length).to.eq(1)
        await time.increase(timeBetweenVoting + 1)
        await votingContract.initializeVotingRoom(VoteType.AGAINST, publicKeys[0], BigNumber.from(100))
        await voteAndFinalize(2, VoteType.AGAINST, firstSigner, votingContract)
        const history = await votingContract.getVotingHistory(publicKeys[0])
        expect(history.length).to.eq(2)
        expect(history[0].voteType).to.eq(1)
        expect(history[0].finalized).to.eq(true)
        expect(history[0].community).to.eq(publicKeys[0])
        expect(history[0].totalVotesFor).to.eq(BigNumber.from(100))
        expect(history[0].totalVotesAgainst).to.eq(BigNumber.from(0))
        expect(history[0].roomNumber).to.eq(BigNumber.from(1))

        expect(history[1].voteType).to.eq(0)
        expect(history[1].finalized).to.eq(true)
        expect(history[1].community).to.eq(publicKeys[0])
        expect(history[1].totalVotesFor).to.eq(BigNumber.from(100))
        expect(history[1].totalVotesAgainst).to.eq(BigNumber.from(0))
        expect(history[1].roomNumber).to.eq(BigNumber.from(2))
      })

      it("can't start vote to fast", async () => {
        const { votingContract, firstSigner } = await loadFixture(fixture)
        await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
        await voteAndFinalize(1, VoteType.FOR, firstSigner, votingContract)
        await expect(
          votingContract.initializeVotingRoom(VoteType.AGAINST, publicKeys[0], BigNumber.from(100))
        ).to.be.revertedWith('Community was in a vote recently')
      })
    })

    describe('finalization', () => {
      it('finalizes', async () => {
        const { votingContract } = await loadFixture(fixture)
        await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
        let votingRoom = await votingContract.votingRooms(0)
        expect(votingRoom.voteType).to.eq(1)
        expect(votingRoom.finalized).to.eq(false)
        expect(votingRoom.community).to.eq(publicKeys[0])
        expect(votingRoom.totalVotesFor).to.eq(100)
        expect(votingRoom.totalVotesAgainst).to.eq(0)
        expect(votingRoom.roomNumber).to.eq(1)

        await time.increase(votingWithVerificationLength + 1)
        await expect(await votingContract.finalizeVotingRoom(1))
          .to.emit(votingContract, 'VotingRoomFinalized')
          .withArgs(1, publicKeys[0], true, 1)

        votingRoom = await votingContract.votingRooms(0)
        expect(votingRoom.voteType).to.eq(1)
        expect(votingRoom.finalized).to.eq(true)
        expect(votingRoom.community).to.eq(publicKeys[0])
        expect(votingRoom.totalVotesFor).to.eq(100)
        expect(votingRoom.totalVotesAgainst).to.eq(0)
        expect(votingRoom.roomNumber).to.eq(1)
      })

      it('verifies votes', async () => {
        const { votingContract, erc20Contract, firstSigner } = await loadFixture(fixture)
        await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))

        // clear balance
        const firstSignerBalance = await erc20Contract.balanceOf(firstSigner.address)
        await erc20Contract.increaseAllowance(firstSigner.address, firstSignerBalance)
        await erc20Contract.transferFrom(firstSigner.address, erc20Contract.address, firstSignerBalance)

        await time.increase(votingWithVerificationLength + 1)
        await expect(await votingContract.finalizeVotingRoom(1))
          .to.emit(votingContract, 'NotEnoughToken')
          .withArgs(1, firstSigner.address)
          .to.emit(votingContract, 'VotingRoomFinalized')
          .withArgs(1, publicKeys[0], false, 1)
      })

      describe('directory interaction', () => {
        it('add community', async () => {
          const { votingContract, directoryContract, secondSigner } = await loadFixture(fixture)
          await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, VoteType.FOR, secondSigner, votingContract)

          const votingRoom = await votingContract.votingRooms(0)
          expect(votingRoom.voteType).to.eq(1)
          expect(votingRoom.finalized).to.eq(true)
          expect(votingRoom.community).to.eq(publicKeys[0])
          expect(votingRoom.totalVotesFor).to.eq(200)
          expect(votingRoom.totalVotesAgainst).to.eq(0)
          expect(votingRoom.roomNumber).to.eq(1)

          expect(await directoryContract.getCommunities()).to.deep.eq([publicKeys[0]])
        })

        it('remove community', async () => {
          const { votingContract, directoryContract, secondSigner } = await loadFixture(fixture)
          await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, VoteType.FOR, secondSigner, votingContract)

          expect(await directoryContract.getCommunities()).to.deep.eq([publicKeys[0]])
          await time.increase(timeBetweenVoting + 1)
          await votingContract.initializeVotingRoom(VoteType.AGAINST, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(2, VoteType.FOR, secondSigner, votingContract)
          expect(await directoryContract.getCommunities()).to.deep.eq([])
        })

        it('failed add vote', async () => {
          const { votingContract, directoryContract, secondSigner } = await loadFixture(fixture)
          await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, VoteType.AGAINST, secondSigner, votingContract)

          expect(await directoryContract.getCommunities()).to.deep.eq([])
        })

        it('failed remove vote', async () => {
          const { votingContract, directoryContract, secondSigner } = await loadFixture(fixture)
          await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, VoteType.FOR, secondSigner, votingContract)

          expect(await directoryContract.getCommunities()).to.deep.eq([publicKeys[0]])
          await time.increase(timeBetweenVoting + 1)
          await votingContract.initializeVotingRoom(VoteType.AGAINST, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(2, VoteType.AGAINST, secondSigner, votingContract)
          expect(await directoryContract.getCommunities()).to.deep.eq([publicKeys[0]])
        })
      })
    })
  })

  describe('helpers', () => {
    it('getActiveVotingRoom', async () => {
      const { votingContract } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))

      const votingRoom1 = await votingContract.getActiveVotingRoom(publicKeys[0])
      expect(votingRoom1.voteType).to.eq(1)
      expect(votingRoom1.finalized).to.eq(false)
      expect(votingRoom1.community).to.eq(publicKeys[0])
      expect(votingRoom1.totalVotesFor).to.eq(100)
      expect(votingRoom1.totalVotesAgainst).to.eq(0)
      expect(votingRoom1.roomNumber).to.eq(1)

      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[1], BigNumber.from(100))

      const votingRoom2 = await votingContract.getActiveVotingRoom(publicKeys[1])
      expect(votingRoom2.voteType).to.eq(1)
      expect(votingRoom2.finalized).to.eq(false)
      expect(votingRoom2.community).to.eq(publicKeys[1])
      expect(votingRoom2.totalVotesFor).to.eq(100)
      expect(votingRoom2.totalVotesAgainst).to.eq(0)
      expect(votingRoom2.roomNumber).to.eq(2)
    })

    it('get active votes', async () => {
      const { votingContract } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
      expect(await votingContract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(1)])

      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[1], BigNumber.from(100))
      expect(await votingContract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(1), BigNumber.from(2)])

      await time.increase(votingWithVerificationLength + 1)

      await votingContract.finalizeVotingRoom(1)
      expect(await votingContract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(2)])

      await votingContract.finalizeVotingRoom(2)
      expect(await votingContract.getActiveVotingRooms()).to.deep.eq([])
    })
  })

  describe('voting', () => {
    it('check voters', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
      const votes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)

      expect(await votingContract.listRoomVoters(1)).to.deep.eq([firstSigner.address])
      await votingContract.castVotes(votes.slice(2))
      expect(await votingContract.listRoomVoters(1)).to.deep.eq([firstSigner.address, thirdSigner.address])
    })

    it('not enough tokens', async () => {
      const { votingContract, secondSigner } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))

      const vote: [string, BigNumber, BigNumber, BigNumber] = [
        secondSigner.address,
        BigNumber.from(1).mul(2).add(1),
        BigNumber.from(100000000000),
        BigNumber.from(await time.latest()),
      ]
      const message = {
        roomIdAndType: vote[1].toHexString(),
        sntAmount: vote[2].toHexString(),
        voter: vote[0],
        timestamp: vote[3].toHexString(),
      }
      const signature = await secondSigner._signTypedData(typedData.domain, typedData.types, message)
      const sig = utils.splitSignature(signature)

      await expect(
        await votingContract.castVotes([
          { voter: vote[0], roomIdAndType: vote[1], sntAmount: vote[2], timestamp: vote[3], r: sig.r, vs: sig._vs },
        ])
      )
        .to.emit(votingContract, 'NotEnoughToken')
        .withArgs(1, secondSigner.address)

      const votingRoom = await votingContract.votingRooms(0)
      expect(votingRoom.voteType).to.eq(1)
      expect(votingRoom.finalized).to.eq(false)
      expect(votingRoom.community).to.eq(publicKeys[0])
      expect(votingRoom.totalVotesFor).to.eq(100)
      expect(votingRoom.totalVotesAgainst).to.eq(0)
      expect(votingRoom.roomNumber).to.eq(1)
    })

    it('success', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
      const votes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      await votingContract.castVotes(votes)

      const votingRoom = await votingContract.votingRooms(0)
      expect(votingRoom.voteType).to.eq(1)
      expect(votingRoom.finalized).to.eq(false)
      expect(votingRoom.community).to.eq(publicKeys[0])
      expect(votingRoom.totalVotesFor).to.eq(200)
      expect(votingRoom.totalVotesAgainst).to.eq(100)
      expect(votingRoom.roomNumber).to.eq(1)
    })

    it('double vote', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
      const votes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      await votingContract.castVotes(votes)
      await votingContract.castVotes(votes)

      const votingRoom = await votingContract.votingRooms(0)
      expect(votingRoom.voteType).to.eq(1)
      expect(votingRoom.finalized).to.eq(false)
      expect(votingRoom.community).to.eq(publicKeys[0])
      expect(votingRoom.totalVotesFor).to.eq(200)
      expect(votingRoom.totalVotesAgainst).to.eq(100)
      expect(votingRoom.roomNumber).to.eq(1)
    })

    it('none existent room', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      const votes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      await expect(votingContract.castVotes(votes)).to.be.reverted
    })

    it('old room', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))

      await time.increase(votingWithVerificationLength + 1)

      const signedVotes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      await expect(votingContract.castVotes(signedVotes)).to.be.reverted
    })

    it('wrong signature', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))

      await time.increase(votingWithVerificationLength + 1)

      const signedVotes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      const wronglySignedVotes = signedVotes.map((msg) => {
        return {
          ...msg,
          r: '0x2d63286985277c440b9f01a987fbbc9bc9ca32cb4e9e55ee3ffcab4e67c211e6',
          vs: '0x2d63286985277c440b9f01a987fbbc9bc9ca32cb4e9e55ee3ffcab4e67c211e6',
        }
      })

      await votingContract.castVotes(wronglySignedVotes)
      await expect(await votingContract.listRoomVoters(1)).to.deep.eq([firstSigner.address])
    })

    it('validates vote timestamp', async () => {
      const { votingContract, secondSigner } = await loadFixture(fixture)

      const voteBefore = await createSignedVote(secondSigner, 1, VoteType.FOR, 100)
      await time.increase(1)

      await votingContract.initializeVotingRoom(VoteType.FOR, publicKeys[0], BigNumber.from(100))
      await expect(votingContract.castVotes([voteBefore])).to.be.revertedWith('invalid vote timestamp')

      await time.increase(votingLength + 1)
      const voteAfter = await createSignedVote(secondSigner, 1, VoteType.FOR, 100)
      await expect(votingContract.castVotes([voteAfter])).to.be.revertedWith('invalid vote timestamp')
    })
  })
})
