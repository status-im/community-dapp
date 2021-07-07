import React from 'react'
import { Redirect, Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'

import styled from 'styled-components'
import { GlobalStyle } from './providers/GlobalStyle'
import { TopBar } from './components/top/TopBar'
import { Votes } from './pages/Votes'
import { Directory } from './pages/Directory'
import { Info } from './pages/Info'
import { NotificationItem } from './components/NotificationItem'

export function App() {
  return (
    <Page>
      <BrowserRouter>
        <GlobalStyle />
        <TopBar />
        <PageContent>
          <NotificationItem />
          <Switch>
            <Route exact path="/votes" component={Votes} />
            <Route exact path="/directory" component={Directory} />
            <Route exact path="/info" component={Info} />
          </Switch>
          <Redirect exact from="/" to="/votes" />
        </PageContent>
      </BrowserRouter>
    </Page>
  )
}

const Page = styled.div`
  height: 100%;
`
const PageContent = styled.div`
  height: 100%;
  max-width: 996px;
  padding: 96px 32px 32px;
  margin: 0 auto;
  position: relative;
`
