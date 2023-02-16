import React, { ReactNode, createContext, useContext, useState } from 'react'
import { connectWaku } from './connect'

import type { WakuLight } from 'js-waku/lib/interfaces'
import { useConfig } from '../config';

const WakuContext = createContext<{ waku: WakuLight | undefined; setWaku: (waku: WakuLight) => void }>({
  waku: undefined,
  setWaku: (waku: WakuLight) => waku,
})

export function useWaku() {
  const { setWaku, waku } = useContext(WakuContext)
  const [creatingWaku, setCreatingWaku] = useState(false)
  const { config } = useConfig()
  if (!waku && !creatingWaku) {
    setCreatingWaku(true)
    connectWaku(setWaku, config.fleet)
  }
  return { waku }
}

interface WakuProviderProps {
  children: ReactNode
}

export function WakuProvider({ children }: WakuProviderProps) {
  const [waku, setWaku] = useState<WakuLight | undefined>(undefined)

  return <WakuContext.Provider value={{ waku, setWaku }} children={children} />
}
