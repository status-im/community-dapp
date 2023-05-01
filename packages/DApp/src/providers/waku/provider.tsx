import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react'
// import { Protocols } from 'js-waku'
// import { createLightNode } from 'js-waku/lib/create_waku'
// import { PeerDiscoveryStaticPeers } from 'js-waku/lib/peer_discovery_static_list'
// import { waitForRemotePeer } from 'js-waku/lib/wait_for_remote_peer'
// import type { WakuLight } from 'js-waku/lib/interfaces'
// import { peers } from '../../constants/peers'
import { RequestClient, createRequestClient } from '@status-im/js'

const WakuContext = createContext<RequestClient | undefined>(undefined)

interface Props {
  children: ReactNode
}

export function WakuProvider({ children }: Props) {
  const [client, setClient] = useState<RequestClient>()

  useEffect(() => {
    const start = async () => {
      const client = await createRequestClient({
        environment: 'production',
      })

      setClient(client)
    }

    start()
  }, [])

  // useEffect(() => {
  //   const start = async () => {
  //     const waku = await createLightNode({
  //       defaultBootstrap: false,
  //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //       // @ts-ignore
  //       emitSelf: true,
  //       pingKeepAlive: 0,
  //       relayKeepAlive: 0,
  //       libp2p: {
  //         peerDiscovery: [new PeerDiscoveryStaticPeers(peers.test, { maxPeers: 1 })],
  //       },
  //     })
  //     await waku.start()
  //     await waitForRemotePeer(waku, [Protocols.Store], 10 * 1000)

  //     const requestClient = new RequestClient(waku, true)

  //     const deserializedPublicKey = deserializePublicKey(
  //       '0x0269e4e75683762fc5d8af53ee1d1656767b780519a5bd1ecb4bd34d482b100fd7'
  //     )
  //     const detail = await requestClient.fetchCommunityDescription(deserializedPublicKey)
  //     console.log('fetchCommunity > detail:', waku, detail)
  //     setClient(waku)
  //   }

  //   start()
  // }, [])

  return <WakuContext.Provider value={client}>{children}</WakuContext.Provider>
}

export function useWaku() {
  const client = useContext(WakuContext)
  return { client, waku: client?.waku }
}
