import React, { useState } from 'react'
import styled from 'styled-components'
import { Colors } from '../../constants/styles'
import { CommunityDetail, CurrentVoting } from '../../models/community'
import { LinkExternal, LinkInternal } from '../Link'
import { Modal } from '../Modal'
import { VoteConfirmModal } from './VoteConfirmModal'
import binIcon from '../../assets/images/bin.svg'
import { RemoveModal } from './RemoveModal'
import { CardHeading } from '../Card'
import { useEthers } from '@usedapp/core'

interface CardCommunityProps {
  community: CommunityDetail
  showRemoveButton?: boolean
  customHeading?: string
  customStyle?: boolean
  currentVoting?: CurrentVoting
}

export const CardCommunity = ({
  community,
  showRemoveButton,
  customHeading,
  customStyle,
  currentVoting,
}: CardCommunityProps) => {
  const { account } = useEthers()

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const isDisabled = community.votingHistory.length === 0

  const setNewModal = (val: boolean) => {
    setShowConfirmModal(val)
    setShowRemoveModal(false)
  }

  return (
    <CardCommunityBlock className={customStyle ? 'notModal' : ''}>
      {showHistoryModal && (
        <Modal heading={`${community.name} voting history`} setShowModal={setShowHistoryModal}>
          <VoteHistoryTable>
            <tbody>
              <tr>
                <VoteHistoryTableColumnCell>Date</VoteHistoryTableColumnCell>
                <VoteHistoryTableColumnCell>Type</VoteHistoryTableColumnCell>
                <VoteHistoryTableColumnCell>Result</VoteHistoryTableColumnCell>
              </tr>
              {community.votingHistory.map((vote) => {
                return (
                  <tr key={vote.ID}>
                    <VoteHistoryTableCell>{vote.date.toLocaleDateString()}</VoteHistoryTableCell>
                    <VoteHistoryTableCell>{vote.type}</VoteHistoryTableCell>
                    <VoteHistoryTableCell>{vote.result}</VoteHistoryTableCell>
                  </tr>
                )
              })}
            </tbody>
          </VoteHistoryTable>
        </Modal>
      )}
      {showRemoveModal && (
        <Modal
          heading="Remove from directory?"
          setShowModal={(val: boolean) => {
            setShowRemoveModal(val)
          }}
        >
          <RemoveModal community={community} availableAmount={549739700} setShowConfirmModal={setNewModal} />{' '}
        </Modal>
      )}
      {showConfirmModal && (
        <Modal setShowModal={setNewModal}>
          <VoteConfirmModal community={community} selectedVote={{ verb: 'to remove' }} setShowModal={setNewModal} />
        </Modal>
      )}
      <Community>
        <CardLogoWrap>
          {' '}
          <CardLogo src={community.icon} alt={`${community.name} logo`} />
          {showRemoveButton && !currentVoting && (
            <RemoveBtnMobile onClick={() => setShowRemoveModal(true)} disabled={!account} />
          )}
        </CardLogoWrap>

        <CommunityInfo>
          <CardTop>
            <CardHeading>{customHeading ? customHeading : community.name}</CardHeading>
            {showRemoveButton && !currentVoting && (
              <RemoveBtn onClick={() => setShowRemoveModal(true)} disabled={!account} />
            )}
          </CardTop>
          <CardText>{community.description}</CardText>
          <CardTags>
            {community.tags.map((tag, key) => (
              <Tag key={key}>
                <p>{tag}</p>
              </Tag>
            ))}
          </CardTags>
        </CommunityInfo>
      </Community>
      <CardLinks className={customStyle ? 'notModal' : ''}>
        <LinkExternal>Visit community</LinkExternal>
        <LinkExternal>Etherscan</LinkExternal>
        <LinkInternal onClick={() => setShowHistoryModal(true)} disabled={isDisabled}>
          Voting history
        </LinkInternal>
      </CardLinks>
    </CardCommunityBlock>
  )
}

export const CardCommunityBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;

  &.notModal {
    @media (max-width: 768px) {
      align-items: flex-end;
    }
  }
`

const Community = styled.div`
  display: flex;
  margin-bottom: 16px;
`

const CommunityInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const CardLogoWrap = styled.div`
  width: 64px;
  height: 64px;
  object-fit: cover;
  margin-right: 16px;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 40px;
    height: 76px;
  }
`
const CardLogo = styled.img`
  width: 64px !important;
  height: 64px !important;
  border-radius: 50%;

  @media (max-width: 768px) {
    width: 40px !important;
    height: 40px !important;
  }
`

const CardTop = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  line-height: 24px;
`

const RemoveBtn = styled.button`
  width: 16px;
  height: 16px;
  margin-left: 16px;
  background-image: url(${binIcon});
  background-size: cover;

  &:disabled {
    filter: grayscale(1);
  }

  @media (max-width: 768px) {
    display: none;
  }
`

const RemoveBtnMobile = styled(RemoveBtn)`
  display: none;

  @media (max-width: 768px) {
    display: block;
    margin-left: 0;
  }
`

const CardText = styled.p`
  line-height: 22px;
  margin-bottom: 8px;
`

const CardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const Tag = styled.div`
  margin: 0 8px 8px 0;
  padding: 0 10px;
  border: 1px solid ${Colors.VioletDark};
  box-sizing: border-box;
  border-radius: 10px;
  color: ${Colors.VioletDark};
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
`
export const CardLinks = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 15px;
  line-height: 22px;

  &.notModal {
    @media (max-width: 768px) {
      max-width: calc(100% - 60px);
    }
  }
`

const VoteHistoryTable = styled.table`
  width: 100%;
`

const VoteHistoryTableColumnCell = styled.td`
  font-weight: bold;
  padding-bottom: 24px;
  padding-right: 112px;
  width: 65px;
`

const VoteHistoryTableCell = styled.td`
  width: 65px;
  padding-bottom: 18px;
  padding-right: 112px;
`
