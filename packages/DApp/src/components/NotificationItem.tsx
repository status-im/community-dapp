import type { TransactionResponse } from '@ethersproject/providers'

import React, { useState } from 'react'
import styled from 'styled-components'
import { Colors } from '../constants/styles'
import { useCommunities } from '../hooks/useCommunities'
import { LinkExternal } from './Link'
import { CloseButton } from './Modal'
import { getExplorerTransactionLink } from '@usedapp/core'

interface NotificationItemProps {
  transaction: TransactionResponse
  publicKey: string
  text: string
}

export function NotificationItem({ publicKey, text, transaction }: NotificationItemProps) {
  const [show, setShow] = useState(true)
  const [communityDetails] = useCommunities([publicKey])

  if (show && communityDetails) {
    return (
      <NotificationBlock>
        <NotificationLogoWrap>
          {communityDetails.icon && <NotificationLogo src={communityDetails.icon} />}
        </NotificationLogoWrap>

        <NotificationContent>
          <NotificationText>
            <span>{communityDetails.name}</span> {text}
          </NotificationText>
          <NotificationLink href={getExplorerTransactionLink(transaction.hash, transaction.chainId)}>
            View on Etherscan
          </NotificationLink>
        </NotificationContent>
        <NotificationCloseButton onClick={() => setShow(false)} />
      </NotificationBlock>
    )
  }

  return null
}

interface NotificationItemPlainProps {
  text: string
}

export function NotificationItemPlain({ text }: NotificationItemPlainProps) {
  const [show, setShow] = useState(true)

  if (show) {
    return (
      <NotificationBlock>
        <NotificationContent>
          <NotificationText>{text}</NotificationText>
        </NotificationContent>
        <NotificationCloseButton onClick={() => setShow(false)} />
      </NotificationBlock>
    )
  }

  return null
}

const NotificationBlock = styled.div`
  display: flex;
  background: ${Colors.VioletSecondaryLight};
  padding: 16px 47px 16px 16px;
  width: 345px;
  border-radius: 16px;
  filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.15));
  z-index: 9999;
`

const NotificationLogoWrap = styled.div`
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-right: 8px;
`
const NotificationLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
`
const NotificationText = styled.p`
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1px;
  margin-bottom: 8px;

  & > span {
    font-weight: 600;
  }
`

const NotificationLink = styled(LinkExternal)`
  font-size: 12px;
  line-height: 22px;
`

const NotificationCloseButton = styled(CloseButton)`
  top: unset;
  right: 13px;
  bottom: 50%;
  transform: translateY(50%);
`
