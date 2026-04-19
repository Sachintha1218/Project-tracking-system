import { Autocomplete } from '@sanity/ui'
import { useCallback, useEffect, useState } from 'react'
import { set, unset, useClient, StringInputProps } from 'sanity'

export function CategoryInput(props: StringInputProps) {
  const { onChange, value = '', elementProps } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const [categories, setCategories] = useState<{ value: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    client
      .fetch(`*[_type == "project" && defined(category)].category`)
      .then((results: string[]) => {
        const uniqueCategories = Array.from(new Set(results))
          .sort() // Sort alphabetically for better UX
          .map((cat) => ({
            value: cat,
          }))
        setCategories(uniqueCategories)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [client])

  const handleChange = useCallback(
    (nextValue: string) => {
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  return (
    <Autocomplete
      {...elementProps}
      fontSize={1}
      id="category-autocomplete"
      loading={loading}
      options={categories}
      onSelect={handleChange}
      onChange={handleChange}
      value={value}
      placeholder="Type to add or select a category..."
      openButton
    />
  )
}
