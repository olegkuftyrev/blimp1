"use client"
import React from 'react'
import { useParams } from 'next/navigation'
import { useStoreTodos, updateStoreTodo, createStoreTodo, deleteStoreTodo } from '../../../../hooks/useTodos'
import TodoFilters from '../../../../components/todos/TodoFilters'
import TodoList from '../../../../components/todos/TodoList'
import TodoForm from '../../../../components/todos/TodoForm'

export default function StoreTodosPage() {
  const params = useParams<{ restaurantId: string }>()
  const restaurantId = Number(params.restaurantId)
  const [filters, setFilters] = React.useState<{ status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'; search?: string }>({})
  const { todos, isLoading, error, revalidate } = useStoreTodos(restaurantId, filters)

  const onToggleDone = async (todo: any) => {
    const nextStatus = todo.status === 'completed' ? 'pending' : 'completed'
    await updateStoreTodo(restaurantId, todo.id, { status: nextStatus })
    await revalidate()
  }

  // Check if user is authenticated
  React.useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('No auth token found. Please log in first.')
    }
  }, [])

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Store Tasks</h1>
        <div className="text-red-600 p-4 border border-red-200 rounded">
          <p>Failed to load tasks: {error.message}</p>
          <p className="text-sm mt-2">Make sure you're logged in and the backend server is running.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Store Tasks</h1>
      <TodoForm onSubmit={async (v) => {
        await createStoreTodo(restaurantId, { ...v, scope: 'store' })
        await revalidate()
      }} />
      <TodoFilters status={filters.status} search={filters.search} onChange={setFilters} />
      <TodoList todos={todos} onToggleDone={onToggleDone} onDelete={async (t) => { await deleteStoreTodo(restaurantId, t.id); await revalidate() }} />
    </div>
  )
}


