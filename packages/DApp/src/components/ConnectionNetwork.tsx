import React from 'react'
import { ProposeButton } from './Button'
import { useAccount } from '../hooks/useAccount'
import { config } from '../config'
import { Warning } from './votes/VoteWarning'
import styled from 'styled-components'

export type ConnectionNetworkProps = {
  buttonText?: string
  autoWidth?: boolean
}

export function ConnectionNetwork({ buttonText, autoWidth = false }: ConnectionNetworkProps) {
  const { activate, account, error, switchNetwork } = useAccount()

  if (account) {
    return (
      <>
        {error?.name === 'ChainIdError' && (
          <WarningWrapper>
            <Warning text="You are connected to unsupported network." icon="⚠️" />
          </WarningWrapper>
        )}
        {error?.name === 'ChainIdError' && Boolean(config.daapConfig.readOnlyChainId) && (
          <ProposeButton onClick={() => switchNetwork(config.daapConfig.readOnlyChainId!)}>
            Switch Network
          </ProposeButton>
        )}
      </>
    )
  }

  return (
    <ConnectButton autoWidth={autoWidth} onClick={activate}>
      {!buttonText ? 'Connect to Vote' : buttonText}
    </ConnectButton>
  )
}

const WarningWrapper = styled.div`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;

  @media (max-width: 600px) {
    max-width: 100%;
  }
`

const ConnectButton = styled(ProposeButton)<{ autoWidth: boolean }>`
  ${({ autoWidth }) =>
    autoWidth &&
    `
    width: auto;
    padding: 10px 27px;
    
    @media (max-width: 600px) {
      padding: 7px 27px;
      margin-top: -9px;
  }`}
`
