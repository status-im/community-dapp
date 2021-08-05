import { JsonRpcSigner } from '@ethersproject/providers'
import { BigNumber } from 'ethers'
import { packAndArrayify } from './ethMessage'
import { Waku, WakuMessage } from 'js-waku'
import { recoverAddress } from './ethMessage'
import { utils } from 'ethers'
import proto from './loadProtons'

function getContractParameters(address: string, room: number, type: number, sntAmount: number) {
  return [address, BigNumber.from(room).mul(2).add(type), BigNumber.from(sntAmount)]
}

export function filterVerifiedMessages(messages: any[] | undefined, alreadyVoted: any[]) {
  if (!messages) {
    return []
  }
  const types = ['address', 'uint256', 'uint256']
  const verifiedMessages: any[] = []

  messages.forEach((data) => {
    const contractMessage = getContractParameters(
      data.address,
      data.sessionID,
      data.vote == 'yes' ? 1 : 0,
      data.sntAmount
    )

    if (recoverAddress(types, contractMessage, data.sign) == data.address) {
      const addressInVerified = verifiedMessages.find((el) => el[0] === data.address)
      const addressInVoted = alreadyVoted.find((el: string) => el === data.address)

      if (!addressInVerified && !addressInVoted) {
        contractMessage.push(utils.splitSignature(data.sign).r)
        contractMessage.push(utils.splitSignature(data.sign)._vs)
        verifiedMessages.push(contractMessage)
      }
    }
  })
  return verifiedMessages
}

export async function receiveWakuMessages(waku: Waku, topic: string, room: number) {
  if (!proto) {
    return undefined
  }
  const messages = await waku.store.queryHistory({
    contentTopics: [topic + room.toString()],
  })
  return messages
    ?.map((msg) => proto.WakuVote.decode(msg.payload))
    .map((msg) => {
      return { ...msg, sntAmount: BigNumber.from(msg.sntAmount) }
    })
}

export async function receiveWakuFeatureMsg(waku: Waku | undefined, topic: string) {
  if (!proto) {
    return undefined
  }
  if (waku) {
    const messages = await waku.store.queryHistory({ contentTopics: [topic] })
    if (messages) {
      return messages.filter(verifyWakuFeatureMsg).map((msg) => {
        const data = proto.WakuFeature.decode(msg.payload)
        data.sntAmount = BigNumber.from(data.sntAmount)
        return { ...data, timestamp: new Date(data.timestamp) }
      })
    }
  }
  return []
}

export function verifyWakuFeatureMsg(msg: WakuMessage) {
  if (!proto) {
    return false
  }
  const wakuTimestamp = msg.timestamp
  const data = proto.WakuFeature.decode(msg.payload)
  data.sntAmount = BigNumber.from(data.sntAmount)
  const timestamp = new Date(data.timestamp)
  const types = ['address', 'uint256', 'address', 'uint256']
  const message = [data.voter, data.sntAmount, data.publicKey, BigNumber.from(timestamp.getTime())]

  const verifiedAddress = utils.verifyMessage(packAndArrayify(types, message), data.sign)

  if (wakuTimestamp?.getTime() != timestamp.getTime() || verifiedAddress != data.voter) {
    return false
  }
  return true
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
  if (!proto) {
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

    const msg = WakuMessage.fromUtf8String(payload, {
      contentTopic,
      timestamp,
    })
    return msg
  }
  return undefined
}

export async function createWakuMessage(
  account: string | null | undefined,
  signer: JsonRpcSigner | undefined,
  room: number,
  voteAmount: number,
  type: number,
  topic: string
) {
  if (!account || !signer) {
    return undefined
  }
  if (!proto) {
    return undefined
  }
  const signerAddress = await signer?.getAddress()
  if (signerAddress != account) {
    return undefined
  }

  const types = ['address', 'uint256', 'uint256']
  const message = getContractParameters(account, room, type, voteAmount)
  const signature = await signer.signMessage(packAndArrayify(types, message))
  if (signature) {
    const payload = proto.WakuVote.encode({
      address: account,
      vote: type == 1 ? 'yes' : 'no',
      sntAmount: utils.arrayify(BigNumber.from(voteAmount)),
      sign: signature,
      nonce: 1,
      sessionID: room,
    })

    const msg = WakuMessage.fromBytes(payload, { contentTopic: topic + room.toString() })
    return msg
  }
  return undefined
}

export default { create: createWakuMessage, receive: receiveWakuMessages, filterVerified: filterVerifiedMessages }
