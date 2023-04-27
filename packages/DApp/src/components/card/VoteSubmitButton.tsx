import { useContractFunction } from '@usedapp/core'
import React from 'react'
import { useContracts } from '../../hooks/useContracts'
import { useVotesAggregate } from '../../hooks/useVotesAggregate'
import { CurrentVoting } from '../../models/community'
import { VoteSendingBtn } from '../Button'
import { BigNumber } from 'ethers'
import { addCommas } from '../../helpers/addCommas'
import { VotingRoom } from '../../models/smartContract'

interface VoteSubmitButtonProps {
  vote: CurrentVoting
  room: VotingRoom
}

export function VoteSubmitButton({ vote, room }: VoteSubmitButtonProps) {
  const { votes } = useVotesAggregate(vote.ID, room.verificationStartAt, room.startAt)
  const { votingContract } = useContracts()
  const { send } = useContractFunction(votingContract, 'castVotes')
  const voteAmount = votes.reduce((prev, curr) => prev.add(curr[2]), BigNumber.from(0))
  if (votes.length > 0) {
    return (
      <VoteSendingBtn onClick={() => send(votes)}> {addCommas(voteAmount.toString())} votes need saving</VoteSendingBtn>
    )
  }
  return null
}
