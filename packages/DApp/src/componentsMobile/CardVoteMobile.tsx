import { useContractFunction, useEthers } from '@usedapp/core'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { VotesBtns, VoteBtn } from '../components/Button'
import { CardVoteBlock, CardHeading } from '../components/Card'
import {
  VoteHistoryTableCell,
  VoteHistoryTableColumnCell,
  VoteHistoryTableColumnCellDate,
} from '../components/card/CardCommunity'
import { VoteHistoryTable } from '../components/card/CardCommunity'
import { CardHeadingEndedVote } from '../components/card/CardVote/CardVote'
import { LinkInternal } from '../components/Link'
import { VoteChart } from '../components/votes/VoteChart'
import { VotePropose } from '../components/votes/VotePropose'
import { voteTypes } from '../constants/voteTypes'
import voting, { getVotingWinner } from '../helpers/voting'
import { useContracts } from '../hooks/useContracts'
import { DetailedVotingRoom } from '../models/smartContract'
import arrowDown from '../assets/images/arrowDown.svg'
import { useSendWakuVote } from '../hooks/useSendWakuVote'
import { WrapperBottom, WrapperTop } from '../constants/styles'
import { useRoomAggregateVotes } from '../hooks/useRoomAggregateVotes'
import { useVotesAggregate } from '../hooks/useVotesAggregate'
import { useUnverifiedVotes } from '../hooks/useUnverifiedVotes'

interface CardVoteMobileProps {
  room: DetailedVotingRoom
}

