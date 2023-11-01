import { ChainId } from '@usedapp/core'

// todo?: move to config.ts
export const contracts = {
  [ChainId.Optimism]: {
    votingContract: '0x321Ba646d994200257Ce4bfe18F66C9283ad1407',
    featuredVotingContract: '0x2EA9700E7F27E09F254f2DaEc5E05015b2b961d0',
    directoryContract: '0xA8d270048a086F5807A8dc0a9ae0e96280C41e3A',
    tokenContract: '0x650AF3C15AF43dcB218406d30784416D64Cfb6B2',
    multicallContract: '0xeAa6877139d436Dc6d1f75F3aF15B74662617B2C',
  },
  [ChainId.Hardhat]: {
    votingContract: process.env.VOTING_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    directoryContract: process.env.DIRECTORY_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    tokenContract: process.env.TOKEN_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    multicallContract: process.env.MULTICALL_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    featuredVotingContract: process.env.FEATURED_VOTING_CONTRACT ?? '0x0000000000000000000000000000000000000000',
  },
}
