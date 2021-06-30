import React from 'react'
import styled from 'styled-components'
import { ButtonPrimary } from '../components/Button'
import { ColumnFlexDiv } from '../constants/styles'
import { StatusConnectButton } from './StatusConnectButton'

interface PageInfoProps {
  heading: string
  text: string
}

export const PageInfo = ({ heading, text }: PageInfoProps) => (
  <ColumnFlexDiv>
    <InfoHeading>{heading}</InfoHeading>
    <InfoText>{text}</InfoText>
  </ColumnFlexDiv>
)

interface ProposeButtonProps {
  onClick: () => void
}

export function ProposeButton({ onClick }: ProposeButtonProps) {
  return <ProposeButtonStyled onClick={onClick}>Propose community</ProposeButtonStyled>
}

export function ConnectButton() {
  return <ConnectButtonStyled>Connect to Vote</ConnectButtonStyled>
}

export const InfoWrap = styled(ColumnFlexDiv)`
  max-width: 630px;
  padding: 48px 0;
  margin: 0 auto;
`

const InfoHeading = styled.h1`
  font-weight: bold;
  font-size: 28px;
  line-height: 38px;
  letter-spacing: -0.4px;
  margin-bottom: 8px;
`

const InfoText = styled.p`
  font-size: 22px;
  text-align: center;
  line-height: 32px;
  margin-bottom: 24px;
`
const ProposeButtonStyled = styled(ButtonPrimary)`
  padding: 10px 0;
  width: 343px;
`

const ConnectButtonStyled = styled(StatusConnectButton)`
  padding: 10px 0;
  width: 343px;
`
