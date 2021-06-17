import { expect, use } from 'chai'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import MockContract from '../build/MockContract.json'

use(solidity)

describe('Contract', () => {
  const provider = new MockProvider()
  const [alice] = provider.getWallets()

  it('success', async () => {
    const contract = await deployContract(alice, MockContract)
    expect(await contract.getTrue()).to.eq(true)
  })
})
