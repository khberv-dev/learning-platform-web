import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {toaster} from "@/services/toaster.js";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false
        }
    }
})

export const useInfoMutation = ({queryKey, mutationFn, onSuccess, onError}) => {
    const client = useQueryClient()

    return useMutation({
        mutationFn,
        onSuccess: async (data) => {
            await client.invalidateQueries({queryKey, exact: false})

            if (data?.message) {
                toaster.add({
                    name: `success-${Date.now()}`,
                    content: data.message,
                    theme: 'success',
                    timeout: 3000,
                })
            }

            if (onSuccess) {
                onSuccess(data)
            }
        },
        onError: (error) => {
            const message = error?.response?.data?.message ?? error?.message

            if (message) {
                toaster.add({
                    name: `error-${Date.now()}`,
                    content: Array.isArray(message) ? message.join(', ') : message,
                    theme: 'danger',
                    timeout: 5000,
                })
            }

            if (onError) {
                onError(error)
            }
        }
    })
}
