import { receiveWakuFeatureMsg } from '../helpers/wakuMessage'
import { getWeek } from '../helpers/getWeek'
import { merge } from 'lodash'
import { BigNumber } from 'ethers'
import { Waku } from 'js-waku'

function sumVotes(map: any) {
  for (const [publicKey, community] of Object.entries(map) as any[]) {
    map[publicKey]['sum'] = BigNumber.from(0)
    for (const votes of Object.entries(community['votes'])) {
      map[publicKey]['sum'] = map[publicKey]['sum'].add(votes[1])
    }
  }
}

function getTop(map: any, top: number) {
  sumVotes(map)
  return Object.entries(map)
    .sort((a: any, b: any) => (a[1].sum > b[1].sum ? -1 : 1))
    .slice(0, top)
}

export async function receiveWakuFeature(waku: Waku | undefined, topic: string) {
  let messages = await receiveWakuFeatureMsg(waku, topic)
  const wakuFeatured: any = {}
  let top5: any[] = []
  if (messages && messages?.length > 0) {
    messages = messages.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    let prevWeek = getWeek(messages[0].timestamp)
    messages.forEach((el: any) => {
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
    sumVotes(wakuFeatured)
  }
  return { wakuFeatured, top5 }
}
