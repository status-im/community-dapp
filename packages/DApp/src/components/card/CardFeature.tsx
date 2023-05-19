import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ColumnFlexDiv } from '../../constants/styles'
import { addCommas } from '../../helpers/addCommas'
import { CardHeading, CardVoteBlock } from '../Card'
import { CommunityDetail } from '../../models/community'
import { Modal } from '../Modal'
import { FeatureModal } from './FeatureModal'
import { VoteConfirmModal } from './VoteConfirmModal'
import { useContractCall, useContractFunction, useEthers } from '@usedapp/core'
import { VoteBtn } from '../Button'
import { useFeaturedVotes } from '../../hooks/useFeaturedVotes'
import { getFeaturedVotingState } from '../../helpers/featuredVoting'
import { useContracts } from '../../hooks/useContracts'
import { BigNumber } from 'ethers'

interface CardFeatureProps {
  community: CommunityDetail
  featured: boolean
}

export const CardFeature = ({ community, featured }: CardFeatureProps) => {
  const { featuredVotingContract } = useContracts()
  const [isInCooldownPeriod] =
    useContractCall({
      abi: featuredVotingContract.interface,
      address: featuredVotingContract.address,
      method: 'isInCooldownPeriod',
      args: [community.publicKey],
    }) ?? []

  const { account } = useEthers()
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [verifiedVotes, setVerifiedVotes] = useState<BigNumber>(BigNumber.from(0))
  const inFeatured = featured || isInCooldownPeriod

  const [heading, setHeading] = useState('Weekly Feature vote')
  const [icon, setIcon] = useState('⭐')
  const { activeVoting, votesToSend } = useFeaturedVotes()
  const featuredVotingState = getFeaturedVotingState(activeVoting)

  const castVotes = useContractFunction(featuredVotingContract, 'castVotes')

  const [savedVotes] =
    useContractCall({
      abi: featuredVotingContract.interface,
      address: featuredVotingContract.address,
      method: 'getVotesByVotingId',
      args: [activeVoting?.id.toNumber()],
    }) ?? []

  console.log('=== CARD FEATURE ===')

  console.log(activeVoting?.id.toNumber())

  console.log(community.name, activeVoting?.id.toNumber())
  console.log(savedVotes?.[0]?.sntAmount?.toNumber())
  console.log('ALL SAVED VOTES')
  console.log(savedVotes)

  useEffect(() => {
    setHeading(inFeatured ? 'This community has been featured recently' : 'Weekly Feature vote')
    setIcon(inFeatured ? '⏳' : '⭐')
  }, [inFeatured])

  useEffect(() => {
    if (
      community.publicKey === savedVotes?.[0]?.community &&
      community?.featureVotes?.toNumber() !== savedVotes?.[0]?.sntAmount.toNumber()
    ) {
      setVerifiedVotes(savedVotes?.[0]?.sntAmount)
    }
  }, [savedVotes])

  const setNewModal = (val: boolean) => {
    setShowConfirmModal(val)
    setShowFeatureModal(false)
  }

  useEffect(() => {
    console.log('============= CAST VOTES USE EFFECT ==========')
    if (castVotes.state) {
      console.log(castVotes.state)
    }
    if (castVotes.events) {
      console.log(castVotes.events)
    }
  }, [castVotes])

  return (
    <CardVoteBlock>
      <CardHeadingFeature style={{ fontWeight: 'bold', fontSize: '17px' }}>{heading}</CardHeadingFeature>

      <FeatureVote>
        <FeatureIcon>{icon}</FeatureIcon>

        {!inFeatured && community?.featureVotes && (
          <FeatureText>
            <span>{addCommas(community?.featureVotes.toNumber() + verifiedVotes.toNumber())}</span> SNT votes for this
            community
          </FeatureText>
        )}
        <div>
          Waku votes: {community?.featureVotes?.toNumber()}
          <br />
          Contract votes: {verifiedVotes.toNumber()}
        </div>
        <button
          onClick={() => {
            console.log('castedVotes')
            console.log(votesToSend)
            castVotes.send(votesToSend)
          }}
        >
          Verify
        </button>
      </FeatureVote>

      <FeatureVoteMobile>
        {inFeatured && (
          <FeatureText>
            {icon} {heading}
          </FeatureText>
        )}

        {!inFeatured && community?.featureVotes && (
          <FeatureTextWeekly>
            {icon}{' '}
            <span style={{ color: '#676868', fontWeight: 'normal', marginLeft: '4px' }}>Weekly Feature Vote: </span>
            <span>{addCommas(community.featureVotes.toNumber() + verifiedVotes.toNumber())}</span> SNT
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
        <FeatureBtn
          disabled={!account || inFeatured || featuredVotingState === 'verification' || featuredVotingState === 'ended'}
          onClick={() => setShowFeatureModal(true)}
        >
          Feature this community! <span style={{ fontSize: '20px' }}>⭐️</span>
        </FeatureBtn>
      </div>
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
