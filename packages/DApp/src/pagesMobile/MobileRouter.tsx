import React from 'react'
import { Redirect, Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import styled from 'styled-components'
import { VotingRoomMobile } from '../componentsMobile/VotingRoomMobile'
import { DirectoryMobile } from './DirectoryMobile'
import { InfoMobile } from './InfoMobile'
import { VotesMobile } from './VotesMobile'

export const MobileRouter = () => (
  <BrowserRouter>
    <PageContentMobile>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/votes" />} />
        <Route exact path="/votingRoom/:id" component={VotingRoomMobile} />
        <Route exact path="/votes" component={VotesMobile} />
        <Route exact path="/directory" component={DirectoryMobile} />
        <Route exact path="/info" component={InfoMobile} />
      </Switch>
    </PageContentMobile>
  </BrowserRouter>
)

const PageContentMobile = styled.div`
  height: 100%;
  position: relative;
`
