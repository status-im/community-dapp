import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ColumnFlexDiv } from '../../constants/styles'
import { addCommas } from '../../helpers/addCommas'
import { CardHeading, CardVoteBlock } from '../Card'
import { CommunityDetail, CurrentVoting } from '../../models/community'
import { Modal } from '../Modal'
import { FeatureModal } from './FeatureModal'
import { VoteConfirmModal } from './VoteConfirmModal'
import { OngoingVote } from './OngoingVote'
// import { useEthers } from '@usedapp/core'
import { VoteSubmitButton } from './VoteSubmitButton'
import { VoteSendingBtn, VoteBtn } from '../Button'
import { VotingRoom } from '../../models/smartContract'
// import { useWakuFeature } from '../../providers/wakuFeature/provider'

interface CardFeatureProps {
  community: CommunityDetail
  currentVoting?: CurrentVoting
  room?: VotingRoom
}

export const CardFeature = ({ community, currentVoting, room }: CardFeatureProps) => {
  // const { account } = useEthers()
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showOngoingVote, setShowOngoingVote] = useState(false)
  // const { featured } = useWakuFeature()
  // const inFeatured = Boolean(featured.find((el) => el[0] === community.publicKey))
  const inFeatured = false

  const [heading, setHeading] = useState('Weekly Feature vote')
  const [icon, setIcon] = useState('⭐')
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    setHeading(inFeatured ? 'This community has been featured last week' : 'Weekly Feature vote')
    setIcon(inFeatured ? '⏳' : '⭐')
    setTimeLeft(inFeatured ? '1 week' : '')
  }, [inFeatured])

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

        {timeLeft && <span>{timeLeft}</span>}

        {!inFeatured && community?.featureVotes && (
          <FeatureText>
            <span>{addCommas(community?.featureVotes.toNumber())}</span> SNT votes for this community
          </FeatureText>
        )}
      </FeatureVote>

      <FeatureVoteMobile>
        {timeLeft && (
          <FeatureText>
            {icon} {heading}: <span>{timeLeft}</span>
          </FeatureText>
        )}

        {!inFeatured && community?.featureVotes && (
          <FeatureTextWeekly>
            {icon}{' '}
            <span style={{ color: '#676868', fontWeight: 'normal', marginLeft: '4px' }}>Weekly Feature Vote: </span>
            <span>{addCommas(community.featureVotes.toNumber())}</span> SNT
          </FeatureTextWeekly>
        )}
      </FeatureVoteMobile>
      <div>
        {showFeatureModal && (
          <Modal heading="Feature in “Weekly Featured”?" setShowModal={setShowFeatureModal}>
            <FeatureModal community={community} setShowConfirmModal={setNewModal} />{' '}
          </Modal>
        )}
        {showConfirmModal && (
          <Modal setShowModal={setShowConfirmModal}>
            <VoteConfirmModal community={community} selectedVote={{ verb: 'to feature' }} setShowModal={setNewModal} />
          </Modal>
        )}
        <FeatureBtn disabled>Coming soon!</FeatureBtn>
        {/* <FeatureBtn disabled={!account || inFeatured} onClick={() => setShowFeatureModal(true)}>
          Feature this community! <span style={{ fontSize: '20px' }}>⭐️</span>
        </FeatureBtn> */}
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
