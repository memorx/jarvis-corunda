import { Skeleton } from '@/components/ui/skeleton'

export default function PlaygroundLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-10 w-80" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  )
}
