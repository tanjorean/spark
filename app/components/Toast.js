'use client'

export default function Toast({ message, isVisible, onClose, type = 'success' }) {
  if (!isVisible) return null

  const colors = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    error: 'bg-red-500'
  }

  return (
    <div className="fixed top-20 right-8 z-50 animate-slide-in">
      <div className={`${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}>
        {type === 'success' && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span className="flex-1 font-semibold">{message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  )
}