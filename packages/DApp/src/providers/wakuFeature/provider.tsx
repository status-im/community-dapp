import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { receiveWakuFeature } from '../../helpers/receiveWakuFeature'
import { useConfig } from '../config'
import { useWaku } from '../waku/provider'

const WakuFeatureContext = createContext<{
  featureVotes: any
  featured: any[]
}>({
  featureVotes: {},
  featured: [],
})

export function useWakuFeature() {
  return useContext(WakuFeatureContext)
}

interface WakuFeatureProviderProps {
  children: ReactNode
}

export function WakuFeatureProvider({ children }: WakuFeatureProviderProps) {
  const [featureVotes, setFeatureVotes] = useState<any>({})
  const [featured, setFeatured] = useState<any[]>([])
  const { waku } = useWaku()
  const { config } = useConfig()

  useEffect(() => {
    const get = async () => {
      const { wakuFeatured, top5 } = await receiveWakuFeature(waku, config.wakuFeatureTopic)
      setFeatureVotes(wakuFeatured)
      setFeatured(top5)
    }
    get()
    const task = setInterval(get, 10000)
    return () => clearInterval(task)
  }, [waku?.libp2p?.peerId?.toString()])
  return <WakuFeatureContext.Provider value={{ featureVotes, featured }} children={children} />
}
