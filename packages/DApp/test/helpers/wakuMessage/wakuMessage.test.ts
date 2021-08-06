import { expect } from 'chai'
import wakuMessage, {
  decodeWakuVotes,
  decodeWakuFeatures,
  createWakuFeatureMsg,
} from '../../../src/helpers/wakuMessage'
import { MockProvider } from 'ethereum-waffle'
import { JsonRpcSigner } from '@ethersproject/providers'
import proto from '../../../src/helpers/loadProtons'
import { BigNumber, utils } from 'ethers'
import { WakuMessage } from 'js-waku'
import protons from 'protons'

const proto2 = protons(`
message WakuVote {
  string address = 1;
}
`) as any

describe('wakuMessage', () => {
  const [alice, bob] = new MockProvider().getWallets()

  describe('decode waku vote', () => {
    it('success', async () => {
      const payload = proto.WakuVote.encode({
        address: '0x0',
        nonce: 1,
        sessionID: 2,
        sign: '0x1234',
        sntAmount: utils.arrayify(BigNumber.from(123)),
        vote: 'For',
      })
      const msg = await WakuMessage.fromBytes(payload)

      const payload2 = proto.WakuVote.encode({
        address: '0x01',
        nonce: 1,
        sessionID: 2,
        sign: '0xabc1234',
        sntAmount: utils.arrayify(BigNumber.from(321)),
        vote: 'Against',
      })
      const msg2 = await WakuMessage.fromBytes(payload2)

      const [data, data2] = decodeWakuVotes([msg, msg2]) ?? []

      expect(data).to.not.be.undefined
      expect(data?.address).to.eq('0x0')
      expect(data?.nonce).to.eq(1)
      expect(data?.sessionID).to.eq(2)
      expect(data?.sign).to.eq('0x1234')
      expect(data?.sntAmount).to.deep.eq(BigNumber.from(123))
      expect(data?.vote).to.eq('For')

      expect(data2).to.not.be.undefined
      expect(data2?.address).to.eq('0x01')
      expect(data2?.nonce).to.eq(1)
      expect(data2?.sessionID).to.eq(2)
      expect(data2?.sign).to.eq('0xabc1234')
      expect(data2?.sntAmount).to.deep.eq(BigNumber.from(321))
      expect(data2?.vote).to.eq('Against')
    })

    it('empty', async () => {
      expect(decodeWakuVotes([])).to.deep.eq([])
    })

    it('wrong data', async () => {
      const payload = proto2.WakuVote.encode({
        address: '0x0',
      })
      const msg = await WakuMessage.fromBytes(payload)

      const payload2 = proto.WakuVote.encode({
        address: '0x01',
        nonce: 1,
        sessionID: 2,
        sign: '0xabc1234',
        sntAmount: utils.arrayify(BigNumber.from(321)),
        vote: 'Against',
      })
      const msg2 = await WakuMessage.fromBytes(payload2)

      const response = decodeWakuVotes([msg, msg2]) ?? []

      expect(response.length).to.eq(1)
      const data = response[0]
      expect(data).to.not.be.undefined
      expect(data?.address).to.eq('0x01')
      expect(data?.nonce).to.eq(1)
      expect(data?.sessionID).to.eq(2)
      expect(data?.sign).to.eq('0xabc1234')
      expect(data?.sntAmount).to.deep.eq(BigNumber.from(321))
      expect(data?.vote).to.eq('Against')
    })
  })

  describe('decode waku feature', () => {
    it('success', async () => {
      const payload = proto2.WakuVote.encode({
        address: '0x0',
      })
      const msg = await WakuMessage.fromBytes(payload)
      const msg2 = await createWakuFeatureMsg(
        alice.address,
        alice as unknown as JsonRpcSigner,
        BigNumber.from(123),
        bob.address,
        '/test/'
      )

      expect(msg2).to.not.be.undefined
      if (msg2) {
        const response = decodeWakuFeatures([msg, msg2]) ?? []

        expect(response.length).to.eq(1)
        const data = response[0]
        expect(data).to.not.be.undefined
        expect(data?.voter).to.eq(alice.address)
        expect(data?.publicKey).to.eq(bob.address)
        expect(data?.sntAmount).to.deep.eq(BigNumber.from(123))
      }
    })

    it('empty', async () => {
      expect(decodeWakuFeatures([])).to.deep.eq([])
    })
  })

  describe('create', () => {
    it('success', async () => {
      const msg = await wakuMessage.create(alice.address, alice as unknown as JsonRpcSigner, 1, 100, 1, '/test/')

      expect(msg?.payload).to.not.be.undefined
      if (msg?.payload) {
        const obj = proto.WakuVote.decode(msg?.payload)
        expect(obj.address).to.eq(alice.address)
        expect(obj.vote).to.eq('yes')
        expect(BigNumber.from(obj.sntAmount)._hex).to.eq('0x64')
        expect(obj.nonce).to.eq(1)
        expect(obj.sessionID).to.eq(1)
      }
    })

    it('different payload', async () => {
      const msg = await wakuMessage.create(alice.address, alice as unknown as JsonRpcSigner, 2, 1000, 0, '/test/')

      expect(msg?.payload).to.not.be.undefined
      if (msg?.payload) {
        const obj = proto.WakuVote.decode(msg?.payload)
        expect(obj.address).to.eq(alice.address)
        expect(obj.vote).to.eq('no')
        expect(BigNumber.from(obj.sntAmount)._hex).to.eq('0x03e8')
        expect(obj.nonce).to.eq(1)
        expect(obj.sessionID).to.eq(2)
      }
    })

    it('no address', async () => {
      const msg = await wakuMessage.create(undefined, alice as unknown as JsonRpcSigner, 1, 100, 1, '/test/')
      expect(msg?.payloadAsUtf8).to.be.undefined
    })

    it('no signer', async () => {
      const msg = await wakuMessage.create(alice.address, undefined, 1, 100, 1, '/test/')
      expect(msg?.payloadAsUtf8).to.be.undefined
    })

    it('different signer', async () => {
      const msg = await wakuMessage.create(alice.address, bob as unknown as JsonRpcSigner, 1, 100, 1, '/test/')
      expect(msg?.payloadAsUtf8).to.be.undefined
    })
  })
})
