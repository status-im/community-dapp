import React from 'react'
import { DirectoryCards } from '../components/directory/DirectoryCards'
import { TopBarMobile } from '../componentsMobile/TopBarMobile'

export function DirectoryMobile() {
  return (
    <div>
      <TopBarMobile
        heading="Current directory"
        text="Vote on your favourite communities being included in 
       Weekly Featured Communities"
      />
      <DirectoryCards />
    </div>
  )
}
