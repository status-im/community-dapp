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
    votingContract: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    directoryContract: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    tokenContract: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    multicallContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },
}
