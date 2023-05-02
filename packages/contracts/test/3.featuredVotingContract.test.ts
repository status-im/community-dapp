import { BigNumber } from '@ethersproject/bignumber'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { ERC20Mock } from '../abi'
import { FeaturedVotingContract } from '../typechain-types'

const { utils } = ethers

const publicKeys = [
  '0x0d9cb350e1dc415303e2816a21b0a439530725b4b2b42d2948e967cb211eab89d5',
  '0xe84e64498172551d998a220e1d8e5893c818ee9aa90bdb855aec0c9e65e89014b8',
  '0x04bbb77ea11ee6dc4585efa2617ec90b8ee4051ade4fcf7261ae6cd4cdf33e54e3',
  '0xadfcf42e083e71d8c755da07a2b1bad754d7ca97c35fbd407da6bde9844580ad55',
  '0xec62724b6828954a705eb3b531c30a69503d3561d4283fb8b60835ff34205c64d8',
  '0xb8def1f5e7160e5e1a6440912b7e633ad923030352f23abb54226020bff781b7e6',
  '0x1d477fa543d2bb84a03451c346c4f203b30b0c1c7646fd73d7cdd63eb1f02a97c0',
]

const votingLength = 1000
const votingVerificationLength = 200
const featuredPerVotingCount = 3
const cooldownPeriod = 1
const votingWithVerificationLength = votingLength + votingVerificationLength

