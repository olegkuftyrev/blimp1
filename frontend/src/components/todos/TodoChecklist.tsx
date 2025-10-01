import React from 'react'
import { getChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem } from '../../hooks/useTodos'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'

type Item = { id: number; title: string; isDone: boolean; sortOrder: number }

type Props = {
  todoId: number
}

export default function TodoChecklist({ todoId }: Props) {
  const [items, setItems] = React.useState<Item[]>([])
  const [loading, setLoading] = React.useState(true)
  const [input, setInput] = React.useState('')

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getChecklist(todoId)
      setItems(data)
    } finally {
      setLoading(false)
    }
  }, [todoId])

  React.useEffect(() => {
    void load()
  }, [load])

  const add = async () => {
    if (!input.trim()) return
    await addChecklistItem(todoId, input.trim(), items.length)
    setInput('')
    await load()
  }

  const toggle = async (item: Item) => {
    await updateChecklistItem(todoId, item.id, { isDone: !item.isDone })
    await load()
  }

  const remove = async (item: Item) => {
    await deleteChecklistItem(todoId, item.id)
    await load()
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading checklist...</div>

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 py-2">
            <Checkbox checked={it.isDone} onCheckedChange={() => toggle(it)} />
            <span className={`flex-1 ${it.isDone ? 'line-through text-muted-foreground' : ''}`}>{it.title}</span>
            <Button variant="destructive" size="sm" onClick={() => remove(it)}>Delete</Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input placeholder="New item" value={input} onChange={(e) => setInput(e.target.value)} />
        <Button onClick={add} disabled={!input.trim()} size="sm">Add</Button>
      </div>
    </div>
  )
}


