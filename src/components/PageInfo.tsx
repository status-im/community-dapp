import React from 'react'
import styled from 'styled-components'
import { useEthers } from '@usedapp/core'
import { ButtonPrimary } from '../components/Button'

interface PageInfoProps {
  heading: string
  text: string
}

export const PageInfo = ({ heading, text }: PageInfoProps) => (
  <InfoBlock>
    <InfoHeading>{heading}</InfoHeading>
    <InfoText>{text}</InfoText>
  </InfoBlock>
)

export function ProposeButton() {
  return <InfoButton>Propose community</InfoButton>
}

export function ConnectButton() {
  const { activateBrowserWallet } = useEthers()
  return <InfoButton onClick={() => activateBrowserWallet()}>Connect to Vote</InfoButton>
}

export const InfoWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 693px;
  padding: 48px 0;
  margin: 0 auto;
`

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
const InfoButton = styled(ButtonPrimary)`
  padding: 10px 0;
  width: 343px;
`