const typedData = {
  types: {
    Vote: [
      { name: 'voter', type: 'address' },
      { name: 'community', type: 'bytes' },
      { name: 'sntAmount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
    ],
  },
  domain: {
    name: 'Featured Voting Contract',
    version: '1',
    chainId: 31337,
    verifyingContract: '',
  },
}

const createSignedVote = async (
  signer: SignerWithAddress,
  community: string,
  sntAmount: number,
  timestamp = 0
): Promise<FeaturedVotingContract.SignedVoteStruct> => {
  const vote = {
    voter: signer.address,
    community: community,
    sntAmount: BigNumber.from(sntAmount),
    timestamp: timestamp ? BigNumber.from(timestamp) : BigNumber.from(await time.latest()),
  }

  const message = {
    voter: vote.voter,
    community: vote.community,
    sntAmount: vote.sntAmount.toHexString(),
    timestamp: vote.timestamp.toHexString(),
  }
  const signature = await signer._signTypedData(typedData.domain, typedData.types, message)
  const splitSignature = utils.splitSignature(signature)

  return { ...vote, r: splitSignature.r, vs: splitSignature._vs }
}

async function fixture() {
  const [firstSigner, secondSigner, thirdSigner] = await ethers.getSigners()

  const Erc20ContractFactory = await ethers.getContractFactory(ERC20Mock.abi, ERC20Mock.bytecode)
  const erc20Contract = await Erc20ContractFactory.deploy('MSNT', 'Mock SNT', firstSigner.address, 100000)

  await erc20Contract.transfer(secondSigner.address, 10000)
  await erc20Contract.transfer(thirdSigner.address, 10000)

  const featuredVotingContractFactory = await ethers.getContractFactory('FeaturedVotingContract')
  const featuredVotingContract = await featuredVotingContractFactory.deploy(
    erc20Contract.address,
    votingLength,
    votingVerificationLength,
    cooldownPeriod,
    featuredPerVotingCount
  )

  const directoryContractFactory = await ethers.getContractFactory('Directory')
  const directoryContract = await directoryContractFactory.deploy(firstSigner.address, featuredVotingContract.address)

  await featuredVotingContract.setDirectory(directoryContract.address)

  await directoryContract.addCommunity(publicKeys[0])
  await directoryContract.addCommunity(publicKeys[1])
  await directoryContract.addCommunity(publicKeys[2])
  await directoryContract.addCommunity(publicKeys[3])
  await directoryContract.addCommunity(publicKeys[4])

  typedData.domain.verifyingContract = featuredVotingContract.address

  return { featuredVotingContract, directoryContract, erc20Contract, firstSigner, secondSigner, thirdSigner }
}

describe('FeaturedVotingContract', () => {
  it('deploys properly', async () => {
    const { featuredVotingContract, directoryContract } = await loadFixture(fixture)
    await expect(await featuredVotingContract.directory()).to.eq(directoryContract.address)
  })

  describe('#setDirectory()', () => {
    it('should only allow the owner to set a directory', async () => {
      const { featuredVotingContract, secondSigner } = await loadFixture(fixture)
      const differentSender = featuredVotingContract.connect(secondSigner)
      await expect(differentSender.setDirectory(secondSigner.address)).to.be.revertedWith('Not owner')
    })
  })

  describe('#initializeVoting()', () => {
    it('should initialize the voting', async () => {
      const { featuredVotingContract } = await loadFixture(fixture)
      await expect(featuredVotingContract.initializeVoting(publicKeys[0], 100)).to.emit(
        featuredVotingContract,
        'VotingStarted'
      )

      await expect((await featuredVotingContract.votings(0)).finalized).to.eq(false)
    })

    it('should revert when the voting is already ongoing', async () => {
      const { featuredVotingContract } = await loadFixture(fixture)
      await expect(featuredVotingContract.initializeVoting(publicKeys[0], 100)).to.emit(
        featuredVotingContract,
        'VotingStarted'
      )

      await expect(featuredVotingContract.initializeVoting(publicKeys[0], 100)).to.be.revertedWith(
        'vote already ongoing'
      )
    })

    it('should revert when community is not in directory', async () => {
      const { featuredVotingContract } = await loadFixture(fixture)
      await expect(featuredVotingContract.initializeVoting(publicKeys[5], 100)).to.be.revertedWith(
        'community not in directory'
      )
    })

    it('should revert when balance of the sender is not sufficient', async () => {
      const { featuredVotingContract, secondSigner } = await loadFixture(fixture)
      const secondSender = featuredVotingContract.connect(secondSigner)
      await expect(secondSender.initializeVoting(publicKeys[0], 1000000)).to.be.revertedWith('not enough token')
    })
  })

  describe('#castVotes()', () => {
    it('should cast votes', async () => {
      const { featuredVotingContract, firstSigner, secondSigner } = await loadFixture(fixture)
      await featuredVotingContract.initializeVoting(publicKeys[0], 100)

      const vote1 = await createSignedVote(firstSigner, publicKeys[1], 100)
      const vote2 = await createSignedVote(secondSigner, publicKeys[2], 1000)
      await expect(featuredVotingContract.castVotes([vote1, vote2]))
        .to.emit(featuredVotingContract, 'VoteCast')
        .withArgs(publicKeys[1], firstSigner.address)
        .to.emit(featuredVotingContract, 'VoteCast')
        .withArgs(publicKeys[2], secondSigner.address)
    })

    it('should revert when no voting is ongoing', async () => {
      const { featuredVotingContract } = await loadFixture(fixture)
      await expect(featuredVotingContract.castVotes([])).to.be.revertedWith('no ongoing vote')
    })
  })

  describe('#finalizeVoting()', () => {
    it('should finalize voting', async () => {
      const { featuredVotingContract, directoryContract, firstSigner, secondSigner } = await loadFixture(fixture)
      // votes summary (top3 should be featured):
      // publicKeys[3] - 500
      // publicKeys[1] - 200
      // publicKeys[0] - 100
      // publicKeys[2] - 50
      // publicKeys[4] - 10
      await featuredVotingContract.initializeVoting(publicKeys[0], 100)
      await featuredVotingContract.castVotes([
        await createSignedVote(firstSigner, publicKeys[1], 100),
        await createSignedVote(secondSigner, publicKeys[1], 100),
        await createSignedVote(firstSigner, publicKeys[2], 50),
        await createSignedVote(firstSigner, publicKeys[3], 100),
        await createSignedVote(secondSigner, publicKeys[3], 400),
        await createSignedVote(secondSigner, publicKeys[4], 10),
      ])

      await time.increase(votingWithVerificationLength + 1)

      await expect(featuredVotingContract.finalizeVoting()).to.emit(featuredVotingContract, 'VotingFinalized')
      await expect((await featuredVotingContract.votings(0)).finalized).to.eq(true)

      expect(await directoryContract.getFeaturedCommunities()).to.deep.eq([publicKeys[3], publicKeys[1], publicKeys[0]])
    })
  })
})
