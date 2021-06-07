import { BigNumber } from 'ethers'
import { CommunityDetail } from '../models/community'

export const communitiesUnderVote = [
  '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24',
  '0xabA1eFawef4bc39ud9e8C9aD2d787330B602eb24',
]

export const communitiesInDirectory = [
  '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24',
  '0xabA1eF51ef4bc360a9e8C9aD2d787330B602eb24',
  '0xabA1eF51ef4bc36ed9e8C9aD2d787330B602eb24',
  '0xabA1eF51ef4bc39ud9e8C9aD2d787330B602eb24',
]

export const communities: Array<CommunityDetail> = [
  {
    publicKey: '0xabA1eF51ef4aE360a9e8C9aD2d787330B602eb24',
    ens: 'CryptoPunks',
    name: 'CryptoPunks',
    link: 'cryptopunks.com',
    icon: '',
    tags: ['nfts', 'collectables', 'cryptopunks', 'quite long', 'funny', 'very long tag', 'short'],
    description: 'Owners of CryptoPunks, marketplace. Nullam mattis mattis mattis fermentum libero.',
    numberOfMembers: 50,
    validForAddition: true,
    votingHistory: [],
    currentVoting: {
      timeLeft: 28800,
      type: 'Remove',
      voteFor: BigNumber.from(16740235),
      voteAgainst: BigNumber.from(6740235),
    },
    directoryInfo: {
      additionDate: new Date(1622802882000),
      featureVotes: BigNumber.from(62142321),
    },
  },
  {
    publicKey: '0xabA1eF51ef4bc360a9e8C9aD2d787330B602eb24',
    ens: 'MakerDAO Community',
    name: 'MakerDAO Community',
    link: 'MakerDAOCommunity.com',
    icon: '',
    tags: ['nfts', 'collectables', 'cats', 'quite long', 'funny', 'very long tag', 'short'],
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat.',
    numberOfMembers: 250,
    validForAddition: true,
    votingHistory: [],
    currentVoting: undefined,
    directoryInfo: {
      additionDate: new Date(1622716482000),
      untilNextFeature: 1814400,
    },
  },
  {
    publicKey: '0xabA1eF51ef4bc36ed9e8C9aD2d787330B602eb24',
    ens: 'DDEX',
    name: 'DDEX',
    link: 'ddex.com',
    icon: '',
    tags: ['nfts', 'collectables', 'ddex', 'quite long', 'funny', 'very long tag', 'short'],
    description: 'Owners of CryptoPunks, marketplace. Nullam mattis mattis mattis fermentum libero.',
    numberOfMembers: 150,
    validForAddition: true,
    votingHistory: [],
    currentVoting: undefined,
    directoryInfo: {
      additionDate: new Date(1622630082000),
      featureVotes: BigNumber.from(5214321),
    },
  },
  {
    publicKey: '0xabA1eF51ef4bc39ud9e8C9aD2d787330B602eb24',
    ens: 'Name Baazar',
    name: 'Name Baazar',
    link: 'NameBaazar.com',
    icon: '',
    tags: ['nfts', 'collectables', 'name', 'quite long', 'funny', 'very long tag', 'short'],
    description: 'Owners of Name Baazar, marketplace. Nullam mattis mattis mattis fermentum libero.',
    numberOfMembers: 150,
    validForAddition: true,
    votingHistory: [],
    currentVoting: undefined,
    directoryInfo: {
      additionDate: new Date(1622543682000),
      featureVotes: BigNumber.from(314321),
    },
  },
  {
    publicKey: '0xabA1eFawef4bc39ud9e8C9aD2d787330B602eb24',
    ens: 'CryptoKitties',
    name: 'CryptoKitties',
    link: 'CryptoKitties.com',
    icon: '',
    tags: ['nfts', 'collectables', 'cats', 'quite long', 'funny', 'very long tag', 'short'],
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat.',
    numberOfMembers: 50,
    validForAddition: true,
    votingHistory: [],
    currentVoting: {
      timeLeft: 28800,
      type: 'Add',
      voteFor: BigNumber.from(16740235),
      voteAgainst: BigNumber.from(6740235),
    },
  },
]
