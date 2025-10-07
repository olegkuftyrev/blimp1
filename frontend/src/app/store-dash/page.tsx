'use client'

type StoreDashProps = {
  title: string
}

function StoreDash({ title }: StoreDashProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  )
}

export default function Page() {
  return <StoreDash title="123" />
}


