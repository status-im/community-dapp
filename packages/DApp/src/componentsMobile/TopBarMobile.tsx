import React from 'react'
import styled from 'styled-components'
import { Colors } from '../constants/styles'
import { Header, StyledNavLink } from '../components/top/TopBar'
import { PageInfo } from '../components/PageInfo'
import { ConnectMobile } from './ConnectMobile'

interface TopBarMobileProps {
  heading: string
  text: string
}

export const TopBarMobile = ({ heading, text }: TopBarMobileProps) => {
  return (
    <HeaderMobile>
      <HeaderWrapperMobile>
        <ConnectMobile />
        <PageInfo heading={heading} text={text} />
        <NavigationMobile>
          <NavLinks>
            <NavItemMobile>
              <StyledNavLinkMobile activeClassName="active-page" to="/votes">
                Votes
              </StyledNavLinkMobile>
            </NavItemMobile>
            <NavItemMobile>
              <StyledNavLinkMobile activeClassName="active-page" to="/directory">
                Directory
              </StyledNavLinkMobile>
            </NavItemMobile>
          </NavLinks>
        </NavigationMobile>
      </HeaderWrapperMobile>
    </HeaderMobile>
  )
}

const HeaderMobile = styled(Header)`
  height: 186px;

  @media (max-width: 340px) {
    height: 205px;
  }
`

const HeaderWrapperMobile = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
`

const NavigationMobile = styled.nav`
  width: 100%;
  height: 41px;
  position: absolute;
  bottom: 0;
`

const NavLinks = styled.ul`
  display: flex;
  justify-content: space-between;
  height: 100%;
  color: ${Colors.Black};
`

const NavItemMobile = styled.li`
  width: 50%;
  display: flex;
  align-items: center;
`

const StyledNavLinkMobile = styled(StyledNavLink)`
  width: 100%;
  font-size: 15px;
  line-height: 22px;
  padding: 12px 0;
  text-align: center;

  &.active-page::after {
    content: '';
    width: 100%;
    height: 2px;
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);

    @media (max-width: 600px) {
      width: 100%;
    }
  }
`
