export default function FocusLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="w-64 h-64 bg-gray-200 rounded-full skeleton-shimmer" />
      <div className="h-8 w-48 bg-gray-200 rounded-lg skeleton-shimmer" />
      <div className="flex gap-4">
        <div className="h-12 w-32 bg-gray-200 rounded-xl skeleton-shimmer" />
        <div className="h-12 w-32 bg-gray-200 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  )
}
