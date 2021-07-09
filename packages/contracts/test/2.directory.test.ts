import { expect, use } from 'chai'
import { loadFixture, deployContract, solidity } from 'ethereum-waffle'
import Directory from '../build/Directory.json'

use(solidity)

describe('directory contract', () => {
  const communities = [
    '0xAcdd71e5Ef3Ab3356d62da78A941aAc08a18CF2b',
    '0xF1B65D4b7e5D6aE45c66Bc015e2556f228A6968f',
    '0xadd590e785c0Da8B7A39A344e76fCF02193b3641',
  ]
  async function fixture([alice, bob]: any[], provider: any) {
    const contract = await deployContract(alice, Directory, [alice.address])
    return { contract, alice, bob, provider }
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
