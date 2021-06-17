import React from 'react'
import { useState } from 'react'
import styled from 'styled-components'
import { Colors } from '../../constants/styles'
import { addCommas } from '../../helpers/addCommas'
import { CurrentVoting } from '../../models/community'
import { Input } from '../Input'

export interface VoteProposingProps {
  vote?: CurrentVoting
  selectedVote?: {
    noun: string
  }
  availableAmount: number
}

export function VotePropose({ vote, selectedVote, availableAmount }: VoteProposingProps) {
  const [proposingAmount, setProposingAmount] = useState(0)
  const [displayAmount, setDisplayAmount] = useState('0 SNT')

  let step = 10 ** (Math.floor(Math.log10(availableAmount)) - 2)
  if (availableAmount < 100) {
    step = 1
  }

  const sliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) == step * Math.floor(availableAmount / step)) {
      setProposingAmount(availableAmount)
      setDisplayAmount(addCommas(availableAmount) + ' SNT')
    } else {
      setProposingAmount(Number(e.target.value))
      setDisplayAmount(addCommas(Number(e.target.value)) + ' SNT')
    }
  }

  const progress = (proposingAmount / availableAmount) * 100 + '%'

  return (
    <VoteProposing>
      <VoteProposingInfo>
        <p>My vote</p>
        <span>Available {addCommas(availableAmount)} SNT</span>
      </VoteProposingInfo>
      <VoteProposingAmount
        value={displayAmount}
        onInput={(e) => {
          setProposingAmount(Number(e.currentTarget.value))
          setDisplayAmount(e.currentTarget.value)
        }}
        onBlur={() => setDisplayAmount(addCommas(proposingAmount) + ' SNT')}
        onFocus={() => setDisplayAmount(proposingAmount.toString())}
      />
      <VoteProposingRangeWrap>
        <VoteProposingRange
          type="range"
          min={0}
          max={availableAmount}
          step={step}
          value={proposingAmount}
          onChange={sliderChange}
          style={{
            background: `linear-gradient(90deg, ${Colors.VioletDark} 0% ${progress},  ${Colors.VioletSecondary} ${progress} 100%)`,
          }}
        />
      </VoteProposingRangeWrap>

      {vote?.type === 'Remove' && Number(proposingAmount) > 2000000 && vote.timeLeft / 3600 > 24 && (
        <VoteWarning>
          <span>⚠️</span>
          <WarningText>{`Your vote will shorten vote duration! Votes over 2,000,000 SNT for ${selectedVote?.noun} of the community shortens the vote duration to 24 hours.`}</WarningText>
        </VoteWarning>
      )}
    </VoteProposing>
  )
}

export const VoteProposing = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`
const VoteProposingInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;

  & > span {
    font-size: 12px;
    line-height: 16px;
    color: ${Colors.GreyText};
  }
`

const VoteProposingAmount = styled(Input)`
  width: 100%;
  margin-bottom: 16px;
  font-size: 15px;
  line-height: 22px;
`

const VoteProposingRangeWrap = styled.div`
  width: 294px;
  margin-bottom: 32px;
`

const VoteProposingRange = styled.input`
  appearance: none;
  width: 100%;
  height: 4px;
  padding: 0;
  margin: 10px 0;
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${Colors.Violet};
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: ${Colors.Violet};
    border: 0.5px solid rgba(0, 0, 0, 0);
    border-radius: 50px;
    cursor: pointer;
  }
`

const VoteWarning = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px;
  background: #ffeff2;
  border-radius: 6px;
  margin-bottom: 32px;

  & > span {
    font-size: 24px;
    line-height: 32px;
  }
`

const WarningText = styled.div`
  max-width: 353px;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1px;
`
