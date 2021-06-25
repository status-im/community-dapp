import React from 'react'
import { CommunityDetail } from '../../models/community'
import { CardVote, CardVoteBlock } from '../Card'
import { Modal } from '../Modal'

export interface OngoingVoteProps {
  community: CommunityDetail
  setShowOngoingVote: (show: boolean) => void
}

export function OngoingVote({ community, setShowOngoingVote }: OngoingVoteProps) {
  const vote = community.currentVoting
  if (!vote) {
    return <CardVoteBlock />
  }

  return (
    <Modal heading={`${vote?.type} ${community.name}?`} setShowModal={setShowOngoingVote}>
      <CardVote community={community} hideModalFunction={setShowOngoingVote} />
    </Modal>
  )
}
