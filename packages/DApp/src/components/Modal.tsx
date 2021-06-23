import React, { ReactNode, useEffect } from 'react'
import styled from 'styled-components'
import { Colors } from '../constants/styles'
import closeIcon from '../assets/images/close.svg'

type ModalProps = {
  heading?: string
  children: ReactNode
  setShowModal: (val: boolean) => void
}

export function Modal({ heading, children, setShowModal }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])
  return (
    <PopUpOverlay onClick={() => setShowModal(false)}>
      <PopUpWindow onClick={(e) => e.stopPropagation()}>
        <PopUpHeader>
          {heading ? <PopUpHeading>{heading}</PopUpHeading> : ''}
          <CloseButton onClick={() => setShowModal(false)} />
        </PopUpHeader>
        <PopUpContetnt>{children}</PopUpContetnt>
      </PopUpWindow>
    </PopUpOverlay>
  )
}

const PopUpOverlay = styled.div`
  height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  transition: all 0.3s;
  overflow: auto;
`

const PopUpWindow = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 475px;
  margin: 20vh auto 2vh;
  padding: 24px;
  background-color: ${Colors.GrayLight};
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
`
const PopUpHeader = styled.div`
  display: flex;
  position: relative;
  margin-bottom: 32px;
`
const PopUpHeading = styled.p`
  font-weight: bold;
  font-size: 17px;
  line-height: 24px;
`
const PopUpContetnt = styled.div`
  width: 100%;
`

const CloseButton = styled.button`
  position: absolute;
  content: '';
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background-image: url(${closeIcon});
`