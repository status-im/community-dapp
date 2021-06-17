import { keyframes } from 'styled-components'

export function Animation() {
  return keyframes`
    0% { transform: translateX(-50%) scaleX(0); }
    100% { transform: translateX(-50%) scaleX(100%); }
`
}
