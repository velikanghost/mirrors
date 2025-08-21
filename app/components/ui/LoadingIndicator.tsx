import { useAppSelector } from '@/app/lib/store/hooks'

export const LoadingIndicator = () => {
  const {
    creatingLobby,
    joiningLobby,
    distributingPrizes,
    deletingLobby,
    checkingPayment,
  } = useAppSelector((state) => state.loading)

  const isLoading =
    creatingLobby ||
    joiningLobby ||
    distributingPrizes ||
    deletingLobby ||
    checkingPayment

  if (!isLoading) return null

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-blue-500/90 backdrop-blur-sm border border-blue-400 p-3 rounded-lg shadow-lg animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span className="text-white text-sm font-medium">
            {creatingLobby && 'Creating lobby...'}
            {joiningLobby && 'Joining lobby...'}
            {distributingPrizes && 'Distributing prizes...'}
            {deletingLobby && 'Deleting lobby...'}
            {checkingPayment && 'Checking payment...'}
          </span>
        </div>
      </div>
    </div>
  )
}
