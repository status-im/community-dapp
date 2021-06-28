import React, { useState } from 'react'
import styled from 'styled-components'
import { Colors } from '../../constants/styles'
import { addCommas } from '../../helpers/addCommas'
import { LinkInternal } from '../Link'
import rightIcon from '../../assets/images/arrowRight.svg'
import { CardHeading, CardVoteBlock, VoteBtn } from '../Card'
import { CommunityDetail } from '../../models/community'
import { Modal } from '../Modal'
import { FeatureModal } from './FeatureModal'
import { VoteConfirmModal } from './VoteConfirmModal'
import { OngoingVote } from './OngoingVote'
import { useEthers } from '@usedapp/core'

interface CardFeatureProps {
  community: CommunityDetail
  heading: string
  text: string
  icon: string
  sum?: number
  timeLeft?: string
  voting?: boolean
}

export const CardFeature = ({ community, heading, text, icon, sum, timeLeft, voting }: CardFeatureProps) => {
  const { account } = useEthers()
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showOngoingVote, setShowOngoingVote] = useState(false)

  const setNewModal = (val: boolean) => {
    setShowConfirmModal(val)
    setShowFeatureModal(false)
  }

  return (
    <CardVoteBlock style={{ backgroundColor: `${Colors.GrayLight}` }}>
      <FeatureTop>
        <CardHeading>{heading}</CardHeading>
        {voting && (
          <div>
            {showOngoingVote && <OngoingVote community={community} setShowOngoingVote={setShowOngoingVote} />}
            <CardLinkFeature onClick={() => setShowOngoingVote(true)}>Ongoing vote for removal</CardLinkFeature>
          </div>
        )}
      </FeatureTop>

      <FeatureVote>
        <p>{text}</p>
        <p style={{ fontSize: '24px' }}>{icon}</p>

        {timeLeft && <span>{timeLeft}</span>}

        {sum && <span style={{ fontWeight: 'normal' }}>{addCommas(sum)} SNT</span>}
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
    </CardVoteBlock>
  )
}

const CardLinkFeature = styled(LinkInternal)`
  padding-right: 28px;
  font-size: 12px;
  line-height: 20px;
  position: relative;

  &::after {
    content: '';
    width: 24px;
    height: 24px;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-image: url(${rightIcon});
    background-size: cover;
  }
`
const FeatureTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const FeatureBtn = styled(VoteBtn)`
  width: 100%;
`
const FeatureVote = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 45px auto 32px;
  max-width: 290px;
  text-align: center;

  & > p {
    font-size: 17px;
    line-height: 18px;
    margin-bottom: 8px;
  }

  & > span {
    font-weight: bold;
    font-size: 15px;
    line-height: 22px;
  }
`
