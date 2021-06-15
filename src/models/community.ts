import { BigNumber } from 'ethers'

export type CurrentVoting = {
  // object describing current voting if community isnt under vote returns undefined
  timeLeft: number // number of seconds left in vote if vote is waiting for finalization returns 0
  type: 'Remove' | 'Add'
  voteFor: BigNumber // number of snt for a vote
  voteAgainst: BigNumber // number of snt against a vote
  ID?: number // id of voting room
}

export type CommunityDetail = {
  publicKey: string // Address of a community
  ens: string // ens of a community
  name: string // name of a community
  link: string // link to visit a community
  icon: string // url to a icon of a community
  tags: Array<string> // list of strings that contain tag names
  description: string // short description about community
  numberOfMembers: number // amount of members in community
  validForAddition: boolean // boolean of wheather community can be added to directory
  votingHistory:
    | [
        // list of objects describing previous votes
        {
          date: Date // date of vote
          type: 'Remove' | 'Add' // string with type of vote
          result: 'Passed' | 'Failed' // string with vote result
        }
      ]
    | []
  currentVoting: CurrentVoting | undefined
  directoryInfo?: {
    // if community is in directory this object describes additional directory info
    additionDate: Date // date of addition to directory
    featureVotes?: BigNumber // number of votes for featuring community undefined if community can't be voted on
    untilNextFeature?: number // number of seconds until community can be featured again
  }
}

export enum VotingSortingEnum {
  EndingSoonest = 0,
  EndingLatest = 1,
  MostVotes = 2,
  LeastVotes = 3,
  AtoZ = 4,
  ZtoA = 5,
}

export enum DirectorySortingEnum {
  IncludedRecently = 0,
  IncludedLongAgo = 1,
  MostVotes = 2,
  LeastVotes = 3,
  AtoZ = 4,
  ZtoA = 5,
}
