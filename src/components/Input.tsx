import styled from 'styled-components'
import { Colors } from '../constants/styles'
import searchIcon from '../assets/images/search.svg'

export const Input = styled.input`
  max-width: 420px;
  padding: 11px 20px;
  background: ${Colors.GrayBorder};
  color: ${Colors.Black};
  border-radius: 8px;
  border: 1px solid ${Colors.GrayBorder};
  outline: none;

  &:active,
  &:focus {
    border: 1px solid ${Colors.Violet};
    caret-color: ${Colors.Violet};
  }
`

export const Search = styled(Input)`
  width: 270px;
  padding: 7px 36px;
  background-image: url(${searchIcon});
  background-size: 24px 24px;
  background-repeat: no-repeat;
  background-position: center left 10px;

  &::placeholder {
    font-size: 15px;
    line-height: 22px;
  }
`
