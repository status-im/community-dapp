import { useNotifications } from '@usedapp/core'
import React from 'react'
import styled from 'styled-components'
import { AnimationNotification, AnimationNotificationMobile } from '../constants/animation'
import { useContracts } from '../hooks/useContracts'
import { NotificationItem, NotificationItemPlain } from './NotificationItem'

interface Props {
  type: 'votes' | 'featured'
}

export function NotificationsList({ type }: Props) {
  const { notifications } = useNotifications()
  const { votingContract, featuredVotingContract } = useContracts()

  const getParsedLog = (log: any, type: 'votes' | 'featured') => {
    switch (type) {
      case 'votes': {
        return votingContract.interface.parseLog(log)
      }
      case 'featured': {
        return featuredVotingContract.interface.parseLog(log)
      }
    }
  }

  const parseVoting = (parsedLog: any) => {
    let text = ''
    if (parsedLog.name === 'VotingRoomStarted') {
      text = ' voting room started.'
    }
    if (parsedLog.name === 'VotingRoomFinalized') {
      if (parsedLog.args.passed == true) {
        if (parsedLog.args.voteType === 1) {
          text = ' is now in the communities directory!'
        }

        if (parsedLog.args.voteType === 0) {
          text = ' is now removed from communities directory!'
        }
      }
    }

    return text
  }

  const parseFeatured = (parsedLog: any) => {
    let text = ''
    if (parsedLog.name === 'VotingStarted') {
      text = 'Featured voting started.'
    }
    if (parsedLog.name === 'VotingFinalized') {
      text = 'Featured voting was finalized.'
    }

    return text
  }

  return (
    <NotificationsWrapper>
      {notifications.map((notification) => {
        if ('receipt' in notification) {
          return notification.receipt.logs.map((log) => {
            const parsedLog = getParsedLog(log, type)

            let res = ''
            if (type === 'votes') {
              res = parseVoting(parsedLog)
            } else if (type === 'featured') {
              res = parseFeatured(parsedLog)
            }
            if (res && type === 'votes') {
              return (
                <NotificationItem
                  key={log.transactionHash}
                  publicKey={parsedLog.args.publicKey}
                  text={res}
                  transaction={notification.transaction}
                />
              )
            } else if (res && type === 'featured') {
              return <NotificationItemPlain key={log.transactionHash} text={res} />
            }
          })
        }
      })}
    </NotificationsWrapper>
  )
}

const NotificationsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  position: fixed;
  top: 191px;
  right: 16px;
  flex-direction: column;
  transition: all 0.3s;
  animation: ${AnimationNotification} 2s ease;

  @media (max-width: 600px) {
    top: unset;
    right: unset;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    animation: ${AnimationNotificationMobile} 2s ease;
  }
`
