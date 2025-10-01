import React from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

type Props = {
  defaults?: Partial<{
    title: string
    description: string
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    priority: 'low' | 'medium' | 'high'
  }>
  onSubmit: (values: { title: string; description?: string; status: 'pending' | 'in_progress' | 'completed' | 'cancelled'; priority: 'low' | 'medium' | 'high' }) => Promise<void> | void
}

export default function TodoForm({ defaults, onSubmit }: Props) {
  const [title, setTitle] = React.useState(defaults?.title ?? '')
  const [description, setDescription] = React.useState(defaults?.description ?? '')
  const [status, setStatus] = React.useState<Props['defaults']['status']>(defaults?.status ?? 'pending')
  const [priority, setPriority] = React.useState<Props['defaults']['priority']>(defaults?.priority ?? 'medium')
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || undefined, status: status!, priority: priority! })
      setTitle('')
      setDescription('')
      setStatus('pending')
      setPriority('medium')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? 'Saving...' : 'Add task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


