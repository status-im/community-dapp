import { expect, use } from 'chai'
import { loadFixture, deployContract, MockProvider, solidity } from 'ethereum-waffle'
import { VotingContract, Directory, ERC20Mock } from '../abi'
import { utils, BigNumber, Wallet, Contract } from 'ethers'

use(solidity)

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

describe('Contract', () => {
  async function fixture([alice, firstAddress, secondAddress]: any[], provider: any) {
    const erc20 = await deployContract(alice, ERC20Mock, ['MSNT', 'Mock SNT', alice.address, 100000])
    await erc20.transfer(firstAddress.address, 10000)
    await erc20.transfer(secondAddress.address, 10000)
    const contract = await deployContract(alice, VotingContract, [erc20.address])
    const directory = await deployContract(alice, Directory, [contract.address])
    await contract.setDirectory(directory.address)
    await provider.send('evm_mine', [Math.floor(Date.now() / 1000)])
    return { contract, directory, alice, firstAddress, secondAddress, provider }
  }
  loadFixture(fixture)

  it('deploys properly', async () => {
    const { contract, directory } = await loadFixture(fixture)
    expect(await contract.directory()).to.eq(directory.address)
  })

  it('only owner can change directory', async () => {
    const { contract, firstAddress } = await loadFixture(fixture)
    const differentSender = contract.connect(firstAddress)
    await expect(differentSender.setDirectory(firstAddress.address)).to.be.revertedWith('Not owner')
  })

  describe('Voting Room', () => {
    describe('initialization', () => {
      it('initializes', async () => {
        const { contract, firstAddress, secondAddress } = await loadFixture(fixture)
        await expect(await contract.initializeVotingRoom(1, firstAddress.address, BigNumber.from(100)))
          .to.emit(contract, 'VotingRoomStarted')
          .withArgs(1, firstAddress.address)
        await expect(await contract.initializeVotingRoom(1, secondAddress.address, BigNumber.from(100)))
          .to.emit(contract, 'VotingRoomStarted')
          .withArgs(2, secondAddress.address)
        await expect(contract.initializeVotingRoom(1, secondAddress.address, BigNumber.from(100))).to.be.revertedWith(
          'vote already ongoing'
        )
      })

      it('not enough token', async () => {
        const { contract } = await loadFixture(fixture)
        await expect(
          contract.initializeVotingRoom(1, '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b', BigNumber.from(10000000000000))
        ).to.be.revertedWith('not enough token')
      })

      describe('directory interaction', () => {
        it('remove missing', async () => {
          const { contract } = await loadFixture(fixture)
          await expect(
            contract.initializeVotingRoom(0, '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b', BigNumber.from(100))
          ).to.be.revertedWith('Community not in directory')
        })

        it('add already in', async () => {
          const { contract, directory, alice, provider } = await loadFixture(fixture)
          await contract.initializeVotingRoom(1, '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b', BigNumber.from(100))
          await voteAndFinalize(1, 1, alice, contract, provider)

          expect(await directory.getCommunities()).to.deep.eq(['0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b'])
          await expect(
            contract.initializeVotingRoom(1, '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b', BigNumber.from(100))
          ).to.be.revertedWith('Community already in directory')
        })
      })
    })

    it('gets', async () => {
      const { contract, firstAddress, secondAddress } = await loadFixture(fixture)
      await contract.initializeVotingRoom(1, firstAddress.address, BigNumber.from(100))
      expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        false,
        firstAddress.address,
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
      ])

      await contract.initializeVotingRoom(1, secondAddress.address, BigNumber.from(100))
      expect((await contract.votingRoomMap(2)).slice(2)).to.deep.eq([
        1,
        false,
        secondAddress.address,
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(2),
      ])
      expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        false,
        firstAddress.address,
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
      ])
    })
    describe('finalization', () => {
      it('finalizes', async () => {
        const { contract, firstAddress, provider } = await loadFixture(fixture)
        await contract.initializeVotingRoom(1, firstAddress.address, BigNumber.from(100))
        expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
          1,
          false,
          firstAddress.address,
          BigNumber.from(100),
          BigNumber.from(0),
          BigNumber.from(1),
        ])
        await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 2000)])
        await expect(await contract.finalizeVotingRoom(1))
          .to.emit(contract, 'VotingRoomFinalized')
          .withArgs(1, firstAddress.address, true, 1)
        expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
          1,
          true,
          firstAddress.address,
          BigNumber.from(100),
          BigNumber.from(0),
          BigNumber.from(1),
        ])
      })

      describe('directory interaction', () => {
        it('add community', async () => {
          const { contract, directory, provider, firstAddress } = await loadFixture(fixture)
          await contract.initializeVotingRoom(1, '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b', BigNumber.from(100))
          await voteAndFinalize(1, 1, firstAddress, contract, provider)
          expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
            1,
            true,
            '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b',
            BigNumber.from(200),
            BigNumber.from(0),
            BigNumber.from(1),
          ])
          expect(await directory.getCommunities()).to.deep.eq(['0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b'])
        })

        it('remove community', async () => {
          const { contract, directory, provider, firstAddress } = await loadFixture(fixture)
          await contract.initializeVotingRoom(1, '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b', BigNumber.from(100))
          await voteAndFinalize(1, 1, firstAddress, contract, provider)

          expect(await directory.getCommunities()).to.deep.eq(['0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b'])

          await contract.initializeVotingRoom(0, '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b', BigNumber.from(100))
          await voteAndFinalize(2, 1, firstAddress, contract, provider)
          expect(await directory.getCommunities()).to.deep.eq([])
        })

        it('failed add vote', async () => {
          const { contract, directory, provider, firstAddress } = await loadFixture(fixture)
          await contract.initializeVotingRoom(1, '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b', BigNumber.from(100))
          await voteAndFinalize(1, 0, firstAddress, contract, provider)

          expect(await directory.getCommunities()).to.deep.eq([])
        })

        it('failed remove vote', async () => {
          const { contract, directory, provider, firstAddress } = await loadFixture(fixture)
          await contract.initializeVotingRoom(1, '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b', BigNumber.from(100))
          await voteAndFinalize(1, 1, firstAddress, contract, provider)

          expect(await directory.getCommunities()).to.deep.eq(['0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b'])

          await contract.initializeVotingRoom(0, '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b', BigNumber.from(100))
          await voteAndFinalize(2, 0, firstAddress, contract, provider)
          expect(await directory.getCommunities()).to.deep.eq(['0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b'])
        })
      })
    })
  })

  describe('helpers', () => {
    it('getCommunityVoting', async () => {
      const { contract, firstAddress, secondAddress, provider } = await loadFixture(fixture)
      await contract.initializeVotingRoom(1, firstAddress.address, BigNumber.from(100))
      expect((await contract.getCommunityVoting(firstAddress.address)).slice(2)).to.deep.eq([
        1,
        false,
        firstAddress.address,
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
      ])

      await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 10000)])
      await contract.initializeVotingRoom(1, secondAddress.address, BigNumber.from(100))
      expect((await contract.getCommunityVoting(secondAddress.address)).slice(2)).to.deep.eq([
        1,
        false,
        secondAddress.address,
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(2),
      ])
    })

    it('get active votes', async () => {
      const { contract, firstAddress, secondAddress, provider } = await loadFixture(fixture)
      await contract.initializeVotingRoom(1, firstAddress.address, BigNumber.from(100))
      expect(await contract.getActiveVotingRooms()).to.deep.eq([BigNumber.from(1)])

      await contract.initializeVotingRoom(1, secondAddress.address, BigNumber.from(100))
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
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24', BigNumber.from(100))

      expect(await contract.listRoomVoters(1)).to.deep.eq([alice.address])
      await contract.castVotes(signedMessages.slice(2))
      expect(await contract.listRoomVoters(1)).to.deep.eq([alice.address, secondAddress.address])
    })

    it('not enough tokens', async () => {
      const { contract, firstAddress } = await loadFixture(fixture)
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24', BigNumber.from(100))

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

      await expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        false,
        '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24',
        BigNumber.from(100),
        BigNumber.from(0),
        BigNumber.from(1),
      ])
    })

    it('success', async () => {
      const { contract, alice, firstAddress, secondAddress } = await loadFixture(fixture)
      const { signedMessages } = await getSignedMessages(alice, firstAddress, secondAddress)
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24', BigNumber.from(100))
      await contract.castVotes(signedMessages)
      expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        false,
        '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24',
        BigNumber.from(200),
        BigNumber.from(100),
        BigNumber.from(1),
      ])
    })

    it('double vote', async () => {
      const { contract, alice, firstAddress, secondAddress } = await loadFixture(fixture)
      const { signedMessages } = await getSignedMessages(alice, firstAddress, secondAddress)
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24', BigNumber.from(100))
      await contract.castVotes(signedMessages)
      await contract.castVotes(signedMessages)
      expect((await contract.votingRoomMap(1)).slice(2)).to.deep.eq([
        1,
        false,
        '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24',
        BigNumber.from(200),
        BigNumber.from(100),
        BigNumber.from(1),
      ])
    })

    it('random bytes', async () => {
      const { contract } = await loadFixture(fixture)
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24', BigNumber.from(100))
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
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24', BigNumber.from(100))
      await provider.send('evm_mine', [Math.floor(Date.now() / 1000 + 2000)])
      await expect(contract.castVotes(signedMessages)).to.be.reverted
    })

    it('wrong signature', async () => {
      const { contract, alice, firstAddress, secondAddress, provider } = await loadFixture(fixture)
      const { messages } = await getSignedMessages(alice, firstAddress, secondAddress)
      const types = ['address', 'uint256', 'uint256']
      await contract.initializeVotingRoom(1, '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24', BigNumber.from(100))
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
