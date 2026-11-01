export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden="true" />
}

export function SkeletonCard({ className = '', children }) {
  return (
    <div className={`glass p-6 ${className}`} role="status" aria-label="Loading">
      {children}
    </div>
  )
}
