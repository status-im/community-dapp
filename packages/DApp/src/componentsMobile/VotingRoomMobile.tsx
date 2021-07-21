import { useContractCall } from '@usedapp/core'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import styled from 'styled-components'
import { VotingCard } from '../components/votes/VotingCard'
import { VotingCardSkeleton } from '../components/votes/VotingCardSkeleton'
import { getCommunityDetails } from '../helpers/apiMock'
import { useCommunities } from '../hooks/useCommunities'
import { useContracts } from '../hooks/useContracts'
import { DetailedVotingRoom } from '../models/smartContract'

export function VotingRoomMobile() {
  const { id } = useParams<{ id: string }>()

  const { votingContract } = useContracts()
  const votingRoom = useContractCall({
    abi: votingContract.interface,
    address: votingContract.address,
    method: 'votingRoomMap',
    args: [Number(id)],
  }) as any
  const [details] = useCommunities([votingRoom?.community])
  const [detailedVotingRoom, setDetailedVotingRoom] = useState<DetailedVotingRoom | undefined>(undefined)

  useEffect(() => {
    if (votingRoom && details) {
      setDetailedVotingRoom({ ...votingRoom, details })
    }
  }, [votingRoom?.roomNumber?.toString(), details?.publicKey])

  return <div>{detailedVotingRoom ? <VotingCard room={detailedVotingRoom} /> : <VotingCardSkeleton />}</div>
}
