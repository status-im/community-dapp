import React, { useState } from 'react'
import styled from 'styled-components'
import { ColumnFlexDiv } from '../../constants/styles'
import { addCommas } from '../../helpers/addCommas'
import { CardHeading, CardVoteBlock } from '../Card'
import { CommunityDetail, CurrentVoting } from '../../models/community'
import { Modal } from '../Modal'
import { FeatureModal } from './FeatureModal'
import { VoteConfirmModal } from './VoteConfirmModal'
import { OngoingVote } from './OngoingVote'
import { useEthers } from '@usedapp/core'
import { VoteSubmitButton } from './VoteSubmitButton'
import { VoteSendingBtn, VoteBtn } from '../Button'
import { VotingRoom } from '../../models/smartContract'

interface CardFeatureProps {
  community: CommunityDetail
  heading: string
  icon: string
  sum?: number
  timeLeft?: string
  currentVoting?: CurrentVoting
  room?: VotingRoom
}

export const CardFeature = ({ community, heading, icon, sum, timeLeft, currentVoting, room }: CardFeatureProps) => {
  const { account } = useEthers()
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showOngoingVote, setShowOngoingVote] = useState(false)

  const setNewModal = (val: boolean) => {
    setShowConfirmModal(val)
    setShowFeatureModal(false)
  }

  return (
    <CardVoteBlock>
      <CardHeadingFeature style={{ fontWeight: timeLeft ? 'normal' : 'bold', fontSize: timeLeft ? '15px' : '17px' }}>
        {heading}
      </CardHeadingFeature>

      <FeatureVote>
        <FeatureIcon>{icon}</FeatureIcon>

        {timeLeft && !sum && <span>{timeLeft}</span>}

        {sum && (
          <FeatureText>
            <span>{addCommas(sum)}</span> SNT votes for this community
          </FeatureText>
        )}
      </FeatureVote>

      <FeatureVoteMobile>
        {timeLeft && !sum && (
          <FeatureText>
            {icon} {heading}: <span>{timeLeft}</span>
          </FeatureText>
        )}

        {sum && (
          <FeatureTextWeekly>
            {icon}{' '}
            <span style={{ color: '#676868', fontWeight: 'normal', marginLeft: '4px' }}>Weekly Feature Vote: </span>
            <span>{addCommas(sum)}</span> SNT
          </FeatureTextWeekly>
        )}
      </FeatureVoteMobile>
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

      {currentVoting && room && (
        <FeatureBottom>
          {showOngoingVote && <OngoingVote community={community} setShowOngoingVote={setShowOngoingVote} room={room} />}
          <VoteSendingBtn onClick={() => setShowOngoingVote(true)}>Removal vote in progress</VoteSendingBtn>
          {currentVoting && currentVoting.timeLeft > 0 && <VoteSubmitButton vote={currentVoting} />}
        </FeatureBottom>
      )}
    </CardVoteBlock>
  )
}

const CardHeadingFeature = styled(CardHeading)`
  @media (max-width: 768px) {
    display: none;
  }
`
export const FeatureBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 600px) {
    display: none;
  }
`

const FeatureIcon = styled.p`
  font-size: 24px;
  margin-bottom: 8px;
`

const FeatureBtn = styled(VoteBtn)`
  width: 100%;

  @media (max-width: 600px) {
    display: none;
  }
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

  @media (max-width: 768px) {
    display: none;
  }
`
const FeatureVoteMobile = styled(ColumnFlexDiv)`
  display: none;
  text-align: center;
  margin-bottom: 32px;
  margin-top: -14px;

  @media (max-width: 768px) {
    display: flex;
  }

  @media (max-width: 600px) {
    margin: 0;
  }
`

const FeatureText = styled.p`
  & > span {
    font-weight: bold;
    font-size: 15px;
    line-height: 22px;
  }
`
const FeatureTextWeekly = styled(FeatureText)`
  & > span {
    font-weight: bold;
    font-size: 15px;
    line-height: 22px;
  }
`
