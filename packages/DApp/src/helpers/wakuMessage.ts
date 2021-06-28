import { JsonRpcSigner } from '@ethersproject/providers'
import { BigNumber } from 'ethers'
import { packAndArrayify } from './ethMessage'
import { Waku, WakuMessage } from 'js-waku'
import { recoverAddress } from './ethMessage'
import { utils } from 'ethers'

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
  const messages = await waku.store.queryHistory({
    peerId: waku.libp2p.peerStore.peers.entries().next().value[1].id,
    contentTopics: [topic + room.toString()],
  })
  return messages?.map((msg) => JSON.parse(msg.payloadAsUtf8))
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

  const signerAddress = await signer?.getAddress()
  if (signerAddress != account) {
    return undefined
  }

  const types = ['address', 'uint256', 'uint256']
  const message = getContractParameters(account, room, type, voteAmount)
  const signature = await signer.signMessage(packAndArrayify(types, message))
  if (signature) {
    const msg = WakuMessage.fromUtf8String(
      JSON.stringify({
        address: account,
        vote: type == 1 ? 'yes' : 'no',
        sntAmount: BigNumber.from(voteAmount),
        sign: signature,
        nonce: 1,
        sessionID: room,
      }),
      topic + room.toString()
    )
    return msg
  }
  return undefined
}

export default { create: createWakuMessage, receive: receiveWakuMessages, filterVerified: filterVerifiedMessages }
