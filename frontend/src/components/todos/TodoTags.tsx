import React from 'react'
import { addTodoTags, removeTodoTag } from '../../hooks/useTodos'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'

type Props = {
  todoId: number
  tags?: { id: number; name: string }[]
  onChanged?: () => void
}

export default function TodoTags({ todoId, tags, onChanged }: Props) {
  const [input, setInput] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const add = async () => {
    const parts = input.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length === 0) return
    setBusy(true)
    try {
      await addTodoTags(todoId, parts)
      setInput('')
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  const remove = async (tagId: number) => {
    setBusy(true)
    try {
      await removeTodoTag(todoId, tagId)
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {tags?.map((t) => (
          <Badge key={t.id} variant="secondary" className="flex items-center gap-1">
            {t.name}
            <button className="ml-1 hover:text-destructive" onClick={() => remove(t.id)} disabled={busy}>×</button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input placeholder="tag1, tag2" value={input} onChange={(e) => setInput(e.target.value)} />
        <Button onClick={add} disabled={busy || !input.trim()} size="sm">Add</Button>
      </div>
    </div>
  )
}


