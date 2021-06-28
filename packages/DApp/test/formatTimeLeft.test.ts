import { formatTimeLeft } from '../src/helpers/fomatTimeLeft'
import { expect } from 'chai'

describe('formatTimeLeft', () => {
  it('seconds left', () => {
    expect(formatTimeLeft(10000)).to.eq('10 seconds left')
  })
  it('hours left', () => {
    expect(formatTimeLeft(8000000)).to.eq('2 hours left')
  })
  it('days left', () => {
    expect(formatTimeLeft(172800000)).to.eq('2 days left')
  })
  it('seconds ago', () => {
    expect(formatTimeLeft(-10000)).to.eq('10 seconds ago')
  })
  it('hours ago', () => {
    expect(formatTimeLeft(-8000000)).to.eq('2 hours ago')
  })
  it('days ago', () => {
    expect(formatTimeLeft(-172800000)).to.eq('2 days ago')
  })
})
