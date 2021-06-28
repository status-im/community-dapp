import { expect } from 'chai'
import wakuMessage from '../../../src/helpers/wakuMessage'
import { MockProvider } from 'ethereum-waffle'
import { JsonRpcSigner } from '@ethersproject/providers'

describe('wakuMessage', () => {
  describe('create', () => {
    const [alice, bob] = new MockProvider().getWallets()
    it('success', async () => {
      const msg = await wakuMessage.create(alice.address, alice as unknown as JsonRpcSigner, 1, 100, 1, '/test/')

      expect(msg?.payloadAsUtf8).to.not.be.undefined
      if (msg?.payloadAsUtf8) {
        const obj = JSON.parse(msg?.payloadAsUtf8)
        expect(obj.address).to.eq(alice.address)
        expect(obj.vote).to.eq('yes')
        expect(obj.sntAmount.hex).to.eq('0x64')
        expect(obj.nonce).to.eq(1)
        expect(obj.sessionID).to.eq(1)
      }
    })

    it('different payload', async () => {
      const msg = await wakuMessage.create(alice.address, alice as unknown as JsonRpcSigner, 2, 1000, 0, '/test/')

      expect(msg?.payloadAsUtf8).to.not.be.undefined
      if (msg?.payloadAsUtf8) {
        const obj = JSON.parse(msg?.payloadAsUtf8)
        expect(obj.address).to.eq(alice.address)
        expect(obj.vote).to.eq('no')
        expect(obj.sntAmount.hex).to.eq('0x03e8')
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
