import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { useEthers, shortenAddress } from '@usedapp/core'
import { Logo } from './Logo'
import { Colors } from '../../constants/styles'
import { Animation } from '../../constants/animation'
import { StatusConnectButton } from '../StatusConnectButton'

export function TopBar() {
  const { account, deactivate } = useEthers()
  const [isOpened, setIsOpened] = useState(false)

  useEffect(() => {
    window.addEventListener('click', () => setIsOpened(false))
    return () => {
      window.removeEventListener('click', () => setIsOpened(false))
    }
  }, [])

  return (
    <Header>
      <HeaderWrapper>
        <Logo />
        <MenuContent>
          <Navigation>
            <NavLinks>
              <NavItem>
                <StyledNavLink activeClassName="active-page" to="/votes">
                  Votes
                </StyledNavLink>
              </NavItem>
              <NavItem>
                <StyledNavLink activeClassName="active-page" to="/directory">
                  Directory
                </StyledNavLink>
              </NavItem>
              <NavItem>
                <StyledNavLink activeClassName="active-page" to="/info">
                  Info
                </StyledNavLink>
              </NavItem>
            </NavLinks>
          </Navigation>

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
            <ButtonConnect>Connect</ButtonConnect>
          )}
        </MenuContent>
      </HeaderWrapper>
    </Header>
  )
}

const Header = styled.header`
  height: 96px;
  background-color: ${Colors.GrayLight};
  border-bottom: 1px solid rgba(189, 93, 226, 0.15);
`

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1440px;
  height: 100%;
  padding: 0 40px;
  margin: 0 auto;
`

const MenuContent = styled.div`
  display: flex;
  align-items: center;
  align-self: stretch;
  justify-content: space-between;
  flex: 1;
  max-width: 780px;
  background-color: ${Colors.GrayLight};
`

const Navigation = styled.nav`
  max-width: 500px;
  width: 100%;
`

const NavLinks = styled.ul`
  display: flex;
  justify-content: space-between;
  height: 100%;
  color: ${Colors.Black};
`

const NavItem = styled.li`
  width: 124px;
  text-align: center;
`

const StyledNavLink = styled(NavLink)`
  position: relative;
  color: ${Colors.Black};
  font-size: 17px;
  line-height: 18px;
  padding: 39px 0 37px;

  &:hover {
    color: ${Colors.Violet};
  }

  &:active {
    color: ${Colors.Black};
  }

  &.active-page::after {
    content: '';
    width: 124px;
    height: 2px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${Colors.Violet};
    bacground-position: center;
    border-radius: 1px;
    animation: ${Animation} 0.25s linear;
  }
`
const ButtonConnect = styled(StatusConnectButton)`
  padding: 10px 27px;
`

const AccountWrap = styled.div`
  position: relative;
`

const Account = styled.button`
  position: relative;
  font-weight: 500;
  font-size: 13px;
  line-height: 22px;
  color: ${Colors.Black};
  padding: 11px 12px 11px 28px;
  background: ${Colors.White};
  border: 1px solid ${Colors.GrayBorder};
  border-radius: 21px;
  outline: none;

  &:focus,
  &:active {
    border: 1px solid ${Colors.Violet};
  }

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    position: absolute;
    top: 50%;
    left: 17px;
    transform: translate(-50%, -50%);
    background-color: ${Colors.Green};
    bacground-position: center;
    border-radius: 50%;
  }
`
const ButtonDisconnect = styled.button`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  text-align: center;
  padding: 12px 32px;
  cursor: pointer;
  color: ${Colors.VioletDark};
  background: ${Colors.White};
  border: 1px solid ${Colors.GrayBorder};
  border-radius: 16px 4px 16px 16px;
  box-shadow: 0px 2px 16px rgba(0, 9, 26, 0.12);
  transition: all 0.3s;
  outline: none;

  &:hover {
    background: ${Colors.VioletSecondaryDark};
  }

  &:active {
    background: ${Colors.VioletSecondaryLight};
  }

  &.opened {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    z-index: 10;
  }
`
