import React from 'react'
import styled from 'styled-components'
import { Colors } from '../constants/styles'
import { InfoWrap, PageInfo } from '../components/PageInfo'

export function Info() {
  return (
    <div>
      <InfoWrap>
        <PageInfo
          heading="What is this DApp about?"
          text="This DApp allows SNT holders determine which communities should be included in the Status Communities directory"
        />
      </InfoWrap>
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
            If a vote to add ends in favour of a community, the community will be added to the directory. Otherwise, a
            new vote for the addition of that community can be started after 30 days.
          </RuleText>
        </Rule>
        <Rule>
          <RuleIcon>🗑️</RuleIcon>
          <RuleText>
            If a vote to remove a community ends in favour of the removal, the community will disappear from the
            directory. Otherwise, a new vote for removal can be submitted after about 30 days.
          </RuleText>
        </Rule>
        <Rule>
          <RuleIcon>✌️️</RuleIcon>
          <RuleText>
            The minimum amount of SNT needed to start a new vote doubles with every failed vote attempt (for both
            addition and removal votes).
          </RuleText>
        </Rule>
        <Rule>
          <RuleIcon>⏳</RuleIcon>
          <RuleText>
            Each vote lasts for two weeks. When the voting period ends, someone has to finalize the vote with a
            finalization transaction.
          </RuleText>
        </Rule>
        <Rule>
          <RuleIcon>⚠️</RuleIcon>
          <RuleText>
            If a single vote of more than 2,000,000 SNT votes for is made in favor of the removal of a community, the
            remaining vote duration shortens to 24 hours. This shortening of the vote duration can be reversed if a
            single vote of more than 2,000,000 SNT is made against the removal.
          </RuleText>
        </Rule>
        <Rule>
          <RuleIcon>⭐</RuleIcon>
          <RuleText>
            There is an always ongoing vote for which communities from the directory should appear in the Weekly
            Featured section. Every week, five communities with the most votes are added to the section, replacing the
            five communities that were featured the previous week. After the community leaves Weekly Featured, it cannot
            get there again for three weeks.
          </RuleText>
        </Rule>
      </VotingRules>
    </div>
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
`

const RulesHeading = styled.p`
  font-weight: bold;
  font-size: 22px;
  line-height: 24px;
  margin-bottom: 24px;
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
`

const RuleText = styled.p`
  line-height: 22px;
`
