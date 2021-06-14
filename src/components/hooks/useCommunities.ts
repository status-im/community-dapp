import { useState, useEffect } from 'react'
import { CommunityDetail } from '../../models/community'

type APIOptions = {
  numberPerPage: number
  sortedBy?: number
  filterKeyword?: string
}

type APIFunction = (
  numberPerPage: number,
  pageNumber: number,
  sortedBy?: number,
  filterKeyword?: string
) => Promise<{ page: number; communities: CommunityDetail[] }>

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
      if (scrollingElement.scrollHeight - scrollingElement.scrollTop <= scrollingElement.clientHeight + 10) {
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
      const communities = (await API(options.numberPerPage, 0, options.sortedBy, options.filterKeyword)).communities
      setCommunities(communities)
      setLoading(false)
      setIncrement(true)
    }

    setCommunities([])
    setPage(0)
    setIncrement(false)
    getCommunities()
  }, [options.filterKeyword, options.sortedBy])

  useEffect(() => {
    const updateCommunities = async () => {
      setLoading(true)
      const newCommunities = (await API(options.numberPerPage, page, options.sortedBy, options.filterKeyword))
        .communities
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
