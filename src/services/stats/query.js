import {useQuery} from '@tanstack/react-query';
import {getStatsSummary, getStatsTimeseries} from '@/services/stats/api.js';

export const STATS_PERIODS = [7, 14, 30];

export const useStatsSummary = () => {
    return useQuery({
        queryKey: ['stats', 'summary'],
        queryFn: getStatsSummary,
    });
};

export const useStatsTimeseries = (period = 30) => {
    return useQuery({
        queryKey: ['stats', 'timeseries', period],
        queryFn: () => getStatsTimeseries(period),
    });
};
