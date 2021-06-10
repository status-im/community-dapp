import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Colors } from '../constants/styles'
import filterIcon from '../assets/images/filter.svg'
import arrowDownIcon from '../assets/images/arrowDown.svg'

export type FilterListProps = {
  value: number
  setValue: (value: number) => void
  options: { value: number; text: string }[]
}

export const FilterList = ({ value, setValue, options }: FilterListProps) => {
  const [isOpened, setIsOpened] = useState(false)

  useEffect(() => {
    window.addEventListener('click', () => setIsOpened(false))
    return () => {
      window.removeEventListener('click', () => setIsOpened(false))
    }
  }, [])

  return (
    <Filter
      onClick={(e) => {
        e.stopPropagation()
        setIsOpened(!isOpened)
      }}
    >
      <Select>
        <SelectTrigger>{options.find((option) => option.value === value)?.text}</SelectTrigger>
        <SelectOptions className={isOpened ? 'opened' : undefined}>
          {options.map((option, key) => (
            <SelectOption key={key} onClick={() => setValue(option.value)}>
              {option.text}
            </SelectOption>
          ))}
        </SelectOptions>
      </Select>
    </Filter>
  )
}

const Filter = styled.button`
  display: flex;
  align-items: center;
  padding: 0 5px;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  color: ${Colors.VioletDark};
  border: 1px solid #e6ecf0;
  border-radius: 14px;
  appearance: none;
  outline: none;
  position: relative;

  &:focus,
  &:active {
    border: 1px solid ${Colors.Violet};
  }
`

const Select = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`
const SelectTrigger = styled.div`
  position: relative;
  width: 175px;
  padding: 0 22px 0 25px;

  &::before {
    content: '';
    width: 18px;
    height: 10px;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    background-image: url(${filterIcon});
  }

  &::after {
    content: '';
    width: 12px;
    height: 7px;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-image: url(${arrowDownIcon});
  }
`
const SelectOptions = styled.div`
  position: absolute;
  display: block;
  top: calc(100% + 7px);
  left: 0;
  right: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.3s;
  border: 1px solid ${Colors.GrayBorder};
  border-radius: 16px 4px 16px 16px;

  &.opened {
    opacity: 1;
    background: ${Colors.White};
    visibility: visible;
    pointer-events: all;
    z-index: 10;
  }
`
const SelectOption = styled.span`
  position: relative;
  display: block;
  width: 100%;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  text-align: center;
  padding: 11px 0;
  cursor: pointer;
  transition: all 0.3s;

  &:not(:last-child) {
    border-bottom: 1px solid ${Colors.GrayBorder};
  }

  &:hover {
    background: ${Colors.Violet};
    color: ${Colors.White};
  }
`
