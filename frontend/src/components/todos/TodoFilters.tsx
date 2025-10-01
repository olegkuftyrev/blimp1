import React from 'react'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type Props = {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  search?: string
  onChange: (next: { status?: Props['status']; search?: string }) => void
}

export default function TodoFilters({ status, search, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select value={status ?? 'all'} onValueChange={(value) => onChange({ status: (value === 'all' ? undefined : value) as Props['status'], search })}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="text"
        className="w-full"
        placeholder="Search title..."
        value={search ?? ''}
        onChange={(e) => onChange({ status, search: e.target.value || undefined })}
      />
    </div>
  )
}


