import React, { useState } from 'react'
import { InfoWrap, ConnectButton, ProposeButton, PageInfo } from '../PageInfo'
import { useEthers } from '@usedapp/core'
import { Modal } from '../Modal'
import { ProposeModal } from '../card/ProposeModal'
import { VoteConfirmModal } from '../card/VoteConfirmModal'
import { CommunityDetail } from '../../models/community'

export function VotesInfo() {
  const { account } = useEthers()
  const [showProposeModal, setShowProposeModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [communityFound, setCommunityFound] = useState<undefined | CommunityDetail>(undefined)

  const setNext = (val: boolean) => {
    setShowConfirmModal(val)
    setShowProposeModal(false)
  }

  return (
    <InfoWrap>
      <PageInfo
        heading="Ongoing Votes"
        text="Help curate the Status Communities directory by voting which communities should be included"
      />
      {showProposeModal && (
        <Modal heading="Add community to directory" setShowModal={setShowProposeModal}>
          <ProposeModal
            availableAmount={65245346}
            setShowConfirmModal={setNext}
            setCommunityFound={setCommunityFound}
            communityFound={communityFound}
          />{' '}
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

      {account ? <ProposeButton onClick={() => setShowProposeModal(true)} /> : <ConnectButton />}
    </InfoWrap>
  )
}
