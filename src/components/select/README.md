# Tree Select Components

树形选择器组件，从 Accounting 前端共享。

## Usage

```tsx
import { TreePersonSelect, TreeLocationSelect, TreeTagSelect } from '@/components/select'
import { usePersons, useLocations, useTags } from '@/hooks'

function MyForm() {
  const { data: persons = [] } = usePersons()
  const { data: locations = [] } = useLocations()
  const { data: tags = [] } = useTags()

  return (
    <form>
      <TreePersonSelect
        persons={persons}
        value={selectedPerson}
        onChange={setSelectedPerson}
        label="Person"
      />
      
      <TreeLocationSelect
        locations={locations}
        value={selectedLocation}
        onChange={setSelectedLocation}
        label="Location"
      />
      
      <TreeTagSelect
        tags={tags}
        values={selectedTags}
        onChange={setSelectedTags}
        label="Tags"
      />
    </form>
  )
}
```

See Accounting frontend for full documentation.
