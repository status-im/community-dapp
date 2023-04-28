import React, { useState } from 'react'
import { ProposeButton } from './Button'
import { useEthers } from '@usedapp/core'
import styled from 'styled-components'
import { Modal } from './Modal'
import { LinkExternal } from './Link'
import statusLogo from '../assets/images/statusLogo.svg'
import { ColumnFlexDiv } from '../constants/styles'
import { config } from '../config'

export type ConnectButtonProps = {
  text?: string
  className?: string
}

export function ConnectButton({ text, className }: ConnectButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const { activateBrowserWallet } = useEthers()

  const activateWallet = () => {
    if (config.statusWalletRequired && !(window as any).ethereum?.isStatus) {
      setShowModal(true)
      return
    }
    activateBrowserWallet()
  }

  return (
    <div>
      {showModal && (
        <Modal heading={'Connect with Status'} setShowModal={setShowModal}>
          <StatusModal />{' '}
        </Modal>
      )}
      <ProposeButton className={className} onClick={activateWallet}>
        {!text ? 'Connect to Vote' : text}
      </ProposeButton>
    </div>
  )
}

function StatusModal() {
  return (
    <StatusInfo>
      <p>This DApp is only available for</p>
      <StatusTextBlock>
        <StatusLogo src={statusLogo} />
        <p>{window.innerWidth > 600 ? 'Secure Crypto' : ''} Wallet & Messenger</p>
      </StatusTextBlock>

      <StatusLink href="https://status.im/get/" target="_blank">
        Get Status
      </StatusLink>
    </StatusInfo>
  )
}

const StatusInfo = styled(ColumnFlexDiv)`
  & > p {
    font-weight: 500;
    font-size: 15px;
    line-height: 22px;
  }
`

const StatusTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 600px) {
    flex-direction: row;
  }

  @media (max-width: 340px) {
    flex-direction: column;
  }
`
const StatusLogo = styled.img`
  width: 120px;
  height: 45px;
  margin: 16px 0;

  @media (max-width: 600px) {
    width: 83px;
    height: 31px;
    margin: 8px 0;
    margin-right: 8px;
  }
`

const StatusLink = styled(LinkExternal)`
  margin-top: 45px;
  margin-bottom: 13px;

  @media (max-width: 600px) {
    margin-top: 16px;
  }
`
