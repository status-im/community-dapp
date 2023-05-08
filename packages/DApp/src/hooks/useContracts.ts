import { useEthers } from '@usedapp/core'
import { contracts } from '../constants/contracts'
import { Contract } from 'ethers'
import { Interface } from '@ethersproject/abi'
import { VotingContract, Directory, FeaturedVotingContract } from '@status-community-dapp/contracts/abi'
import { useEffect, useState } from 'react'

export function useContracts() {
  const { chainId } = useEthers()

  const [votingContract, setVotingContract] = useState(
    new Contract('0x0000000000000000000000000000000000000000', new Interface(VotingContract.abi))
  )

  const [directoryContract, setDirectoryContract] = useState(
    new Contract('0x0000000000000000000000000000000000000000', new Interface(Directory.abi))
  )

  const [featuredVotingContract, setFeaturedVotingContract] = useState(
    new Contract('0x0000000000000000000000000000000000000000', new Interface(FeaturedVotingContract.abi))
  )

  useEffect(() => {
    if (chainId) {
      // @ts-expect-error Ethers does not type chainId
      const chainConfig = contracts[chainId]
      if (chainConfig) {
        setVotingContract(new Contract(chainConfig.votingContract, new Interface(VotingContract.abi)))
        setDirectoryContract(new Contract(chainConfig.directoryContract, new Interface(Directory.abi)))
        setFeaturedVotingContract(
          new Contract(chainConfig.featuredVotingContract, new Interface(FeaturedVotingContract.abi))
        )
      }
    }
  }, [chainId])

  return { votingContract, directoryContract, featuredVotingContract }
}
