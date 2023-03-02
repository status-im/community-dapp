import { receiveWakuFeatureMsg } from './wakuFeature'
import { getWeek } from '../helpers/getWeek'
import { merge } from 'lodash'
import { BigNumber } from 'ethers'

import type { WakuLight } from 'js-waku/lib/interfaces'

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

export async function receiveWakuFeature(waku: WakuLight | undefined, topic: string, chainId: number) {
  let messages = await receiveWakuFeatureMsg(waku, topic, chainId)
  const wakuFeatured: CommunitiesFeatureVotes = {}
  let top5: [string, CommunityFeatureVotes][] = []
  if (messages && messages?.length > 0) {
    messages = messages.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    let prevWeek = getWeek(messages[0].timestamp)
    messages.forEach((el) => {
      if (prevWeek === getWeek(el.timestamp)) {
        if (!top5.find((featuredComm) => featuredComm[0] === el.publicKey)) {
          merge(wakuFeatured, { [el.publicKey]: { votes: { [el.voter]: el.sntAmount } } })
        }
      } else {
        top5 = getTop(wakuFeatured, 5)
        top5.forEach((featuredComm) => {
          wakuFeatured[featuredComm[0]].votes = {}
          wakuFeatured[featuredComm[0]].sum = BigNumber.from(0)
        })
        prevWeek = getWeek(el.timestamp)
      }
    })
    if (getWeek(messages[messages.length - 1].timestamp) < getWeek(new Date())) {
      top5 = getTop(wakuFeatured, 5)
      top5.forEach((featuredComm) => {
        wakuFeatured[featuredComm[0]].votes = {}
        wakuFeatured[featuredComm[0]].sum = BigNumber.from(0)
      })
    }
    sumVotes(wakuFeatured)
  }
  return { wakuFeatured, top5 }
}
