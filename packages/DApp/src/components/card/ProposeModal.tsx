import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ButtonPrimary } from '../Button'
import { CardCommunity } from './CardCommunity'
import { Input } from '../Input'
import { VotePropose } from '../votes/VotePropose'
import { Warning } from '../votes/VoteWarning'
import { ConfirmBtn } from './VoteConfirmModal'
import { useContractCall, useContractFunction } from '@usedapp/core'
import { useContracts } from '../../hooks/useContracts'
import { CommunityDetail } from '../../models/community'
import { CommunitySkeleton } from '../skeleton/CommunitySkeleton'
import { useCommunityDetails } from '../../hooks/useCommunityDetails'
import { ColumnFlexDiv } from '../../constants/styles'
import { BigNumber } from 'ethers'

interface PublicKeyInputProps {
  publicKey: string
  setPublicKey: (val: string) => void
}

function PublicKeyInput({ publicKey, setPublicKey }: PublicKeyInputProps) {
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

interface ProposeModalProps {
  availableAmount: number
  setShowConfirmModal: (val: boolean) => void
  setCommunityFound: (community: CommunityDetail | undefined) => void
  communityFound: CommunityDetail | undefined
}

export function ProposeModal({
  availableAmount,
  setShowConfirmModal,
  setCommunityFound,
  communityFound,
}: ProposeModalProps) {
  const [proposingAmount, setProposingAmount] = useState(0)
  const [publicKey, setPublicKey] = useState('')
  const [communityInDirectory, setCommunityInDirectory] = useState(false)
  const [communityUnderVote, setCommunityUnderVote] = useState(false)
  const loading = useCommunityDetails(publicKey, setCommunityFound)
  const { votingContract, directoryContract } = useContracts()
  const { send, state } = useContractFunction(votingContract, 'initializeVotingRoom')

  const [isCommunityInDirectory] = useContractCall({
    abi: directoryContract.interface,
    address: directoryContract.address,
    method: 'isCommunityInDirectory',
    args: [publicKey],
  }) ?? [undefined]

  const [isCommunityUnderVote] = useContractCall({
    abi: votingContract.interface,
    address: votingContract.address,
    method: 'communityVotingId',
    args: [publicKey],
  }) ?? [undefined]

  useEffect(() => {
    if (state.status === 'Mining') {
      setShowConfirmModal(true)
    }
  }, [state])

  useEffect(() => {
    if (isCommunityInDirectory) {
      setCommunityInDirectory(true)
    } else {
      setCommunityInDirectory(false)
    }
  }, [isCommunityInDirectory])

  useEffect(() => {
    if (isCommunityUnderVote && isCommunityUnderVote.toNumber() > 0) {
      setCommunityUnderVote(true)
    } else {
      setCommunityUnderVote(false)
    }
  }, [isCommunityUnderVote?.toNumber()])

  return (
    <ColumnFlexDiv>
      <PublicKeyInput publicKey={publicKey} setPublicKey={setPublicKey} />
      <ProposingData>
        {communityFound ? <CardCommunity community={communityFound} /> : loading && publicKey && <CommunitySkeleton />}
        {communityFound && (
          <WarningWrap>
            {communityFound.numberOfMembers < 42 && (
              <Warning
                icon="🤏"
                text={`${communityFound.name} currently only has ${communityFound.numberOfMembers} members. A community needs more than 42 members before a vote to be added to the Status community directory can be proposed.`}
              />
            )}
            {availableAmount < 10000 && (
              <Warning
                icon="💰"
                text={`Not enough SNT to start a vote for this community. A new vote for ${communityFound.name} requires at least 10,000 SNT available.`}
              />
            )}
            {!communityFound.ens && (
              <Warning
                icon="⚠️"
                text={`${communityFound.name} is not registered in Ethereum Name Service. Only communities with ENS name can be included in the directory.`}
              />
            )}
            {communityInDirectory && (
              <Warning
                icon="⚠️"
                text={`${communityFound.name} is already in the communities directory! No need to start a new vote.`}
              />
            )}
            {communityUnderVote && (
              <Warning
                icon="⚠️"
                text={`There’s already an ongoing vote to add ${communityFound.name} in the directory!`}
              />
            )}
          </WarningWrap>
        )}

        {communityFound && communityFound.validForAddition && publicKey && (
          <VoteProposeWrap>
            <VotePropose
              availableAmount={availableAmount}
              setProposingAmount={setProposingAmount}
              proposingAmount={proposingAmount}
              disabled={!communityFound}
            />
          </VoteProposeWrap>
        )}
        {!publicKey && (
          <ProposingInfo>
            <span>ℹ️</span>
            <InfoText>To propose a community, it must have at least 42 members and have a ENS domain.</InfoText>
          </ProposingInfo>
        )}
      </ProposingData>

      {communityFound && !communityFound.validForAddition ? (
        <ConfirmBtn onClick={() => setShowConfirmModal(false)}>
          OK, let’s move on! <span>🤙</span>
        </ConfirmBtn>
      ) : (
        <ProposingBtn
          disabled={!communityFound || !proposingAmount}
          onClick={() => send(1, publicKey, BigNumber.from(proposingAmount))}
        >
          Confirm vote to add community
        </ProposingBtn>
      )}
    </ColumnFlexDiv>
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

const VoteProposeWrap = styled.div`
  margin-top: 32px;
`

const ProposingData = styled.div`
  width: 100%;
`

const ProposingInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > span {
    font-size: 24px;
    line-height: 32px;
    margin-right: 16px;
  }
`

const InfoText = styled.div`
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1px;
`

const ProposingBtn = styled(ButtonPrimary)`
  width: 100%;
  padding: 11px 0;
  margin-top: 32px;
`
const WarningWrap = styled.div`
  margin: 24px 0;
`
