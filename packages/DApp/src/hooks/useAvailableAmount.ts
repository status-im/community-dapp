import { useEthers, useTokenBalance } from '@usedapp/core'
import { contracts } from '../constants/contracts'
import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'

export function useAvailableAmount() {
  const { account, chainId } = useEthers()
  // @ts-expect-error Ethers does not type chainId
  const tokenBalance = useTokenBalance(contracts[chainId ?? 3].tokenContract, account)

  const [availableAmount, setAvailableAmount] = useState(0)

  useEffect(() => {
    setAvailableAmount(tokenBalance?.div(BigNumber.from('0xDE0B6B3A7640000')).toNumber() ?? 0)
  }, [tokenBalance?.toString()])

  return availableAmount
}
