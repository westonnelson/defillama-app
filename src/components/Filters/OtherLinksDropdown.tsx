import { useComboboxState } from 'ariakit/combobox'
import { MenuButtonArrow, useMenuState } from 'ariakit/menu'
import Link from 'next/link'
import { Button, Popover } from '~/components/DropdownMenu'
import { Input, Item, List } from '~/components/Combobox'

interface IProps {
  options: { label: string; to: string }[]
  name: string
}

export function OtherLinks({ options, name }: IProps) {
  const defaultList = options.map((l) => l.to)
  const combobox = useComboboxState({ defaultList, gutter: 8 })
  const menu = useMenuState(combobox)

  // Resets combobox value when menu is closed
  if (!menu.mounted && combobox.value) {
    combobox.setValue('')
  }

  return (
    <>
      <Button state={menu}>
        <span>{name}</span>
        <MenuButtonArrow />
      </Button>
      <Popover state={menu} composite={false}>
        <Input state={combobox} placeholder="Search..." />
        {combobox.matches.length > 0 ? (
          <List state={combobox}>
            {combobox.matches.map((value, i) => (
              <Link href={value} key={value + i} passHref>
                <Item value={value} focusOnHover setValueOnClick={false} role="link">
                  {options.find((l) => l.to === value)?.label ?? value}
                </Item>
              </Link>
            ))}
          </List>
        ) : (
          <p id="no-results">No results</p>
        )}
      </Popover>
    </>
  )
}
