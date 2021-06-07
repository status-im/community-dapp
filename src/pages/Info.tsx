import React from 'react'
import { InfoWrap, PageInfo } from '../components/PageInfo'

export function Info() {
  return (
    <InfoWrap>
      <PageInfo
        heading="What is this DApp about?"
        text="This DApp allows SNT holders determine which communities should be included in the Status Communities directory"
      />
    </InfoWrap>
  )
}
