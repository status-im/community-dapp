import styled from 'styled-components'
import { Colors } from '../constants/styles'

export const Button = styled.button`
  color: ${Colors.White};
  border-radius: 8px;
`

export const ButtonPrimary = styled(Button)`
  background: ${Colors.Violet};
  font-weight: bold;
  font-size: 15px;
  line-height: 24px;

  &:not(:disabled):hover {
    background: ${Colors.VioletDark};
  }

  &:not(:disabled):active,
  &:not(:disabled):focus {
    background: ${Colors.VioletLight};
  }

  &:disabled {
    background: ${Colors.GrayDisabledDark};
  }
`
export const ButtonSecondary = styled(Button)`
  background: ${Colors.VioletSecondary};
  color: ${Colors.VioletDark};
  line-height: 24px;

  &:not(:disabled):hover {
    background: ${Colors.VioletSecondaryDark};
  }

  &:not(:disabled):active {
    background: ${Colors.VioletSecondaryLight};
  }

  &:disabled {
    background: ${Colors.GrayDisabledLight};
    filter: grayscale(1);
  }
`
