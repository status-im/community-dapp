import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { ethers } from 'hardhat'

describe('directory contract', () => {
  const communities = [
    '0x0d9cb350e1dc415303e2816a21b0a439530725b4b2b42d2948e967cb211eab89d5',
    '0xe84e64498172551d998a220e1d8e5893c818ee9aa90bdb855aec0c9e65e89014b8',
    '0x04bbb77ea11ee6dc4585efa2617ec90b8ee4051ade4fcf7261ae6cd4cdf33e54e3',
  ]
  async function fixture() {
    const [alice, bob] = await ethers.getSigners()
    const contractFactory = await ethers.getContractFactory('Directory')
    const contract = await contractFactory.deploy(alice.address)

    return { contract, alice, bob }
  }

  it('deploys', async () => {
    const { contract, alice } = await loadFixture(fixture)
    expect(await contract.votingContract()).to.eq(alice.address)
  })

  it('adds community', async () => {
    const { contract } = await loadFixture(fixture)
    await contract.addCommunity(communities[0])
    expect(await contract.getCommunities()).to.deep.eq([communities[0]])
    await contract.addCommunity(communities[1])
    expect(await contract.getCommunities()).to.deep.eq([communities[0], communities[1]])
  })

  it('only owner can add', async () => {
    const { contract, bob } = await loadFixture(fixture)
    const bobContract = contract.connect(bob)
    await expect(bobContract.addCommunity(communities[0])).to.be.revertedWith('Invalid sender')
    expect(await contract.getCommunities()).to.deep.eq([])
  })

  it('only owner can remove', async () => {
    const { contract, bob } = await loadFixture(fixture)
    await contract.addCommunity(communities[0])
    const bobContract = contract.connect(bob)
    await expect(bobContract.removeCommunity(communities[0])).to.be.revertedWith('Invalid sender')
    expect(await contract.getCommunities()).to.deep.eq([communities[0]])
  })

  it('removes community', async () => {
    const { contract } = await loadFixture(fixture)
    await contract.addCommunity(communities[0])
    await contract.addCommunity(communities[1])
    await contract.addCommunity(communities[2])
    await contract.removeCommunity(communities[1])
    expect(await contract.getCommunities()).to.deep.eq([communities[0], communities[2]])
  })

  it("can't add duplicate", async () => {
    const { contract } = await loadFixture(fixture)
    await contract.addCommunity(communities[0])
    await expect(contract.addCommunity(communities[0])).to.be.revertedWith('Community already exist')
    expect(await contract.getCommunities()).to.deep.eq([communities[0]])
  })

  it('community in directory', async () => {
    const { contract } = await loadFixture(fixture)
    await contract.addCommunity(communities[0])

    expect(await contract.isCommunityInDirectory(communities[0])).to.eq(true)
    expect(await contract.isCommunityInDirectory(communities[1])).to.eq(false)
  })
})
