import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useEthers, shortenAddress } from '@usedapp/core'
import infoIcon from '../assets/images/info.svg'
import { Colors } from '../constants/styles'
import { AccountWrap, Account, ButtonDisconnect, ButtonConnect, StyledNavLink } from '../components/top/TopBar'

export const ConnectMobile = () => {
  const { account, deactivate } = useEthers()
  const [isOpened, setIsOpened] = useState(false)

  useEffect(() => {
    window.addEventListener('click', () => setIsOpened(false))
    return () => {
      window.removeEventListener('click', () => setIsOpened(false))
    }
  }, [])

  return (
    <MenuContentMobile>
      <StyledNavLinkInfo activeClassName="active-page" to="/info" />
      {account ? (
        <AccountWrap>
          <Account
            onClick={(e) => {
              e.stopPropagation()
              setIsOpened(!isOpened)
            }}
          >
            {shortenAddress(account)}
          </Account>
          <ButtonDisconnect className={isOpened ? 'opened' : undefined} onClick={() => deactivate()}>
            Disconnect
          </ButtonDisconnect>
        </AccountWrap>
      ) : (
        <ButtonConnect text={'Connect'} />
      )}
    </MenuContentMobile>
  )
}

const MenuContentMobile = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 16px;
  background-color: ${Colors.GrayLight};
`
const StyledNavLinkInfo = styled(StyledNavLink)`
  width: 20px;
  height: 20px;
  padding: 0;
  background-image: url(${infoIcon});
  background-repeat: no-repeat;

  &.active-page::after {
    width: 0;
  }
`
