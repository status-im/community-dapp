import { useState, useEffect } from 'react'
import { useWaku } from '../providers/waku/provider'
import { useContractCall } from '@usedapp/core'
import { useConfig } from '../providers/config'
import { useContracts } from '../hooks/useContracts'

import wakuMessage from '../helpers/wakuVote'
import { useTypedVote } from './useTypedVote'

export function useVotesAggregate(room: number | undefined) {
  const { config } = useConfig()
  const { votingContract } = useContracts()
  const [alreadyVotedList] =
    useContractCall({
      abi: votingContract.interface,
      address: votingContract.address,
      method: 'listRoomVoters',
      args: [room],
    }) ?? []
  const { waku } = useWaku()
  const [votesToSend, setVotesToSend] = useState<any[]>([])
  const { getTypedVote } = useTypedVote()
  useEffect(() => {
    const accumulateVotes = async () => {
      if (waku && alreadyVotedList && room) {
        const messages = await wakuMessage.receive(waku, config.wakuTopic, room)
        const verifiedMessages = wakuMessage.filterVerified(messages, alreadyVotedList, getTypedVote)
        if (votesToSend.length != verifiedMessages.length) {
          setVotesToSend(verifiedMessages)
        }
      }
    }
    accumulateVotes()
  }, [waku, room, alreadyVotedList])

  return { votes: votesToSend }
}
