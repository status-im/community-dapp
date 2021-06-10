import styled from 'styled-components'
import { Colors } from '../constants/styles'
import filterIcon from '../assets/images/filter.svg'
import arrowDownIcon from '../assets/images/arrowDown.svg'

export const Filter = styled.select`
  width: 175px;
  padding: 2px 10px 2px 30px;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  color: ${Colors.VioletDark};
  border: 1px solid #e6ecf0;
  border-radius: 14px;
  appearance: none;
  background: url(${filterIcon}) no-repeat 5px center, url(${arrowDownIcon}) no-repeat right 10px center;
  outline: none;

  &:focus {
    border: 1px solid ${Colors.Violet};
  }
`
