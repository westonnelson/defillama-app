import { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import OptionToggle from '~/components/OptionToggle'
import {
  useDisplayUsdManager,
  useHideLastDayManager,
  useTvlToggles,
  useGetExtraTvlEnabled,
  STAKING,
  POOL2,
  BORROWED,
  DARK_MODE,
  HIDE_LAST_DAY,
  DISPLAY_USD,
  DOUBLE_COUNT,
  useDarkModeManager,
  UNRELEASED,
} from '~/contexts/LocalStorage'
import { useIsClient } from '~/hooks'
import MenuIcon from './MenuSvg'

const StyledMenuIcon = styled(MenuIcon)`
  svg {
    path {
      stroke: ${({ theme }) => theme.text1};
    }
  }
`

const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  :hover,
  :focus-visible {
    background-color: ${({ theme }) => theme.bg4};
  }
  svg {
    margin-top: 2px;
    path {
      stroke: ${({ theme }) => theme.text1};
    }
  }
`

const StyledMenu = styled.span`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 9rem;
  background-color: ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 2.6rem;
  right: 0rem;
  z-index: 100000;
`

const StyledLink = styled.a`
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;
  display: inline;
  flex-direction: center;
  align-items: center;

  :hover {
    opacity: 0.7;
  }
`

const MenuItem = styled(StyledLink)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    opacity: 0.6;
  }
  > svg {
    margin-right: 8px;
  }
`

const ListWrapper = styled.ul`
  display: flex;
  padding: 0;
  list-style: none;
`
const ListItem = styled.li`
  &:not(:first-child) {
    margin-left: 12px;
  }
`

export const extraTvlOptions = [
  {
    name: 'Staking',
    key: STAKING,
    help: 'Include governance tokens staked in the protocol',
  },
  {
    name: 'Pool2',
    key: POOL2,
    help: 'Include staked lp tokens where one of the coins in the pair is the governance token',
  },
  {
    name: 'Borrows',
    key: BORROWED,
    help: 'Include borrowed coins in lending protocols',
  },
  {
    name: 'Double Count',
    key: DOUBLE_COUNT,
    help: 'Include TVL of protocols which TVL feeds into another protocol',
  },
]

export const extraPeggedOptions = [
  {
    name: 'Unreleased',
    key: UNRELEASED,
    help: 'Include tokens that were minted but have never been circulating.',
  },
]

export default function Menu({ type = 'defi', ...props }) {
  const node = useRef()

  const [open, setOpen] = useState(false)
  const toggle = () => {
    setOpen(!open)
  }

  useEffect(() => {
    function handleClick(e) {
      if (!(node.current && node.current.contains(e.target))) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  const tvlToggles = useTvlToggles()
  const extraTvlEnabled = useGetExtraTvlEnabled()
  const [darkMode] = useDarkModeManager()

  const togglesEnabled = { ...extraTvlEnabled, DARK_MODE: darkMode }

  const toggleSettings = {
    defi: [
      ...extraTvlOptions,
      {
        name: 'Dark mode',
        key: DARK_MODE,
      },
    ],
    nfts: [
      {
        name: 'Display in USD',
        key: DISPLAY_USD,
        help: 'Display metrics in USD',
      },
      {
        name: 'Hide last day',
        key: HIDE_LAST_DAY,
        help: 'Hide the last day of data',
      },
      {
        name: 'Dark mode',
        key: DARK_MODE,
      },
    ],
  }

  const renderSettingsToggles = () => {
    return toggleSettings[type].map((toggleSetting) => (
      <MenuItem key={toggleSetting.name}>
        <OptionToggle
          {...toggleSetting}
          toggle={tvlToggles(toggleSetting.key)}
          enabled={togglesEnabled[toggleSetting.key]}
        />
      </MenuItem>
    ))
  }

  return (
    <StyledMenu ref={node} {...props}>
      <StyledMenuButton onClick={toggle}>
        <span className="visually-hidden">Open TVL settings</span>
        <StyledMenuIcon />
      </StyledMenuButton>

      {open && <MenuFlyout>{renderSettingsToggles()}</MenuFlyout>}
    </StyledMenu>
  )
}

export const DefiTvlSwitches = ({ options, ...props }) => {
  const tvlToggles = useTvlToggles()
  const extraTvlEnabled = useGetExtraTvlEnabled()

  let tvlOptions = options || [...extraTvlOptions]

  return (
    <ListWrapper {...props}>
      {tvlOptions.map((option) => (
        <ListItem key={option.key}>
          <OptionToggle {...option} toggle={tvlToggles(option.key)} enabled={extraTvlEnabled[option.key]} />
        </ListItem>
      ))}
    </ListWrapper>
  )
}

export function NFTSwitches(props) {
  const [displayUsd, toggleDisplayUsd] = useDisplayUsdManager()
  const [hideLastDay, toggleHideLastDay] = useHideLastDayManager()
  const isClient = useIsClient()

  const toggleSettings = [
    {
      name: 'Display in USD',
      toggle: toggleDisplayUsd,
      enabled: displayUsd && isClient,
      help: 'Display metrics in USD',
    },
    {
      name: 'Hide last day',
      toggle: toggleHideLastDay,
      enabled: hideLastDay && isClient,
      help: 'Hide the last day of data',
    },
  ]

  return (
    <ListWrapper {...props} style={{ margin: '0 auto' }}>
      {toggleSettings.map((toggleSetting) => (
        <ListItem key={toggleSetting.name}>
          <OptionToggle {...toggleSetting} />
        </ListItem>
      ))}
    </ListWrapper>
  )
}
