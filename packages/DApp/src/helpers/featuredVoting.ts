import { FeaturedVoting } from '../models/smartContract'

type Phase = 'not started' | 'voting' | 'verification' | 'ended' | null

export function getFeaturedVotingState(featuredVoting: FeaturedVoting | null): Phase {
  const currentTimestamp = Date.now() / 1000

  if (!featuredVoting) {
    return null
  }

  if (featuredVoting.startAt.toNumber() > currentTimestamp) {
    return 'not started'
  }

  if (featuredVoting.verificationStartAt.toNumber() > currentTimestamp) {
    return 'voting'
  }

  if (
    featuredVoting.verificationStartAt.toNumber() < currentTimestamp &&
    featuredVoting.endAt.toNumber() > currentTimestamp
  ) {
    return 'verification'
  }

  if (featuredVoting.endAt.toNumber() < currentTimestamp) {
    return 'ended'
  }

  return 'ended'
}

export default { getFeaturedVotingState }
