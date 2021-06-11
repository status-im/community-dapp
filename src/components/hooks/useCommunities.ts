import { useState, useEffect } from 'react'
import { CommunityDetail } from '../../models/community'

type APIFunction = (
  numberPerPage: number,
  pageNumber: number,
  sortedBy?: number,
  filterKeyword?: string
) => { page: number; communities: CommunityDetail[] }

export function useCommunities(API: APIFunction, searchField?: string, sortingType?: number) {
  const [communities, setCommunities] = useState<CommunityDetail[]>([])
  const [page, setPage] = useState(0)
  const [increment, setIncrement] = useState(true)

  const handleScroll = (e: Event) => {
    if (e.target) {
      const scrollingElement = (e.target as HTMLDocument).scrollingElement
      if (!scrollingElement?.scrollHeight || !scrollingElement?.scrollHeight || !scrollingElement?.scrollHeight) {
        return
      }
      if (scrollingElement.scrollHeight - scrollingElement.scrollTop <= scrollingElement.clientHeight + 10) {
        if (increment) {
          setPage((prevPage) => prevPage + 1)
        }
      }
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [page])

  useEffect(() => {
    setPage(0)
    setIncrement(true)
    setCommunities(API(2, 0, sortingType, searchField).communities)
  }, [searchField, sortingType])

  useEffect(() => {
    if (page === 0) return
    const newCommunities = API(2, page, sortingType, searchField).communities
    if (newCommunities.length === 0) {
      setIncrement(false)
    }
    setCommunities((oldCommunities) => [...oldCommunities, ...newCommunities])
  }, [page])

  return communities
}
