import React from 'react'
import styled from 'styled-components'

export function Logo() {
  return (
    <LogoBox>
      <LogoIcon>🗳️</LogoIcon>
      <LogoText>Community Directory Curation DApp</LogoText>
    </LogoBox>
  )
}

const LogoBox = styled.div`
  display: flex;
  align-items: center;
  width: 236px;
`
const LogoIcon = styled.span`
  font-size: 48px;
  line-height: 38px;
`

const LogoText = styled.p`
  font-weight: 600;
  font-size: 17px;
  line-height: 18px;
  margin-left: 8px;
`
