import { Protocols } from 'js-waku'
import { createLightNode } from 'js-waku/lib/create_waku'
import { PeerDiscoveryStaticPeers } from 'js-waku/lib/peer_discovery_static_list'
import { Fleet, getPredefinedBootstrapNodes } from 'js-waku/lib/predefined_bootstrap_nodes'
import { waitForRemotePeer } from 'js-waku/lib/wait_for_remote_peer'

import type { WakuLight } from 'js-waku/lib/interfaces'

export async function connectWaku(setWaku: (waku: WakuLight) => void, fleet: Fleet) {
  // todo: handle disconnects
  const newWaku = await createLightNode({
    defaultBootstrap: false,
    // todo: delete option
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    emitSelf: true,
    libp2p: {
      peerDiscovery: [new PeerDiscoveryStaticPeers(getPredefinedBootstrapNodes(fleet), { maxPeers: 1 })],
    },
  })
  await newWaku.start()
  // todo: handle fail
  await waitForRemotePeer(newWaku, [Protocols.Store, Protocols.LightPush], 10 * 1000)

  setWaku(newWaku)
}
