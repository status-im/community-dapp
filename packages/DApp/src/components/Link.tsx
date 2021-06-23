import styled from 'styled-components'
import { Colors } from '../constants/styles'
import externalIcon from '../assets/images/ext.svg'

export const LinkExternal = styled.a`
  color: ${Colors.BlueLink};
  position: relative;
  padding-right: 20px;

  &:hover {
    text-decoration: underline;
  }

  &:active {
    text-decoration: none;
  }

  &::after {
    content: '';
    width: 11px;
    height: 11px;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-image: url(${externalIcon});
    background-size: contain;
  }
`
export const LinkInternal = styled.a`
  color: ${Colors.VioletDark};
  font-weight: 500;

  &:hover {
    color: ${Colors.Violet};
  }

  &:active {
    color: ${Colors.VioletDark};
  }
`
