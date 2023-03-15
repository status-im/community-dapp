import { BigNumber } from '@ethersproject/bignumber'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { ERC20Mock } from '../abi'

import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

const { utils } = ethers

const publicKeys = [
  '0x0d9cb350e1dc415303e2816a21b0a439530725b4b2b42d2948e967cb211eab89d5',
  '0xe84e64498172551d998a220e1d8e5893c818ee9aa90bdb855aec0c9e65e89014b8',
]

const typedData = {
  types: {
    Vote: [
      { name: 'roomIdAndType', type: 'uint256' },
      { name: 'sntAmount', type: 'uint256' },
      { name: 'voter', type: 'address' },
    ],
  },
  domain: {
    name: 'Voting Contract',
    version: '1',
    chainId: 0,
    verifyingContract: '',
  },
}

const getSignedVotes = async (
  firstSigner: SignerWithAddress,
  secondSigner: SignerWithAddress,
  thirdSigner: SignerWithAddress
): Promise<{ voter: string; roomIdAndType: BigNumber; sntAmount: BigNumber; r: string; vs: string }[]> => {
  const votes = [
    {
      voter: firstSigner,
      vote: 1,
      sntAmount: BigNumber.from(100),
      sessionID: 1,
    },
    {
      voter: secondSigner,
      vote: 0,
      sntAmount: BigNumber.from(100),
      sessionID: 1,
    },
    {
      voter: thirdSigner,
      vote: 1,
      sntAmount: BigNumber.from(100),
      sessionID: 1,
    },
  ]
  const messages: [string, BigNumber, BigNumber][] = votes.map((vote) => [
    vote.voter.address,
    BigNumber.from(vote.sessionID).mul(2).add(vote.vote),
    vote.sntAmount,
  ])

  const signedMessages = await Promise.all(
    messages.map(async (msg, idx) => {
      const message = { roomIdAndType: msg[1].toHexString(), sntAmount: msg[2].toHexString(), voter: msg[0] }
      const signature = await votes[idx].voter._signTypedData(typedData.domain, typedData.types, message)
      const sig = utils.splitSignature(signature)
      return { voter: msg[0], roomIdAndType: msg[1], sntAmount: msg[2], r: sig.r, vs: sig._vs }
    })
  )

  return signedMessages
}

const voteAndFinalize = async (room: number, type: number, signer: SignerWithAddress, contract: Contract) => {
  const vote: [string, BigNumber, BigNumber] = [
    signer.address,
    BigNumber.from(room).mul(2).add(type),
    BigNumber.from(100),
  ]

  const message = { roomIdAndType: vote[1].toHexString(), sntAmount: vote[2].toHexString(), voter: vote[0] }
  const signature = await signer._signTypedData(typedData.domain, typedData.types, message)
  const sig = utils.splitSignature(signature)

  await contract.castVotes([{ voter: vote[0], roomIdAndType: vote[1], sntAmount: vote[2], r: sig.r, vs: sig._vs }])
  await time.increase(10000)
  await contract.finalizeVotingRoom(room)
}

async function fixture() {
  const [firstSigner, secondSigner, thirdSigner] = await ethers.getSigners()

  const Erc20ContractFactory = await ethers.getContractFactory(ERC20Mock.abi, ERC20Mock.bytecode)
  const erc20Contract = await Erc20ContractFactory.deploy('MSNT', 'Mock SNT', firstSigner.address, 100000)

  await erc20Contract.transfer(secondSigner.address, 10000)
  await erc20Contract.transfer(thirdSigner.address, 10000)

  const votingContractFactory = await ethers.getContractFactory('VotingContract')
  const votingContract = await votingContractFactory.deploy(erc20Contract.address)

  const directoryContractFactory = await ethers.getContractFactory('Directory')
  const directoryContract = await directoryContractFactory.deploy(votingContract.address)

  await votingContract.setDirectory(directoryContract.address)

  return { votingContract, directoryContract, firstSigner, secondSigner, thirdSigner }
}

before(async function () {
  //   this.timeout(10000)
  const { votingContract: voting } = await loadFixture(fixture)
  typedData.domain.chainId = 31337
  typedData.domain.verifyingContract = voting.address
})

