import { useState, useEffect } from 'react'
import { useWaku } from '../../providers/waku/provider'
import { useContractCall } from '@usedapp/core'
import { useConfig } from '../../providers/config'
import { useContracts } from '../hooks/useContracts'

import wakuMessage from '../../helpers/wakuMessage'

export function useVotesAggregate(room: number) {
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

  useEffect(() => {
    const accumulateVotes = async () => {
      if (waku && alreadyVotedList) {
        const messages = await wakuMessage.receive(waku, config.wakuTopic, room)
        const verifiedMessages = wakuMessage.filterVerified(messages, alreadyVotedList)
        if (votesToSend.length != verifiedMessages.length) {
          setVotesToSend(verifiedMessages)
        }
      }
    }
    accumulateVotes()
  }, [waku, room, alreadyVotedList])

  return { votes: votesToSend }
}
