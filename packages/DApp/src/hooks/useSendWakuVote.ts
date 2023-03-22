import { useCallback } from 'react'
import { useWaku } from '../providers/waku/provider'
import { useEthers } from '@usedapp/core'
import { useConfig } from '../providers/config'
import { createWakuVote } from '../helpers/wakuVote'
import { useTypedVote } from './useTypedVote'
import { EncoderV0 } from 'js-waku/lib/waku_message/version_0'

export function useSendWakuVote() {
  const { waku } = useWaku()
  const { account, library } = useEthers()
  const { config } = useConfig()
  const { getTypedVote } = useTypedVote()

  const sendWakuVote = useCallback(
    async (voteAmount: number, room: number, type: number) => {
      const timestamp = Math.floor(Date.now() / 1000)
      const msg = await createWakuVote(account, library?.getSigner(), room, voteAmount, type, timestamp, getTypedVote)
      if (msg) {
        if (waku) {
          await waku.lightPush.push(new EncoderV0(config.wakuTopic + room.toString()), { payload: msg })
        } else {
          alert('error sending vote please try again')
        }
      }
    },
    [waku, library, account, getTypedVote]
  )

  return sendWakuVote
}
