import React from 'react'
import styled from 'styled-components'
import { ColumnFlexDiv } from '../constants/styles'

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
