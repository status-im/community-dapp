import { expect, use } from 'chai'
import { loadFixture, deployContract, MockProvider, solidity } from 'ethereum-waffle'
import { VotingContract, Directory, ERC20Mock } from '../abi'
import { utils, Wallet, Contract } from 'ethers'

import { BigNumber } from '@ethersproject/bignumber'

use(solidity)

const publicKeys = [
  '0x0d9cb350e1dc415303e2816a21b0a439530725b4b2b42d2948e967cb211eab89d5',
  '0xe84e64498172551d998a220e1d8e5893c818ee9aa90bdb855aec0c9e65e89014b8',
  '0x04bbb77ea11ee6dc4585efa2617ec90b8ee4051ade4fcf7261ae6cd4cdf33e54e3',
  '0xadfcf42e083e71d8c755da07a2b1bad754d7ca97c35fbd407da6bde9844580ad55',
  '0xec62724b6828954a705eb3b531c30a69503d3561d4283fb8b60835ff34205c64d8',
  '0xb8def1f5e7160e5e1a6440912b7e633ad923030352f23abb54226020bff781b7e6',
  '0x1d477fa543d2bb84a03451c346c4f203b30b0c1c7646fd73d7cdd63eb1f02a97c0',
  '0x0f51704984ddb5c92ec951be595b5bd997ab0c5a09ae983e2420bbe2bf32266901',
  '0x018a21d30f26464780ef2c2e59b917bfa24bd5d30590ea864506e5868a0a9e9fa5',
  '0x59bf64cc1051d6a089c2b82aa6749114e1eb7adab4cf63dbe8c3c63cecad41d463',
  '0xc6dc4427c01661adbe9694a54734594e870e4006d1b4c05f81e6e260e8149973e3',
  '0x253057461f01c1b0f438a31a339b7a81a6967420d43aa765e4eee2b67cf0ec6328',
  '0x9ce9139de747a6e68046491541e823c1be2c44809a9f22c4fcee1287eb907f73d3',
  '0x85579dc2673965df3c795bd35cc8a2c343dc3b155820da31eb7c81965bd0c54e88',
  '0x039664ae9d976a1f391e413713cd92f8639197b86f9aa046e61edc7a40ea2806df',
  '0xfc2aa477e204d7751ccd759e61404a2cd489a640c4fbf1a3cb62b6c36f94d955fa',
  '0x09bda2799a0a05274f03dec5fb0ea93775af5fb5e5d62fb807bfeca075301e9760',
]

const getSignedMessages = async (
  alice: Wallet,
  firstAddress: Wallet,
  secondAddress: Wallet
): Promise<{ messages: any[]; signedMessages: any[] }> => {
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

  const signedMessages = await Promise.all(
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

  return { messages, signedMessages }
}

const voteAndFinalize = async (
  room: number,
  type: number,
  signer: Wallet,
  contract: Contract,
  provider: MockProvider
) => {
  const types = ['address', 'uint256', 'uint256']
  const vote = [signer.address, BigNumber.from(room).mul(2).add(type), BigNumber.from(100)]
  const signature = utils.splitSignature(await signer.signMessage(utils.arrayify(utils.solidityPack(types, vote))))
  const votes = [[...vote, signature.r, signature._vs]]
  await contract.castVotes(votes)
  await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 10000)])
  await contract.finalizeVotingRoom(room)
  await provider.send('evm_mine', [Math.floor(Date.now() / 1000)])
}

async function fixture([alice, firstAddress, secondAddress]: any[], provider: any) {
  const erc20 = await deployContract(alice, ERC20Mock, ['MSNT', 'Mock SNT', alice.address, 100000])
  await erc20.transfer(firstAddress.address, 10000)
  await erc20.transfer(secondAddress.address, 10000)
  const contract = await deployContract(alice, VotingContract, [erc20.address])
  const directory = await deployContract(alice, Directory, [contract.address])
  await contract.setDirectory(directory.address)
  return { contract, directory, alice, firstAddress, secondAddress, provider }
}

