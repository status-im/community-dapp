import { ChainId } from '@usedapp/core'
import { OptimismSepolia } from '../config'

// todo?: move to config.ts
export const contracts = {
  [ChainId.Optimism]: {
    votingContract: '0x321Ba646d994200257Ce4bfe18F66C9283ad1407',
    featuredVotingContract: '0x2EA9700E7F27E09F254f2DaEc5E05015b2b961d0',
    directoryContract: '0xA8d270048a086F5807A8dc0a9ae0e96280C41e3A',
    tokenContract: '0x650AF3C15AF43dcB218406d30784416D64Cfb6B2',
    multicallContract: '0xeAa6877139d436Dc6d1f75F3aF15B74662617B2C',
  },
  [ChainId.OptimismGoerli]: {
    votingContract: '0x744Fd6e98dad09Fb8CCF530B5aBd32B56D64943b',
    featuredVotingContract: '0x898331B756EE1f29302DeF227a4471e960c50612',
    directoryContract: '0xB3Ef5B0825D5f665bE14394eea41E684CE96A4c5',
    tokenContract: '0xcAD273fA2bb77875333439FDf4417D995159c3E1',
    multicallContract: '0xcA11bde05977b3631167028862bE2a173976CA11',
  },
  [OptimismSepolia.chainId]: {
    votingContract: '0x7Ff554af5b6624db2135E4364F416d1D397f43e6',
    featuredVotingContract: '0x336DFD512164Fe8CFA809BdE94B13E76e42edD6B',
    directoryContract: '0x6B94e21FAB8Af38E8d89dd4A0480C04e9a5c53Ab',
    tokenContract: '0x0B5DAd18B8791ddb24252B433ec4f21f9e6e5Ed0',
    multicallContract: '0xcA11bde05977b3631167028862bE2a173976CA11',
  },
  [ChainId.Hardhat]: {
    votingContract: process.env.VOTING_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    directoryContract: process.env.DIRECTORY_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    tokenContract: process.env.TOKEN_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    multicallContract: process.env.MULTICALL_CONTRACT ?? '0x0000000000000000000000000000000000000000',
    featuredVotingContract: process.env.FEATURED_VOTING_CONTRACT ?? '0x0000000000000000000000000000000000000000',
  },
}
