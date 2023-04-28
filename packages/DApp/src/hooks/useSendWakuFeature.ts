import { useCallback } from 'react'
import { useWaku } from '../providers/waku/provider'
import { useEthers, useSigner } from '@usedapp/core'
import { useConfig } from '../providers/config'
import { createWakuFeatureMsg } from '../helpers/wakuFeature'
import { BigNumber } from 'ethers'
import { EncoderV0 } from 'js-waku/lib/waku_message/version_0'

export function useSendWakuFeature() {
  const { waku } = useWaku()
  const signer = useSigner()
  const { account, chainId } = useEthers()
  const { config } = useConfig()

  const sendWakuFeature = useCallback(
    async (voteAmount: number, publicKey: string) => {
      if (!chainId) {
        return
      }
      const msg = await createWakuFeatureMsg(account, signer, BigNumber.from(voteAmount), publicKey, chainId)
      if (msg) {
        if (waku) {
          // todo: init encoder once
          await waku.lightPush.push(new EncoderV0(config.wakuFeatureTopic), { payload: msg })
        } else {
          alert('error sending vote please try again')
        }
      }
    },
    [waku, signer, account, chainId]
  )

  return sendWakuFeature
}
