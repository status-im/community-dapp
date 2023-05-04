import React from 'react'
import styled from 'styled-components'
import { ColumnFlexDiv } from '../../constants/styles'
import { CommunityDetail } from '../../models/community'
import { ButtonSecondary } from '../Button'
import { LinkExternal } from '../Link'

interface VoteConfirmModalProps {
  community: CommunityDetail
  selectedVote: {
    verb: string
  }
  setShowModal: (val: boolean) => void
}

export function VoteConfirmModal({ community, selectedVote, setShowModal }: VoteConfirmModalProps) {
  return (
    <ColumnFlexDiv>
      {community.icon && <ConfirmLogo src={community.icon} alt={`${community.name} logo`} />}
      <ConfirmText>
        You voted{' '}
        <span>
          {selectedVote.verb} {community.name}
        </span>
        {'.'}
        {/* will be casted after 10 confirmations. */}
      </ConfirmText>
      <EtherscanLink href="#" target="_blank">
        View on Etherscan
      </EtherscanLink>
      <ConfirmBtn onClick={() => setShowModal(false)}>
        OK, let’s move on! <span>🤙</span>
      </ConfirmBtn>
    </ColumnFlexDiv>
  )
}

const ConfirmLogo = styled.img`
  width: 64px !important;
  height: 64px !important;
  border-radius: 50%;
  margin-bottom: 32px;
`

const ConfirmText = styled.div`
  max-width: 272px;
  margin-bottom: 32px;
  text-align: center;
  line-height: 22px;

  & > span {
    font-weight: bold;
  }
`

const EtherscanLink = styled(LinkExternal)`
  margin-bottom: 32px;
`

export const ConfirmBtn = styled(ButtonSecondary)`
  width: 100%;
  padding: 11px 0;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;

  & > span {
    font-size: 20px;
  }
`
