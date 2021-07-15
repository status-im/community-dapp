import React, { useState } from 'react'
import { ProposeButton } from './Button'
import { useEthers } from '@usedapp/core'
import styled from 'styled-components'
import { Modal } from './Modal'
import { LinkExternal } from './Link'
import statusLogo from '../assets/images/statusLogo.svg'
import { ColumnFlexDiv } from '../constants/styles'

export type ConnectButtonProps = {
  text?: string
  className?: string
}

export function ConnectButton({ text, className }: ConnectButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const { activateBrowserWallet } = useEthers()

  const activateStatusWallet = () => {
    if ((window as any).ethereum?.isStatus) {
      activateBrowserWallet()
    } else {
      setShowModal(true)
    }
  }

  return (
    <div>
      {showModal && (
        <Modal heading={'Connect with Status'} setShowModal={setShowModal}>
          <StatusModal />{' '}
        </Modal>
      )}
      <ProposeButton className={className} onClick={activateStatusWallet}>
        {!text ? 'Connect to Vote' : text}
      </ProposeButton>
    </div>
  )
}

function StatusModal() {
  return (
    <StatusInfo>
      <p>This DApp is only available for</p>
      <StatusLogo src={statusLogo} />
      <p>Secure Crypto Wallet & Messenger</p>
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
const StatusLogo = styled.img`
  margin: 16px 0;
`

const StatusLink = styled(LinkExternal)`
  margin-top: 45px;
  margin-bottom: 13px;
`
