import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { ethers } from 'hardhat'

describe('Directory', () => {
  const communities = [
    '0x0d9cb350e1dc415303e2816a21b0a439530725b4b2b42d2948e967cb211eab89d5',
    '0xe84e64498172551d998a220e1d8e5893c818ee9aa90bdb855aec0c9e65e89014b8',
    '0x04bbb77ea11ee6dc4585efa2617ec90b8ee4051ade4fcf7261ae6cd4cdf33e54e3',
  ]
  async function fixture() {
    const [alice, bob] = await ethers.getSigners()
    const contractFactory = await ethers.getContractFactory('Directory')
    const contract = await contractFactory.deploy(alice.address, bob.address)

    return { contract, alice, bob }
  }

  it('deploys', async () => {
    const { contract, alice, bob } = await loadFixture(fixture)
    expect(await contract.votingContract()).to.eq(alice.address)
    expect(await contract.featuredVotingContract()).to.eq(bob.address)
  })

  describe('community directory', () => {
    describe('#addCommunity()', () => {
      it('should add a community to the directory', async () => {
        const { contract } = await loadFixture(fixture)
        await contract.addCommunity(communities[0])
        expect(await contract.getCommunities()).to.deep.eq([communities[0]])
        await contract.addCommunity(communities[1])
        expect(await contract.getCommunities()).to.deep.eq([communities[0], communities[1]])
      })

      it('should only allow the owner to add a community', async () => {
        const { contract, bob } = await loadFixture(fixture)
        const byBobInvokedContract = contract.connect(bob)
        await expect(byBobInvokedContract.addCommunity(communities[0])).to.be.revertedWith('Invalid sender')
        expect(await contract.getCommunities()).to.deep.eq([])
      })

      it('should not allow adding duplicate communities', async () => {
        const { contract } = await loadFixture(fixture)
        await contract.addCommunity(communities[0])
        await expect(contract.addCommunity(communities[0])).to.be.revertedWith('Community already exist')
        expect(await contract.getCommunities()).to.deep.eq([communities[0]])
      })
    })

    describe('#removeCommunity()', () => {
      it('should remove a community from the directory', async () => {
        const { contract } = await loadFixture(fixture)
        await contract.addCommunity(communities[0])
        await contract.addCommunity(communities[1])
        await contract.addCommunity(communities[2])
        await contract.removeCommunity(communities[1])
        expect(await contract.getCommunities()).to.deep.eq([communities[0], communities[2]])
      })

      it('should only allow the owner to remove a community', async () => {
        const { contract, bob } = await loadFixture(fixture)
        await contract.addCommunity(communities[0])
        const byBobInvokedContract = contract.connect(bob)
        await expect(byBobInvokedContract.removeCommunity(communities[0])).to.be.revertedWith('Invalid sender')
        expect(await contract.getCommunities()).to.deep.eq([communities[0]])
      })
    })

    describe('#isCommunityInDirectory()', () => {
      it('should indicate if a community is in the directory', async () => {
        const { contract } = await loadFixture(fixture)
        await contract.addCommunity(communities[0])

        expect(await contract.isCommunityInDirectory(communities[0])).to.eq(true)
        expect(await contract.isCommunityInDirectory(communities[1])).to.eq(false)
      })
    })
  })

  describe('featured communities', async () => {
    describe('#setFeaturedCommunities()', async () => {
      it('should update featured communities', async () => {
        const { contract, bob } = await loadFixture(fixture)
        await contract.addCommunity(communities[0])
        await contract.addCommunity(communities[1])

        const byBobInvokedContract = await contract.connect(bob)
        await byBobInvokedContract.setFeaturedCommunities([communities[0]])

        expect(await contract.getCommunities()).to.deep.eq([communities[0], communities[1]])
        expect(await contract.getFeaturedCommunities()).to.deep.eq([communities[0]])

        await byBobInvokedContract.setFeaturedCommunities([communities[1]])
        expect(await contract.getCommunities()).to.deep.eq([communities[0], communities[1]])
        expect(await contract.getFeaturedCommunities()).to.deep.eq([communities[1]])
      })

      it('should override previously featured communities when updating', async () => {
        const { contract, bob } = await loadFixture(fixture)
        await contract.addCommunity(communities[0])
        await contract.addCommunity(communities[1])

        const byBobInvokedContract = await contract.connect(bob)
        await byBobInvokedContract.setFeaturedCommunities([communities[0]])
        expect(await contract.getFeaturedCommunities()).to.deep.eq([communities[0]])
        expect(await contract.isCommunityFeatured(communities[0])).to.eq(true)

        await byBobInvokedContract.setFeaturedCommunities([communities[1]])
        expect(await contract.getFeaturedCommunities()).to.deep.eq([communities[1]])
        expect(await contract.isCommunityFeatured(communities[0])).to.eq(false)
        expect(await contract.isCommunityFeatured(communities[1])).to.eq(true)

        await byBobInvokedContract.setFeaturedCommunities([])
        expect(await contract.getFeaturedCommunities()).to.deep.eq([])
        expect(await contract.isCommunityFeatured(communities[0])).to.eq(false)
        expect(await contract.isCommunityFeatured(communities[1])).to.eq(false)
      })

      it('should revert when invoked by a non-owner', async () => {
        const { contract, bob } = await loadFixture(fixture)
        await expect(contract.setFeaturedCommunities([communities[0]])).to.be.revertedWith('Invalid sender')
      })

      it('should revert when trying to set a non-listed community as featured', async () => {
        const { contract, bob } = await loadFixture(fixture)
        const byBobInvokedContract = await contract.connect(bob)
        await expect(byBobInvokedContract.setFeaturedCommunities([communities[0]])).to.be.revertedWith(
          'Community not in directory'
        )
      })
    })

    describe('#removeCommunity()', async () => {
      it('should also remove featured community', async () => {
        const { contract, bob } = await loadFixture(fixture)
        await contract.addCommunity(communities[0])
        await contract.addCommunity(communities[1])

        const byBobInvokedContract = await contract.connect(bob)
        await byBobInvokedContract.setFeaturedCommunities([communities[0]])

        expect(await contract.getCommunities()).to.deep.eq([communities[0], communities[1]])
        expect(await contract.getFeaturedCommunities()).to.deep.eq([communities[0]])

        await contract.removeCommunity(communities[0])
        expect(await contract.getFeaturedCommunities()).to.deep.eq([])
      })
    })

    describe('#isCommunityFeatured()', () => {
      it('should indicate if a community is in the directory', async () => {
        const { contract, bob } = await loadFixture(fixture)
        await contract.addCommunity(communities[0])
        const byBobInvokedContract = await contract.connect(bob)
        await byBobInvokedContract.setFeaturedCommunities([communities[0]])

        expect(await contract.isCommunityFeatured(communities[0])).to.eq(true)
        expect(await contract.isCommunityFeatured(communities[1])).to.eq(false)
      })
    })
  })
})
