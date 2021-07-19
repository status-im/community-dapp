import React, { useEffect, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import styled from 'styled-components'
import { GlobalStyle } from './providers/GlobalStyle'
import { TopBar } from './components/top/TopBar'
import { Votes } from './pages/Votes'
import { Directory } from './pages/Directory'
import { Info } from './pages/Info'
import { NotificationsList } from './components/NotificationsList'
import { VotesMobile } from './pages/VotesMobile'
import { DirectoryMobile } from './pages/DirectoryMobile'
import { InfoMobile } from './pages/InfoMobile'

export function App() {
  const [mobileVersion, setMobileVersion] = useState(false)

  useEffect(() => {
    if (window.innerWidth < 600) {
      setMobileVersion(true)
    } else {
      setMobileVersion(false)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setMobileVersion(true)
      } else {
        setMobileVersion(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [window.innerWidth])

  if (mobileVersion) {
    return (
      <Page>
        <BrowserRouter>
          <GlobalStyle />

          <PageContentMobile>
            <Switch>
              <Route exact path="/votes" component={VotesMobile} />
              <Route exact path="/directory" component={DirectoryMobile} />
              <Route exact path="/info" component={InfoMobile} />
            </Switch>
            <Redirect exact from="/" to="/votes" />
          </PageContentMobile>
        </BrowserRouter>
        <NotificationsList />
      </Page>
    )
  } else {
    return (
      <Page>
        <BrowserRouter>
          <GlobalStyle />
          <TopBar />
          <PageContent>
            <Switch>
              <Route exact path="/votes" component={Votes} />
              <Route exact path="/directory" component={Directory} />
              <Route exact path="/info" component={Info} />
            </Switch>
            <Redirect exact from="/" to="/votes" />
          </PageContent>
        </BrowserRouter>
        <NotificationsList />
      </Page>
    )
  }
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
const PageContentMobile = styled.div`
  height: 100%;
  padding: 196px 16px 16px;
  position: relative;
`
