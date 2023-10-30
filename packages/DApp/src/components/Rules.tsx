import React from 'react'
import styled from 'styled-components'
import { Colors } from '../constants/styles'

export function Rules() {
  return (
    <VotingRules>
      <RulesHeading>Voting rules</RulesHeading>
      <Rule>
        <RuleIcon>🗳️</RuleIcon>
        <RuleText>
          SNT holders can use their SNT voting power to vote for or against addition or removal of communities in the
          directory.
        </RuleText>
      </Rule>
      <Rule>
        <RuleIcon>👍</RuleIcon>
        <RuleText>
          If a vote to add ends in favour of a community, the community will be added to the directory. Otherwise, a new
          vote for the addition of that community can be started after 2 days.
        </RuleText>
      </Rule>
      <Rule>
        <RuleIcon>🗑️</RuleIcon>
        <RuleText>
          If a vote to remove a community ends in favour of the removal, the community will disappear from the
          directory. Otherwise, a new vote for removal can be submitted after about 2 days.
        </RuleText>
      </Rule>
      <Rule>
        <RuleIcon>⏳</RuleIcon>
        <RuleText>
          Each vote lasts for two days. When the voting period ends, the verification period starts, someone has to cast
          the votes.
        </RuleText>
      </Rule>
      <Rule>
        <RuleIcon>⏳</RuleIcon>
        <RuleText>
          Each verification period lasts for one day. When the verification ends, someone has to finalize the vote with
          a finalization transaction.
        </RuleText>
      </Rule>
      <Rule>
        <RuleIcon>⭐</RuleIcon>
        <RuleText>
          There is an always ongoing vote for which communities from the directory should appear in the Featured
          section. Every three days, three communities with the most votes are added to the section, replacing the three
          communities that were featured previously. After the community leaves Featured section, it cannot get there
          again for around a week.
        </RuleText>
      </Rule>
    </VotingRules>
  )
}

const VotingRules = styled.div`
  max-width: 648px;
  padding: 24px;
  margin: 0 auto;
  background-color: ${Colors.VioletSecondaryLight};
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 6px;

  @media (max-width: 768px) {
    max-width: 524px;
  }

  @media (max-width: 600px) {
    padding: 182px 16px 16px;
    background-color: unset;
    border: none;
    box-shadow: none;
  }
`

const RulesHeading = styled.p`
  font-weight: bold;
  font-size: 22px;
  line-height: 24px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    font-size: 17px;
  }
`

const Rule = styled.div`
  display: flex;
  justify-content: space-between;

  &:not(:last-child) {
    margin-bottom: 16px;
  }
`

const RuleIcon = styled.p`
  font-size: 24px;
  line-height: 30px;
  margin-right: 16px;
}

`

const RuleText = styled.p`
  line-height: 22px;

  @media (max-width: 600px) {
    font-size: 13px;
    line-height: 18px;
`
