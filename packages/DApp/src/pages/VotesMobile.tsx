import React from 'react'
import { VotingCards } from '../components/votes/VotingCards'
import { TopBarMobile } from '../componentsMobile/TopBarMobile'

export function VotesMobile() {
  return (
    <div>
      <TopBarMobile
        heading="Ongoing Votes"
        text="Help curate the Status Communities directory by voting which communities should be included"
      />
      <VotingCards />
    </div>
  )
}
