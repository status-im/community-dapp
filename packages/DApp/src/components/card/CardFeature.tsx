import React, { useState } from 'react'
import styled from 'styled-components'
import { Colors, ColumnFlexDiv } from '../../constants/styles'
import { addCommas } from '../../helpers/addCommas'
import { CardHeading, CardVoteBlock, VoteBtn, VoteSendingBtn } from '../Card'
import { CommunityDetail } from '../../models/community'
import { Modal } from '../Modal'
import { FeatureModal } from './FeatureModal'
import { VoteConfirmModal } from './VoteConfirmModal'
import { OngoingVote } from './OngoingVote'
import { useContractFunction, useEthers } from '@usedapp/core'
import { useContracts } from '../../hooks/useContracts'
import { useContractCall } from '@usedapp/core'
import { useVotesAggregate } from '../../hooks/useVotesAggregate'
import { votingFromRoom } from '../../helpers/voting'
interface CardFeatureProps {
  community: CommunityDetail
  heading: string
  icon: string
  sum?: number
  timeLeft?: string
}

export const CardFeature = ({ community, heading, icon, sum, timeLeft }: CardFeatureProps) => {
  const { account } = useEthers()
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showOngoingVote, setShowOngoingVote] = useState(false)

  const setNewModal = (val: boolean) => {
    setShowConfirmModal(val)
    setShowFeatureModal(false)
  }

  const { votingContract } = useContracts()
  const [roomNumber] =
    useContractCall({
      abi: votingContract.interface,
      address: votingContract.address,
      method: 'communityVotingId',
      args: [community.publicKey],
    }) ?? []

  const { votes } = useVotesAggregate(roomNumber)
  const { send } = useContractFunction(votingContract, 'castVotes')

  const votingRoom = useContractCall({
    abi: votingContract.interface,
    address: votingContract.address,
    method: 'votingRoomMap',
    args: [roomNumber],
  }) as any

  let currentVoting
  if (votingRoom) {
    currentVoting = { ...votingFromRoom(votingRoom), room: roomNumber }
  }

  return (
    <CardVoteBlock style={{ backgroundColor: `${Colors.GrayLight}` }}>
      <CardHeading style={{ fontWeight: timeLeft ? 'normal' : 'bold', fontSize: timeLeft ? '15px' : '17px' }}>
        {heading}
      </CardHeading>

      <FeatureVote>
        <FeatureIcon>{icon}</FeatureIcon>

        {timeLeft && <span>{timeLeft}</span>}

        {sum && (
          <FeatureText>
            <span>{addCommas(sum)}</span> SNT votes for this community
          </FeatureText>
        )}
      </FeatureVote>
      <div>
        {showFeatureModal && (
          <Modal heading="Feature in “Weekly Featured”?" setShowModal={setShowFeatureModal}>
            <FeatureModal community={community} availableAmount={549739700} setShowConfirmModal={setNewModal} />{' '}
          </Modal>
        )}
        {showConfirmModal && (
          <Modal setShowModal={setShowConfirmModal}>
            <VoteConfirmModal community={community} selectedVote={{ verb: 'to feature' }} setShowModal={setNewModal} />
          </Modal>
        )}
        <FeatureBtn disabled={Boolean(timeLeft) || !account} onClick={() => setShowFeatureModal(true)}>
          Feature this community! <span style={{ fontSize: '20px' }}>⭐️</span>
        </FeatureBtn>
      </div>

      {currentVoting && (
        <FeatureBottom>
          {showOngoingVote && (
            <OngoingVote community={community} setShowOngoingVote={setShowOngoingVote} room={votingRoom} />
          )}
          <VoteSendingBtn onClick={() => setShowOngoingVote(true)}>Removal vote in progress</VoteSendingBtn>
          {votes.length > 0 && currentVoting && currentVoting?.timeLeft > 0 && (
            <VoteSendingBtn onClick={() => send(votes)}> {votes.length} votes need saving</VoteSendingBtn>
          )}
        </FeatureBottom>
      )}
    </CardVoteBlock>
  )
}

const FeatureBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const FeatureIcon = styled.p`
  font-size: 24px;
  margin-bottom: 8px;
`

const FeatureBtn = styled(VoteBtn)`
  width: 100%;
`
const FeatureVote = styled(ColumnFlexDiv)`
  margin: 32px auto;
  max-width: 330px;
  text-align: center;

  & > span {
    font-weight: bold;
    font-size: 15px;
    line-height: 22px;
  }
`

const FeatureText = styled.p`
  & > span {
    font-weight: bold;
    font-size: 15px;
    line-height: 22px;
  }
`
