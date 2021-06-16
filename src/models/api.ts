import { CommunityDetail } from './community'

export type APIOptions = {
  numberPerPage: number
  types?: {
    Add: boolean
    Remove: boolean
  }
  sortedBy?: number
  filterKeyword?: string
}

export type APIFunction = (
  pageNumber: number,
  options: APIOptions
) => Promise<{ page: number; communities: CommunityDetail[] }>
