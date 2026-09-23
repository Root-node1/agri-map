import React from 'react'

/* ==========================================================================
   Skeleton primitives
   Structured loading placeholders that mirror the real layout, so the page
   does not jump when data arrives. Uses the .agrimap-skeleton shimmer token
   (which is disabled under prefers-reduced-motion).
   ========================================================================== */

export const SkeletonBlock = ({ className = '', style }) => (
  <span className={`agrimap-skeleton block ${className}`} style={style} aria-hidden="true" />
)

/** Matches the StatCard footprint on the dashboard. */
export const StatCardSkeleton = () => (
  <div className="stat-card rounded-[1.75rem]" aria-hidden="true">
    <SkeletonBlock className="w-14 h-14 rounded-3xl mb-4" />
    <SkeletonBlock className="h-3 w-24 rounded-full mb-3" />
    <SkeletonBlock className="h-8 w-32 rounded-lg mb-3" />
    <SkeletonBlock className="h-4 w-16 rounded-full" />
  </div>
)

/** Matches the frosted-panel footprint (field map, activity feed, etc.). */
export const PanelSkeleton = ({ lines = 4, showHeader = true, className = '' }) => (
  <div className={`frosted-panel ${className}`} aria-hidden="true">
    {showHeader && <SkeletonBlock className="h-5 w-40 rounded-lg mb-5" />}
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className="h-4 rounded-lg" style={{ width: `${92 - i * 9}%` }} />
      ))}
    </div>
  </div>
)

/** Matches a field card in the Fields grid. */
export const FieldCardSkeleton = () => (
  <div className="frosted-panel" aria-hidden="true">
    <div className="flex items-start justify-between mb-4">
      <SkeletonBlock className="h-5 w-32 rounded-lg" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-7 w-7 rounded-lg" />
        <SkeletonBlock className="h-7 w-7 rounded-lg" />
        <SkeletonBlock className="h-7 w-7 rounded-lg" />
      </div>
    </div>
    <div className="space-y-3">
      <SkeletonBlock className="h-4 w-3/5 rounded-lg" />
      <SkeletonBlock className="h-4 w-4/5 rounded-lg" />
      <SkeletonBlock className="h-4 w-2/5 rounded-lg" />
      <SkeletonBlock className="h-6 w-20 rounded-full" />
    </div>
  </div>
)

/** A responsive grid of card skeletons. */
export const CardGridSkeleton = ({ count = 6, columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }) => (
  <div className={`grid ${columns} gap-6`} role="status" aria-live="polite" aria-busy="true">
    <span className="sr-only">Loading content</span>
    {Array.from({ length: count }).map((_, i) => (
      <FieldCardSkeleton key={i} />
    ))}
  </div>
)

/** A responsive row of stat-card skeletons. */
export const StatGridSkeleton = ({ count = 4 }) => (
  <div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span className="sr-only">Loading statistics</span>
    {Array.from({ length: count }).map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
)

export default SkeletonBlock
