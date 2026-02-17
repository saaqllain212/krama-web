export default function SubpageLoading() {
  return (
    <div className="space-y-6 pb-24">
      <div className="h-5 w-24 bg-gray-200 rounded skeleton-shimmer" />
      <div className="h-10 w-64 bg-gray-200 rounded-lg skeleton-shimmer" />
      <div className="h-6 w-48 bg-gray-100 rounded skeleton-shimmer" />
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
            <div className="h-5 w-40 bg-gray-200 rounded skeleton-shimmer" />
            <div className="h-4 w-full bg-gray-100 rounded skeleton-shimmer" />
            <div className="h-4 w-3/4 bg-gray-100 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  )
}
