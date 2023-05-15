import { receiveWakuFeatureMsg } from './wakuFeature'
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

export async function receiveWakuFeature(
  waku: WakuLight | undefined,
  topic: string,
  chainId: number,
  activeVoting: FeaturedVoting
) {
  let messages = await receiveWakuFeatureMsg(waku, topic, chainId)
  const featureVotes: CommunitiesFeatureVotes = {}

  if (messages && messages?.length > 0) {
    messages = messages.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    const validatedMessages = []

    for (const message of messages) {
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
      merge(featureVotes, { [message.publicKey]: { votes: { [message.voter]: message.sntAmount } } })
    })

    sumVotes(featureVotes)
  }

  return { votes: featureVotes }
}
