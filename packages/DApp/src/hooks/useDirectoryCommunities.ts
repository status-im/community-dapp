import { useContractCall } from '@usedapp/core'
import { useEffect, useState } from 'react'
import { getCommunityDetails } from '../helpers/apiMock'
import { isTextInDetails, sortDirectoryFunction } from '../helpers/communityFiltering'
import { CommunityDetail, DirectorySortingEnum } from '../models/community'
import { useContracts } from './useContracts'

export function useDirectoryCommunities(filterKeyword: string, sortedBy: DirectorySortingEnum) {
  const { directoryContract } = useContracts()
  const [communities] = useContractCall({
    abi: directoryContract.interface,
    address: directoryContract.address,
    method: 'getCommunities',
    args: [],
  }) ?? [[]]

  const [unfilteredComm, setUnfilteredComm] = useState(communities)
  const [filteredCommunities, setFilteredCommunities] = useState<CommunityDetail[]>([])

  useEffect(() => {
    const getDetails = async () => {
      if (communities.length > 0) {
        const detailedComm = await Promise.all(communities.map(async (key: string) => await getCommunityDetails(key)))
        setUnfilteredComm(detailedComm)
      }
    }
    getDetails()
  }, [JSON.stringify(communities)])

  useEffect(() => {
    const filterCommunities = unfilteredComm.filter((comm: CommunityDetail) => {
      if (comm) {
        return isTextInDetails(filterKeyword, comm)
      }
      return false
    })
    setFilteredCommunities(filterCommunities.sort(sortDirectoryFunction(sortedBy)))
  }, [unfilteredComm, sortedBy, filterKeyword])

  return filteredCommunities
}
