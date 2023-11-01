import React from 'react'
import { ProposeButton } from './Button'
import { useEthers } from '@usedapp/core'

export type ConnectButtonProps = {
  text?: string
  className?: string
}

export function ConnectButton({ text, className }: ConnectButtonProps) {
  const { activateBrowserWallet } = useEthers()

  return (
    <div>
      <ProposeButton className={className} onClick={activateBrowserWallet}>
        {!text ? 'Connect to Vote' : text}
      </ProposeButton>
    </div>
  )
}
