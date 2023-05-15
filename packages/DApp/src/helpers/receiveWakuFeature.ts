import { receiveWakuFeatureMsg } from './wakuFeature'
import { getWeek } from '../helpers/getWeek'
import { merge } from 'lodash'
import { BigNumber } from 'ethers'

import type { WakuLight } from 'js-waku/lib/interfaces'
import { FeaturedVoting } from '../models/smartContract'

type CommunityFeatureVote = {
  [voter: string]: BigNumber
}

type CommunityFeatureVotes = {
  sum: BigNumber
  votes: CommunityFeatureVote
}

type CommunitiesFeatureVotes = {
  [publicKey: string]: CommunityFeatureVotes
}

function sumVotes(map: CommunitiesFeatureVotes) {
  for (const [publicKey, community] of Object.entries(map)) {
    map[publicKey]['sum'] = BigNumber.from(0)
    for (const votes of Object.entries(community['votes'])) {
      map[publicKey]['sum'] = map[publicKey]['sum'].add(votes[1])
    }
  }
}

function getTop(map: CommunitiesFeatureVotes, top: number) {
  sumVotes(map)
  return Object.entries(map)
    .sort((a, b) => (a[1].sum > b[1].sum ? -1 : 1))
    .slice(0, top)
}

export async function receiveWakuFeature(
  waku: WakuLight | undefined,
  topic: string,
  chainId: number,
  activeVoting: FeaturedVoting
) {
  // const activeVoting = {}
  let messages = await receiveWakuFeatureMsg(waku, topic, chainId)
  console.log('%c MESSAGES', 'background-color: #000; color: #fff')
  console.log(messages)
  const featureVotes: CommunitiesFeatureVotes = {}

  if (messages && messages?.length > 0) {
    messages = messages.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    const validatedMessages = []

    for (const message of messages) {
      console.log(message, 1)
      const messageTimestamp = message.timestamp.getTime() / 1000

      const validatedMessage =
        messageTimestamp < activeVoting.verificationStartAt.toNumber() &&
        messageTimestamp > activeVoting.startAt.toNumber()

      if (!validatedMessage) {
        break
      } else {
        validatedMessages.push(message)
      }
    }

    validatedMessages?.forEach((message) => {
      console.log('MESSAGE HERE')
      console.log(message)
      merge(featureVotes, { [message.publicKey]: { votes: { [message.voter]: message.sntAmount } } })
    })

    console.log('%c MESSAGES', 'background-color: #000; color: #fff')
    console.log(messages)
    // go through all messagesCurrentVoting and create new object similar to votesMock of type Votes
    // messages.forEach((message) => {
    //   if (!allVotes?.[message.publicKey]?.votes?.[message.voter]) {
    //     allVotes[message.publicKey] = {
    //       votes: { [message.voter]: message.sntAmount },
    //       sum:
    //         allVotes[message.publicKey]?.sum?.add(BigNumber.from(message.sntAmount)) ??
    //         BigNumber.from(message.sntAmount),
    //     }
    //   }

    // if community exists in votesMock
    // if voter exists in votesMock[community]
    // add votesMock[community][voter] += message.sntAmount
    // else
    // votesMock[community][voter] = message.sntAmount
    // votesMock[community].sum += message.sntAmount
    // else
    // votesMock[community] = {
    //   votes: {
    //     [message.voter]: message.sntAmount
    //   },
    //   sum: message.sntAmount
    // }
    // }

    // messages.forEach((el) => {
    //   if (prevWeek === getWeek(el.timestamp)) {
    //     if (!top5.find((featuredComm) => featuredComm[0] === el.publicKey)) {
    //       merge(featureVotes, { [el.publicKey]: { votes: { [el.voter]: el.sntAmount } } })
    //     }
    //   } else {
    //     // bug: this element's vote is ignored
    //     top5 = getTop(featureVotes, 5)
    //     top5.forEach((featuredComm) => {
    //       featureVotes[featuredComm[0]].votes = {}
    //       featureVotes[featuredComm[0]].sum = BigNumber.from(0)
    //     })
    //     prevWeek = getWeek(el.timestamp)
    //   }
    // })

    // if (getWeek(messages[messages.length - 1].timestamp) < getWeek(new Date())) {
    //   top5 = getTop(featureVotes, 5)
    //   top5.forEach((featuredComm) => {
    //     featureVotes[featuredComm[0]].votes = {}
    //     featureVotes[featuredComm[0]].sum = BigNumber.from(0)
    //   })
    // }
    sumVotes(featureVotes)
  }

  console.log(featureVotes)
  return { votes: featureVotes }
}
