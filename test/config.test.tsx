import { renderHook, act } from '@testing-library/react-hooks'
import { ConfigProvider, useConfig } from './../src/providers/config/provider'
import { config } from './../src/providers/config/config'
import { expect } from 'chai'
import { merge } from 'lodash'

describe('ConfigProvider', () => {
  it('success', () => {
    const { result } = renderHook(useConfig, { wrapper: ConfigProvider })
    expect(result.current.config).to.deep.eq(config.development)
    act(() => {
      result.current.updateConfig({ numberPerPage: 5 })
    })
  })

  it('updateConfig', () => {
    const { result } = renderHook(useConfig, { wrapper: ConfigProvider })
    expect(result.current.config).to.deep.eq(config.development)

    act(() => {
      result.current.updateConfig({ numberPerPage: 5 })
    })
    expect(result.current.config).to.deep.eq({ ...config.development, numberPerPage: 5 })

    const newContracts = {
      contracts: {
        1: {
          firstContract: '0x1',
          secondContract: '0x2',
        },
      },
    }

    act(() => {
      result.current.updateConfig(newContracts)
      result.current.updateConfig({ numberPerPage: config.development.numberPerPage })
    })
    merge({}, config.development, newContracts)
    expect(result.current.config).to.deep.equal(merge({}, config.development, newContracts))
  })
})
