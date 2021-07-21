import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { GlobalStyle } from './providers/GlobalStyle'
import { NotificationsList } from './components/NotificationsList'
import { MobileRouter } from './pagesMobile/MobileRouter'
import { DesktopRouter } from './pages/DesktopRouter'

export function App() {
  const [mobileVersion, setMobileVersion] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setMobileVersion(true)
      } else {
        setMobileVersion(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Page>
      <GlobalStyle />
      {mobileVersion ? <MobileRouter /> : <DesktopRouter />}
      <NotificationsList />
    </Page>
  )
}

const Page = styled.div`
  height: 100%;
`
