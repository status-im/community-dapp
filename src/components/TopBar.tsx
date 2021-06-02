import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { useEthers, shortenAddress } from '@usedapp/core'

export function TopBar() {
  const { account, activateBrowserWallet } = useEthers()

  return (
    <Header>
      <StyledNavLink activeClassName="active-page" to="/votes">
        Votes
      </StyledNavLink>
      <StyledNavLink activeClassName="active-page" to="/directory">
        Directory
      </StyledNavLink>
      <StyledNavLink activeClassName="active-page" to="/info">
        Info
      </StyledNavLink>
      {account ? (
        <div>{shortenAddress(account)}</div>
      ) : (
        <button onClick={() => activateBrowserWallet()}>Activate browser wallet</button>
      )}
    </Header>
  )
}

const Header = styled.header`
  backgorund-color: grey;
`

const StyledNavLink = styled(NavLink)``
