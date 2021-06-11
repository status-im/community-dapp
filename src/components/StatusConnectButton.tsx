import React, { ReactNode, useState } from 'react'
import { ButtonPrimary } from './Button'
import { useEthers } from '@usedapp/core'
import styled from 'styled-components'

type StatusModalProps = {
  setShowModal: (val: boolean) => void
}

function StatusModal({ setShowModal }: StatusModalProps) {
  return (
    <ModalBackground onClick={() => setShowModal(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={() => setShowModal(false)}>X</CloseButton>
        This DApp only works with status
      </Modal>
    </ModalBackground>
  )
}

export type StatusConnectButtonProps = {
  children: ReactNode
  className?: string
}

export function StatusConnectButton({ children, className }: StatusConnectButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const { activateBrowserWallet } = useEthers()

  const activateStatusWallet = () => {
    if ((window as any).ethereum.isStatus) {
      activateBrowserWallet()
    } else {
      setShowModal(true)
    }
  }

  return (
    <div>
      {showModal && <StatusModal setShowModal={setShowModal} />}
      <ButtonPrimary className={className} onClick={activateStatusWallet}>
        {children}
      </ButtonPrimary>
    </div>
  )
}

const ModalBackground = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(100, 100, 100, 0.5);
  z-index: 99;
`

const Modal = styled.div`
  position: fixed;
  top: calc(50% - 150px);
  left: calc(50% - 150px);
  width: 300px;
  height: 300px;
  background-color: white;
  color: black;
  border: 1px solid black;
  z-index: 100;
`

const CloseButton = styled.button`
  margin-left: 20px;
`
