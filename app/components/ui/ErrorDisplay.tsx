import { useAppSelector, useAppDispatch } from '@/app/lib/store/hooks'
import {
  clearContractError,
  clearNetworkError,
  clearGeneralError,
} from '@/app/lib/store'
import { X } from 'lucide-react'

export const ErrorDisplay = () => {
  const dispatch = useAppDispatch()
  const { contractErrors, networkErrors, generalErrors } = useAppSelector(
    (state) => state.errors,
  )

  const hasErrors =
    contractErrors.length > 0 ||
    networkErrors.length > 0 ||
    generalErrors.length > 0

  if (!hasErrors) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {/* Contract Errors */}
      {contractErrors.map((error) => (
        <div
          key={error.id}
          className="bg-red-500/90 backdrop-blur-sm border border-red-400 p-4 rounded-lg shadow-lg animate-fade-in"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-white mb-1">Contract Error</h4>
              <p className="text-red-100 text-sm">{error.message}</p>
              {error.lobbyId && (
                <p className="text-red-200 text-xs mt-1">
                  Lobby: {error.lobbyId}
                </p>
              )}
            </div>
            <button
              onClick={() => dispatch(clearContractError(error.id))}
              className="text-red-200 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* Network Errors */}
      {networkErrors.map((error) => (
        <div
          key={error.id}
          className="bg-orange-500/90 backdrop-blur-sm border border-orange-400 p-4 rounded-lg shadow-lg animate-fade-in"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-white mb-1">Network Error</h4>
              <p className="text-orange-100 text-sm">{error.message}</p>
              {error.retryable && (
                <p className="text-orange-200 text-xs mt-1">Retry available</p>
              )}
            </div>
            <button
              onClick={() => dispatch(clearNetworkError(error.id))}
              className="text-orange-200 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* General Errors */}
      {generalErrors.map((error, index) => (
        <div
          key={index}
          className="bg-gray-500/90 backdrop-blur-sm border border-gray-400 p-4 rounded-lg shadow-lg animate-fade-in"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-white mb-1">Error</h4>
              <p className="text-gray-100 text-sm">{error}</p>
            </div>
            <button
              onClick={() => dispatch(clearGeneralError(error))}
              className="text-gray-200 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
