import {apiClient} from '@/services/api.js';

export async function getStatsSummary() {
    const res = await apiClient.get('stats/summary');
    return res.data;
}

// `period` must be one of 7 / 14 / 30 - anything else is a 400.
export async function getStatsTimeseries(period = 30) {
    const res = await apiClient.get('stats/timeseries', {params: {period}});
    return res.data;
}
