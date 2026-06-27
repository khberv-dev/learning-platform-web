import {useQuery} from '@tanstack/react-query'
import {getStatsSummary, getStatsTimeseries} from '@/services/stats/api.js'

export const useGetStatsSummary = () => useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: getStatsSummary,
})

export const useGetStatsTimeseries = (params) => useQuery({
    queryKey: ['stats', 'timeseries', params],
    queryFn: () => getStatsTimeseries(params),
})
