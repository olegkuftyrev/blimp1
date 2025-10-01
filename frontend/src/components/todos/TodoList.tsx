import React from 'react'
import type { TodoDTO } from '../../hooks/useTodos'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import TodoTags from './TodoTags'
import TodoChecklist from './TodoChecklist'

type Props = {
  todos?: TodoDTO[]
  onToggleDone?: (todo: TodoDTO) => void
  onDelete?: (todo: TodoDTO) => void
}

export default function TodoList({ todos, onToggleDone, onDelete }: Props) {
  if (!todos) return <div className="text-sm text-muted-foreground">Loading...</div>
  if (todos.length === 0) return <div className="text-sm text-muted-foreground">No tasks</div>
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({})
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {todos.map((t) => (
        <Card key={t.id}>
          <CardHeader className="pb-3">
            <div className="flex gap-3 items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={t.status === 'completed'}
                onChange={() => onToggleDone?.(t)}
              />
              <div className="flex-1">
                <CardTitle className="text-lg">{t.title}</CardTitle>
                {t.description ? <p className="text-sm text-muted-foreground mt-1">{t.description}</p> : null}
                <div className="flex gap-2 mt-2">
                  <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                  <Badge className={getPriorityColor(t.priority)}>{t.priority}</Badge>
                  <Badge variant="outline">{t.scope}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setExpanded((s) => ({ ...s, [t.id]: !s[t.id] }))}>
                  {expanded[t.id] ? 'Hide' : 'Details'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete?.(t)}>Delete</Button>
              </div>
            </div>
          </CardHeader>
          {expanded[t.id] ? (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <TodoTags todoId={t.id} tags={t.tags} onChanged={() => { /* rely on page revalidate */ }} />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Checklist</h4>
                  <TodoChecklist todoId={t.id} />
                </div>
              </div>
            </CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  )
}


