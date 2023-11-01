import React from 'react'
import { VotingCards } from '../components/votes/VotingCards'
import { VotesInfo } from '../components/votes/VotesInfo'
import { NotificationsList } from '../components/NotificationsList'

export function Votes() {
  return (
    <div>
      <VotesInfo />
      <VotingCards />
      <NotificationsList type="votes" />
    </div>
  )
}
