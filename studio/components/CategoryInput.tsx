import { Autocomplete, Box, Flex, Text } from '@sanity/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { set, unset, useClient, StringInputProps } from 'sanity'
import { AddIcon } from '@sanity/icons'

export function CategoryInput(props: StringInputProps) {
  const { onChange, value = '', elementProps } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const [categories, setCategories] = useState<{ value: string }[]>([])
  const [inputValue, setInputValue] = useState(value)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    client
      .fetch(`*[_type == "project" && defined(category)].category`)
      .then((results: string[]) => {
        const uniqueCategories = Array.from(new Set(results))
          .sort()
          .map((cat) => ({
            value: cat,
          }))
        setCategories(uniqueCategories)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [client])

  // Compute options including a "Create new" virtual option
  const options = useMemo(() => {
    const list = [...categories]
    const trimmedInput = inputValue?.trim()
    
    if (trimmedInput && !categories.some(c => c.value.toLowerCase() === trimmedInput.toLowerCase())) {
      list.unshift({ 
        value: trimmedInput, 
        label: `Add new category: "${trimmedInput}"` 
      })
    }
    return list
  }, [categories, inputValue])

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onChange(selectedValue ? set(selectedValue) : unset())
    },
    [onChange]
  )

  const handleChange = useCallback(
    (nextValue: string) => {
      setInputValue(nextValue)
      // We don't save on every keystroke to avoid spamming the "saved items" list 
      // with incomplete strings. We save on select or when the user stops typing?
      // Actually, standard behavior for strings is to save on change.
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  const renderOption = useCallback((option: { value: string; label?: string }) => {
    const isNew = option.label?.startsWith('Add new')
    return (
      <Box padding={2}>
        <Flex align="center" gap={2}>
          {isNew && <AddIcon />}
          <Text size={1} weight={isNew ? 'bold' : 'regular'}>
            {option.label || option.value}
          </Text>
        </Flex>
      </Box>
    )
  }, [])

  return (
    <Autocomplete
      {...elementProps}
      fontSize={1}
      id="category-autocomplete"
      loading={loading}
      options={options}
      onSelect={handleSelect}
      onChange={handleChange}
      value={value}
      placeholder="Type to add or select a category..."
      openButton
      renderOption={renderOption}
    />
  )
}
