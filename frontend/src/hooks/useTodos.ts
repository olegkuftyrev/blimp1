import useSWR, { mutate } from 'swr'
import api from '../lib/axios'

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TodoPriority = 'low' | 'medium' | 'high'
export type TodoScope = 'user' | 'store' | 'both'

export interface TodoDTO {
  id: number
  title: string
  description?: string | null
  status: TodoStatus
  priority: TodoPriority
  scope: TodoScope
  dueDate?: string | null
  userId?: number | null
  restaurantId?: number | null
  assignedUserId?: number | null
  createdAt: string
  updatedAt: string
  tags?: { id: number; name: string }[]
  checklistItems?: { id: number; title: string; isDone: boolean; sortOrder: number }[]
}

type Filters = Partial<{
  status: TodoStatus
  priority: TodoPriority
  scope: TodoScope
  due_before: string
  due_after: string
  assigned_user_id: number
  tag: string
  search: string
  page: number
  perPage: number
}>

const fetcher = async (url: string) => {
  try {
    const res = await api.get(url)
    return res.data
  } catch (error) {
    console.error('SWR fetcher error for', url, error)
    throw error
  }
}

export function useUserTodos(userId: number, filters: Filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v))
  })
  const key = userId ? `/api/users/${userId}/todos?${params.toString()}` : null
  const { data, error, isLoading, mutate: revalidate } = useSWR<TodoDTO[]>(key, fetcher, {
    shouldRetryOnError: false,
    onError: (error) => {
      console.error('useUserTodos error:', error.message)
    }
  })
  return { todos: data, error, isLoading, revalidate }
}

export function useStoreTodos(restaurantId: number, filters: Filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v))
  })
  const key = restaurantId ? `/api/restaurants/${restaurantId}/todos?${params.toString()}` : null
  const { data, error, isLoading, mutate: revalidate } = useSWR<TodoDTO[]>(key, fetcher, {
    shouldRetryOnError: false,
    onError: (error) => {
      console.error('useStoreTodos error:', error.message)
    }
  })
  return { todos: data, error, isLoading, revalidate }
}

export async function createUserTodo(userId: number, body: Partial<TodoDTO>) {
  const url = `/api/users/${userId}/todos`
  const res = await api.post(url, body)
  await mutate((key: string) => key?.startsWith(`/api/users/${userId}/todos`))
  return res.data as TodoDTO
}

export async function updateUserTodo(userId: number, id: number, body: Partial<TodoDTO>) {
  const url = `/api/users/${userId}/todos/${id}`
  const res = await api.patch(url, body)
  await mutate((key: string) => key?.startsWith(`/api/users/${userId}/todos`))
  return res.data as TodoDTO
}

export async function deleteUserTodo(userId: number, id: number) {
  const url = `/api/users/${userId}/todos/${id}`
  await api.delete(url)
  await mutate((key: string) => key?.startsWith(`/api/users/${userId}/todos`))
}

export async function createStoreTodo(restaurantId: number, body: Partial<TodoDTO>) {
  const url = `/api/restaurants/${restaurantId}/todos`
  const res = await api.post(url, body)
  await mutate((key: string) => key?.startsWith(`/api/restaurants/${restaurantId}/todos`))
  return res.data as TodoDTO
}

export async function updateStoreTodo(restaurantId: number, id: number, body: Partial<TodoDTO>) {
  const url = `/api/restaurants/${restaurantId}/todos/${id}`
  const res = await api.patch(url, body)
  await mutate((key: string) => key?.startsWith(`/api/restaurants/${restaurantId}/todos`))
  return res.data as TodoDTO
}

export async function deleteStoreTodo(restaurantId: number, id: number) {
  const url = `/api/restaurants/${restaurantId}/todos/${id}`
  await api.delete(url)
  await mutate((key: string) => key?.startsWith(`/api/restaurants/${restaurantId}/todos`))
}

export async function addTodoTags(todoId: number, names?: string[], ids?: number[]) {
  const url = `/api/todos/${todoId}/tags`
  const res = await api.post(url, { names, ids })
  await mutate((key: string) => key?.includes(`/api/todos/${todoId}/`))
  return res.data as { id: number; name: string }[]
}

export async function removeTodoTag(todoId: number, tagId: number) {
  const url = `/api/todos/${todoId}/tags/${tagId}`
  await api.delete(url)
  await mutate((key: string) => key?.includes(`/api/todos/${todoId}/`))
}

export async function getChecklist(todoId: number) {
  const url = `/api/todos/${todoId}/checklist`
  const res = await api.get(url)
  return res.data as { id: number; title: string; isDone: boolean; sortOrder: number }[]
}

export async function addChecklistItem(todoId: number, title: string, sortOrder?: number) {
  const url = `/api/todos/${todoId}/checklist`
  const res = await api.post(url, { title, sortOrder })
  await mutate((key: string) => key?.includes(`/api/todos/${todoId}/`))
  return res.data
}

export async function updateChecklistItem(todoId: number, itemId: number, input: Partial<{ title: string; isDone: boolean; sortOrder: number }>) {
  const url = `/api/todos/${todoId}/checklist/${itemId}`
  const res = await api.patch(url, input)
  await mutate((key: string) => key?.includes(`/api/todos/${todoId}/`))
  return res.data
}

export async function deleteChecklistItem(todoId: number, itemId: number) {
  const url = `/api/todos/${todoId}/checklist/${itemId}`
  await api.delete(url)
  await mutate((key: string) => key?.includes(`/api/todos/${todoId}/`))
}


