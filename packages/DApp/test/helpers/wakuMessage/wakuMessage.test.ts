import { expect } from 'chai'
import wakuMessage, { decodeWakuVotes } from '../../../src/helpers/wakuVote'
import { decodeWakuFeatures } from '../../../src/helpers/wakuFeature'
import { MockProvider } from 'ethereum-waffle'
import { JsonRpcSigner } from '@ethersproject/providers'
import proto from '../../../src/helpers/loadProtons'
import { BigNumber, utils } from 'ethers'
import protons from 'protons'
import { EncoderV0 } from 'js-waku/lib/waku_message/version_0'

const proto2 = protons(`
message WakuVote {
  string address = 1;
}
`) as any

describe('wakuMessage', () => {
  const [alice, bob] = new MockProvider().getWallets()

  describe('decode waku vote', () => {
    it('success', async () => {
      const encoder = new EncoderV0('/test2/')

      const payload = proto.WakuVote.encode({
        address: '0x0',
        timestamp: 1,
        roomID: 2,
        sign: '0x1234',
        sntAmount: utils.arrayify(BigNumber.from(123)),
        vote: 'For',
      })
      const msg = await encoder.toProtoObj({ payload })

      const payload2 = proto.WakuVote.encode({
        address: '0x01',
        timestamp: 1,
        roomID: 2,
        sign: '0xabc1234',
        sntAmount: utils.arrayify(BigNumber.from(321)),
        vote: 'Against',
      })
      const msg2 = await encoder.toProtoObj({ payload: payload2 })

      const [data, data2] = decodeWakuVotes([msg, msg2]) ?? []

      expect(data).to.not.be.undefined
      expect(data?.address).to.eq('0x0')
      expect(data?.timestamp).to.eq(1)
      expect(data?.roomID).to.eq(2)
      expect(data?.sign).to.eq('0x1234')
      expect(data?.sntAmount).to.deep.eq(BigNumber.from(123))
      expect(data?.vote).to.eq('For')

      expect(data2).to.not.be.undefined
      expect(data2?.address).to.eq('0x01')
      expect(data2?.timestamp).to.eq(1)
      expect(data2?.roomID).to.eq(2)
      expect(data2?.sign).to.eq('0xabc1234')
      expect(data2?.sntAmount).to.deep.eq(BigNumber.from(321))
      expect(data2?.vote).to.eq('Against')
    })
  })

  it('empty', async () => {
    expect(decodeWakuVotes([])).to.deep.eq([])
  })

  it('wrong data', async () => {
    const encoder = new EncoderV0('/test/')

    const payload = proto2.WakuVote.encode({
      address: '0x0',
    })
    const msg = await encoder.toProtoObj({ payload })

    const payload2 = proto.WakuVote.encode({
      address: '0x01',
      timestamp: 1,
      roomID: 2,
      sign: '0xabc1234',
      sntAmount: utils.arrayify(BigNumber.from(321)),
      vote: 'Against',
    })
    const msg2 = await encoder.toProtoObj({ payload: payload2 })

    const response = decodeWakuVotes([msg, msg2]) ?? []

    expect(response.length).to.eq(1)
    const data = response[0]
    expect(data).to.not.be.undefined
    expect(data?.address).to.eq('0x01')
    expect(data?.timestamp).to.eq(1)
    expect(data?.roomID).to.eq(2)
    expect(data?.sign).to.eq('0xabc1234')
    expect(data?.sntAmount).to.deep.eq(BigNumber.from(321))
    expect(data?.vote).to.eq('Against')
  })

  describe('decode waku feature', () => {
    it('success', async () => {
      const encoder = new EncoderV0('/test/')

      const payload = proto2.Waku.encode({
        address: '0x0',
      })
      const msg = await encoder.toProtoObj({ payload: payload })
      const payload2 = proto2.Waku.encode({
        voter: '0x17ec8597ff92C3F44523bDc65BF0f1bE632917ff',
        signer: alice as unknown as JsonRpcSigner,
        sntAmount: BigNumber.from('0x10'),
        publicKey: '0x1234',
      })
      const msg2 = await encoder.toProtoObj({ payload: payload2 })

      expect(msg2).to.not.be.undefined
      if (msg2) {
        const response = decodeWakuFeatures([msg, msg2]) ?? []

        expect(response.length).to.eq(1)
        const data = response[0]
        expect(data).to.not.be.undefined
        expect(data?.voter).to.eq('0x17ec8597ff92C3F44523bDc65BF0f1bE632917ff')
        expect(data?.publicKey).to.eq('0x1234')
        expect(data?.sntAmount).to.deep.eq(BigNumber.from('0x10'))
      }
    })

    it('empty', async () => {
      expect(decodeWakuFeatures([])).to.deep.eq([])
    })
  })

  describe('create', () => {
    it('success', async () => {
      const encoder = new EncoderV0('/test/')
      const payload = await wakuMessage.create(
        alice.address,
        alice as unknown as JsonRpcSigner,
        1,
        100,
        1,
        1,
        () => [],
        '0x01'
      )
      const msg = await encoder.toProtoObj({ payload })

      expect(msg?.payload).to.not.be.undefined
      if (msg?.payload) {
        const obj = proto.WakuVote.decode(msg?.payload)
        expect(obj.address).to.eq(alice.address)
        expect(obj.vote).to.eq('yes')
        expect(BigNumber.from(obj.sntAmount)._hex).to.eq('0x64')
        expect(obj.timestamp).to.eq(1)
        expect(obj.roomID).to.eq(1)
      }
    })

    it('different payload', async () => {
      const encoder = new EncoderV0('/test/')
      const payload = await wakuMessage.create(
        alice.address,
        alice as unknown as JsonRpcSigner,
        2,
        1000,
        0,
        1,
        () => [],
        '0x01'
      )
      const msg = await encoder.toProtoObj({ payload })

      expect(msg?.payload).to.not.be.undefined
      if (msg?.payload) {
        const obj = proto.WakuVote.decode(msg?.payload)
        expect(obj.address).to.eq(alice.address)
        expect(obj.vote).to.eq('no')
        expect(BigNumber.from(obj.sntAmount)._hex).to.eq('0x03e8')
        expect(obj.timestamp).to.eq(1)
        expect(obj.roomID).to.eq(2)
      }
    })

    it('no address', async () => {
      const encoder = new EncoderV0('/test/')
      const payload = await wakuMessage.create(undefined, alice as unknown as JsonRpcSigner, 1, 100, 1, 1, () => [])
      const msg = await encoder.toProtoObj({ payload })
      expect(msg?.payload).to.be.undefined
    })

    it('no signer', async () => {
      const encoder = new EncoderV0('/test/')
      const payload = await wakuMessage.create(alice.address, undefined, 1, 100, 1, 1, () => [])
      const msg = await encoder.toProtoObj({ payload })
      expect(msg?.payload).to.be.undefined
    })

    it('different signer', async () => {
      const encoder = new EncoderV0('/test/')
      const payload = await wakuMessage.create(alice.address, bob as unknown as JsonRpcSigner, 1, 100, 1, 1, () => [])
      const msg = await encoder.toProtoObj({ payload })
      expect(msg?.payload).to.be.undefined
    })
  })
})
