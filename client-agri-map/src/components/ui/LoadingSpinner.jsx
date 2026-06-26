import React from 'react'

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const wrapper = fullScreen
    ? 'min-h-[60vh] flex flex-col items-center justify-center'
    : 'flex flex-col items-center justify-center py-12'

  return (
    <div className={wrapper} role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" aria-hidden="true" />
      <p className="mt-4 text-sm text-slate-400">{message}</p>
    </div>
  )
}

export default LoadingSpinner
