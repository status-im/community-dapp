import React from 'react'
import styled from 'styled-components'
import backgroundImage from '../assets/images/curve-shape.svg'
import { Colors } from '../constants/styles'

export const WeeklyFeature = ({ endDate }: { endDate: Date }) => {
  const today = new Date()
  const differenceInTime = endDate.getTime() - today.getTime()
  if (differenceInTime < 1) return null
  const daysLeft = Math.ceil(differenceInTime / (1000 * 3600 * 24))

  return (
    <View>
      ⭐ <span>Weekly Feature vote:</span>
      {daysLeft}&nbsp;
      {daysLeft.toString().endsWith('1') ? 'day ' : ' days'} left
    </View>
  )
}

const View = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 80px;
  background: #4b67e0 url(${backgroundImage}) center no-repeat;
  background-size: cover;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  color: ${Colors.White};

  span {
    font-weight: 400;
    margin-right: 6px;
    color: rgba(255, 255, 255, 0.5);
  }

  img {
    margin-right: 8px;
  }
`
