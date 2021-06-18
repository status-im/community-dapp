import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { useEthers, shortenAddress } from '@usedapp/core'
import { Logo } from './Logo'
import { Colors } from '../../constants/styles'
import { Animation } from '../../constants/animation'
import { StatusConnectButton } from '../StatusConnectButton'

export function TopBar() {
  const { account } = useEthers()

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

          {account ? <Account>{shortenAddress(account)}</Account> : <ButtonConnect>Connect</ButtonConnect>}
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
const Account = styled.button`
  font-weight: 500;
  font-size: 13px;
  line-height: 22px;
  color: ${Colors.Black};
  padding: 11px 12px 11px 17px;
  background: ${Colors.White};
  border: 1px solid ${Colors.GrayBorder};
  border-radius: 21px;
`
