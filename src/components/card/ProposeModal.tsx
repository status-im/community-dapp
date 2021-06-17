import React from 'react'
import styled from 'styled-components'
import { getCommunityDetails } from '../../helpers/apiMock'
import { ButtonPrimary } from '../Button'
import { CardCommunity } from '../Card'
import { Input } from '../Input'
import { VotePropose } from '../votes/VotePropose'

interface ProposeModalProps {
  availableAmount: number
  setShowConfirmModal: (val: boolean) => void
  setPublicKey: (publicKey: string) => void
  publicKey: string
}

export function ProposeModal({ availableAmount, setShowConfirmModal, setPublicKey, publicKey }: ProposeModalProps) {
  const communityFound = getCommunityDetails(publicKey)

  return (
    <CommunityProposing>
      <CommunityKeyLabel>
        Community public key
        <CommunityKey
          value={publicKey}
          placeholder="E.g. 0xbede83eef5d82c4dd5d82c4dd5fa837ad"
          onChange={(e) => {
            setPublicKey(e.currentTarget.value)
          }}
        ></CommunityKey>
      </CommunityKeyLabel>

      {publicKey && communityFound && (
        <div>
          <CardCommunity community={communityFound} />
          <VoteProposeWrap>
            <VotePropose availableAmount={availableAmount} />
          </VoteProposeWrap>
        </div>
      )}

      {!communityFound && (
        <ProposingInfo>
          <span>ℹ️</span>
          <InfoText>To propose a community, it must have at least 42 members and have a ENS domain.</InfoText>
        </ProposingInfo>
      )}

      <ProposingBtn
        type="submit"
        disabled={!communityFound}
        onSubmit={() => setShowConfirmModal(true)}
        onClick={() => setShowConfirmModal(true)}
      >
        Confirm vote to add community
      </ProposingBtn>
    </CommunityProposing>
  )
}

const CommunityProposing = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const CommunityKey = styled(Input)`
  width: 100%;
  margin-top: 10px;
  margin-bottom: 32px;
  font-size: 15px;
  line-height: 22px;
`
const CommunityKeyLabel = styled.label`
  width: 100%;
  font-size: 15px;
  line-height: 22px;
`

const VoteProposeWrap = styled.div`
  margin-top: 32px;
`

const ProposingInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 32px;

  & > span {
    font-size: 24px;
    line-height: 32px;
    margin-right: 16px;
  }
`

const InfoText = styled.div`
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1px;
`

const ProposingBtn = styled(ButtonPrimary)`
  width: 100%;
  padding: 11px 0;
`
