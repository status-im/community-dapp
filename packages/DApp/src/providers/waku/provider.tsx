// note: pull on restart/reconnect
// note: !waku and waku && conditions to use isConnected when implementing detection of dicsonnections

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { Protocols } from 'js-waku'
import { createLightNode } from 'js-waku/lib/create_waku'
import { PeerDiscoveryStaticPeers } from 'js-waku/lib/peer_discovery_static_list'
import { waitForRemotePeer } from 'js-waku/lib/wait_for_remote_peer'
import type { WakuLight } from 'js-waku/lib/interfaces'

type Context = {
  waku: WakuLight | undefined
  isLoading: boolean
  isConnected: boolean
  isError: boolean
  restart: () => Promise<void>
}

const WakuContext = createContext<Context | null>(null)

type Props = {
  peers: string[]
  children: ReactNode
}

export function WakuProvider({ peers, children }: Props) {
  const [waku, setWaku] = useState<WakuLight>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

  const start = async () => {
    try {
      setIsLoading(true)

      const waku = await createLightNode({
        defaultBootstrap: false,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        emitSelf: true,
        libp2p: {
          peerDiscovery: [new PeerDiscoveryStaticPeers(peers, { maxPeers: 1 })],
        },
      })

      await waku.start()
      await waitForRemotePeer(waku, [Protocols.Store, Protocols.LightPush], 15 * 1000)

      setWaku(waku)
      setIsLoading(false)
      setIsConnected(true)
    } catch (error) {
      setIsError(true)
      setIsLoading(false)
    }
  }

  const restart = async () => {
    if (isLoading) {
      throw new Error('Cannot restart while loading')
    }

    await waku?.stop()
    await start()
  }

  const stop = async () => {
    if (!waku) {
      return
    }

    await waku.stop()

    setIsConnected(false)
  }

  useEffect(() => {
    start()

    return () => {
      stop()
    }
  }, [])

  return (
    <WakuContext.Provider value={{ waku, isLoading, isConnected, isError, restart }}>{children}</WakuContext.Provider>
  )
}

export function useWaku() {
  const context = useContext(WakuContext)

  if (!context) {
    throw new Error('useWaku must be used within a WakuProvider')
  }

  return context
}
