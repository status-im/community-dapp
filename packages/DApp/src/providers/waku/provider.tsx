import React, { ReactNode, createContext, useContext, useState } from 'react'
import { Waku } from 'js-waku'
import { connectWaku } from './connect'

const WakuContext = createContext<{ waku: Waku | undefined; setWaku: (waku: Waku) => void }>({
  waku: undefined,
  setWaku: (waku: Waku) => waku,
})

export function useWaku() {
  const { setWaku, waku } = useContext(WakuContext)
  const [creatingWaku, setCreatingWaku] = useState(false)
  if (!waku && !creatingWaku) {
    setCreatingWaku(true)
    connectWaku(setWaku)
  }
  return { waku }
}

interface WakuProviderProps {
  children: ReactNode
}

export function WakuProvider({ children }: WakuProviderProps) {
  const [waku, setWaku] = useState<Waku | undefined>(undefined)

  return <WakuContext.Provider value={{ waku, setWaku }} children={children} />
}
