import { expect } from 'chai'
import { getCommunityDetailsSync, getCommunitiesInDirectorySync } from '../src/helpers/apiMock'
import { communities } from '../src/helpers/apiMockData'
import { DirectorySortingEnum } from '../src/models/community'

describe('getCommunityDetails', () => {
  it('success', async () => {
    expect(getCommunityDetailsSync('0x344C19E3040Ec63A96b7aeB708C82a066315604B')).to.deep.eq(communities[0])
  })
  it('gets different community', async () => {
    expect(getCommunityDetailsSync('0xABA1EF51EF4bc360A9E8c9Ad2d787330b602EB24')).to.deep.eq(communities[1])
  })
  it('empty', async () => {
    expect(getCommunityDetailsSync('0xabA1eF51ef4bc360a9e8C9aD2d787330B6q2eb24')).to.deep.eq(undefined)
  })
})

describe('getCommunitiesInDirectory', () => {
  it('success', async () => {
    expect(getCommunitiesInDirectorySync(3, 0)).to.deep.eq({ page: 0, communities: communities.slice(0, 3) })
  })
  it('gets second page', async () => {
    expect(getCommunitiesInDirectorySync(3, 1)).to.deep.eq({ page: 1, communities: communities.slice(3, 4) })
  })
  it('sorts AtoZ', async () => {
    expect(getCommunitiesInDirectorySync(3, 0, DirectorySortingEnum.AtoZ)).to.deep.eq({
      page: 0,
      communities: [communities[0], communities[2], communities[1]],
    })
    expect(getCommunitiesInDirectorySync(3, 1, DirectorySortingEnum.AtoZ)).to.deep.eq({
      page: 1,
      communities: [communities[3]],
    })
  })
  it('sorts ZtoA', async () => {
    expect(getCommunitiesInDirectorySync(3, 0, DirectorySortingEnum.ZtoA)).to.deep.eq({
      page: 0,
      communities: [communities[3], communities[1], communities[2]],
    })
    expect(getCommunitiesInDirectorySync(3, 1, DirectorySortingEnum.ZtoA)).to.deep.eq({
      page: 1,
      communities: [communities[0]],
    })
  })
  it('sorts IncludedLongAgo', async () => {
    expect(getCommunitiesInDirectorySync(3, 0, DirectorySortingEnum.IncludedLongAgo)).to.deep.eq({
      page: 0,
      communities: [communities[3], communities[2], communities[1]],
    })
    expect(getCommunitiesInDirectorySync(3, 1, DirectorySortingEnum.IncludedLongAgo)).to.deep.eq({
      page: 1,
      communities: [communities[0]],
    })
  })
  it('sorts IncludedRecently', async () => {
    expect(getCommunitiesInDirectorySync(3, 0, DirectorySortingEnum.IncludedRecently)).to.deep.eq({
      page: 0,
      communities: [communities[0], communities[1], communities[2]],
    })
    expect(getCommunitiesInDirectorySync(3, 1, DirectorySortingEnum.IncludedRecently)).to.deep.eq({
      page: 1,
      communities: [communities[3]],
    })
  })
  it('sorts MostVotes', async () => {
    expect(getCommunitiesInDirectorySync(3, 0, DirectorySortingEnum.MostVotes)).to.deep.eq({
      page: 0,
      communities: [communities[0], communities[2], communities[3]],
    })
    expect(getCommunitiesInDirectorySync(3, 1, DirectorySortingEnum.MostVotes)).to.deep.eq({
      page: 1,
      communities: [communities[1]],
    })
  })
  it('sorts LeastVotes', async () => {
    expect(getCommunitiesInDirectorySync(3, 0, DirectorySortingEnum.LeastVotes)).to.deep.eq({
      page: 0,
      communities: [communities[3], communities[2], communities[0]],
    })
    expect(getCommunitiesInDirectorySync(3, 1, DirectorySortingEnum.LeastVotes)).to.deep.eq({
      page: 1,
      communities: [communities[1]],
    })
  })
  it('filters', async () => {
    expect(getCommunitiesInDirectorySync(3, 0, undefined, 'punks')).to.deep.eq({
      page: 0,
      communities: [communities[0], communities[2]],
    })
  })
  it('filters tags', async () => {
    expect(getCommunitiesInDirectorySync(3, 0, undefined, 'cats')).to.deep.eq({
      page: 0,
      communities: [communities[1]],
    })
  })
})
