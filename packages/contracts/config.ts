export interface ContractConfig {
  votingLengthInSeconds: number
  votingVerificationLengthInSeconds: number
  timeBetweenVotingInSeconds: number
  featuredVotingLengthInSeconds: number
  featuredVotingVerificationLengthInSeconds: number
  cooldownPeriod: number
  featuredPerVotingCount: number
}

const env = process.env.ENV ?? 'localhost'

if (!['localhost', 'development', ''].includes(env)) {
  throw new Error('Unsupported environment')
}

export const configs: Record<typeof process.env.ENV, ContractConfig> = {
  localhost: {
    votingLengthInSeconds: 4 * 60, // 4 minutes
    votingVerificationLengthInSeconds: 2 * 60, // 2 minutes
    timeBetweenVotingInSeconds: 60, // 1 minute
    featuredVotingLengthInSeconds: 4 * 60, // 4 minutes
    featuredVotingVerificationLengthInSeconds: 2 * 60, // 2 minutes
    cooldownPeriod: 1,
    featuredPerVotingCount: 3,
  },
  development: {
    votingLengthInSeconds: 2 * 24 * 3600, // 2 days
    votingVerificationLengthInSeconds: 1 * 24 * 3600, // 1 day
    timeBetweenVotingInSeconds: 2 * 24 * 3600, // 2 days
    featuredVotingLengthInSeconds: 2 * 24 * 3600, // 2 days
    featuredVotingVerificationLengthInSeconds: 1 * 24 * 3600, // 1 day
    cooldownPeriod: 3,
    featuredPerVotingCount: 5,
  },
  production: {
    votingLengthInSeconds: 2 * 24 * 3600, // 2 days
    votingVerificationLengthInSeconds: 1 * 24 * 3600, // 1 day
    timeBetweenVotingInSeconds: 2 * 24 * 3600, // 2 days
    featuredVotingLengthInSeconds: 2 * 24 * 3600, // 2 days
    featuredVotingVerificationLengthInSeconds: 1 * 24 * 3600, // 1 day
    cooldownPeriod: 3,
    featuredPerVotingCount: 5,
  },
}

export const config = configs[env]
