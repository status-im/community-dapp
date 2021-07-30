import { useEthers, useTokenBalance } from '@usedapp/core'
import { useConfig } from '../providers/config'
import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'

export function useAvailableAmount() {
  const { config } = useConfig()
  const { account, chainId } = useEthers()
  const tokenBalance = useTokenBalance(config.contracts[chainId ?? 3].tokenContract, account)

  const [availableAmount, setAvailableAmount] = useState(0)

  useEffect(() => {
    setAvailableAmount(tokenBalance?.div(BigNumber.from('0xDE0B6B3A7640000')).toNumber() ?? 0)
  }, [tokenBalance?.toString()])

  return availableAmount
}
