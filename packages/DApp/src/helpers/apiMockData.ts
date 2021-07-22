import { BigNumber } from 'ethers'
import { CommunityDetail } from '../models/community'

export const communitiesUnderVote = [
  '0x344C19E3040Ec63A96b7aeB708C82a066315604B',
  '0x0FA1A5CC3911A5697B625EF1C75eF4caE764bd34',
  '0x95863d16bA2fb60B7d9Ca725f22df76fA5dEe61D',
]
export const communitiesInDirectory = [
  '0x344C19E3040Ec63A96b7aeB708C82a066315604B',
  '0xABA1EF51EF4bc360A9E8c9Ad2d787330b602EB24',
  '0xabA1EF51eF4Bc36ED9e8C9ad2d787330b602EB24',
  '0x9Ac2b2E23eb62fa70fc7f31c0895AC46230C241e',
]

export const communities: Array<CommunityDetail> = [
  {
    publicKey: '0x344C19E3040Ec63A96b7aeB708C82a066315604B',
    ens: 'CryptoPunks',
    name: 'CryptoPunks',
    link: 'cryptopunks.com',
    icon: 'https://static.coindesk.com/wp-content/uploads/2021/01/cryptopunk.jpg',
    tags: ['nfts', 'collectables', 'cryptopunks', 'quite long', 'funny', 'very long tag', 'short'],
    description: 'Owners of CryptoPunks, marketplace. Nullam mattis mattis mattis fermentum libero.',
    numberOfMembers: 4,
    validForAddition: false,
    votingHistory: [
      {
        type: 'Add',
        date: new Date('2021-03-16'),
        result: 'Failed',
        ID: 0,
      },
      {
        type: 'Add',
        date: new Date('2021-04-02'),
        result: 'Passed',
        ID: 1,
      },
      {
        type: 'Feature',
        date: new Date('2021-04-17'),
        result: 'Failed',
        ID: 2,
      },
      {
        type: 'Remove',
        date: new Date('2021-05-07'),
        result: 'Passed',
        ID: 3,
      },
    ],
    currentVoting: {
      timeLeft: 172800,
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
    publicKey: '0xABA1EF51EF4bc360A9E8c9Ad2d787330b602EB24',
    ens: 'MakerDAO Community',
    name: 'MakerDAO Community',
    link: 'MakerDAOCommunity.com',
    icon: 'https://positiveblockchain.io/wp-content/uploads/2019/07/maker-lrg-510x510-1.png',
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
    publicKey: '0xabA1EF51eF4Bc36ED9e8C9ad2d787330b602EB24',
    ens: 'DDEX',
    name: 'DDEX',
    link: 'ddex.com',
    icon: 'https://pbs.twimg.com/profile_images/1225147341549625344/Cd-ILEu6.png',
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
    publicKey: '0x9Ac2b2E23eb62fa70fc7f31c0895AC46230C241e',
    ens: 'Name Baazar',
    name: 'Name Baazar',
    link: 'NameBaazar.com',
    icon: 'https://pbs.twimg.com/profile_images/893709814341148672/i5gj6FaU_400x400.jpg',
    tags: ['nfts', 'collectables', 'name', 'quite long', 'funny', 'very long tag', 'short'],
    description: 'Owners of Name Baazar, marketplace. Nullam mattis mattis mattis fermentum libero.',
    numberOfMembers: 150,
    validForAddition: false,
    votingHistory: [],
    currentVoting: undefined,
    directoryInfo: {
      additionDate: new Date(1622543682000),
      featureVotes: BigNumber.from(314321),
    },
  },
  {
    publicKey: '0x0FA1A5CC3911A5697B625EF1C75eF4caE764bd34',
    ens: 'CryptoKitties',
    name: 'CryptoKitties',
    link: 'CryptoKitties.com',
    icon: 'https://www.cryptokitties.co/icons/logo.svg',
    tags: ['nfts', 'collectables', 'cats', 'quite long', 'funny', 'very long tag', 'short'],
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat.',
    numberOfMembers: 50,
    validForAddition: true,
    votingHistory: [
      {
        type: 'Add',
        date: new Date('2021-03-16'),
        result: 'Failed',
        ID: 0,
      },
      {
        type: 'Add',
        date: new Date('2021-04-02'),
        result: 'Passed',
        ID: 1,
      },
      {
        type: 'Feature',
        date: new Date('2021-04-17'),
        result: 'Failed',
        ID: 2,
      },
      {
        type: 'Remove',
        date: new Date('2021-05-07'),
        result: 'Passed',
        ID: 3,
      },
    ],
    currentVoting: {
      timeLeft: 28800,
      type: 'Add',
      voteFor: BigNumber.from(16740235),
      voteAgainst: BigNumber.from(126740235),
    },
  },
  {
    publicKey: '0x95863d16bA2fb60B7d9Ca725f22df76fA5dEe61D',
    ens: 'Awesome Community',
    name: 'Awesome Community',
    link: 'Awesome Community.com',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/LetterA.svg/1200px-LetterA.svg.png',
    tags: ['nfts', 'collectables', 'cats', 'quite long', 'funny', 'very long tag', 'short'],
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat.',
    numberOfMembers: 50,
    validForAddition: true,
    votingHistory: [],
    currentVoting: {
      timeLeft: 0,
      type: 'Add',
      voteFor: BigNumber.from(16740235),
      voteAgainst: BigNumber.from(126740235),
    },
  },
]
