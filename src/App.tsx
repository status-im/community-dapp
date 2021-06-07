import React from 'react'
import { Redirect, Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'

import styled from 'styled-components'
import { GlobalStyle } from './providers/GlobalStyle'
import { TopBar } from './components/top/TopBar'
import { Votes } from './pages/Votes'
import { Directory } from './pages/Directory'
import { Info } from './pages/Info'

export function App() {
  return (
    <Page>
      <BrowserRouter>
        <GlobalStyle />
        <TopBar />
        <Switch>
          <Route exact path="/votes" component={Votes} />
          <Route exact path="/directory" component={Directory} />
          <Route exact path="/info" component={Info} />
        </Switch>
        <Redirect exact from="/" to="/votes" />
      </BrowserRouter>
    </Page>
  )
}

const Page = styled.div`
  height: 100%;
`
