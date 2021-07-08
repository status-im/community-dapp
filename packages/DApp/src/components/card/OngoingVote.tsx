import React from 'react'
import { votingFromRoom } from '../../helpers/voting'
import { CommunityDetail } from '../../models/community'
import { VotingRoom } from '../../models/smartContract'
import { CardVoteBlock } from '../Card'
import { CardVote } from './CardVote/CardVote'
import { Modal } from '../Modal'

export interface OngoingVoteProps {
  community: CommunityDetail
  setShowOngoingVote: (show: boolean) => void
  room: VotingRoom
}

export function OngoingVote({ community, setShowOngoingVote, room }: OngoingVoteProps) {
  const vote = votingFromRoom(room)
  const detailedVoting = { ...room, details: community }
  if (!vote) {
    return <CardVoteBlock />
  }

  return (
    <Modal heading={`${vote?.type} ${community.name}?`} setShowModal={setShowOngoingVote}>
      <CardVote hideModalFunction={setShowOngoingVote} room={detailedVoting} />
    </Modal>
  )
}
