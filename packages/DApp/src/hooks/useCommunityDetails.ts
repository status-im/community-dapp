import { useEffect, useRef, useState } from 'react'
import { getCommunityDetails } from '../helpers/apiMock'
import { CommunityDetail } from '../models/community'

export function useCommunityDetails(publicKey: string, setCommunityDetail: (val: CommunityDetail | undefined) => void) {
  const [loading, setLoading] = useState(false)
  const loadingIdx = useRef(0)

  useEffect(() => {
    const getDetails = async (key: string) => {
      const idx = ++loadingIdx.current
      setLoading(true)
      setCommunityDetail(await getCommunityDetails(key))
      if (idx === loadingIdx.current) {
        setLoading(false)
      }
    }
    setCommunityDetail(undefined)
    getDetails(publicKey)
  }, [publicKey])

  useEffect(() => setCommunityDetail(undefined), [])

  return loading
}
