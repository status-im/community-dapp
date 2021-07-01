import { useCallback } from 'react'
import { useWaku } from '../providers/waku/provider'
import { useEthers } from '@usedapp/core'
import { useConfig } from '../providers/config'
import { createWakuMessage } from '../helpers/wakuMessage'

export function useSendWakuVote() {
  const { waku } = useWaku()
  const { account, library } = useEthers()
  const { config } = useConfig()

  const sendWakuVote = useCallback(
    async (voteAmount: number, room: number, type: number) => {
      const msg = await createWakuMessage(account, library?.getSigner(), room, voteAmount, type, config.wakuTopic)
      if (msg) {
        if (waku) {
          await waku.relay.send(msg)
        } else {
          alert('error sending vote please try again')
        }
      }
    },
    [waku, library, account]
  )

  return sendWakuVote
}
