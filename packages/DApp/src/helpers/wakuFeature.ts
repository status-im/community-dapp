import { Waku, WakuMessage } from 'js-waku'
import { WakuFeatureData } from '../models/waku'
import { recoverAddress } from './ethMessage'
import { utils, BigNumber } from 'ethers'
import { JsonRpcSigner } from '@ethersproject/providers'
import proto from './loadProtons'
import { TypedFeature } from '../models/TypedData'

function createTypedData(chainId: number, voter: string, sntAmount: BigNumber, publicKey: string, timestamp: Date) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
      ],
      Feature: [
        { name: 'voter', type: 'address' },
        { name: 'sntAmount', type: 'uint256' },
        { name: 'publicKey', type: 'bytes' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'chainId', type: 'uint64' },
      ],
    },
    primaryType: 'Feature',
    domain: {
      name: 'Featuring vote',
      version: '1',
      chainId: chainId,
    },
    message: {
      voter: voter,
      sntAmount: sntAmount.toHexString(),
      publicKey: publicKey,
      timestamp: timestamp.getTime(),
    },
  } as TypedFeature
}

function verifyWakuFeatureMsg(data: WakuFeatureData | undefined, chainId: number): data is WakuFeatureData {
  if (!data) {
    return false
  }
  const typedData = createTypedData(chainId, data.voter, data.sntAmount, data.publicKey, data.timestamp)
  try {
    const verifiedAddress = utils.getAddress(recoverAddress(typedData, data.sign))
    if (data.msgTimestamp?.getTime() != data.timestamp.getTime() || verifiedAddress != data.voter) {
      return false
    }
    return true
  } catch {
    return false
  }
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

export function decodeWakuFeatures(messages: WakuMessage[] | null, chainId: number) {
  return messages?.map(decodeWakuFeature).filter((e): e is WakuFeatureData => verifyWakuFeatureMsg(e, chainId))
}

export async function receiveWakuFeatureMsg(waku: Waku | undefined, topic: string, chainId: number) {
  if (waku) {
    const messages = await waku.store.queryHistory({ contentTopics: [topic] })
    return decodeWakuFeatures(messages, chainId)
  }
}

export async function createWakuFeatureMsg(
  account: string | null | undefined,
  signer: JsonRpcSigner | undefined,
  sntAmount: BigNumber,
  publicKey: string,
  contentTopic: string,
  chainId: number,
  sig?: string,
  time?: Date
) {
  if (!account || !signer) {
    return undefined
  }
  const provider = signer.provider
  const signerAddress = await signer?.getAddress()
  if (signerAddress != account) {
    return undefined
  }
  const timestamp = time ? time : new Date()
  const data = createTypedData(chainId, account, sntAmount, publicKey, timestamp)
  const signature = sig ? sig : await provider?.send('eth_signTypedData_v3', [account, JSON.stringify(data)])

  if (signature) {
    const payload = proto.WakuFeature.encode({
      voter: account,
      sntAmount: utils.arrayify(sntAmount),
      publicKey,
      timestamp,
      sign: signature,
    })

    const msg = WakuMessage.fromBytes(payload, {
      contentTopic,
      timestamp,
    })
    return msg
  }
  return undefined
}