describe('voting', () => {
  it('check voters', async () => {
    const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)

    const messages = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
    await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))

    expect(await votingContract.listRoomVoters(1)).to.deep.eq([firstSigner.address])
    await votingContract.castVotes(messages.slice(2))
    expect(await votingContract.listRoomVoters(1)).to.deep.eq([firstSigner.address, thirdSigner.address])
  })
})

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
        await expect(await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100)))
          .to.emit(votingContract, 'VotingRoomStarted')
          .withArgs(1, publicKeys[0])
        await expect(await votingContract.initializeVotingRoom(1, publicKeys[1], BigNumber.from(100)))
          .to.emit(votingContract, 'VotingRoomStarted')
          .withArgs(2, publicKeys[1])
        await expect(votingContract.initializeVotingRoom(1, publicKeys[1], BigNumber.from(100))).to.be.revertedWith(
          'vote already ongoing'
        )
      })

      it('not enough token', async () => {
        const { votingContract } = await loadFixture(fixture)
        await expect(
          votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(10000000000000))
        ).to.be.revertedWith('not enough token')
      })

      describe('directory interaction', () => {
        it('remove missing', async () => {
          const { votingContract } = await loadFixture(fixture)
          await expect(votingContract.initializeVotingRoom(0, publicKeys[0], BigNumber.from(100))).to.be.revertedWith(
            'Community not in directory'
          )
        })

        it('add already in', async () => {
          const { votingContract, directoryContract, firstSigner } = await loadFixture(fixture)
          await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, 1, firstSigner, votingContract)

          expect(await directoryContract.getCommunities()).to.deep.eq([publicKeys[0]])
          await expect(votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))).to.be.revertedWith(
            'Community already in directory'
          )
        })
      })
    })

    it('gets', async () => {
      const { votingContract } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      const votingRoom1 = await votingContract.votingRooms(1)
      expect(votingRoom1.slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
      ])
      const history = await votingContract.getCommunityHistory(publicKeys[0])
      expect(history.length).to.eq(1)
      expect(history[0][2]).to.eq(1)
      expect(history[0][4]).to.eq(publicKeys[0])

      await votingContract.initializeVotingRoom(1, publicKeys[1], BigNumber.from(100))
      expect((await votingContract.votingRooms(2)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[1],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(2),
      ])
      expect((await votingContract.votingRooms(1)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
      ])
    })

    describe('history', () => {
      it('saves to history', async () => {
        const { votingContract, firstSigner } = await loadFixture(fixture)
        await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
        await voteAndFinalize(1, 1, firstSigner, votingContract)
        expect((await votingContract.getCommunityHistory(publicKeys[0])).length).to.eq(1)
        await time.increase(10000)
        await votingContract.initializeVotingRoom(0, publicKeys[0], BigNumber.from(100))
        await voteAndFinalize(2, 0, firstSigner, votingContract)
        const history = await votingContract.getCommunityHistory(publicKeys[0])
        expect(history.length).to.eq(2)
        expect(history[0][2]).to.eq(1)
        expect(history[0][3]).to.eq(true)
        expect(history[0][4]).to.eq(publicKeys[0])
        expect(history[0][5]).to.eq(BigNumber.from(100))
        expect(history[0][6]).to.eq(BigNumber.from(0))
        expect(history[0][7]).to.eq(BigNumber.from(1))

        expect(history[1][2]).to.eq(0)
        expect(history[1][3]).to.eq(true)
        expect(history[1][4]).to.eq(publicKeys[0])
        expect(history[1][5]).to.eq(BigNumber.from(100))
        expect(history[1][6]).to.eq(BigNumber.from(0))
        expect(history[1][7]).to.eq(BigNumber.from(2))
      })

      it("can't start vote to fast", async () => {
        const { votingContract, firstSigner } = await loadFixture(fixture)
        await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
        await voteAndFinalize(1, 1, firstSigner, votingContract)
        await expect(votingContract.initializeVotingRoom(0, publicKeys[0], BigNumber.from(100))).to.be.revertedWith(
          'Community was in a vote recently'
        )
      })
    })

    describe('finalization', () => {
      it('finalizes', async () => {
        const { votingContract } = await loadFixture(fixture)
        await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
        expect((await votingContract.votingRooms(1)).slice(2)).to.deep.eq([
          1,
          false,
          publicKeys[0],
          BigNumber.from(100),
          BigNumber.from(0),
          BigNumber.from(1),
        ])
        await time.increase(2000)
        await expect(await votingContract.finalizeVotingRoom(1))
          .to.emit(votingContract, 'VotingRoomFinalized')
          .withArgs(1, publicKeys[0], true, 1)
        expect((await votingContract.votingRooms(1)).slice(2)).to.deep.eq([
          1,
          true,
          publicKeys[0],
          BigNumber.from(100),
          BigNumber.from(0),
          BigNumber.from(1),
        ])
      })

      describe('directory interaction', () => {
        it('add community', async () => {
          const { votingContract, directoryContract, secondSigner } = await loadFixture(fixture)
          await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, 1, secondSigner, votingContract)
          expect((await votingContract.votingRooms(1)).slice(2)).to.deep.eq([
            1,
            true,
            publicKeys[0],
            BigNumber.from(200),
            BigNumber.from(0),
            BigNumber.from(1),
          ])
          expect(await directoryContract.getCommunities()).to.deep.eq([publicKeys[0]])
        })

        it('remove community', async () => {
          const { votingContract, directoryContract, secondSigner } = await loadFixture(fixture)
          await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, 1, secondSigner, votingContract)

          expect(await directoryContract.getCommunities()).to.deep.eq([publicKeys[0]])
          await time.increase(10000)
          await votingContract.initializeVotingRoom(0, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(2, 1, secondSigner, votingContract)
          expect(await directoryContract.getCommunities()).to.deep.eq([])
        })

        it('failed add vote', async () => {
          const { votingContract, directoryContract, secondSigner } = await loadFixture(fixture)
          await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, 0, secondSigner, votingContract)

          expect(await directoryContract.getCommunities()).to.deep.eq([])
        })

        it('failed remove vote', async () => {
          const { votingContract, directoryContract, secondSigner } = await loadFixture(fixture)
          await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, 1, secondSigner, votingContract)

          expect(await directoryContract.getCommunities()).to.deep.eq([publicKeys[0]])
          await time.increase(10000)
          await votingContract.initializeVotingRoom(0, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(2, 0, secondSigner, votingContract)
          expect(await directoryContract.getCommunities()).to.deep.eq([publicKeys[0]])
        })
      })
    })
  })

  describe('helpers', () => {
    it('getCommunityVoting', async () => {
      const { votingContract, firstSigner } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      expect((await votingContract.getCommunityVoting(publicKeys[0])).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
        [firstSigner.address],
      ])

      await time.increase(10000)
      await votingContract.initializeVotingRoom(1, publicKeys[1], BigNumber.from(100))
      expect((await votingContract.getCommunityVoting(publicKeys[1])).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[1],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(2),
        [firstSigner.address],
      ])
    })

    it('get active votes', async () => {
      const { votingContract } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      expect(await votingContract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(1)])

      await votingContract.initializeVotingRoom(1, publicKeys[1], BigNumber.from(100))
      expect(await votingContract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(1), BigNumber.from(2)])
      await time.increase(2000)
      await votingContract.finalizeVotingRoom(1)
      expect(await votingContract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(2)])
      await votingContract.finalizeVotingRoom(2)
      expect(await votingContract.getActiveVotingRooms()).to.deep.eq([])
    })
  })

  describe('voting', () => {
    it('check voters', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      const votes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))

      expect(await votingContract.listRoomVoters(1)).to.deep.eq([firstSigner.address])
      await votingContract.castVotes(votes.slice(2))
      expect(await votingContract.listRoomVoters(1)).to.deep.eq([firstSigner.address, thirdSigner.address])
    })

    it('not enough tokens', async () => {
      const { votingContract, secondSigner } = await loadFixture(fixture)
      await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))

      const vote: [string, BigNumber, BigNumber] = [
        secondSigner.address,
        BigNumber.from(1).mul(2).add(1),
        BigNumber.from(100000000000),
      ]
      const message = { roomIdAndType: vote[1].toHexString(), sntAmount: vote[2].toHexString(), voter: vote[0] }
      const signature = await secondSigner._signTypedData(typedData.domain, typedData.types, message)
      const sig = utils.splitSignature(signature)

      await expect(
        await votingContract.castVotes([
          { voter: vote[0], roomIdAndType: vote[1], sntAmount: vote[2], r: sig.r, vs: sig._vs },
        ])
      )
        .to.emit(votingContract, 'NotEnoughToken')
        .withArgs(1, secondSigner.address)

      await expect((await votingContract.votingRooms(1)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
      ])
    })

    it('success', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      const votes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      await votingContract.castVotes(votes)
      expect((await votingContract.votingRooms(1)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(200),
        BigNumber.from(100),
        BigNumber.from(1),
      ])
    })

    it('double vote', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      const votes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      await votingContract.castVotes(votes)
      await votingContract.castVotes(votes)
      expect((await votingContract.votingRooms(1)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(200),
        BigNumber.from(100),
        BigNumber.from(1),
      ])
    })

    it('none existent room', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      const votes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      await expect(votingContract.castVotes(votes)).to.be.reverted
    })

    it('old room', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      const votes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      await time.increase(2000)
      await expect(votingContract.castVotes(votes)).to.be.reverted
    })

    it('wrong signature', async () => {
      const { votingContract, firstSigner, secondSigner, thirdSigner } = await loadFixture(fixture)
      const signedVotes = await getSignedVotes(firstSigner, secondSigner, thirdSigner)
      await votingContract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      await time.increase(2000)

      const wronglySignedMessages = signedVotes.map((msg) => {
        return {
          ...msg,
          r: '0x2d63286985277c440b9f01a987fbbc9bc9ca32cb4e9e55ee3ffcab4e67c211e6',
          vs: '0x2d63286985277c440b9f01a987fbbc9bc9ca32cb4e9e55ee3ffcab4e67c211e6',
        }
      })

      await votingContract.castVotes(wronglySignedMessages)
      await expect(await votingContract.listRoomVoters(1)).to.deep.eq([firstSigner.address])
    })
  })
})
