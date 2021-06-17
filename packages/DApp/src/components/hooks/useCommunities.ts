import { useState, useEffect } from 'react'
import { CommunityDetail } from '../../models/community'
import { APIOptions, APIFunction } from './../../models/api'

export function useCommunities(API: APIFunction, options: APIOptions) {
  const [communities, setCommunities] = useState<CommunityDetail[]>([])
  const [page, setPage] = useState(0)
  const [increment, setIncrement] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleScroll = (e: Event) => {
    if (e.target) {
      const scrollingElement = (e.target as HTMLDocument).scrollingElement
      if (!scrollingElement?.scrollHeight || !scrollingElement?.scrollTop || !scrollingElement?.clientHeight) {
        return
      }
      if (scrollingElement.scrollHeight - scrollingElement.scrollTop <= scrollingElement.clientHeight + 60) {
        setPage((prevPage) => prevPage + 1)
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }

  useEffect(() => {
    if (increment) {
      if (document.scrollingElement?.clientHeight || document.scrollingElement?.scrollHeight) {
        if (document.scrollingElement?.clientHeight >= document.scrollingElement?.scrollHeight) {
          setPage((prevPage) => prevPage + 1)
        } else {
          window.addEventListener('scroll', handleScroll)
        }
      }
    }
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [increment])

  useEffect(() => {
    const getCommunities = async () => {
      setLoading(true)
      const communities = (await API(0, options)).communities
      setCommunities(communities)
      setLoading(false)
      setIncrement(true)
    }

    setCommunities([])
    setPage(0)
    setIncrement(false)
    getCommunities()
  }, [options.filterKeyword, options.sortedBy, options.voteType])

  useEffect(() => {
    const updateCommunities = async () => {
      setLoading(true)
      const newCommunities = (await API(page, options)).communities
      setCommunities((oldCommunities) => [...oldCommunities, ...newCommunities])
      if (newCommunities.length === options.numberPerPage) {
        setIncrement(true)
      }
      setLoading(false)
    }

    if (page === 0) return

    setIncrement(false)
    updateCommunities()
  }, [page])

  return { communities, loading }
}
