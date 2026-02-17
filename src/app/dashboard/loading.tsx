export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div className="h-10 w-28 bg-gray-200 rounded-full skeleton-shimmer" />
        <div className="h-10 w-10 bg-gray-200 rounded-lg skeleton-shimmer" />
      </div>
      <div className="space-y-3">
        <div className="h-10 w-72 bg-gray-200 rounded-lg skeleton-shimmer" />
        <div className="h-6 w-56 bg-gray-100 rounded-lg skeleton-shimmer" />
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6">
        <div className="flex justify-between">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-gray-200 rounded skeleton-shimmer" />
            <div className="h-12 w-40 bg-gray-200 rounded skeleton-shimmer" />
          </div>
          <div className="w-24 h-24 bg-gray-200 rounded-full skeleton-shimmer" />
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex gap-3">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="flex-1 h-10 bg-gray-100 rounded-lg skeleton-shimmer" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="w-9 h-9 bg-gray-200 rounded-lg skeleton-shimmer" />
            <div className="h-7 w-14 bg-gray-200 rounded skeleton-shimmer" />
            <div className="h-3 w-20 bg-gray-100 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  )
}
