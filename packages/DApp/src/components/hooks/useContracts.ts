import { useEthers } from '@usedapp/core'
import { useConfig } from '../../providers/config'
import { Contract } from '@usedapp/core/node_modules/ethers'
import { Interface } from '@ethersproject/abi'
import { MockContract } from '@status-community-dapp/contracts/abi'

export function useContracts() {
  const { config } = useConfig()
  const { chainId } = useEthers()

  return {
    votingContract: new Contract(config.contracts[chainId ?? 3].votingContract, new Interface(MockContract.abi)),
  }
}
