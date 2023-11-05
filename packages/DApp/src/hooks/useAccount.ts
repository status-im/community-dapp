import { useEthers } from '@usedapp/core'
import { useEffect, useState } from 'react'

type Error = {
  name: string
  message: string
  stack?: string
}

export function useAccount() {
  const {
    error,
    isLoading,
    active,
    switchNetwork,
    activateBrowserWallet,
    deactivate: deactivateBrowserWallet,
    account,
  } = useEthers()
  const [activateError, setActivateError] = useState<Error | undefined>(undefined)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (active && error && !isLoading) {
      setActivateError(error)
    } else if (!error) {
      setActivateError(undefined)
    }
  }, [active, error, isLoading])

  useEffect(() => {
    setIsActive(Boolean(account && !activateError))
  }, [account, activateError])

  const activate = async () => {
    setActivateError(undefined)
    activateBrowserWallet()
  }

  const deactivate = async () => {
    setActivateError(undefined)
    deactivateBrowserWallet()
  }

  return { activate, deactivate, account, isActive, error: activateError, switchNetwork }
}
