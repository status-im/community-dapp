import { ChainId } from '@usedapp/core'

// todo?: move to config.ts
export const contracts = {
  [ChainId.Optimism]: {
    // TO BE PROVIDED
    votingContract: '0x0000000000000000000000000000000000000000',
    featuredVotingContract: '0x0000000000000000000000000000000000000000',
    directoryContract: '0x0000000000000000000000000000000000000000',
    tokenContract: '0x0000000000000000000000000000000000000000',
  },
  [ChainId.OptimismGoerli]: {
    votingContract: '0x7864aDdE74cFa6Efb2ee8E8d7bd96f9C3dd068b3',
    featuredVotingContract: '0x2243f6e24b827bB5Dd8F4F89CC43F8b6902f238B',
    directoryContract: '0x7E01b56d0CEa1D2b5D4018E550A2d2A288a38C6B',
    tokenContract: '0xfb8dC8748F24F8B155123b0341a762C898511c76',
  },
  [ChainId.Hardhat]: {
    votingContract: process.env.VOTING_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    directoryContract: process.env.DIRECTORY_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    tokenContract: process.env.TOKEN_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    multicallContract: process.env.MULTICALL_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    featuredVotingContract: process.env.FEATURED_VOTING_CONTRACT ?? '0x0000000000000000000000000000000000000000',
  },
}
