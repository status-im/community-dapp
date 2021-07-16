import React, { useState } from 'react'
import { PageInfo } from '../PageInfo'
import { useEthers } from '@usedapp/core'
import { Modal } from '../Modal'
import { ProposeModal } from '../card/ProposeModal'
import { VoteConfirmModal } from '../card/VoteConfirmModal'
import { CommunityDetail } from '../../models/community'
import { ProposeButton } from '../Button'
import { ConnectButton } from '../ConnectButton'
import styled from 'styled-components'
import { Colors } from '../../constants/styles'

export function VotingEmpty() {
  const { account } = useEthers()
  const [showProposeModal, setShowProposeModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [communityFound, setCommunityFound] = useState<undefined | CommunityDetail>(undefined)

  const setNext = (val: boolean) => {
    setShowConfirmModal(val)
    setShowProposeModal(false)
  }

  return (
    <VotingEmptyWrap>
      <p>😲</p>
      <PageInfo
        heading="There are no ongoing votes at the moment!"
        text="If you know of a community that you think should be added to the Community Directory, feel free to propose it's addition by starting a vote"
      />
      {showProposeModal && (
        <Modal heading="Add community to directory" setShowModal={setShowProposeModal}>
          <ProposeModal
            availableAmount={65245346}
            setShowConfirmModal={setNext}
            setCommunityFound={setCommunityFound}
            communityFound={communityFound}
          />
        </Modal>
      )}
      {showConfirmModal && communityFound && (
        <Modal setShowModal={setShowConfirmModal}>
          <VoteConfirmModal
            community={communityFound}
            selectedVote={{ verb: 'to add' }}
            setShowModal={setShowConfirmModal}
          />
        </Modal>
      )}

      {account ? (
        <ProposeButton onClick={() => setShowProposeModal(true)}>Propose community</ProposeButton>
      ) : (
        <ConnectButton />
      )}
    </VotingEmptyWrap>
  )
}

const VotingEmptyWrap = styled.div`
  position: absolute;
  top: 96px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100vh - 96px);
  background: ${Colors.White};
  z-index: 99;

  & > p {
    font-weight: bold;
    font-size: 64px;
    line-height: 64%;
    margin-bottom: 24px;
  }
`
