import { useState, useEffect } from 'react'
import { BigNumber } from 'ethers'
import { useWaku } from '../providers/waku/provider'
import { config } from '../config'

import wakuMessage from '../helpers/wakuVote'
import { validateVote } from '../helpers/validateVote'
import { useContracts } from './useContracts'
import { useContractCall } from '@usedapp/core'

type InitialVotes = {
  for: number
  against: number
  voted: string[]
}

export function useUnverifiedVotes(room: number | undefined, verificationStartAt: BigNumber, startAt: BigNumber) {
  const { votingContract } = useContracts()
  const [alreadyVotedList] =
    useContractCall({
      abi: votingContract.interface,
      address: votingContract.address,
      method: 'listRoomVoters',
      args: [room],
    }) ?? []

  const initialVotes: InitialVotes = {
    for: 0,
    against: 0,
    voted: alreadyVotedList ?? [],
  }

  const { waku } = useWaku()
  const [votesFor, setVotesFor] = useState<number>(initialVotes.for)
  const [votesAgainst, setVotesAgainst] = useState<number>(initialVotes.against)

  useEffect(() => {
    const accumulateVotes = async () => {
      if (waku && room) {
        const messages = await wakuMessage.receive(waku, config.wakuConfig.wakuTopic, room)

        if (!messages?.length) {
          return
        }

        const validMessages = messages.filter((message) => validateVote(message, verificationStartAt, startAt))

        if (!validMessages.length) {
          return
        }

        const votes: InitialVotes = validMessages.reduce((acc, message) => {
          // todo?: if non-proposing accounts can vote multiple times
          // account already voted
          // if (acc.voted.includes(message.address)) {
          //   // fixme?: do not include votes of the proposing account
          //   console.log('ALREADY VOTED')
          //   return { for: acc.for, against: acc.against, voted: acc.voted }
          // }

          if (message.vote === 'no') {
            return {
              for: acc.for,
              against: acc.against + parseInt(message.sntAmount._hex, 16),
              voted: [...acc.voted, message.address],
            }
          } else if (message.vote === 'yes') {
            return {
              for: acc.for + parseInt(message.sntAmount._hex, 16),
              against: acc.against,
              voted: [...acc.voted, message.address],
            }
          }

          return { for: acc.for, against: acc.against, voted: acc.voted }
        }, initialVotes)

        if (!votes.for && !votes.against) {
          return
        }

        setVotesFor(votes.for)
        setVotesAgainst(votes.against)
      }
    }
    accumulateVotes()
  }, [waku, room, alreadyVotedList])

  return { votesFor, votesAgainst }
}
