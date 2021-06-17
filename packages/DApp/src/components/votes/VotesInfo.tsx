import React, { useState } from 'react'
import { InfoWrap, ConnectButton, ProposeButton, PageInfo } from '../PageInfo'
import { useEthers } from '@usedapp/core'
import { Modal } from '../Modal'
import { ProposeModal } from '../card/ProposeModal'
import { VoteConfirmModal } from '../card/VoteConfirmModal'
import { getCommunityDetails } from '../../helpers/apiMock'

export function VotesInfo() {
  const { account } = useEthers()
  const [showProposeModal, setShowProposeModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [publicKey, setPublicKey] = useState('')

  const setNext = (val: boolean) => {
    setShowConfirmModal(val)
    setShowProposeModal(false)
  }

  const clearKey = (val: boolean) => {
    setShowConfirmModal(val)
    setPublicKey('')
  }

  return (
    <InfoWrap>
      <PageInfo
        heading="Ongoing Votes"
        text="Help curate the Status Communities directory by voting which communities should be included"
      />
      {showProposeModal && (
        <Modal
          heading="Add community to directory"
          setShowModal={(val: boolean) => {
            setShowProposeModal(val)
            setPublicKey('')
          }}
        >
          <ProposeModal
            availableAmount={65245346}
            setShowConfirmModal={setNext}
            setPublicKey={setPublicKey}
            publicKey={publicKey}
          />{' '}
        </Modal>
      )}
      {showConfirmModal && (
        <Modal setShowModal={clearKey}>
          <VoteConfirmModal
            community={getCommunityDetails(publicKey)}
            selectedVote={{ verb: 'to add' }}
            setShowModal={clearKey}
          />
        </Modal>
      )}

      {account ? <ProposeButton onClick={() => setShowProposeModal(true)} /> : <ConnectButton />}
    </InfoWrap>
  )
}
