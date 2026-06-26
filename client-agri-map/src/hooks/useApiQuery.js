import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useApiQuery = (key, fetcher, options = {}) =>
  useQuery({ queryKey: key, queryFn: fetcher, retry: 1, ...options })

export const useApiMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (...args) => {
      options.onSuccess?.(...args)
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }))
      }
    },
    ...options,
  })
}

export default useApiQuery
