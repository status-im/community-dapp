import { expect } from 'chai'
import { getCommunityDetails, getCommunitiesInDirectory } from '../src/helpers/apiMock'
import { communities } from '../src/helpers/apiMockData'
import { DirectorySortingEnum } from '../src/models/community'

describe('getCommunityDetails', () => {
  it('success', async () => {
    expect(getCommunityDetails('0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24')).to.deep.eq(communities[0])
  })
  it('gets different community', async () => {
    expect(getCommunityDetails('0xabA1eF51ef4bc360a9e8C9aD2d787330B602eb24')).to.deep.eq(communities[1])
  })
  it('empty', async () => {
    expect(getCommunityDetails('0xabA1eF51ef4bc360a9e8C9aD2d787330B6q2eb24')).to.deep.eq(undefined)
  })
})

describe('getCommunitiesInDirectory', () => {
  it('success', async () => {
    expect(getCommunitiesInDirectory(3, 0)).to.deep.eq({ page: 0, communities: communities.slice(0, 3) })
  })
  it('gets second page', async () => {
    expect(getCommunitiesInDirectory(3, 1)).to.deep.eq({ page: 1, communities: communities.slice(3, 4) })
  })
  it('sorts AtoZ', async () => {
    expect(getCommunitiesInDirectory(3, 0, DirectorySortingEnum.AtoZ)).to.deep.eq({
      page: 0,
      communities: [communities[0], communities[2], communities[1]],
    })
    expect(getCommunitiesInDirectory(3, 1, DirectorySortingEnum.AtoZ)).to.deep.eq({
      page: 1,
      communities: [communities[3]],
    })
  })
  it('sorts ZtoA', async () => {
    expect(getCommunitiesInDirectory(3, 0, DirectorySortingEnum.ZtoA)).to.deep.eq({
      page: 0,
      communities: [communities[3], communities[1], communities[2]],
    })
    expect(getCommunitiesInDirectory(3, 1, DirectorySortingEnum.ZtoA)).to.deep.eq({
      page: 1,
      communities: [communities[0]],
    })
  })
  it('sorts IncludedLongAgo', async () => {
    expect(getCommunitiesInDirectory(3, 0, DirectorySortingEnum.IncludedLongAgo)).to.deep.eq({
      page: 0,
      communities: [communities[3], communities[2], communities[1]],
    })
    expect(getCommunitiesInDirectory(3, 1, DirectorySortingEnum.IncludedLongAgo)).to.deep.eq({
      page: 1,
      communities: [communities[0]],
    })
  })
  it('sorts IncludedRecently', async () => {
    expect(getCommunitiesInDirectory(3, 0, DirectorySortingEnum.IncludedRecently)).to.deep.eq({
      page: 0,
      communities: [communities[0], communities[1], communities[2]],
    })
    expect(getCommunitiesInDirectory(3, 1, DirectorySortingEnum.IncludedRecently)).to.deep.eq({
      page: 1,
      communities: [communities[3]],
    })
  })
  it('sorts MostVotes', async () => {
    expect(getCommunitiesInDirectory(3, 0, DirectorySortingEnum.MostVotes)).to.deep.eq({
      page: 0,
      communities: [communities[0], communities[2], communities[3]],
    })
    expect(getCommunitiesInDirectory(3, 1, DirectorySortingEnum.MostVotes)).to.deep.eq({
      page: 1,
      communities: [communities[1]],
    })
  })
  it('sorts LeastVotes', async () => {
    expect(getCommunitiesInDirectory(3, 0, DirectorySortingEnum.LeastVotes)).to.deep.eq({
      page: 0,
      communities: [communities[3], communities[2], communities[0]],
    })
    expect(getCommunitiesInDirectory(3, 1, DirectorySortingEnum.LeastVotes)).to.deep.eq({
      page: 1,
      communities: [communities[1]],
    })
  })
  it('filters', async () => {
    expect(getCommunitiesInDirectory(3, 0, undefined, 'punks')).to.deep.eq({
      page: 0,
      communities: [communities[0], communities[2]],
    })
  })
  it('filters tags', async () => {
    expect(getCommunitiesInDirectory(3, 0, undefined, 'cats')).to.deep.eq({
      page: 0,
      communities: [communities[1]],
    })
  })
})
