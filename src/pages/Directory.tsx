import React from 'react'
import { InfoBtn, InfoWrap, PageInfo } from '../components/PageInfo'

export function Directory() {
  return (
    <InfoWrap>
      <PageInfo
        heading="Current directory"
        text="Vote on your favourite communities being included in 
      Weekly Featured Communities"
      />
      <InfoBtn />
    </InfoWrap>
  )
}
