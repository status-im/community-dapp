import { useEthers } from '@usedapp/core'
import { useCallback } from 'react'
import { useContracts } from './useContracts'
import { BigNumber } from 'ethers'
import { TypedFeature } from '../models/TypedData'

export function useTypedFeatureVote() {
  const { chainId } = useEthers()
  const { featuredVotingContract } = useContracts()

  const getTypedFeatureVote = useCallback(
    (data: [string, string, BigNumber, BigNumber]) => {
      return {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Feature: [
            { name: 'voter', type: 'address' },
            { name: 'sntAmount', type: 'uint256' },
            { name: 'community', type: 'bytes' },
            { name: 'timestamp', type: 'uint256' },
          ],
        },
        primaryType: 'Feature',
        domain: {
          name: 'Featured Voting Contract',
          version: '1',
          chainId: chainId,
          verifyingContract: featuredVotingContract.address,
        },
        message: {
          voter: data[0],
          sntAmount: data[2].toHexString(),
          community: data[1],
          timestamp: data[3].toHexString(),
        },
      } as TypedFeature
    },
    [chainId, featuredVotingContract.address]
  )

  return { getTypedFeatureVote }
}
