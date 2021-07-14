import { useNotifications } from '@usedapp/core'
import React from 'react'
import styled from 'styled-components'
import { useContracts } from '../hooks/useContracts'
import { NotificationItem } from './NotificationItem'

export function NotificationsList() {
  const { notifications } = useNotifications()
  const { votingContract } = useContracts()

  return (
    <NotificationsWrapper>
      {notifications.map((notification) => {
        if ('receipt' in notification) {
          return notification.receipt.logs.map((log) => {
            const parsedLog = votingContract.interface.parseLog(log)

            let text
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
            if (text) {
              return <NotificationItem key={log.transactionHash} publicKey={parsedLog.args.publicKey} text={text} />
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
  top: 180px;
  right: 16px;
  flex-direction: column;
`
