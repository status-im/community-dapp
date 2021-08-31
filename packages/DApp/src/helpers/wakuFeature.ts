import { Waku, WakuMessage } from 'js-waku'
import { WakuFeatureData } from '../models/waku'
import { packAndArrayify } from './ethMessage'
import { utils, BigNumber } from 'ethers'
import { JsonRpcSigner } from '@ethersproject/providers'
import proto from './loadProtons'

function verifyWakuFeatureMsg(data: WakuFeatureData | undefined): data is WakuFeatureData {
  if (!data) {
    return false
  }
  const types = ['address', 'uint256', 'address', 'uint256']
  const message = [data.voter, data.sntAmount, data.publicKey, data.timestamp.getTime()]
  const verifiedAddress = utils.verifyMessage(packAndArrayify(types, message), data.sign)

  if (data.msgTimestamp?.getTime() != data.timestamp.getTime() || verifiedAddress != data.voter) {
    return false
  }
  return true
}

function decodeWakuFeature(msg: WakuMessage): WakuFeatureData | undefined {
  try {
    if (!msg.payload) {
      return undefined
    }
    const data = proto.WakuFeature.decode(msg.payload)
    if (data && data.publicKey && data.sign && data.sntAmount && data.timestamp && data.voter) {
      return {
        ...data,
        msgTimestamp: msg.timestamp ?? new Date(0),
        timestamp: new Date(data.timestamp),
        sntAmount: BigNumber.from(data.sntAmount),
      }
    } else {
      return undefined
    }
  } catch {
    return undefined
  }
}

export function decodeWakuFeatures(messages: WakuMessage[] | null) {
  return messages?.map(decodeWakuFeature).filter(verifyWakuFeatureMsg)
}

export async function receiveWakuFeatureMsg(waku: Waku | undefined, topic: string) {
  if (waku) {
    const messages = await waku.store.queryHistory({ contentTopics: [topic] })
    return decodeWakuFeatures(messages)
  }
}

export async function createWakuFeatureMsg(
  account: string | null | undefined,
  signer: JsonRpcSigner | undefined,
  sntAmount: BigNumber,
  publicKey: string,
  contentTopic: string
) {
  if (!account || !signer) {
    return undefined
  }

  const signerAddress = await signer?.getAddress()
  if (signerAddress != account) {
    return undefined
  }
  const timestamp = new Date()

  const types = ['address', 'uint256', 'address', 'uint256']
  const message = [account, sntAmount, publicKey, BigNumber.from(timestamp.getTime())]
  const sign = await signer.signMessage(packAndArrayify(types, message))

  if (sign) {
    const payload = proto.WakuFeature.encode({
      voter: account,
      sntAmount: utils.arrayify(sntAmount),
      publicKey,
      timestamp,
      sign,
    })

    const msg = WakuMessage.fromBytes(payload, {
      contentTopic,
      timestamp,
    })
    return msg
  }
  return undefined
}