export const CardVoteMobile = ({ room }: CardVoteMobileProps) => {
  const { account } = useEthers()
  const selectedVoted = voteTypes['Add'].for
  const [sentVotesFor, setSentVotesFor] = useState(0)
  const [sentVotesAgainst, setSentVotesAgainst] = useState(0)
  const [voted, setVoted] = useState<null | boolean>(null)

  useEffect(() => {
    setVoted(null)
  }, [account])

  const { votingContract } = useContracts()
  const vote = voting.fromRoom(room)
  const voteConstants = voteTypes[vote.type]
  const { votes } = useVotesAggregate(vote.ID, room.verificationStartAt, room.startAt)
  const castVotes = useContractFunction(votingContract, 'castVotes')

  const finalizeVoting = useContractFunction(votingContract, 'finalizeVotingRoom')
  room = useRoomAggregateVotes(room, false)

  const now = Date.now() / 1000
  const verificationStarted = room.verificationStartAt.toNumber() - now < 0
  const verificationEnded = room.endAt.toNumber() - now < 0
  const verificationPeriod = verificationStarted && !verificationEnded

  const winner = verificationPeriod ? 0 : getVotingWinner(vote)

  const {
    votesFor: votesForUnverified,
    votesAgainst: votesAgainstUnverified,
    voters,
  } = useUnverifiedVotes(vote.ID, room.verificationStartAt, room.startAt)

  const [proposingAmount, setProposingAmount] = useState(0)

  const [showHistory, setShowHistory] = useState(false)
  const isDisabled = room.details.votingHistory.length === 0
  const sendWakuVote = useSendWakuVote()

  const includeUnverifiedVotes = !winner || verificationPeriod

  const votesFor = !includeUnverifiedVotes
    ? vote.voteFor.toNumber()
    : vote.voteFor.toNumber() + votesForUnverified + sentVotesFor
  const votesAgainst = !includeUnverifiedVotes
    ? vote.voteAgainst.toNumber()
    : vote.voteAgainst.toNumber() + votesAgainstUnverified + sentVotesAgainst

  const canVote = voted ? false : Boolean(account && !voters.includes(account))

  if (!vote) {
    return <CardVoteBlock />
  }
  return (
    <CardVoteBlock>
      {verificationPeriod && (
        <CardHeadingEndedVote>Verification period in progress, please verify your vote.</CardHeadingEndedVote>
      )}
      {winner ? (
        <CardHeadingEndedVote>
          SNT holders have decided <b>{winner == 1 ? voteConstants.against.verb : voteConstants.for.verb}</b> this
          community to the directory!
        </CardHeadingEndedVote>
      ) : (
        !verificationPeriod && <CardHeadingMobile>{voteConstants.question}</CardHeadingMobile>
      )}
      <div>
        <WrapperBottom>
          <VoteChart
            vote={vote}
            voteWinner={winner}
            isAnimation={true}
            votesFor={votesFor}
            votesAgainst={votesAgainst}
          />
        </WrapperBottom>
        {!winner && (
          <WrapperTop>
            <VotePropose
              vote={vote}
              selectedVote={selectedVoted}
              proposingAmount={proposingAmount}
              setProposingAmount={setProposingAmount}
            />
          </WrapperTop>
        )}
        {verificationPeriod && (
          <VoteBtnFinal
            onClick={async () => {
              await castVotes.send(votes)

              setSentVotesFor(0)
              setSentVotesAgainst(0)
            }}
            disabled={!account}
          >
            Verify votes
          </VoteBtnFinal>
        )}
        {Boolean(winner) && (
          <VoteBtnFinal onClick={() => finalizeVoting.send(room.roomNumber)} disabled={!account}>
            Finalize the vote <span>✍️</span>
          </VoteBtnFinal>
        )}

        {!verificationPeriod && !winner && (
          <VotesBtns>
            <VoteBtn
              disabled={!canVote}
              onClick={async () => {
                await sendWakuVote(proposingAmount, room.roomNumber, 0)
                setVoted(true)
                setSentVotesAgainst(sentVotesAgainst + proposingAmount)
              }}
            >
              {voteConstants.against.text} <span>{voteConstants.against.icon}</span>
            </VoteBtn>
            <VoteBtn
              disabled={!canVote}
              onClick={async () => {
                await sendWakuVote(proposingAmount, room.roomNumber, 1)
                setVoted(true)
                setSentVotesFor(sentVotesFor + proposingAmount)
              }}
            >
              {voteConstants.for.text} <span>{voteConstants.for.icon}</span>
            </VoteBtn>
          </VotesBtns>
        )}
      </div>
      {!isDisabled && (
        <HistoryLink
          className={showHistory ? 'opened' : ''}
          onClick={() => setShowHistory(!showHistory)}
          disabled={isDisabled}
        >
          Voting history
        </HistoryLink>
      )}

      {showHistory && (
        <VoteHistoryTable>
          <tbody>
            <tr>
              <VoteHistoryTableColumnCellDate>Date</VoteHistoryTableColumnCellDate>
              <VoteHistoryTableColumnCell>Type</VoteHistoryTableColumnCell>
              <VoteHistoryTableColumnCell>Result</VoteHistoryTableColumnCell>
            </tr>
            {room.details.votingHistory.map((vote) => {
              return (
                <tr key={vote.ID}>
                  <VoteHistoryTableCell>{vote.date.toLocaleDateString()}</VoteHistoryTableCell>
                  <VoteHistoryTableCell>{vote.type}</VoteHistoryTableCell>
                  <VoteHistoryTableCell>{vote.result}</VoteHistoryTableCell>
                </tr>
              )
            })}
          </tbody>
        </VoteHistoryTable>
      )}
    </CardVoteBlock>
  )
}

const CardHeadingMobile = styled(CardHeading)`
  margin-bottom: 24px;
`
const VoteBtnFinal = styled(VoteBtn)`
  width: 100%;
`
export const HistoryLink = styled(LinkInternal)`
  width: 120px;
  position: relative;
  margin: 24px 0;
  text-align: start;
  padding: 0;

  &::after {
    content: '';
    width: 24px;
    height: 24px;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-image: url(${arrowDown});
    background-size: contain;
    background-repeat: no-repeat;
  }

  &.opened {
    &::after {
      content: '';
      width: 24px;
      height: 24px;
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%) rotate(180deg);
      background-image: url(${arrowDown});
      background-size: contain;
      background-repeat: no-repeat;
    }
  }
`
