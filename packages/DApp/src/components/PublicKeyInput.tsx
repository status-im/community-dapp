import React from 'react'
import styled from 'styled-components'
import { Input } from './Input'

interface PublicKeyInputProps {
  publicKey: string
  setPublicKey: (val: string) => void
}

export function PublicKeyInput({ publicKey, setPublicKey }: PublicKeyInputProps) {
  return (
    <CommunityKeyLabel>
      Community public key
      <CommunityKey
        value={publicKey}
        placeholder="E.g. 0xbede83eef5d82c4dd5d82c4dd5fa837ad"
        onChange={(e) => {
          setPublicKey(e.currentTarget.value)
        }}
      ></CommunityKey>
    </CommunityKeyLabel>
  )
}

const CommunityKey = styled(Input)`
  width: 100%;
  margin-top: 10px;
  margin-bottom: 32px;
  font-size: 15px;
  line-height: 22px;
`
const CommunityKeyLabel = styled.label`
  width: 100%;
  font-size: 15px;
  line-height: 22px;
`
