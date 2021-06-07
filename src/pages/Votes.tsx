import React from 'react'
import { InfoWrap, InfoBtn, PageInfo } from '../components/PageInfo'

export function Votes() {
  return (
    <InfoWrap>
      <PageInfo
        heading="Ongoing Votes"
        text="Help curate the Status Communities directory by voting which communities should be included"
      />
      <InfoBtn />
    </InfoWrap>
  )
}
