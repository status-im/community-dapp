import { useContractFunction } from '@usedapp/core'
import React from 'react'
import { useContracts } from '../../hooks/useContracts'
import { useVotesAggregate } from '../../hooks/useVotesAggregate'
import { CurrentVoting } from '../../models/community'
import { VoteSendingBtn } from '../Button'

interface VoteSubmitButtonProps {
  vote: CurrentVoting
}

export function VoteSubmitButton({ vote }: VoteSubmitButtonProps) {
  const { votes } = useVotesAggregate(vote.ID)
  const { votingContract } = useContracts()
  const { send } = useContractFunction(votingContract, 'castVotes')
  if (votes.length > 0) {
    return <VoteSendingBtn onClick={() => send(votes)}> {votes.length} votes need saving</VoteSendingBtn>
  }
  return null
}
