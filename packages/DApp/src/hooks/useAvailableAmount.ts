import { useEthers, useTokenBalance } from '@usedapp/core'
import { contracts } from '../constants/contracts'
import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'

export function useAvailableAmount() {
  const { account, chainId } = useEthers()
  // @ts-expect-error fixme: https://github.com/status-im/community-dapp/pull/94#discussion_r1378964354 undefined or unsupported network
  const tokenBalance = useTokenBalance(contracts[chainId as keyof typeof contracts | undefined].tokenContract, account)

  const [availableAmount, setAvailableAmount] = useState(0)

  useEffect(() => {
    setAvailableAmount(tokenBalance?.div(BigNumber.from('0xDE0B6B3A7640000')).toNumber() ?? 0)
  }, [tokenBalance?.toString()])

  return availableAmount
}