describe('Contract', () => {
  before(async () => {
    await loadFixture(fixture)
  })
  it('deploys properly', async () => {
    const { contract, directory } = await loadFixture(fixture)
    await expect(await contract.directory()).to.eq(directory.address)
  })

  it('only owner can change directory', async () => {
    const { contract, firstAddress } = await loadFixture(fixture)
    const differentSender = contract.connect(firstAddress)
    await expect(differentSender.setDirectory(firstAddress.address)).to.be.revertedWith('Not owner')
  })

  describe('Voting Room', () => {
    describe('initialization', () => {
      it('initializes', async () => {
        const { contract } = await loadFixture(fixture)
        await expect(await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100)))
          .to.emit(contract, 'VotingRoomStarted')
          .withArgs(1, publicKeys[0])
        await expect(await contract.initializeVotingRoom(1, publicKeys[1], BigNumber.from(100)))
          .to.emit(contract, 'VotingRoomStarted')
          .withArgs(2, publicKeys[1])
        await expect(contract.initializeVotingRoom(1, publicKeys[1], BigNumber.from(100))).to.be.revertedWith(
          'vote already ongoing'
        )
      })

      it('not enough token', async () => {
        const { contract } = await loadFixture(fixture)
        await expect(
          contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(10000000000000))
        ).to.be.revertedWith('not enough token')
      })

      describe('directory interaction', () => {
        it('remove missing', async () => {
          const { contract } = await loadFixture(fixture)
          await expect(contract.initializeVotingRoom(0, publicKeys[0], BigNumber.from(100))).to.be.revertedWith(
            'Community not in directory'
          )
        })

        it('add already in', async () => {
          const { contract, directory, alice, provider } = await loadFixture(fixture)
          await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, 1, alice, contract, provider)

          expect(await directory.getCommunities()).to.deep.eq([publicKeys[0]])
          await expect(contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))).to.be.revertedWith(
            'Community already in directory'
          )
        })
      })
    })

    it('gets', async () => {
      const { contract } = await loadFixture(fixture)
      await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))

      expect((await contract.votingRooms(1)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
      ])

      await contract.initializeVotingRoom(1, publicKeys[1], BigNumber.from(100))
      expect((await contract.votingRooms(2)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[1],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(2),
      ])
      expect((await contract.votingRooms(1)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
      ])
    })
    describe('finalization', () => {
      it('finalizes', async () => {
        const { contract, provider } = await loadFixture(fixture)
        await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
        expect((await contract.votingRooms(1)).slice(2)).to.deep.eq([
          1,
          false,
          publicKeys[0],
          BigNumber.from(100),
          BigNumber.from(0),
          BigNumber.from(1),
        ])
        await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 2000)])
        await expect(await contract.finalizeVotingRoom(1))
          .to.emit(contract, 'VotingRoomFinalized')
          .withArgs(1, publicKeys[0], true, 1)
        expect((await contract.votingRooms(1)).slice(2)).to.deep.eq([
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
          const { contract, directory, provider, firstAddress } = await loadFixture(fixture)
          await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, 1, firstAddress, contract, provider)
          expect((await contract.votingRooms(1)).slice(2)).to.deep.eq([
            1,
            true,
            publicKeys[0],
            BigNumber.from(200),
            BigNumber.from(0),
            BigNumber.from(1),
          ])
          expect(await directory.getCommunities()).to.deep.eq([publicKeys[0]])
        })

        it('remove community', async () => {
          const { contract, directory, provider, firstAddress } = await loadFixture(fixture)
          await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, 1, firstAddress, contract, provider)

          expect(await directory.getCommunities()).to.deep.eq([publicKeys[0]])

          await contract.initializeVotingRoom(0, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(2, 1, firstAddress, contract, provider)
          expect(await directory.getCommunities()).to.deep.eq([])
        })

        it('failed add vote', async () => {
          const { contract, directory, provider, firstAddress } = await loadFixture(fixture)
          await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, 0, firstAddress, contract, provider)

          expect(await directory.getCommunities()).to.deep.eq([])
        })

        it('failed remove vote', async () => {
          const { contract, directory, provider, firstAddress } = await loadFixture(fixture)
          await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(1, 1, firstAddress, contract, provider)

          expect(await directory.getCommunities()).to.deep.eq([publicKeys[0]])

          await contract.initializeVotingRoom(0, publicKeys[0], BigNumber.from(100))
          await voteAndFinalize(2, 0, firstAddress, contract, provider)
          expect(await directory.getCommunities()).to.deep.eq([publicKeys[0]])
        })
      })
    })
  })

  describe('helpers', () => {
    it('getCommunityVoting', async () => {
      const { contract, alice, provider } = await loadFixture(fixture)
      await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      expect((await contract.getCommunityVoting(publicKeys[0])).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
        [alice.address],
      ])

      await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 10000)])
      await contract.initializeVotingRoom(1, publicKeys[1], BigNumber.from(100))
      expect((await contract.getCommunityVoting(publicKeys[1])).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[1],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(2),
        [alice.address],
      ])
    })

    it('get active votes', async () => {
      const { contract, provider } = await loadFixture(fixture)
      await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      expect(await contract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(1)])

      await contract.initializeVotingRoom(1, publicKeys[1], BigNumber.from(100))
      expect(await contract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(1), BigNumber.from(2)])
      await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 2000)])
      await contract.finalizeVotingRoom(1)
      expect(await contract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(2)])
      await contract.finalizeVotingRoom(2)
      expect(await contract.getActiveVotingRooms()).to.deep.eq([])
    })
  })

  describe('voting', () => {
    it('check voters', async () => {
      const { contract, alice, firstAddress, secondAddress } = await loadFixture(fixture)
      const { signedMessages } = await getSignedMessages(alice, firstAddress, secondAddress)
      await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))

      expect(await contract.listRoomVoters(1)).to.deep.eq([alice.address])
      await contract.castVotes(signedMessages.slice(2))
      expect(await contract.listRoomVoters(1)).to.deep.eq([alice.address, secondAddress.address])
    })

    it('not enough tokens', async () => {
      const { contract, firstAddress } = await loadFixture(fixture)
      await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))

      const types = ['address', 'uint256', 'uint256']
      const message = [firstAddress.address, BigNumber.from(1).mul(2).add(1), BigNumber.from(100000000000)]

      const signedMessage = [...message]
      const signature = utils.splitSignature(
        await firstAddress.signMessage(utils.arrayify(utils.solidityPack(types, message)))
      )
      signedMessage.push(signature.r)
      signedMessage.push(signature._vs)

      await expect(await contract.castVotes([signedMessage]))
        .to.emit(contract, 'NotEnoughToken')
        .withArgs(1, firstAddress.address)

      await expect((await contract.votingRooms(1)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
      ])
    })

    it('success', async () => {
      const { contract, alice, firstAddress, secondAddress } = await loadFixture(fixture)
      const { signedMessages } = await getSignedMessages(alice, firstAddress, secondAddress)
      await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      await contract.castVotes(signedMessages)
      expect((await contract.votingRooms(1)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(200),
        BigNumber.from(100),
        BigNumber.from(1),
      ])
    })

    it('double vote', async () => {
      const { contract, alice, firstAddress, secondAddress } = await loadFixture(fixture)
      const { signedMessages } = await getSignedMessages(alice, firstAddress, secondAddress)
      await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      await contract.castVotes(signedMessages)
      await contract.castVotes(signedMessages)
      expect((await contract.votingRooms(1)).slice(2)).to.deep.eq([
        1,
        false,
        publicKeys[0],
        BigNumber.from(200),
        BigNumber.from(100),
        BigNumber.from(1),
      ])
    })

    it('random bytes', async () => {
      const { contract } = await loadFixture(fixture)
      await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      await expect(contract.castVotes([new Uint8Array([12, 12, 12])])).to.be.reverted
    })

    it('none existent room', async () => {
      const { contract, alice, firstAddress, secondAddress } = await loadFixture(fixture)
      const { signedMessages } = await getSignedMessages(alice, firstAddress, secondAddress)
      await expect(contract.castVotes(signedMessages)).to.be.reverted
    })

    it('old room', async () => {
      const { contract, alice, firstAddress, secondAddress, provider } = await loadFixture(fixture)
      const { signedMessages } = await getSignedMessages(alice, firstAddress, secondAddress)
      await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 2000)])
      await expect(contract.castVotes(signedMessages)).to.be.reverted
    })

    it('wrong signature', async () => {
      const { contract, alice, firstAddress, secondAddress, provider } = await loadFixture(fixture)
      const { messages } = await getSignedMessages(alice, firstAddress, secondAddress)
      const types = ['address', 'uint256', 'uint256']
      await contract.initializeVotingRoom(1, publicKeys[0], BigNumber.from(100))
      await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 2000)])

      const signedMessages = await Promise.all(
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
