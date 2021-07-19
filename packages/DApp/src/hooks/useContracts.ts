import { useEthers } from '@usedapp/core'
import { useConfig } from '../providers/config'
import { Contract } from '@usedapp/core/node_modules/ethers'
import { Interface } from '@ethersproject/abi'
import { VotingContract, Directory } from '@status-community-dapp/contracts/abi'

export function useContracts() {
  const { config } = useConfig()
  const { chainId } = useEthers()

  let votingContract = new Contract('0x0000000000000000000000000000000000000000', new Interface(VotingContract.abi))
  let directoryContract = new Contract('0x0000000000000000000000000000000000000000', new Interface(Directory.abi))

  if (chainId) {
    const chainConfig = config.contracts[chainId]
    if (chainConfig) {
      votingContract = new Contract(chainConfig.votingContract, new Interface(VotingContract.abi))
      directoryContract = new Contract(chainConfig.directoryContract, new Interface(Directory.abi))
    }
  }

  return { votingContract, directoryContract }
}
