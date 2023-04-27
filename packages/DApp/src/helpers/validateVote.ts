import { BigNumber } from 'ethers'

export function validateVote(vote: any, verificationStartAt: BigNumber, startAt: BigNumber) {
  if (vote.timestamp < verificationStartAt || vote.timestamp >= startAt) {
    return false
  }

  return true
}
